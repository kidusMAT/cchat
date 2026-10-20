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
  Lock,
  PanelRight,
  Eye,
  EyeOff,
  Tag,
  Layers,
  Sparkles,
  Split,
  Bell,
  BellOff,
} from 'lucide-react';
import { cchatApi, ChatSummary, ChatDetail, ChatMessage, ChatSection } from '../services/api';
import { EmojiPicker } from '../components/EmojiPicker';
import { TelegramContextMenu } from '../components/TelegramContextMenu';
import { FooterLinks } from '../components/FooterLinks';


interface MyChatsPageProps {
  initialChatId?: number | null;
  onNavigate?: (nav: string, handleOrTopic?: string) => void;
  onOpenMenu?: () => void;
  onChatCountChange?: (count: number) => void;
}

function getQuickReactionBubbleBg(quickReactions?: Record<string, string[]>, isMyMsg: boolean = false): string | null {
  if (!quickReactions) return null;
  let topEmoji = '';
  let maxCount = 0;
  for (const [emoji, users] of Object.entries(quickReactions)) {
    const count = Array.isArray(users) ? users.length : 0;
    if (count > maxCount) {
      maxCount = count;
      topEmoji = emoji;
    }
  }
  if (maxCount <= 0 || !topEmoji) return null;

  if (['❤️', '🩷', '💖', '💕', 'heart'].includes(topEmoji)) {
    return 'bg-gradient-to-br from-[#3b172a] via-[#2c1220] to-[#1e0c16] border border-[#6b2546] text-rose-50';
  }
  if (['🧢', '🥶', '👀', 'cap'].includes(topEmoji)) {
    return 'bg-gradient-to-br from-[#142338] via-[#0f1b2b] to-[#0a121d] border border-[#234570] text-blue-50';
  }
  if (['💀', '😂', '😭', '☠️', 'skull'].includes(topEmoji)) {
    return 'bg-[#23262f] border border-[#3a3f4e] text-slate-100';
  }
  if (['🔥', '🌶️', '💯', '⚡', 'fire'].includes(topEmoji)) {
    return 'bg-gradient-to-br from-[#361e10] via-[#2a170c] to-[#1c1008] border border-[#6e3b18] text-amber-100';
  }
  if (['👍', '🎉', '✨', '👏'].includes(topEmoji)) {
    return 'bg-gradient-to-br from-[#163328] via-[#10261e] to-[#0a1813] border border-[#245946] text-emerald-50';
  }
  return isMyMsg
    ? 'bg-gradient-to-br from-[#25223b] via-[#1c192d] to-[#13111f] border border-[#433d6b] text-indigo-50'
    : 'bg-gradient-to-br from-[#1d2334] via-[#161a28] to-[#0e111a] border border-[#323b57] text-ink';
}

export function MyChatsPage({ initialChatId, onNavigate, onOpenMenu, onChatCountChange }: MyChatsPageProps) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(initialChatId ?? null);
  const [currentChat, setCurrentChat] = useState<ChatDetail | null>(null);

  useEffect(() => {
    if (initialChatId != null) {
      setSelectedChatId(initialChatId);
    }
  }, [initialChatId]);
  const [chatFilter, setChatFilter] = useState<'All chats' | 'Published'>('All chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [followingPartner, setFollowingPartner] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [mutedChatIds, setMutedChatIds] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem('cchat_muted_chats');
      return new Set<number>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set<number>();
    }
  });

  const updateChatBadgeCount = (chatList: ChatSummary[], currentMuted: Set<number>) => {
    if (!onChatCountChange) return;
    const totalUnread = chatList.reduce((acc, c) => {
      if (currentMuted.has(c.id)) return acc;
      return acc + (c.unread_count || 0);
    }, 0);
    onChatCountChange(totalUnread);
  };

  const toggleMuteChat = (chatId: number) => {
    setMutedChatIds((prev) => {
      const next = new Set(prev);
      const isCurrentlyMuted = next.has(chatId);
      if (isCurrentlyMuted) {
        next.delete(chatId);
        showToast('Conversation notifications unmuted');
      } else {
        next.add(chatId);
        showToast('Conversation notifications muted');
      }
      localStorage.setItem('cchat_muted_chats', JSON.stringify(Array.from(next)));
      updateChatBadgeCount(chats, next);
      return next;
    });
  };

  const handleFollowPartner = async () => {
    if (!currentChat?.partner_user) return;
    setFollowingPartner(true);
    try {
      const res = await cchatApi.toggleFollow(currentChat.partner_user.handle);
      if (res.is_following) {
        setCurrentChat((prev) =>
          prev
            ? {
                ...prev,
                can_send_message: true,
                partner_user: prev.partner_user
                  ? {
                      ...prev.partner_user,
                      is_following: true,
                    }
                  : prev.partner_user,
              }
            : prev
        );
        showToast(`Now following ${currentChat.partner_user.handle}. You can now send messages!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to follow user');
    } finally {
      setFollowingPartner(false);
    }
  };

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

  // Sectioning & Eye Publishing Modal states
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishTopic, setPublishTopic] = useState('#dating');
  const [publishSections, setPublishSections] = useState<
    Array<{ header: string; topic_tag: string; message_ids: number[] }>
  >([]);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const unreadMarkerRef = useRef<HTMLDivElement>(null);
  const [firstUnreadMsgId, setFirstUnreadMsgId] = useState<number | null>(null);

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
      updateChatBadgeCount(data, mutedChatIds);
      if (data.length > 0) {
        if (initialChatId != null && data.some((c) => c.id === initialChatId)) {
          setSelectedChatId(initialChatId);
        } else if (selectFirst && selectedChatId === null) {
          setSelectedChatId(data[0].id);
        }
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
        if (isMounted) {
          setCurrentChat(detail);
          cchatApi.markChatRead(selectedChatId).catch(() => {});
          setChats((prev) => {
            const next = prev.map((c) => (c.id === selectedChatId ? { ...c, unread_count: 0 } : c));
            updateChatBadgeCount(next, mutedChatIds);
            return next;
          });
        }
      })
      .catch((err) => {
        if (isMounted) showToast(err.message || 'Failed to load chat details');
      })
      .finally(() => {
        if (isMounted) setLoadingDetail(false);
      });
    return () => { isMounted = false; };
  }, [selectedChatId]);

  // Track read/unread messages and smoothly resume where the user left off
  useEffect(() => {
    if (!currentChat || !currentChat.messages || currentChat.messages.length === 0) {
      setFirstUnreadMsgId(null);
      return;
    }

    const storageKey = `cchat_chat_${currentChat.id}_last_read_id`;
    const storedLastRead = localStorage.getItem(storageKey);
    const msgs = currentChat.messages;

    let unreadId: number | null = null;
    if (storedLastRead !== null) {
      const lastReadId = parseInt(storedLastRead, 10);
      const firstUnread = msgs.find((m) => m.id > lastReadId);
      if (firstUnread) {
        unreadId = firstUnread.id;
      }
    } else {
      // First time opening: detect unread incoming message from partner
      const firstUnread = msgs.find((m) => m.is_read === false && !m.is_self && !m.is_maya);
      if (firstUnread) {
        unreadId = firstUnread.id;
      }
    }

    setFirstUnreadMsgId(unreadId);

    // Smoothly scroll to where the user left off
    const scrollTimer = setTimeout(() => {
      if (unreadId && unreadMarkerRef.current) {
        unreadMarkerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 150);

    // After viewing, update last read id in localStorage
    const markReadTimer = setTimeout(() => {
      const latest = msgs[msgs.length - 1];
      if (latest) {
        localStorage.setItem(storageKey, String(latest.id));
      }
    }, 2500);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(markReadTimer);
      const latest = msgs[msgs.length - 1];
      if (latest) {
        localStorage.setItem(storageKey, String(latest.id));
      }
    };
  }, [currentChat?.id]);

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

    if (currentChat?.partner_user && !currentChat.partner_user.is_following) {
      showToast(`You must follow ${currentChat.partner_user.handle} to send messages.`);
      return;
    }

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
        localStorage.setItem(`cchat_chat_${selectedChatId}_last_read_id`, String(newMsg.id));
        setFirstUnreadMsgId(null);
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 50);
      }
      // Update preview in list and keep unread_count at 0
      setChats(prev => {
        const next = prev.map(c => c.id === selectedChatId ? {
          ...c,
          preview: text || (attachmentPayload ? `Shared attachment: ${attachmentPayload.name}` : ''),
          unread_count: 0,
        } : c);
        updateChatBadgeCount(next, mutedChatIds);
        return next;
      });
      showToast('Message sent (private)');
    } catch (err: any) {
      showToast(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const openPublishModal = () => {
    if (!currentChat) return;
    const topic = currentChat.active_excerpt?.topic || '#dating';
    const partnerName = currentChat.title;
    const existingTitle = currentChat.active_excerpt?.title;
    const title = existingTitle && existingTitle.toLowerCase() !== partnerName.toLowerCase()
      ? existingTitle
      : `${topic} dialogue`;

    setPublishTitle(title);
    setPublishTopic(topic);

    if (currentChat.active_excerpt?.sections && currentChat.active_excerpt.sections.length > 0) {
      setPublishSections(
        currentChat.active_excerpt.sections.map((s, idx) => ({
          header: s.header && s.header.toLowerCase() === partnerName.toLowerCase() ? `Part ${idx + 1}` : s.header,
          topic_tag: s.topic_tag,
          message_ids: s.message_ids || [],
        }))
      );
    } else {
      // Default: 1 section containing all messages
      const msgIds = currentChat.messages.map((m) => m.id);
      setPublishSections([
        {
          header: 'Part 1',
          topic_tag: topic,
          message_ids: msgIds,
        },
      ]);
    }
    setShowPublishModal(true);
  };

  const handleSplitSectionAfter = (sectionIdx: number, msgIdxInSection: number) => {
    const sec = publishSections[sectionIdx];
    if (!sec || msgIdxInSection >= sec.message_ids.length - 1) return;

    const firstHalfMsgs = sec.message_ids.slice(0, msgIdxInSection + 1);
    const secondHalfMsgs = sec.message_ids.slice(msgIdxInSection + 1);

    const newSections = [...publishSections];
    newSections[sectionIdx] = {
      ...sec,
      message_ids: firstHalfMsgs,
    };
    newSections.splice(sectionIdx + 1, 0, {
      header: `Part ${sectionIdx + 2}`,
      topic_tag: sec.topic_tag,
      message_ids: secondHalfMsgs,
    });

    setPublishSections(newSections);
  };

  const handleMergeSectionWithPrev = (sectionIdx: number) => {
    if (sectionIdx <= 0 || sectionIdx >= publishSections.length) return;
    const prevSec = publishSections[sectionIdx - 1];
    const curSec = publishSections[sectionIdx];

    const newSections = [...publishSections];
    newSections[sectionIdx - 1] = {
      ...prevSec,
      message_ids: [...prevSec.message_ids, ...curSec.message_ids],
    };
    newSections.splice(sectionIdx, 1);
    setPublishSections(newSections);
  };

  const handleSavePublication = async () => {
    if (!currentChat) return;
    setPublishing(true);
    try {
      const res = await cchatApi.publishExcerpt(
        currentChat.id,
        publishTitle.trim() || currentChat.title,
        publishTopic.trim() || '#dating',
        publishSections.length > 0 ? publishSections : undefined
      );

      setCurrentChat({
        ...currentChat,
        is_published: true,
        tag: 'PUBLISHED',
        published_by_me: true,
        partner_is_anonymous: res.partner_is_anonymous !== false,
        active_excerpt: {
          id: res.excerpt_id,
          title: res.title,
          topic: res.topic,
          reads_count: 0,
          messages_count: currentChat.messages.length,
          published_by_me: true,
          publishers_count: res.publishers_count || 1,
          sections: res.sections || publishSections,
        },
      });

      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChat.id
            ? {
                ...c,
                is_published: true,
                tag: 'PUBLISHED',
                published_by_me: true,
                partner_is_anonymous: res.partner_is_anonymous !== false,
              }
            : c
        )
      );

      setShowPublishModal(false);
      showToast('Chat published! Partner identity is Anonymous until they also click the eye icon.');
    } catch (err: any) {
      showToast(err.message || 'Failed to publish chat');
    } finally {
      setPublishing(false);
    }
  };

  const handleRemovePublication = async () => {
    if (!currentChat) return;
    setPublishing(true);
    try {
      await cchatApi.removePublication(currentChat.id, true);
      setCurrentChat({
        ...currentChat,
        is_published: false,
        tag: 'PRIVATE',
        published_by_me: false,
        partner_is_anonymous: false,
        active_excerpt: null,
      });
      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChat.id
            ? { ...c, is_published: false, tag: 'PRIVATE', published_by_me: false }
            : c
        )
      );
      setShowPublishModal(false);
      showToast('Publication removed. Conversation is now private.');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove publication');
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishToggle = () => {
    openPublishModal();
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
    <div className="flex-1 flex h-full min-w-0 bg-canvas-deep">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-accent-strong text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-accent-bright">
          {toastMessage}
        </div>
      )}

      {/* Chat List Column (Left) */}
      <section className={`w-full md:w-[280px] shrink-0 border-r border-line flex flex-col bg-canvas-deep h-full justify-between ${selectedChatId !== null ? 'hidden md:flex' : 'flex'}`}>
        <div className="overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-line shrink-0">
            <div className="flex items-center gap-2.5">
              {onOpenMenu && (
                <button
                  onClick={onOpenMenu}
                  className="md:hidden p-1.5 -ml-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-lg font-bold text-white tracking-tight">My chats</h2>
            </div>
            <button
              onClick={() => onNavigate?.('Start a chat')}
              className="p-1.5 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
              title="Start a chat"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find a conversation"
                className="w-full bg-canvas-2 border border-line-2 focus:border-accent rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Tabs: All chats / Published */}
          <div className="flex items-center gap-5 px-5 pt-1 pb-3 text-xs font-semibold border-b border-line shrink-0">
            {(['All chats', 'Published'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setChatFilter(f)}
                className={`transition-colors cursor-pointer pb-0.5 relative ${
                  chatFilter === f
                    ? 'text-white font-bold'
                    : 'text-ink-faint hover:text-ink-soft'
                }`}
              >
                {f}
                {chatFilter === f && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Chat List Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingChats ? (
              <div className="p-6 text-center text-xs text-ink-faint flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                <span>Loading conversations...</span>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-faint">
                No conversations found.
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = chat.id === selectedChatId;
                const isMuted = mutedChatIds.has(chat.id);
                const hasUnread = (chat.unread_count || 0) > 0;
                return (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#121624] border-[#294268] text-white shadow-md'
                        : 'bg-canvas-2 border-transparent text-ink-muted hover:bg-surface hover:text-ink-soft'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className="text-xs font-bold text-white tracking-tight truncate">{chat.title}</h4>
                        {isMuted && (
                          <span title="Notifications muted" className="inline-flex shrink-0">
                            <BellOff className="w-3.5 h-3.5 text-ink-faint" />
                          </span>
                        )}
                      </div>
                      {!isMuted && hasUnread && (
                        <span className="text-[10px] font-bold bg-accent-strong text-white px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight shadow-xs shrink-0">
                          {chat.unread_count! > 99 ? '99+' : chat.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-muted mt-1 truncate">{chat.preview || 'No messages yet'}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span
                        className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full ${
                          chat.is_published
                            ? 'bg-accent/15 text-accent border border-accent/30'
                            : 'bg-surface text-ink-muted border border-line-2'
                        }`}
                      >
                        {chat.is_published ? 'PUBLISHED' : (chat.tag || 'PRIVATE')}
                      </span>
                      {isMuted && (
                        <span className="text-[10px] text-ink-faint font-medium">Muted</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="p-4 border-t border-line text-[11px] text-ink-faint leading-relaxed shrink-0">
          Your conversations start private. You decide what gets a spotlight.
        </div>
      </section>

      {/* Active Conversation Column (Center) */}
      <main className={`flex-1 flex flex-col h-full bg-canvas-deep border-r border-line min-w-0 ${selectedChatId === null ? 'hidden md:flex' : 'flex'}`}>
        {loadingDetail ? (
          <div className="flex-1 flex items-center justify-center text-xs text-ink-faint gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span>Loading conversation...</span>
          </div>
        ) : !currentChat ? (
          <div className="flex-1 flex items-center justify-center text-xs text-ink-faint">
            Select a conversation to start chatting.
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="h-14 sm:h-16 px-3 sm:px-6 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <button
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden p-1.5 -ml-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer shrink-0"
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
                  className="w-8 h-8 rounded-full bg-[#182030] border border-[#253550] hover:border-accent transition-colors flex items-center justify-center text-accent text-xs font-bold shrink-0 cursor-pointer"
                  title="View profile"
                >
                  {currentChat.initials || 'CC'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white tracking-tight truncate">{currentChat.title}</h3>
                  <p
                    onClick={() => {
                      const match = currentChat.participants_summary?.match(/@([a-zA-Z0-9_]+)/);
                      if (match) {
                        onNavigate?.('Profile', `@${match[1]}`);
                      }
                    }}
                    className="text-[11px] text-ink-faint hover:text-ink-soft transition-colors truncate cursor-pointer"
                  >
                    {currentChat.participants_summary}
                  </p>
                </div>
              </div>

              {/* Details and Eye toggle buttons */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={openPublishModal}
                  className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                    currentChat.is_published
                      ? 'bg-accent-strong/20 text-accent border border-accent/40 shadow-sm'
                      : 'text-ink-muted hover:text-white hover:bg-surface border border-transparent'
                  }`}
                  title={
                    currentChat.is_published
                      ? 'Chat is public to Discovery • Click to manage sections & headers'
                      : 'Make chat public to Discovery'
                  }
                >
                  <Eye className="w-4 h-4 stroke-[1.8]" />
                  <span className="hidden sm:inline">
                    {currentChat.is_published ? 'Public' : 'Make Public'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleMuteChat(currentChat.id)}
                  className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                    mutedChatIds.has(currentChat.id)
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-ink-muted hover:text-white hover:bg-surface border border-transparent'
                  }`}
                  title={mutedChatIds.has(currentChat.id) ? 'Notifications are muted (Click to unmute)' : 'Mute conversation notifications'}
                >
                  {mutedChatIds.has(currentChat.id) ? (
                    <>
                      <BellOff className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">Muted</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span className="hidden sm:inline">Mute</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowDetails((prev) => !prev)}
                  className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                    showDetails
                      ? 'bg-accent-strong/25 text-accent border border-accent/40'
                      : 'text-ink-muted hover:text-white hover:bg-surface border border-transparent'
                  }`}
                  title={showDetails ? 'Hide conversation details' : 'Show conversation details'}
                >
                  <PanelRight className="w-4 h-4" />
                  <span className="hidden sm:inline">Details</span>
                </button>
              </div>
            </header>

            {/* Published / Private Banner */}
            <div className="px-3 sm:px-6 py-2 bg-[#090f1c] border-b border-[#141e33] flex items-center justify-between gap-2 shrink-0 shadow-sm">
              <span className="text-[11px] sm:text-xs text-accent/90 font-medium flex items-center gap-1.5 sm:gap-2 min-w-0">
                {currentChat.is_published ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-accent stroke-[1.8] shrink-0" />
                    <span className="truncate">
                      <span className="sm:hidden">
                        Public chat · {currentChat.partner_is_anonymous !== false ? 'Anonymous partner' : 'Both public'}
                      </span>
                      <span className="hidden sm:inline">
                        Public chat in Discovery · All messages public ·{' '}
                        {currentChat.partner_is_anonymous !== false
                          ? 'Partner identity: Anonymous'
                          : 'Both participants public'}
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="truncate">Private · nothing from this conversation is public</span>
                )}
              </span>
              {currentChat.is_published && (
                <button
                  type="button"
                  onClick={openPublishModal}
                  className="text-[11px] font-bold text-accent hover:text-accent-bright underline cursor-pointer shrink-0 whitespace-nowrap pl-1"
                >
                  Edit sections
                </button>
              )}
            </div>


            {/* Messages Thread */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-8 py-3 sm:py-5 space-y-3 sm:space-y-4">
              <div className="text-center py-1">
                <span className="text-[10px] font-semibold text-ink-faint tracking-wider uppercase font-mono">
                  ENCRYPTED PRIVATE THREAD
                </span>
              </div>

              {/* Pinned Message Banner */}
              {pinnedMessage && (
                <div className="mb-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#141e2b] border border-accent/30 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-accent-strong/20 text-accent flex items-center justify-center shrink-0">
                      <Pin className="w-3.5 h-3.5 rotate-45" />
                    </div>
                    <div className="min-w-0 text-xs">
                      <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Pinned Message</div>
                      <div className="text-ink truncate text-[11px]">
                        {pinnedMessage.text || pinnedMessage.attachment_name || 'Attachment'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPinnedMessage(null)}
                    className="p-1.5 text-ink-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Unpin message"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {currentChat.messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-ink-faint">
                  No messages yet. Send a private message below to start the conversation!
                </div>
              ) : (
                currentChat.messages.map((msg: ChatMessage) => {
                  const isMyMessage = msg.is_self !== undefined ? msg.is_self : msg.is_maya;
                  const isCurrentlyEdited = editingMessage?.id === msg.id;
                  const isSelected = selectedMessageIds.includes(msg.id);
                  const isSelectionMode = selectedMessageIds.length > 0;

                  // Check if this message starts a section
                  const sectionStartingHere = currentChat.active_excerpt?.sections?.find(
                    (s) => s.message_ids && s.message_ids.length > 0 && s.message_ids[0] === msg.id
                  );

                  return (
                    <React.Fragment key={msg.id}>
                      {msg.id === firstUnreadMsgId && (
                        <div
                          ref={unreadMarkerRef}
                          className="my-4 sm:my-5 relative flex items-center justify-center select-none py-1.5 pointer-events-none"
                          aria-hidden="true"
                        >
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
                          </div>
                          <div className="relative px-3 bg-canvas-deep">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 duration-1000" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
                            </span>
                          </div>
                        </div>
                      )}
                      {sectionStartingHere && (
                        <div className="my-3.5 sm:my-5 py-1 sm:py-1.5 flex items-center gap-2 sm:gap-3 select-none">
                          <div className="h-px bg-surface-2 flex-1"></div>
                          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-surface border border-line-2 text-[10px] sm:text-[11px] shadow-sm shrink-0">
                            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent stroke-[1.8]" />
                            <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">
                              {sectionStartingHere.header &&
                              sectionStartingHere.header.toLowerCase() === (currentChat.title || '').toLowerCase()
                                ? 'Part 1'
                                : sectionStartingHere.header}
                            </span>
                            <span className="text-ink-faint">•</span>
                            <span className="text-accent font-semibold">{sectionStartingHere.topic_tag}</span>
                          </div>
                          <div className="h-px bg-surface-2 flex-1"></div>
                        </div>
                      )}
                      <div
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
                              ? 'bg-accent-strong border border-accent-bright text-white shadow-md shadow-accent/30'
                              : 'border-2 border-line-strong hover:border-line-strong bg-black/20'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      )}

                      <div
                        className={`space-y-1 flex flex-col ${
                          isMyMessage ? 'items-end' : 'items-start'
                        } max-w-[85%] sm:max-w-[70%] transition-all ${
                          msg.id === firstUnreadMsgId
                            ? 'border-l-2 border-accent/80 pl-2.5 -ml-2.5'
                            : ''
                        }`}
                      >
                        {/* Message Bubble with dynamic reaction background and Telegram-style right-click context menu */}
                        {(() => {
                          const reactionBg = getQuickReactionBubbleBg(msg.quick_reactions, isMyMessage);
                          return (
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
                              className={`w-fit max-w-full px-3.5 py-2 text-xs sm:text-sm font-medium leading-relaxed transition-all duration-300 relative select-text break-words ${
                                isCurrentlyEdited ? 'ring-2 ring-accent/80' : ''
                              } ${
                                isSelected
                                  ? 'ring-2 ring-accent bg-[#1e2e47] text-blue-50 shadow-md shadow-accent/20'
                                  : reactionBg
                                  ? reactionBg
                                  : isMyMessage
                                  ? 'bg-[#1e293b] border border-[#334155] text-ink'
                                  : 'bg-[#141824] border border-[#232a3d] text-ink'
                              } ${isMyMessage ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'}`}
                              title="Right-click for options (Edit, Delete, Reply, React, Select...)"
                            >
                        {/* Reply Quote box if replied to another message */}
                        {msg.reply_to_text && (
                          <div className="mb-2 pl-2.5 py-1 border-l-2 border-accent-bright bg-white/5 rounded-r-lg text-[11px] leading-tight select-none max-w-full">
                            <div className="font-semibold text-accent truncate">{msg.reply_to_sender || 'Replied message'}</div>
                            <div className="text-ink-soft truncate">{msg.reply_to_text}</div>
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
                                  <div className="text-[10px] text-ink-muted mt-1 truncate px-0.5">
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
                                <FileText className="w-4 h-4 text-accent shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">{msg.attachment_name || 'Attached document'}</div>
                                  <div className="text-[10px] text-ink-muted">Click to download</div>
                                </div>
                                <Download className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Text with inline timestamp & read/unread status */}
                        {msg.text && (!msg.attachment_url || !msg.text.startsWith('Shared attachment:')) && (
                          <div className="whitespace-pre-wrap break-words">
                            <span>{msg.text}</span>
                            <span className="inline-flex items-center gap-1 pl-2 text-[10px] text-ink-muted select-none align-baseline whitespace-nowrap">
                              {msg.is_edited && (
                                <span className="text-[9px] italic text-ink-muted/90 font-normal">edited</span>
                              )}
                              <span>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMyMessage && (
                                <span title={msg.is_read ? 'Read' : 'Sent (unread)'} className="inline-flex items-center">
                                  {msg.is_read ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-accent inline shrink-0 stroke-[2.2]" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-ink-muted inline shrink-0 stroke-[2.2]" />
                                  )}
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Timestamp & read/unread status for attachment-only messages */}
                        {(!msg.text || (msg.attachment_url && msg.text.startsWith('Shared attachment:'))) && (
                          <div className="flex items-center justify-end gap-1 text-[10px] text-ink-muted select-none whitespace-nowrap pt-1">
                            {msg.is_edited && (
                              <span className="text-[9px] italic text-ink-muted/90 font-normal">edited</span>
                            )}
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMyMessage && (
                              <span title={msg.is_read ? 'Read' : 'Sent (unread)'} className="inline-flex items-center">
                                {msg.is_read ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-accent inline shrink-0 stroke-[2.2]" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-ink-muted inline shrink-0 stroke-[2.2]" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

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
                                  ? 'bg-accent-strong/25 border-accent/50 text-white'
                                  : 'bg-[#18222d] border-[#253243] text-ink-soft'
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
                            ? 'bg-accent-strong border border-accent-bright text-white shadow-md shadow-accent/30'
                            : 'border-2 border-line-strong hover:border-line-strong bg-black/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    )}
                  </div>
                </React.Fragment>
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
          <div className="p-2.5 sm:p-4 border-t border-line bg-canvas-deep pb-2 sm:pb-3 relative shrink-0">
            {/* Telegram-style Selection Action Bar */}
            {selectedMessageIds.length > 0 && (
              <div className="absolute inset-0 z-40 bg-[#111724] border-t border-[#223147] p-3 px-4 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom duration-150">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="p-1.5 rounded-lg text-ink-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-ink transition-colors cursor-pointer"
                    title="Copy selected messages"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleForwardSelected}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-ink transition-colors cursor-pointer"
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
                        className="px-4 py-1.5 rounded-xl bg-accent-strong hover:bg-accent text-xs font-semibold text-white flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Image</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}


              {/* Publish / Sectioning Modal */}
              {showPublishModal && currentChat && (
                <div
                  className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
                  onClick={() => setShowPublishModal(false)}
                >
                  <div
                    className="relative w-full max-w-2xl max-h-[90vh] bg-canvas-2 border border-line-2 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-ink"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="h-16 px-6 border-b border-line flex items-center justify-between shrink-0 bg-canvas-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-accent-strong/20 text-accent flex items-center justify-center border border-accent/30">
                          <Eye className="w-4 h-4 stroke-[1.8]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight">Make Chat Public by Sections</h3>
                          <p className="text-[11px] text-ink-muted">Configure dialogue sections, headers, and # tags for recommendations</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPublishModal(false)}
                        className="p-1.5 text-ink-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
                      {/* Mutual Consent & Anonymity Callout */}
                      <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">
                            MUTUAL CONSENT & ANONYMITY
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-semibold font-mono">
                            {currentChat.partner_is_anonymous !== false ? 'Partner Anonymous' : 'Both Public'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">You</div>
                              <div className="text-[10px] text-ink-muted">Public · Your avatar & handle visible</div>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">{currentChat.title}</div>
                              <div className="text-[10px] text-ink-muted">
                                {currentChat.partner_is_anonymous !== false
                                  ? 'Anonymous · Name & avatar hidden until they click 👁️'
                                  : 'Public · Partner has consented'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-ink-muted leading-relaxed">
                          All messages between you will be publicly discoverable. The other person stays 100% anonymous until they also enable public mode.
                        </p>
                      </div>

                      {/* Main Title & Main Tag */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-ink-soft">Overall Chat Header</label>
                          <input
                            type="text"
                            value={publishTitle}
                            onChange={(e) => setPublishTitle(e.target.value)}
                            placeholder="e.g. He brought a résumé to a first date"
                            className="w-full bg-surface border border-line-2 focus:border-accent rounded-xl px-3 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-ink-soft">Default # Tag</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={publishTopic}
                              onChange={(e) => {
                                const v = e.target.value;
                                setPublishTopic(v.startsWith('#') ? v : `#${v}`);
                              }}
                              placeholder="#dating"
                              className="w-full bg-surface border border-line-2 focus:border-accent rounded-xl px-3 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sections List */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <span className="font-bold text-xs text-white">Message Sections ({publishSections.length})</span>
                          </div>
                          <span className="text-[10px] text-ink-muted">
                            Split dialogue into sections for recommendation feeds
                          </span>
                        </div>

                        {publishSections.map((sec, secIdx) => {
                          const secMsgs = currentChat.messages.filter((m) =>
                            sec.message_ids.includes(m.id)
                          );

                          return (
                            <div
                              key={secIdx}
                              className="p-4 rounded-2xl bg-canvas-2 border border-line-2 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                                    SECTION {secIdx + 1}
                                  </span>
                                  <span className="text-[10px] text-ink-faint">
                                    ({sec.message_ids.length} messages)
                                  </span>
                                </div>
                                {secIdx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMergeSectionWithPrev(secIdx)}
                                    className="text-[10px] font-semibold text-ink-muted hover:text-white underline cursor-pointer"
                                  >
                                    Merge with Section {secIdx}
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold text-ink-muted">Section Header</label>
                                  <input
                                    type="text"
                                    value={sec.header}
                                    onChange={(e) => {
                                      const updated = [...publishSections];
                                      updated[secIdx].header = e.target.value;
                                      setPublishSections(updated);
                                    }}
                                    placeholder={`Section ${secIdx + 1} Header`}
                                    className="w-full bg-surface border border-line-2 focus:border-accent rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-ink-faint focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold text-ink-muted">Section # Tag</label>
                                  <input
                                    type="text"
                                    value={sec.topic_tag}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      const updated = [...publishSections];
                                      updated[secIdx].topic_tag = v.startsWith('#') ? v : `#${v}`;
                                      setPublishSections(updated);
                                    }}
                                    placeholder="#topic"
                                    className="w-full bg-surface border border-line-2 focus:border-accent rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-ink-faint focus:outline-none"
                                  />
                                </div>
                              </div>

                              {/* Messages in this section preview */}
                              <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto pr-1">
                                {secMsgs.length === 0 ? (
                                  <div className="text-[11px] text-ink-faint italic py-2">
                                    No messages assigned to this section yet.
                                  </div>
                                ) : (
                                  secMsgs.map((m, mIdx) => (
                                    <div
                                      key={m.id}
                                      className="p-2 rounded-xl bg-black/25 border border-white/5 flex items-center justify-between text-[11px] gap-2"
                                    >
                                      <div className="min-w-0 flex items-center gap-2">
                                        <span className="font-semibold text-ink-soft truncate shrink-0">
                                          {m.is_self ? 'You' : m.sender_name}:
                                        </span>
                                        <span className="text-ink-muted truncate">
                                          {m.text || m.attachment_name || 'Attachment'}
                                        </span>
                                      </div>

                                      {/* Split after this message button */}
                                      {mIdx < secMsgs.length - 1 && (
                                        <button
                                          type="button"
                                          onClick={() => handleSplitSectionAfter(secIdx, mIdx)}
                                          className="text-[10px] font-bold text-accent hover:text-accent-bright hover:bg-accent/10 px-2 py-0.5 rounded-lg border border-accent/20 shrink-0 transition-colors cursor-pointer"
                                          title="Split section after this message"
                                        >
                                          + Split section here
                                        </button>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="h-16 px-6 border-t border-line flex items-center justify-between shrink-0 bg-canvas-2">
                      {currentChat.is_published ? (
                        <button
                          type="button"
                          onClick={handleRemovePublication}
                          disabled={publishing}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          {publishing ? 'Removing...' : 'Make Private'}
                        </button>
                      ) : (
                        <div></div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPublishModal(false)}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-ink-soft text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSavePublication}
                          disabled={publishing}
                          className="px-4 py-2 rounded-xl bg-accent-strong hover:bg-accent text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-accent/20"
                        >
                          {publishing ? 'Saving...' : currentChat.is_published ? 'Update Publication' : 'Make Public'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Editing Banner */}
              {editingMessage && (
                <div className="mb-2 px-3 py-2 rounded-xl bg-[#141e2b] border border-accent/40 flex items-center justify-between text-xs text-white animate-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-accent-strong/20 text-accent flex items-center justify-center shrink-0">
                      <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[11px] text-accent">Edit message</div>
                      <div className="text-[10px] text-ink-soft truncate">{editingMessage.text}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-1 text-ink-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer ml-2"
                    title="Cancel edit"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Replying Banner */}
              {replyingTo && (
                <div className="mb-2 px-3 py-2 rounded-xl bg-[#141e2b] border border-accent/40 flex items-center justify-between text-xs text-white animate-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-accent-strong/20 text-accent flex items-center justify-center shrink-0">
                      <Reply className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[11px] text-accent">
                        Replying to {replyingTo.sender_name || 'Participant'}
                      </div>
                      <div className="text-[10px] text-ink-soft truncate">
                        {replyingTo.text || replyingTo.attachment_name || 'Attachment'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelReply}
                    className="p-1 text-ink-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer ml-2"
                    title="Cancel reply"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Pending Attachment preview chip */}
              {pendingAttachment && (
                <div className="mb-2 px-3 py-2 rounded-xl bg-surface border border-line-2 flex items-center justify-between text-xs text-white max-w-md animate-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {pendingAttachment.type === 'image' ? (
                      <img
                        src={pendingAttachment.dataUrl}
                        alt="Preview"
                        className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-accent-strong/20 border border-accent/30 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-accent" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold truncate text-[11px] text-white">{pendingAttachment.name}</div>
                      <div className="text-[10px] text-ink-muted">{pendingAttachment.size} · Ready to send</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingAttachment(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface-2 transition-colors cursor-pointer ml-2"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Follow Partner Banner if user is not following the other participant */}
              {currentChat?.partner_user && !currentChat.partner_user.is_following && (
                <div className="p-3 mb-2 rounded-2xl bg-canvas-2 border border-line-2 flex items-center justify-between gap-3 text-xs shadow-md">
                  <div className="flex items-center gap-2.5 text-ink-muted min-w-0">
                    <Lock className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-[11px] truncate leading-relaxed">
                      You must follow <strong className="text-white">{currentChat.partner_user.handle}</strong> to send messages.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFollowPartner}
                    disabled={followingPartner}
                    className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-bright font-bold text-xs text-white shrink-0 cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                  >
                    {followingPartner && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>Follow</span>
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
                  className="relative rounded-2xl bg-canvas-2 border border-line-2 focus-within:border-accent/60 transition-colors flex items-center px-3 sm:px-3.5 py-1.5 sm:py-2"
                  onPaste={handlePaste}
                >
                  {/* File Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={Boolean(currentChat?.partner_user && !currentChat.partner_user.is_following)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      currentChat?.partner_user && !currentChat.partner_user.is_following
                        ? 'text-ink-faint opacity-40 cursor-not-allowed'
                        : 'text-ink-muted hover:text-accent hover:bg-surface-2'
                    }`}
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
                      currentChat?.partner_user && !currentChat.partner_user.is_following
                        ? `Follow ${currentChat.partner_user.handle} to send messages...`
                        : editingMessage
                        ? 'Edit message...'
                        : pendingAttachment
                        ? 'Add a caption...'
                        : replyingTo
                        ? 'Write a reply...'
                        : 'Type a private reply...'
                    }
                    disabled={sendingMessage || Boolean(currentChat?.partner_user && !currentChat.partner_user.is_following)}
                    className="flex-1 bg-transparent px-2.5 sm:px-3 text-xs sm:text-sm text-white placeholder:text-ink-faint focus:outline-none disabled:opacity-50 min-w-0"
                  />

                  {/* Emoji Picker Button & Popover */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer mr-1.5 ${
                        showEmojiPicker
                          ? 'text-accent bg-accent-strong/20'
                          : 'text-ink-muted hover:text-white hover:bg-surface-2'
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
                    disabled={
                      sendingMessage ||
                      Boolean(currentChat?.partner_user && !currentChat.partner_user.is_following) ||
                      (!typedMessage.trim() && !pendingAttachment)
                    }
                    className="w-7 h-7 rounded-lg bg-accent-strong hover:bg-accent disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-accent/20 active:scale-95 shrink-0"
                    title={
                      currentChat?.partner_user && !currentChat.partner_user.is_following
                        ? `Follow ${currentChat.partner_user.handle} to send messages`
                        : editingMessage
                        ? 'Save changes'
                        : 'Send message'
                    }
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

                <div className="text-center text-[10px] text-ink-faint mt-1 sm:mt-1.5">
                  New messages stay private until you choose to publish them.
                </div>
              </form>
            </div>
          </>
        )}
      </main>

      {/* Right Sidebar: CONVERSATION DETAILS - only visible when Details button is clicked */}
      {showDetails && (
        <aside className="w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-4 overflow-y-auto bg-canvas-deep border-l border-line fixed inset-y-0 right-0 z-40 md:static animate-in slide-in-from-right duration-200 shadow-2xl md:shadow-none">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <div className="text-[10px] font-bold uppercase tracking-wider text-accent font-mono">
              CONVERSATION DETAILS
            </div>
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="p-1.5 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
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
              <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 space-y-2 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Your published excerpt</span>
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Excerpt is live on public discovery feeds. Readers can react to published dialogue but cannot access private replies.
                </p>
              </div>

              {/* Public excerpt card */}
              <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider font-mono">
                    Public Excerpt
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-semibold font-mono">
                    {currentChat.active_excerpt?.sections?.length || 1} {currentChat.active_excerpt?.sections?.length === 1 ? 'section' : 'sections'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  {currentChat.active_excerpt?.title || currentChat.title}
                </h4>
                <div className="text-[10px] text-ink-faint flex items-center gap-1.5">
                  <span className="text-accent font-semibold">{currentChat.active_excerpt?.topic || '#dating'}</span>
                  <span>·</span>
                  <span>{currentChat.active_excerpt?.reads_count || 0} reads</span>
                  <span>·</span>
                  <span>{currentChat.partner_is_anonymous !== false ? 'Partner: Anonymous' : 'Both: Public'}</span>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={openPublishModal}
                    className="w-full py-2 px-3 rounded-xl bg-accent-strong/20 hover:bg-accent-strong/30 text-xs font-bold text-accent border border-accent/30 transition-colors cursor-pointer text-center"
                  >
                    Edit sections & headers
                  </button>
                  <button
                    onClick={handleRemovePublication}
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

              <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Eye className="w-4 h-4 text-accent stroke-[1.8]" />
                  <span>Ready to publish with sections?</span>
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Click the eye icon to make your dialogue public. You will be visible, while your partner stays anonymous until they also consent.
                </p>

                {currentChat && (
                  <button
                    onClick={openPublishModal}
                    disabled={publishing}
                    className="w-full py-2.5 px-3 rounded-xl bg-accent-strong hover:bg-accent text-xs font-bold text-white transition-colors cursor-pointer text-center shadow-md shadow-accent/20 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4 stroke-[1.8]" />
                    <span>Configure & Publish Chat</span>
                  </button>
                )}
              </div>
            </>
          )}


          {/* Conversation options */}
          <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 space-y-2.5 shadow-lg">
            <h4 className="text-xs font-bold text-white">Conversation options</h4>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => currentChat && toggleMuteChat(currentChat.id)}
                className="w-full text-left py-1 text-ink-muted hover:text-white transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>{currentChat && mutedChatIds.has(currentChat.id) ? 'Unmute conversation' : 'Mute conversation'}</span>
                {currentChat && mutedChatIds.has(currentChat.id) && (
                  <BellOff className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
              <button
                onClick={handleReportChat}
                className="w-full text-left py-1 text-ink-muted hover:text-white transition-colors cursor-pointer"
              >
                Report conversation
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-[10px] text-ink-faint space-y-1 pt-2">
            <FooterLinks onNavigate={onNavigate} />
            <div>© 2026 CCHAT. Keep it human.</div>
          </div>
        </aside>
      )}
    </div>
  );
}
