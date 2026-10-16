import React, { useState, useEffect, useRef } from 'react';
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
  ChevronUp,
  Sparkles,
  LogOut,
  User,
  Menu,
  ShieldAlert,
  Camera,
  ArrowLeft,
  FileText,
  Paperclip
} from 'lucide-react';
import { EmojiPicker } from './components/EmojiPicker';
import { AboutPage } from './pages/AboutPage';
import { CommunityRulesPage } from './pages/CommunityRulesPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SponsorshipPage } from './pages/SponsorshipPage';
import { AfterHoursPage } from './pages/AfterHoursPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { cchatApi, UserProfile, PublicExcerptItem, TopicItem } from './services/api';
import { MyChatsPage } from './pages/MyChatsPage';
import { LoginPage } from './pages/LoginPage';
import { UserAvatar } from './components/UserAvatar';

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

// Mobile bottom navigation bar matching Figma dock
export function MobileBottomNav({
  activeNav,
  onNav,
  chatCount,
}: {
  activeNav: string;
  onNav: (nav: string) => void;
  chatCount?: number;
}) {
  const items = [
    { id: 'Discover', label: 'Discover', icon: Compass },
    { id: 'Following', label: 'Following', icon: Users },
    {
      id: 'My chats',
      label: 'My chats',
      icon: MessageSquare,
      badge: chatCount && chatCount > 0 ? (chatCount > 99 ? '99+' : String(chatCount)) : undefined,
    },
    { id: 'Profile', label: 'You', icon: User },
  ];

  return (
    <nav className="shrink-0 bg-[#09090f]/95 backdrop-blur-md border-t border-[#171722] py-2 px-4 z-30 select-none">
      <div className="flex items-center justify-around">
        {items.map(({ id, label, icon: Icon, badge }) => {
          const isActive =
            activeNav === id ||
            (id === 'Discover' && (activeNav === "Tonight's picks" || activeNav === 'Fresh'));
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 cursor-pointer transition-colors relative ${
                isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 stroke-[2.2]" />
                {badge && (
                  <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight shadow">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'font-bold text-blue-400' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}


// ─────────────────────────────────────────────────────────────
// LEFT SIDEBAR (shared across all views)
// ─────────────────────────────────────────────────────────────
interface SidebarProps {
  activeNav: string;
  onNav: (nav: string) => void;
  currentUser?: UserProfile | string | null;
  onLogout?: () => void;
  onClose?: () => void;
  isMobileDrawer?: boolean;
  chatCount?: number;
}

function Sidebar({ activeNav, onNav, currentUser, onLogout, onClose, isMobileDrawer, chatCount }: SidebarProps) {
  const isStaff = typeof currentUser === 'object' && currentUser !== null && currentUser.is_staff === true;

  const navItems = [
    { id: 'Discover', icon: Compass, label: 'Discover' },
    { id: 'Following', icon: Users, label: 'Following' },
    {
      id: 'My chats',
      icon: MessageSquare,
      label: 'My chats',
      badge: chatCount && chatCount > 0 ? (chatCount > 99 ? '99+' : String(chatCount)) : undefined,
    },
    { id: 'Saved', icon: Bookmark, label: 'Saved' },
    ...(isStaff ? [{ id: 'Admin', icon: ShieldAlert, label: 'Admin', badge: undefined as string | undefined }] : []),
  ];

  const handleDisplay =
    typeof currentUser === 'object' && currentUser !== null && currentUser.handle
      ? currentUser.handle
      : typeof currentUser === 'string' && currentUser
      ? currentUser.startsWith('@')
        ? currentUser
        : `@${currentUser}`
      : '@user';

  const nameDisplay =
    typeof currentUser === 'object' && currentUser !== null && currentUser.display_name
      ? currentUser.display_name
      : typeof currentUser === 'string' && currentUser
      ? currentUser.replace(/^@/, '')
      : 'Your Profile';

  return (
    <aside className="w-full shrink-0 flex flex-col justify-between p-4 bg-[#09090f] h-full">
      <div className="space-y-6">
        {/* Logo and optional mobile drawer close button */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNav('Discover')}>
            <CchatLogoIcon />
            <h1 className="text-xl font-black tracking-tight text-white">CCHAT</h1>
          </div>
          {isMobileDrawer && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#151522] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
            <UserAvatar
              src={typeof currentUser === 'object' ? currentUser?.avatar_url : undefined}
              name={nameDisplay}
              handle={handleDisplay}
              size="sm"
              className="w-9 h-9"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{nameDisplay}</div>
              <div className="text-[11px] text-slate-500 truncate">{handleDisplay}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onNav('Account and settings')}
              className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-[#151522] transition-colors cursor-pointer"
              title="Account and settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-[#151522] transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
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

interface DiscoverMessage {
  id: string;
  sender: string;
  isRight: boolean;
  text: string;
  badge?: string;
  badgePos?: 'left' | 'right';
  badgeAnim?: string;
  bubbleColor: string;
}

interface DiscoverStory {
  id: string;
  backendId: number;
  title: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  authorInitials?: string;
  timeAgo: string;
  topicTag: string;
  readingNow: string;
  reads: string;
  upNext: {
    label: string;
    title: string;
  };
  messages: DiscoverMessage[];
}

const DISCOVER_STORIES: DiscoverStory[] = [
  {
    id: 'story-0',
    backendId: 3,
    title: 'he brought a résumé to a first date.',
    authorName: 'Maya',
    authorHandle: '@mayamaybe',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    timeAgo: '2h ago',
    topicTag: '#dating',
    readingNow: '386 reading now',
    reads: '18.4k reads',
    upNext: {
      label: 'UP NEXT / ROOMMATE LORE',
      title: 'the rent is due. the raccoon is not on the lease.',
    },
    messages: [
      { id: 's0m1', sender: 'Anonymous', isRight: false, text: 'i brought a résumé to the date.', badge: '🧢', badgePos: 'right', badgeAnim: 'animate-bounce', bubbleColor: 'bg-[#152a48] border-[#1e3d68] text-slate-100' },
      { id: 's0m2', sender: 'Maya', isRight: true, text: 'please tell me this is a metaphor', bubbleColor: 'bg-[#421d33] border-[#5d2a49] text-rose-50' },
      { id: 's0m3', sender: 'Anonymous', isRight: false, text: 'two pages. references available on request.', bubbleColor: 'bg-[#152a48] border-[#1e3d68] text-slate-100' },
      { id: 's0m4', sender: 'Maya', isRight: true, text: 'did you at least get the position?', badge: '💀', badgePos: 'left', badgeAnim: 'animate-pulse', bubbleColor: 'bg-[#1d222e] border-[#2d3445] text-slate-100' },
      { id: 's0m5', sender: 'Anonymous', isRight: false, text: 'second interview on friday. benefits include pasta.', badge: '🔥', badgePos: 'right', bubbleColor: 'bg-[#382617] border-[#543b24] text-amber-100' },
      { id: 's0m6', sender: 'Maya', isRight: true, text: 'honestly? hired.', badge: '💙', badgePos: 'left', bubbleColor: 'bg-[#421d33] border-[#5d2a49] text-rose-50' },
    ],
  },
  {
    id: 'story-1',
    backendId: 1,
    title: 'the rent is due. the raccoon is not on the lease.',
    authorName: 'Jules',
    authorHandle: '@julespark',
    authorInitials: 'JU',
    timeAgo: '45m ago',
    topicTag: '#roommatelore',
    readingNow: '412 reading now',
    reads: '6.2k reads',
    upNext: {
      label: 'UP NEXT / FRIDAY PLANS',
      title: 'we said one drink.',
    },
    messages: [
      { id: 's1m1', sender: 'Anonymous', isRight: false, text: 'who adopted a raccoon', bubbleColor: 'bg-[#152a48] border-[#1e3d68] text-slate-100' },
      { id: 's1m2', sender: 'Jules', isRight: true, text: 'nobody adopted him. he chose us.', badge: '🦝', badgePos: 'left', bubbleColor: 'bg-[#421d33] border-[#5d2a49] text-rose-50' },
      { id: 's1m3', sender: 'Anonymous', isRight: false, text: 'i need the air fryer on thursday', bubbleColor: 'bg-[#152a48] border-[#1e3d68] text-slate-100' },
      { id: 's1m4', sender: 'Jules', isRight: true, text: 'thursday is my crispy day', badge: '🍟', badgePos: 'left', bubbleColor: 'bg-[#1d222e] border-[#2d3445] text-slate-100' },
      { id: 's1m5', sender: 'Anonymous', isRight: false, text: 'we cannot co-parent an appliance', badge: '💀', badgePos: 'right', bubbleColor: 'bg-[#382617] border-[#543b24] text-amber-100' },
      { id: 's1m6', sender: 'Jules', isRight: true, text: 'tell that to the shared calendar', badge: '🗓️', badgePos: 'left', bubbleColor: 'bg-[#421d33] border-[#5d2a49] text-rose-50' },
    ],
  },
  {
    id: 'story-2',
    backendId: 2,
    title: 'we said one drink.',
    authorName: 'Jules',
    authorHandle: '@julespark',
    authorInitials: 'JU',
    timeAgo: '42m ago',
    topicTag: '#dating',
    readingNow: '520 reading now',
    reads: '4.8k reads',
    upNext: {
      label: 'UP NEXT / WORK BESTIES',
      title: 'the deck has 94 slides.',
    },
    messages: [
      { id: 's2m1', sender: 'Anonymous', isRight: false, text: 'we said one drink', badge: '🧢', badgePos: 'right', bubbleColor: 'bg-[#1c2e47] border border-[#274268] text-white' },
      { id: 's2m2', sender: 'Jules', isRight: true, text: 'this is still the same evening', bubbleColor: 'bg-[#481c2d] border border-[#642840] text-white' },
      { id: 's2m3', sender: 'Anonymous', isRight: false, text: 'it is Saturday', badge: '💀', badgePos: 'right', bubbleColor: 'bg-[#1c2e47] border border-[#274268] text-white' },
      { id: 's2m4', sender: 'Jules', isRight: true, text: 'a technicality', bubbleColor: 'bg-[#202230] border border-[#2d3044] text-white' },
      { id: 's2m5', sender: 'Anonymous', isRight: false, text: 'why is there a karaoke receipt', badge: '🔥', badgePos: 'right', bubbleColor: 'bg-[#3f2717] border border-[#5a3821] text-white' },
      { id: 's2m6', sender: 'Jules', isRight: true, text: 'because we invested in the arts.', badge: '🩷', badgePos: 'left', bubbleColor: 'bg-[#481c2d] border border-[#642840] text-white' },
    ],
  },
  {
    id: 'story-3',
    backendId: 4,
    title: 'the deck has 94 slides.',
    authorName: 'Maya',
    authorHandle: '@mayamaybe',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    timeAgo: '1h ago',
    topicTag: '#workbesties',
    readingNow: '694 reading now',
    reads: '9.1k reads',
    upNext: {
      label: 'UP NEXT / DATING',
      title: 'he brought a résumé to a first date.',
    },
    messages: [
      { id: 's3m1', sender: 'Anonymous', isRight: false, text: 'the deck has 94 slides', bubbleColor: 'bg-[#1c2e47] border border-[#274268] text-white' },
      { id: 's3m2', sender: 'Maya', isRight: true, text: 'is the presentation a hostage situation', badge: '💀', badgePos: 'left', bubbleColor: 'bg-[#202230] border border-[#2d3044] text-white' },
      { id: 's3m3', sender: 'Anonymous', isRight: false, text: 'there are 14 appendices', bubbleColor: 'bg-[#1c2e47] border border-[#274268] text-white' },
      { id: 's3m4', sender: 'Maya', isRight: true, text: 'i am reporting this to human rights', badge: '🔥', badgePos: 'left', bubbleColor: 'bg-[#382617] border border-[#5a3821] text-amber-100' },
      { id: 's3m5', sender: 'Anonymous', isRight: false, text: 'slide 42 is an infographic about synergy', badge: '📊', badgePos: 'right', bubbleColor: 'bg-[#1c2e47] border border-[#274268] text-white' },
      { id: 's3m6', sender: 'Maya', isRight: true, text: "i'm going to eat my lanyard", badge: '❤️', badgePos: 'left', bubbleColor: 'bg-[#421d33] border border-[#5d2a49] text-rose-50' },
    ],
  },
];

const INITIAL_REACTIONS: Record<string, { heart: number; cap: number; skull: number; fire: number; userReacted: string | null }> = {
  s0m1: { heart: 124, cap: 1200, skull: 486, fire: 82, userReacted: 'cap' },
  s0m2: { heart: 842, cap: 32, skull: 211, fire: 64, userReacted: 'heart' },
  s0m3: { heart: 98, cap: 1800, skull: 920, fire: 143, userReacted: 'cap' },
  s0m4: { heart: 215, cap: 48, skull: 2400, fire: 306, userReacted: 'skull' },
  s0m5: { heart: 673, cap: 125, skull: 1100, fire: 2100, userReacted: 'fire' },
  s0m6: { heart: 1600, cap: 24, skull: 328, fire: 542, userReacted: 'heart' },

  s1m1: { heart: 45, cap: 920, skull: 1400, fire: 310, userReacted: 'skull' },
  s1m2: { heart: 1200, cap: 88, skull: 450, fire: 190, userReacted: 'heart' },
  s1m3: { heart: 32, cap: 410, skull: 780, fire: 65, userReacted: null },
  s1m4: { heart: 512, cap: 15, skull: 1890, fire: 420, userReacted: 'skull' },
  s1m5: { heart: 340, cap: 770, skull: 2200, fire: 180, userReacted: 'skull' },
  s1m6: { heart: 890, cap: 42, skull: 1300, fire: 670, userReacted: 'fire' },

  s2m1: { heart: 120, cap: 1850, skull: 340, fire: 92, userReacted: 'cap' },
  s2m2: { heart: 650, cap: 24, skull: 110, fire: 48, userReacted: 'heart' },
  s2m3: { heart: 84, cap: 920, skull: 2100, fire: 140, userReacted: 'skull' },
  s2m4: { heart: 320, cap: 18, skull: 1450, fire: 210, userReacted: 'skull' },
  s2m5: { heart: 430, cap: 110, skull: 890, fire: 1650, userReacted: 'fire' },
  s2m6: { heart: 2400, cap: 15, skull: 210, fire: 590, userReacted: 'heart' },

  s3m1: { heart: 78, cap: 1200, skull: 1800, fire: 120, userReacted: 'skull' },
  s3m2: { heart: 410, cap: 30, skull: 2800, fire: 390, userReacted: 'skull' },
  s3m3: { heart: 55, cap: 640, skull: 1350, fire: 80, userReacted: null },
  s3m4: { heart: 980, cap: 22, skull: 1950, fire: 2400, userReacted: 'fire' },
  s3m5: { heart: 110, cap: 890, skull: 1620, fire: 190, userReacted: 'cap' },
  s3m6: { heart: 3200, cap: 12, skull: 840, fire: 910, userReacted: 'heart' },
};

function DiscoverPage({
  onNavigateTab,
  onNavigate,
  onOpenMenu,
}: {
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (nav: string, topic?: string) => void;
  onOpenMenu?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'For you' | 'Following' | 'Fresh'>('For you');
  const [savedStories, setSavedStories] = useState<Record<number, boolean>>({});
  const [reactions, setReactions] = useState(INITIAL_REACTIONS);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  const feedContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n.toString();

  const toggle = async (key: string, type: 'heart' | 'cap' | 'skull' | 'fire') => {
    setReactions(prev => {
      const c = prev[key] || { heart: 0, cap: 0, skull: 0, fire: 0, userReacted: null };
      const already = c.userReacted === type;
      return {
        ...prev,
        [key]: {
          ...c,
          [type]: already ? Math.max(0, c[type] - 1) : c[type] + 1,
          userReacted: already ? null : type,
        },
      };
    });
  };

  const handleToggleSave = async (storyIdx: number, backendId: number) => {
    setSavedStories(prev => ({ ...prev, [storyIdx]: !prev[storyIdx] }));
    try {
      await cchatApi.toggleSaveExcerpt(backendId);
    } catch (e) {
      console.warn('Backend toggle save:', e);
    }
  };

  const handleTabClick = (tab: 'For you' | 'Following' | 'Fresh') => {
    if (tab === 'Following' && onNavigateTab) {
      onNavigateTab('Following');
    } else {
      setActiveTab(tab);
    }
  };

  const scrollToStory = (targetIndex: number) => {
    const clampedIndex = (targetIndex + DISCOVER_STORIES.length) % DISCOVER_STORIES.length;
    const el = document.getElementById(`discover-story-${clampedIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveStoryIdx(clampedIndex);
    }
  };

  // Touch Swipe Handlers for mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;

    // Vertical swipe up -> next chat
    if (deltaY > 60 && Math.abs(deltaY) > Math.abs(deltaX)) {
      scrollToStory((activeStoryIdx + 1) % DISCOVER_STORIES.length);
    }
    // Vertical swipe down -> previous chat
    else if (deltaY < -60 && Math.abs(deltaY) > Math.abs(deltaX)) {
      scrollToStory((activeStoryIdx - 1 + DISCOVER_STORIES.length) % DISCOVER_STORIES.length);
    }
    // Horizontal swipe left -> next chat
    else if (deltaX > 60 && Math.abs(deltaX) > Math.abs(deltaY)) {
      scrollToStory((activeStoryIdx + 1) % DISCOVER_STORIES.length);
    }
    // Horizontal swipe right -> previous chat
    else if (deltaX < -60 && Math.abs(deltaX) > Math.abs(deltaY)) {
      scrollToStory((activeStoryIdx - 1 + DISCOVER_STORIES.length) % DISCOVER_STORIES.length);
    }
  };

  // Scroll spy to track currently visible story
  const handleScroll = () => {
    if (!feedContainerRef.current) return;
    const containerTop = feedContainerRef.current.getBoundingClientRect().top;
    let closestIndex = activeStoryIdx;
    let closestDist = Infinity;

    DISCOVER_STORIES.forEach((_, idx) => {
      const el = document.getElementById(`discover-story-${idx}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - containerTop);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = idx;
        }
      }
    });

    if (closestIndex !== activeStoryIdx) {
      setActiveStoryIdx(closestIndex);
    }
  };

  const ReactionBar = ({ msgKey, className = '' }: { msgKey: string; className?: string }) => {
    const r = reactions[msgKey] || { heart: 0, cap: 0, skull: 0, fire: 0, userReacted: null };
    const types = [
      { type: 'heart' as const, icon: <Heart className="w-3 h-3 fill-current text-rose-400" />, active: 'bg-[#3f192b] border-[#7d2952] text-rose-300' },
      { type: 'cap' as const, icon: <CapIcon />, active: 'bg-[#182a45] border-[#254d87] text-blue-300' },
      { type: 'skull' as const, icon: <SkullIcon />, active: 'bg-[#2a1738] border-[#6b2c8f] text-purple-300' },
      { type: 'fire' as const, icon: <Flame className="w-3 h-3 text-amber-400 fill-current" />, active: 'bg-[#3a2211] border-[#7c461e] text-amber-300' },
    ];
    return (
      <div className={`flex items-center gap-1.5 mt-2 flex-wrap ${className}`}>
        {types.map(({ type, icon, active }) => (
          <button
            key={type}
            type="button"
            onClick={() => toggle(msgKey, type)}
            className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border transition-colors cursor-pointer select-none ${
              r.userReacted === type ? `${active} font-semibold shadow-xs` : 'bg-[#141420] border-[#232336] text-slate-400 hover:text-white'
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
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 relative">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#151522] transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate && onNavigate('Discover')}>
              <span className="md:hidden"><CchatLogoIcon /></span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                <span className="hidden md:inline">The plot is public.</span>
                <span className="md:hidden font-black">CCHAT</span>
              </h2>
            </div>
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
                onClick={() => onNavigate?.('Search')}
                className="w-full bg-[#12121c] border border-[#212130] focus:border-blue-500 rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors cursor-pointer"
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

        {/* Tabs */}
        <div className="px-4 sm:px-6 md:px-8 pt-4 pb-2.5 flex items-center justify-between border-b border-[#141420] sm:border-0 shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            {(['For you', 'Following', 'Fresh'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`text-sm font-bold transition-all relative pb-1 cursor-pointer ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>}
              </button>
            ))}
          </div>
          <span className="hidden sm:inline text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            ONE CHAT. ONE MORE PLOT TWIST.
          </span>
        </div>

        {/* Scrollable Feed Container with Touch Swipe & Smooth Scroll */}
        <div
          ref={feedContainerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onScroll={handleScroll}
          className="flex-1 px-4 sm:px-6 md:px-8 py-3 pb-24 md:pb-12 overflow-y-auto space-y-8 scroll-smooth"
        >
          {DISCOVER_STORIES.map((story, storyIdx) => {
            const isSaved = Boolean(savedStories[storyIdx]);
            return (
              <div key={story.id} id={`discover-story-${storyIdx}`} className="space-y-4 scroll-mt-6">
                <article className="rounded-2xl sm:rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-4 sm:p-6 shadow-xl">
                  {/* Card Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-[#181826]">
                    <div className="flex items-center gap-3">
                      {story.authorAvatar ? (
                        <img
                          src={story.authorAvatar}
                          alt={story.authorName}
                          onClick={() => onNavigate?.('Profile', story.authorHandle)}
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#2c2c3e] hover:border-blue-500 transition-colors cursor-pointer"
                        />
                      ) : (
                        <div
                          onClick={() => onNavigate?.('Profile', story.authorHandle)}
                          className="w-11 h-11 rounded-full bg-[#1c1c2e] border-2 border-[#2c2c3e] hover:border-blue-500 transition-colors flex items-center justify-center text-xs font-black text-slate-300 cursor-pointer"
                        >
                          {story.authorInitials || 'CC'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                          {story.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <button
                            type="button"
                            onClick={() => onNavigate?.('Profile', story.authorHandle)}
                            className="font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {story.authorHandle}
                          </button>
                          <span>×</span>
                          <span className="text-slate-400">Anonymous</span>
                          <span>•</span>
                          <span>{story.timeAgo}</span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => onNavigate?.('Topic detail', story.topicTag)}
                            className="text-blue-400/90 font-medium hover:underline cursor-pointer"
                          >
                            {story.topicTag}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('Topic detail', story.topicTag)}
                      className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-[#191929] transition-colors cursor-pointer"
                      title="More options"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Reading Status */}
                  <div className="py-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{story.readingNow}</span>
                    <span>•</span>
                    <span>reactions set the mood</span>
                  </div>

                  {/* Messages list */}
                  <div className="space-y-4 py-2">
                    {story.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`space-y-1.5 flex flex-col ${m.isRight ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 px-0.5">
                          <span>{m.sender}</span>
                          {!m.isRight && <ShieldCheck className="w-3 h-3 text-blue-400" />}
                        </div>

                        <div className={`flex items-center gap-3 max-w-[75%] sm:max-w-[70%] ${m.isRight ? 'flex-row-reverse' : 'flex-row'}`}>
                          {m.badge && (
                            <span className={`text-xl select-none shrink-0 ${m.badgeAnim || ''}`}>
                              {m.badge}
                            </span>
                          )}
                          <div className={`w-fit max-w-full flex flex-col ${m.isRight ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium leading-relaxed ${
                                m.isRight ? 'rounded-tr-sm' : 'rounded-tl-sm'
                              } ${m.bubbleColor}`}
                            >
                              {m.text}
                            </div>
                            <ReactionBar msgKey={m.id} className={m.isRight ? 'justify-end' : 'justify-start'} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-4 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>{story.reads}</span>
                      <span className="flex items-center gap-1 text-slate-400 font-medium">
                        <SkullIcon /> Reactions active
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSave(storyIdx, story.backendId)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          isSaved ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'
                        }`}
                        title={isSaved ? 'Saved' : 'Save excerpt'}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          alert('Excerpt link copied to clipboard!');
                        }}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer"
                        title="Share excerpt"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>

                {/* Interactive Up Next / Scroll to next chat Banner */}
                <div
                  onClick={() => scrollToStory((storyIdx + 1) % DISCOVER_STORIES.length)}
                  className="p-4 rounded-2xl bg-[#11111c] border border-[#1e1e2d] hover:border-blue-500/50 flex items-center justify-between cursor-pointer hover:bg-[#151524] transition-all group shadow-md active:scale-[0.99]"
                  title="Scroll to next chat"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase group-hover:text-blue-400 transition-colors">
                      {story.upNext.label}
                    </div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white mt-0.5 truncate">
                      {story.upNext.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-blue-400 shrink-0">
                    <span>Scroll to next chat</span>
                    <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Sponsored Box at bottom of feed */}
          <div className="mt-8 p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">SPONSORED</span>
              <span className="text-[10px] font-bold text-slate-500 bg-[#171724] px-1.5 py-0.5 rounded border border-[#222232]">Ad</span>
            </div>
            <h4 className="text-sm font-extrabold text-white">Tonight's sponsor</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This Discover page is supported by After Hours. Keep the conversation going with a late-night coffee or a fresh playlist.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('After Hours sponsor detail')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all"
              >
                <span>Visit After Hours</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('Sponsorship / Learn more')}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
              >
                Learn more
              </button>
            </div>
          </div>
        </div>

        {/* Floating Quick Navigation Pill */}
        <div className="absolute bottom-5 inset-x-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#131926]/90 backdrop-blur-md border border-[#24354c] shadow-2xl text-xs font-semibold text-slate-200">
            <button
              type="button"
              onClick={() => scrollToStory((activeStoryIdx - 1 + DISCOVER_STORIES.length) % DISCOVER_STORIES.length)}
              className="p-1 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Previous chat"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-slate-300 font-mono px-1">
              Chat {activeStoryIdx + 1} of {DISCOVER_STORIES.length}
            </span>
            <button
              type="button"
              onClick={() => scrollToStory((activeStoryIdx + 1) % DISCOVER_STORIES.length)}
              className="p-1 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Next chat"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-[#09090f] border-l border-[#171722]">
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
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Only the publisher published this chat. Other participants stay anonymous.</p>
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
interface FollowingPageProps {
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (nav: string, handleOrTopic?: string) => void;
  onOpenMenu?: () => void;
  currentUser?: UserProfile | null;
  onUpdateUser?: (updated: UserProfile) => void;
}

function FollowingPage({ onNavigateTab, onNavigate, onOpenMenu, currentUser, onUpdateUser }: FollowingPageProps) {
  const [activeTab, setActiveTab] = useState<'For you' | 'Following' | 'Fresh'>('Following');
  const [loading, setLoading] = useState(true);
  const [followingUsers, setFollowingUsers] = useState<UserProfile[]>([]);
  const [suggestedPeople, setSuggestedPeople] = useState<UserProfile[]>([]);
  const [excerpts, setExcerpts] = useState<PublicExcerptItem[]>([]);
  const [savedExcerpts, setSavedExcerpts] = useState<Record<number, boolean>>({});

  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : (n || 0).toString();

  const getInitials = (name?: string, handle?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.trim().slice(0, 2).toUpperCase();
    }
    if (handle) {
      return handle.replace(/^@/, '').slice(0, 2).toUpperCase();
    }
    return '??';
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [followingRes, usersRes, excerptsRes] = await Promise.all([
        cchatApi.getFollowing().catch(() => []),
        cchatApi.getUsers().catch(() => []),
        cchatApi.getExcerpts({ tab: 'following' }).catch(() => []),
      ]);

      const followingList = Array.isArray(followingRes) ? followingRes : [];
      setFollowingUsers(followingList);
      setExcerpts(Array.isArray(excerptsRes) ? excerptsRes : []);

      const savedMap: Record<number, boolean> = {};
      if (Array.isArray(excerptsRes)) {
        excerptsRes.forEach(e => {
          if (e.is_saved) savedMap[e.id] = true;
        });
      }
      setSavedExcerpts(savedMap);

      const followedIds = new Set(followingList.map(u => u.id));
      const followedHandles = new Set(followingList.map(u => (u.handle || '').toLowerCase()));
      const currentHandle = (currentUser?.handle || '').toLowerCase();
      const currentId = currentUser?.id;

      const allUsers = Array.isArray(usersRes) ? usersRes : [];
      const suggestions = allUsers.filter(u => {
        if (currentId && u.id === currentId) return false;
        if (currentHandle && (u.handle || '').toLowerCase() === currentHandle) return false;
        if (followedIds.has(u.id)) return false;
        if (followedHandles.has((u.handle || '').toLowerCase())) return false;
        return true;
      });
      setSuggestedPeople(suggestions);
    } catch (err) {
      console.warn('Failed to load following feed data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.handle, currentUser?.id]);

  const handleToggleFollow = async (user: UserProfile) => {
    const targetIdentifier = user.id || user.handle;
    try {
      const res = await cchatApi.toggleFollow(targetIdentifier);
      if (res.is_following) {
        setFollowingUsers(prev => [...prev, user]);
        setSuggestedPeople(prev => prev.filter(p => p.id !== user.id && p.handle !== user.handle));
      } else {
        setFollowingUsers(prev => prev.filter(u => u.id !== user.id && u.handle !== user.handle));
        setSuggestedPeople(prev => [user, ...prev]);
      }

      if (currentUser && onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          following_count: res.following_count,
        });
      }

      // Re-fetch excerpts to reflect the updated following
      const updatedExcerpts = await cchatApi.getExcerpts({ tab: 'following' }).catch(() => []);
      setExcerpts(Array.isArray(updatedExcerpts) ? updatedExcerpts : []);
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  const handleToggleSave = async (excerptId: number) => {
    const wasSaved = !!savedExcerpts[excerptId];
    setSavedExcerpts(prev => ({ ...prev, [excerptId]: !wasSaved }));
    try {
      await cchatApi.toggleSaveExcerpt(excerptId);
    } catch (err) {
      console.warn('Failed to toggle save:', err);
    }
  };

  const handleReactMessage = async (excerptId: number, msgId: number, type: 'heart' | 'cap' | 'skull' | 'fire') => {
    setExcerpts(prev => prev.map(exc => {
      if (exc.id !== excerptId) return exc;
      return {
        ...exc,
        messages: exc.messages.map(msg => {
          if (msg.id !== msgId) return msg;
          const userReacted = msg.reactions?.user_reacted;
          const alreadyReacted = userReacted === type;
          const currentCount = msg.reactions ? (msg.reactions[type] || 0) : 0;
          return {
            ...msg,
            reactions: {
              ...(msg.reactions || { heart: 0, cap: 0, skull: 0, fire: 0, dominant: '' }),
              [type]: alreadyReacted ? Math.max(0, currentCount - 1) : currentCount + 1,
              user_reacted: alreadyReacted ? null : type,
            }
          };
        })
      };
    }));

    try {
      await cchatApi.reactMessage(msgId, type);
    } catch (err) {
      console.warn('Failed to react to message:', err);
    }
  };

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
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">Following</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('Search')}
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
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-5 pb-20 md:pb-5 overflow-y-auto space-y-6">
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

          {/* Dynamic Feed Content */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <span className="text-xs">Loading followed chats...</span>
            </div>
          ) : followingUsers.length === 0 ? (
            /* Empty state when user follows no one */
            <div className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-8 sm:p-12 text-center space-y-6 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-[#171724] border border-[#252538] mx-auto flex items-center justify-center text-blue-400">
                <Users className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">You're not following anyone yet</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When you follow creators, their public excerpted chats will show up here. Until then, you can explore what everyone's talking about or follow suggested creators below.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleTabClick('For you')}
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Discover Feed</span>
                </button>
                <button
                  onClick={() => handleTabClick('Fresh')}
                  className="px-5 py-2.5 rounded-full bg-[#181826] hover:bg-[#202034] border border-[#27273d] text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Browse Fresh Chats</span>
                </button>
              </div>

              {suggestedPeople.length > 0 && (
                <div className="pt-6 border-t border-[#181826] max-w-lg mx-auto text-left">
                  <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
                    <span>People you might like</span>
                    <span className="text-[10px] text-slate-500 font-normal">One tap to start your feed</span>
                  </div>
                  <div className="space-y-2.5">
                    {suggestedPeople.slice(0, 3).map(person => (
                      <div key={person.handle} className="flex items-center justify-between p-3 rounded-2xl bg-[#141420] border border-[#222234]">
                        <div
                          onClick={() => onNavigate?.('Profile', person.handle)}
                          className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {person.avatar_url ? (
                            <img src={person.avatar_url} alt={person.display_name} className="w-9 h-9 rounded-full object-cover border border-[#2b2b40] shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#1d1d2e] border border-[#2c2c44] flex items-center justify-center font-bold text-xs text-slate-300 shrink-0">
                              {getInitials(person.display_name, person.handle)}
                            </div>
                          )}
                          <div className="truncate">
                            <div className="text-xs font-bold text-white truncate">{person.display_name || person.handle}</div>
                            <div className="text-[10px] text-slate-400 truncate">{person.handle} {person.bio ? `· ${person.bio}` : ''}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleFollow(person)}
                          className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 ml-3"
                        >
                          Follow
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : excerpts.length === 0 ? (
            /* Follows creators, but no excerpts yet */
            <div className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-8 sm:p-12 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-[#171724] border border-[#252538] mx-auto flex items-center justify-center text-slate-400">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">No published chats yet from people you follow</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                The {followingUsers.length} {followingUsers.length === 1 ? 'creator' : 'creators'} you follow haven't excerpted any conversations yet. Check back soon or explore trending topics on Discover.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleTabClick('For you')}
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Explore Discover Feed
                </button>
              </div>
            </div>
          ) : (
            /* Followed Excerpts Feed */
            <div className="space-y-6">
              {excerpts.map(excerpt => {
                const isSaved = !!savedExcerpts[excerpt.id];
                const publisherName = excerpt.authors_summary || 'Creator';
                const publisherInitials = getInitials(publisherName);

                return (
                  <article key={excerpt.id} className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl">
                    {/* Header */}
                    <div className="flex items-start justify-between pb-4">
                      <div
                        onClick={() => {
                          const handle = excerpt.authors_summary?.split(/[\s×·,]+/)[0];
                          if (handle) onNavigate?.('Profile', handle);
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-[#181828] border border-[#25253a] flex items-center justify-center font-bold text-xs text-slate-300">
                          {publisherInitials}
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-white tracking-tight">{excerpt.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <span className="font-semibold text-slate-400">{excerpt.authors_summary}</span>
                            <span>·</span>
                            <span className="text-slate-400 font-medium">{excerpt.topic?.tag || '#public'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reading now indicator */}
                    <div className="py-2 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{fmt(excerpt.reads_count)} reads · reactions set the mood</span>
                    </div>

                    {/* Message Sequence */}
                    <div className="space-y-4 py-2">
                      {excerpt.messages.map((msg, idx) => {
                        const isRight = idx % 2 === 1;
                        const r = msg.reactions || { heart: 0, cap: 0, skull: 0, fire: 0, dominant: '', user_reacted: null };
                        return (
                          <div key={msg.id} className={`space-y-1 flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
                            <div className={`text-[11px] text-slate-400 font-semibold ${isRight ? 'pr-1' : 'pl-1'}`}>
                              {msg.sender_display}
                            </div>
                            <div className={`rounded-2xl px-5 py-3.5 text-sm font-medium w-full sm:w-[68%] ${
                              isRight
                                ? 'rounded-tr-sm bg-[#421d33] border border-[#5d2a49] text-rose-50'
                                : 'rounded-tl-sm bg-[#172d4b] border border-[#214373] text-slate-100'
                            }`}>
                              {msg.text}
                            </div>
                            <div className={`flex items-center gap-3 text-[11px] text-slate-500 font-medium ${isRight ? 'pr-1' : 'pl-1'} pt-0.5`}>
                              <button
                                onClick={() => handleReactMessage(excerpt.id, msg.id, 'heart')}
                                className={`flex items-center gap-1 cursor-pointer transition-colors ${
                                  r.user_reacted === 'heart' ? 'text-rose-400 font-bold' : 'hover:text-slate-300'
                                }`}
                              >
                                <span>♥</span>
                                <span>{fmt(r.heart)}</span>
                              </button>
                              <button
                                onClick={() => handleReactMessage(excerpt.id, msg.id, 'cap')}
                                className={`flex items-center gap-1 cursor-pointer transition-colors ${
                                  r.user_reacted === 'cap' ? 'text-blue-400 font-bold' : 'hover:text-slate-300'
                                }`}
                              >
                                <span>🧢</span>
                                <span>{fmt(r.cap)}</span>
                              </button>
                              <button
                                onClick={() => handleReactMessage(excerpt.id, msg.id, 'skull')}
                                className={`flex items-center gap-1 cursor-pointer transition-colors ${
                                  r.user_reacted === 'skull' ? 'text-purple-400 font-bold' : 'hover:text-slate-300'
                                }`}
                              >
                                <span>💀</span>
                                <span>{fmt(r.skull)}</span>
                              </button>
                              <button
                                onClick={() => handleReactMessage(excerpt.id, msg.id, 'fire')}
                                className={`flex items-center gap-1 cursor-pointer transition-colors ${
                                  r.user_reacted === 'fire' ? 'text-amber-400 font-bold' : 'hover:text-slate-300'
                                }`}
                              >
                                <span>🔥</span>
                                <span>{fmt(r.fire)}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Card Footer */}
                    <div className="mt-4 pt-4 border-t border-[#181826] flex items-center justify-between text-xs text-slate-500">
                      <span>{fmt(excerpt.reads_count)} reads · Public excerpt · Read & react only</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSave(excerpt.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isSaved ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-[#181826]'
                          }`}
                          title={isSaved ? 'Saved' : 'Save'}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(window.location.origin);
                              alert('Link copied to clipboard!');
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* End of Feed caption */}
              <div className="text-center py-4 text-xs text-slate-500 font-medium">
                You're caught up with the people you follow. Suggested people are ready when you are.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-[#09090f] border-l border-[#171722]">
        {/* Card 1: Your people · X following */}
        <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight">
              Your people · {followingUsers.length} following
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Manage who appears in this feed.</p>
          </div>

          {followingUsers.length === 0 ? (
            <div className="py-3 text-center text-xs text-slate-500 font-medium">
              Not following anyone yet.
            </div>
          ) : (
            <div className="space-y-3">
              {followingUsers.map(user => (
                <div key={user.handle} className="flex items-center justify-between">
                  <div
                    onClick={() => onNavigate && onNavigate('Profile', user.handle)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.display_name} className="w-8 h-8 rounded-full object-cover border border-[#27273d] shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#181828] border border-[#27273d] flex items-center justify-center font-bold text-[11px] text-slate-300 shrink-0">
                        {getInitials(user.display_name, user.handle)}
                      </div>
                    )}
                    <div className="truncate">
                      <div className="text-xs font-bold text-white leading-snug truncate">{user.display_name || user.handle}</div>
                      <div className="text-[10px] text-slate-500 truncate">{user.handle}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFollow(user)}
                    className="text-xs font-semibold text-blue-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer shrink-0 ml-2 group transition-colors"
                    title="Click to unfollow"
                  >
                    <span className="group-hover:hidden">Following</span>
                    <span className="hidden group-hover:inline">Unfollow</span>
                    <Check className="w-3 h-3 stroke-[2.5] group-hover:hidden" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-1 border-t border-[#181826]">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Select Following to unfollow. Their private chats are never included in the feed.
            </p>
          </div>
        </div>

        {/* Card 2: People you might like */}
        {suggestedPeople.length > 0 && (
          <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4">
            <div>
              <h4 className="text-sm font-extrabold text-white tracking-tight">People you might like</h4>
            </div>

            <div className="space-y-3.5">
              {suggestedPeople.slice(0, 5).map(person => (
                <div key={person.handle} className="flex items-center justify-between">
                  <div
                    onClick={() => onNavigate && onNavigate('Profile', person.handle)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {person.avatar_url ? (
                      <img src={person.avatar_url} alt={person.display_name} className="w-8 h-8 rounded-full object-cover border border-[#27273d] shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#181828] border border-[#27273d] flex items-center justify-center font-bold text-[11px] text-slate-300 shrink-0">
                        {getInitials(person.display_name, person.handle)}
                      </div>
                    )}
                    <div className="truncate">
                      <div className="text-xs font-bold text-white leading-snug truncate">{person.display_name || person.handle}</div>
                      <div className="text-[10px] text-slate-500 truncate">{person.handle}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFollow(person)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer transition-colors shrink-0 ml-2"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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

// ─────────────────────────────────────────────────────────────
// VIEW 3: MY CHATS PAGE (Imported from ./pages/MyChatsPage)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// VIEW 4: SAVED PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function SavedPage({ onNavigate, onOpenMenu }: { onNavigate?: (nav: string, handleOrTopic?: string) => void; onOpenMenu?: () => void }) {
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

  const toggleSaveCard = async (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, saved: !c.saved } : c));
    const numId = id === 'c1' ? 3 : id === 'c2' ? 2 : 1;
    try {
      await cchatApi.toggleSaveExcerpt(numId);
    } catch (e) {
      console.warn('Backend toggle save in SavedPage:', e);
    }
  };

  const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n.toString());

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Feed */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
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
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">Saved</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('Search')}
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
            <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-5 pb-20 md:pb-5 overflow-y-auto space-y-6">
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
                  onClick={() => onNavigate?.('Profile', cards[0].handle)}
                  className="w-10 h-10 rounded-full object-cover border border-[#2b2b3d] hover:border-blue-500 cursor-pointer transition-colors"
                />
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">{cards[0].title}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => onNavigate?.('Profile', cards[0].handle)}
                      className="font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {cards[0].handle}
                    </button>
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
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-[#09090f] border-l border-[#171722]">
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
function StartChatPage({
  currentUser,
  onNavigate,
  onOpenMenu,
}: {
  currentUser?: UserProfile | null;
  onNavigate?: (nav: string, handleOrTopic?: string) => void;
  onOpenMenu?: () => void;
}) {
  const [searchRecipient, setSearchRecipient] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<{
    initials: string;
    name: string;
    handle: string;
    subtext: string;
  } | null>(null);

  const [messageText, setMessageText] = useState('');
  const [keepPrivate, setKeepPrivate] = useState(true);

  // File and Emoji states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    file?: File;
    name: string;
    size: string;
    type: 'image' | 'document';
    dataUrl: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    const isImg = file.type.startsWith('image/');
    const dataUrl = await compressImageIfNeeded(file);
    if (!dataUrl) return;
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
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart ?? messageText.length;
      const end = textareaRef.current.selectionEnd ?? messageText.length;
      const nextText = messageText.substring(0, start) + emoji + messageText.substring(end);
      setMessageText(nextText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + emoji.length, start + emoji.length);
        }
      }, 10);
    } else {
      setMessageText(prev => prev + emoji);
    }
  };

  const [people, setPeople] = useState<Array<{ initials: string; name: string; handle: string }>>([
    { initials: 'JP', name: 'Jules Park', handle: '@julespark' },
    { initials: 'NP', name: 'Nina Patel', handle: '@ninapatel' },
    { initials: 'LM', name: 'Leo Martinez', handle: '@leomartinez' },
    { initials: 'MC', name: 'Maya Chen', handle: '@mayamaybe' },
  ]);

  useEffect(() => {
    cchatApi.getUsers()
      .then(users => {
        const others = users.filter(u => u.handle !== currentUser?.handle);
        if (others.length > 0) {
          const mapped = others.map(u => ({
            initials: u.display_name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'CC',
            name: u.display_name,
            handle: u.handle,
          }));
          setPeople(mapped);
          if (!selectedRecipient) {
            setSelectedRecipient({
              initials: mapped[0].initials,
              name: mapped[0].name,
              handle: mapped[0].handle,
              subtext: 'Registered user',
            });
            setSearchRecipient(mapped[0].name.split(' ')[0]);
          }
        }
      })
      .catch(() => {});
  }, [currentUser]);

  const handleSelectPerson = (person: { initials: string; name: string; handle: string }) => {
    setSelectedRecipient({
      initials: person.initials,
      name: person.name,
      handle: person.handle,
      subtext: 'Selected recipient',
    });
    setSearchRecipient(person.name.split(' ')[0]);
  };

  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if ((!messageText.trim() && !pendingAttachment) || sending) return;
    setSending(true);
    try {
      const handle = selectedRecipient?.handle || '@julespark';
      const attachmentPayload = pendingAttachment ? {
        url: pendingAttachment.dataUrl,
        name: pendingAttachment.name,
        type: pendingAttachment.type,
      } : undefined;
      await cchatApi.createChat(handle, messageText.trim(), selectedRecipient?.name || 'New Conversation', attachmentPayload);
      if (onNavigate) {
        onNavigate('My chats');
      }
    } catch (err: any) {
      console.error('Failed to create chat:', err);
      if (onNavigate) {
        onNavigate('My chats');
      }
    } finally {
      setSending(false);
    }
  };

  const matchingPeople = people.filter(p =>
    !searchRecipient.trim() ||
    p.name.toLowerCase().includes(searchRecipient.toLowerCase()) ||
    p.handle.toLowerCase().includes(searchRecipient.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0a0a0f] overflow-y-auto">
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
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">Start a chat</h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={() => onNavigate && onNavigate('Search')}
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
          <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl space-y-6 pb-20 md:pb-8">
        {/* Section Header */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">PRIVATE MESSAGES</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5 leading-tight">The plot starts with a hello.</h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Find someone by name or handle. Your first message is private, not a public post.
          </p>
        </div>

        {/* 2-Column Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Recipient search & Recent people */}
          <div className="col-span-1 lg:col-span-5 space-y-4">
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

              <div className="text-[11px] text-slate-500 font-medium">
                {matchingPeople.length} matching {matchingPeople.length === 1 ? 'person' : 'people'}
              </div>

              {/* Matched person card */}
              {selectedRecipient && (
                <div
                  className="p-3 rounded-2xl bg-[#141422] border border-blue-500/40 flex items-center justify-between transition-colors"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onNavigate?.('Profile', selectedRecipient.handle)}
                    title="View public profile"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1a1a2c] border border-[#282840] group-hover:border-blue-500 flex items-center justify-center font-bold text-[11px] text-blue-400 transition-colors">
                      {selectedRecipient.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <span>{selectedRecipient.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">View profile →</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{selectedRecipient.handle} · Selected</div>
                    </div>
                  </div>
                  <div className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                    <span>Selected</span>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              )}
            </div>

            {/* Card: Recent people */}
            <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-xl">
              <h4 className="text-sm font-extrabold text-white">Recent people</h4>
              <div className="space-y-3">
                {matchingPeople.map(p => {
                  const isSelected = selectedRecipient?.handle === p.handle;
                  return (
                    <div
                      key={p.handle}
                      onClick={() => handleSelectPerson(p)}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[11px] transition-colors ${
                          isSelected ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-[#161626] border-[#232338] text-slate-300 group-hover:border-blue-500'
                        }`}>
                          {p.initials}
                        </div>
                        <div>
                          <div className={`text-xs font-bold transition-colors ${isSelected ? 'text-blue-400' : 'text-white group-hover:text-blue-400'}`}>{p.name}</div>
                          <div className="text-[10px] text-slate-500">{p.handle}</div>
                        </div>
                      </div>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-blue-400 stroke-[2.5]" />
                      ) : (
                        <span className="text-slate-500 group-hover:text-blue-400 text-sm font-bold leading-none">+</span>
                      )}
                    </div>
                  );
                })}
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
          <div className="col-span-1 lg:col-span-7 space-y-4">
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
                ref={textareaRef}
                rows={4}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Write your message..."
                className="w-full bg-[#0a0a10] border border-[#1e1e2d] focus:border-blue-500 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors resize-none leading-relaxed"
              />

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.txt,.doc,.docx"
              />

              {/* Pending Attachment Chip */}
              {pendingAttachment && (
                <div className="px-3 py-2 rounded-xl bg-[#141422] border border-[#232338] flex items-center justify-between text-xs text-white animate-in slide-in-from-bottom-2 duration-150">
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

              <div className="flex items-center justify-between pt-1 relative">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                    title="Attach image or document"
                  >
                    <span className="font-bold">+</span>
                    <span>Attachment</span>
                  </button>
                  <span>·</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg ${
                        showEmojiPicker ? 'text-blue-400 bg-blue-600/20' : ''
                      }`}
                      title="Insert emoji"
                    >
                      <Smile className="w-3.5 h-3.5" />
                      <span>Emoji</span>
                    </button>
                    {showEmojiPicker && (
                      <EmojiPicker
                        onSelectEmoji={handleSelectEmoji}
                        onClose={() => setShowEmojiPicker(false)}
                        anchorPosition="bottom-left"
                      />
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={(!messageText.trim() && !pendingAttachment) || sending}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer active:scale-98"
                >
                  {sending ? 'Sending...' : 'Send private message'}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                Only {selectedRecipient ? selectedRecipient.name.split(' ')[0] : 'the recipient'} will receive this. Nothing is published.
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
function SearchPage({ onNavigate, onOpenMenu }: { onNavigate?: (nav: string, handleOrTopic?: string) => void; onOpenMenu?: () => void }) {
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

  const toggleFollow = async (id: string, handle?: string) => {
    setFollowedPeople(prev => ({ ...prev, [id]: !prev[id] }));
    if (handle) {
      try {
        await cchatApi.toggleFollow(handle);
      } catch (e) {
        console.warn('Backend toggle follow error:', e);
      }
    }
  };

  const recentSearches = ['roommate', '@mayamaybe', 'first date'];

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Feed */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
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
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">Search</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="relative w-48 sm:w-64 md:w-80">
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
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-5 pb-20 md:pb-5 overflow-y-auto space-y-6">
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
                <div
                  onClick={() => onNavigate?.('Profile', '@julespark')}
                  className="w-10 h-10 rounded-2xl bg-[#181828] border border-[#25253a] hover:border-blue-500 flex items-center justify-center font-bold text-xs text-slate-300 cursor-pointer transition-colors"
                >
                  JU
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">we made a custody schedule for the air fryer.</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => onNavigate?.('Profile', '@julespark')}
                      className="font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      @julespark
                    </button>
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
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => onNavigate?.('Profile', '@julespark')}
                >
                  <div className="w-8 h-8 rounded-full bg-[#181828] border border-[#27273d] group-hover:border-blue-500 flex items-center justify-center font-bold text-[11px] text-slate-300 transition-colors">
                    JP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Jules Park</div>
                    <div className="text-[10px] text-slate-500">@julespark · Roommate lore & bad plans</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow('JP', '@julespark')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  {followedPeople.JP ? 'Following' : 'Follow'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => onNavigate?.('Profile', '@ninapatel')}
                >
                  <div className="w-8 h-8 rounded-full bg-[#181828] border border-[#27273d] group-hover:border-blue-500 flex items-center justify-center font-bold text-[11px] text-slate-300 transition-colors">
                    NP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Nina Patel</div>
                    <div className="text-[10px] text-slate-500">@ninapatel · The roommate with the label maker</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow('NP', '@ninapatel')}
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
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-[#09090f] border-l border-[#171722]">
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
                onClick={() => {
                  if (term.startsWith('@')) {
                    onNavigate?.('Profile', term);
                  } else {
                    setQuery(term);
                  }
                }}
                className="hover:text-blue-400 cursor-pointer transition-colors flex items-center justify-between"
              >
                <span>{term}</span>
                {term.startsWith('@') && <span className="text-[10px] text-slate-500">Profile →</span>}
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
function NotificationsPage({ onNavigate, onOpenMenu }: { onNavigate?: (nav: string) => void; onOpenMenu?: () => void }) {
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
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">Notifications</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('Search')}
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
            <button className="p-2 text-blue-400 hover:text-white rounded-full bg-[#161624] transition-colors cursor-pointer relative">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-5 pb-20 md:pb-5 overflow-y-auto space-y-6">
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
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-[#09090f] border-l border-[#171722]">
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
interface ProfilePageProps {
  currentUser?: UserProfile | null;
  viewedHandle?: string | null;
  onNavigate?: (nav: string, topicOrParam?: string) => void;
  onLogout?: () => void;
  onOpenMenu?: () => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

function ProfilePage({
  currentUser,
  viewedHandle,
  onNavigate,
  onLogout,
  onOpenMenu,
  onUpdateProfile,
  onUpdateUser,
}: ProfilePageProps) {
  const cleanViewed = viewedHandle?.trim().toLowerCase();
  const cleanCurrent = currentUser?.handle?.trim().toLowerCase();
  const isOwnProfile = !cleanViewed ||
    cleanViewed === cleanCurrent ||
    cleanViewed.replace(/^@/, '') === (cleanCurrent ? cleanCurrent.replace(/^@/, '') : '');

  const [displayedUser, setDisplayedUser] = useState<UserProfile | null>(isOwnProfile ? (currentUser || null) : null);
  const [loadingUser, setLoadingUser] = useState(!isOwnProfile);
  const [userNotFound, setUserNotFound] = useState(false);

  const nameDisplay = displayedUser?.display_name || (isOwnProfile ? (currentUser?.display_name || 'Your Profile') : (viewedHandle || 'Profile'));
  const handleDisplay = displayedUser?.handle || (isOwnProfile ? (currentUser?.handle || '@user') : (viewedHandle?.startsWith('@') ? viewedHandle : `@${viewedHandle}`));

  const [activeTab, setActiveTab] = useState<'Published chats' | 'About'>('Published chats');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [editDisplayName, setEditDisplayName] = useState(currentUser?.display_name || '');
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [suggestedPeople, setSuggestedPeople] = useState<UserProfile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface ProfileCard {
    id: string;
    title: string;
    time: string;
    tag: string;
    reads: string;
    saved: boolean;
    msg1: string;
    msg2: string;
    rx1: { heart: number; cap: string | number; skull: number; fire: number };
    rx2: { heart: number; cap: string | number; skull: number; fire: number };
  }

  const mayaSeedCards: ProfileCard[] = [
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
  ];

  const [cards, setCards] = useState<ProfileCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : (n || 0).toString();

  const getInitials = (name?: string, handle?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.trim().slice(0, 2).toUpperCase();
    }
    if (handle) {
      return handle.replace(/^@/, '').slice(0, 2).toUpperCase();
    }
    return '??';
  };

  // Load user profile
  useEffect(() => {
    if (isOwnProfile) {
      setDisplayedUser(currentUser || null);
      setUserNotFound(false);
      setLoadingUser(false);
      if (currentUser) {
        setBio(currentUser.bio || '');
        setEditDisplayName(currentUser.display_name || '');
        setFollowersCount(currentUser.followers_count ?? (currentUser.handle === '@mayamaybe' ? 248 : 0));
      }
    } else if (viewedHandle) {
      setLoadingUser(true);
      setUserNotFound(false);
      cchatApi.getUserProfile(viewedHandle)
        .then(profile => {
          setDisplayedUser(profile);
          setFollowersCount(profile.followers_count ?? 0);
          setIsFollowing(!!profile.is_following);
          setLoadingUser(false);
        })
        .catch(err => {
          console.warn('Failed to load user profile:', err);
          setUserNotFound(true);
          setLoadingUser(false);
        });
    }
  }, [viewedHandle, currentUser, isOwnProfile]);

  // Load user's publications / excerpts
  useEffect(() => {
    if (!displayedUser?.handle) return;
    const handle = displayedUser.handle;
    if (isOwnProfile && handle === '@mayamaybe') {
      setCards(mayaSeedCards);
      return;
    }

    setLoadingCards(true);
    cchatApi.getExcerpts({ publisher: handle })
      .then(excerpts => {
        if (excerpts && excerpts.length > 0) {
          setCards(excerpts.map(e => ({
            id: `p-${e.id}`,
            title: e.title,
            time: 'Recently',
            tag: e.topic?.tag || '#chat',
            reads: `${fmt(e.reads_count)} reads`,
            saved: e.is_saved,
            msg1: e.messages[0]?.text || '',
            msg2: e.messages[1]?.text || '',
            rx1: {
              heart: e.messages[0]?.reactions?.heart || 0,
              cap: String(e.messages[0]?.reactions?.cap || 0),
              skull: e.messages[0]?.reactions?.skull || 0,
              fire: e.messages[0]?.reactions?.fire || 0,
            },
            rx2: {
              heart: e.messages[1]?.reactions?.heart || 0,
              cap: String(e.messages[1]?.reactions?.cap || 0),
              skull: e.messages[1]?.reactions?.skull || 0,
              fire: e.messages[1]?.reactions?.fire || 0,
            },
          })));
        } else {
          setCards([]);
        }
      })
      .catch(() => {
        setCards([]);
      })
      .finally(() => {
        setLoadingCards(false);
      });
  }, [displayedUser?.handle, isOwnProfile]);

  // Load suggested users for sidebar
  useEffect(() => {
    cchatApi.getUsers()
      .then(users => {
        const currentHandle = currentUser?.handle?.toLowerCase();
        const activeHandle = displayedUser?.handle?.toLowerCase();
        const filtered = users.filter(u =>
          u.handle.toLowerCase() !== currentHandle &&
          u.handle.toLowerCase() !== activeHandle
        );
        setSuggestedPeople(filtered);
      })
      .catch(() => {});
  }, [currentUser?.handle, displayedUser?.handle]);

  const handleToggleFollow = async () => {
    if (!displayedUser) return;
    try {
      const res = await cchatApi.toggleFollow(displayedUser.id || displayedUser.handle);
      setIsFollowing(res.is_following);
      setFollowersCount(res.followers_count);
      if (currentUser && onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          following_count: res.following_count,
        });
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  const handleStartChatWithUser = async () => {
    if (!displayedUser) return;
    try {
      await cchatApi.createChat(displayedUser.id || displayedUser.handle);
      if (onNavigate) onNavigate('My chats');
    } catch {
      if (onNavigate) onNavigate('My chats');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      if (onUpdateProfile) onUpdateProfile({ avatar_url: dataUrl });
      try {
        await cchatApi.updateMe({ avatar_url: dataUrl });
      } catch (err) {
        console.warn('Avatar upload failed:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (onUpdateProfile) onUpdateProfile({ avatar_url: '' });
    try {
      await cchatApi.updateMe({ avatar_url: '' });
    } catch (err) {
      console.warn('Avatar remove failed:', err);
    }
  };

  const handleSaveProfile = async () => {
    setIsEditingProfile(false);
    if (onUpdateProfile) {
      onUpdateProfile({ display_name: editDisplayName, bio });
    }
    try {
      await cchatApi.updateMe({ display_name: editDisplayName, bio });
    } catch (e) {
      console.warn('Profile sync failed:', e);
    }
  };

  const toggleSave = (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, saved: !c.saved } : c));
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Feed */}
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#0a0a0f]">
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
            {!isOwnProfile && (
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    onNavigate?.('Discover');
                  }
                }}
                className="p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#161624] transition-colors cursor-pointer flex items-center gap-1"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              {isOwnProfile ? `You / ${nameDisplay} profile` : `${nameDisplay} (${handleDisplay})`}
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('Search')}
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
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-5 pb-20 md:pb-5 overflow-y-auto space-y-6">
          {loadingUser ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <span className="text-xs">Loading profile...</span>
            </div>
          ) : userNotFound ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] text-center space-y-4 max-w-lg mx-auto mt-10 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-[#171724] border border-[#232336] mx-auto flex items-center justify-center text-slate-400">
                <User className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Creator not found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The profile for {viewedHandle} could not be found or does not exist.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate && onNavigate('Discover')}
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Back to Discover
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Hero Profile Card */}
              <div className="p-4 sm:p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative group shrink-0">
                      <UserAvatar
                        src={displayedUser?.avatar_url}
                        name={nameDisplay}
                        handle={handleDisplay}
                        size="xl"
                        className="w-16 h-16 border-2 border-[#2b2b3d]"
                      />
                      {isOwnProfile && isEditingProfile && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-[10px] text-white font-medium cursor-pointer hover:bg-black/75 transition-colors"
                          title="Upload photo"
                        >
                          <Camera className="w-4 h-4 mb-0.5" />
                          <span>Edit</span>
                        </button>
                      )}
                      {isOwnProfile && (
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handlePhotoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-2xl font-black text-white tracking-tight leading-tight truncate">{nameDisplay}</h1>
                      <div className="text-xs text-blue-400 font-medium">{handleDisplay}</div>
                      {isOwnProfile && isEditingProfile ? (
                        <div className="mt-2 flex flex-col gap-2">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <input
                              type="text"
                              value={editDisplayName}
                              onChange={e => setEditDisplayName(e.target.value)}
                              placeholder="Display name"
                              className="bg-[#12121d] border border-[#212130] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                            />
                            <input
                              type="text"
                              value={bio}
                              onChange={e => setBio(e.target.value)}
                              placeholder="Bio"
                              className="bg-[#12121d] border border-[#212130] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                            />
                            <button
                              onClick={handleSaveProfile}
                              className="text-xs text-blue-400 font-bold hover:underline cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="hover:underline cursor-pointer"
                            >
                              Change photo
                            </button>
                            {currentUser?.avatar_url && (
                              <>
                                <span className="text-slate-500">·</span>
                                <button
                                  type="button"
                                  onClick={handleRemovePhoto}
                                  className="hover:underline text-slate-400 cursor-pointer"
                                >
                                  Remove photo
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {displayedUser?.bio || 'No bio provided yet.'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Edit if own profile, Follow + Message if other profile */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    {isOwnProfile ? (
                      <button
                        onClick={() => {
                          if (isEditingProfile) {
                            handleSaveProfile();
                          } else {
                            setIsEditingProfile(true);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#141422] border border-[#222234] hover:bg-[#1a1a2b] text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        {isEditingProfile ? 'Save profile' : 'Edit profile'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleToggleFollow}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isFollowing
                              ? 'bg-[#181826] border border-[#27273d] text-slate-300 hover:border-rose-500/50 hover:text-rose-400 group'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5] group-hover:hidden" />
                              <span className="group-hover:hidden">Following</span>
                              <span className="hidden group-hover:inline">Unfollow</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleStartChatWithUser}
                          className="px-4 py-2 rounded-xl bg-[#141422] border border-[#222234] hover:bg-[#1a1a2b] text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Send a message"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                          <span>Message</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-1">
                  <div>
                    <div className="text-lg font-black text-white">{cards.length}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Published chats</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{followersCount}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Followers</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">
                      {displayedUser?.following_count ?? (isOwnProfile && currentUser?.handle === '@mayamaybe' ? 24 : 0)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Following</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-[#181826]">
                  Public profile · Private conversations always stay off the feed
                </div>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex items-center gap-6 border-b border-[#171722] pb-2 text-xs font-bold">
                {(['Published chats', `About ${nameDisplay}`] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab === 'Published chats' ? 'Published chats' : 'About')}
                    className={`pb-1 cursor-pointer transition-colors relative ${
                      activeTab === (tab === 'Published chats' ? 'Published chats' : 'About')
                        ? 'text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab}
                    {activeTab === (tab === 'Published chats' ? 'Published chats' : 'About') && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Content by Tab */}
              {activeTab === 'Published chats' ? (
                loadingCards ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <span className="text-xs">Loading publications...</span>
                  </div>
                ) : cards.length === 0 ? (
                  <div className="p-8 sm:p-12 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] text-center space-y-3 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-[#171724] border border-[#232336] mx-auto flex items-center justify-center text-slate-400">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">No published chats yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      {isOwnProfile
                        ? "You haven't published any chat excerpts to your profile yet. Publish any private chat from 'My chats'."
                        : `${nameDisplay} hasn't excerpted any conversations to the public feed yet.`}
                    </p>
                    {isOwnProfile && (
                      <div className="pt-2">
                        <button
                          onClick={() => onNavigate && onNavigate('My chats')}
                          className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                        >
                          Go to My chats
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cards.map(card => (
                      <article key={card.id} className="rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] p-6 shadow-xl space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#181828] border border-[#25253a] flex items-center justify-center font-bold text-xs text-slate-300">
                              {getInitials(nameDisplay, handleDisplay)}
                            </div>
                            <div>
                              <h3 className="text-lg font-extrabold text-white tracking-tight">{card.title}</h3>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                <span className="font-semibold text-slate-400">{handleDisplay}</span>
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
                          {card.msg1 && (
                            <div className="space-y-1">
                              <div className="text-[11px] text-slate-400 font-semibold">Anonymous</div>
                              <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-slate-100 text-sm font-medium w-full sm:w-[68%]">
                                {card.msg1}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-1 pt-0.5">
                                <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">♥ {card.rx1.heart}</span>
                                <span className="flex items-center gap-1 text-blue-400 font-bold">🧢 {card.rx1.cap}</span>
                                <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 {card.rx1.skull}</span>
                                <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 {card.rx1.fire}</span>
                              </div>
                            </div>
                          )}

                          {/* Msg 2 */}
                          {card.msg2 && (
                            <div className="space-y-1 flex flex-col items-end">
                              <div className="text-[11px] text-slate-400 font-semibold pr-1">{nameDisplay}</div>
                              <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-full sm:w-[68%]">
                                {card.msg2}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pr-1 pt-0.5">
                                <span className="flex items-center gap-1 text-rose-400 font-bold">♥ {card.rx2.heart}</span>
                                <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🧢 {card.rx2.cap}</span>
                                <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">💀 {card.rx2.skull}</span>
                                <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">🔥 {card.rx2.fire}</span>
                              </div>
                            </div>
                          )}
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
                              title={card.saved ? 'Saved' : 'Save'}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (navigator.clipboard) {
                                  navigator.clipboard.writeText(window.location.origin);
                                  alert('Link copied to clipboard!');
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#181826] transition-colors cursor-pointer"
                              title="Share"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )
              ) : (
                <div className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 text-xs text-slate-300 shadow-xl">
                  <h4 className="font-bold text-white text-sm">About {nameDisplay}</h4>
                  <p className="leading-relaxed text-slate-400">
                    {displayedUser?.bio || 'No bio provided yet.'}
                  </p>
                  <div className="pt-3 border-t border-[#181826] flex items-center gap-6 text-slate-400">
                    <div>
                      <span className="font-bold text-white">{followersCount}</span> Followers
                    </div>
                    <div>
                      <span className="font-bold text-white">{displayedUser?.following_count ?? 0}</span> Following
                    </div>
                    <div>
                      <span className="font-bold text-white">{cards.length}</span> Public Excerpts
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-[#09090f] border-l border-[#171722]">
        {isOwnProfile ? (
          <>
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
                {isEditingProfile ? 'Cancel editing' : 'Edit profile'}
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
                  You published these excerpts. Other participants' names, handles and photos remain hidden unless they also publish.
                </p>
              </div>
            </div>

            {/* Card 3: Publication controls */}
            <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3 shadow-xl">
              <h4 className="text-sm font-extrabold text-white tracking-tight">Publication controls</h4>
              <button
                onClick={() => onNavigate && onNavigate('Published chats')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage publications</span>
                <span>→</span>
              </button>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Manage titles, topics and which excerpts stay in the spotlight.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Card 1: Creator Summary */}
            <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 shadow-xl">
              <div>
                <h4 className="text-sm font-extrabold text-white tracking-tight">About this creator</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {displayedUser?.bio || 'No bio provided yet.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFollow}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isFollowing
                      ? 'bg-[#181826] border border-[#27273d] text-slate-300 hover:border-rose-500/50 hover:text-rose-400 group'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5] group-hover:hidden" />
                      <span className="group-hover:hidden">Following</span>
                      <span className="hidden group-hover:inline">Unfollow</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleStartChatWithUser}
                  className="py-2 px-3 rounded-xl bg-[#141422] border border-[#222234] hover:bg-[#1a1a2b] text-xs font-semibold text-white transition-colors cursor-pointer"
                  title="Send message"
                >
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                </button>
              </div>
            </div>

            {/* Card 2: People you might like */}
            {suggestedPeople.length > 0 && (
              <div className="p-5 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 shadow-xl">
                <div>
                  <h4 className="text-sm font-extrabold text-white tracking-tight">People you might like</h4>
                </div>

                <div className="space-y-3.5">
                  {suggestedPeople.slice(0, 4).map(person => (
                    <div key={person.handle} className="flex items-center justify-between">
                      <div
                        onClick={() => onNavigate && onNavigate('Profile', person.handle)}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        {person.avatar_url ? (
                          <img src={person.avatar_url} alt={person.display_name} className="w-8 h-8 rounded-full object-cover border border-[#27273d] shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#181828] border border-[#27273d] flex items-center justify-center font-bold text-[11px] text-slate-300 shrink-0">
                            {getInitials(person.display_name, person.handle)}
                          </div>
                        )}
                        <div className="truncate">
                          <div className="text-xs font-bold text-white leading-snug truncate">{person.display_name || person.handle}</div>
                          <div className="text-[10px] text-slate-500 truncate">{person.handle}</div>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          await cchatApi.toggleFollow(person.id || person.handle);
                          setSuggestedPeople(prev => prev.filter(p => p.id !== person.id));
                        }}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer shrink-0 ml-2"
                      >
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 3: Public chat. Private identity */}
            <div className="p-4 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  You only see excerpts {nameDisplay} has published. Anonymous co-participants remain anonymous.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Footer links */}
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

// ─────────────────────────────────────────────────────────────
// VIEW 9: ACCOUNT AND SETTINGS PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function AccountSettingsPage({
  currentUser,
  onNavigate,
  onOpenMenu,
  onUpdateUser,
}: {
  currentUser?: UserProfile | null;
  onNavigate?: (nav: string) => void;
  onOpenMenu?: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
}) {
  // Profile editing
  const [displayName, setDisplayName] = useState(currentUser?.display_name || '');
  const [handle, setHandle] = useState(currentUser?.handle || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [saveStatus, setSaveStatus] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account & sign-in
  const [email, setEmail] = useState(
    currentUser?.email || (currentUser?.username ? `${currentUser.username}@example.com` : '')
  );
  const [password, setPassword] = useState('••••••••••••');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.display_name) setDisplayName(currentUser.display_name);
      if (currentUser.handle) setHandle(currentUser.handle);
      if (currentUser.bio !== undefined) setBio(currentUser.bio || '');
      if (currentUser.email) setEmail(currentUser.email);
      setAvatarUrl(currentUser.avatar_url || '');
    }
  }, [currentUser]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      try {
        const updated = await cchatApi.updateMe({ avatar_url: dataUrl });
        if (onUpdateUser) onUpdateUser(updated);
        setSaveStatus('Photo updated!');
        setTimeout(() => setSaveStatus(''), 3000);
      } catch {
        if (currentUser && onUpdateUser) {
          onUpdateUser({ ...currentUser, avatar_url: dataUrl });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setAvatarUrl('');
    try {
      const updated = await cchatApi.updateMe({ avatar_url: '' });
      if (onUpdateUser) onUpdateUser(updated);
      setSaveStatus('Photo removed.');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      if (currentUser && onUpdateUser) {
        onUpdateUser({ ...currentUser, avatar_url: '' });
      }
    }
  };

  const handleSaveProfile = async () => {
    setSaveStatus('Saving…');
    const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
    try {
      const updated = await cchatApi.updateMe({
        display_name: displayName,
        handle: cleanHandle,
        bio,
      });
      if (onUpdateUser) onUpdateUser(updated);
      setSaveStatus('Profile updated!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      if (currentUser && onUpdateUser) {
        const local = {
          ...currentUser,
          display_name: displayName,
          handle: cleanHandle,
          bio,
        };
        onUpdateUser(local);
      }
      setSaveStatus('Profile saved.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

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
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#161624] transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-white tracking-tight">Account and settings</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-48 md:w-64 lg:w-80">
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
              onClick={() => onNavigate && onNavigate('Search')}
              className="sm:hidden p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Form Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-5 pb-20 md:pb-6 overflow-y-auto space-y-6">
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
              <UserAvatar
                src={avatarUrl}
                name={displayName || 'User'}
                handle={handle || '@user'}
                size="lg"
                className="w-12 h-12 border border-[#2b2b3d]"
              />
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="hover:underline cursor-pointer"
                >
                  Change photo
                </button>
                <span className="text-slate-500">·</span>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="hover:underline text-slate-400 cursor-pointer"
                >
                  Remove photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                onClick={handleSaveProfile}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                Save profile changes
              </button>
              {saveStatus && <span className="text-xs text-emerald-400 font-semibold">{saveStatus}</span>}
              <button
                onClick={() => onNavigate && onNavigate('Profile')}
                className="px-4 py-2.5 rounded-xl bg-[#141422] border border-[#222234] hover:bg-[#1a1a2b] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Back to Profile
              </button>
            </div>
          </section>

          {/* Section 2: Account & sign-in */}
          <section id="section-account" className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4 shadow-xl">
            <h3 className="text-sm font-extrabold text-white">Account & sign-in</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-[#09090f] border-l border-[#171722]">
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
          <div className="text-xs font-bold text-white">
            Signed in as {currentUser?.display_name || displayName || 'User'}
          </div>
          <div className="text-[10px] text-slate-500">
            {currentUser?.handle || handle || '@user'} · Current session
          </div>
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
function PublishedChatsPage({
  currentUser,
  onNavigate,
  onOpenMenu,
}: {
  currentUser?: UserProfile | null;
  onNavigate?: (nav: string) => void;
  onOpenMenu?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'All chats' | 'Published'>('Published');
  const [selectedPublication, setSelectedPublication] = useState('p1');
  const [editingTitle, setEditingTitle] = useState('the deck has 94 slides.');
  const [editingTopic, setEditingTopic] = useState('#workbesties');
  const [showConfirmRemove, setShowConfirmRemove] = useState(true);

  const mayaSeedPubs = [
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
  ];

  const [publications, setPublications] = useState<typeof mayaSeedPubs>(() => {
    return (currentUser?.handle === '@mayamaybe') ? mayaSeedPubs : [];
  });

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.handle === '@mayamaybe') {
      setPublications(mayaSeedPubs);
      return;
    }
    cchatApi.getExcerpts({ publisher: currentUser.handle })
      .then(excerpts => {
        if (excerpts && excerpts.length > 0) {
          setPublications(excerpts.map(e => ({
            id: `p${e.id}`,
            title: e.title,
            chatName: 'Private chat',
            topic: e.topic?.tag || '#chat',
            messagesCount: `${e.messages?.length || 0} messages`,
            reads: `${e.reads_count} reads`,
            publishedTime: 'Recently',
            isLive: true,
          })));
        } else {
          setPublications([]);
        }
      })
      .catch(() => {
        setPublications([]);
      });
  }, [currentUser]);

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
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#161624] transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-white tracking-tight">Published chats</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-48 md:w-64 lg:w-80">
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
              onClick={() => onNavigate && onNavigate('Search')}
              className="sm:hidden p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-5 pb-20 md:pb-6 overflow-y-auto space-y-6">
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
            {publications.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] text-center space-y-3 shadow-xl">
                <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
                <h4 className="text-sm font-bold text-white">No published chats yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Only excerpts you've chosen to make public will appear here. Publish your best chat excerpts from My chats.
                </p>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('My chats')}
                    className="inline-block mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                  >
                    Go to My chats
                  </button>
                )}
              </div>
            ) : (
              publications.map(pub => (
                <div
                  key={pub.id}
                  onClick={() => handleSelectPub(pub)}
                  className={`p-5 rounded-3xl bg-[#0f0f18] border transition-all cursor-pointer shadow-xl space-y-3 ${
                    selectedPublication === pub.id ? 'border-blue-500/60 ring-1 ring-blue-500/30' : 'border-[#1f1f2e] hover:border-[#2b2b3f]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={currentUser?.avatar_url}
                        name={currentUser?.display_name || 'Profile'}
                        handle={currentUser?.handle}
                        size="md"
                        className="w-10 h-10 border border-[#2b2b3d]"
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
                    {currentUser?.handle || '@user'} × Anonymous · Only you published · Their name, handle and photo are hidden.
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
              ))
            )}
          </div>

          {/* Remove Publication Confirmation Banner */}
          {showConfirmRemove && (
            <div className="p-6 rounded-3xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-xl">
              <h4 className="text-sm font-extrabold text-white">
                Remove "{editingTitle}" from public view?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                This removes your publication and its excerpt from your profile and the feed. Your private conversation and any messages after the excerpt stay in My chats. If another participant separately publishes, their publication may remain, with your identity hidden.
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
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-[#09090f] border-l border-[#171722]">
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
function FreshPage({
  onNavigateTab,
  onNavigate,
  onOpenMenu,
}: {
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (nav: string, handleOrTopic?: string) => void;
  onOpenMenu?: () => void;
}) {
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
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">Fresh</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
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
                <div
                  onClick={() => onNavigate?.('Profile', '@julespark')}
                  className="w-10 h-10 rounded-2xl bg-[#181828] border border-[#25253a] hover:border-blue-500 flex items-center justify-center font-bold text-xs text-slate-300 cursor-pointer transition-colors"
                >
                  JU
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">we made a custody schedule for the air fryer.</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => onNavigate?.('Profile', '@julespark')}
                      className="font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      @julespark
                    </button>
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
                <div
                  onClick={() => onNavigate?.('Profile', '@leomartinez')}
                  className="w-10 h-10 rounded-2xl bg-[#181828] border border-[#25253a] hover:border-blue-500 flex items-center justify-center font-bold text-xs text-slate-300 cursor-pointer transition-colors"
                >
                  LE
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">the apology came with a lasagna.</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => onNavigate?.('Profile', '@leomartinez')}
                      className="font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      @leomartinez
                    </button>
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
function TopicsDirectoryPage({ onNavigate, onOpenMenu }: { onNavigate?: (nav: string, topic?: string) => void; onOpenMenu?: () => void }) {
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
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">Topics directory</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('Search')}
              className="sm:hidden p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative w-48 sm:w-64 md:w-80 hidden sm:block">
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
  onNavigate?: (nav: string, topicOrHandle?: string) => void;
  onOpenMenu?: () => void;
}

function TopicDetailPage({ topicTag = '#dating', onNavigate, onOpenMenu }: TopicDetailPageProps) {
  const [currentTopic, setCurrentTopic] = useState<string>(topicTag);
  const [activeTab, setActiveTab] = useState<'Popular' | 'Fresh'>('Popular');
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);
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
                onClick={() => onNavigate?.('Profile', '@mayamaybe')}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#222236] hover:ring-blue-500 cursor-pointer transition-all"
              />
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  he brought a résumé to a first date.
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('Profile', '@mayamaybe')}
                    className="font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    @mayamaybe
                  </button>
                  <span className="mx-1">×</span>
                  <span>Anonymous · 2h ago · {currentTopic}</span>
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
              <div
                onClick={() => onNavigate?.('Profile', '@leomartinez')}
                className="w-10 h-10 rounded-full bg-[#1b1b2a] border border-[#2a2a3e] hover:border-blue-500 flex items-center justify-center text-xs font-black text-slate-300 cursor-pointer transition-colors"
              >
                LE
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  the apology came with a lasagna.
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('Profile', '@leomartinez')}
                    className="font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    @leomartinez
                  </button>
                  <span className="mx-1">×</span>
                  <span>Anonymous · 4m ago · {currentTopic}</span>
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
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(`${window.location.origin}/?topic=${encodeURIComponent(currentTopic)}`);
                }
                setCopiedPreview(true);
                setTimeout(() => setCopiedPreview(false), 2500);
              }}
              className="text-slate-300 hover:text-white font-medium block text-left cursor-pointer"
            >
              {copiedPreview ? '✓ Excerpt preview link copied!' : 'Share excerpt preview'}
            </button>
            <button
              onClick={() => {
                setCopiedLink(false);
                setCopiedPreview(false);
              }}
              className="text-slate-400 hover:text-slate-300 font-medium block text-left cursor-pointer"
            >
              Dismiss
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
// ROUTING MAPS & URL SYNCHRONIZATION
// ─────────────────────────────────────────────────────────────
const NAV_TO_PATH: Record<string, string> = {
  'Discover': '/',
  'Following': '/following',
  'Fresh': '/fresh',
  'My chats': '/my-chats',
  'Saved': '/saved',
  'Start a chat': '/start-chat',
  'Search': '/search',
  'Notifications': '/notifications',
  'Profile': '/profile',
  'Account and settings': '/settings',
  'Published chats': '/published',
  'Topics directory': '/topics',
  'Topic detail': '/topic',
  "Tonight's picks": '/tonight',
  'About': '/about',
  'About CCHAT': '/about',
  'Community rules': '/rules',
  'Privacy': '/privacy',
  'Sponsorship': '/sponsorship',
  'Sponsorship / Learn more': '/sponsorship',
  'After Hours sponsor detail': '/after-hours',
  'After Hours': '/after-hours',
  'Admin': '/admin',
};

const PATH_TO_NAV: Record<string, string> = {
  '/': 'Discover',
  '/discover': 'Discover',
  '/following': 'Following',
  '/fresh': 'Fresh',
  '/my-chats': 'My chats',
  '/chats': 'My chats',
  '/saved': 'Saved',
  '/start-chat': 'Start a chat',
  '/search': 'Search',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
  '/settings': 'Account and settings',
  '/account': 'Account and settings',
  '/published': 'Published chats',
  '/topics': 'Topics directory',
  '/topic': 'Topic detail',
  '/tonight': "Tonight's picks",
  '/about': 'About',
  '/rules': 'Community rules',
  '/community-rules': 'Community rules',
  '/privacy': 'Privacy',
  '/sponsorship': 'Sponsorship',
  '/after-hours': 'After Hours',
  '/admin': 'Admin',
};

function getNavFromPath(pathname: string): { nav: string; topic?: string; profileHandle?: string } {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (PATH_TO_NAV[cleanPath]) {
    return { nav: PATH_TO_NAV[cleanPath] };
  }
  if (cleanPath.startsWith('/profile/')) {
    const raw = cleanPath.slice('/profile/'.length);
    const handle = raw ? (raw.startsWith('@') ? raw : `@${decodeURIComponent(raw)}`) : undefined;
    return { nav: 'Profile', profileHandle: handle };
  }
  if (cleanPath.startsWith('/@')) {
    const raw = cleanPath.slice('/@'.length);
    return { nav: 'Profile', profileHandle: `@${decodeURIComponent(raw)}` };
  }
  if (cleanPath.startsWith('/topic/')) {
    const rawTag = cleanPath.slice('/topic/'.length);
    const tag = rawTag ? (rawTag.startsWith('#') ? rawTag : `#${decodeURIComponent(rawTag)}`) : '#dating';
    return { nav: 'Topic detail', topic: tag };
  }
  return { nav: 'Discover' };
}

function getPathFromNav(nav: string, topic?: string, profileHandle?: string | null, currentUserHandle?: string): string {
  if (nav === 'Topic detail' && topic) {
    return `/topic/${encodeURIComponent(topic.replace(/^#/, ''))}`;
  }
  if (nav === 'Profile') {
    if (profileHandle && profileHandle !== currentUserHandle) {
      return `/profile/${encodeURIComponent(profileHandle.replace(/^@/, ''))}`;
    }
    return '/profile';
  }
  return NAV_TO_PATH[nav] || '/';
}

// ─────────────────────────────────────────────────────────────
// ROOT APP WITH NAVIGATION
// ─────────────────────────────────────────────────────────────
export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('cchat_logged_in') !== 'false';
  });
  const initialRoute = getNavFromPath(window.location.pathname);
  const [activeNav, setActiveNav] = useState<string>(initialRoute.nav);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialRoute.topic || '#dating');
  const [selectedProfileHandle, setSelectedProfileHandle] = useState<string | null>(initialRoute.profileHandle || null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('cchat_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [chatCount, setChatCount] = useState<number>(0);

  const refreshChatCount = () => {
    if (isLoggedIn) {
      cchatApi.getChats()
        .then(chats => setChatCount(chats.length))
        .catch(() => {});
    }
  };

  React.useEffect(() => {
    if (isLoggedIn) {
      refreshChatCount();
      cchatApi.getMe()
        .then(user => {
          setCurrentUser(user);
          localStorage.setItem('cchat_user', JSON.stringify(user));
        })
        .catch(err => console.warn('User session check:', err));
    } else {
      setChatCount(0);
    }
  }, [isLoggedIn]);

  // Synchronize browser history and handle back/forward buttons
  React.useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.nav) {
        setActiveNav(state.nav);
        if (state.topic) setSelectedTopic(state.topic);
        setSelectedProfileHandle(state.profileHandle || null);
      } else {
        const route = getNavFromPath(window.location.pathname);
        setActiveNav(route.nav);
        if (route.topic) setSelectedTopic(route.topic);
        setSelectedProfileHandle(route.profileHandle || null);
      }
    };
    window.addEventListener('popstate', onPopState);

    // Replace initial state so URL aligns with clean route path
    if (isLoggedIn) {
      const targetPath = getPathFromNav(activeNav, selectedTopic, selectedProfileHandle, currentUser?.handle);
      if (window.location.pathname !== targetPath) {
        window.history.replaceState({ nav: activeNav, topic: selectedTopic, profileHandle: selectedProfileHandle }, '', targetPath);
      } else if (!window.history.state) {
        window.history.replaceState({ nav: activeNav, topic: selectedTopic, profileHandle: selectedProfileHandle }, '', targetPath);
      }
    } else {
      if (window.location.pathname !== '/login') {
        window.history.replaceState({ nav: 'Login' }, '', '/login');
      }
    }

    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = (nav: string, topicOrParam?: string) => {
    let nextTopic = selectedTopic;
    let nextProfileHandle = selectedProfileHandle;

    if (nav === 'Topic detail') {
      nextTopic = topicOrParam || selectedTopic;
      setSelectedTopic(nextTopic);
    } else if (nav === 'Profile') {
      nextProfileHandle = topicOrParam || null;
      setSelectedProfileHandle(nextProfileHandle);
    } else {
      setSelectedProfileHandle(null);
      nextProfileHandle = null;
    }

    setActiveNav(nav);
    setIsMobileMenuOpen(false); // close drawer on navigation

    if (nav === 'My chats' || activeNav === 'Start a chat') {
      refreshChatCount();
    }

    const targetPath = getPathFromNav(nav, nextTopic, nextProfileHandle, currentUser?.handle);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ nav, topic: nextTopic, profileHandle: nextProfileHandle }, '', targetPath);
    }
  };

  const handleNavigateTab = (tab: string) => {
    if (tab === 'Following') {
      handleNavigate('Following');
    } else if (tab === 'For you') {
      handleNavigate('Discover');
    } else if (tab === 'Fresh') {
      handleNavigate('Fresh');
    }
  };

  const handleLogin = (userOrHandle: UserProfile | string) => {
    localStorage.setItem('cchat_logged_in', 'true');
    setIsLoggedIn(true);
    refreshChatCount();
    const destNav = activeNav === 'Discover' ? 'Discover' : activeNav;
    handleNavigate(destNav);
    if (typeof userOrHandle === 'object' && userOrHandle !== null) {
      setCurrentUser(userOrHandle);
      localStorage.setItem('cchat_user', JSON.stringify(userOrHandle));
    } else if (typeof userOrHandle === 'string') {
      const cleanHandle = userOrHandle.startsWith('@') ? userOrHandle : `@${userOrHandle}`;
      const fallbackUser: UserProfile = {
        id: 0,
        handle: cleanHandle,
        display_name: cleanHandle.replace(/^@/, ''),
        avatar_url: '',
        bio: '',
      };
      setCurrentUser(fallbackUser);
      localStorage.setItem('cchat_user', JSON.stringify(fallbackUser));
    }
    // Re-fetch the real logged-in user — this replaces any stale demo session
    cchatApi.getMe()
      .then(user => {
        setCurrentUser(user);
        localStorage.setItem('cchat_user', JSON.stringify(user));
      })
      .catch(err => console.warn('Post-login user fetch:', err));
  };

  const handleLogout = () => {
    // Clear the auth token so the next getMe() doesn't return the old user
    import('./services/api').then(({ authStorage }) => authStorage.setToken(null));
    localStorage.removeItem('cchat_user');
    setCurrentUser(null);
    setChatCount(0);
    localStorage.setItem('cchat_logged_in', 'false');
    setIsLoggedIn(false);
    if (window.location.pathname !== '/login') {
      window.history.pushState({ nav: 'Login' }, '', '/login');
    }
  };

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);
  const handleNavAndClose = (nav: string) => {
    handleNavigate(nav);
  };

  // ── Not logged in → show login gate ─────────────────────────
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (activeNav === 'Discover') {
      return <DiscoverPage onNavigateTab={handleNavigateTab} onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'Following') {
      return (
        <FollowingPage
          onNavigateTab={handleNavigateTab}
          onNavigate={handleNavigate}
          onOpenMenu={handleOpenMenu}
          currentUser={currentUser}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            localStorage.setItem('cchat_user', JSON.stringify(updated));
          }}
        />
      );
    }
    if (activeNav === 'Fresh') {
      return <FreshPage onNavigateTab={handleNavigateTab} onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'My chats') {
      return (
        <MyChatsPage
          onNavigate={handleNavigate}
          onOpenMenu={handleOpenMenu}
          onChatCountChange={(count) => setChatCount(count)}
        />
      );
    }
    if (activeNav === 'Saved') {
      return <SavedPage onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'Start a chat') {
      return <StartChatPage currentUser={currentUser} onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'Search') {
      return <SearchPage onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'Notifications') {
      return <NotificationsPage onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'Profile') {
      return (
        <ProfilePage
          currentUser={currentUser}
          viewedHandle={selectedProfileHandle}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onOpenMenu={handleOpenMenu}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            localStorage.setItem('cchat_user', JSON.stringify(updated));
          }}
          onUpdateProfile={(updated) => {
            if (currentUser) {
              const merged = { ...currentUser, ...updated };
              setCurrentUser(merged);
              localStorage.setItem('cchat_user', JSON.stringify(merged));
            }
          }}
        />
      );
    }
    if (activeNav === 'Account and settings') {
      return (
        <AccountSettingsPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onOpenMenu={handleOpenMenu}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            localStorage.setItem('cchat_user', JSON.stringify(updated));
          }}
        />
      );
    }
    if (activeNav === 'Published chats') {
      return (
        <PublishedChatsPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onOpenMenu={handleOpenMenu}
        />
      );
    }
    if (activeNav === 'Topics directory') {
      return <TopicsDirectoryPage onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'Topic detail') {
      return <TopicDetailPage topicTag={selectedTopic} onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === "Tonight's picks") {
      return <TonightsPicksPage onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'About' || activeNav === 'About CCHAT') {
      return <AboutPage onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'Community rules') {
      return <CommunityRulesPage onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'Privacy') {
      return <PrivacyPage onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'Sponsorship' || activeNav === 'Sponsorship / Learn more') {
      return <SponsorshipPage onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'After Hours sponsor detail' || activeNav === 'After Hours') {
      return <AfterHoursPage onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    if (activeNav === 'Admin') {
      return <AdminDashboardPage onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
    }
    return <DiscoverPage onNavigateTab={handleNavigateTab} onNavigate={handleNavigate} onOpenMenu={handleOpenMenu} />;
  };

  // ── True Responsive Layout ───────────────────────────────────
  // Mobile (< md): full-screen content + bottom nav + slide-in sidebar drawer
  // Desktop (≥ md): permanent left sidebar + content
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#09090f] text-slate-100 flex font-sans relative">

      {/* ── Mobile Sidebar Overlay Drawer ─────────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseMenu}
          />
          {/* Drawer panel */}
          <div className="relative w-72 max-w-[85vw] h-full flex flex-col bg-[#09090f] border-r border-[#171722] shadow-2xl z-10 animate-slide-in-left">
            <Sidebar
              activeNav={activeNav}
              onNav={handleNavAndClose}
              currentUser={currentUser}
              onLogout={handleLogout}
              onClose={handleCloseMenu}
              isMobileDrawer={true}
              chatCount={chatCount}
            />
          </div>
        </div>
      )}

      {/* ── Desktop permanent sidebar (hidden on mobile) ────────── */}
      <div className="hidden md:flex w-[220px] lg:w-[240px] xl:w-[260px] shrink-0 h-full flex-col">
        <Sidebar
          activeNav={activeNav}
          onNav={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          chatCount={chatCount}
        />
      </div>

      {/* ── Main content area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Page content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {renderContent()}
        </div>

        {/* ── Mobile bottom nav (hidden on desktop) ─────────────── */}
        <div className="md:hidden shrink-0">
          <MobileBottomNav activeNav={activeNav} onNav={handleNavAndClose} chatCount={chatCount} />
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// VIEW 14: TONIGHT'S PICKS / THE AFTER-HOURS EDIT
// ─────────────────────────────────────────────────────────────
function TonightsPicksPage({ onNavigate, onOpenMenu }: { onNavigate?: (nav: string, topicOrHandle?: string) => void; onOpenMenu?: () => void }) {
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
                  <div
                    onClick={() => onNavigate?.('Profile', '@julespark')}
                    className="w-10 h-10 rounded-full bg-[#1b1b2a] border border-[#2a2a3e] hover:border-blue-500 flex items-center justify-center text-xs font-black text-slate-300 cursor-pointer transition-colors"
                  >
                    JU
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">we said one drink.</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      <button
                        type="button"
                        onClick={() => onNavigate?.('Profile', '@julespark')}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        @julespark
                      </button>
                      <span className="mx-1">×</span>
                      <span>Anonymous · 42m ago · #dating</span>
                    </div>
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
                    onClick={() => onNavigate?.('Profile', '@mayamaybe')}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#222236] hover:ring-blue-500 cursor-pointer transition-all"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">the deck has 94 slides.</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      <button
                        type="button"
                        onClick={() => onNavigate?.('Profile', '@mayamaybe')}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        @mayamaybe
                      </button>
                      <span className="mx-1">×</span>
                      <span>Anonymous · 2h ago · #workbesties</span>
                    </div>
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
                    onClick={() => onNavigate?.('Profile', '@mayamaybe')}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#222236] hover:ring-blue-500 cursor-pointer transition-all"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">he brought a résumé to a first date.</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      <button
                        type="button"
                        onClick={() => onNavigate?.('Profile', '@mayamaybe')}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        @mayamaybe
                      </button>
                      <span className="mx-1">×</span>
                      <span>Anonymous · 3h ago · #dating</span>
                    </div>
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
