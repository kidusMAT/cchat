import React, { useState } from 'react';
import {
  Compass,
  Users,
  MessageSquare,
  Bookmark,
  Plus,
  Settings,
  Heart,
  Flame,
  Search,
  Bell,
  MoreHorizontal,
  Share2,
  ArrowDown,
  ArrowUpRight,
  ShieldCheck,
  Edit,
  Smile,
  ArrowUp,
  X,
  Check,
  Lock,
  Globe,
  Eye,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { AboutPage } from './pages/AboutPage';
import { CommunityRulesPage } from './pages/CommunityRulesPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SponsorshipPage } from './pages/SponsorshipPage';
import { AfterHoursPage } from './pages/AfterHoursPage';
import { MyChatsPage } from './pages/MyChatsPage';

// Shared double chat-bubble logo icon
const CchatLogoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    xmlns="http://www.w3.org/2000/svg" className="text-blue-400 stroke-current">
    <rect x="2" y="3" width="14" height="10" rx="3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 13L2 16L6 13" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14V17C8 18.1046 8.89543 19 10 19H17L21 21L20.2 18.2C21.3 17.5 22 16.3 22 15C22 13.8954 21.1046 13 20 13H18"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────
// LEFT SIDEBAR (shared across all views)
// ─────────────────────────────────────────────────────────────
interface SidebarProps {
  activeNav: string;
  onNav: (nav: string) => void;
}

function Sidebar({ activeNav, onNav }: SidebarProps) {
  const navItems = [
    { id: 'Discover', icon: Compass, label: 'Discover' },
    { id: 'Following', icon: Users, label: 'Following' },
    { id: 'My chats', icon: MessageSquare, label: 'My chats', badge: '3' },
    { id: 'Saved', icon: Bookmark, label: 'Saved' },
  ];

  return (
    <aside className="w-[240px] shrink-0 border-r border-[#171722] flex flex-col justify-between p-4 bg-[#09090f] h-full">
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 pt-1 cursor-pointer" onClick={() => onNav('Discover')}>
          <CchatLogoIcon />
          <h1 className="text-xl font-black tracking-tight text-white">CCHAT</h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => onNav(id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                activeNav === id
                  ? 'bg-[#181827] text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-[#12121d]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${activeNav === id && (id === 'My chats' || id === 'Following') ? 'text-blue-400' : ''}`} />
                <span>{label}</span>
              </div>
              {badge && (
                <span className="text-xs bg-[#222235] text-slate-300 font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Start a Chat */}
        <button
          onClick={() => onNav('Start a chat')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Start a chat</span>
        </button>
      </div>

      {/* Bottom card + Profile */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[#11111b] border border-[#1d1d2b]">
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm font-black mb-2">✻</div>
          <h4 className="text-xs font-bold text-white leading-snug">Real chats. Main-character energy.</h4>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">A little less posting. A lot more plot.</p>
        </div>

        <div className="flex items-center justify-between px-2 pt-2 border-t border-[#181824]">
          <div
            onClick={() => onNav('Profile')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Maya Chen"
              className="w-9 h-9 rounded-full object-cover border border-[#2b2b3d]"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Maya Chen</div>
              <div className="text-[11px] text-slate-500 truncate">@mayamaybe</div>
            </div>
          </div>
          <button
            onClick={() => onNav('Account and settings')}
            className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-[#151522] transition-colors cursor-pointer"
            title="Account and settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 1: DISCOVER PAGE
// ─────────────────────────────────────────────────────────────
const CapIcon = () => <span className="text-[13px]">🧢</span>;
const SkullIcon = () => <span className="text-[13px]">💀</span>;

function DiscoverPage({
  onNavigateTab,
  onNavigate,
}: {
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (nav: string, topic?: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'For you' | 'Following' | 'Fresh'>('For you');
  const [saved, setSaved] = useState(false);
  const [reactions, setReactions] = useState({
    m1: { heart: 124, cap: 1200, skull: 486, fire: 82, userReacted: null as string | null },
    m2: { heart: 842, cap: 32, skull: 211, fire: 64, userReacted: 'heart' as string | null },
    m3: { heart: 98, cap: 1800, skull: 920, fire: 143, userReacted: 'cap' as string | null },
    m4: { heart: 215, cap: 48, skull: 2400, fire: 306, userReacted: 'skull' as string | null },
    m5: { heart: 673, cap: 125, skull: 1100, fire: 2100, userReacted: 'fire' as string | null },
    m6: { heart: 1600, cap: 24, skull: 328, fire: 542, userReacted: 'heart' as string | null },
  });

  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n.toString();

  const toggle = (key: keyof typeof reactions, type: 'heart' | 'cap' | 'skull' | 'fire') => {
    setReactions(prev => {
      const c = prev[key];
      const already = c.userReacted === type;
      return { ...prev, [key]: { ...c, [type]: already ? c[type] - 1 : c[type] + 1, userReacted: already ? null : type } };
    });
  };

  const handleTabClick = (tab: 'For you' | 'Following' | 'Fresh') => {
    if (tab === 'Following' && onNavigateTab) {
      onNavigateTab('Following');
    } else {
      setActiveTab(tab);
    }
  };

  const ReactionBar = ({ msgKey, className = '' }: { msgKey: keyof typeof reactions; className?: string }) => {
    const r = reactions[msgKey];
    const types = [
      { type: 'heart' as const, icon: <Heart className="w-3 h-3 fill-current text-rose-400" />, active: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
      { type: 'cap' as const, icon: <CapIcon />, active: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
      { type: 'skull' as const, icon: <SkullIcon />, active: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
      { type: 'fire' as const, icon: <Flame className="w-3 h-3 text-amber-400 fill-current" />, active: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
    ];
    return (
      <div className={`flex items-center gap-1.5 mt-2 ${className}`}>
        {types.map(({ type, icon, active }) => (
          <button key={type} onClick={() => toggle(msgKey, type)}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border transition-colors cursor-pointer ${
              r.userReacted === type ? active : 'bg-[#151522] border-[#232334] text-slate-400 hover:text-white'
            }`}
          >
            {icon}
            <span>{fmt(r[type])}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Feed */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">The plot is public.</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search chats, people, plot twists"
                className="w-full bg-[#12121c] border border-[#212130] focus:border-blue-500 rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono bg-[#1c1c2b] px-1.5 py-0.5 rounded border border-[#29293d]">⌘ K</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-8 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {(['For you', 'Following', 'Fresh'] as const).map(tab => (
              <button key={tab} onClick={() => handleTabClick(tab)}
                className={`text-sm font-bold transition-all relative pb-1 cursor-pointer ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">ONE CHAT. ONE MORE PLOT TWIST.</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 px-8 py-3 overflow-y-auto">
          <article className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl">
            {/* Card Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#181826]">
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Maya" className="w-11 h-11 rounded-full object-cover border-2 border-[#2c2c3e]" />
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">he brought a résumé to a first date.</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">@mayamaybe</span>
                    <span>×</span>
                    <span className="text-slate-400">Anonymous</span>
                    <span>•</span>
                    <span>2h ago</span>
                    <span>•</span>
                    <span className="text-slate-400 font-medium">#dating</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-[#191929] transition-colors cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Status */}
            <div className="py-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>386 reading now</span>
              <span>•</span>
              <span>reactions set the mood</span>
            </div>

            {/* Messages */}
            <div className="space-y-5 py-2">
              {/* 1. Anonymous */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <span>Anonymous</span><ShieldCheck className="w-3 h-3 text-blue-400" />
                </div>
                <div className="flex items-start gap-4">
                  <div className="max-w-[70%]">
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-[#152a48] border border-[#1e3d68] text-slate-100 text-sm font-medium">
                      i brought a résumé to the date.
                    </div>
                    <ReactionBar msgKey="m1" />
                  </div>
                  <div className="pt-2"><span className="text-2xl animate-bounce">🧢</span></div>
                </div>
              </div>

              {/* 2. Maya */}
              <div className="space-y-1.5 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Maya</div>
                <div className="max-w-[70%]">
                  <div className="rounded-2xl rounded-tr-sm px-4 py-3 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium">
                    please tell me this is a metaphor
                  </div>
                  <ReactionBar msgKey="m2" className="justify-end" />
                </div>
              </div>

              {/* 3. Anonymous */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <span>Anonymous</span><ShieldCheck className="w-3 h-3 text-blue-400" />
                </div>
                <div className="max-w-[70%]">
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-[#152a48] border border-[#1e3d68] text-slate-100 text-sm font-medium">
                    two pages. references available on request.
                  </div>
                  <ReactionBar msgKey="m3" />
                </div>
              </div>

              {/* 4. Maya */}
              <div className="space-y-1.5 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Maya</div>
                <div className="flex items-center gap-4 max-w-[70%]">
                  <div className="flex items-center gap-1"><span className="text-2xl animate-pulse">💀</span></div>
                  <div className="flex-1 flex flex-col items-end">
                    <div className="rounded-2xl rounded-tr-sm px-4 py-3 bg-[#1d222e] border border-[#2d3445] text-slate-100 text-sm font-medium">
                      did you at least get the position?
                    </div>
                    <ReactionBar msgKey="m4" className="justify-end" />
                  </div>
                </div>
              </div>

              {/* 5. Anonymous */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <span>Anonymous</span><ShieldCheck className="w-3 h-3 text-blue-400" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="max-w-[70%]">
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-[#382617] border border-[#543b24] text-amber-100 text-sm font-medium">
                      second interview on friday. benefits include pasta.
                    </div>
                    <ReactionBar msgKey="m5" />
                  </div>
                  <div className="pt-2"><span className="text-2xl">🔥</span></div>
                </div>
              </div>

              {/* 6. Maya */}
              <div className="space-y-1.5 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Maya</div>
                <div className="flex items-center gap-4 max-w-[70%]">
                  <div><span className="text-xl">💙</span></div>
                  <div className="flex-1 flex flex-col items-end">
                    <div className="rounded-2xl rounded-tr-sm px-4 py-3 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium">
                      honestly? hired.
                    </div>
                    <ReactionBar msgKey="m6" className="justify-end" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-6 pt-4 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span>18.4k reads</span>
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <SkullIcon /> You reacted
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSaved(!saved)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${saved ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'}`}>
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

          {/* Up Next */}
          <div className="mt-4 p-4 rounded-2xl bg-[#11111c] border border-[#1e1e2d] flex items-center justify-between cursor-pointer hover:bg-[#151524] transition-colors group">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">UP NEXT / ROOMMATE LORE</div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-white mt-0.5">the rent is due. the raccoon is not on the lease.</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-blue-400">
              <span>Scroll to next chat</span>
              <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Sponsored */}
          <div className="mt-6 p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">SPONSORED</span>
              <span className="text-[10px] font-bold text-slate-500 bg-[#171724] px-1.5 py-0.5 rounded border border-[#222232]">Ad</span>
            </div>
            <h4 className="text-sm font-extrabold text-white">Tonight's sponsor</h4>
            <p className="text-xs text-slate-400 leading-relaxed">This Discover page is supported by After Hours. Keep the conversation going with a late-night coffee or a fresh playlist.</p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate && onNavigate('After Hours sponsor detail')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all"
              >
                <span>Visit After Hours</span><ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate && onNavigate('Sponsorship / Learn more')}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[300px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* Hero Promo */}
        <div
          onClick={() => onNavigate && onNavigate("Tonight's picks")}
          className="relative rounded-3xl overflow-hidden aspect-[4/3] border border-[#242436] group cursor-pointer shadow-lg"
        >
          <img src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80" alt="After hours" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75 contrast-125" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 p-5 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-800/50 w-fit">THE AFTER-HOURS EDIT</span>
            <div>
              <h3 className="text-xl font-black text-white leading-tight">Small talk.<br />Big energy.</h3>
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-300 group-hover:text-white mt-2">
                <span>Explore tonight's picks</span><ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Group Chat List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white">In the group chat</h4>
            <button
              onClick={() => onNavigate && onNavigate('Topics directory')}
              className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>View all</span><ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          {[
            { tag: '#dating', desc: 'The bar is in the basement', count: '2.8k chats' },
            { tag: '#roommatelore', desc: 'Shared rent. Unshared brain cell.', count: '1.4k chats' },
            { tag: '#workbesties', desc: 'This meeting could be a chat', count: '986 chats' },
          ].map(item => (
            <div
              key={item.tag}
              onClick={() => onNavigate && onNavigate('Topic detail', item.tag)}
              className="p-3 rounded-2xl bg-[#11111c] border border-[#1e1e2d] hover:border-[#2d2d42] hover:bg-[#141424] transition-all flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-[#1a1a2b] text-slate-400 group-hover:text-blue-400 transition-colors shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">{item.tag}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{item.desc}</div>
                <div className="text-[10px] text-slate-500 mt-1">{item.count}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mood Box */}
        <div className="p-4 rounded-2xl bg-[#11111c] border border-[#1f1f2e] space-y-3">
          <h4 className="text-xs font-extrabold text-white">You set the mood.</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">React to a message. Its most-loved reaction colors the bubble.</p>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { label: 'Heart', icon: <Heart className="w-4 h-4 text-slate-300" /> },
              { label: 'Cap', icon: <span className="text-base">🧢</span> },
              { label: 'Skull', icon: <span className="text-base">💀</span> },
              { label: 'Fire', icon: <span className="text-base">🔥</span> },
            ].map((it, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#161624] border border-[#242436] hover:border-slate-500 transition-colors cursor-pointer">
                {it.icon}
                <span className="text-[10px] font-semibold text-slate-400">{it.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Banner */}
        <div className="p-4 rounded-2xl bg-[#11111c] border border-[#1f1f2e] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Only Maya published this chat. The other participant stays anonymous.</p>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span onClick={() => onNavigate && onNavigate('About CCHAT')} className="hover:underline cursor-pointer">About</span>
            <span>•</span>
            <span onClick={() => onNavigate && onNavigate('Community rules')} className="hover:underline cursor-pointer">Community rules</span>
            <span>•</span>
            <span onClick={() => onNavigate && onNavigate('Privacy')} className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 2: FOLLOWING PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function FollowingPage({ onNavigateTab }: { onNavigateTab?: (tab: string) => void }) {
  const [activeTab, setActiveTab] = useState<'For you' | 'Following' | 'Fresh'>('Following');
  const [savedCard1, setSavedCard1] = useState(false);
  const [savedCard2, setSavedCard2] = useState(false);

  // Reaction counters in story cards
  const [card1Reactions, setCard1Reactions] = useState({
    m1: { heart: 124, cap: 1200, skull: 486, fire: 82 },
    m2: { heart: 842, cap: 41, skull: 495, fire: 91 },
    m3: { heart: 142, cap: 1800, skull: 504, fire: 100 },
    m4: { heart: 151, cap: 59, skull: 2400, fire: 109 },
    m5: { heart: 160, cap: 68, skull: 522, fire: 2100 },
    m6: { heart: 1600, cap: 77, skull: 531, fire: 127 },
  });

  const [card2Reactions, setCard2Reactions] = useState({
    m1: { heart: 124, cap: 1200, skull: 486, fire: 82 },
    m2: { heart: 842, cap: 41, skull: 495, fire: 91 },
  });

  // Following list state
  const [followingUsers, setFollowingUsers] = useState([
    { initials: 'JP', name: 'Jules Park', handle: '@julesjpeg', following: true },
    { initials: 'LM', name: 'Leo Martinez', handle: '@leosays', following: true },
    { initials: 'NP', name: 'Nina Patel', handle: '@ninaknows', following: true },
  ]);

  // Suggested people state
  const [suggestedPeople, setSuggestedPeople] = useState([
    { initials: 'SR', name: 'Sam Rivera', handle: '@samafterdark', chats: '8 public chats', following: false },
    { initials: 'AK', name: 'Alex Kim', handle: '@alexactually', chats: '12 public chats', following: false },
    { initials: 'BT', name: 'Bea Torres', handle: '@beathere', chats: '6 public chats', following: false },
  ]);

  const toggleFollowing = (handle: string) => {
    setFollowingUsers(prev =>
      prev.map(u => (u.handle === handle ? { ...u, following: !u.following } : u))
    );
  };

  const toggleSuggestedFollow = (handle: string) => {
    setSuggestedPeople(prev =>
      prev.map(p => (p.handle === handle ? { ...p, following: !p.following } : p))
    );
  };

  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n.toString();

  const handleTabClick = (tab: 'For you' | 'Following' | 'Fresh') => {
    if (tab !== 'Following' && onNavigateTab) {
      onNavigateTab(tab);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Feed */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">Following</h2>
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
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 px-8 py-5 overflow-y-auto space-y-6">
          {/* Section Hero */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">YOUR FEED</span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1.5 leading-tight">Good people. Great plot.</h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Public conversations from the people you follow. Private chats stay off the feed.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-[#171722] pb-2 text-sm">
            {(['For you', 'Following', 'Fresh'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`font-bold transition-all relative pb-2 cursor-pointer ${
                  activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* STORY CARD 1: "we said one drink." */}
          <article className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#181828] border border-[#25253a] flex items-center justify-center font-bold text-xs text-slate-300">
                  JU
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">we said one drink.</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">@julesjpeg</span>
                    <span>×</span>
                    <span className="text-slate-400">Anonymous</span>
                    <span>·</span>
                    <span>42m ago</span>
                    <span>·</span>
                    <span className="text-slate-400 font-medium">#dating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reading now indicator */}
            <div className="py-2 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              <span>386 reading now · reactions set the mood</span>
            </div>

            {/* Message Sequence */}
            <div className="space-y-4 py-2">
              {/* Msg 1 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-[68%]">
                    we said one drink
                  </div>
                  <span className="text-xl">🗨️</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ 124</span>
                  <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 {fmt(card1Reactions.m1.cap)}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 486</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 82</span>
                </div>
              </div>

              {/* Msg 2 — Jules */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Jules</div>
                <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                  this is still the same evening
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ 842</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 41</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 495</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 91</span>
                </div>
              </div>

              {/* Msg 3 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-[68%]">
                  it is saturday
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ 142</span>
                  <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 {fmt(card1Reactions.m3.cap)}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 504</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 100</span>
                </div>
              </div>

              {/* Msg 4 — Jules with skull floating on left */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Jules</div>
                <div className="flex items-center gap-3 w-full justify-end">
                  <span className="text-2xl mr-auto pl-4">💀</span>
                  <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#1d222e] border border-[#2d3445] text-slate-100 text-sm font-medium w-[68%]">
                    a technicality
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ 151</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 59</span>
                  <span className="flex items-center gap-1 text-purple-400 font-bold">💀 {fmt(card1Reactions.m4.skull)}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 109</span>
                </div>
              </div>

              {/* Msg 5 — Anonymous with fire floating on right */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#382617] border border-[#543b24] text-amber-100 text-sm font-medium w-[68%]">
                    why is there a karaoke receipt
                  </div>
                  <span className="text-xl">🔥</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ 160</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 68</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 522</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">🔥 {fmt(card1Reactions.m5.fire)}</span>
                </div>
              </div>

              {/* Msg 6 — Jules with heart floating on left */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Jules</div>
                <div className="flex items-center gap-3 w-full justify-end">
                  <span className="text-xl mr-auto pl-8">💖</span>
                  <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                    because we invested in the arts.
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ {fmt(card1Reactions.m6.heart)}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 77</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 531</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 127</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-4 pt-4 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
              <span>4.8k reads · Public excerpt · Read & react only</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSavedCard1(!savedCard1)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    savedCard1 ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

          {/* STORY CARD 2: "our out-of-office replies are talking." */}
          <article className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#181828] border border-[#25253a] flex items-center justify-center font-bold text-xs text-slate-300">
                  LE
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">our out-of-office replies are talking.</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">@leosays</span>
                    <span>×</span>
                    <span className="text-slate-400">Anonymous</span>
                    <span>·</span>
                    <span>12m ago</span>
                    <span>·</span>
                    <span className="text-slate-400 font-medium">#workbesties</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Sequence */}
            <div className="space-y-4 py-2">
              {/* Msg 1 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-[68%]">
                  my auto-reply emailed your auto-reply
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ 124</span>
                  <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 {fmt(card2Reactions.m1.cap)}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 486</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 82</span>
                </div>
              </div>

              {/* Msg 2 — Leo */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Leo</div>
                <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                  finally someone is networking
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ 842</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 41</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 495</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 91</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-4 pt-4 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
              <span>1.3k reads · Public excerpt · Read & react only</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSavedCard2(!savedCard2)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    savedCard2 ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

          {/* End of Feed caption */}
          <div className="text-center py-4 text-xs text-slate-500 font-medium">
            You're caught up with the people you follow. Suggested people are ready when you are.
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[320px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* Card 1: Your people · 24 following */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight">Your people · 24 following</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Manage who appears in this feed.</p>
          </div>

          <div className="space-y-3">
            {followingUsers.map(user => (
              <div key={user.handle} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#181828] border border-[#27273d] flex items-center justify-center font-bold text-[11px] text-slate-300">
                    {user.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-snug">{user.name}</div>
                    <div className="text-[10px] text-slate-500">{user.handle}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollowing(user.handle)}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>{user.following ? 'Following' : 'Follow'}</span>
                  {user.following && <Check className="w-3 h-3 stroke-[2.5]" />}
                </button>
              </div>
            ))}
          </div>

          <div className="pt-1 border-t border-[#181826]">
            <button className="text-xs text-blue-400 hover:underline font-semibold cursor-pointer">
              Following list · manage here
            </button>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              Select Following to unfollow. Their private chats are never included.
            </p>
          </div>
        </div>

        {/* Card 2: People you might like */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight">People you might like</h4>
          </div>

          <div className="space-y-3.5">
            {suggestedPeople.map(person => (
              <div key={person.handle} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#181828] border border-[#27273d] flex items-center justify-center font-bold text-[11px] text-slate-300">
                    {person.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-snug">{person.name}</div>
                    <div className="text-[10px] text-slate-500">{person.handle} · {person.chats}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleSuggestedFollow(person.handle)}
                  className={`text-xs font-semibold cursor-pointer transition-colors ${
                    person.following ? 'text-blue-400' : 'text-blue-400 hover:text-blue-300'
                  }`}
                >
                  {person.following ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Public chat. Private identity */}
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              You only see excerpts these people have chosen to publish. Anonymous participants remain anonymous.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Community rules</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 3: MY CHATS PAGE (Imported from ./pages/MyChatsPage)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// VIEW 4: SAVED PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function SavedPage() {
  const [activeCollection, setActiveCollection] = useState<'All saved' | 'Plot twists' | 'Date night lore' | 'Office survival'>('All saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCollectionName, setEditingCollectionName] = useState('Plot twists');

  // Checkboxes in "Save to collection" sidebar
  const [collectionsCheck, setCollectionsCheck] = useState({
    allSaved: true,
    plotTwists: true,
    dateNightLore: false,
  });

  // Story Cards state
  const [cards, setCards] = useState([
    {
      id: 'c1',
      title: 'he brought a résumé to a first date.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      handle: '@mayamaybe',
      withWhom: 'Anonymous',
      time: '2h ago',
      tag: '#dating',
      reads: '18.4k reads',
      saved: true,
      senderLabel: 'Maya',
      msg1: 'i brought a résumé to the date.',
      msg2: 'please tell me this is a metaphor',
      rx1: { heart: 124, cap: 1200, skull: 486, fire: 82 },
      rx2: { heart: 842, cap: 41, skull: 495, fire: 91 },
    },
    {
      id: 'c2',
      title: 'the deck has 94 slides.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      handle: '@mayamaybe',
      withWhom: 'Anonymous',
      time: '3h ago',
      tag: '#workbesties',
      reads: '9.1k reads',
      saved: true,
      senderLabel: 'Maya',
      msg1: 'the deck has 94 slides',
      msg2: 'is the presentation a hostage situation',
      rx1: { heart: 124, cap: 1200, skull: 486, fire: 82 },
      rx2: { heart: 842, cap: 41, skull: 495, fire: 91 },
    },
    {
      id: 'c3',
      title: 'we made a custody schedule for the air fryer.',
      initials: 'JU',
      handle: '@julesjpeg',
      withWhom: 'Anonymous',
      time: '1m ago',
      tag: '#roommatelore',
      reads: '246 reads',
      saved: true,
      senderLabel: 'Jules',
      msg1: 'i need the air fryer on thursday',
      msg2: 'thursday is my crispy day',
      rx1: { heart: 124, cap: 1200, skull: 486, fire: 82 },
      rx2: { heart: 842, cap: 41, skull: 495, fire: 91 },
    },
  ]);

  const toggleSaveCard = (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, saved: !c.saved } : c));
  };

  const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n.toString());

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Feed */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">Saved</h2>
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
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 px-8 py-5 overflow-y-auto space-y-6">
          {/* Section Hero */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">YOUR LIBRARY · PRIVATE</span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1.5 leading-tight">Worth another read.</h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              12 saved public chats. Your collection is visible only to you.
            </p>
          </div>

          {/* Search Saved Chats Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Search saved chats</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search titles, topics or publishers"
              className="w-full bg-[#10101a] border border-[#1f1f2e] focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Pills / Tabs */}
          <div className="flex items-center gap-2 border-b border-[#171722] pb-3 text-xs">
            {(['All saved', 'Plot twists', 'Date night lore', 'Office survival'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveCollection(tab)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                  activeCollection === tab
                    ? 'bg-[#181827] text-white border border-[#2a2a3e]'
                    : 'text-slate-400 hover:text-white hover:bg-[#131320]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Story Card 1: "he brought a résumé to a first date." */}
          <article className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={cards[0].avatarUrl}
                  alt="Maya"
                  className="w-10 h-10 rounded-full object-cover border border-[#2b2b3d]"
                />
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">{cards[0].title}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">{cards[0].handle}</span>
                    <span>×</span>
                    <span className="text-slate-400">{cards[0].withWhom}</span>
                    <span>·</span>
                    <span>{cards[0].time}</span>
                    <span>·</span>
                    <span className="text-slate-400 font-medium">{cards[0].tag}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 py-1">
              {/* Msg 1 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-[68%]">
                  {cards[0].msg1}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ {cards[0].rx1.heart}</span>
                  <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 {fmt(cards[0].rx1.cap)}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 {cards[0].rx1.skull}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 {cards[0].rx1.fire}</span>
                </div>
              </div>

              {/* Msg 2 — Maya */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">{cards[0].senderLabel}</div>
                <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                  {cards[0].msg2}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ {cards[0].rx2.heart}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 {cards[0].rx2.cap}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 {cards[0].rx2.skull}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 {cards[0].rx2.fire}</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
              <span>{cards[0].reads} · Public excerpt · Read & react only</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSaveCard(cards[0].id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    cards[0].saved ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'
                  }`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

          {/* Context sub-tag banner under Card 1 */}
          <div className="text-[11px] text-slate-500 flex items-center gap-2 pl-2">
            <span>Saved today · Plot twists · Collection menu open</span>
          </div>

          {/* Story Card 2: "the deck has 94 slides." */}
          <article className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={cards[1].avatarUrl}
                  alt="Maya"
                  className="w-10 h-10 rounded-full object-cover border border-[#2b2b3d]"
                />
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">{cards[1].title}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">{cards[1].handle}</span>
                    <span>×</span>
                    <span className="text-slate-400">{cards[1].withWhom}</span>
                    <span>·</span>
                    <span>{cards[1].time}</span>
                    <span>·</span>
                    <span className="text-slate-400 font-medium">{cards[1].tag}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 py-1">
              {/* Msg 1 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-[68%]">
                  {cards[1].msg1}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ {cards[1].rx1.heart}</span>
                  <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 {fmt(cards[1].rx1.cap)}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 {cards[1].rx1.skull}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 {cards[1].rx1.fire}</span>
                </div>
              </div>

              {/* Msg 2 — Maya */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">{cards[1].senderLabel}</div>
                <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                  {cards[1].msg2}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ {cards[1].rx2.heart}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 {cards[1].rx2.cap}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 {cards[1].rx2.skull}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 {cards[1].rx2.fire}</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
              <span>{cards[1].reads} · Public excerpt · Read & react only</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSaveCard(cards[1].id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    cards[1].saved ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'
                  }`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

          {/* Story Card 3: "we made a custody schedule for the air fryer." */}
          <article className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#181828] border border-[#25253a] flex items-center justify-center font-bold text-xs text-slate-300">
                  {cards[2].initials}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">{cards[2].title}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">{cards[2].handle}</span>
                    <span>×</span>
                    <span className="text-slate-400">{cards[2].withWhom}</span>
                    <span>·</span>
                    <span>{cards[2].time}</span>
                    <span>·</span>
                    <span className="text-slate-400 font-medium">{cards[2].tag}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 py-1">
              {/* Msg 1 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-[68%]">
                  {cards[2].msg1}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ {cards[2].rx1.heart}</span>
                  <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 {fmt(cards[2].rx1.cap)}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 {cards[2].rx1.skull}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 {cards[2].rx1.fire}</span>
                </div>
              </div>

              {/* Msg 2 — Jules */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">{cards[2].senderLabel}</div>
                <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                  {cards[2].msg2}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ {cards[2].rx2.heart}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 {cards[2].rx2.cap}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 {cards[2].rx2.skull}</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 {cards[2].rx2.fire}</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
              <span>{cards[2].reads} · Public excerpt · Read & react only</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSaveCard(cards[2].id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    cards[2].saved ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'
                  }`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[320px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* Card 1: Your collections */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Your collections</h4>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-blue-400 font-bold cursor-pointer">
              <span>All saved</span>
              <span>12</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 hover:text-white font-medium cursor-pointer">
              <span>Plot twists</span>
              <span className="text-slate-500">7</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 hover:text-white font-medium cursor-pointer">
              <span>Date night lore</span>
              <span className="text-slate-500">3</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 hover:text-white font-medium cursor-pointer">
              <span>Office survival</span>
              <span className="text-slate-500">2</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#181826]">
            <label className="text-[11px] font-semibold text-slate-400">Collection name</label>
            <input
              type="text"
              value={editingCollectionName}
              onChange={e => setEditingCollectionName(e.target.value)}
              className="w-full bg-[#12121d] border border-[#1e1e2d] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
              Private collection · only you can see this name.
            </p>
            <button className="text-[11px] text-blue-400 hover:underline font-semibold cursor-pointer pt-1 block">
              Rename collection · Save changes
            </button>
          </div>
        </div>

        {/* Card 2: Save to collection */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Save to collection</h4>

          <div className="space-y-2.5 text-xs">
            <button
              onClick={() => setCollectionsCheck(prev => ({ ...prev, allSaved: !prev.allSaved }))}
              className="w-full flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
            >
              {collectionsCheck.allSaved && <Check className="w-3.5 h-3.5 text-blue-400 stroke-[2.5]" />}
              <span className={collectionsCheck.allSaved ? 'text-blue-400 font-semibold' : ''}>All saved</span>
            </button>

            <button
              onClick={() => setCollectionsCheck(prev => ({ ...prev, plotTwists: !prev.plotTwists }))}
              className="w-full flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
            >
              {collectionsCheck.plotTwists && <Check className="w-3.5 h-3.5 text-blue-400 stroke-[2.5]" />}
              <span className={collectionsCheck.plotTwists ? 'text-blue-400 font-semibold' : ''}>Plot twists</span>
            </button>

            <button
              onClick={() => setCollectionsCheck(prev => ({ ...prev, dateNightLore: !prev.dateNightLore }))}
              className="w-full flex items-center gap-2 text-slate-400 hover:text-white cursor-pointer pl-5.5"
            >
              <span>Date night lore</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#181826]">
            <button className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
              Remove from saved
            </button>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              Collections are visible only to you.
            </p>
          </div>
        </div>

        {/* Card 3: Saved, not shared */}
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Saved, not shared.</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Saving a public chat doesn't publish anything or notify the participants. If an excerpt is removed, it will no longer be readable here.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Community rules</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 5: START A CHAT PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function StartChatPage({ onNavigate }: { onNavigate?: (nav: string) => void }) {
  const [searchRecipient, setSearchRecipient] = useState('Jules');
  const [selectedRecipient, setSelectedRecipient] = useState<{
    initials: string;
    name: string;
    handle: string;
    subtext: string;
  } | null>({
    initials: 'JP',
    name: 'Jules Park',
    handle: '@julesjpeg',
    subtext: 'Selected recipient',
  });

  const [messageText, setMessageText] = useState('Are we still pretending Friday is going to be one drink?');
  const [keepPrivate, setKeepPrivate] = useState(true);

  const recentPeople = [
    { initials: 'JP', name: 'Jules Park', handle: '@julesjpeg', isSelected: true },
    { initials: 'LM', name: 'Leo Martinez', handle: '@leosays', isSelected: false },
    { initials: 'NP', name: 'Nina Patel', handle: '@ninaknows', isSelected: false },
    { initials: 'SR', name: 'Sam Rivera', handle: '@samafterdark', isSelected: false },
  ];

  const handleSelectPerson = (person: { initials: string; name: string; handle: string }) => {
    setSelectedRecipient({
      initials: person.initials,
      name: person.name,
      handle: person.handle,
      subtext: 'Selected recipient',
    });
    setSearchRecipient(person.name.split(' ')[0]);
  };

  const handleSend = () => {
    if (onNavigate) {
      onNavigate('My chats');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0a0a0f] overflow-y-auto">
      {/* Top Header */}
      <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-xl font-bold text-white tracking-tight">Start a chat</h2>
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
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-8 max-w-6xl space-y-6">
        {/* Section Header */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">PRIVATE MESSAGES</span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1.5 leading-tight">The plot starts with a hello.</h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Find someone by name or handle. Your first message is private, not a public post.
          </p>
        </div>

        {/* 2-Column Form Layout */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Column: Recipient search & Recent people */}
          <div className="col-span-5 space-y-4">
            {/* Card: To */}
            <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 shadow-xl">
              <h4 className="text-sm font-extrabold text-white">To</h4>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Name or @handle</label>
                <input
                  type="text"
                  value={searchRecipient}
                  onChange={e => setSearchRecipient(e.target.value)}
                  placeholder="Search name or handle"
                  className="w-full bg-[#12121d] border border-[#222236] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="text-[11px] text-slate-500 font-medium">1 matching person</div>

              {/* Matched person card */}
              <div
                onClick={() => handleSelectPerson({ initials: 'JP', name: 'Jules Park', handle: '@julesjpeg' })}
                className="p-3 rounded-2xl bg-[#141422] border border-[#232338] flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1a1a2c] border border-[#282840] flex items-center justify-center font-bold text-[11px] text-slate-300">
                    JP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Jules Park</div>
                    <div className="text-[10px] text-slate-400">@julesjpeg · You follow each other</div>
                  </div>
                </div>
                <div className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                  <span>Selected</span>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Card: Recent people */}
            <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-xl">
              <h4 className="text-sm font-extrabold text-white">Recent people</h4>
              <div className="space-y-3">
                {recentPeople.map(p => (
                  <div
                    key={p.handle}
                    onClick={() => handleSelectPerson(p)}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#161626] border border-[#232338] flex items-center justify-center font-bold text-[11px] text-slate-300 group-hover:border-blue-500 transition-colors">
                        {p.initials}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{p.name}</div>
                        <div className="text-[10px] text-slate-500">{p.handle}</div>
                      </div>
                    </div>
                    {p.isSelected ? (
                      <Check className="w-3.5 h-3.5 text-blue-400 stroke-[2.5]" />
                    ) : (
                      <span className="text-slate-500 group-hover:text-blue-400 text-sm font-bold leading-none">+</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Shield Notice under Left Column */}
            <div className="flex items-start gap-3 p-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">A message, not an invite to a feed.</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  A recipient can choose whether to reply. Readers of your public chats cannot join this conversation.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Recipient Banner + Say Something + Privacy Card */}
          <div className="col-span-7 space-y-4">
            {/* Selected Recipient Card */}
            {selectedRecipient && (
              <div className="p-4 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#18182a] border border-[#27273f] flex items-center justify-center font-bold text-xs text-slate-300">
                    {selectedRecipient.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{selectedRecipient.name}</h4>
                    <p className="text-[10px] text-slate-500">{selectedRecipient.handle} · {selectedRecipient.subtext}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecipient(null)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  Remove ×
                </button>
              </div>
            )}

            {/* Say something Card */}
            <div className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-extrabold text-white">Say something</h3>
                <label className="text-[11px] font-semibold text-slate-400 block mt-3">First message</label>
              </div>

              <textarea
                rows={4}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Write your message..."
                className="w-full bg-[#0a0a10] border border-[#1e1e2d] focus:border-blue-500 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                    <span className="font-bold">+</span>
                    <span>Attachment</span>
                  </button>
                  <span>·</span>
                  <button className="hover:text-white transition-colors cursor-pointer">
                    Emoji
                  </button>
                </div>

                <button
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer active:scale-98"
                >
                  Send private message
                </button>
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                Only Jules will receive this. Nothing is published.
              </p>
            </div>

            {/* Your privacy, before you hit send Card */}
            <div className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-xl">
              <h4 className="text-sm font-extrabold text-white">Your privacy, before you hit send</h4>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white">Private by default</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    This starts a normal private conversation. Publication is a separate choice: select a message excerpt and review its public identity preview.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pl-8">
                If only one participant publishes, the other stays anonymous. Both names, handles and photos appear only when both publish.
              </p>

              <div className="pt-1 pl-8">
                <button
                  onClick={() => setKeepPrivate(!keepPrivate)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {keepPrivate && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  <span>Keep new messages private</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 6: SEARCH PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function SearchPage({ onNavigate }: { onNavigate?: (nav: string) => void }) {
  const [query, setQuery] = useState('roommate');
  const [activeFilterTab, setActiveFilterTab] = useState<'All' | 'Public chats' | 'People' | 'Topics'>('All');
  const [sortBy, setSortBy] = useState('Most relevant');
  const [publishedFilter, setPublishedFilter] = useState('Any time');
  const [topicFilter, setTopicFilter] = useState('All topics');

  const [savedCards, setSavedCards] = useState<{ [key: string]: boolean }>({
    c1: false,
    c2: false,
  });

  const [followedPeople, setFollowedPeople] = useState<{ [key: string]: boolean }>({
    JP: false,
    NP: false,
  });

  const toggleSave = (id: string) => {
    setSavedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFollow = (id: string) => {
    setFollowedPeople(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const recentSearches = ['roommate', '@mayamaybe', 'first date'];

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Feed */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">Search</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search chats, people, plot twists"
                className="w-full bg-[#12121c] border border-[#212130] focus:border-blue-500 rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono bg-[#1c1c2b] px-1.5 py-0.5 rounded border border-[#29293d]">⌘ K</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 px-8 py-5 overflow-y-auto space-y-6">
          {/* Section Hero */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">PUBLIC SEARCH</span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1.5 leading-tight">Find your next plot twist.</h1>
          </div>

          {/* Search Input Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Search chats, people and topics</label>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#0d0d16] border border-[#1f1f2e] focus:border-blue-500 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none transition-colors"
            />
            <div className="text-[11px] text-slate-500 pt-1">18 public chats · 2 people · 1 topic</div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-6 border-b border-[#171722] pb-2 text-xs font-bold">
            {(['All', 'Public chats', 'People', 'Topics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilterTab(tab)}
                className={`transition-colors cursor-pointer pb-2 relative ${
                  activeFilterTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
                {activeFilterTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* Topic Match Card */}
          <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-2 shadow-xl">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Topic match</div>
            <h3 className="text-base font-extrabold text-blue-400">#roommatelore</h3>
            <p className="text-xs text-slate-400">Shared rent. Unshared brain cell. · 1.4k public chats</p>
          </div>

          {/* Story Card 1: "the rent is due. the raccoon is not on the lease." */}
          <article className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Maya"
                  className="w-10 h-10 rounded-full object-cover border border-[#2b2b3d]"
                />
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">the rent is due. the raccoon is not on the lease.</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">@mayamaybe</span>
                    <span>×</span>
                    <span className="text-slate-400">Anonymous</span>
                    <span>·</span>
                    <span>18m ago</span>
                    <span>·</span>
                    <span className="text-slate-400 font-medium">#roommatelore</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 py-1">
              {/* Msg 1 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-[68%]">
                  who adopted a raccoon
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ 124</span>
                  <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 1.2k</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 486</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 82</span>
                </div>
              </div>

              {/* Msg 2 — Maya */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Maya</div>
                <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                  nobody adopted him. he chose us.
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ 842</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 41</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 495</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 91</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
              <span>6.2k reads · Public excerpt · Read & react only</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSave('c1')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    savedCards.c1 ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

          {/* Story Card 2: "we made a custody schedule for the air fryer." */}
          <article className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#181828] border border-[#25253a] flex items-center justify-center font-bold text-xs text-slate-300">
                  JU
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">we made a custody schedule for the air fryer.</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">@julesjpeg</span>
                    <span>×</span>
                    <span className="text-slate-400">Anonymous</span>
                    <span>·</span>
                    <span>1m ago</span>
                    <span>·</span>
                    <span className="text-slate-400 font-medium">#roommatelore</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 py-1">
              {/* Msg 1 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-[68%]">
                  i need the air fryer on thursday
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ 124</span>
                  <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 1.2k</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 486</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 82</span>
                </div>
              </div>

              {/* Msg 2 — Jules */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Jules</div>
                <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                  thursday is my crispy day
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ 842</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 41</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 495</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 91</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
              <span>246 reads · Public excerpt · Read & react only</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSave('c2')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    savedCards.c2 ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

          {/* People · public profiles Card */}
          <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 shadow-xl">
            <h4 className="text-sm font-extrabold text-white">People · public profiles</h4>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#181828] border border-[#27273d] flex items-center justify-center font-bold text-[11px] text-slate-300">
                    JP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Jules Park</div>
                    <div className="text-[10px] text-slate-500">@julesjpeg · Roommate lore & bad plans</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow('JP')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  {followedPeople.JP ? 'Following' : 'Follow'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#181828] border border-[#27273d] flex items-center justify-center font-bold text-[11px] text-slate-300">
                    NP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Nina Patel</div>
                    <div className="text-[10px] text-slate-500">@ninaknows · The roommate with the label maker</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow('NP')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  {followedPeople.NP ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          </div>

          <div className="text-center py-2 text-xs text-slate-500">
            Showing the closest matches. Anonymous participants have no profile result.
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[320px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* Card 1: Refine results */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Refine results</h4>

          {/* Sort by */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Sort by</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full appearance-none bg-[#12121d] border border-[#1e1e2d] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer pr-8"
              >
                <option value="Most relevant">Most relevant</option>
                <option value="Latest">Latest</option>
                <option value="Most reads">Most reads</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Published */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Published</label>
            <div className="relative">
              <select
                value={publishedFilter}
                onChange={e => setPublishedFilter(e.target.value)}
                className="w-full appearance-none bg-[#12121d] border border-[#1e1e2d] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer pr-8"
              >
                <option value="Any time">Any time</option>
                <option value="Past 24 hours">Past 24 hours</option>
                <option value="Past week">Past week</option>
                <option value="Past month">Past month</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Topic</label>
            <div className="relative">
              <select
                value={topicFilter}
                onChange={e => setTopicFilter(e.target.value)}
                className="w-full appearance-none bg-[#12121d] border border-[#1e1e2d] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer pr-8"
              >
                <option value="All topics">All topics</option>
                <option value="#roommatelore">#roommatelore</option>
                <option value="#dating">#dating</option>
                <option value="#workbesties">#workbesties</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={() => {
                setSortBy('Most relevant');
                setPublishedFilter('Any time');
                setTopicFilter('All topics');
              }}
              className="text-xs text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        </div>

        {/* Card 2: Recent searches */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Recent searches</h4>

          <div className="space-y-2.5 text-xs text-slate-300">
            {recentSearches.map(term => (
              <div
                key={term}
                onClick={() => setQuery(term)}
                className="hover:text-blue-400 cursor-pointer transition-colors"
              >
                {term}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#181826]">
            <button className="text-xs text-blue-400 hover:underline font-semibold cursor-pointer">
              Clear search history
            </button>
          </div>
        </div>

        {/* Card 3: Search what's public */}
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Search what's public.</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Results include published excerpts, public profiles and topics. Private conversations and anonymous identities are not searchable here.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Community rules</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 7: NOTIFICATIONS PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function NotificationsPage({ onNavigate }: { onNavigate?: (nav: string) => void }) {
  const [activeTab, setActiveTab] = useState<'All activity' | 'Unread' | 'Reactions' | 'Follows'>('All activity');
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      section: 'TODAY',
      iconType: 'skull',
      title: 'Your punchline has a crowd.',
      desc: '128 readers reacted to "did you at least get the position?" · The interview',
      time: '4m ago',
      isUnread: true,
      category: 'Reactions',
    },
    {
      id: 'n2',
      section: 'TODAY',
      iconType: 'initials',
      initials: 'SR',
      title: 'Sam Rivera followed you.',
      desc: '@samafterdark can see the chats you publish, not your private inbox.',
      time: '18m ago',
      isUnread: true,
      category: 'Follows',
    },
    {
      id: 'n3',
      section: 'TODAY',
      iconType: 'arrow-up-right',
      title: 'Your excerpt is public.',
      desc: '"the deck has 94 slides." · 6 messages · Other participant stays Anonymous.',
      time: '3h ago',
      isUnread: true,
      category: 'Publication',
    },
    {
      id: 'n4',
      section: 'TODAY',
      iconType: 'heart',
      title: '842 hearts for a very fair question.',
      desc: '"please tell me this is a metaphor" · The interview',
      time: '3h ago',
      isUnread: false,
      category: 'Reactions',
    },
    {
      id: 'n5',
      section: 'EARLIER',
      iconType: 'initials',
      initials: 'LM',
      title: 'Leo Martinez followed you.',
      desc: '@leosays · Your public profile has a new reader.',
      time: 'Yesterday',
      isUnread: false,
      category: 'Follows',
    },
    {
      id: 'n6',
      section: 'EARLIER',
      iconType: 'fire',
      title: 'The pasta benefits are getting attention.',
      desc: '"second interview on friday. benefits include pasta." · 2.1k fire reactions',
      time: 'Yesterday',
      isUnread: false,
      category: 'Reactions',
    },
    {
      id: 'n7',
      section: 'EARLIER',
      iconType: 'check',
      title: 'Publication removed.',
      desc: '"the lift is broken again." is no longer on your public profile. The private chat stays.',
      time: '2 days ago',
      isUnread: false,
      category: 'Publication',
    },
  ]);

  const [toggles, setToggles] = useState({
    reactions: true,
    newFollowers: true,
    publicationEvents: true,
  });

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Unread') return n.isUnread;
    if (activeTab === 'Reactions') return n.category === 'Reactions';
    if (activeTab === 'Follows') return n.category === 'Follows';
    return true;
  });

  const todayList = filteredNotifications.filter(n => n.section === 'TODAY');
  const earlierList = filteredNotifications.filter(n => n.section === 'EARLIER');

  const renderIcon = (n: typeof notifications[0]) => {
    if (n.iconType === 'skull') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#141420] border border-[#222234] flex items-center justify-center text-lg">
          💀
        </div>
      );
    }
    if (n.iconType === 'heart') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#141420] border border-[#222234] flex items-center justify-center text-lg text-blue-400">
          💙
        </div>
      );
    }
    if (n.iconType === 'fire') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#141420] border border-[#222234] flex items-center justify-center text-lg">
          🔥
        </div>
      );
    }
    if (n.iconType === 'arrow-up-right') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#141420] border border-[#222234] flex items-center justify-center text-slate-300">
          <ArrowUpRight className="w-5 h-5 text-blue-400" />
        </div>
      );
    }
    if (n.iconType === 'check') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#141420] border border-[#222234] flex items-center justify-center text-slate-300">
          <Check className="w-4 h-4 stroke-[2.5]" />
        </div>
      );
    }
    if (n.iconType === 'initials') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#181828] border border-[#27273d] flex items-center justify-center font-bold text-xs text-slate-300">
          {n.initials}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Feed */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">Notifications</h2>
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
            <button className="p-2 text-blue-400 hover:text-white rounded-full bg-[#161624] transition-colors cursor-pointer relative">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 px-8 py-5 overflow-y-auto space-y-6">
          {/* Section Hero */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">YOUR ACTIVITY</span>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1.5 leading-tight">The plot found its people.</h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                3 unread updates. Reactions, new follows and publication changes.
              </p>
            </div>
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-xl bg-[#141422] border border-[#222234] hover:bg-[#1a1a2b] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Mark all read
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-6 border-b border-[#171722] pb-2 text-xs font-bold">
            {(['All activity', 'Unread', 'Reactions', 'Follows'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-colors cursor-pointer pb-2 relative ${
                  activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* TODAY Group */}
          {todayList.length > 0 && (
            <div className="space-y-3">
              <div className="text-[10px] font-black tracking-wider text-cyan-400 uppercase font-mono">TODAY</div>
              <div className="space-y-3">
                {todayList.map(n => (
                  <div
                    key={n.id}
                    className="p-4 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] flex items-center justify-between hover:border-[#2d2d42] transition-colors cursor-pointer shadow-lg"
                  >
                    <div className="flex items-center gap-3.5">
                      {renderIcon(n)}
                      <div>
                        <h4 className="text-xs font-bold text-white">{n.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.desc}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                    {n.isUnread && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shrink-0"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EARLIER Group */}
          {earlierList.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-[10px] font-black tracking-wider text-slate-500 uppercase font-mono">EARLIER</div>
              <div className="space-y-3">
                {earlierList.map(n => (
                  <div
                    key={n.id}
                    className="p-4 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] flex items-center justify-between hover:border-[#2d2d42] transition-colors cursor-pointer shadow-lg"
                  >
                    <div className="flex items-center gap-3.5">
                      {renderIcon(n)}
                      <div>
                        <h4 className="text-xs font-bold text-white">{n.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.desc}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                    {n.isUnread && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shrink-0"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[320px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* Card 1: Notification settings */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 shadow-xl">
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight">Notification settings</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Quick preferences. All account controls are in Account and settings.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {/* Toggle 1: Reactions */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Reactions</div>
                <div className="text-[10px] text-slate-500">Activity on your public messages</div>
              </div>
              <button
                onClick={() => setToggles(t => ({ ...t, reactions: !t.reactions }))}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  toggles.reactions ? 'bg-blue-600' : 'bg-[#1e1e2d]'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    toggles.reactions ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: New followers */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">New followers</div>
                <div className="text-[10px] text-slate-500">People following your profile</div>
              </div>
              <button
                onClick={() => setToggles(t => ({ ...t, newFollowers: !t.newFollowers }))}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  toggles.newFollowers ? 'bg-blue-600' : 'bg-[#1e1e2d]'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    toggles.newFollowers ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Publication events */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Publication events</div>
                <div className="text-[10px] text-slate-500">Changes to your excerpts</div>
              </div>
              <button
                onClick={() => setToggles(t => ({ ...t, publicationEvents: !t.publicationEvents }))}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  toggles.publicationEvents ? 'bg-blue-600' : 'bg-[#1e1e2d]'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    toggles.publicationEvents ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#181826]">
            <button
              onClick={() => onNavigate && onNavigate('Account and settings')}
              className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Account and settings</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Card 2: Private stays private */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-2 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Private stays private</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Activity on public excerpts belongs here. Message content in your private chats belongs in My chats.
          </p>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Community rules</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 8: PROFILE PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function ProfilePage({ onNavigate }: { onNavigate?: (nav: string) => void }) {
  const [activeTab, setActiveTab] = useState<'Published chats' | 'About Maya'>('Published chats');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bio, setBio] = useState('A little less posting. A lot more plot.');

  const [cards, setCards] = useState([
    {
      id: 'p1',
      title: 'he brought a résumé to a first date.',
      time: '2h ago',
      tag: '#dating',
      reads: '18.4k reads',
      saved: false,
      msg1: 'i brought a résumé to the date.',
      msg2: 'please tell me this is a metaphor',
      rx1: { heart: 124, cap: '1.2k', skull: 486, fire: 82 },
      rx2: { heart: 842, cap: 41, skull: 495, fire: 91 },
    },
    {
      id: 'p2',
      title: 'the deck has 94 slides.',
      time: '3h ago',
      tag: '#workbesties',
      reads: '9.1k reads',
      saved: false,
      msg1: 'the deck has 94 slides',
      msg2: 'is the presentation a hostage situation',
      rx1: { heart: 124, cap: '1.2k', skull: 486, fire: 82 },
      rx2: { heart: 842, cap: 41, skull: 495, fire: 91 },
    },
    {
      id: 'p3',
      title: 'the rent is due. the raccoon is not on the lease.',
      time: '18m ago',
      tag: '#roommatelore',
      reads: '6.2k reads',
      saved: false,
      msg1: 'who adopted a raccoon',
      msg2: 'nobody adopted him. he chose us.',
      rx1: { heart: 124, cap: '1.2k', skull: 486, fire: 82 },
      rx2: { heart: 842, cap: 41, skull: 495, fire: 91 },
    },
  ]);

  const toggleSave = (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, saved: !c.saved } : c));
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Feed */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">You / Maya profile</h2>
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
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 px-8 py-5 overflow-y-auto space-y-6">
          {/* Hero Profile Card */}
          <div className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                  alt="Maya Chen"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#2b2b3d]"
                />
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight leading-tight">Maya Chen</h1>
                  <div className="text-xs text-blue-400 font-medium">@mayamaybe</div>
                  {isEditingProfile ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        className="bg-[#12121d] border border-[#212130] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="text-xs text-blue-400 font-bold hover:underline"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{bio}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-4 py-2 rounded-xl bg-[#141422] border border-[#222234] hover:bg-[#1a1a2b] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                {isEditingProfile ? 'Save profile' : 'Edit profile'}
              </button>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-8 pt-1">
              <div>
                <div className="text-lg font-black text-white">3</div>
                <div className="text-[10px] text-slate-500 font-medium">Published chats</div>
              </div>
              <div>
                <div className="text-lg font-black text-white">248</div>
                <div className="text-[10px] text-slate-500 font-medium">Followers</div>
              </div>
              <div>
                <div className="text-lg font-black text-white">24</div>
                <div className="text-[10px] text-slate-500 font-medium">Following</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1 border-t border-[#181826]">
              Joined October 2026 · Public profile · No private conversations shown
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-[#171722] pb-2 text-xs font-bold">
            {(['Published chats', 'About Maya'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-colors cursor-pointer pb-2 relative ${
                  activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* Published Chats Stream */}
          {activeTab === 'Published chats' ? (
            <div className="space-y-6">
              {cards.map(card => (
                <article key={card.id} className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                        alt="Maya"
                        className="w-10 h-10 rounded-full object-cover border border-[#2b2b3d]"
                      />
                      <div>
                        <h3 className="text-lg font-extrabold text-white tracking-tight">{card.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="font-semibold text-slate-400">@mayamaybe</span>
                          <span>×</span>
                          <span className="text-slate-400">Anonymous</span>
                          <span>·</span>
                          <span>{card.time}</span>
                          <span>·</span>
                          <span className="text-slate-400 font-medium">{card.tag}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-4 py-1">
                    {/* Msg 1 — Anonymous */}
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                      <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-[68%]">
                        {card.msg1}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                        <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ {card.rx1.heart}</span>
                        <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 {card.rx1.cap}</span>
                        <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 {card.rx1.skull}</span>
                        <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 {card.rx1.fire}</span>
                      </div>
                    </div>

                    {/* Msg 2 — Maya */}
                    <div className="space-y-1 flex flex-col items-end">
                      <div className="text-[11px] text-slate-400 font-semibold pr-1">Maya</div>
                      <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                        {card.msg2}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                        <span className="flex items-center gap-1 text-rose-400 font-bold">♥ {card.rx2.heart}</span>
                        <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 {card.rx2.cap}</span>
                        <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 {card.rx2.skull}</span>
                        <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 {card.rx2.fire}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
                    <span>{card.reads} · Public excerpt · Read & react only</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSave(card.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          card.saved ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-white text-sm">About Maya</h4>
              <p className="leading-relaxed text-slate-400">
                Storyteller, serial texter, and observer of daily absurdities. Based in San Francisco.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[320px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* Card 1: Your public profile */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 shadow-xl">
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight">Your public profile</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              This is what readers see. Only your published chats appear here.
            </p>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#141422] border border-[#222234] hover:bg-[#1a1a2b] text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Edit profile
          </button>

          <div className="pt-2 border-t border-[#181826]">
            <button
              onClick={() => onNavigate && onNavigate('Account and settings')}
              className="text-xs text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Account and settings
            </button>
          </div>
        </div>

        {/* Card 2: Public chat. Private identity */}
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Maya published these excerpts. Other participants' names, handles and photos are hidden unless they also publish.
            </p>
          </div>
        </div>

        {/* Card 3: Publication controls */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Publication controls</h4>
          <button
            onClick={() => onNavigate && onNavigate('My chats')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Published chats</span>
            <span>→</span>
          </button>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Manage titles, topics and which excerpts stay in the spotlight.
          </p>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Community rules</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 9: ACCOUNT AND SETTINGS PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function AccountSettingsPage({ onNavigate }: { onNavigate?: (nav: string) => void }) {
  // Profile editing
  const [displayName, setDisplayName] = useState('Maya Chen');
  const [handle, setHandle] = useState('@mayamaybe');
  const [bio, setBio] = useState('A little less posting. A lot more plot.');

  // Account & sign-in
  const [email, setEmail] = useState('maya@example.com');
  const [password, setPassword] = useState('••••••••••••');

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    privateMessages: true,
    publicReactions: true,
    newFollowers: true,
    publicationChanges: true,
    emailSummaries: false,
  });

  // Privacy defaults
  const [privacyDefaults, setPrivacyDefaults] = useState({
    keepNewPrivate: true,
    showReadReceipts: true,
    allowFromUnfollowed: false,
  });

  // Safety & account controls
  const [reportCategory, setReportCategory] = useState('Privacy / personal information');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Scrollable Area */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">Account and settings</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                onClick={() => onNavigate && onNavigate('Search')}
                placeholder="Search chats, people, plot twists"
                className="w-full bg-[#12121c] border border-[#212130] focus:border-blue-500 rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors cursor-pointer"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono bg-[#1c1c2b] px-1.5 py-0.5 rounded border border-[#29293d]">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Form Content */}
        <div className="flex-1 px-8 py-5 overflow-y-auto space-y-6">
          {/* Section Hero */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">YOUR ACCOUNT</span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1.5 leading-tight">Make it feel like you.</h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Edit your profile and preferences in one place. Changes shown here are ready to review.
            </p>
          </div>

          {/* Section 1: Profile editing */}
          <section id="section-profile" className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-5 shadow-xl">
            <h3 className="text-sm font-extrabold text-white">Profile editing</h3>

            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Maya Chen"
                className="w-12 h-12 rounded-full object-cover border border-[#2b2b3d]"
              />
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <button className="hover:underline cursor-pointer">Change photo</button>
                <span className="text-slate-500">·</span>
                <button className="hover:underline text-slate-400 cursor-pointer">Remove photo</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-[#12121d] border border-[#212130] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Handle</label>
                <input
                  type="text"
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  className="w-full bg-[#12121d] border border-[#212130] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Bio</label>
              <input
                type="text"
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full bg-[#12121d] border border-[#212130] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-slate-500 pt-1">
                Visible on your public profile. Do not include someone else's private information.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate && onNavigate('Profile')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                Save profile changes
              </button>
              <button
                onClick={() => onNavigate && onNavigate('Profile')}
                className="px-4 py-2.5 rounded-xl bg-[#141422] border border-[#222234] hover:bg-[#1a1a2b] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </section>

          {/* Section 2: Account & sign-in */}
          <section id="section-account" className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 shadow-xl">
            <h3 className="text-sm font-extrabold text-white">Account & sign-in</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#12121d] border border-[#212130] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
                <span className="text-[10px] text-slate-500 block">Private · not shown on your public profile</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#12121d] border border-[#212130] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
                <span className="text-[10px] text-slate-500 block">Use a unique password.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-blue-400">
              <button className="hover:underline cursor-pointer">Update email & password</button>
              <span className="text-slate-500">·</span>
              <button className="hover:underline text-slate-400 cursor-pointer">Sign out of this session</button>
            </div>
          </section>

          {/* Section 3: Notification preferences */}
          <section id="section-notifications" className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-5 shadow-xl">
            <h3 className="text-sm font-extrabold text-white">Notification preferences</h3>

            <div className="space-y-4">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Private message notifications</div>
                  <div className="text-[10px] text-slate-500">Updates from conversations in your inbox</div>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, privateMessages: !p.privateMessages }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifPrefs.privateMessages ? 'bg-blue-600' : 'bg-[#1e1e2d]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifPrefs.privateMessages ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Public reactions</div>
                  <div className="text-[10px] text-slate-500">Reactions on your published messages</div>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, publicReactions: !p.publicReactions }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifPrefs.publicReactions ? 'bg-blue-600' : 'bg-[#1e1e2d]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifPrefs.publicReactions ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">New followers</div>
                  <div className="text-[10px] text-slate-500">People following your public profile</div>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, newFollowers: !p.newFollowers }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifPrefs.newFollowers ? 'bg-blue-600' : 'bg-[#1e1e2d]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifPrefs.newFollowers ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 4 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Publication changes</div>
                  <div className="text-[10px] text-slate-500">Updates when your excerpt changes visibility</div>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, publicationChanges: !p.publicationChanges }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifPrefs.publicationChanges ? 'bg-blue-600' : 'bg-[#1e1e2d]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifPrefs.publicationChanges ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 5 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Email activity summaries</div>
                  <div className="text-[10px] text-slate-500">Optional account activity reminders</div>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, emailSummaries: !p.emailSummaries }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifPrefs.emailSummaries ? 'bg-blue-600' : 'bg-[#1e1e2d]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifPrefs.emailSummaries ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Section 4: Privacy defaults */}
          <section id="section-privacy" className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-5 shadow-xl">
            <h3 className="text-sm font-extrabold text-white">Privacy defaults</h3>

            <div className="space-y-4">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Keep new messages private</div>
                  <div className="text-[10px] text-slate-500">Always on. No automatic publication of future messages.</div>
                </div>
                <button
                  onClick={() => setPrivacyDefaults(p => ({ ...p, keepNewPrivate: !p.keepNewPrivate }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    privacyDefaults.keepNewPrivate ? 'bg-blue-600' : 'bg-[#1e1e2d]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${privacyDefaults.keepNewPrivate ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Show read receipts</div>
                  <div className="text-[10px] text-slate-500">Let private-chat participants see when you've read a message.</div>
                </div>
                <button
                  onClick={() => setPrivacyDefaults(p => ({ ...p, showReadReceipts: !p.showReadReceipts }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    privacyDefaults.showReadReceipts ? 'bg-blue-600' : 'bg-[#1e1e2d]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${privacyDefaults.showReadReceipts ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Allow messages from people you don't follow</div>
                  <div className="text-[10px] text-slate-500">Turn off to limit new conversation requests.</div>
                </div>
                <button
                  onClick={() => setPrivacyDefaults(p => ({ ...p, allowFromUnfollowed: !p.allowFromUnfollowed }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    privacyDefaults.allowFromUnfollowed ? 'bg-blue-600' : 'bg-[#1e1e2d]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${privacyDefaults.allowFromUnfollowed ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111624] border border-[#1b2b48] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">Publication identity rule</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  If only you publish, the other person's name, handle and photo are hidden. Both identities appear only if both participants publish.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Safety & account controls */}
          <section id="section-safety" className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 shadow-xl mb-6">
            <h3 className="text-sm font-extrabold text-white">Safety & account controls</h3>

            <div>
              <div className="text-xs font-bold text-white">Blocked people · 1</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                @quietaccount · Blocked · <button className="text-blue-400 hover:underline cursor-pointer">Unblock</button>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-400">Report an account or publication</label>
              <div className="relative">
                <select
                  value={reportCategory}
                  onChange={e => setReportCategory(e.target.value)}
                  className="w-full appearance-none bg-[#12121d] border border-[#1e1e2d] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer pr-8"
                >
                  <option value="Privacy / personal information">Privacy / personal information</option>
                  <option value="Harassment or spam">Harassment or spam</option>
                  <option value="Impersonation">Impersonation</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-500 pt-0.5">
                Add context to a report in the chat's options menu. Avoid repeating sensitive data unnecessarily.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer">
                Save preferences
              </button>
              <button className="px-4 py-2.5 rounded-xl bg-[#141422] border border-[#222234] hover:bg-[#1a1a2b] text-xs font-semibold text-slate-300 transition-colors cursor-pointer">
                Request account data
              </button>
              <button className="px-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/50 text-xs font-semibold text-rose-300 transition-colors cursor-pointer">
                Delete account
              </button>
            </div>

            <p className="text-[10px] text-slate-500">
              Deleting an account is a separate decision from removing a publication. Review public excerpts before you confirm any account deletion.
            </p>
          </section>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[320px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* Card 1: On this page */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">On this page</h4>
          <div className="space-y-2 text-xs">
            <div onClick={() => scrollToSection('section-profile')} className="text-blue-400 font-semibold hover:underline cursor-pointer">
              Profile editing
            </div>
            <div onClick={() => scrollToSection('section-account')} className="text-slate-300 hover:text-white cursor-pointer">
              Account & sign-in
            </div>
            <div onClick={() => scrollToSection('section-notifications')} className="text-slate-300 hover:text-white cursor-pointer">
              Notifications
            </div>
            <div onClick={() => scrollToSection('section-privacy')} className="text-slate-300 hover:text-white cursor-pointer">
              Privacy defaults
            </div>
            <div onClick={() => scrollToSection('section-safety')} className="text-slate-300 hover:text-white cursor-pointer">
              Safety & account controls
            </div>
          </div>
        </div>

        {/* Card 2: Names aren't consent */}
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Names aren't consent.</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Editing your profile does not reveal an anonymous participant. Publication decisions are made separately for each excerpt.
            </p>
          </div>
        </div>

        {/* Card 3: Account state */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-2.5 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Account state</h4>
          <div className="text-xs font-bold text-white">Signed in as Maya Chen</div>
          <div className="text-[10px] text-slate-500">@mayamaybe · Current session</div>
          <div className="pt-2 border-t border-[#181826] text-xs font-semibold text-blue-400">
            <button className="hover:underline cursor-pointer">Privacy · Community rules</button>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Community rules</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 10: PUBLISHED CHATS PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function PublishedChatsPage({ onNavigate }: { onNavigate?: (nav: string) => void }) {
  const [activeTab, setActiveTab] = useState<'All chats' | 'Published'>('Published');
  const [selectedPublication, setSelectedPublication] = useState('p1');
  const [editingTitle, setEditingTitle] = useState('the deck has 94 slides.');
  const [editingTopic, setEditingTopic] = useState('#workbesties');
  const [showConfirmRemove, setShowConfirmRemove] = useState(true);

  const [publications, setPublications] = useState([
    {
      id: 'p1',
      title: 'the deck has 94 slides.',
      chatName: 'Work bestie',
      topic: '#workbesties',
      messagesCount: '6 messages',
      reads: '9.1k reads',
      publishedTime: 'Published 3h ago',
      isLive: true,
    },
    {
      id: 'p2',
      title: 'he brought a résumé to a first date.',
      chatName: 'The interview',
      topic: '#dating',
      messagesCount: '6 messages',
      reads: '18.4k reads',
      publishedTime: 'Published 2h ago',
      isLive: true,
    },
    {
      id: 'p3',
      title: 'the rent is due. the raccoon is not on the lease.',
      chatName: 'The apartment',
      topic: '#roommatelore',
      messagesCount: '6 messages',
      reads: '6.2k reads',
      publishedTime: 'Published 18m ago',
      isLive: true,
    },
  ]);

  const handleSelectPub = (pub: typeof publications[0]) => {
    setSelectedPublication(pub.id);
    setEditingTitle(pub.title);
    setEditingTopic(pub.topic);
  };

  const handleSavePublicationChanges = () => {
    setPublications(prev =>
      prev.map(p => (p.id === selectedPublication ? { ...p, title: editingTitle, topic: editingTopic } : p))
    );
  };

  const handleRemoveConfirmed = () => {
    setPublications(prev => prev.filter(p => p.id !== selectedPublication));
    setShowConfirmRemove(false);
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Scrollable Area */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">Published chats</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                onClick={() => onNavigate && onNavigate('Search')}
                placeholder="Search chats, people, plot twists"
                className="w-full bg-[#12121c] border border-[#212130] focus:border-blue-500 rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors cursor-pointer"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono bg-[#1c1c2b] px-1.5 py-0.5 rounded border border-[#29293d]">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 px-8 py-5 overflow-y-auto space-y-6">
          {/* Section Hero */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">MY CHATS / PUBLICATIONS</span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1.5 leading-tight">Your chats in the spotlight.</h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Manage only the excerpts you've chosen to make public.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-[#171722] pb-2 text-xs font-bold">
            <button
              onClick={() => onNavigate && onNavigate('My chats')}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer pb-2"
            >
              All chats
            </button>
            <button
              className="text-white transition-colors cursor-pointer pb-2 relative"
            >
              Published
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
            </button>
          </div>

          {/* Publication Cards List */}
          <div className="space-y-4">
            {publications.map(pub => (
              <div
                key={pub.id}
                onClick={() => handleSelectPub(pub)}
                className={`p-5 rounded-3xl bg-[#0f0f18] border transition-all cursor-pointer shadow-xl space-y-3 ${
                  selectedPublication === pub.id ? 'border-blue-500/60 ring-1 ring-blue-500/30' : 'border-[#1f1f2e] hover:border-[#2b2b3f]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                      alt="Maya"
                      className="w-10 h-10 rounded-full object-cover border border-[#2b2b3d]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white tracking-tight">{pub.title}</h3>
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="text-slate-400 font-medium">{pub.topic}</span>
                        <span>·</span>
                        <span>{pub.messagesCount}</span>
                        <span>·</span>
                        <span>{pub.reads}</span>
                        <span>·</span>
                        <span>{pub.publishedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed">
                  @mayamaybe × Anonymous · Only you published · Their name, handle and photo are hidden.
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPub(pub);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#141422] border border-[#242438] hover:bg-[#1a1a2c] text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Edit title & topic
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPub(pub);
                        setShowConfirmRemove(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#141422] border border-[#242438] hover:bg-rose-950/30 text-xs font-semibold text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      Remove publication
                    </button>
                  </div>
                  <span className="text-[11px] text-blue-400 font-medium">Private conversation retained</span>
                </div>
              </div>
            ))}
          </div>

          {/* Remove Publication Confirmation Banner */}
          {showConfirmRemove && (
            <div className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-xl">
              <h4 className="text-sm font-extrabold text-white">
                Remove "{editingTitle}" from public view?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                This removes your publication and its excerpt from your profile and the feed. Your private Work bestie conversation and any messages after the excerpt stay in My chats. If another participant separately publishes, their publication may remain, with your identity hidden.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleRemoveConfirmed}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer"
                >
                  Remove my publication
                </button>
                <button
                  onClick={() => setShowConfirmRemove(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#141422] border border-[#242438] hover:bg-[#1a1a2c] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Keep published
                </button>
              </div>

              <div className="text-[10px] text-slate-500">
                Confirmation open · no change made yet
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Edit selected publication */}
      <aside className="w-[320px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 shadow-xl">
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight">Edit selected publication</h4>
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono mt-1">
              WORK BESTIE · LIVE EXCERPT
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Public title</label>
            <input
              type="text"
              value={editingTitle}
              onChange={e => setEditingTitle(e.target.value)}
              className="w-full bg-[#12121d] border border-[#212130] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Topic</label>
            <div className="relative">
              <select
                value={editingTopic}
                onChange={e => setEditingTopic(e.target.value)}
                className="w-full appearance-none bg-[#12121d] border border-[#212130] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer pr-8"
              >
                <option value="#workbesties">#workbesties</option>
                <option value="#dating">#dating</option>
                <option value="#roommatelore">#roommatelore</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            6 messages selected. Future messages stay private.
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={handleSavePublicationChanges}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              Save publication changes
            </button>
            <button
              onClick={() => onNavigate && onNavigate('My chats')}
              className="w-full py-2 px-3 rounded-xl bg-[#141422] border border-[#222234] hover:bg-[#1a1a2b] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              Cancel editing
            </button>
          </div>
        </div>

        {/* Security / Inbox guarantee note */}
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Your chat stays in your inbox.</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Editing or removing your public excerpt doesn't delete the private conversation.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Community rules</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 11: FRESH PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function FreshPage({ onNavigateTab }: { onNavigateTab?: (tab: string) => void }) {
  const [activeTab, setActiveTab] = useState<'For you' | 'Following' | 'Fresh'>('Fresh');
  const [savedCard1, setSavedCard1] = useState(false);
  const [savedCard2, setSavedCard2] = useState(false);

  const handleTabClick = (tab: 'For you' | 'Following' | 'Fresh') => {
    if (tab !== 'Fresh' && onNavigateTab) {
      onNavigateTab(tab);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Feed */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">Fresh</h2>
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
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 px-8 py-5 overflow-y-auto space-y-6">
          {/* Section Hero */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">DISCOVER / FRESH</span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1.5 leading-tight">New plot. No waiting.</h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Public excerpts in the order they were published. The newest is always first.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-[#171722] pb-2 text-sm font-bold">
            {(['For you', 'Following', 'Fresh'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`transition-colors cursor-pointer pb-2 relative ${
                  activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* Timestamp Header 1 */}
          <div className="text-[10px] font-black tracking-wider text-cyan-400 uppercase font-mono">
            JUST PUBLISHED · 10:46 PM
          </div>

          {/* STORY CARD 1: "we made a custody schedule for the air fryer." */}
          <article className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#181828] border border-[#25253a] flex items-center justify-center font-bold text-xs text-slate-300">
                  JU
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">we made a custody schedule for the air fryer.</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">@julesjpeg</span>
                    <span>×</span>
                    <span className="text-slate-400">Anonymous</span>
                    <span>·</span>
                    <span>1m ago</span>
                    <span>·</span>
                    <span className="text-slate-400 font-medium">#roommatelore</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reading indicator */}
            <div className="py-1 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              <span>386 reading now · reactions set the mood</span>
            </div>

            {/* Messages */}
            <div className="space-y-4 py-1">
              {/* Msg 1 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-[68%]">
                    i need the air fryer on thursday
                  </div>
                  <span className="text-xl">🗨️</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ 124</span>
                  <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 1.2k</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 486</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 82</span>
                </div>
              </div>

              {/* Msg 2 — Jules */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Jules</div>
                <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                  thursday is my crispy day
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ 842</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 41</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 495</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 91</span>
                </div>
              </div>

              {/* Msg 3 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-[68%]">
                  we cannot co-parent an appliance
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ 142</span>
                  <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 1.8k</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 504</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 100</span>
                </div>
              </div>

              {/* Msg 4 — Jules with skull on left */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Jules</div>
                <div className="flex items-center gap-3 w-full justify-end">
                  <span className="text-2xl mr-auto pl-4">💀</span>
                  <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#1d222e] border border-[#2d3445] text-slate-100 text-sm font-medium w-[68%]">
                    tell that to the shared calendar
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ 151</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 59</span>
                  <span className="flex items-center gap-1 text-purple-400 font-bold">💀 2.4k</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 109</span>
                </div>
              </div>

              {/* Msg 5 — Anonymous with fire on right */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#382617] border border-[#543b24] text-amber-100 text-sm font-medium w-[68%]">
                    you gave it a birthday
                  </div>
                  <span className="text-xl">🔥</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ 160</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 68</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 522</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">🔥 2.1k</span>
                </div>
              </div>

              {/* Msg 6 — Jules with heart on left */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Jules</div>
                <div className="flex items-center gap-3 w-full justify-end">
                  <span className="text-xl mr-auto pl-8">💖</span>
                  <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                    and you forgot it.
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ 1.6k</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 77</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 531</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 127</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
              <span>246 reads · Public excerpt · Read & react only</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSavedCard1(!savedCard1)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    savedCard1 ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

          {/* Timestamp Header 2 */}
          <div className="text-[10px] font-black tracking-wider text-slate-500 uppercase font-mono">
            4 MINUTES AGO · 10:43 PM
          </div>

          {/* STORY CARD 2: "the apology came with a lasagna." */}
          <article className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#181828] border border-[#25253a] flex items-center justify-center font-bold text-xs text-slate-300">
                  LE
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">the apology came with a lasagna.</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">@leosays</span>
                    <span>×</span>
                    <span className="text-slate-400">Anonymous</span>
                    <span>·</span>
                    <span>4m ago</span>
                    <span>·</span>
                    <span className="text-slate-400 font-medium">#dating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 py-1">
              {/* Msg 1 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-[68%]">
                  i said sorry and brought dinner
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ 124</span>
                  <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 1.2k</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 486</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 82</span>
                </div>
              </div>

              {/* Msg 2 — Leo */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-slate-400 font-semibold pr-1">Leo</div>
                <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                  how many layers of accountability
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ 842</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 41</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 495</span>
                  <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 91</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
              <span>812 reads · Public excerpt · Read & react only</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSavedCard2(!savedCard2)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    savedCard2 ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

          {/* End of Feed caption */}
          <div className="text-center py-4 text-xs text-slate-500">
            You've read the newest publications. Older chats continue below.
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[320px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* Card 1: Straight from the chat */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Straight from the chat</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Newest publications first. A fresh excerpt, not necessarily a brand-new conversation.
          </p>
          <div className="text-xs text-blue-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
            <span>Sorted by publication time</span>
            <span>↓</span>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-[#181826]">
            Feed snapshot · Today, 10:47 PM
          </div>
        </div>

        {/* Card 2: You set the mood */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">You set the mood.</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            React to a message. Its leading reaction colors the bubble.
          </p>
          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-2xl bg-[#141420] border border-[#222234] flex flex-col items-center gap-1">
              <span className="text-rose-400 text-sm">♥</span>
              <span className="text-[10px] text-slate-400">Heart</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#141420] border border-[#222234] flex flex-col items-center gap-1">
              <span className="text-sm">🧢</span>
              <span className="text-[10px] text-slate-400">Cap</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#141420] border border-[#222234] flex flex-col items-center gap-1">
              <span className="text-sm">💀</span>
              <span className="text-[10px] text-slate-400">Skull</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#141420] border border-[#222234] flex flex-col items-center gap-1">
              <span className="text-sm">🔥</span>
              <span className="text-[10px] text-slate-400">Fire</span>
            </div>
          </div>
        </div>

        {/* Card 3: Public chat. Private identity */}
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Names, handles and photos of participants who haven't published are hidden.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Community rules</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 12: TOPICS DIRECTORY PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function TopicsDirectoryPage({ onNavigate }: { onNavigate?: (nav: string, topic?: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const topics = [
    {
      tag: '#dating',
      badgeLabel: 'THE BAR IS IN THE BASEMENT',
      badgeColor: 'text-rose-400',
      iconBg: 'bg-[#3b1828] text-rose-300 border-[#5a243d]',
      headline: 'Romance. References available.',
      desc: 'First dates, questionable texts and the occasional pasta-based benefit package.',
      quote: '"he brought a résumé to a first date."',
      quoteColor: 'text-rose-400',
      stats: '2.8k chats · Published excerpts',
    },
    {
      tag: '#roommatelore',
      badgeLabel: 'SHARED RENT. UNSHARED BRAIN CELL.',
      badgeColor: 'text-cyan-400',
      iconBg: 'bg-[#152a48] text-cyan-300 border-[#1f3f6e]',
      headline: 'Home is where the plot is.',
      desc: 'Chore charts, fridge politics and one very unofficial new tenant.',
      quote: '"the rent is due. the raccoon is not on the lease."',
      quoteColor: 'text-blue-400',
      stats: '1.4k chats · Published excerpts',
    },
    {
      tag: '#workbesties',
      badgeLabel: 'THIS MEETING COULD BE A CHAT',
      badgeColor: 'text-amber-400',
      iconBg: 'bg-[#3b2816] text-amber-300 border-[#5a3e20]',
      headline: 'Clocked in. Mentally out.',
      desc: 'The office lore that never makes it into the meeting notes.',
      quote: '"the deck has 94 slides."',
      quoteColor: 'text-amber-400',
      stats: '986 chats · Published excerpts',
    },
  ];

  const filteredTopics = topics.filter(
    t => t.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
         t.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
         t.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Scrollable Area */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">Topics directory</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                onClick={() => onNavigate && onNavigate('Search')}
                placeholder="Search chats, people, plot twists"
                className="w-full bg-[#12121c] border border-[#212130] focus:border-blue-500 rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors cursor-pointer"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono bg-[#1c1c2b] px-1.5 py-0.5 rounded border border-[#29293d]">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 px-8 py-5 overflow-y-auto space-y-6">
          {/* Section Hero */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider font-mono">
              <button
                onClick={() => onNavigate && onNavigate('Discover')}
                className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
              >
                DISCOVER
              </button>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">TOPICS</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1.5 leading-tight">In the group chat.</h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Find the stories you came for. Stay for the very specific chaos.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Find a topic</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search topics"
              className="w-full bg-[#0d0d16] border border-[#1f1f2e] focus:border-blue-500 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            <div className="text-[11px] text-slate-500 pt-0.5">Showing all {filteredTopics.length} available topics</div>
          </div>

          {/* Topics Cards List */}
          <div className="space-y-4">
            {filteredTopics.map(topic => (
              <div
                key={topic.tag}
                className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] hover:border-[#2a2a3e] transition-colors shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border ${topic.iconBg}`}>
                      #
                    </div>
                    <div className="space-y-1">
                      <span className={`text-[10px] font-black tracking-wider uppercase font-mono ${topic.badgeColor}`}>
                        {topic.badgeLabel}
                      </span>
                      <h3 className="text-xl font-black text-white tracking-tight">{topic.tag}</h3>
                      <h4 className="text-sm font-bold text-slate-200">{topic.headline}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{topic.desc}</p>
                      <div className={`text-xs font-semibold pt-1 ${topic.quoteColor}`}>
                        {topic.quote}
                      </div>
                      <div className="text-[10px] text-slate-500 pt-1">
                        {topic.stats}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate && onNavigate('Topic detail', topic.tag)}
                    className="px-4 py-2 rounded-xl bg-[#141422] border border-[#222234] hover:bg-[#1a1a2b] text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Explore</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[320px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* Card 1: Pick your kind of chaos */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Pick your kind of chaos</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Topics gather published excerpts, not private rooms. Read a chat, react to a message, save the plot for later.
          </p>
          <div className="text-[10px] text-blue-400 font-semibold pt-1 border-t border-[#181826]">
            3 topics · All public
          </div>
        </div>

        {/* Card 2: No joining required */}
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">No joining required. Or possible.</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              A topic is a reading feed. Reacting doesn't add you to anyone's private conversation.
            </p>
          </div>
        </div>

        {/* Card 3: Tonight's picks */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 shadow-xl">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
            TONIGHT'S PICKS
          </div>
          <h4 className="text-lg font-black text-white leading-tight">Small talk. Big energy.</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The after-hours edit brings a few standout public conversations together.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('Discover')}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Explore tonight's picks</span>
            <span>↗</span>
          </button>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Community rules</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 13: TOPIC DETAIL PAGE (#dating) (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
interface TopicDetailPageProps {
  topicTag?: string;
  onNavigate?: (nav: string, topic?: string) => void;
}

function TopicDetailPage({ topicTag = '#dating', onNavigate }: TopicDetailPageProps) {
  const [currentTopic, setCurrentTopic] = useState<string>(topicTag);
  const [activeTab, setActiveTab] = useState<'Popular' | 'Fresh'>('Popular');
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [bookmarked1, setBookmarked1] = useState(false);
  const [bookmarked2, setBookmarked2] = useState(false);

  const isDating = currentTopic === '#dating';
  const isRoommate = currentTopic === '#roommatelore';

  const topicConfig = {
    tag: currentTopic,
    breadcrumb: currentTopic.replace('#', '').toUpperCase(),
    subtitle: isDating
      ? 'A résumé on a first date. A lasagna with an apology. Romance has range.'
      : isRoommate
      ? 'Chore charts, fridge politics and one very unofficial new tenant.'
      : 'The office lore that never makes it into the meeting notes.',
    sidebarTitle: isDating
      ? 'The bar is in the basement'
      : isRoommate
      ? 'Shared rent. Unshared brain cell.'
      : 'This meeting could be a chat',
    sidebarDesc: isDating
      ? '2.8k public chats · First dates, second thoughts and very specific green flags.'
      : isRoommate
      ? '1.4k public chats · Chore charts, fridge politics and unofficial roommates.'
      : '986 public chats · The office lore that never makes it into meeting notes.',
  };

  // Reactions state for Chat 1
  const [reactions1, setReactions1] = useState([
    { hearts: 124, caps: 1200, skulls: 486, fires: 82, active: 'cap' },
    { hearts: 842, caps: 41, skulls: 495, fires: 91, active: 'heart' },
    { hearts: 142, caps: 1800, skulls: 504, fires: 100, active: 'cap' },
    { hearts: 151, caps: 59, skulls: 2400, fires: 109, active: 'skull' },
    { hearts: 160, caps: 68, skulls: 522, fires: 2100, active: 'fire' },
    { hearts: 1600, caps: 77, skulls: 531, fires: 127, active: 'heart' },
  ]);

  // Reactions state for Chat 2
  const [reactions2, setReactions2] = useState([
    { hearts: 124, caps: 1200, skulls: 486, fires: 82, active: 'cap' },
    { hearts: 842, caps: 41, skulls: 495, fires: 91, active: 'heart' },
  ]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleReact1 = (index: number, type: 'heart' | 'cap' | 'skull' | 'fire') => {
    setReactions1(prev => {
      const copy = [...prev];
      const cur = { ...copy[index] };
      if (cur.active === type) {
        if (type === 'heart') cur.hearts -= 1;
        if (type === 'cap') cur.caps -= 1;
        if (type === 'skull') cur.skulls -= 1;
        if (type === 'fire') cur.fires -= 1;
        cur.active = '';
      } else {
        if (type === 'heart') cur.hearts += 1;
        if (type === 'cap') cur.caps += 1;
        if (type === 'skull') cur.skulls += 1;
        if (type === 'fire') cur.fires += 1;
        cur.active = type;
      }
      copy[index] = cur;
      return copy;
    });
  };

  const formatCount = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
    return n.toString();
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Scrollable Area */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">{currentTopic}</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                onClick={() => onNavigate && onNavigate('Search')}
                placeholder="Search chats, people, plot twists"
                className="w-full bg-[#12121c] border border-[#212130] focus:border-blue-500 rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors cursor-pointer"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono bg-[#1c1c2b] px-1.5 py-0.5 rounded border border-[#29293d]">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 px-8 py-5 overflow-y-auto space-y-6">
          {/* Breadcrumb & Topic Hero Header */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider font-mono">
              <button
                onClick={() => onNavigate && onNavigate('Topics directory')}
                className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
              >
                TOPICS
              </button>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{topicConfig.breadcrumb}</span>
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <h1 className="text-3xl font-black text-white tracking-tight">{currentTopic}</h1>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isFollowing
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-[#12121e] border-[#252538] hover:bg-[#181829] text-white'
                }`}
              >
                {isFollowing ? 'Following ✓' : 'Follow topic'}
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {topicConfig.subtitle}
            </p>
          </div>

          {/* Popular / Fresh Tabs */}
          <div className="flex items-center gap-6 border-b border-[#181826]">
            <button
              onClick={() => setActiveTab('Popular')}
              className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer relative ${
                activeTab === 'Popular' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Popular
              {activeTab === 'Popular' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('Fresh')}
              className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer relative ${
                activeTab === 'Fresh' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fresh
              {activeTab === 'Fresh' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          </div>

          {/* CHAT CARD 1: he brought a résumé to a first date. */}
          <div className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 space-y-5 shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Maya Chen"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#222236]"
              />
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  he brought a résumé to a first date.
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  @mayamaybe × Anonymous · 2h ago · {currentTopic}
                </div>
              </div>
            </div>

            {/* Reading now indicator */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>386 reading now · reactions set the mood</span>
            </div>

            {/* Dialogue Messages */}
            <div className="space-y-4 pt-1">
              {/* Msg 1 (Anonymous, Left) */}
              <div className="space-y-1 max-w-[75%]">
                <div className="text-[11px] text-slate-500 font-medium">Anonymous</div>
                <div className="relative inline-block">
                  <div className="bg-[#1c2e47] border border-[#274268] text-white px-4 py-3 rounded-2xl rounded-tl-xs text-xs font-medium leading-relaxed">
                    i brought a résumé to the date.
                  </div>
                  {/* Floating Cap emoji on right */}
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-sm select-none">
                    🧢
                  </div>
                </div>
                {/* Reactions */}
                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <button
                    onClick={() => handleReact1(0, 'heart')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[0].active === 'heart' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions1[0].hearts)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(0, 'cap')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[0].active === 'cap' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions1[0].caps)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(0, 'skull')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[0].active === 'skull' ? 'text-slate-200 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions1[0].skulls)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(0, 'fire')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[0].active === 'fire' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions1[0].fires)}</span>
                  </button>
                </div>
              </div>

              {/* Msg 2 (Maya, Right) */}
              <div className="space-y-1 ml-auto max-w-[75%] flex flex-col items-end">
                <div className="text-[11px] text-slate-500 font-medium">Maya</div>
                <div className="bg-[#481c2d] border border-[#642840] text-white px-4 py-3 rounded-2xl rounded-tr-xs text-xs font-medium leading-relaxed">
                  please tell me this is a metaphor
                </div>
                {/* Reactions */}
                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <button
                    onClick={() => handleReact1(1, 'heart')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[1].active === 'heart' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions1[1].hearts)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(1, 'cap')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[1].active === 'cap' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions1[1].caps)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(1, 'skull')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[1].active === 'skull' ? 'text-slate-200 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions1[1].skulls)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(1, 'fire')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[1].active === 'fire' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions1[1].fires)}</span>
                  </button>
                </div>
              </div>

              {/* Msg 3 (Anonymous, Left) */}
              <div className="space-y-1 max-w-[75%]">
                <div className="text-[11px] text-slate-500 font-medium">Anonymous</div>
                <div className="bg-[#1c2e47] border border-[#274268] text-white px-4 py-3 rounded-2xl rounded-tl-xs text-xs font-medium leading-relaxed">
                  two pages. references available on request.
                </div>
                {/* Floating Skull emoji */}
                <div className="text-sm select-none pl-1 pt-0.5">
                  💀
                </div>
                {/* Reactions */}
                <div className="flex items-center gap-3 pt-0.5 text-[11px]">
                  <button
                    onClick={() => handleReact1(2, 'heart')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[2].active === 'heart' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions1[2].hearts)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(2, 'cap')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[2].active === 'cap' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions1[2].caps)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(2, 'skull')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[2].active === 'skull' ? 'text-slate-200 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions1[2].skulls)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(2, 'fire')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[2].active === 'fire' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions1[2].fires)}</span>
                  </button>
                </div>
              </div>

              {/* Msg 4 (Maya, Right) */}
              <div className="space-y-1 ml-auto max-w-[75%] flex flex-col items-end">
                <div className="text-[11px] text-slate-500 font-medium">Maya</div>
                <div className="bg-[#202230] border border-[#2d3044] text-white px-4 py-3 rounded-2xl rounded-tr-xs text-xs font-medium leading-relaxed">
                  did you at least get the position?
                </div>
                {/* Reactions */}
                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <button
                    onClick={() => handleReact1(3, 'heart')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[3].active === 'heart' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions1[3].hearts)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(3, 'cap')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[3].active === 'cap' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions1[3].caps)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(3, 'skull')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[3].active === 'skull' ? 'text-slate-200 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions1[3].skulls)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(3, 'fire')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[3].active === 'fire' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions1[3].fires)}</span>
                  </button>
                </div>
              </div>

              {/* Msg 5 (Anonymous, Left) */}
              <div className="space-y-1 max-w-[75%]">
                <div className="text-[11px] text-slate-500 font-medium">Anonymous</div>
                <div className="relative inline-block">
                  <div className="bg-[#3f2717] border border-[#5a3821] text-white px-4 py-3 rounded-2xl rounded-tl-xs text-xs font-medium leading-relaxed">
                    second interview on friday. benefits include pasta.
                  </div>
                  {/* Floating Fire emoji */}
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-sm select-none">
                    🔥
                  </div>
                </div>
                {/* Reactions */}
                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <button
                    onClick={() => handleReact1(4, 'heart')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[4].active === 'heart' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions1[4].hearts)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(4, 'cap')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[4].active === 'cap' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions1[4].caps)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(4, 'skull')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[4].active === 'skull' ? 'text-slate-200 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions1[4].skulls)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(4, 'fire')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[4].active === 'fire' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions1[4].fires)}</span>
                  </button>
                </div>
              </div>

              {/* Msg 6 (Maya, Right) */}
              <div className="space-y-1 ml-auto max-w-[75%] flex flex-col items-end">
                <div className="text-[11px] text-slate-500 font-medium">Maya</div>
                <div className="relative inline-block">
                  {/* Floating Heart emoji on left */}
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-sm select-none">
                    🩷
                  </div>
                  <div className="bg-[#481c2d] border border-[#642840] text-white px-4 py-3 rounded-2xl rounded-tr-xs text-xs font-medium leading-relaxed">
                    honestly? hired.
                  </div>
                </div>
                {/* Reactions */}
                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <button
                    onClick={() => handleReact1(5, 'heart')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[5].active === 'heart' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions1[5].hearts)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(5, 'cap')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[5].active === 'cap' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions1[5].caps)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(5, 'skull')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[5].active === 'skull' ? 'text-slate-200 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions1[5].skulls)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(5, 'fire')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[5].active === 'fire' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions1[5].fires)}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 1 Footer */}
            <div className="pt-3 border-t border-[#181826] flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                18.4k reads · Public excerpt · Read & react only
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBookmarked1(!bookmarked1)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    bookmarked1 ? 'text-blue-400 bg-blue-950/40' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* UP NEXT IN #DATING TEASER */}
          <div className="p-4 rounded-2xl bg-[#0c0c15] border border-[#1b1b28] flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
              Up next in {currentTopic}
            </span>
            <h4 className="text-base font-extrabold text-white mt-1">
              the apology came with a lasagna.
            </h4>
            <div className="text-xs text-slate-400 mt-0.5">
              @leosays × Anonymous · 6 messages · Read below
            </div>
          </div>

          {/* CHAT CARD 2: the apology came with a lasagna. */}
          <div className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 space-y-5 shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1b1b2a] border border-[#2a2a3e] flex items-center justify-center text-xs font-black text-slate-300">
                LE
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  the apology came with a lasagna.
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  @leosays × Anonymous · 4m ago · {currentTopic}
                </div>
              </div>
            </div>

            {/* Dialogue Messages */}
            <div className="space-y-4 pt-1">
              {/* Msg 1 (Anonymous, Left) */}
              <div className="space-y-1 max-w-[75%]">
                <div className="text-[11px] text-slate-500 font-medium">Anonymous</div>
                <div className="bg-[#1c2e47] border border-[#274268] text-white px-4 py-3 rounded-2xl rounded-tl-xs text-xs font-medium leading-relaxed">
                  i said sorry and brought dinner
                </div>
                {/* Reactions */}
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <button
                    onClick={() => {
                      setReactions2(prev => {
                        const copy = [...prev];
                        copy[0].hearts += 1;
                        return copy;
                      });
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions2[0].hearts)}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-700 text-blue-300 font-bold transition-colors cursor-pointer"
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions2[0].caps)}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions2[0].skulls)}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions2[0].fires)}</span>
                  </button>
                </div>
              </div>

              {/* Msg 2 (Leo, Right) */}
              <div className="space-y-1 ml-auto max-w-[75%] flex flex-col items-end">
                <div className="text-[11px] text-slate-500 font-medium">Leo</div>
                <div className="bg-[#481c2d] border border-[#642840] text-white px-4 py-3 rounded-2xl rounded-tr-xs text-xs font-medium leading-relaxed">
                  how many layers of accountability
                </div>
                {/* Reactions */}
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-700 text-rose-300 font-bold transition-colors cursor-pointer"
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions2[1].hearts)}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions2[1].caps)}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions2[1].skulls)}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions2[1].fires)}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 Footer */}
            <div className="pt-3 border-t border-[#181826] flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                812 reads · Public excerpt · Read & react only
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBookmarked2(!bookmarked2)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    bookmarked2 ? 'text-blue-400 bg-blue-950/40' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[320px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* Card 1: The bar is in the basement */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">{topicConfig.sidebarTitle}</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {topicConfig.sidebarDesc}
          </p>
          <button
            onClick={() => onNavigate && onNavigate('Topics directory')}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>Topics directory</span>
            <span>↗</span>
          </button>
        </div>

        {/* Card 2: Share this public excerpt */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Share this public excerpt</h4>
          <div className="space-y-2 pt-1 text-xs">
            <button
              onClick={handleCopy}
              className="text-blue-400 hover:text-blue-300 font-semibold block text-left cursor-pointer"
            >
              {copiedLink ? '✓ Copied link to clipboard!' : 'Copy public-chat link'}
            </button>
            <button
              onClick={() => alert('Excerpt preview generated!')}
              className="text-slate-300 hover:text-white font-medium block text-left cursor-pointer"
            >
              Share excerpt preview
            </button>
            <button
              onClick={() => {}}
              className="text-slate-400 hover:text-slate-300 font-medium block text-left cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-[#181826]">
            Only the published messages are included. Your private chat is never shared.
          </p>
        </div>

        {/* Card 3: In the group chat */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-white">In the group chat</h4>
          {[
            { tag: '#dating', title: 'The bar is in the basement', chats: '2.8k chats' },
            { tag: '#roommatelore', title: 'Shared rent. Unshared brain cell.', chats: '1.4k chats' },
            { tag: '#workbesties', title: 'This meeting could be a chat', chats: '986 chats' },
          ].map(item => (
            <div
              key={item.tag}
              onClick={() => setCurrentTopic(item.tag)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                currentTopic === item.tag
                  ? 'bg-[#151524] border-blue-500/50 shadow-md'
                  : 'bg-[#10101b] border-[#1f1f2e] hover:border-[#2d2d42] hover:bg-[#141424]'
              }`}
            >
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span className={currentTopic === item.tag ? 'text-blue-400' : ''}>{item.tag}</span>
                {currentTopic === item.tag && (
                  <span className="text-[10px] text-blue-400 font-semibold bg-blue-950/60 px-1.5 py-0.5 rounded">Active</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{item.title}</div>
              <div className="text-[10px] text-slate-500 mt-1">{item.chats}</div>
            </div>
          ))}
        </div>

        {/* Card 4: You set the mood */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">You set the mood.</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            React to a message. Its leading reaction colors the bubble.
          </p>
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-2xl bg-[#141420] border border-[#222234] hover:border-rose-500/50 flex flex-col items-center gap-1 cursor-pointer transition-colors">
              <span className="text-sm">♥</span>
              <span className="text-[10px] text-slate-400">Heart</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#141420] border border-[#222234] hover:border-blue-500/50 flex flex-col items-center gap-1 cursor-pointer transition-colors">
              <span className="text-sm">🧢</span>
              <span className="text-[10px] text-slate-400">Cap</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#141420] border border-[#222234] hover:border-slate-500/50 flex flex-col items-center gap-1 cursor-pointer transition-colors">
              <span className="text-sm">💀</span>
              <span className="text-[10px] text-slate-400">Skull</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#141420] border border-[#222234] hover:border-amber-500/50 flex flex-col items-center gap-1 cursor-pointer transition-colors">
              <span className="text-sm">🔥</span>
              <span className="text-[10px] text-slate-400">Fire</span>
            </div>
          </div>
        </div>

        {/* Card 5: Public chat. Private identity */}
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              One publisher: the other participant's name, handle and photo stay hidden. Both identities appear only when both publish.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Community rules</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT APP WITH NAVIGATION
// ─────────────────────────────────────────────────────────────
export function App() {
  const [activeNav, setActiveNav] = useState<string>("Tonight's picks");
  const [selectedTopic, setSelectedTopic] = useState<string>('#dating');

  const handleNavigate = (nav: string, topic?: string) => {
    if (topic) setSelectedTopic(topic);
    setActiveNav(nav);
  };

  const handleNavigateTab = (tab: string) => {
    if (tab === 'Following') {
      setActiveNav('Following');
    } else if (tab === 'For you') {
      setActiveNav('Discover');
    } else if (tab === 'Fresh') {
      setActiveNav('Fresh');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#09090f] text-slate-100 flex font-sans">
      <Sidebar activeNav={activeNav} onNav={setActiveNav} />

      {activeNav === 'Discover' && <DiscoverPage onNavigateTab={handleNavigateTab} onNavigate={handleNavigate} />}
      {activeNav === 'Following' && <FollowingPage onNavigateTab={handleNavigateTab} />}
      {activeNav === 'Fresh' && <FreshPage onNavigateTab={handleNavigateTab} />}
      {activeNav === 'My chats' && <MyChatsPage onNavigate={setActiveNav} />}
      {activeNav === 'Saved' && <SavedPage />}
      {activeNav === 'Start a chat' && <StartChatPage onNavigate={setActiveNav} />}
      {activeNav === 'Search' && <SearchPage onNavigate={setActiveNav} />}
      {activeNav === 'Notifications' && <NotificationsPage onNavigate={setActiveNav} />}
      {activeNav === 'Profile' && <ProfilePage onNavigate={setActiveNav} />}
      {activeNav === 'Account and settings' && <AccountSettingsPage onNavigate={setActiveNav} />}
      {activeNav === 'Published chats' && <PublishedChatsPage onNavigate={setActiveNav} />}
      {activeNav === 'Topics directory' && <TopicsDirectoryPage onNavigate={handleNavigate} />}
      {activeNav === 'Topic detail' && <TopicDetailPage topicTag={selectedTopic} onNavigate={handleNavigate} />}
      {activeNav === "Tonight's picks" && <TonightsPicksPage onNavigate={handleNavigate} />}
      {(activeNav === 'About' || activeNav === 'About CCHAT') && <AboutPage onNavigate={handleNavigate} />}
      {activeNav === 'Community rules' && <CommunityRulesPage onNavigate={handleNavigate} />}
      {activeNav === 'Privacy' && <PrivacyPage onNavigate={handleNavigate} />}
      {(activeNav === 'Sponsorship' || activeNav === 'Sponsorship / Learn more') && <SponsorshipPage onNavigate={handleNavigate} />}
      {(activeNav === 'After Hours sponsor detail' || activeNav === 'After Hours') && <AfterHoursPage onNavigate={handleNavigate} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 14: TONIGHT'S PICKS / THE AFTER-HOURS EDIT
// ─────────────────────────────────────────────────────────────
function TonightsPicksPage({ onNavigate }: { onNavigate?: (nav: string, topic?: string) => void }) {
  const [bookmarks, setBookmarks] = useState({ c1: false, c2: false, c3: false });
  const [reactions, setReactions] = useState({
    // Chat 1 messages: JU left, Jules right
    c1m1: { hearts: 124, caps: 1200, skulls: 486, fires: 82, active: 'cap' },
    c1m2: { hearts: 842, caps: 41, skulls: 705, fires: 91, active: 'heart' },
    c1m3: { hearts: 142, caps: 1800, skulls: 504, fires: 100, active: 'cap' },
    c1m4: { hearts: 151, caps: 96, skulls: 2400, fires: 109, active: 'skull' },
    c1m5: { hearts: 160, caps: 68, skulls: 522, fires: 2100, active: 'fire' },
    c1m6: { hearts: 1600, caps: 77, skulls: 531, fires: 127, active: 'heart' },
    // Chat 2
    c2m1: { hearts: 124, caps: 1200, skulls: 486, fires: 82, active: 'cap' },
    c2m2: { hearts: 842, caps: 41, skulls: 895, fires: 91, active: 'heart' },
    // Chat 3
    c3m1: { hearts: 124, caps: 1200, skulls: 486, fires: 82, active: 'cap' },
    c3m2: { hearts: 842, caps: 41, skulls: 895, fires: 91, active: 'heart' },
  });

  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n);

  const react = (key: keyof typeof reactions, type: 'heart' | 'cap' | 'skull' | 'fire') => {
    setReactions(prev => {
      const cur = { ...prev[key] };
      const wasActive = cur.active === type;
      if (!wasActive) {
        if (type === 'heart') cur.hearts += 1;
        if (type === 'cap') cur.caps += 1;
        if (type === 'skull') cur.skulls += 1;
        if (type === 'fire') cur.fires += 1;
      } else {
        if (type === 'heart') cur.hearts -= 1;
        if (type === 'cap') cur.caps -= 1;
        if (type === 'skull') cur.skulls -= 1;
        if (type === 'fire') cur.fires -= 1;
      }
      cur.active = wasActive ? '' : type;
      return { ...prev, [key]: cur };
    });
  };

  const ReactionBar = ({ rkey, r }: { rkey: keyof typeof reactions; r: typeof reactions[keyof typeof reactions] }) => (
    <div className="flex items-center gap-3 text-[11px]">
      {(['heart','cap','skull','fire'] as const).map(type => {
        const icons: Record<string, string> = { heart: '♥', cap: '🧢', skull: '💀', fire: '🔥' };
        const active = r.active === type;
        const colors: Record<string, string> = {
          heart: 'text-rose-400', cap: 'text-blue-400', skull: 'text-slate-200', fire: 'text-amber-400'
        };
        const count = type === 'heart' ? r.hearts : type === 'cap' ? r.caps : type === 'skull' ? r.skulls : r.fires;
        return (
          <button
            key={type}
            onClick={() => react(rkey, type)}
            className={`flex items-center gap-1 transition-colors cursor-pointer ${active ? colors[type] + ' font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span>{icons[type]}</span>
            <span>{fmt(count)}</span>
          </button>
        );
      })}
    </div>
  );

  const CardFooter = ({ reads, bk }: { reads: string; bk: 'c1' | 'c2' | 'c3' }) => (
    <div className="pt-3 border-t border-[#181826] flex items-center justify-between text-[11px]">
      <span className="text-slate-500">{reads} · Public excerpt · Read & react only</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setBookmarks(prev => ({ ...prev, [bk]: !prev[bk] }))}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${bookmarks[bk] ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-colors cursor-pointer">
          <Share2 className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-colors cursor-pointer">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Main scrollable content */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
        {/* Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <button
              onClick={() => onNavigate && onNavigate('Discover')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Tonight's picks
            </button>
            <span className="text-slate-600">/</span>
            <span>The after-hours edit</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                onClick={() => onNavigate && onNavigate('Search')}
                placeholder="Search chats, people, plot twists"
                className="w-full bg-[#12121c] border border-[#212130] focus:border-blue-500 rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors cursor-pointer"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono bg-[#1c1c2b] px-1.5 py-0.5 rounded border border-[#29293d]">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Banner */}
          <div className="relative w-full h-52 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80"
              alt="After hours edit"
              className="w-full h-full object-cover brightness-50 contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
            <div className="absolute inset-0 px-8 py-5 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase font-mono bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/40">
                  THE AFTER-HOURS EDIT
                </span>
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-mono">
                  · TONIGHT'S PICKS
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white leading-tight drop-shadow-xl">
                  Small talk.<br />Big energy.
                </h1>
                <p className="text-xs text-slate-300 mt-2">
                  Good chats for when the night isn't quite over.
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  3 picks · A reading list, not a private chat room.
                </p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-8 py-6 space-y-10">

            {/* ── CHAT 1: we said one drink. ── */}
            <div className="space-y-4">
              {/* Section Label */}
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase font-mono">
                <span className="text-slate-500">01 /</span>
                <span className="text-slate-500">FRIDAY PLANS · </span>
                <span className="text-blue-400">THE 'ONE DRINK' DEFENSE</span>
              </div>

              {/* Card */}
              <div className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-5 space-y-4 shadow-xl">
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1b1b2a] border border-[#2a2a3e] flex items-center justify-center text-xs font-black text-slate-300">
                    JU
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">we said one drink.</h3>
                    <div className="text-xs text-slate-400 mt-0.5">@juliajeg × Anonymous · 42m ago · #dating</div>
                  </div>
                </div>

                {/* Reading indicator */}
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>386 reading now · reactions set the mood</span>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {/* Msg 1 – Anon left, navy, cap badge */}
                  <div className="space-y-1 max-w-[72%]">
                    <div className="text-[11px] text-slate-500">Anonymous</div>
                    <div className="relative inline-block w-full">
                      <div className="bg-[#1c2e47] border border-[#274268] text-white px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs font-medium">
                        we said one drink
                      </div>
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-sm select-none">🧢</div>
                    </div>
                    <ReactionBar rkey="c1m1" r={reactions.c1m1} />
                  </div>

                  {/* Msg 2 – Jules right, wine */}
                  <div className="space-y-1 ml-auto max-w-[72%] flex flex-col items-end">
                    <div className="text-[11px] text-slate-500">Jules</div>
                    <div className="bg-[#481c2d] border border-[#642840] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs font-medium">
                      this is still the same evening
                    </div>
                    <ReactionBar rkey="c1m2" r={reactions.c1m2} />
                  </div>

                  {/* Msg 3 – Anon left */}
                  <div className="space-y-1 max-w-[72%]">
                    <div className="text-[11px] text-slate-500">Anonymous</div>
                    <div className="bg-[#1c2e47] border border-[#274268] text-white px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs font-medium">
                      it is Saturday
                    </div>
                    <div className="text-sm pl-1 pt-0.5 select-none">💀</div>
                    <ReactionBar rkey="c1m3" r={reactions.c1m3} />
                  </div>

                  {/* Msg 4 – Jules right */}
                  <div className="space-y-1 ml-auto max-w-[72%] flex flex-col items-end">
                    <div className="text-[11px] text-slate-500">Jules</div>
                    <div className="bg-[#202230] border border-[#2d3044] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs font-medium">
                      a technicality
                    </div>
                    <ReactionBar rkey="c1m4" r={reactions.c1m4} />
                  </div>

                  {/* Msg 5 – Anon left, amber, fire badge */}
                  <div className="space-y-1 max-w-[72%]">
                    <div className="text-[11px] text-slate-500">Anonymous</div>
                    <div className="relative inline-block w-full">
                      <div className="bg-[#3f2717] border border-[#5a3821] text-white px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs font-medium">
                        why is there a karaoke receipt
                      </div>
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-sm select-none">🔥</div>
                    </div>
                    <ReactionBar rkey="c1m5" r={reactions.c1m5} />
                  </div>

                  {/* Msg 6 – Jules right, wine, heart badge left */}
                  <div className="space-y-1 ml-auto max-w-[72%] flex flex-col items-end">
                    <div className="text-[11px] text-slate-500">Jules</div>
                    <div className="relative inline-block">
                      <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-sm select-none">🩷</div>
                      <div className="bg-[#481c2d] border border-[#642840] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs font-medium">
                        because we invested in the arts.
                      </div>
                    </div>
                    <ReactionBar rkey="c1m6" r={reactions.c1m6} />
                  </div>
                </div>

                <CardFooter reads="4.8k reads" bk="c1" />
              </div>
            </div>

            {/* ── CHAT 2: the deck has 94 slides. ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase font-mono">
                <span className="text-slate-500">02 /</span>
                <span className="text-slate-500">WORK BESTIES · </span>
                <span className="text-amber-400">THE DECK CINEMATIC UNIVERSE</span>
              </div>

              <div className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-5 space-y-4 shadow-xl">
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
                    alt="Maya"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#222236]"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">the deck has 94 slides.</h3>
                    <div className="text-xs text-slate-400 mt-0.5">@mayamaybe × Anonymous · 2h ago · #workbesties</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {/* Msg 1 – Anon left */}
                  <div className="space-y-1 max-w-[72%]">
                    <div className="text-[11px] text-slate-500">Anonymous</div>
                    <div className="bg-[#1c2e47] border border-[#274268] text-white px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs font-medium">
                      the deck has 94 slides
                    </div>
                    <ReactionBar rkey="c2m1" r={reactions.c2m1} />
                  </div>

                  {/* Msg 2 – Maya right, slate */}
                  <div className="space-y-1 ml-auto max-w-[72%] flex flex-col items-end">
                    <div className="text-[11px] text-slate-500">Maya</div>
                    <div className="bg-[#202230] border border-[#2d3044] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs font-medium">
                      is the presentation a hostage situation
                    </div>
                    <ReactionBar rkey="c2m2" r={reactions.c2m2} />
                  </div>
                </div>

                <CardFooter reads="9.1k reads" bk="c2" />
              </div>
            </div>

            {/* ── CHAT 3: he brought a résumé to a first date. ── */}
            <div className="space-y-4 pb-6">
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase font-mono">
                <span className="text-slate-500">03 /</span>
                <span className="text-slate-500">DATING · </span>
                <span className="text-rose-400">REFERENCES AVAILABLE ON REQUEST</span>
              </div>

              <div className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-5 space-y-4 shadow-xl">
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
                    alt="Maya"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#222236]"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">he brought a résumé to a first date.</h3>
                    <div className="text-xs text-slate-400 mt-0.5">@mayamaybe × Anonymous · 3h ago · #dating</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {/* Msg 1 – Anon left, navy */}
                  <div className="space-y-1 max-w-[72%]">
                    <div className="text-[11px] text-slate-500">Anonymous</div>
                    <div className="bg-[#1c2e47] border border-[#274268] text-white px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs font-medium">
                      i brought a résumé to the date.
                    </div>
                    <ReactionBar rkey="c3m1" r={reactions.c3m1} />
                  </div>

                  {/* Msg 2 – Maya right, wine */}
                  <div className="space-y-1 ml-auto max-w-[72%] flex flex-col items-end">
                    <div className="text-[11px] text-slate-500">Maya</div>
                    <div className="bg-[#481c2d] border border-[#642840] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs font-medium">
                      please tell me this is a metaphor
                    </div>
                    <ReactionBar rkey="c3m2" r={reactions.c3m2} />
                  </div>
                </div>

                <CardFooter reads="18.4k reads" bk="c3" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[300px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* The after-hours edit info card */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 shadow-xl">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">THE AFTER-HOURS EDIT</div>
            <div className="text-[11px] text-blue-400 font-semibold mt-0.5">CURATED PUBLIC CHATS · OCT 12</div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Three small conversations with disproportionately big energy. Start with an allegedly quiet Friday.
          </p>
          <div className="space-y-2 pt-1 border-t border-[#181826]">
            <button
              onClick={() => onNavigate && onNavigate('Discover')}
              className="flex items-start gap-2 group cursor-pointer w-full text-left"
            >
              <span className="text-[11px] text-slate-500 font-mono shrink-0">01</span>
              <span className="text-[11px] text-slate-300 group-hover:text-white transition-colors">One drink, allegedly</span>
            </button>
            <button className="flex items-start gap-2 group cursor-pointer w-full text-left">
              <span className="text-[11px] text-slate-500 font-mono shrink-0">02</span>
              <span className="text-[11px] text-slate-300 group-hover:text-white transition-colors">Workplace extended universe</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('Topic detail', '#dating')}
              className="flex items-start gap-2 group cursor-pointer w-full text-left"
            >
              <span className="text-[11px] text-slate-500 font-mono shrink-0">03</span>
              <span className="text-[11px] text-slate-300 group-hover:text-white transition-colors">First-date interview</span>
            </button>
          </div>
        </div>

        {/* Editorial note */}
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-2">
          <div className="text-[11px] font-bold text-white">Editorial, not sponsored</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            These picks are organic public chats.{' '}
            <span
              onClick={() => onNavigate && onNavigate('After Hours sponsor detail')}
              className="text-blue-400 hover:underline cursor-pointer font-medium"
            >
              After Hours sponsor content
            </span>{' '}
            is a separate, clearly labelled placement, not part of this edit.
          </p>
        </div>

        {/* Public chat. Private identity */}
        <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              You can read and react, but never join the private conversation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span onClick={() => onNavigate && onNavigate('About CCHAT')} className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span onClick={() => onNavigate && onNavigate('Community rules')} className="hover:underline cursor-pointer">Community rules</span>
            <span>·</span>
            <span onClick={() => onNavigate && onNavigate('Privacy')} className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

export default App;
