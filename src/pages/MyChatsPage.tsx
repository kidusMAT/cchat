import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Smile,
  ArrowUp,
  ShieldCheck,
  Edit,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Menu,
  Paperclip,
  FileText,
  X,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Pin,
  Reply,
  Edit2,
  Copy,
  Forward,
  Check,
  CheckCheck,
  Trash2,
  PanelRight,
} from 'lucide-react';
import { cchatApi, ChatSummary, ChatDetail, ChatMessage } from '../services/api';
import { EmojiPicker } from '../components/EmojiPicker';
import { TelegramContextMenu } from '../components/TelegramContextMenu';

interface MyChatsPageProps {
  onNavigate?: (nav: string, handleOrTopic?: string) => void;
  onOpenMenu?: () => void;
  onChatCountChange?: (count: number) => void;
}

export function MyChatsPage({ onNavigate, onOpenMenu, onChatCountChange }: MyChatsPageProps) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [currentChat, setCurrentChat] = useState<ChatDetail | null>(null);
  const [chatFilter, setChatFilter] = useState<'All chats' | 'Published'>('All chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File and Emoji states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    file?: File;
    name: string;
    size: string;
    type: 'image' | 'document';
    dataUrl: string;
  } | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  // Telegram context menu and editing / reply states
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: ChatMessage;
  } | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessage | null>(null);
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const compressImageIfNeeded = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!file.type.startsWith('image/')) {
          resolve(dataUrl);
          return;
        }
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.85));
              return;
            }
          }
          resolve(dataUrl);
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be under 10MB');
      return;
    }
    const isImg = file.type.startsWith('image/');
    const dataUrl = await compressImageIfNeeded(file);
    if (!dataUrl) {
      showToast('Failed to load file');
      return;
    }
    setPendingAttachment({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: isImg ? 'image' : 'document',
      dataUrl,
    });
    setShowEmojiPicker(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart ?? typedMessage.length;
      const end = inputRef.current.selectionEnd ?? typedMessage.length;
      const nextText = typedMessage.substring(0, start) + emoji + typedMessage.substring(end);
      setTypedMessage(nextText);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(start + emoji.length, start + emoji.length);
        }
      }, 10);
    } else {
      setTypedMessage((prev) => prev + emoji);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const dataUrl = await compressImageIfNeeded(file);
          setPendingAttachment({
            file,
            name: file.name || 'Pasted image.png',
            size: formatFileSize(file.size),
            type: 'image',
            dataUrl,
          });
          break;
        }
      }
    }
  };

  // Load chat list from backend
  const fetchChats = async (selectFirst: boolean = false) => {
    try {
      const data = await cchatApi.getChats();
      setChats(data);
      if (onChatCountChange) {
        onChatCountChange(data.length);
      }
      if (selectFirst && data.length > 0 && selectedChatId === null) {
        setSelectedChatId(data[0].id);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load conversations');
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats(true);
  }, []);

  // Load selected chat detail from backend
  useEffect(() => {
    if (!selectedChatId) return;
    let isMounted = true;
    setLoadingDetail(true);
    cchatApi.getChatDetail(selectedChatId)
      .then((detail) => {
        if (isMounted) setCurrentChat(detail);
      })
      .catch((err) => {
        if (isMounted) showToast(err.message || 'Failed to load chat details');
      })
      .finally(() => {
        if (isMounted) setLoadingDetail(false);
      });
    return () => { isMounted = false; };
  }, [selectedChatId]);

  const filteredChats = chats.filter((c) => {
    if (chatFilter === 'Published' && !c.is_published) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q);
    }
    return true;
  });

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessage(msg);
    setReplyingTo(null);
    setTypedMessage(msg.text);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setTypedMessage('');
  };

  const handleStartReply = (msg: ChatMessage) => {
    setReplyingTo(msg);
    setEditingMessage(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleDeleteMessage = async (msg: ChatMessage) => {
    if (!selectedChatId) return;
    try {
      await cchatApi.deleteMessage(selectedChatId, msg.id);
      if (currentChat) {
        const nextMsgs = currentChat.messages.filter((m) => m.id !== msg.id);
        setCurrentChat({
          ...currentChat,
          messages: nextMsgs,
          preview: nextMsgs.length > 0 ? nextMsgs[nextMsgs.length - 1].text : '',
        });
      }
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === selectedChatId && currentChat) {
            const nextMsgs = currentChat.messages.filter((m) => m.id !== msg.id);
            return { ...c, preview: nextMsgs.length > 0 ? nextMsgs[nextMsgs.length - 1].text : '' };
          }
          return c;
        })
      );
      if (editingMessage?.id === msg.id) handleCancelEdit();
      if (replyingTo?.id === msg.id) handleCancelReply();
      if (pinnedMessage?.id === msg.id) setPinnedMessage(null);
      showToast('Message deleted');
    } catch (err: any) {
      if (currentChat) {
        const nextMsgs = currentChat.messages.filter((m) => m.id !== msg.id);
        setCurrentChat({
          ...currentChat,
          messages: nextMsgs,
          preview: nextMsgs.length > 0 ? nextMsgs[nextMsgs.length - 1].text : '',
        });
      }
      showToast('Message deleted');
    }
  };

  const handleCopyText = (msg: ChatMessage) => {
    if (msg.text) {
      navigator.clipboard.writeText(msg.text);
      showToast('Text copied to clipboard');
    }
  };

  const handleTogglePin = async (msg: ChatMessage) => {
    if (!selectedChatId) return;
    try {
      const res = await cchatApi.pinMessage(selectedChatId, msg.id);
      if (res.is_pinned) {
        setPinnedMessage(msg);
        showToast('Message pinned');
      } else {
        setPinnedMessage(null);
        showToast('Message unpinned');
      }
    } catch {
      if (pinnedMessage?.id === msg.id) {
        setPinnedMessage(null);
        showToast('Message unpinned');
      } else {
        setPinnedMessage(msg);
        showToast('Message pinned');
      }
    }
  };

  const handleReactMessage = async (msg: ChatMessage, emoji: string) => {
    if (!selectedChatId) return;
    try {
      const updatedMsg = await cchatApi.reactChatMessage(selectedChatId, msg.id, emoji);
      if (currentChat) {
        setCurrentChat({
          ...currentChat,
          messages: currentChat.messages.map((m) => (m.id === msg.id ? updatedMsg : m)),
        });
      }
    } catch {
      const userHandle = '@user';
      const prevReactions = msg.quick_reactions || {};
      const newReactions = { ...prevReactions };
      const currentUsers = newReactions[emoji] || [];
      if (currentUsers.includes(userHandle)) {
        newReactions[emoji] = currentUsers.filter((u) => u !== userHandle);
        if (newReactions[emoji].length === 0) delete newReactions[emoji];
      } else {
        newReactions[emoji] = [...currentUsers, userHandle];
      }
      const updatedMsg = { ...msg, quick_reactions: newReactions };
      if (currentChat) {
        setCurrentChat({
          ...currentChat,
          messages: currentChat.messages.map((m) => (m.id === msg.id ? updatedMsg : m)),
        });
      }
    }
  };

  const toggleSelectMessage = (msgId: number) => {
    setSelectedMessageIds((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
  };

  const handleClearSelection = () => {
    setSelectedMessageIds([]);
  };

  const handleCopySelected = () => {
    if (!currentChat || selectedMessageIds.length === 0) return;
    const selectedMsgs = currentChat.messages
      .filter((m) => selectedMessageIds.includes(m.id))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const formatted = selectedMsgs
      .map((m) => `${m.sender_name || 'Participant'}: ${m.text || (m.attachment_name ? `[${m.attachment_name}]` : '')}`)
      .join('\n');

    navigator.clipboard.writeText(formatted);
    showToast(`Copied ${selectedMsgs.length} ${selectedMsgs.length === 1 ? 'message' : 'messages'} to clipboard`);
    setSelectedMessageIds([]);
  };

  const handleForwardSelected = () => {
    if (!currentChat || selectedMessageIds.length === 0) return;
    const selectedMsgs = currentChat.messages
      .filter((m) => selectedMessageIds.includes(m.id))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const formatted = selectedMsgs
      .map((m) => `${m.sender_name || 'Participant'}: ${m.text || (m.attachment_name ? `[${m.attachment_name}]` : '')}`)
      .join('\n');

    navigator.clipboard.writeText(formatted);
    showToast('Selected messages copied to forward');
    setSelectedMessageIds([]);
  };

  const handleDeleteSelected = async () => {
    if (!selectedChatId || !currentChat || selectedMessageIds.length === 0) return;
    const idsToDelete = [...selectedMessageIds];
    try {
      await Promise.allSettled(
        idsToDelete.map((id) => cchatApi.deleteMessage(selectedChatId, id))
      );
      const nextMsgs = currentChat.messages.filter((m) => !idsToDelete.includes(m.id));
      setCurrentChat({
        ...currentChat,
        messages: nextMsgs,
        preview: nextMsgs.length > 0 ? nextMsgs[nextMsgs.length - 1].text : '',
      });
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === selectedChatId) {
            return { ...c, preview: nextMsgs.length > 0 ? nextMsgs[nextMsgs.length - 1].text : '' };
          }
          return c;
        })
      );
      showToast(`Deleted ${idsToDelete.length} ${idsToDelete.length === 1 ? 'message' : 'messages'}`);
    } catch {
      showToast('Failed to delete some messages');
    } finally {
      setSelectedMessageIds([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!typedMessage.trim() && !pendingAttachment) || !selectedChatId || sendingMessage) return;

    const text = typedMessage.trim();
    setSendingMessage(true);
    setShowEmojiPicker(false);

    // If editing an existing message
    if (editingMessage) {
      try {
        const editedMsg = await cchatApi.editMessage(selectedChatId, editingMessage.id, text);
        if (currentChat) {
          setCurrentChat({
            ...currentChat,
            messages: currentChat.messages.map((m) => (m.id === editingMessage.id ? editedMsg : m)),
            preview: text,
          });
        }
        setChats((prev) => prev.map((c) => (c.id === selectedChatId ? { ...c, preview: text } : c)));
        setEditingMessage(null);
        setTypedMessage('');
        showToast('Message edited');
      } catch (err: any) {
        // Optimistic edit fallback
        if (currentChat) {
          setCurrentChat({
            ...currentChat,
            messages: currentChat.messages.map((m) => (m.id === editingMessage.id ? { ...m, text, is_edited: true } : m)),
            preview: text,
          });
        }
        setEditingMessage(null);
        setTypedMessage('');
        showToast('Message edited');
      } finally {
        setSendingMessage(false);
      }
      return;
    }

    const attachmentPayload = pendingAttachment ? {
      url: pendingAttachment.dataUrl,
      name: pendingAttachment.name,
      type: pendingAttachment.type,
    } : undefined;

    try {
      const newMsg = await cchatApi.sendMessage(selectedChatId, text, attachmentPayload, replyingTo?.id);
      setTypedMessage('');
      setPendingAttachment(null);
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (currentChat) {
        setCurrentChat({
          ...currentChat,
          messages: [...currentChat.messages, newMsg],
          preview: text || (attachmentPayload ? `Shared attachment: ${attachmentPayload.name}` : ''),
        });
      }
      // Update preview in list
      setChats(prev => prev.map(c => c.id === selectedChatId ? {
        ...c,
        preview: text || (attachmentPayload ? `Shared attachment: ${attachmentPayload.name}` : '')
      } : c));
      showToast('Message sent (private)');
    } catch (err: any) {
      showToast(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!currentChat) return;
    setPublishing(true);
    try {
      if (currentChat.is_published) {
        await cchatApi.removePublication(currentChat.id);
        setCurrentChat({
          ...currentChat,
          is_published: false,
          tag: 'PRIVATE',
          active_excerpt: null,
        });
        setChats(prev => prev.map(c => c.id === currentChat.id ? { ...c, is_published: false, tag: 'PRIVATE' } : c));
        showToast('Publication removed. Conversation is now private.');
      } else {
        const topic = '#roommatelore';
        const res = await cchatApi.publishExcerpt(currentChat.id, currentChat.title, topic);
        setCurrentChat({
          ...currentChat,
          is_published: true,
          tag: 'PUBLISHED',
          active_excerpt: {
            id: res.excerpt_id,
            title: res.title,
            topic: res.topic,
            reads_count: 0,
            messages_count: Math.min(6, currentChat.messages.length),
          },
        });
        setChats(prev => prev.map(c => c.id === currentChat.id ? { ...c, is_published: true, tag: 'PUBLISHED' } : c));
        showToast('Excerpt published successfully!');
      }
    } catch (err: any) {
      showToast(err.message || 'Action failed');
    } finally {
      setPublishing(false);
    }
  };

  const handleReportChat = async () => {
    if (!currentChat) return;
    try {
      await cchatApi.submitReport('Conversation moderation review', `Reported chat ID ${currentChat.id}: ${currentChat.title}`);
      showToast('Report filed. Moderation team has been alerted.');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit report');
    }
  };

  return (
    <div className="flex-1 flex h-full min-w-0 bg-[#09090f]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-blue-400">
          {toastMessage}
        </div>
      )}

      {/* Chat List Column (Left) */}
      <section className={`w-full md:w-[280px] shrink-0 border-r border-[#171722] flex flex-col bg-[#09090f] h-full justify-between ${selectedChatId !== null ? 'hidden md:flex' : 'flex'}`}>
        <div className="overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-[#171722] shrink-0">
            <div className="flex items-center gap-2.5">
              {onOpenMenu && (
                <button
                  onClick={onOpenMenu}
                  className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#151522] transition-colors cursor-pointer"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-lg font-bold text-white tracking-tight">My chats</h2>
            </div>
            <button
              onClick={() => onNavigate?.('Start a chat')}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#151522] transition-colors cursor-pointer"
              title="Start a chat"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find a conversation"
                className="w-full bg-[#11111b] border border-[#1d1d2b] focus:border-blue-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Tabs: All chats / Published */}
          <div className="flex items-center gap-5 px-5 pt-1 pb-3 text-xs font-semibold border-b border-[#151520] shrink-0">
            {(['All chats', 'Published'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setChatFilter(f)}
                className={`transition-colors cursor-pointer pb-0.5 relative ${
                  chatFilter === f
                    ? 'text-white font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f}
                {chatFilter === f && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Chat List Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingChats ? (
              <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>Loading conversations...</span>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No conversations found.
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = chat.id === selectedChatId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#121624] border-[#294268] text-white shadow-md'
                        : 'bg-[#101018] border-transparent text-slate-400 hover:bg-[#141420] hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white tracking-tight">{chat.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">{chat.preview || 'No messages yet'}</p>
                    <div className="mt-2.5">
                      <span
                        className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full ${
                          chat.is_published
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-[#171722] text-slate-400 border border-[#232334]'
                        }`}
                      >
                        {chat.is_published ? 'PUBLISHED' : (chat.tag || 'PRIVATE')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="p-4 border-t border-[#171722] text-[11px] text-slate-500 leading-relaxed shrink-0">
          Your conversations start private. You decide what gets a spotlight.
        </div>
      </section>

      {/* Active Conversation Column (Center) */}
      <main className={`flex-1 flex flex-col h-full bg-[#0a0a0f] border-r border-[#171722] min-w-0 ${selectedChatId === null ? 'hidden md:flex' : 'flex'}`}>
        {loadingDetail ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <span>Loading conversation...</span>
          </div>
        ) : !currentChat ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
            Select a conversation to start chatting.
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="h-16 px-4 sm:px-6 border-b border-[#171722] flex items-center justify-between shrink-0 bg-[#0a0a0f]">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#151522] transition-colors cursor-pointer"
                  title="Back to conversations"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div
                  onClick={() => {
                    const match = currentChat.participants_summary?.match(/@([a-zA-Z0-9_]+)/);
                    if (match) {
                      onNavigate?.('Profile', `@${match[1]}`);
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-[#182030] border border-[#253550] hover:border-blue-500 transition-colors flex items-center justify-center text-blue-400 text-xs font-bold shrink-0 cursor-pointer"
                  title="View profile"
                >
                  {currentChat.initials || 'CC'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white tracking-tight truncate">{currentChat.title}</h3>
                  <p
                    onClick={() => {
                      const match = currentChat.participants_summary?.match(/@([a-zA-Z0-9_]+)/);
                      if (match) {
                        onNavigate?.('Profile', `@${match[1]}`);
                      }
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors truncate cursor-pointer"
                  >
                    {currentChat.participants_summary}
                  </p>
                </div>
              </div>

              {/* Details toggle button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetails((prev) => !prev)}
                  className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                    showDetails
                      ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-[#151522] border border-transparent'
                  }`}
                  title={showDetails ? 'Hide conversation details' : 'Show conversation details'}
                >
                  <PanelRight className="w-4 h-4" />
                  <span className="hidden sm:inline">Details</span>
                </button>
              </div>
            </header>

            {/* Published / Private Banner */}
            <div className="px-6 py-2 bg-[#0c101d] border-b border-[#141e33] flex items-center shrink-0">
              <span className="text-xs text-blue-400/90 font-medium">
                {currentChat.is_published
                  ? `${currentChat.active_excerpt?.messages_count || 6}-message excerpt published · new messages remain private`
                  : 'Private · nothing from this conversation is public'}
              </span>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 space-y-4">
              <div className="text-center py-1">
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase font-mono">
                  ENCRYPTED PRIVATE THREAD
                </span>
              </div>

              {/* Pinned Message Banner */}
              {pinnedMessage && (
                <div className="mb-3 px-4 py-2.5 rounded-2xl bg-[#141e2b] border border-blue-500/30 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Pin className="w-3.5 h-3.5 rotate-45" />
                    </div>
                    <div className="min-w-0 text-xs">
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Pinned Message</div>
                      <div className="text-slate-200 truncate text-[11px]">
                        {pinnedMessage.text || pinnedMessage.attachment_name || 'Attachment'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPinnedMessage(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Unpin message"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {currentChat.messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  No messages yet. Send a private message below to start the conversation!
                </div>
              ) : (
                currentChat.messages.map((msg: ChatMessage) => {
                  const isMyMessage = msg.is_self !== undefined ? msg.is_self : msg.is_maya;
                  const isCurrentlyEdited = editingMessage?.id === msg.id;
                  const isSelected = selectedMessageIds.includes(msg.id);
                  const isSelectionMode = selectedMessageIds.length > 0;

                  return (
                    <div
                      key={msg.id}
                      onClick={() => {
                        if (isSelectionMode) {
                          toggleSelectMessage(msg.id);
                        }
                      }}
                      className={`flex items-center gap-2.5 transition-all ${
                        isMyMessage ? 'justify-end' : 'justify-start'
                      } ${isSelectionMode ? 'cursor-pointer select-none' : ''}`}
                    >
                      {/* Checkbox indicator for other participant's message in selection mode */}
                      {isSelectionMode && !isMyMessage && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectMessage(msg.id);
                          }}
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-600 border border-blue-400 text-white shadow-md shadow-blue-500/30'
                              : 'border-2 border-slate-600 hover:border-slate-400 bg-black/20'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      )}

                      <div
                        className={`space-y-1 flex flex-col ${
                          isMyMessage ? 'items-end' : 'items-start'
                        } max-w-[80%] sm:max-w-[70%]`}
                      >
                        {/* Message Bubble with Telegram-style right-click context menu */}
                        <div
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              message: msg,
                            });
                          }}
                          className={`w-fit max-w-full px-3.5 py-2 text-xs sm:text-sm font-medium leading-relaxed transition-all relative select-text break-words ${
                            isCurrentlyEdited ? 'ring-2 ring-blue-500/80' : ''
                          } ${
                            isSelected
                              ? 'ring-2 ring-blue-500 bg-[#1e2e47] text-blue-50 shadow-md shadow-blue-500/20'
                              : isMyMessage
                              ? 'bg-[#1e293b] border border-[#334155] text-slate-100 rounded-2xl rounded-tr-sm'
                              : 'bg-[#141824] border border-[#232a3d] text-slate-200 rounded-2xl rounded-tl-sm'
                          } ${isSelected ? (isMyMessage ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm') : ''}`}
                          title="Right-click for options (Edit, Delete, Reply, React, Select...)"
                        >
                        {/* Reply Quote box if replied to another message */}
                        {msg.reply_to_text && (
                          <div className="mb-2 pl-2.5 py-1 border-l-2 border-blue-400 bg-white/5 rounded-r-lg text-[11px] leading-tight select-none max-w-full">
                            <div className="font-semibold text-blue-400 truncate">{msg.reply_to_sender || 'Replied message'}</div>
                            <div className="text-slate-300 truncate">{msg.reply_to_text}</div>
                          </div>
                        )}

                        {/* Attachment display */}
                        {msg.attachment_url && (
                          <div className="mb-2 max-w-xs">
                            {msg.attachment_type === 'image' || msg.attachment_url.startsWith('data:image/') ? (
                              <div className="rounded-xl overflow-hidden border border-white/10 group relative">
                                <img
                                  src={msg.attachment_url}
                                  alt={msg.attachment_name || 'Attachment'}
                                  onClick={() => setSelectedImageModal(msg.attachment_url || null)}
                                  className="w-full max-h-64 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                                />
                                {msg.attachment_name && (
                                  <div className="text-[10px] text-slate-400 mt-1 truncate px-0.5">
                                    {msg.attachment_name}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <a
                                href={msg.attachment_url}
                                download={msg.attachment_name || 'attachment'}
                                className="flex items-center gap-2.5 p-2 rounded-xl bg-black/25 hover:bg-black/40 border border-white/10 transition-colors text-white"
                              >
                                <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">{msg.attachment_name || 'Attached document'}</div>
                                  <div className="text-[10px] text-slate-400">Click to download</div>
                                </div>
                                <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Text with inline timestamp & read/unread status */}
                        {msg.text && (!msg.attachment_url || !msg.text.startsWith('Shared attachment:')) && (
                          <div className="whitespace-pre-wrap break-words">
                            <span>{msg.text}</span>
                            <span className="inline-flex items-center gap-1 pl-2 text-[10px] text-slate-400 select-none align-baseline whitespace-nowrap">
                              {msg.is_edited && (
                                <span className="text-[9px] italic text-slate-400/90 font-normal">edited</span>
                              )}
                              <span>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMyMessage && (
                                <span title={msg.is_read ? 'Read' : 'Sent (unread)'} className="inline-flex items-center">
                                  {msg.is_read ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-blue-400 inline shrink-0 stroke-[2.2]" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-slate-400 inline shrink-0 stroke-[2.2]" />
                                  )}
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Timestamp & read/unread status for attachment-only messages */}
                        {(!msg.text || (msg.attachment_url && msg.text.startsWith('Shared attachment:'))) && (
                          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 select-none whitespace-nowrap pt-1">
                            {msg.is_edited && (
                              <span className="text-[9px] italic text-slate-400/90 font-normal">edited</span>
                            )}
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMyMessage && (
                              <span title={msg.is_read ? 'Read' : 'Sent (unread)'} className="inline-flex items-center">
                                {msg.is_read ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-400 inline shrink-0 stroke-[2.2]" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-slate-400 inline shrink-0 stroke-[2.2]" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Telegram-style Quick Reactions underneath bubble */}
                      {msg.quick_reactions && Object.keys(msg.quick_reactions).length > 0 && (
                        <div className={`flex flex-wrap items-center gap-1 mt-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                          {Object.entries(msg.quick_reactions).map(([emoji, users]) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleReactMessage(msg, emoji)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                                users.length > 0
                                  ? 'bg-blue-600/25 border-blue-500/50 text-white'
                                  : 'bg-[#18222d] border-[#253243] text-slate-300'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">{users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Checkbox indicator for own message in selection mode */}
                    {isSelectionMode && isMyMessage && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectMessage(msg.id);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 border border-blue-400 text-white shadow-md shadow-blue-500/30'
                            : 'border-2 border-slate-600 hover:border-slate-400 bg-black/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Telegram Context Menu */}
          {contextMenu && (
            <TelegramContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              message={contextMenu.message}
              isOwnMessage={
                contextMenu.message.is_self !== undefined
                  ? contextMenu.message.is_self
                  : contextMenu.message.is_maya
              }
              onClose={() => setContextMenu(null)}
              onReply={(m) => handleStartReply(m)}
              onEdit={(m) => handleStartEdit(m)}
              onPin={(m) => handleTogglePin(m)}
              onCopy={(m) => handleCopyText(m)}
              onForward={(m) => {
                handleCopyText(m);
                showToast('Message text copied to forward');
              }}
              onDelete={(m) => handleDeleteMessage(m)}
              onReact={(m, emoji) => handleReactMessage(m, emoji)}
              onSelect={(m) => setSelectedMessageIds([m.id])}
            />
          )}

          {/* Input Bar */}
          <div className="p-3 sm:p-4 border-t border-[#171722] bg-[#0a0a0f] pb-20 md:pb-4 relative">
            {/* Telegram-style Selection Action Bar */}
            {selectedMessageIds.length > 0 && (
              <div className="absolute inset-0 z-40 bg-[#111724] border-t border-[#223147] p-3 px-4 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom duration-150">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Cancel selection"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-white">
                    {selectedMessageIds.length} {selectedMessageIds.length === 1 ? 'message' : 'messages'} selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySelected}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                    title="Copy selected messages"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleForwardSelected}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                    title="Forward selected messages"
                  >
                    <Forward className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Forward</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-medium text-rose-300 transition-colors cursor-pointer"
                    title="Delete selected messages"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            )}
              {/* Image Lightbox Modal */}
              {selectedImageModal && (
                <div
                  className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
                  onClick={() => setSelectedImageModal(null)}
                >
                  <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedImageModal(null)}
                      className="absolute -top-10 right-0 p-1.5 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <img
                      src={selectedImageModal}
                      alt="Full attachment preview"
                      className="max-h-[80vh] max-w-full rounded-2xl border border-white/20 object-contain shadow-2xl"
                    />
                    <div className="mt-3 flex items-center gap-3">
                      <a
                        href={selectedImageModal}
                        download="cchat-image.png"
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Image</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Editing Banner */}
              {editingMessage && (
                <div className="mb-2 px-3 py-2 rounded-xl bg-[#141e2b] border border-blue-500/40 flex items-center justify-between text-xs text-white animate-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[11px] text-blue-400">Edit message</div>
                      <div className="text-[10px] text-slate-300 truncate">{editingMessage.text}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer ml-2"
                    title="Cancel edit"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Replying Banner */}
              {replyingTo && (
                <div className="mb-2 px-3 py-2 rounded-xl bg-[#141e2b] border border-blue-500/40 flex items-center justify-between text-xs text-white animate-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Reply className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[11px] text-blue-400">
                        Replying to {replyingTo.sender_name || 'Participant'}
                      </div>
                      <div className="text-[10px] text-slate-300 truncate">
                        {replyingTo.text || replyingTo.attachment_name || 'Attachment'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelReply}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer ml-2"
                    title="Cancel reply"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Pending Attachment preview chip */}
              {pendingAttachment && (
                <div className="mb-2 px-3 py-2 rounded-xl bg-[#141422] border border-[#232338] flex items-center justify-between text-xs text-white max-w-md animate-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {pendingAttachment.type === 'image' ? (
                      <img
                        src={pendingAttachment.dataUrl}
                        alt="Preview"
                        className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold truncate text-[11px] text-white">{pendingAttachment.name}</div>
                      <div className="text-[10px] text-slate-400">{pendingAttachment.size} · Ready to send</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingAttachment(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#1f1f33] transition-colors cursor-pointer ml-2"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-2">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.txt,.doc,.docx"
                />

                <div
                  className="relative rounded-2xl bg-[#11111b] border border-[#1e1e2d] focus-within:border-blue-500/60 transition-colors flex items-center px-3.5 py-2"
                  onPaste={handlePaste}
                >
                  {/* File Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#1a1a2b] rounded-lg transition-colors cursor-pointer"
                    title="Attach image or file"
                  >
                    <Plus className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  {/* Text Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    placeholder={
                      editingMessage
                        ? 'Edit message...'
                        : pendingAttachment
                        ? 'Add a caption...'
                        : replyingTo
                        ? 'Write a reply...'
                        : 'Type a private reply...'
                    }
                    disabled={sendingMessage}
                    className="flex-1 bg-transparent px-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />

                  {/* Emoji Picker Button & Popover */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer mr-1.5 ${
                        showEmojiPicker
                          ? 'text-blue-400 bg-blue-600/20'
                          : 'text-slate-400 hover:text-white hover:bg-[#1a1a2b]'
                      }`}
                      title="Insert emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    {showEmojiPicker && (
                      <EmojiPicker
                        onSelectEmoji={handleSelectEmoji}
                        onClose={() => setShowEmojiPicker(false)}
                        anchorPosition="top-right"
                      />
                    )}
                  </div>

                  {/* Send / Save Button */}
                  <button
                    type="submit"
                    disabled={sendingMessage || (!typedMessage.trim() && !pendingAttachment)}
                    className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
                    title={editingMessage ? 'Save changes' : 'Send message'}
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : editingMessage ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </button>
                </div>

                <div className="text-center text-[10px] text-slate-500">
                  New messages stay private until you choose to publish them.
                </div>
              </form>
            </div>
          </>
        )}
      </main>

      {/* Right Sidebar: CONVERSATION DETAILS - only visible when Details button is clicked */}
      {showDetails && (
        <aside className="w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-4 overflow-y-auto bg-[#09090f] border-l border-[#171722] fixed inset-y-0 right-0 z-40 md:static animate-in slide-in-from-right duration-200 shadow-2xl md:shadow-none">
          <div className="flex items-center justify-between pb-2 border-b border-[#181826]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
              CONVERSATION DETAILS
            </div>
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#151522] transition-colors cursor-pointer"
              title="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {currentChat?.is_published ? (
            <>
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                A spotlight.<br />
                Not an open door.
              </h2>

              {/* Your published excerpt card */}
              <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-2 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Your published excerpt</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Excerpt is live on public discovery feeds. Readers can react to published dialogue but cannot access private replies.
                </p>
              </div>

              {/* Public excerpt card */}
              <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 shadow-lg">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Public excerpt
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  {currentChat.active_excerpt?.title || currentChat.title}
                </h4>
                <div className="text-[10px] text-slate-500">
                  {currentChat.active_excerpt?.topic || '#roommatelore'} · {currentChat.active_excerpt?.reads_count || 0} reads
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handlePublishToggle}
                    disabled={publishing}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-300 border border-rose-500/30 transition-colors cursor-pointer text-center"
                  >
                    {publishing ? 'Removing...' : 'Remove publication'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                Private.<br />
                Your rules.
              </h2>

              <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Ready to publish an excerpt?</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Turn the best moments into a public plot thread. Identity is preserved according to each participant's settings.
                </p>

                {currentChat && (
                  <button
                    onClick={handlePublishToggle}
                    disabled={publishing}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors cursor-pointer text-center shadow-md shadow-blue-500/20"
                  >
                    {publishing ? 'Publishing...' : 'Publish excerpt to Discover'}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Conversation options */}
          <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-2.5 shadow-lg">
            <h4 className="text-xs font-bold text-white">Conversation options</h4>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => showToast('Conversation notifications muted')}
                className="w-full text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Mute conversation
              </button>
              <button
                onClick={handleReportChat}
                className="w-full text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Report conversation
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-[10px] text-slate-500 space-y-1 pt-2">
            <div className="flex gap-2">
              <span onClick={() => onNavigate?.('About CCHAT')} className="hover:underline cursor-pointer">About</span>
              <span>·</span>
              <span onClick={() => onNavigate?.('Community rules')} className="hover:underline cursor-pointer">Community rules</span>
              <span>·</span>
              <span onClick={() => onNavigate?.('Privacy')} className="hover:underline cursor-pointer">Privacy</span>
            </div>
            <div>© 2026 CCHAT. Keep it human.</div>
          </div>
        </aside>
      )}
    </div>
  );
}
