import React, { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

interface SponsorshipPageProps {
  onNavigate?: (nav: string, topic?: string) => void;
}

export function SponsorshipPage({ onNavigate }: SponsorshipPageProps) {
  const [name, setName] = useState('Alex Morgan');
  const [brand, setBrand] = useState('After Hours');
  const [email, setEmail] = useState('alex@example.com');
  const [placement, setPlacement] = useState('Discover sponsor card');
  const [idea, setIdea] = useState('Late-night coffee and a playlist for the conversation that keeps going.');
  const [agreed, setAgreed] = useState(true);
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
          <h2 className="text-xl font-bold text-white tracking-tight">Sponsorship / Learn more</h2>
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
            CCHAT / PARTNER PROGRAM
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Support the plot. Don’t interrupt it.
          </h1>
          <p className="text-sm text-slate-400 mt-2 mb-7">
            Thoughtful, clearly labeled partner content for public reading and discovery.
          </p>

          {/* Intro Section */}
          <div className="space-y-2 mb-7">
            <h3 className="text-base font-bold text-white tracking-tight">
              A place for partners, not a disguised conversation.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sponsorship gives a brand or project a defined, labeled placement alongside the public reading experience. It is separate from organic chat excerpts, public reactions and editorial selections. Paid copy should feel relevant without pretending to be a participant’s private message.
            </p>
          </div>

          {/* Paid Placement Example 1 */}
          <div className="mb-6">
            <div className="text-xs font-bold text-slate-300 mb-2">
              Paid placement example · Discover sponsor card
            </div>
            <div className="rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] p-5 shadow-lg flex flex-col md:flex-row gap-5 items-center">
              <div className="w-full md:w-52 h-36 rounded-xl overflow-hidden shrink-0 border border-[#222236] relative">
                <img
                  src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80"
                  alt="After Hours"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  SPONSORED · PAID PLACEMENT EXAMPLE
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">
                  After Hours. Fuel your next conversation.
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Late-night coffee, fresh playlists, better conversations.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate?.('After Hours sponsor detail')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-blue-500/20 active:scale-98"
                  >
                    Visit After Hours
                  </button>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 font-mono">
              Illustrative partner concept. Not a claim about an operating merchant.
            </div>
          </div>

          {/* Paid Placement Example 2 */}
          <div className="mb-8">
            <div className="text-xs font-bold text-slate-300 mb-2">
              Paid placement example · Public reading support
            </div>
            <div className="rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] p-5 shadow-lg space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                SPONSORED · AD
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Tonight's sponsor
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                This public reading page is supported by After Hours. Keep the conversation going with a late-night coffee or a fresh playlist.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => onNavigate?.('After Hours sponsor detail')}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline cursor-pointer block text-left"
                >
                  Sponsor detail: After Hours · Clearly separate from the organic chat
                </button>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Where sponsorship belongs.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Public discovery and reading surfaces can include a labeled sponsor card or page-support placement. Private inboxes, private message threads and composers do not include sponsorship. Tonight’s picks remains an organic editorial destination and is not sold as a sponsor endorsement.
            </p>
          </div>

          {/* Section 2 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              What a responsible partnership needs.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provide accurate creative, a clearly identified partner and a useful self-contained destination. No deceptive claims, impersonation or requests for sensitive information. Placement scope, creative review and any commercial terms would be agreed separately; this program preview offers no performance guarantee or confirmed inventory.
            </p>
          </div>

          {/* Section 3 */}
          <div className="py-6 border-b border-[#181824] space-y-2 mb-10">
            <h3 className="text-base font-bold text-white tracking-tight">
              What happens after an inquiry.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              An inquiry starts a discussion about fit, placement and the proposed creative. It is not a commitment to publish or a purchase. The final service would need to explain review, contact and handling details before accepting a live submission. The example at right shows the information needed to start that conversation.
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[300px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* Start a partner conversation card */}
        <div className="p-5 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-lg">
          <h4 className="text-xs font-bold text-white">Start a partner conversation</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Tell us about the idea. This form is an illustrative inquiry state, not a booking or checkout.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0a10] border border-[#202030] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Brand / project
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-[#0a0a10] border border-[#202030] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Work email
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
                Placement interest
              </label>
              <div className="relative">
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full bg-[#0a0a10] border border-[#202030] rounded-xl px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
                >
                  <option value="Discover sponsor card">Discover sponsor card</option>
                  <option value="Public reading support">Public reading support</option>
                  <option value="Topic partner placement">Topic partner placement</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Your idea
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={3}
                className="w-full bg-[#0a0a10] border border-[#202030] rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-[#303045] bg-[#0a0a10] text-blue-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 leading-snug">
                I understand sponsored content is clearly labeled and kept out of private chats.
              </span>
            </label>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-blue-500/20 active:scale-98"
            >
              {submitted ? 'Inquiry sent ✓' : 'Send inquiry'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
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
