import React, { useState } from 'react';
import { Search, Bell, ShieldCheck, ChevronDown } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate?: (nav: string, topic?: string) => void;
}

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  const [requestType, setRequestType] = useState('Account data');
  const [email, setEmail] = useState('maya@example.com');
  const [details, setDetails] = useState("I'd like to review my account information.");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Scrollable Area */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#09090f]">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">Privacy</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats, people, plot twists"
                className="w-full bg-[#12121c] border border-[#212130] focus:border-blue-500 rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono bg-[#1c1c2b] px-1.5 py-0.5 rounded border border-[#29293d]">⌘ K</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 px-8 py-7 overflow-y-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="text-[11px] font-bold tracking-wider text-blue-400 uppercase">
            CCHAT / PRIVACY
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Public chat. Private identity.
          </h1>
          <p className="text-sm text-slate-400 mt-2 mb-7">
            A clear model for what you share, what readers see and what stays in your inbox.
          </p>

          {/* About this page card */}
          <div className="rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] p-6 mb-7 shadow-lg space-y-2.5">
            <h3 className="text-sm font-bold text-white tracking-tight">
              About this page
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Conceptual privacy guidance for this CCHAT product design. It describes the intended public/private experience, not a legal privacy notice, security certification or statement about an operating service. Product design edition · October 2026.
            </p>
          </div>

          {/* Section 1 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Private conversations and public excerpts are different.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Messages in My chats are private conversations between their participants. A public excerpt is a selected set of messages a participant chooses to publish, with a title and topic. Readers can view and react to that excerpt, but cannot join the private conversation. Future messages stay private unless a participant separately publishes them.
            </p>
          </div>

          {/* Section 2 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              One publishes. One stays anonymous.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When only one participant publishes, readers see the publisher’s identity and an Anonymous label for the other participant. The anonymous participant’s name, handle and profile photo are hidden. Both participants’ identities appear only if both publish. Publishing your own excerpt does not grant permission to reveal the other person in a title or in the message text.
            </p>
          </div>

          {/* Section 3 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              An anonymous label has limits.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The content itself can include names, locations, work details or other clues. Hiding a profile does not make those details anonymous or prevent a reader from recognizing a person. Remove identifying and sensitive content before publication. Do not attempt to discover or reveal who an anonymous participant is.
            </p>
          </div>

          {/* Section 4 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              What is visible on public surfaces.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Published messages, publication titles and topics, the publisher’s public profile and public reaction activity belong in the reading experience. Public profiles show published chats rather than inbox conversations. Search covers public excerpts, public profiles and topics; it does not reveal private chats or identities hidden by the publication rule.
            </p>
          </div>

          {/* Section 5 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Saved collections and account preferences.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Saved collections are private to the account that creates them. Your email and sign-in settings are not public-profile fields. Account and settings brings profile editing, message preferences, reaction notifications, privacy defaults and blocked accounts together. Review notification previews on shared devices and avoid placing sensitive information in your public bio.
            </p>
          </div>

          {/* Section 6 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Changing or removing a publication.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You can edit a publication’s title and topic or remove your publication in Published chats. The private conversation remains in My chats. Another participant’s separate publication may remain, with your identity hidden if you no longer publish. Copies or screenshots already shared by readers cannot be assumed to disappear when an excerpt is removed.
            </p>
          </div>

          {/* Section 7 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Safety controls and partner placements.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use an excerpt’s options menu to report exposed personal information or abusive content. Muting and blocking help manage your own experience; they are not a promise of global removal. Sponsored placements are labeled and separate from organic public conversations. This design does not imply that a sponsor can access your private inbox.
            </p>
          </div>

          {/* Section 8 */}
          <div className="py-6 border-b border-[#181824] space-y-2 mb-10">
            <h3 className="text-base font-bold text-white tracking-tight">
              Account data, deletion and questions.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use the account controls to request account data or review deletion. Account deletion and publication removal are different actions, and a final implementation should explain any retention requirements and request handling before confirmation. Do not assume encryption guarantees, automatic deletion deadlines or third-party sharing terms that are not specified here.
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[300px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* The identity rule card */}
        <div className="p-5 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-lg">
          <h4 className="text-xs font-bold text-white">The identity rule</h4>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">One publisher</div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Publisher visible. Other participant’s name, handle and photo hidden.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Both publish</div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Both identities visible in the public excerpt.
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-relaxed pt-3 border-t border-[#181826]">
            Private chat participants still know who they are talking to. The Anonymous label is for public readers.
          </div>
        </div>

        {/* Your controls card */}
        <div className="p-5 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-2 shadow-lg">
          <h4 className="text-xs font-bold text-white mb-1">Your controls</h4>
          <div className="space-y-1.5">
            <button
              onClick={() => onNavigate?.('Account and settings')}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline cursor-pointer block text-left"
            >
              Account and settings
            </button>
            <button
              onClick={() => onNavigate?.('Published chats')}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline cursor-pointer block text-left"
            >
              Published chats
            </button>
            <button
              onClick={() => onNavigate?.('Community rules')}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline cursor-pointer block text-left"
            >
              Community rules
            </button>
          </div>
        </div>

        {/* Privacy request preview card */}
        <div className="p-5 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-lg">
          <h4 className="text-xs font-bold text-white">Privacy request · preview</h4>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Request type
              </label>
              <div className="relative">
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full bg-[#0a0a10] border border-[#202030] rounded-xl px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
                >
                  <option value="Account data">Account data</option>
                  <option value="Data deletion">Data deletion</option>
                  <option value="Publication removal review">Publication removal review</option>
                  <option value="Other privacy question">Other privacy question</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Reply email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a10] border border-[#202030] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Details
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className="w-full bg-[#0a0a10] border border-[#202030] rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-blue-500/20 active:scale-98"
            >
              {submitted ? 'Request submitted ✓' : 'Submit request'}
            </button>
          </form>

          <div className="text-[10px] text-slate-500 leading-relaxed pt-1">
            Illustrative form. No delivery or processing commitment is represented.
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span onClick={() => onNavigate?.('About CCHAT')} className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span onClick={() => onNavigate?.('Community rules')} className="hover:underline cursor-pointer">Community rules</span>
            <span>·</span>
            <span onClick={() => onNavigate?.('Privacy')} className="hover:underline cursor-pointer text-slate-300">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}
