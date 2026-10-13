import React, { useState } from 'react';
import {
  Search,
  Plus,
  Smile,
  ArrowUp,
  ShieldCheck,
  Edit,
  ArrowUpRight
} from 'lucide-react';

interface MyChatsPageProps {
  onNavigate?: (nav: string) => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  isMaya: boolean;
  text: string;
}

interface ChatData {
  id: string;
  title: string;
  preview: string;
  time: string;
  tag: 'PRIVATE' | '2 UNREAD' | 'PUBLISHED';
  initials: string;
  participants: string;
  isPublished: boolean;
  publishedBanner?: string;
  excerptTitle?: string;
  excerptTag?: string;
  excerptReads?: string;
  inputPlaceholder: string;
  messages: ChatMessage[];
  afterExcerptMessage?: {
    sender: string;
    text: string;
  };
}

const CHATS_DATA: Record<string, ChatData> = {
  apartment: {
    id: 'apartment',
    title: 'The apartment',
    preview: 'who adopted a raccoon',
    time: '18m',
    tag: '2 UNREAD',
    initials: 'JP',
    participants: 'Maya & Jules Park · just the two of you',
    isPublished: true,
    publishedBanner: '6-message excerpt published · new messages remain private',
    excerptTitle: 'the rent is due. the raccoon is not on the lease.',
    excerptTag: '#roommatelore · 6 messages · 6.2k reads',
    inputPlaceholder: 'Do we need to add a tiny signature line to the lease?',
    messages: [
      { id: 'm1', sender: 'Jules Park', isMaya: false, text: 'who adopted a raccoon' },
      { id: 'm2', sender: 'Maya', isMaya: true, text: 'nobody adopted him. he chose us.' },
      { id: 'm3', sender: 'Jules Park', isMaya: false, text: 'the rent is due. the raccoon is not on the lease.' },
      { id: 'm4', sender: 'Maya', isMaya: true, text: 'he has a tiny hand. he can sign.' },
      { id: 'm5', sender: 'Jules Park', isMaya: false, text: 'he is washing a grape in my coffee mug' },
      { id: 'm6', sender: 'Maya', isMaya: true, text: "more dishes than you've done all week." },
    ],
    afterExcerptMessage: {
      sender: 'Maya',
      text: 'he is now asleep on the chore chart. symbolic.',
    },
  },
  friday: {
    id: 'friday',
    title: 'Friday plans',
    preview: 'we said one drink',
    time: '1h',
    tag: 'PRIVATE',
    initials: 'NP',
    participants: 'Maya & Nina Patel · just the two of you',
    isPublished: false,
    publishedBanner: 'Private · nothing from this conversation is public',
    inputPlaceholder: "Next Friday we're defining \"one\" in writing.",
    messages: [
      { id: 'm1', sender: 'Nina Patel', isMaya: false, text: 'we said one drink' },
      { id: 'm2', sender: 'Maya', isMaya: true, text: 'this is still the same evening' },
      { id: 'm3', sender: 'Nina Patel', isMaya: false, text: 'it is saturday' },
      { id: 'm4', sender: 'Maya', isMaya: true, text: 'a technicality' },
      { id: 'm5', sender: 'Nina Patel', isMaya: false, text: 'why is there a karaoke receipt' },
      { id: 'm6', sender: 'Maya', isMaya: true, text: 'because we invested in the arts.' },
    ],
  },
  work: {
    id: 'work',
    title: 'Work bestie',
    preview: 'the deck has 94 slides',
    time: '3h',
    tag: 'PUBLISHED',
    initials: 'LM',
    participants: 'Maya & Leo Martinez · just the two of you',
    isPublished: true,
    publishedBanner: '6-message excerpt published · new messages remain private',
    excerptTitle: 'the deck has 94 slides.',
    excerptTag: '#workbesties · 6 messages · 9.1k reads',
    inputPlaceholder: "Tomorrow's agenda: fewer slides. More coffee.",
    messages: [
      { id: 'm1', sender: 'Leo Martinez', isMaya: false, text: 'the deck has 94 slides' },
      { id: 'm2', sender: 'Maya', isMaya: true, text: 'is the presentation a hostage situation' },
      { id: 'm3', sender: 'Leo Martinez', isMaya: false, text: 'slide 62 just says "to be continued"' },
      { id: 'm4', sender: 'Maya', isMaya: true, text: 'we are in the extended universe of Q3' },
      { id: 'm5', sender: 'Leo Martinez', isMaya: false, text: 'the appendix has an appendix' },
      { id: 'm6', sender: 'Maya', isMaya: true, text: 'this meeting could be a chat. this chat could be a nap.' },
    ],
    afterExcerptMessage: {
      sender: 'Maya',
      text: 'i’m logging off. the slides can raise themselves.',
    },
  },
  interview: {
    id: 'interview',
    title: 'The interview',
    preview: 'honestly? hired.',
    time: 'Now',
    tag: 'PRIVATE',
    initials: 'AN',
    participants: 'Maya & Anonymous · just the two of you',
    isPublished: false,
    publishedBanner: 'Private · nothing from this conversation is public',
    inputPlaceholder: 'Second interview on Friday. Benefits include pasta.',
    messages: [
      { id: 'm1', sender: 'Anonymous', isMaya: false, text: 'i brought a résumé to the date.' },
      { id: 'm2', sender: 'Maya', isMaya: true, text: 'please tell me this is a metaphor' },
      { id: 'm3', sender: 'Anonymous', isMaya: false, text: 'two pages. references available on request.' },
      { id: 'm4', sender: 'Maya', isMaya: true, text: 'did you at least get the position?' },
      { id: 'm5', sender: 'Anonymous', isMaya: false, text: 'second interview on friday. benefits include pasta.' },
      { id: 'm6', sender: 'Maya', isMaya: true, text: 'honestly? hired.' },
    ],
  },
};

export function MyChatsPage({ onNavigate }: MyChatsPageProps) {
  const [selectedChatId, setSelectedChatId] = useState<string>('apartment');
  const [chatFilter, setChatFilter] = useState<'All chats' | 'Published'>('All chats');
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [muted, setMuted] = useState<boolean>(false);
  const [blocked, setBlocked] = useState<boolean>(false);
  const [reported, setReported] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentChat = CHATS_DATA[selectedChatId] || CHATS_DATA['apartment'];

  const chatList = [
    CHATS_DATA.interview,
    CHATS_DATA.apartment,
    CHATS_DATA.friday,
    CHATS_DATA.work,
  ].filter((c) => {
    if (chatFilter === 'Published') return c.isPublished;
    return true;
  });

  const handleFilterClick = (f: 'All chats' | 'Published') => {
    setChatFilter(f);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    showToast('Message sent (private)');
    setTypedMessage('');
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
        <div>
          {/* Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#171722]">
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
          <div className="p-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Find a conversation"
                className="w-full bg-[#11111b] border border-[#1d1d2b] focus:border-blue-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Tabs: All chats / Published */}
          <div className="flex items-center gap-5 px-5 pt-1 pb-3 text-xs font-semibold border-b border-[#151520]">
            {(['All chats', 'Published'] as const).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterClick(f)}
                className={`transition-colors cursor-pointer pb-0.5 relative ${
                  chatFilter === f
                    ? 'text-white font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f}
                {chatFilter === f && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Chat List items */}
          <div className="p-2 space-y-1.5 overflow-y-auto">
            {chatList.map((chat) => {
              const isSelected = selectedChatId === chat.id;
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
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{chat.preview}</p>
                  <div className="mt-2.5">
                    <span
                      className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full ${
                        chat.tag === '2 UNREAD'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : chat.tag === 'PUBLISHED'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-[#171722] text-slate-400 border border-[#232334]'
                      }`}
                    >
                      {chat.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <div className="p-4 border-t border-[#171722] text-[11px] text-slate-500 leading-relaxed">
          Your conversations start private. You decide what gets a spotlight.
        </div>
      </section>

      {/* Active Conversation Column (Center) */}
      <main className="flex-1 flex flex-col h-full bg-[#0a0a0f] border-r border-[#171722] min-w-0">
        {/* Header */}
        <header className="h-16 px-6 border-b border-[#171722] flex items-center justify-between shrink-0 bg-[#0a0a0f]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#182030] border border-[#253550] flex items-center justify-center text-blue-400 text-xs font-bold">
              {currentChat.initials}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{currentChat.title}</h3>
              <p className="text-[11px] text-slate-500">{currentChat.participants}</p>
            </div>
          </div>
        </header>

        {/* Published / Private Banner */}
        <div className="px-6 py-2 bg-[#0c101d] border-b border-[#141e33] flex items-center shrink-0">
          <span className="text-xs text-blue-400/90 font-medium">
            {currentChat.publishedBanner}
          </span>
        </div>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto px-8 py-5 space-y-4">
          <div className="text-center py-1">
            <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase font-mono">
              TODAY · 10:42 PM
            </span>
          </div>

          {currentChat.messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              {/* Sender Name */}
              <div
                className={`text-[11px] text-slate-400 font-medium ${
                  msg.isMaya ? 'text-right' : 'text-left'
                }`}
              >
                {msg.sender}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-5 py-3.5 border text-xs text-slate-100 max-w-[80%] leading-relaxed ${
                  msg.isMaya
                    ? 'ml-auto bg-[#151520] border-[#222234]'
                    : 'bg-[#151520] border-[#222234]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Seen receipt */}
          <div className="text-[10px] text-slate-500 text-right pt-0.5 font-mono">
            Seen 10:46 PM
          </div>

          {/* After Excerpt Section (for published chats) */}
          {currentChat.afterExcerptMessage && (
            <div className="space-y-3 pt-3">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono">
                AFTER THE PUBLISHED EXCERPT · PRIVATE
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-medium text-right">
                  {currentChat.afterExcerptMessage.sender}
                </div>
                <div className="rounded-2xl px-5 py-3.5 border bg-[#151520] border-[#222234] text-xs text-slate-100 max-w-[80%] ml-auto leading-relaxed">
                  {currentChat.afterExcerptMessage.text}
                </div>
              </div>
            </div>
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
                placeholder={currentChat.inputPlaceholder}
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
                className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
              >
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            <div className="text-center text-[10px] text-slate-500">
              New messages stay private until you publish them.
            </div>
          </form>
        </div>
      </main>

      {/* Right Sidebar: CONVERSATION DETAILS */}
      <aside className="w-[320px] shrink-0 p-5 space-y-4 overflow-y-auto bg-[#09090f] border-l border-[#171722]">
        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
          CONVERSATION DETAILS
        </div>

        {currentChat.isPublished ? (
          /* PUBLISHED CHAT SIDEBAR */
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
                Maya published 6 messages. Readers see @mayamaybe × Anonymous. The other participant's name, handle and photo are hidden.
              </p>
            </div>

            {/* Public excerpt card */}
            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 shadow-lg">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Public excerpt
              </div>
              <h4 className="text-xs font-bold text-white leading-snug">
                {currentChat.excerptTitle}
              </h4>
              <div className="text-[10px] text-slate-500">
                {currentChat.excerptTag}
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => showToast('Opening editor for publication...')}
                  className="w-full py-2 px-3 rounded-xl bg-[#171724] hover:bg-[#202035] text-xs font-bold text-slate-200 border border-[#232338] transition-colors cursor-pointer text-center"
                >
                  Edit publication
                </button>
                <button
                  onClick={() => showToast('Publication removed')}
                  className="w-full py-2 px-3 rounded-xl bg-[#171724] hover:bg-[#202035] text-xs font-bold text-slate-200 border border-[#232338] transition-colors cursor-pointer text-center"
                >
                  Remove publication
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Both identities appear only if both participants publish. Readers can react to the excerpt, never join this chat.
            </p>

            {/* Conversation options */}
            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-2.5 shadow-lg">
              <h4 className="text-xs font-bold text-white">Conversation options</h4>

              <div className="space-y-1.5 pt-0.5">
                <button
                  onClick={() => {
                    setMuted(!muted);
                    showToast(muted ? 'Mute turned off' : 'Conversation muted');
                  }}
                  className="text-xs text-blue-400 hover:underline cursor-pointer block text-left"
                >
                  Mute conversation · {muted ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => {
                    setBlocked(!blocked);
                    showToast(blocked ? 'Participant unblocked' : 'Participant blocked');
                  }}
                  className="text-xs text-blue-400 hover:underline cursor-pointer block text-left"
                >
                  {blocked ? 'Unblock participant' : 'Block participant'}
                </button>
                <button
                  onClick={() => {
                    setReported(true);
                    showToast('Report initiated');
                  }}
                  className="text-xs text-rose-400 hover:underline cursor-pointer block text-left"
                >
                  Report conversation
                </button>
              </div>

              <div className="pt-2 border-t border-[#181824] space-y-1 text-[10px] text-slate-500">
                <div>Report reason: privacy or personal information</div>
                <div>Optional note: Describe what happened.</div>
              </div>
            </div>
          </>
        ) : (
          /* PRIVATE CHAT SIDEBAR */
          <>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
              Just your chat.
            </h2>

            {/* Private by default card */}
            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-2 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Private by default</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Only the participants can read this conversation here. Nothing appears on your profile or in the public feed.
              </p>
            </div>

            {/* Publication preview card */}
            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 shadow-lg">
              <h4 className="text-xs font-bold text-white">Publication preview</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                If you choose to publish, select the messages first. New messages will still stay private.
              </p>
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="text-blue-400 font-medium">Maya → visible publisher</div>
                <div className="text-slate-400">Other participant → Anonymous</div>
              </div>
            </div>

            {/* Conversation options */}
            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-2.5 shadow-lg">
              <h4 className="text-xs font-bold text-white">Conversation options</h4>

              <div className="space-y-1.5 pt-0.5">
                <button
                  onClick={() => {
                    setMuted(!muted);
                    showToast(muted ? 'Mute turned off' : 'Conversation muted');
                  }}
                  className="text-xs text-blue-400 hover:underline cursor-pointer block text-left"
                >
                  Mute conversation · {muted ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => {
                    setBlocked(!blocked);
                    showToast(blocked ? 'Participant unblocked' : 'Participant blocked');
                  }}
                  className="text-xs text-blue-400 hover:underline cursor-pointer block text-left"
                >
                  {blocked ? 'Unblock participant' : 'Block participant'}
                </button>
                <button
                  onClick={() => {
                    setReported(true);
                    showToast('Report initiated');
                  }}
                  className="text-xs text-rose-400 hover:underline cursor-pointer block text-left"
                >
                  Report conversation
                </button>
              </div>

              <div className="pt-2 border-t border-[#181824] space-y-1 text-[10px] text-slate-500">
                <div>Report reason: privacy or personal information</div>
                <div>Optional note: Describe what happened.</div>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
