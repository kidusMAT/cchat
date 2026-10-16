import React from 'react';
import { Search, Bell, Music, Menu } from 'lucide-react';

interface AfterHoursPageProps {
  onNavigate?: (nav: string, topic?: string) => void;
  onOpenMenu?: () => void;
}

export function AfterHoursPage({ onNavigate, onOpenMenu }: AfterHoursPageProps) {
  const tracks = [
    { title: 'Window seat', desc: 'Soft keys · 03:12' },
    { title: 'Last train home', desc: 'Downtempo · 04:06' },
    { title: 'One more story', desc: 'Warm instrumental · 02:48' },
    { title: 'Lights still on', desc: 'Lo-fi rhythm · 03:35' },
  ];

  const menuItems = [
    { name: 'Nightcap espresso', desc: 'Short, bold, no unnecessary small talk.' },
    { name: 'Midnight oat latte', desc: 'Soft edges. Extra room for a good story.' },
    { name: 'Decaf after dark', desc: 'Keep the ritual. Skip the late-night buzz.' },
  ];

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Scrollable Area */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#09090f]">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#161624] transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">After Hours sponsor detail</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => onNavigate?.('Search')}
              className="sm:hidden p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative w-48 sm:w-64 md:w-80 hidden sm:block">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats, people, plot twists"
                className="w-full bg-[#12121c] border border-[#212130] focus:border-blue-500 rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono bg-[#1c1c2b] px-1.5 py-0.5 rounded border border-[#29293d]">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate?.('Notifications')}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-5 sm:py-7 pb-20 md:pb-7 overflow-y-auto max-w-4xl">
          {/* Hero Banner Card */}
          <div className="relative rounded-3xl overflow-hidden border border-[#232338] min-h-[280px] p-8 flex flex-col justify-end shadow-2xl mb-7 group">
            {/* Background image */}
            <img
              src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80"
              alt="After Hours night cafe"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 brightness-55 contrast-110"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

            {/* Banner content */}
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                SPONSORED · AFTER HOURS
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Fuel your next conversation.
              </h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl">
                Late-night coffee, fresh playlists, better conversations. For the stories that aren’t ready to call it a night.
              </p>
              <div className="text-[10px] text-blue-400/90 font-mono pt-1">
                Illustrative sponsor destination
              </div>
            </div>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {/* Column 1: Menu */}
            <div className="rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] p-6 space-y-4 shadow-lg">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  A little coffee. A little more plot.
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  A sample menu for your next slow evening. No orders or purchases are taken here.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                {menuItems.map((item) => (
                  <div key={item.name} className="space-y-0.5">
                    <div className="text-xs font-bold text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Playlist */}
            <div className="rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] p-6 flex flex-col justify-between shadow-lg">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  The conversation keeps going
                </h3>
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-400 mt-1 mb-4">
                  PLAYLIST PREVIEW · FICTIONAL TRACKS
                </div>

                <div className="space-y-3.5">
                  {tracks.map((track) => (
                    <div key={track.title} className="flex items-start gap-3">
                      <Music className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">{track.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{track.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-3 border-t border-[#181826] mt-4 font-mono">
                A static playlist preview · no audio playback
              </div>
            </div>
          </div>

          {/* Section: Good company for a public read */}
          <div className="space-y-2 mb-7">
            <h3 className="text-base font-bold text-white tracking-tight">
              Good company for a public read.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              After Hours is the illustrative sponsor behind the coffee-and-playlists placement on CCHAT’s public discovery experience. It is not a participant in your chats and does not belong in your private inbox. Organic excerpts and tonight’s curated picks remain separate from this paid placement.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 pb-12 flex items-center gap-3">
            <button
              onClick={() => onNavigate?.('Discover')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-blue-500/20 active:scale-98"
            >
              Back to Discover
            </button>
            <button
              onClick={() => onNavigate?.('Sponsorship / Learn more')}
              className="px-5 py-2.5 rounded-xl bg-[#141422] hover:bg-[#1d1d2f] text-slate-200 border border-[#232338] font-bold text-xs transition-colors cursor-pointer active:scale-98"
            >
              About sponsorship
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-[#09090f] border-l border-[#171722]">
        {/* Sponsored · After Hours Card */}
        <div className="p-5 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 shadow-lg">
          <h4 className="text-xs font-bold text-white">Sponsored · After Hours</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            An illustrative partner concept for late-night coffee and fresh playlists. This is sponsor content, not an organic CCHAT conversation or tonight’s editorial picks.
          </p>
          <div className="pt-1">
            <button
              onClick={() => onNavigate?.('Sponsorship / Learn more')}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline cursor-pointer block text-left"
            >
              Sponsorship / Learn more
            </button>
          </div>
        </div>

        {/* No checkout. Just the idea Card */}
        <div className="p-5 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-2 shadow-lg">
          <h4 className="text-xs font-bold text-white">No checkout. Just the idea.</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The coffee menu and playlist below are sample content. No merchant, purchase flow, external website or playable audio is represented.
          </p>
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
