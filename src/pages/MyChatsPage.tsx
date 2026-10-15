import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Smile,
  ArrowUp,
  ShieldCheck,
  Edit,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cchatApi, ChatSummary, ChatDetail, ChatMessage } from '../services/api';

interface MyChatsPageProps {
  onNavigate?: (nav: string) => void;
}

export function MyChatsPage({ onNavigate }: MyChatsPageProps) {
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load chat list from backend
  const fetchChats = async (selectFirst: boolean = false) => {
    try {
      const data = await cchatApi.getChats();
      setChats(data);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedChatId || sendingMessage) return;

    const text = typedMessage.trim();
    setSendingMessage(true);
    try {
      const newMsg = await cchatApi.sendMessage(selectedChatId, text);
      setTypedMessage('');
      if (currentChat) {
        setCurrentChat({
          ...currentChat,
          messages: [...currentChat.messages, newMsg],
          preview: text,
        });
      }
      // Update preview in list
      setChats(prev => prev.map(c => c.id === selectedChatId ? { ...c, preview: text } : c));
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
      <section className="w-[280px] shrink-0 border-r border-[#171722] flex flex-col bg-[#09090f] h-full justify-between">
        <div className="overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#171722] shrink-0">
            <h2 className="text-lg font-bold text-white tracking-tight">My chats</h2>
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
      <main className="flex-1 flex flex-col h-full bg-[#0a0a0f] border-r border-[#171722] min-w-0">
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
            <header className="h-16 px-6 border-b border-[#171722] flex items-center justify-between shrink-0 bg-[#0a0a0f]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#182030] border border-[#253550] flex items-center justify-center text-blue-400 text-xs font-bold">
                  {currentChat.initials || 'CC'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{currentChat.title}</h3>
                  <p className="text-[11px] text-slate-500">{currentChat.participants_summary}</p>
                </div>
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
            <div className="flex-1 overflow-y-auto px-8 py-5 space-y-4">
              <div className="text-center py-1">
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase font-mono">
                  ENCRYPTED PRIVATE THREAD
                </span>
              </div>

              {currentChat.messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  No messages yet. Send a private message below to start the conversation!
                </div>
              ) : (
                currentChat.messages.map((msg: ChatMessage) => {
                  const isMyMessage = msg.is_maya || msg.is_self;
                  return (
                    <div key={msg.id} className="space-y-1">
                      {/* Sender Name */}
                      <div
                        className={`text-[11px] text-slate-400 font-medium ${
                          isMyMessage ? 'text-right' : 'text-left'
                        }`}
                      >
                        {msg.sender_name || 'Participant'}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl px-5 py-3.5 border text-xs text-slate-100 max-w-[80%] leading-relaxed ${
                          isMyMessage
                            ? 'ml-auto bg-[#1b2234] border-[#2d3a5a] text-blue-50'
                            : 'bg-[#151520] border-[#222234]'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-[#171722] bg-[#0a0a0f]">
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="relative rounded-2xl bg-[#11111b] border border-[#1e1e2d] flex items-center px-3.5 py-2">
                  <button
                    type="button"
                    className="p-1.5 text-slate-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    placeholder="Type a private reply..."
                    disabled={sendingMessage}
                    className="flex-1 bg-transparent px-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="p-1.5 text-slate-500 hover:text-white rounded-lg transition-colors cursor-pointer mr-1.5"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={sendingMessage || !typedMessage.trim()}
                    className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
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

      {/* Right Sidebar: CONVERSATION DETAILS */}
      <aside className="w-[320px] shrink-0 p-5 space-y-4 overflow-y-auto bg-[#09090f] border-l border-[#171722]">
        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
          CONVERSATION DETAILS
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
    </div>
  );
}
