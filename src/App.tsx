import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Sparkles,
  LogOut,
  User,
  Tag,
  Menu,
  ShieldAlert,
  Camera,
  ArrowLeft,
  ArrowRight,
  FileText,
  Paperclip,
  Loader2,
} from 'lucide-react';
import { EmojiPicker } from './components/EmojiPicker';
import { AboutPage } from './pages/AboutPage';
import { CommunityRulesPage } from './pages/CommunityRulesPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SponsorshipPage } from './pages/SponsorshipPage';
import { AfterHoursPage } from './pages/AfterHoursPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { cchatApi, UserProfile, PublicExcerptItem, TopicItem, SavedExcerptItem, ExcerptMessage } from './services/api';
import { MyChatsPage } from './pages/MyChatsPage';
import { LoginPage } from './pages/LoginPage';
import { UserAvatar } from './components/UserAvatar';
import { CchatLogo } from './components/CchatLogo';
import { FooterLinks } from './components/FooterLinks';

// Shared double chat-bubble logo icon
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
    <nav className="shrink-0 bg-canvas-deep/95 backdrop-blur-md border-t border-line py-2 px-4 z-30 select-none">
      <div className="flex items-center justify-around">
        {items.map(({ id, label, icon: Icon, badge }) => {
          const isActive =
            activeNav === id ||
            (id === 'Discover' && (activeNav === "Tonight's picks" || activeNav === 'Fresh'));
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 py-1 px-3 cursor-pointer transition-colors relative ${
                isActive ? 'text-accent' : 'text-ink-muted hover:text-ink-soft'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 stroke-[2.2]" />
                {badge && (
                  <span className="absolute -top-1.5 -right-2 bg-accent-strong text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight shadow">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'font-bold text-accent' : 'font-medium'}`}>
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
    <aside className="w-full shrink-0 flex flex-col justify-between p-4 bg-canvas-deep h-full">
      <div className="space-y-6">
        {/* Logo and optional mobile drawer close button */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            type="button"
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNav('Discover')}
            aria-label="CCHAT home"
          >
            <CchatLogo />
            <h1 className="text-xl font-black tracking-tight text-white">CCHAT</h1>
          </button>
          {isMobileDrawer && (
            <button
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
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
              aria-current={activeNav === id ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                activeNav === id
                  ? 'bg-surface-2 text-white font-semibold shadow-xs'
                  : 'text-ink-muted hover:text-white hover:bg-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${activeNav === id && (id === 'My chats' || id === 'Following') ? 'text-accent' : ''}`} />
                <span>{label}</span>
              </div>
              {badge && (
                <span className="text-xs bg-accent-strong text-white font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Start a Chat */}
        <button
          onClick={() => onNav('Start a chat')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent-strong hover:bg-accent text-white font-bold text-sm transition-colors cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Start a chat</span>
        </button>
      </div>

      {/* Bottom card + Profile */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-surface border border-line">
          <div className="w-6 h-6 rounded-lg bg-accent-soft text-accent flex items-center justify-center text-sm font-black mb-2">✻</div>
          <h4 className="text-xs font-bold text-white leading-snug">Real chats. Main-character energy.</h4>
          <p className="text-[11px] text-ink-faint mt-1 leading-relaxed">A little less posting. A lot more plot.</p>
        </div>

        <div className="flex items-center justify-between px-2 pt-2 border-t border-line">
          <button
            type="button"
            onClick={() => onNav('Profile')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity text-left"
            aria-label="Open your profile"
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
              <div className="text-[11px] text-ink-faint truncate">{handleDisplay}</div>
            </div>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onNav('Account and settings')}
              className="p-1.5 text-ink-faint hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
              title="Account and settings"
              aria-label="Account and settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 text-ink-faint hover:text-rose-400 rounded-lg hover:bg-surface transition-colors cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
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
  isAnonymous?: boolean;
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
  authorsSummary?: string;
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
  sections?: Array<{
    header: string;
    topicTag: string;
    firstMessageId: string;
  }>;
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
    sections: [
      { header: 'The Metaphor', topicTag: '#dating', firstMessageId: 's0m1' },
      { header: 'The Second Interview', topicTag: '#pastaandbenefits', firstMessageId: 's0m4' },
    ],
    messages: [
      { id: 's0m1', sender: 'Anonymous', isRight: false, text: 'i brought a résumé to the date.', badge: '🧢', badgePos: 'right', badgeAnim: 'animate-bounce', bubbleColor: 'bg-[#152a48] border-[#1e3d68] text-ink' },
      { id: 's0m2', sender: 'Maya', isRight: true, text: 'please tell me this is a metaphor', bubbleColor: 'bg-[#421d33] border-[#5d2a49] text-rose-50' },
      { id: 's0m3', sender: 'Anonymous', isRight: false, text: 'two pages. references available on request.', bubbleColor: 'bg-[#152a48] border-[#1e3d68] text-ink' },
      { id: 's0m4', sender: 'Maya', isRight: true, text: 'did you at least get the position?', badge: '💀', badgePos: 'left', badgeAnim: 'animate-pulse', bubbleColor: 'bg-[#1d222e] border-line-strong text-ink' },
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
    sections: [
      { header: 'The New Roommate', topicTag: '#roommatelore', firstMessageId: 's1m1' },
      { header: 'The Air Fryer Feud', topicTag: '#kitchenpolitics', firstMessageId: 's1m3' },
    ],
    messages: [
      { id: 's1m1', sender: 'Anonymous', isRight: false, text: 'who adopted a raccoon', bubbleColor: 'bg-[#152a48] border-[#1e3d68] text-ink' },
      { id: 's1m2', sender: 'Jules', isRight: true, text: 'nobody adopted him. he chose us.', badge: '🦝', badgePos: 'left', bubbleColor: 'bg-[#421d33] border-[#5d2a49] text-rose-50' },
      { id: 's1m3', sender: 'Anonymous', isRight: false, text: 'i need the air fryer on thursday', bubbleColor: 'bg-[#152a48] border-[#1e3d68] text-ink' },
      { id: 's1m4', sender: 'Jules', isRight: true, text: 'thursday is my crispy day', badge: '🍟', badgePos: 'left', bubbleColor: 'bg-[#1d222e] border-line-strong text-ink' },
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
      { id: 's2m4', sender: 'Jules', isRight: true, text: 'a technicality', bubbleColor: 'bg-surface-2 border border-line-strong text-white' },
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
      { id: 's3m2', sender: 'Maya', isRight: true, text: 'is the presentation a hostage situation', badge: '💀', badgePos: 'left', bubbleColor: 'bg-surface-2 border border-line-strong text-white' },
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
};

export function getMessageBackgroundByReaction(
  reactionCounts?: {
    heart?: number;
    cap?: number;
    skull?: number;
    fire?: number;
    hearts?: number;
    caps?: number;
    skulls?: number;
    fires?: number;
    userReacted?: string | null;
    user_reacted?: string | null;
    active?: string | null;
  } | null,
  isRight: boolean = false
): { bubbleClass: string; dominantEmoji: string | null } {
  const defaultClass = isRight
    ? 'bg-[#161c28] border border-[#222c3f] text-ink'
    : 'bg-canvas-2 border border-line-2 text-ink';

  if (!reactionCounts) {
    return {
      bubbleClass: defaultClass,
      dominantEmoji: null,
    };
  }

  const heart = (reactionCounts.heart ?? reactionCounts.hearts) || 0;
  const cap = (reactionCounts.cap ?? reactionCounts.caps) || 0;
  const skull = (reactionCounts.skull ?? reactionCounts.skulls) || 0;
  const fire = (reactionCounts.fire ?? reactionCounts.fires) || 0;

  // The user's active reaction takes immediate priority so the message background changes instantly when reacted!
  const userChoice = reactionCounts.userReacted || reactionCounts.user_reacted || reactionCounts.active;

  let activeMood: string | null = null;
  if (userChoice && ['heart', 'cap', 'skull', 'fire'].includes(userChoice)) {
    activeMood = userChoice;
  } else {
    const maxVal = Math.max(heart, cap, skull, fire);
    if (maxVal > 0) {
      if (skull === maxVal) activeMood = 'skull';
      else if (fire === maxVal) activeMood = 'fire';
      else if (cap === maxVal) activeMood = 'cap';
      else if (heart === maxVal) activeMood = 'heart';
    }
  }

  if (!activeMood) {
    return {
      bubbleClass: defaultClass,
      dominantEmoji: null,
    };
  }

  // Matte dark theme, strictly NO glowing borders or neon tints
  if (activeMood === 'skull') {
    // User requirement: "skull should change the bg to gray not purple"
    return {
      bubbleClass: 'bg-[#23262f] border border-[#3a3f4e] text-slate-100',
      dominantEmoji: '💀',
    };
  }

  if (activeMood === 'fire') {
    return {
      bubbleClass: 'bg-[#271b14] border border-[#4d2f1d] text-amber-50',
      dominantEmoji: '🔥',
    };
  }

  if (activeMood === 'cap') {
    return {
      bubbleClass: 'bg-[#132034] border border-[#233a5e] text-blue-50',
      dominantEmoji: '🧢',
    };
  }

  if (activeMood === 'heart') {
    return {
      bubbleClass: 'bg-[#291420] border border-[#4e2238] text-rose-50',
      dominantEmoji: '❤️',
    };
  }

  return {
    bubbleClass: defaultClass,
    dominantEmoji: null,
  };
}

interface LiveFloatingReaction {
  id: string;
  msgKey: string;
  emoji: string;
  glowColor: string;
  xOffset: number;
  drift: number;
  rotation: number;
  scale: number;
}

function DiscoverPage({
  filterPublisher,
  targetExcerptId,
  onClearFilter,
  onNavigateTab,
  onNavigate,
  onOpenMenu,
  initialTab = 'For you',
}: {
  filterPublisher?: string | null;
  targetExcerptId?: number | null;
  onClearFilter?: () => void;
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (nav: string, topic?: string, extraParam?: any) => void;
  onOpenMenu?: () => void;
  initialTab?: 'For you' | 'Following' | 'Fresh';
}) {
  const [activeTab, setActiveTab] = useState<'For you' | 'Following' | 'Fresh'>(initialTab || 'For you');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [savedBackendIds, setSavedBackendIds] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem('cchat_saved_excerpt_ids');
      return new Set<number>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set<number>();
    }
  });

  useEffect(() => {
    const syncSaved = () => {
      cchatApi.getSavedExcerpts()
        .then((savedList) => {
          setSavedBackendIds((prev) => {
            const next = new Set(prev);
            savedList.forEach((s) => {
              if (s.excerpt?.id) next.add(s.excerpt.id);
            });
            try {
              localStorage.setItem('cchat_saved_excerpt_ids', JSON.stringify(Array.from(next)));
            } catch {}
            return next;
          });
        })
        .catch(() => {});
    };
    syncSaved();
    window.addEventListener('cchat_saved_changed', syncSaved);
    return () => window.removeEventListener('cchat_saved_changed', syncSaved);
  }, []);

  const [activeStoryOptionsId, setActiveStoryOptionsId] = useState<string | null>(null);
  const [reactions, setReactions] = useState(INITIAL_REACTIONS);
  const [floatingReactions, setFloatingReactions] = useState<LiveFloatingReaction[]>([]);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [backendStories, setBackendStories] = useState<DiscoverStory[]>([]);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [readStoryMessages, setReadStoryMessages] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('cchat_discover_story_read_msgs');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const triggerFloatingReaction = useCallback((msgKey: string, type: 'heart' | 'cap' | 'skull' | 'fire') => {
    const emojiMap: Record<string, { emoji: string; glow: string }> = {
      heart: { emoji: '❤️', glow: 'rgba(251, 113, 133, 0.9)' },
      cap: { emoji: '🧢', glow: 'rgba(96, 165, 250, 0.9)' },
      skull: { emoji: '💀', glow: 'rgba(226, 232, 240, 0.9)' },
      fire: { emoji: '🔥', glow: 'rgba(251, 191, 36, 0.95)' },
    };
    const info = emojiMap[type] || emojiMap.fire;

    const count = 1 + (Math.random() > 0.5 ? 1 : 0);
    const newItems: LiveFloatingReaction[] = Array.from({ length: count }).map((_, i) => ({
      id: `${msgKey}-${Date.now()}-${Math.random()}-${i}`,
      msgKey,
      emoji: info.emoji,
      glowColor: info.glow,
      xOffset: Math.floor(Math.random() * 55) + 15,
      drift: Math.floor(Math.random() * 30) - 15,
      rotation: Math.floor(Math.random() * 30) - 15,
      scale: +(0.95 + Math.random() * 0.35).toFixed(2),
    }));

    setFloatingReactions((prev) => [...prev, ...newItems]);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((item) => !newItems.some((n) => n.id === item.id)));
    }, 1450);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoadingBackend(true);
    cchatApi
      .getExcerpts({
        publisher: filterPublisher || undefined,
        tab: filterPublisher ? undefined : (activeTab === 'Fresh' ? 'fresh' : activeTab === 'Following' ? 'following' : undefined),
      })
      .then((excerpts) => {
        if (!isMounted) return;
        if (Array.isArray(excerpts) && excerpts.length > 0) {
          let mapped: DiscoverStory[] = excerpts.map((e) => {
            const authorParts =
              e.authors_summary?.split('×')[0]?.trim() ||
              e.authors_summary?.split('&')[0]?.trim() ||
              'Anonymous';
            const authorHandle = authorParts.startsWith('@')
              ? authorParts
              : `@${authorParts.toLowerCase().replace(/\s+/g, '')}`;
            const authorName = authorParts.replace('@', '');

            const authorMsg = e.messages.find((m) => !m.is_anonymous && m.sender_avatar);
            const authorAvatar = authorMsg?.sender_avatar;

            const messages: DiscoverMessage[] = (e.messages || []).map((m) => {
              const isRight = !m.is_anonymous;
              const bubbleColor = isRight
                ? 'bg-[#421d33] border-[#5d2a49] text-rose-50'
                : 'bg-[#152a48] border-[#1e3d68] text-ink';

              const msgKey = `backend-${e.id}-m-${m.id}`;
              if (m.reactions) {
                setReactions((prev) => ({
                  ...prev,
                  [msgKey]: {
                    heart: m.reactions.heart || 0,
                    cap: m.reactions.cap || 0,
                    skull: m.reactions.skull || 0,
                    fire: m.reactions.fire || 0,
                    userReacted: m.reactions.user_reacted || null,
                  },
                }));
              }

              return {
                id: msgKey,
                sender: m.sender_display,
                isRight,
                isAnonymous: m.is_anonymous,
                text: m.text,
                bubbleColor,
              };
            });

            const sections =
              e.sections && e.sections.length > 0
                ? e.sections.map((s) => {
                    const firstMsg =
                      s.messages && s.messages.length > 0
                        ? s.messages[0]
                        : s.message_ids && s.message_ids.length > 0
                        ? { id: s.message_ids[0] }
                        : null;
                    const firstMessageId = firstMsg
                      ? `backend-${e.id}-m-${firstMsg.id}`
                      : messages[0]?.id || '';
                    return {
                      header: s.header,
                      topicTag: s.topic_tag,
                      firstMessageId,
                    };
                  })
                : undefined;

            const isPartnerAnon = e.authors_summary?.includes('Anonymous');
            let sanitizedTitle = e.title || `${e.topic?.tag || '#dating'} dialogue`;
            if (isPartnerAnon && (sanitizedTitle.toLowerCase().includes('maya') || sanitizedTitle.toLowerCase().includes('chen'))) {
              sanitizedTitle = `${e.topic?.tag || '#dating'} dialogue`;
            }

            return {
              id: `story-backend-${e.id}`,
              backendId: e.id,
              title: sanitizedTitle,
              authorName,
              authorHandle,
              authorsSummary: e.authors_summary,
              authorAvatar: authorAvatar || undefined,
              authorInitials: authorName.slice(0, 2).toUpperCase() || 'CC',
              timeAgo: 'Recently',
              topicTag: e.topic?.tag || '#dating',
              readingNow: `${Math.floor(Math.random() * 200 + 100)} reading now`,
              reads: `${e.reads_count} reads`,
              upNext: {
                label: 'UP NEXT',
                title: 'Next story',
              },
              messages,
              sections,
            };
          });

          if (targetExcerptId) {
            const targetIdx = mapped.findIndex((s) => s.backendId === targetExcerptId);
            if (targetIdx > 0) {
              const targetItem = mapped[targetIdx];
              mapped = [targetItem, ...mapped.filter((_, i) => i !== targetIdx)];
            }
          }

          setBackendStories(mapped);
          setSavedBackendIds((prev) => {
            const next = new Set(prev);
            excerpts.forEach((e) => {
              if (e.is_saved) {
                next.add(e.id);
              }
            });
            try {
              localStorage.setItem('cchat_saved_excerpt_ids', JSON.stringify(Array.from(next)));
            } catch {}
            return next;
          });
          setActiveStoryIdx(0);
        } else {
          setBackendStories([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load backend excerpts:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingBackend(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, filterPublisher, targetExcerptId, shuffleKey]);

  const allStories = React.useMemo(() => {
    let fallback = DISCOVER_STORIES;
    if (activeTab === 'For you') {
      fallback = [...DISCOVER_STORIES].sort(() => Math.random() - 0.5);
    }

    let list = filterPublisher
      ? backendStories
      : (backendStories.length > 0 ? [...backendStories, ...fallback] : fallback);

    if (targetExcerptId) {
      const idx = list.findIndex(
        (s) => s.backendId === targetExcerptId || s.id === `story-backend-${targetExcerptId}`
      );
      if (idx > 0) {
        list = [list[idx], ...list.filter((_, i) => i !== idx)];
      }
    }
    return list;
  }, [filterPublisher, backendStories, targetExcerptId, activeTab, shuffleKey]);

  const feedContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  const isPointerDown = useRef(false);

  const fmt = (n: number) =>
    n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n.toString();

  // Scroll to target story immediately when targetExcerptId is provided
  useEffect(() => {
    if (targetExcerptId) {
      setActiveTab('For you');
      setActiveStoryIdx(0);
      setTimeout(() => {
        const el = document.getElementById('discover-story-0');
        if (el && feedContainerRef.current) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (feedContainerRef.current) {
          feedContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    }
  }, [targetExcerptId]);

  // Live audience reactions streamer ("220 reading now")
  useEffect(() => {
    if (allStories.length === 0) return;
    const currentStory = allStories[activeStoryIdx];
    if (!currentStory || !currentStory.messages || currentStory.messages.length === 0) return;

    const interval = setInterval(() => {
      const randomMsg = currentStory.messages[Math.floor(Math.random() * currentStory.messages.length)];
      if (!randomMsg) return;

      const types: Array<'heart' | 'cap' | 'skull' | 'fire'> = ['heart', 'cap', 'skull', 'fire'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      triggerFloatingReaction(randomMsg.id, randomType);
    }, 2800);

    return () => clearInterval(interval);
  }, [activeStoryIdx, allStories, triggerFloatingReaction]);

  // Restore story position where user left off (unless targetExcerptId is specified)
  useEffect(() => {
    if (targetExcerptId) {
      setActiveStoryIdx(0);
      setTimeout(() => {
        const el = document.getElementById('discover-story-0');
        if (el && feedContainerRef.current) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (feedContainerRef.current) {
          feedContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    if (allStories.length === 0) return;
    const savedIdxStr = localStorage.getItem('cchat_discover_last_story_idx');
    if (savedIdxStr !== null) {
      const savedIdx = parseInt(savedIdxStr, 10);
      if (!isNaN(savedIdx) && savedIdx >= 0 && savedIdx < allStories.length) {
        setActiveStoryIdx(savedIdx);
        setTimeout(() => {
          const el = document.getElementById(`discover-story-${savedIdx}`);
          if (el && feedContainerRef.current) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 200);
      }
    }
  }, [allStories.length, targetExcerptId]);

  // Track read messages for the currently viewed story
  useEffect(() => {
    if (allStories.length === 0) return;
    const currentStory = allStories[activeStoryIdx];
    if (!currentStory || !currentStory.messages || currentStory.messages.length === 0) return;

    const timer = setTimeout(() => {
      const lastMsg = currentStory.messages[currentStory.messages.length - 1];
      if (lastMsg) {
        setReadStoryMessages((prev) => {
          const updated = { ...prev, [currentStory.id]: lastMsg.id };
          try {
            localStorage.setItem('cchat_discover_story_read_msgs', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [activeStoryIdx, allStories]);

  const toggle = async (key: string, type: 'heart' | 'cap' | 'skull' | 'fire') => {
    triggerFloatingReaction(key, type);
    setReactions((prev) => {
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

    if (key.startsWith('backend-')) {
      const parts = key.split('-m-');
      if (parts[1]) {
        const msgId = parseInt(parts[1], 10);
        if (!isNaN(msgId)) {
          cchatApi.reactMessage(msgId, type).catch((err) => console.warn('Reaction error:', err));
        }
      }
    }
  };

  const handleToggleSave = async (backendId: number) => {
    if (!backendId) return;
    setSavedBackendIds((prev) => {
      const next = new Set(prev);
      if (next.has(backendId)) {
        next.delete(backendId);
      } else {
        next.add(backendId);
      }
      try {
        localStorage.setItem('cchat_saved_excerpt_ids', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });

    try {
      const res = await cchatApi.toggleSaveExcerpt(backendId);
      setSavedBackendIds((prev) => {
        const next = new Set(prev);
        if (res.saved) {
          next.add(backendId);
        } else {
          next.delete(backendId);
        }
        try {
          localStorage.setItem('cchat_saved_excerpt_ids', JSON.stringify(Array.from(next)));
        } catch {}
        return next;
      });
      window.dispatchEvent(new Event('cchat_saved_changed'));
    } catch (e) {
      console.warn('Backend toggle save in DiscoverPage:', e);
    }
  };

  const handleTabClick = (tab: 'For you' | 'Following' | 'Fresh') => {
    if (filterPublisher && onClearFilter) {
      onClearFilter();
    }
    if (tab === 'For you') {
      setShuffleKey((k) => k + 1);
    }
    setActiveStoryIdx(0);
    setTimeout(() => {
      feedContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
    setActiveTab(tab);
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  const scrollToStory = (targetIndex: number) => {
    if (allStories.length === 0) return;
    const clampedIndex = (targetIndex + allStories.length) % allStories.length;
    const el = document.getElementById(`discover-story-${clampedIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveStoryIdx(clampedIndex);
    }
  };

  // Keyboard arrow / J-K navigation for feeds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToStory(activeStoryIdx + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToStory(activeStoryIdx - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStoryIdx, allStories.length]);

  // Touch and mouse swipe gesture handlers
  const onSwipeStart = (clientX: number, clientY: number) => {
    touchStartX.current = clientX;
    touchStartY.current = clientY;
    touchStartTime.current = Date.now();
    isPointerDown.current = true;
  };

  const onSwipeEnd = (clientX: number, clientY: number) => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;

    const deltaY = touchStartY.current - clientY;
    const deltaX = touchStartX.current - clientX;
    const absY = Math.abs(deltaY);
    const absX = Math.abs(deltaX);
    const elapsed = Date.now() - touchStartTime.current;

    if (elapsed > 900) return;

    if (absY > 35 && absY > absX * 0.7) {
      if (deltaY > 0) {
        scrollToStory(activeStoryIdx + 1);
      } else {
        scrollToStory(activeStoryIdx - 1);
      }
      return;
    }

    if (absX > 45 && absX > absY * 1.1) {
      if (deltaX > 0) {
        scrollToStory(activeStoryIdx + 1);
      } else {
        scrollToStory(activeStoryIdx - 1);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      onSwipeStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length > 0) {
      onSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
  };

  // Scroll spy to track currently visible story
  const handleScroll = () => {
    if (!feedContainerRef.current) return;
    const containerTop = feedContainerRef.current.getBoundingClientRect().top;
    let closestIndex = activeStoryIdx;
    let closestDist = Infinity;

    allStories.forEach((_, idx) => {
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
      localStorage.setItem('cchat_discover_last_story_idx', String(closestIndex));
    }
  };


  const ReactionBar = ({ msgKey, className = '' }: { msgKey: string; className?: string }) => {
    const r = reactions[msgKey] || { heart: 0, cap: 0, skull: 0, fire: 0, userReacted: null };
    const types = [
      { type: 'heart' as const, icon: <Heart className="w-3 h-3 fill-current text-rose-400" />, active: 'bg-[#3f192b] border-[#7d2952] text-rose-300' },
      { type: 'cap' as const, icon: <CapIcon />, active: 'bg-[#182a45] border-[#254d87] text-accent-bright' },
      { type: 'skull' as const, icon: <SkullIcon />, active: 'bg-[#23262f] border-[#4a5064] text-slate-100' },
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
              r.userReacted === type ? `${active} font-semibold shadow-xs` : 'bg-surface border-line-2 text-ink-muted hover:text-white'
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
      <div className="flex-1 flex flex-col border-r border-line min-w-0 relative h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 px-3 sm:px-6 md:px-8 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep/90 backdrop-blur-md sticky top-0 z-10 w-full min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-1.5 -ml-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer shrink-0"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer min-w-0"
              onClick={() => onNavigate && onNavigate('Discover')}
              aria-label="Go to Discover"
            >
              <span className="md:hidden shrink-0"><CchatLogo /></span>
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
                <span className="hidden md:inline">The plot is public.</span>
                <span className="md:hidden font-black">CCHAT</span>
              </h2>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={() => onNavigate?.('Search')}
              className="sm:hidden p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative w-48 sm:w-64 md:w-80 hidden sm:block">
              <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats, people, plot twists"
                onClick={() => onNavigate?.('Search')}
                className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors cursor-pointer"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate?.('Notifications')}
              className="p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-3 sm:px-6 md:px-8 pt-4 pb-2.5 flex items-center justify-between border-b border-line sm:border-0 shrink-0 gap-2 overflow-x-auto no-scrollbar w-full min-w-0">
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            {(['For you', 'Following', 'Fresh'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`text-sm font-bold transition-all relative pb-1 cursor-pointer whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-ink-faint hover:text-ink-soft'}`}
              >
                {tab}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {allStories.length > 0 && (
              <span className="text-[11px] font-mono text-ink-muted bg-surface px-2.5 py-0.5 rounded-full border border-line-2 whitespace-nowrap">
                Chat {activeStoryIdx + 1} of {allStories.length}
              </span>
            )}
            <span className="hidden sm:inline text-[11px] font-semibold text-ink-faint uppercase tracking-widest whitespace-nowrap">
              ONE CHAT. ONE MORE PLOT TWIST.
            </span>
          </div>
        </div>

        {/* Scrollable Feed Container - Clean Vertical Chatroom Feed */}
        <div
          ref={feedContainerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onScroll={handleScroll}
          className="flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth snap-y snap-proximity touch-pan-y overscroll-contain px-3 sm:px-6 md:px-8 py-4 sm:py-6 min-w-0"
        >
          {filterPublisher && (
            <div className="px-4 py-2.5 rounded-2xl bg-canvas-2 border border-line-2 flex items-center justify-between text-xs shadow-md">
              <div className="flex items-center gap-2 text-ink-soft">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span>Published chats by <strong className="text-white font-semibold">{filterPublisher}</strong></span>
              </div>
              {onClearFilter && (
                <button
                  onClick={onClearFilter}
                  className="px-2.5 py-1 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink-muted hover:text-white transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5"
                  title="Return to general feed"
                >
                  <span>All stories</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {filterPublisher && !loadingBackend && allStories.length === 0 && (
            <div className="p-8 sm:p-12 rounded-3xl bg-canvas-2 border border-line-2 text-center space-y-3 shadow-xl my-4">
              <div className="w-12 h-12 rounded-2xl bg-surface border border-line-2 mx-auto flex items-center justify-center text-ink-muted">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No published stories yet</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
                {filterPublisher} hasn't published any excerpts to the Discover feed yet.
              </p>
              {onClearFilter && (
                <button
                  onClick={onClearFilter}
                  className="px-4 py-2 rounded-xl bg-accent-strong hover:bg-accent text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Explore all stories
                </button>
              )}
            </div>
          )}

          {loadingBackend && backendStories.length === 0 && (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-ink-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-muted" />
              <span>Loading freshest public chats...</span>
            </div>
          )}
          {allStories.map((story, storyIdx) => {
            const isSaved = Boolean(story.backendId && savedBackendIds.has(story.backendId));
            const nextStory = allStories[(storyIdx + 1) % allStories.length];

            return (
              <div
                key={story.id}
                id={`discover-story-${storyIdx}`}
                className="w-full max-w-3xl mx-auto snap-start scroll-mt-6 py-4 sm:py-6 flex flex-col min-w-0"
              >
                <article className="w-full rounded-2xl sm:rounded-3xl bg-canvas-2 border border-line-2 p-3.5 sm:p-6 shadow-xl min-w-0 overflow-hidden">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2.5 pb-4 border-b border-line min-w-0">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      {story.authorAvatar && !story.authorsSummary?.startsWith('Anonymous') ? (
                        <img
                          src={story.authorAvatar}
                          alt={story.authorName}
                          onClick={() => onNavigate?.('Profile', story.authorHandle)}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-line-strong hover:border-accent transition-colors cursor-pointer shrink-0"
                        />
                      ) : (
                        <div
                          onClick={() => onNavigate?.('Profile', story.authorHandle)}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-surface-2 border-2 border-line-strong hover:border-accent transition-colors flex items-center justify-center text-xs font-black text-ink-soft cursor-pointer shrink-0"
                        >
                          {story.authorInitials || 'CC'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate">
                          {story.title}
                        </h3>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-xs text-ink-faint flex-wrap">
                          {story.authorsSummary ? (
                            <span className="flex items-center gap-1 font-semibold text-ink-soft min-w-0">
                              {story.authorsSummary.includes('×') ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onNavigate?.('Profile', story.authorHandle)}
                                    className="font-semibold text-ink-muted hover:text-white transition-colors cursor-pointer truncate max-w-[100px] sm:max-w-none text-left"
                                  >
                                    {story.authorsSummary.split('×')[0].trim()}
                                  </button>
                                  <span className="text-ink-faint">×</span>
                                  <span className="text-ink-muted">Anonymous</span>
                                </>
                              ) : story.authorsSummary.includes('&') ? (
                                <span className="font-semibold text-ink-soft truncate max-w-[130px] sm:max-w-none">{story.authorsSummary}</span>
                              ) : (
                                <span className="text-ink-muted">Anonymous</span>
                              )}
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => onNavigate?.('Profile', story.authorHandle)}
                                className="font-semibold text-ink-muted hover:text-white transition-colors cursor-pointer truncate max-w-[100px] sm:max-w-none text-left"
                              >
                                {story.authorHandle}
                              </button>
                              <span>×</span>
                              <span className="text-ink-muted">Anonymous</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="shrink-0">{story.timeAgo}</span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => onNavigate?.('Topic detail', story.topicTag)}
                            className="text-accent/90 font-medium hover:underline cursor-pointer shrink-0"
                          >
                            {story.topicTag}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStoryOptionsId(story.id)}
                      className="p-1.5 sm:p-2 text-ink-faint hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer shrink-0 -mr-1"
                      title="More options"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Reading Status */}
                  <div className="py-3 flex items-center justify-center gap-2 text-[11px] text-ink-faint">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{story.readingNow}</span>
                    <span>•</span>
                    <span>reactions set the mood</span>
                  </div>

                  {/* Messages list with Section dividers */}
                  <div className="space-y-4 py-2">
                    {(() => {
                      const lastReadMsgId = readStoryMessages[story.id];
                      const readIdx = lastReadMsgId ? story.messages.findIndex((msg) => msg.id === lastReadMsgId) : -1;
                      const firstUnreadMsgId = (readIdx >= 0 && readIdx < story.messages.length - 1)
                        ? story.messages[readIdx + 1]?.id
                        : null;

                      return story.messages.map((m) => {
                        const sectionStartingHere = story.sections?.find((s) => s.firstMessageId === m.id);
                        return (
                          <React.Fragment key={m.id}>
                            {m.id === firstUnreadMsgId && (
                              <div
                                className="my-5 relative flex items-center justify-center select-none py-1.5 pointer-events-none"
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
                              <div className="my-5 py-1.5 flex items-center gap-3 select-none">
                                <div className="h-px bg-surface-2 flex-1"></div>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-line-2 text-[10px] shadow-xs">
                                  <Eye className="w-3.5 h-3.5 text-accent stroke-[1.8]" />
                                  <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider">
                                    {sectionStartingHere.header}
                                  </span>
                                  <span className="text-ink-faint">•</span>
                                  <span className="text-accent font-semibold">{sectionStartingHere.topicTag}</span>
                                </div>
                                <div className="h-px bg-surface-2 flex-1"></div>
                              </div>
                            )}
                            <div
                              className={`space-y-1.5 flex flex-col ${m.isRight ? 'items-end' : 'items-start'} transition-all ${
                                m.id === firstUnreadMsgId ? 'border-l-2 border-accent/80 pl-2.5 -ml-2.5' : ''
                              }`}
                            >
                            <div className="text-[11px] text-ink-muted font-semibold flex items-center gap-1.5 px-0.5">
                              <span>{m.isAnonymous ? 'Anonymous' : m.sender}</span>
                              {!m.isRight && !m.isAnonymous && <ShieldCheck className="w-3 h-3 text-accent" />}
                            </div>

                            {(() => {
                              const reactionData = reactions[m.id];
                              const { bubbleClass } = getMessageBackgroundByReaction(
                                reactionData,
                                m.isRight
                              );

                              return (
                                <div className={`flex items-center gap-3 max-w-[75%] sm:max-w-[70%] ${m.isRight ? 'flex-row-reverse' : 'flex-row'}`}>
                                  <div className={`relative w-fit max-w-full flex flex-col ${m.isRight ? 'items-end' : 'items-start'}`}>
                                    {/* Floating live reaction emojis */}
                                    {floatingReactions
                                      .filter((r) => r.msgKey === m.id)
                                      .map((r) => (
                                        <span
                                          key={r.id}
                                          className="absolute pointer-events-none select-none animate-live-reaction z-30 text-xl sm:text-2xl"
                                          style={{
                                            left: `${r.xOffset}%`,
                                            bottom: '12px',
                                            ['--tx' as any]: `${r.drift}px`,
                                            ['--rot' as any]: `${r.rotation}deg`,
                                            ['--scale' as any]: r.scale,
                                            ['--glow-color' as any]: r.glowColor,
                                          }}
                                        >
                                          {r.emoji}
                                        </span>
                                      ))}
                                    <div
                                      className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium leading-relaxed transition-all duration-300 ${
                                        m.isRight ? 'rounded-tr-sm' : 'rounded-tl-sm'
                                      } ${bubbleClass}`}
                                    >
                                      {m.text}
                                    </div>
                                    <ReactionBar msgKey={m.id} className={m.isRight ? 'justify-end' : 'justify-start'} />
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </React.Fragment>
                      );
                    });
                  })()}
                </div>


                  {/* Card Footer */}
                  <div className="mt-5 pt-3.5 border-t border-line flex items-center justify-between text-xs text-ink-faint gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-ink-muted font-medium whitespace-nowrap">{story.reads}</span>
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-ink-faint">
                        <span>•</span>
                        <SkullIcon />
                        <span>Reactions active</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => scrollToStory((storyIdx + 1) % allStories.length)}
                        className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-surface hover:bg-surface-2 text-ink hover:text-white transition-all text-xs font-semibold border border-line-2 cursor-pointer group whitespace-nowrap"
                        title="Scroll to next chatroom"
                      >
                        <span>Next chat</span>
                        <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform text-accent shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSave(story.backendId)}
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                          isSaved ? 'text-accent bg-accent/15 border border-accent/40 shadow-xs' : 'text-ink-muted hover:text-white hover:bg-surface border border-transparent'
                        }`}
                        title={isSaved ? 'Saved to profile (Click to remove)' : 'Save to profile'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          alert('Excerpt link copied to clipboard!');
                        }}
                        className="p-1.5 sm:p-2 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer shrink-0"
                        title="Share excerpt"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* More Options Modal / Bottom Sheet */}
                  {activeStoryOptionsId === story.id && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
                      <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                        onClick={() => setActiveStoryOptionsId(null)}
                      />
                      <div className="relative w-full sm:max-w-sm bg-canvas-2 border border-line-2 rounded-t-3xl sm:rounded-3xl p-5 z-10 space-y-3.5 shadow-2xl animate-in slide-in-from-bottom duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-line">
                          <div className="min-w-0 pr-3">
                            <h4 className="text-sm font-bold text-white truncate">{story.title}</h4>
                            <p className="text-[11px] text-ink-muted truncate mt-0.5">{story.authorsSummary} · {story.topicTag}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveStoryOptionsId(null)}
                            className="p-1.5 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-1 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(window.location.href);
                              alert('Chat link copied to clipboard!');
                              setActiveStoryOptionsId(null);
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-surface text-ink-soft hover:text-white transition-colors cursor-pointer text-left"
                          >
                            <Share2 className="w-4 h-4 text-accent shrink-0" />
                            <span>Copy link to this chat</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleToggleSave(story.backendId);
                              setActiveStoryOptionsId(null);
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-surface text-ink-soft hover:text-white transition-colors cursor-pointer text-left"
                          >
                            <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{isSaved ? 'Remove bookmark' : 'Bookmark this chat'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveStoryOptionsId(null);
                              onNavigate?.('Topic detail', story.topicTag);
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-surface text-ink-soft hover:text-white transition-colors cursor-pointer text-left"
                          >
                            <Tag className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>View topic {story.topicTag}</span>
                          </button>

                          {story.authorHandle && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveStoryOptionsId(null);
                                onNavigate?.('Profile', story.authorHandle);
                              }}
                              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-surface text-ink-soft hover:text-white transition-colors cursor-pointer text-left"
                            >
                              <User className="w-4 h-4 text-accent shrink-0" />
                              <span>View {story.authorHandle}'s profile</span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveStoryOptionsId(null)}
                          className="w-full py-2.5 text-center text-xs font-bold text-ink-muted hover:text-white rounded-xl bg-surface border border-line-2 transition-colors cursor-pointer mt-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        {/* Hero Promo */}
        <div
          onClick={() => onNavigate && onNavigate("Tonight's picks")}
          className="relative rounded-3xl overflow-hidden aspect-[4/3] border border-line-2 group cursor-pointer shadow-lg"
        >
          <img src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80" alt="After hours" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75 contrast-125" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 p-5 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-800/50 w-fit">THE AFTER-HOURS EDIT</span>
            <div>
              <h3 className="text-xl font-black text-white leading-tight">Small talk.<br />Big energy.</h3>
              <div className="flex items-center gap-1 text-xs font-semibold text-ink-soft group-hover:text-white mt-2">
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
              className="text-xs text-ink-muted hover:text-accent flex items-center gap-1 font-semibold cursor-pointer"
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
              className="p-3 rounded-2xl bg-canvas-2 border border-line-2 hover:border-line-strong hover:bg-surface transition-all flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-surface-2 text-ink-muted group-hover:text-accent transition-colors shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white group-hover:text-accent transition-colors truncate">{item.tag}</div>
                <div className="text-[11px] text-ink-muted truncate mt-0.5">{item.desc}</div>
                <div className="text-[10px] text-ink-faint mt-1">{item.count}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mood Box */}
        <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 space-y-3">
          <h4 className="text-xs font-extrabold text-white">You set the mood.</h4>
          <p className="text-[11px] text-ink-muted leading-relaxed">React to a message. Its most-loved reaction colors the bubble.</p>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { label: 'Heart', icon: <Heart className="w-4 h-4 text-ink-soft" /> },
              { label: 'Cap', icon: <span className="text-base">🧢</span> },
              { label: 'Skull', icon: <span className="text-base">💀</span> },
              { label: 'Fire', icon: <span className="text-base">🔥</span> },
            ].map((it, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface border border-line-2 hover:border-line-strong transition-colors cursor-pointer">
                {it.icon}
                <span className="text-[10px] font-semibold text-ink-muted">{it.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Banner */}
        <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
            <p className="text-[11px] text-ink-faint leading-relaxed mt-1">Only the publisher published this chat. Other participants stay anonymous.</p>
          </div>
        </div>

        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
          <FooterLinks onNavigate={onNavigate} />
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

function FollowingPage({ onNavigateTab, onNavigate, onOpenMenu }: FollowingPageProps) {
  return (
    <DiscoverPage
      initialTab="Following"
      onNavigateTab={onNavigateTab}
      onNavigate={onNavigate}
      onOpenMenu={onOpenMenu}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 3: MY CHATS PAGE (Imported from ./pages/MyChatsPage)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// VIEW 4: SAVED PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
function SavedPage({ onNavigate, onOpenMenu }: { onNavigate?: (nav: string, handleOrTopic?: string, extraParam?: any) => void; onOpenMenu?: () => void }) {
  const [activeCollection, setActiveCollection] = useState<string>('All saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCollectionName, setEditingCollectionName] = useState('Plot twists');
  const [savedList, setSavedList] = useState<SavedExcerptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSavedId, setSelectedSavedId] = useState<number | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reactionOverrides, setReactionOverrides] = useState<Record<number, { heart: number; cap: number; skull: number; fire: number; user_reacted: string | null }>>({});
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchSaved = async () => {
    try {
      const data = await cchatApi.getSavedExcerpts();
      setSavedList(data);
      if (data.length > 0 && selectedSavedId === null) {
        setSelectedSavedId(data[0].id);
      }
      // Update localStorage cache of saved excerpt IDs for DiscoverPage sync
      try {
        const ids = data.map((item) => item.excerpt?.id).filter(Boolean);
        localStorage.setItem('cchat_saved_excerpt_ids', JSON.stringify(ids));
      } catch {}
    } catch (e) {
      console.warn('Failed to load saved excerpts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
    const handleSync = () => {
      fetchSaved();
    };
    window.addEventListener('cchat_saved_changed', handleSync);
    return () => window.removeEventListener('cchat_saved_changed', handleSync);
  }, []);

  const handleToggleSaveCard = async (excerptId: number, savedId: number) => {
    const isCurrentlyRemoved = removedIds.has(savedId);
    if (!isCurrentlyRemoved) {
      setRemovedIds((prev) => new Set(prev).add(savedId));
      showToast('Removed from saved · Tap bookmark to undo');
    } else {
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(savedId);
        return next;
      });
      showToast('Restored to saved');
    }

    try {
      await cchatApi.toggleSaveExcerpt(excerptId);
      // Sync localStorage
      try {
        const raw = localStorage.getItem('cchat_saved_excerpt_ids');
        const ids = new Set<number>(raw ? JSON.parse(raw) : []);
        if (!isCurrentlyRemoved) {
          ids.delete(excerptId);
        } else {
          ids.add(excerptId);
        }
        localStorage.setItem('cchat_saved_excerpt_ids', JSON.stringify(Array.from(ids)));
      } catch {}
      window.dispatchEvent(new Event('cchat_saved_changed'));
    } catch (e) {
      console.warn('Backend toggle save in SavedPage:', e);
    }
  };

  const handleSetCollection = async (savedId: number, collectionName: string) => {
    setSavedList((prev) =>
      prev.map((s) => (s.id === savedId ? { ...s, collection_name: collectionName } : s))
    );
    showToast(`Saved to "${collectionName}"`);
    try {
      await cchatApi.updateSavedExcerpt(savedId, collectionName);
    } catch (e) {
      console.warn('Failed to update collection:', e);
    }
  };

  const handleReactMessage = async (msgId: number, type: 'heart' | 'cap' | 'skull' | 'fire') => {
    try {
      const res = await cchatApi.reactMessage(msgId, type);
      setReactionOverrides((prev) => ({
        ...prev,
        [msgId]: {
          heart: res.heart,
          cap: res.cap,
          skull: res.skull,
          fire: res.fire,
          user_reacted: res.user_reacted,
        },
      }));
    } catch (e) {
      console.warn('React message in SavedPage:', e);
    }
  };

  const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n.toString());

  // Collections count calculations
  const allSavedCount = savedList.filter((s) => !removedIds.has(s.id)).length;
  const plotTwistsCount = savedList.filter(
    (s) => !removedIds.has(s.id) && (s.collection_name === 'Plot twists' || s.excerpt?.topic?.tag === '#roommatelore')
  ).length;
  const dateNightCount = savedList.filter(
    (s) => !removedIds.has(s.id) && (s.collection_name === 'Date night lore' || s.excerpt?.topic?.tag === '#dating')
  ).length;
  const officeSurvivalCount = savedList.filter(
    (s) => !removedIds.has(s.id) && (s.collection_name === 'Office survival' || s.excerpt?.topic?.tag === '#workbesties')
  ).length;

  const activeSavedItems = savedList.filter((item) => !removedIds.has(item.id));
  const currentSavedItem = activeSavedItems.find((s) => s.id === selectedSavedId) || activeSavedItems[0];

  const filteredItems = activeSavedItems.filter((item) => {
    const e = item.excerpt;
    if (!e) return false;

    // Filter by collection
    if (activeCollection !== 'All saved') {
      const coll = item.collection_name;
      const tag = e.topic?.tag || '';
      const matchesName = coll.toLowerCase() === activeCollection.toLowerCase();
      const matchesTopic =
        (activeCollection === 'Plot twists' && tag === '#roommatelore') ||
        (activeCollection === 'Date night lore' && tag === '#dating') ||
        (activeCollection === 'Office survival' && tag === '#workbesties');
      if (!matchesName && !matchesTopic) return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = e.title?.toLowerCase().includes(q);
      const topicMatch = e.topic?.tag?.toLowerCase().includes(q) || e.topic?.name?.toLowerCase().includes(q);
      const authorsMatch = e.authors_summary?.toLowerCase().includes(q);
      const msgMatch = e.messages?.some((m: ExcerptMessage) => m.text?.toLowerCase().includes(q));
      if (!titleMatch && !topicMatch && !authorsMatch && !msgMatch) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-accent-strong text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-accent-bright animate-in fade-in slide-in-from-bottom duration-200">
          {toastMessage}
        </div>
      )}

      {/* Center Main Feed */}
      <div className="flex-1 flex flex-col border-r border-line min-w-0 bg-canvas-deep">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-1.5 -ml-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
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
              className="sm:hidden p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative w-48 sm:w-64 md:w-80 hidden sm:block">
              <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved chats, people, lore"
                className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong">
                ⌘ K
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-5 pb-20 md:pb-5 overflow-y-auto space-y-6">
          {/* Section Hero */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">
              YOUR LIBRARY · PRIVATE
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1.5 leading-tight">
              Worth another read.
            </h1>
            <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
              {allSavedCount} {allSavedCount === 1 ? 'saved public chat' : 'saved public chats'}. Your collection is visible only to you.
            </p>
          </div>

          {/* Search Saved Chats Input (mobile visible) */}
          <div className="space-y-1.5 sm:hidden">
            <label className="text-[11px] font-semibold text-ink-muted">Search saved chats</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles, topics or publishers"
              className="w-full bg-canvas-2 border border-line-2 focus:border-accent rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Pills / Tabs */}
          <div className="flex items-center gap-2 border-b border-line pb-3 text-xs overflow-x-auto no-scrollbar">
            {(['All saved', 'Plot twists', 'Date night lore', 'Office survival'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCollection(tab)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCollection === tab
                    ? 'bg-surface text-white border border-line-strong shadow-xs'
                    : 'text-ink-muted hover:text-white hover:bg-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto" />
              <p className="text-xs text-ink-muted">Loading your saved chats...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center space-y-4 p-8 rounded-3xl bg-canvas-2 border border-line-2 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-line-2 flex items-center justify-center mx-auto text-accent">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {allSavedCount === 0 ? 'No saved chats yet' : `No chats in "${activeCollection}"`}
              </h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
                {allSavedCount === 0
                  ? 'When you find conversations you love in the Discover feed, tap the bookmark icon to save them here for your profile.'
                  : `You haven't added any conversations to "${activeCollection}" yet. Check "All saved" to browse your library.`}
              </p>
              {allSavedCount === 0 ? (
                <button
                  onClick={() => onNavigate && onNavigate('Discover')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-strong hover:bg-accent text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-accent/20"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Discover</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveCollection('All saved')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-2 text-white font-semibold text-xs border border-line-2 transition-colors cursor-pointer"
                >
                  View All Saved
                </button>
              )}
            </div>
          ) : (
            /* Cards List */
            <div className="space-y-6">
              {filteredItems.map((item) => {
                const e = item.excerpt;
                if (!e) return null;

                const isRemoved = removedIds.has(item.id);
                const isSelected = selectedSavedId === item.id;
                const authorMsg = e.messages?.find((m: ExcerptMessage) => !m.is_anonymous && m.sender_avatar);
                const avatar = authorMsg?.sender_avatar;

                return (
                  <article
                    key={item.id}
                    onClick={() => setSelectedSavedId(item.id)}
                    className={`rounded-3xl bg-canvas-2 border p-5 sm:p-6 shadow-xl space-y-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-accent/40 bg-canvas-2/95 shadow-accent/5'
                        : 'border-line-2 hover:border-line-strong'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-line-strong shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-surface border border-line-2 flex items-center justify-center font-bold text-xs text-ink-soft shrink-0">
                            {e.title ? e.title.slice(0, 2).toUpperCase() : 'CC'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3
                            onClick={(ev) => {
                              ev.stopPropagation();
                              onNavigate?.('Discover', e.topic?.tag, e.id);
                            }}
                            className="text-base sm:text-lg font-extrabold text-white tracking-tight hover:text-accent transition-colors truncate"
                            title="Click to view full chat in Discover"
                          >
                            {e.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-ink-faint flex-wrap">
                            <span className="font-semibold text-ink-muted">{e.authors_summary}</span>
                            <span>·</span>
                            <span className="text-accent font-medium">{e.topic?.tag || '#chat'}</span>
                            <span>·</span>
                            <span>{e.reads_count} reads</span>
                          </div>
                        </div>
                      </div>

                      {/* Collection badge */}
                      {item.collection_name && item.collection_name !== 'All saved' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-2 text-ink-soft border border-line-2 shrink-0">
                          {item.collection_name}
                        </span>
                      )}
                    </div>

                    {/* Messages snippet */}
                    {(() => {
                      const isExpanded = Boolean(expandedCards[e.id]);
                      const displayMessages = isExpanded ? (e.messages || []) : (e.messages || []).slice(0, 4);
                      return (
                        <div className="space-y-3 py-1">
                          <div className="space-y-3">
                            {displayMessages.map((msg: ExcerptMessage) => {
                              const isRight = !msg.is_anonymous;
                              const bubbleColor = isRight
                                ? 'bg-[#421d33] border-[#5d2a49] text-rose-50'
                                : 'bg-[#152a48] border-[#1e3d68] text-ink';

                              const currentRx = reactionOverrides[msg.id] || msg.reactions || {
                                heart: 0,
                                cap: 0,
                                skull: 0,
                                fire: 0,
                                user_reacted: null,
                              };

                              return (
                                <div key={msg.id} className={`space-y-1 flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
                                  <div className={`text-[11px] text-ink-muted font-semibold ${isRight ? 'pr-1' : 'pl-1'}`}>
                                    {msg.sender_display || (msg.is_anonymous ? 'Anonymous' : 'Participant')}
                                  </div>
                                  <div
                                    className={`rounded-2xl ${
                                      isRight ? 'rounded-tr-sm' : 'rounded-tl-sm'
                                    } px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium w-full sm:max-w-[75%] ${bubbleColor}`}
                                  >
                                    {msg.text}
                                  </div>
                                  <div
                                    className={`flex items-center gap-3 text-[11px] text-ink-faint font-medium ${
                                      isRight ? 'pr-1' : 'pl-1'
                                    } pt-0.5`}
                                  >
                                    <span
                                      onClick={(ev) => {
                                        ev.stopPropagation();
                                        handleReactMessage(msg.id, 'heart');
                                      }}
                                      className={`flex items-center gap-1 cursor-pointer transition-colors ${
                                        currentRx.user_reacted === 'heart' ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                                      }`}
                                    >
                                      ♥ {fmt(currentRx.heart)}
                                    </span>
                                    <span
                                      onClick={(ev) => {
                                        ev.stopPropagation();
                                        handleReactMessage(msg.id, 'cap');
                                      }}
                                      className={`flex items-center gap-1 cursor-pointer transition-colors ${
                                        currentRx.user_reacted === 'cap' ? 'text-sky-400 font-bold' : 'hover:text-sky-400'
                                      }`}
                                    >
                                      🧢 {fmt(currentRx.cap)}
                                    </span>
                                    <span
                                      onClick={(ev) => {
                                        ev.stopPropagation();
                                        handleReactMessage(msg.id, 'skull');
                                      }}
                                      className={`flex items-center gap-1 cursor-pointer transition-colors ${
                                        currentRx.user_reacted === 'skull' ? 'text-slate-200 font-bold' : 'hover:text-slate-200'
                                      }`}
                                    >
                                      💀 {fmt(currentRx.skull)}
                                    </span>
                                    <span
                                      onClick={(ev) => {
                                        ev.stopPropagation();
                                        handleReactMessage(msg.id, 'fire');
                                      }}
                                      className={`flex items-center gap-1 cursor-pointer transition-colors ${
                                        currentRx.user_reacted === 'fire' ? 'text-amber-400 font-bold' : 'hover:text-amber-400'
                                      }`}
                                    >
                                      🔥 {fmt(currentRx.fire)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {(e.messages || []).length > 4 && (
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setExpandedCards(prev => ({ ...prev, [e.id]: !prev[e.id] }));
                              }}
                              className="w-full py-2 px-3.5 rounded-2xl bg-surface hover:bg-surface-2 text-ink-muted hover:text-white text-xs font-semibold border border-line-2 hover:border-accent/30 transition-colors flex items-center justify-between cursor-pointer group mt-2"
                            >
                              <span className="flex items-center gap-1.5 text-accent font-semibold">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>
                                  {isExpanded
                                    ? 'Show preview (4 messages)'
                                    : `Read full chat (${e.messages.length} messages)`}
                                </span>
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-ink-muted group-hover:text-white">
                                <span>{isExpanded ? 'Collapse' : 'Expand here'}</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-line flex items-center justify-between text-xs text-ink-faint">
                      <span>{e.reads_count} reads · Public excerpt · Read & react only</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onNavigate?.('Discover', e.topic?.tag, e.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-accent-strong/15 hover:bg-accent-strong/25 text-accent hover:text-accent-bright text-xs font-bold border border-accent/30 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                          title="Open full chat in Discover feed"
                        >
                          <span>Read chat</span>
                          <ArrowRight className="w-3 h-3 text-accent" />
                        </button>
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleToggleSaveCard(e.id, item.id);
                          }}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            isRemoved
                              ? 'text-ink-muted hover:text-white hover:bg-surface border border-transparent'
                              : 'text-accent bg-accent/15 border border-accent/40 shadow-xs'
                          }`}
                          title={isRemoved ? 'Removed from saved · Click to undo' : 'Saved to profile · Click to remove'}
                        >
                          <Bookmark className={`w-4 h-4 ${!isRemoved ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            navigator.clipboard?.writeText(`${window.location.origin}/discover`);
                            showToast('Excerpt link copied to clipboard');
                          }}
                          className="p-1.5 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        {/* Card 1: Your collections */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-4">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Your collections</h4>

          <div className="space-y-2.5 text-xs">
            <div
              onClick={() => setActiveCollection('All saved')}
              className={`flex items-center justify-between font-bold cursor-pointer transition-colors ${
                activeCollection === 'All saved' ? 'text-accent' : 'text-ink-soft hover:text-white'
              }`}
            >
              <span>All saved</span>
              <span className={activeCollection === 'All saved' ? 'text-accent' : 'text-ink-faint'}>
                {allSavedCount}
              </span>
            </div>
            <div
              onClick={() => setActiveCollection('Plot twists')}
              className={`flex items-center justify-between font-medium cursor-pointer transition-colors ${
                activeCollection === 'Plot twists' ? 'text-accent font-bold' : 'text-ink-soft hover:text-white'
              }`}
            >
              <span>Plot twists</span>
              <span className="text-ink-faint">{plotTwistsCount}</span>
            </div>
            <div
              onClick={() => setActiveCollection('Date night lore')}
              className={`flex items-center justify-between font-medium cursor-pointer transition-colors ${
                activeCollection === 'Date night lore' ? 'text-accent font-bold' : 'text-ink-soft hover:text-white'
              }`}
            >
              <span>Date night lore</span>
              <span className="text-ink-faint">{dateNightCount}</span>
            </div>
            <div
              onClick={() => setActiveCollection('Office survival')}
              className={`flex items-center justify-between font-medium cursor-pointer transition-colors ${
                activeCollection === 'Office survival' ? 'text-accent font-bold' : 'text-ink-soft hover:text-white'
              }`}
            >
              <span>Office survival</span>
              <span className="text-ink-faint">{officeSurvivalCount}</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-line">
            <label className="text-[11px] font-semibold text-ink-muted">Collection name</label>
            <input
              type="text"
              value={editingCollectionName}
              onChange={(e) => setEditingCollectionName(e.target.value)}
              className="w-full bg-surface border border-line-2 focus:border-accent rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-ink-faint leading-relaxed mt-1">
              Private collection · only you can see this name.
            </p>
            <button
              onClick={() => {
                if (editingCollectionName.trim()) {
                  setActiveCollection(editingCollectionName.trim());
                  showToast(`Switched to collection "${editingCollectionName.trim()}"`);
                }
              }}
              className="text-[11px] text-accent hover:underline font-semibold cursor-pointer pt-1 block"
            >
              Switch to collection · Save changes
            </button>
          </div>
        </div>

        {/* Card 2: Save to collection */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white tracking-tight">Save to collection</h4>
            {currentSavedItem && (
              <span className="text-[10px] text-ink-faint truncate max-w-[120px]">
                {currentSavedItem.excerpt?.title || 'Selected chat'}
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {['All saved', 'Plot twists', 'Date night lore', 'Office survival'].map((coll) => {
              const isChecked = currentSavedItem?.collection_name === coll || (coll === 'All saved');
              return (
                <button
                  key={coll}
                  type="button"
                  onClick={() => currentSavedItem && handleSetCollection(currentSavedItem.id, coll)}
                  className="w-full flex items-center gap-2.5 text-xs text-ink-soft hover:text-white cursor-pointer py-1 transition-colors text-left"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? 'bg-accent border-accent text-white' : 'border-line-strong bg-surface'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={isChecked ? 'text-accent font-semibold' : ''}>{coll}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-line flex items-center justify-between">
            <button
              type="button"
              disabled={!currentSavedItem}
              onClick={() => currentSavedItem && handleToggleSaveCard(currentSavedItem.excerpt.id, currentSavedItem.id)}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer transition-colors disabled:opacity-50"
            >
              Remove from saved
            </button>
            <p className="text-[10px] text-ink-faint">Only you can see this.</p>
          </div>
        </div>

        {/* Card 3: Saved, not shared */}
        <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Saved, not shared.</h5>
            <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
              Saving a public chat doesn't publish anything or notify the participants. If an excerpt is removed, it will no longer be readable here.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
          <FooterLinks onNavigate={onNavigate} />
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
  const [followingHandles, setFollowingHandles] = useState<Set<string>>(new Set());
  const [togglingFollow, setTogglingFollow] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      cchatApi.getUsers().catch(() => []),
      cchatApi.getFollowing().catch(() => []),
    ]).then(([users, followingList]) => {
      const fSet = new Set(followingList.map(u => u.handle.toLowerCase().replace('@', '')));
      setFollowingHandles(fSet);

      const others = users.filter(u => u.handle !== currentUser?.handle);
      if (others.length > 0) {
        const mapped = others.map(u => ({
          initials: u.display_name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'CC',
          name: u.display_name,
          handle: u.handle,
        }));
        setPeople(mapped);
        if (!selectedRecipient) {
          const isF = fSet.has(mapped[0].handle.toLowerCase().replace('@', ''));
          setSelectedRecipient({
            initials: mapped[0].initials,
            name: mapped[0].name,
            handle: mapped[0].handle,
            subtext: isF ? 'Following' : 'Follow to message',
          });
          setSearchRecipient(mapped[0].name.split(' ')[0]);
        }
      }
    });
  }, [currentUser]);

  const handleToggleFollow = async (targetHandle: string) => {
    setTogglingFollow(targetHandle);
    try {
      const res = await cchatApi.toggleFollow(targetHandle);
      const clean = targetHandle.toLowerCase().replace('@', '');
      setFollowingHandles(prev => {
        const next = new Set(prev);
        if (res.is_following) {
          next.add(clean);
        } else {
          next.delete(clean);
        }
        return next;
      });
      if (selectedRecipient && selectedRecipient.handle.toLowerCase().replace('@', '') === clean) {
        setSelectedRecipient(prev => prev ? {
          ...prev,
          subtext: res.is_following ? 'Following' : 'Follow to message',
        } : null);
      }
    } catch (err: any) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setTogglingFollow(null);
    }
  };

  const handleSelectPerson = (person: { initials: string; name: string; handle: string }) => {
    const isF = followingHandles.has(person.handle.toLowerCase().replace('@', ''));
    setSelectedRecipient({
      initials: person.initials,
      name: person.name,
      handle: person.handle,
      subtext: isF ? 'Following' : 'Follow to message',
    });
    setSearchRecipient(person.name.split(' ')[0]);
  };

  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if ((!messageText.trim() && !pendingAttachment) || sending) return;
    const handle = selectedRecipient?.handle || '@julespark';
    const cleanHandle = handle.toLowerCase().replace('@', '');
    const isFollowed = followingHandles.has(cleanHandle);

    if (!isFollowed) {
      const confirmFollow = window.confirm(
        `You must follow @${cleanHandle} before you can chat with them.\n\nWould you like to follow @${cleanHandle} now?`
      );
      if (!confirmFollow) {
        return;
      }
      try {
        await handleToggleFollow(handle);
      } catch (err) {
        // Continue if toggle succeeded
      }
    }

    setSending(true);
    try {
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
      alert(err.message || 'Failed to create chat. Make sure you follow this user.');
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
    <div className="flex-1 flex flex-col h-full min-w-0 bg-canvas-deep overflow-y-auto">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="md:hidden p-1.5 -ml-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
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
            className="sm:hidden p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <div className="relative w-48 sm:w-64 md:w-80 hidden sm:block">
            <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chats, people, plot twists"
              className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong">⌘ K</span>
          </div>
          <button className="p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer relative">
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
          <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
            Find someone by name or handle. Your first message is private, not a public post.
          </p>
        </div>

        {/* 2-Column Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Recipient search & Recent people */}
          <div className="col-span-1 lg:col-span-5 space-y-4">
            {/* Card: To */}
            <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-4 shadow-xl">
              <h4 className="text-sm font-extrabold text-white">To</h4>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-muted">Name or @handle</label>
                <input
                  type="text"
                  value={searchRecipient}
                  onChange={e => setSearchRecipient(e.target.value)}
                  placeholder="Search name or handle"
                  className="w-full bg-surface border border-line-2 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors"
                />
              </div>

              <div className="text-[11px] text-ink-faint font-medium">
                {matchingPeople.length} matching {matchingPeople.length === 1 ? 'person' : 'people'}
              </div>

              {/* Matched person card */}
              {selectedRecipient && (
                <div
                  className="p-3 rounded-2xl bg-surface border border-accent/40 flex items-center justify-between transition-colors"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onNavigate?.('Profile', selectedRecipient.handle)}
                    title="View public profile"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-2 border border-line-strong group-hover:border-accent flex items-center justify-center font-bold text-[11px] text-accent transition-colors">
                      {selectedRecipient.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-accent transition-colors flex items-center gap-1.5">
                        <span>{selectedRecipient.name}</span>
                        <span className="text-[10px] text-ink-faint font-normal">View profile →</span>
                      </div>
                      <div className="text-[10px] text-ink-muted">{selectedRecipient.handle} · Selected</div>
                    </div>
                  </div>
                  <div className="text-xs text-accent font-semibold flex items-center gap-1">
                    <span>Selected</span>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              )}
            </div>

            {/* Card: Recent people */}
            <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-3.5 shadow-xl">
              <h4 className="text-sm font-extrabold text-white">Recent people</h4>
              <div className="space-y-3">
                {matchingPeople.map(p => {
                  const isSelected = selectedRecipient?.handle === p.handle;
                  const clean = p.handle.toLowerCase().replace('@', '');
                  const isFollowed = followingHandles.has(clean);
                  return (
                    <div
                      key={p.handle}
                      onClick={() => handleSelectPerson(p)}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[11px] transition-colors ${
                          isSelected ? 'bg-accent/20 border-accent text-accent-bright' : 'bg-surface border-line-2 text-ink-soft group-hover:border-accent'
                        }`}>
                          {p.initials}
                        </div>
                        <div>
                          <div className={`text-xs font-bold transition-colors ${isSelected ? 'text-accent' : 'text-white group-hover:text-accent'}`}>{p.name}</div>
                          <div className="text-[10px] text-ink-faint flex items-center gap-1.5">
                            <span>{p.handle}</span>
                            {isFollowed ? (
                              <span className="text-[9px] text-accent/80 font-semibold uppercase tracking-wider">· Following</span>
                            ) : (
                              <span className="text-[9px] text-ink-muted flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5 text-accent" /> Follow required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {!isFollowed && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFollow(p.handle);
                            }}
                            disabled={togglingFollow === p.handle}
                            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-surface border border-line-2 hover:border-accent text-white hover:text-accent transition-colors cursor-pointer"
                          >
                            {togglingFollow === p.handle ? '...' : '+ Follow'}
                          </button>
                        )}
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-accent stroke-[2.5]" />
                        ) : (
                          <span className="text-ink-faint group-hover:text-accent text-sm font-bold leading-none">+</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shield Notice under Left Column */}
            <div className="flex items-start gap-3 p-2 text-xs text-ink-muted">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">A message, not an invite to a feed.</span>
                <p className="text-[11px] text-ink-faint mt-0.5 leading-relaxed">
                  A recipient can choose whether to reply. Readers of your public chats cannot join this conversation.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Recipient Banner + Say Something + Privacy Card */}
          <div className="col-span-1 lg:col-span-7 space-y-4">
            {/* Selected Recipient Card */}
            {selectedRecipient && (
              <div className="p-4 rounded-3xl bg-canvas-2 border border-line-2 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface border border-line-strong flex items-center justify-center font-bold text-xs text-ink-soft">
                    {selectedRecipient.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{selectedRecipient.name}</h4>
                    <p className="text-[10px] text-ink-faint">{selectedRecipient.handle} · {selectedRecipient.subtext}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecipient(null)}
                  className="text-xs text-ink-muted hover:text-white cursor-pointer transition-colors"
                >
                  Remove ×
                </button>
              </div>
            )}

            {/* Follow Requirement Notice */}
            {selectedRecipient && !followingHandles.has(selectedRecipient.handle.toLowerCase().replace('@', '')) && (
              <div className="p-4 rounded-3xl bg-canvas-2 border border-line-2 flex items-center justify-between gap-3 text-xs shadow-xl">
                <div className="flex items-center gap-2.5 text-ink-muted">
                  <Lock className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-xs leading-relaxed">
                    You must follow <strong className="text-white">{selectedRecipient.name} ({selectedRecipient.handle})</strong> to chat with them.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleFollow(selectedRecipient.handle)}
                  disabled={togglingFollow === selectedRecipient.handle}
                  className="px-4 py-1.5 rounded-xl bg-accent hover:bg-accent-bright font-bold text-xs text-white shrink-0 cursor-pointer shadow-sm transition-all"
                >
                  {togglingFollow === selectedRecipient.handle ? 'Following...' : 'Follow'}
                </button>
              </div>
            )}

            {/* Say something Card */}
            <div className="p-6 rounded-3xl bg-canvas-2 border border-line-2 space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-extrabold text-white">Say something</h3>
                <label className="text-[11px] font-semibold text-ink-muted block mt-3">First message</label>
              </div>

              <textarea
                ref={textareaRef}
                rows={4}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Write your message..."
                className="w-full bg-canvas-deep border border-line-2 focus:border-accent rounded-2xl p-4 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors resize-none leading-relaxed"
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
                <div className="px-3 py-2 rounded-xl bg-surface border border-line-2 flex items-center justify-between text-xs text-white animate-in slide-in-from-bottom-2 duration-150">
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

              <div className="flex items-center justify-between pt-1 relative">
                <div className="flex items-center gap-4 text-xs text-ink-muted">
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
                        showEmojiPicker ? 'text-accent bg-accent-strong/20' : ''
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
                  className="px-5 py-2.5 rounded-xl bg-accent-strong hover:bg-accent disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-accent-strong/25 transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
                >
                  {sending ? (
                    'Sending...'
                  ) : selectedRecipient && !followingHandles.has(selectedRecipient.handle.toLowerCase().replace('@', '')) ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Follow & send</span>
                    </>
                  ) : (
                    'Send private message'
                  )}
                </button>
              </div>

              <p className="text-[11px] text-ink-faint pt-1">
                Only {selectedRecipient ? selectedRecipient.name.split(' ')[0] : 'the recipient'} will receive this. Nothing is published.
              </p>
            </div>

            {/* Your privacy, before you hit send Card */}
            <div className="p-6 rounded-3xl bg-canvas-2 border border-line-2 space-y-3.5 shadow-xl">
              <h4 className="text-sm font-extrabold text-white">Your privacy, before you hit send</h4>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white">Private by default</h5>
                  <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
                    This starts a normal private conversation. Publication is a separate choice: select a message excerpt and review its public identity preview.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-ink-muted leading-relaxed pl-8">
                If only one participant publishes, the other stays anonymous. Both names, handles and photos appear only when both publish.
              </p>

              <div className="pt-1 pl-8">
                <button
                  onClick={() => setKeepPrivate(!keepPrivate)}
                  className="text-xs text-accent hover:text-accent-bright font-semibold flex items-center gap-1.5 cursor-pointer"
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
function SearchPage({ onNavigate, onOpenMenu }: { onNavigate?: (nav: string, handleOrTopic?: string | number, extraParam?: any) => void; onOpenMenu?: () => void }) {
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
      <div className="flex-1 flex flex-col border-r border-line min-w-0 bg-canvas-deep">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-1.5 -ml-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">Search</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="relative w-48 sm:w-64 md:w-80">
              <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search chats, people, plot twists"
                className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong">⌘ K</span>
            </div>
            <button className="p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer relative">
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
            <label className="text-[11px] font-semibold text-ink-muted">Search chats, people and topics</label>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-canvas-2 border border-line-2 focus:border-accent rounded-2xl px-4 py-3 text-xs text-white focus:outline-none transition-colors"
            />
            <div className="text-[11px] text-ink-faint pt-1">18 public chats · 2 people · 1 topic</div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-6 border-b border-line pb-2 text-xs font-bold">
            {(['All', 'Public chats', 'People', 'Topics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilterTab(tab)}
                className={`transition-colors cursor-pointer pb-2 relative ${
                  activeFilterTab === tab ? 'text-white' : 'text-ink-faint hover:text-ink-soft'
                }`}
              >
                {tab}
                {activeFilterTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* Topic Match Card */}
          <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-2 shadow-xl">
            <div className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Topic match</div>
            <h3 className="text-base font-extrabold text-accent">#roommatelore</h3>
            <p className="text-xs text-ink-muted">Shared rent. Unshared brain cell. · 1.4k public chats</p>
          </div>

          {/* Story Card 1: "the rent is due. the raccoon is not on the lease." */}
          <article className="rounded-3xl bg-canvas-2 border border-line-2 p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Maya"
                  className="w-10 h-10 rounded-full object-cover border border-line-strong"
                />
                <div>
                  <h3
                    onClick={() => onNavigate?.('Discover', 1)}
                    className="text-lg font-extrabold text-white tracking-tight hover:text-accent cursor-pointer transition-colors"
                    title="Read full chat in Discover"
                  >
                    the rent is due. the raccoon is not on the lease.
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-ink-faint">
                    <span className="font-semibold text-ink-muted">@mayamaybe</span>
                    <span>×</span>
                    <span className="text-ink-muted">Anonymous</span>
                    <span>·</span>
                    <span>18m ago</span>
                    <span>·</span>
                    <span className="text-ink-muted font-medium">#roommatelore</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 py-1">
              {/* Msg 1 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-ink-muted font-semibold">Anonymous</div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-ink text-sm font-medium w-[68%]">
                  who adopted a raccoon
                </div>
                <div className="flex items-center gap-3 text-[11px] text-ink-faint font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-ink-soft cursor-pointer">♥ 124</span>
                  <span className="flex items-center gap-1 text-accent font-bold">🧢 1.2k</span>
                  <span className="flex items-center gap-1 hover:text-ink-soft cursor-pointer">💀 486</span>
                  <span className="flex items-center gap-1 hover:text-ink-soft cursor-pointer">🔥 82</span>
                </div>
              </div>

              {/* Msg 2 — Maya */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-ink-muted font-semibold pr-1">Maya</div>
                <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                  nobody adopted him. he chose us.
                </div>
                <div className="flex items-center gap-3 text-[11px] text-ink-faint font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ 842</span>
                  <span className="flex items-center gap-1 hover:text-ink-soft cursor-pointer">🧢 41</span>
                  <span className="flex items-center gap-1 hover:text-ink-soft cursor-pointer">💀 495</span>
                  <span className="flex items-center gap-1 hover:text-ink-soft cursor-pointer">🔥 91</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-line flex items-center justify-between text-xs text-ink-faint">
              <span>6.2k reads · Public excerpt · Read & react only</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate?.('Discover', 1)}
                  className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-2 text-ink-soft hover:text-white text-xs font-semibold border border-line-2 transition-colors cursor-pointer flex items-center gap-1"
                  title="Open full chat in Discover"
                >
                  <span>Read chat</span>
                  <ArrowRight className="w-3 h-3 text-accent" />
                </button>
                <button
                  onClick={() => toggleSave('c1')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    savedCards.c1 ? 'text-accent bg-accent/10' : 'text-ink-muted hover:text-white hover:bg-surface'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

          {/* Story Card 2: "we made a custody schedule for the air fryer." */}
          <article className="rounded-3xl bg-canvas-2 border border-line-2 p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => onNavigate?.('Profile', '@julespark')}
                  className="w-10 h-10 rounded-2xl bg-surface border border-line-2 hover:border-accent flex items-center justify-center font-bold text-xs text-ink-soft cursor-pointer transition-colors"
                >
                  JU
                </div>
                <div>
                  <h3
                    onClick={() => onNavigate?.('Discover', 1)}
                    className="text-lg font-extrabold text-white tracking-tight hover:text-accent cursor-pointer transition-colors"
                    title="Read full chat in Discover"
                  >
                    we made a custody schedule for the air fryer.
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-ink-faint">
                    <button
                      type="button"
                      onClick={() => onNavigate?.('Profile', '@julespark')}
                      className="font-semibold text-ink-muted hover:text-white transition-colors cursor-pointer"
                    >
                      @julespark
                    </button>
                    <span>×</span>
                    <span className="text-ink-muted">Anonymous</span>
                    <span>·</span>
                    <span>1m ago</span>
                    <span>·</span>
                    <span className="text-ink-muted font-medium">#roommatelore</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 py-1">
              {/* Msg 1 — Anonymous */}
              <div className="space-y-1">
                <div className="text-[11px] text-ink-muted font-semibold">Anonymous</div>
                <div className="rounded-2xl rounded-tl-sm px-5 py-3.5 bg-[#172d4b] border border-[#214373] text-ink text-sm font-medium w-[68%]">
                  i need the air fryer on thursday
                </div>
                <div className="flex items-center gap-3 text-[11px] text-ink-faint font-medium pl-1 pt-0.5">
                  <span className="flex items-center gap-1 hover:text-ink-soft cursor-pointer">♥ 124</span>
                  <span className="flex items-center gap-1 text-accent font-bold">🧢 1.2k</span>
                  <span className="flex items-center gap-1 hover:text-ink-soft cursor-pointer">💀 486</span>
                  <span className="flex items-center gap-1 hover:text-ink-soft cursor-pointer">🔥 82</span>
                </div>
              </div>

              {/* Msg 2 — Jules */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[11px] text-ink-muted font-semibold pr-1">Jules</div>
                <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#421d33] border border-[#5d2a49] text-rose-50 text-sm font-medium w-[68%]">
                  thursday is my crispy day
                </div>
                <div className="flex items-center gap-3 text-[11px] text-ink-faint font-medium pr-1 pt-0.5">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">♥ 842</span>
                  <span className="flex items-center gap-1 hover:text-ink-soft cursor-pointer">🧢 41</span>
                  <span className="flex items-center gap-1 hover:text-ink-soft cursor-pointer">💀 495</span>
                  <span className="flex items-center gap-1 hover:text-ink-soft cursor-pointer">🔥 91</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-line flex items-center justify-between text-xs text-ink-faint">
              <span>246 reads · Public excerpt · Read & react only</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate?.('Discover', 1)}
                  className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-2 text-ink-soft hover:text-white text-xs font-semibold border border-line-2 transition-colors cursor-pointer flex items-center gap-1"
                  title="Open full chat in Discover"
                >
                  <span>Read chat</span>
                  <ArrowRight className="w-3 h-3 text-accent" />
                </button>
                <button
                  onClick={() => toggleSave('c2')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    savedCards.c2 ? 'text-accent bg-accent/10' : 'text-ink-muted hover:text-white hover:bg-surface'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

          {/* People · public profiles Card */}
          <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-4 shadow-xl">
            <h4 className="text-sm font-extrabold text-white">People · public profiles</h4>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => onNavigate?.('Profile', '@julespark')}
                >
                  <div className="w-8 h-8 rounded-full bg-surface border border-line-strong group-hover:border-accent flex items-center justify-center font-bold text-[11px] text-ink-soft transition-colors">
                    JP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-accent transition-colors">Jules Park</div>
                    <div className="text-[10px] text-ink-faint">@julespark · Roommate lore & bad plans</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow('JP', '@julespark')}
                  className="text-xs font-semibold text-accent hover:text-accent-bright cursor-pointer"
                >
                  {followedPeople.JP ? 'Following' : 'Follow'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => onNavigate?.('Profile', '@ninapatel')}
                >
                  <div className="w-8 h-8 rounded-full bg-surface border border-line-strong group-hover:border-accent flex items-center justify-center font-bold text-[11px] text-ink-soft transition-colors">
                    NP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-accent transition-colors">Nina Patel</div>
                    <div className="text-[10px] text-ink-faint">@ninapatel · The roommate with the label maker</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow('NP', '@ninapatel')}
                  className="text-xs font-semibold text-accent hover:text-accent-bright cursor-pointer"
                >
                  {followedPeople.NP ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          </div>

          <div className="text-center py-2 text-xs text-ink-faint">
            Showing the closest matches. Anonymous participants have no profile result.
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        {/* Card 1: Refine results */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-4">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Refine results</h4>

          {/* Sort by */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-ink-muted">Sort by</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full appearance-none bg-surface border border-line-2 focus:border-accent rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer pr-8"
              >
                <option value="Most relevant">Most relevant</option>
                <option value="Latest">Latest</option>
                <option value="Most reads">Most reads</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Published */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-ink-muted">Published</label>
            <div className="relative">
              <select
                value={publishedFilter}
                onChange={e => setPublishedFilter(e.target.value)}
                className="w-full appearance-none bg-surface border border-line-2 focus:border-accent rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer pr-8"
              >
                <option value="Any time">Any time</option>
                <option value="Past 24 hours">Past 24 hours</option>
                <option value="Past week">Past week</option>
                <option value="Past month">Past month</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-ink-muted">Topic</label>
            <div className="relative">
              <select
                value={topicFilter}
                onChange={e => setTopicFilter(e.target.value)}
                className="w-full appearance-none bg-surface border border-line-2 focus:border-accent rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer pr-8"
              >
                <option value="All topics">All topics</option>
                <option value="#roommatelore">#roommatelore</option>
                <option value="#dating">#dating</option>
                <option value="#workbesties">#workbesties</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={() => {
                setSortBy('Most relevant');
                setPublishedFilter('Any time');
                setTopicFilter('All topics');
              }}
              className="text-xs text-accent hover:underline font-semibold cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        </div>

        {/* Card 2: Recent searches */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-3.5">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Recent searches</h4>

          <div className="space-y-2.5 text-xs text-ink-soft">
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
                className="hover:text-accent cursor-pointer transition-colors flex items-center justify-between"
              >
                <span>{term}</span>
                {term.startsWith('@') && <span className="text-[10px] text-ink-faint">Profile →</span>}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-line">
            <button className="text-xs text-accent hover:underline font-semibold cursor-pointer">
              Clear search history
            </button>
          </div>
        </div>

        {/* Card 3: Search what's public */}
        <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Search what's public.</h5>
            <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
              Results include published excerpts, public profiles and topics. Private conversations and anonymous identities are not searchable here.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
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
        <div className="w-10 h-10 rounded-2xl bg-surface border border-line-2 flex items-center justify-center text-lg">
          💀
        </div>
      );
    }
    if (n.iconType === 'heart') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-surface border border-line-2 flex items-center justify-center text-lg text-accent">
          💙
        </div>
      );
    }
    if (n.iconType === 'fire') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-surface border border-line-2 flex items-center justify-center text-lg">
          🔥
        </div>
      );
    }
    if (n.iconType === 'arrow-up-right') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-surface border border-line-2 flex items-center justify-center text-ink-soft">
          <ArrowUpRight className="w-5 h-5 text-accent" />
        </div>
      );
    }
    if (n.iconType === 'check') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-surface border border-line-2 flex items-center justify-center text-ink-soft">
          <Check className="w-4 h-4 stroke-[2.5]" />
        </div>
      );
    }
    if (n.iconType === 'initials') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-surface border border-line-strong flex items-center justify-center font-bold text-xs text-ink-soft">
          {n.initials}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Feed */}
      <div className="flex-1 flex flex-col border-r border-line min-w-0 bg-canvas-deep">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-1.5 -ml-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
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
              className="sm:hidden p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative w-48 sm:w-64 md:w-80 hidden sm:block">
              <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats, people, plot twists"
                className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong">⌘ K</span>
            </div>
            <button className="p-2 text-accent hover:text-white rounded-full bg-surface transition-colors cursor-pointer relative">
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
              <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                3 unread updates. Reactions, new follows and publication changes.
              </p>
            </div>
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-xl bg-surface border border-line-2 hover:bg-surface-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Mark all read
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-6 border-b border-line pb-2 text-xs font-bold">
            {(['All activity', 'Unread', 'Reactions', 'Follows'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-colors cursor-pointer pb-2 relative ${
                  activeTab === tab ? 'text-white' : 'text-ink-faint hover:text-ink-soft'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></span>
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
                    className="p-4 rounded-3xl bg-canvas-2 border border-line-2 flex items-center justify-between hover:border-line-strong transition-colors cursor-pointer shadow-lg"
                  >
                    <div className="flex items-center gap-3.5">
                      {renderIcon(n)}
                      <div>
                        <h4 className="text-xs font-bold text-white">{n.title}</h4>
                        <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">{n.desc}</p>
                        <span className="text-[10px] text-ink-faint mt-1 block">{n.time}</span>
                      </div>
                    </div>
                    {n.isUnread && (
                      <span className="w-2 h-2 rounded-full bg-accent mr-2 shrink-0"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EARLIER Group */}
          {earlierList.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-[10px] font-black tracking-wider text-ink-faint uppercase font-mono">EARLIER</div>
              <div className="space-y-3">
                {earlierList.map(n => (
                  <div
                    key={n.id}
                    className="p-4 rounded-3xl bg-canvas-2 border border-line-2 flex items-center justify-between hover:border-line-strong transition-colors cursor-pointer shadow-lg"
                  >
                    <div className="flex items-center gap-3.5">
                      {renderIcon(n)}
                      <div>
                        <h4 className="text-xs font-bold text-white">{n.title}</h4>
                        <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">{n.desc}</p>
                        <span className="text-[10px] text-ink-faint mt-1 block">{n.time}</span>
                      </div>
                    </div>
                    {n.isUnread && (
                      <span className="w-2 h-2 rounded-full bg-accent mr-2 shrink-0"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        {/* Card 1: Notification settings */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-4 shadow-xl">
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight">Notification settings</h4>
            <p className="text-[11px] text-ink-faint mt-0.5 leading-relaxed">
              Quick preferences. All account controls are in Account and settings.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {/* Toggle 1: Reactions */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Reactions</div>
                <div className="text-[10px] text-ink-faint">Activity on your public messages</div>
              </div>
              <button
                onClick={() => setToggles(t => ({ ...t, reactions: !t.reactions }))}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  toggles.reactions ? 'bg-accent-strong' : 'bg-surface-2'
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
                <div className="text-[10px] text-ink-faint">People following your profile</div>
              </div>
              <button
                onClick={() => setToggles(t => ({ ...t, newFollowers: !t.newFollowers }))}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  toggles.newFollowers ? 'bg-accent-strong' : 'bg-surface-2'
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
                <div className="text-[10px] text-ink-faint">Changes to your excerpts</div>
              </div>
              <button
                onClick={() => setToggles(t => ({ ...t, publicationEvents: !t.publicationEvents }))}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  toggles.publicationEvents ? 'bg-accent-strong' : 'bg-surface-2'
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

          <div className="pt-2 border-t border-line">
            <button
              onClick={() => onNavigate && onNavigate('Account and settings')}
              className="text-xs text-accent hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Account and settings</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Card 2: Private stays private */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-2 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Private stays private</h4>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Activity on public excerpts belongs here. Message content in your private chats belongs in My chats.
          </p>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
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

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  try {
    const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return `${Math.floor(diffSec / 604800)}w ago`;
  } catch {
    return 'Recently';
  }
}

function getMessageReactionBg(reactions?: { heart: number; cap: number; skull: number; fire: number }, isRight: boolean = false): string {
  if (!reactions) {
    return isRight
      ? 'bg-[#421d33] border-[#5d2a49] text-rose-50'
      : 'bg-[#152a48] border-[#1e3d68] text-ink';
  }
  const maxVal = Math.max(reactions.heart, reactions.cap, reactions.skull, reactions.fire);
  if (maxVal <= 0) {
    return isRight
      ? 'bg-[#421d33] border-[#5d2a49] text-rose-50'
      : 'bg-[#152a48] border-[#1e3d68] text-ink';
  }
  if (reactions.cap === maxVal) {
    return 'bg-[#10243d] border-[#1b3d68] text-blue-100';
  }
  if (reactions.heart === maxVal) {
    return 'bg-[#3b172a] border-[#632446] text-rose-100';
  }
  if (reactions.skull === maxVal) {
    return 'bg-[#23262f] border border-[#3a3f4e] text-slate-100';
  }
  if (reactions.fire === maxVal) {
    return 'bg-[#331c10] border-[#63351d] text-amber-100';
  }
  return isRight
    ? 'bg-[#421d33] border-[#5d2a49] text-rose-50'
    : 'bg-[#152a48] border-[#1e3d68] text-ink';
}

// ─────────────────────────────────────────────────────────────
// VIEW 8: PROFILE PAGE (MATCHING FIGMA SCREENSHOT)
// ─────────────────────────────────────────────────────────────
interface ProfilePageProps {
  currentUser?: UserProfile | null;
  viewedHandle?: string | null;
  onNavigate?: (nav: string, topicOrParam?: string, extraParam?: any) => void;
  onLogout?: () => void;
  onOpenMenu?: () => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

interface ProfilePublicationMessage {
  id: number;
  text: string;
  senderDisplay: string;
  senderHandle: string | null;
  isAnonymous: boolean;
  isFromProfileUser: boolean;
  reactions: {
    heart: number;
    cap: number;
    skull: number;
    fire: number;
    dominant?: string;
    userReacted?: string | null;
  };
}

interface ProfilePublication {
  id: string;
  excerptId?: number;
  conversationId?: number;
  title: string;
  time: string;
  tag: string;
  reads: string;
  saved: boolean;
  authorsSummary: string;
  messages: ProfilePublicationMessage[];
  sections?: Array<{
    id?: number;
    header: string;
    topicTag: string;
    order?: number;
    messages: ProfilePublicationMessage[];
  }>;
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

  const mayaSeedCards: ProfilePublication[] = [
    {
      id: 'p1',
      excerptId: 3,
      conversationId: 4,
      title: 'he brought a résumé to a first date.',
      time: '2h ago',
      tag: '#dating',
      reads: '18.4k reads',
      saved: false,
      authorsSummary: '@mayamaybe × Anonymous',
      messages: [
        {
          id: 1,
          text: 'i brought a résumé to the date.',
          senderDisplay: 'Anonymous',
          senderHandle: null,
          isAnonymous: true,
          isFromProfileUser: false,
          reactions: { heart: 124, cap: 1200, skull: 486, fire: 82 },
        },
        {
          id: 2,
          text: 'please tell me this is a metaphor',
          senderDisplay: 'Maya Chen',
          senderHandle: '@mayamaybe',
          isAnonymous: false,
          isFromProfileUser: true,
          reactions: { heart: 842, cap: 41, skull: 495, fire: 91 },
        },
      ],
    },
    {
      id: 'p2',
      excerptId: 2,
      conversationId: 3,
      title: 'the deck has 94 slides.',
      time: '3h ago',
      tag: '#workbesties',
      reads: '9.1k reads',
      saved: false,
      authorsSummary: '@mayamaybe & Leo Martinez',
      messages: [
        {
          id: 3,
          text: 'the deck has 94 slides',
          senderDisplay: 'Leo Martinez',
          senderHandle: '@leomartinez',
          isAnonymous: false,
          isFromProfileUser: false,
          reactions: { heart: 124, cap: 1200, skull: 486, fire: 82 },
        },
        {
          id: 4,
          text: 'is the presentation a hostage situation',
          senderDisplay: 'Maya Chen',
          senderHandle: '@mayamaybe',
          isAnonymous: false,
          isFromProfileUser: true,
          reactions: { heart: 842, cap: 41, skull: 495, fire: 91 },
        },
      ],
    },
    {
      id: 'p3',
      excerptId: 1,
      conversationId: 1,
      title: 'the rent is due. the raccoon is not on the lease.',
      time: '18m ago',
      tag: '#roommatelore',
      reads: '6.2k reads',
      saved: false,
      authorsSummary: '@mayamaybe × Anonymous',
      messages: [
        {
          id: 5,
          text: 'who adopted a raccoon',
          senderDisplay: 'Anonymous',
          senderHandle: null,
          isAnonymous: true,
          isFromProfileUser: false,
          reactions: { heart: 124, cap: 1200, skull: 486, fire: 82 },
        },
        {
          id: 6,
          text: 'nobody adopted him. he chose us.',
          senderDisplay: 'Maya Chen',
          senderHandle: '@mayamaybe',
          isAnonymous: false,
          isFromProfileUser: true,
          reactions: { heart: 842, cap: 41, skull: 495, fire: 91 },
        },
      ],
    },
  ];

  const [cards, setCards] = useState<ProfilePublication[]>([]);
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

    setLoadingCards(true);
    cchatApi.getExcerpts({ publisher: handle })
      .then(excerpts => {
        if (excerpts && excerpts.length > 0) {
          const profileHandleClean = handle.replace(/^@/, '').toLowerCase();
          setCards(excerpts.map(e => {
            const mapMsg = (m: any): ProfilePublicationMessage => {
              const isMine = !m.is_anonymous && (
                (m.sender_handle && m.sender_handle.replace(/^@/, '').toLowerCase() === profileHandleClean) ||
                (displayedUser?.display_name && m.sender_display === displayedUser.display_name)
              );
              return {
                id: m.id,
                text: m.text,
                senderDisplay: m.is_anonymous ? 'Anonymous' : (m.sender_display || 'Anonymous'),
                senderHandle: m.is_anonymous ? null : m.sender_handle,
                isAnonymous: !!m.is_anonymous,
                isFromProfileUser: isMine,
                reactions: {
                  heart: m.reactions?.heart || 0,
                  cap: m.reactions?.cap || 0,
                  skull: m.reactions?.skull || 0,
                  fire: m.reactions?.fire || 0,
                  dominant: m.reactions?.dominant || 'heart',
                  userReacted: m.reactions?.user_reacted || null,
                },
              };
            };

            const mappedMessages = (e.messages || []).map(mapMsg);
            const mappedSections = (e.sections || []).map(sec => ({
              id: sec.id,
              header: sec.header,
              topicTag: sec.topic_tag,
              order: sec.order,
              messages: (sec.messages || []).map(mapMsg),
            }));

            const fallbackConvId = e.id === 1 ? 1 : e.id === 2 ? 3 : e.id === 3 ? 4 : e.id === 10 ? 5 : undefined;

            return {
              id: `p-${e.id}`,
              excerptId: e.id,
              conversationId: e.conversation_id || fallbackConvId,
              title: e.title,
              time: formatRelativeTime(e.created_at),
              tag: e.topic?.tag || '#chat',
              reads: `${fmt(e.reads_count)} reads`,
              saved: e.is_saved,
              authorsSummary: e.authors_summary || `${handle} × Anonymous`,
              messages: mappedMessages,
              sections: mappedSections.length > 0 ? mappedSections : undefined,
            };
          }));
        } else if (isOwnProfile && handle === '@mayamaybe') {
          setCards(mayaSeedCards);
        } else {
          setCards([]);
        }
      })
      .catch(() => {
        if (isOwnProfile && handle === '@mayamaybe') {
          setCards(mayaSeedCards);
        } else {
          setCards([]);
        }
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
    if (!isFollowing) {
      const confirmFollow = window.confirm(
        `You must follow @${displayedUser.handle.replace('@', '')} to chat with them.\n\nWould you like to follow them now?`
      );
      if (confirmFollow) {
        await handleToggleFollow();
        try {
          await cchatApi.createChat(displayedUser.id || displayedUser.handle);
          if (onNavigate) onNavigate('My chats');
        } catch (err: any) {
          alert(err.message || 'Failed to start chat.');
        }
      }
      return;
    }
    try {
      await cchatApi.createChat(displayedUser.id || displayedUser.handle);
      if (onNavigate) onNavigate('My chats');
    } catch (err: any) {
      alert(err.message || 'Failed to start chat.');
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

  const toggleSave = async (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, saved: !c.saved } : c));
    const card = cards.find(c => c.id === id);
    const numId = card?.excerptId || (id.startsWith('p-') ? parseInt(id.replace('p-', ''), 10) : parseInt(id.replace('p', ''), 10));
    if (numId && !isNaN(numId)) {
      try {
        await cchatApi.toggleSaveExcerpt(numId);
      } catch (err) {
        console.warn('Failed to toggle save excerpt:', err);
      }
    }
  };

  const renderProfileMessage = (msg: ProfilePublicationMessage, defaultNameDisplay: string) => {
    const isRight = msg.isFromProfileUser;
    const senderName = isRight
      ? defaultNameDisplay
      : (msg.isAnonymous ? 'Anonymous' : msg.senderDisplay);

    return (
      <div key={msg.id} className={`space-y-1 flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
        <div className={`text-[11px] text-ink-muted font-semibold ${isRight ? 'pr-1' : 'pl-1'}`}>
          {senderName}
        </div>
        <div
          className={`rounded-2xl ${
            isRight ? 'rounded-tr-sm' : 'rounded-tl-sm'
          } px-4 sm:px-5 py-3 sm:py-3.5 text-sm font-medium w-full sm:max-w-[75%] ${getMessageReactionBg(msg.reactions, isRight)}`}
        >
          {msg.text}
        </div>
        <div className={`flex items-center gap-2.5 sm:gap-3 text-[11px] text-ink-faint font-medium ${isRight ? 'pr-1' : 'pl-1'} pt-0.5`}>
          <span className="flex items-center gap-1 hover:text-ink-soft transition-colors">♥ {msg.reactions.heart}</span>
          <span className="flex items-center gap-1 text-accent font-bold">🧢 {msg.reactions.cap}</span>
          <span className="flex items-center gap-1 hover:text-ink-soft transition-colors">💀 {msg.reactions.skull}</span>
          <span className="flex items-center gap-1 hover:text-ink-soft transition-colors">🔥 {msg.reactions.fire}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Main Feed */}
      <div className="flex-1 flex flex-col border-r border-line min-w-0 bg-canvas-deep">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-1.5 -ml-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
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
                className="p-1.5 -ml-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer flex items-center gap-1"
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
              className="sm:hidden p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative w-48 sm:w-64 md:w-80 hidden sm:block">
              <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats, people, plot twists"
                className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-5 pb-20 md:pb-5 overflow-y-auto space-y-6">
          {loadingUser ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-ink-faint">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <span className="text-xs">Loading profile...</span>
            </div>
          ) : userNotFound ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-canvas-2 border border-line-2 text-center space-y-4 max-w-lg mx-auto mt-10 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-surface border border-line-2 mx-auto flex items-center justify-center text-ink-muted">
                <User className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Creator not found</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                The profile for {viewedHandle} could not be found or does not exist.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate && onNavigate('Discover')}
                  className="px-5 py-2.5 rounded-full bg-accent-strong hover:bg-accent text-white text-xs font-bold transition-all shadow-lg shadow-accent/20 cursor-pointer"
                >
                  Back to Discover
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Hero Profile Card */}
              <div className="p-4 sm:p-6 rounded-3xl bg-canvas-2 border border-line-2 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative group shrink-0">
                      <UserAvatar
                        src={displayedUser?.avatar_url}
                        name={nameDisplay}
                        handle={handleDisplay}
                        size="xl"
                        className="w-16 h-16 border-2 border-line-strong"
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
                      <div className="text-xs text-accent font-medium">{handleDisplay}</div>
                      {isOwnProfile && isEditingProfile ? (
                        <div className="mt-2 flex flex-col gap-2">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <input
                              type="text"
                              value={editDisplayName}
                              onChange={e => setEditDisplayName(e.target.value)}
                              placeholder="Display name"
                              className="bg-surface border border-line-2 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                            />
                            <input
                              type="text"
                              value={bio}
                              onChange={e => setBio(e.target.value)}
                              placeholder="Bio"
                              className="bg-surface border border-line-2 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                            />
                            <button
                              onClick={handleSaveProfile}
                              className="text-xs text-accent font-bold hover:underline cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="hover:underline cursor-pointer"
                            >
                              Change photo
                            </button>
                            {currentUser?.avatar_url && (
                              <>
                                <span className="text-ink-faint">·</span>
                                <button
                                  type="button"
                                  onClick={handleRemovePhoto}
                                  className="hover:underline text-ink-muted cursor-pointer"
                                >
                                  Remove photo
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-ink-muted mt-1 leading-relaxed">
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
                        className="px-4 py-2 rounded-xl bg-surface border border-line-2 hover:bg-surface-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        {isEditingProfile ? 'Save profile' : 'Edit profile'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleToggleFollow}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isFollowing
                              ? 'bg-surface border border-line-strong text-ink-soft hover:border-rose-500/50 hover:text-rose-400 group'
                              : 'bg-accent-strong hover:bg-accent text-white shadow-lg shadow-accent/20'
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
                          className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            isFollowing
                              ? 'bg-surface border-line-2 hover:bg-surface-2 text-white'
                              : 'bg-surface/50 border-line text-ink-muted hover:text-white hover:border-line-strong'
                          }`}
                          title={isFollowing ? 'Send a message' : `Follow @${displayedUser?.handle?.replace('@', '') || 'user'} to message`}
                        >
                          {isFollowing ? (
                            <MessageSquare className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-ink-faint" />
                          )}
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
                    <div className="text-[10px] text-ink-faint font-medium">Published chats</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{followersCount}</div>
                    <div className="text-[10px] text-ink-faint font-medium">Followers</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">
                      {displayedUser?.following_count ?? (isOwnProfile && currentUser?.handle === '@mayamaybe' ? 24 : 0)}
                    </div>
                    <div className="text-[10px] text-ink-faint font-medium">Following</div>
                  </div>
                </div>

                <div className="text-[11px] text-ink-faint pt-1 border-t border-line">
                  Public profile · Private conversations always stay off the feed
                </div>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex items-center gap-6 border-b border-line pb-2 text-xs font-bold">
                {(['Published chats', `About ${nameDisplay}`] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab === 'Published chats' ? 'Published chats' : 'About')}
                    className={`pb-1 cursor-pointer transition-colors relative ${
                      activeTab === (tab === 'Published chats' ? 'Published chats' : 'About')
                        ? 'text-white'
                        : 'text-ink-faint hover:text-ink-soft'
                    }`}
                  >
                    {tab}
                    {activeTab === (tab === 'Published chats' ? 'Published chats' : 'About') && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Content by Tab */}
              {activeTab === 'Published chats' ? (
                loadingCards ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-ink-faint">
                    <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <span className="text-xs">Loading publications...</span>
                  </div>
                ) : cards.length === 0 ? (
                  <div className="p-8 sm:p-12 rounded-3xl bg-canvas-2 border border-line-2 text-center space-y-3 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-surface border border-line-2 mx-auto flex items-center justify-center text-ink-muted">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">No published chats yet</h3>
                    <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
                      {isOwnProfile
                        ? "You haven't published any chat excerpts to your profile yet. Publish any private chat from 'My chats'."
                        : `${nameDisplay} hasn't excerpted any conversations to the public feed yet.`}
                    </p>
                    {isOwnProfile && (
                      <div className="pt-2">
                        <button
                          onClick={() => onNavigate && onNavigate('My chats')}
                          className="px-5 py-2.5 rounded-full bg-accent-strong hover:bg-accent text-white text-xs font-bold transition-all shadow-lg shadow-accent/20 cursor-pointer"
                        >
                          Go to My chats
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cards.map(card => {
                      const displayMessages = card.sections && card.sections.length > 0
                        ? card.sections.flatMap(s => s.messages)
                        : card.messages;

                      return (
                        <article key={card.id} className="rounded-3xl bg-canvas-2 border border-line-2 p-5 sm:p-6 shadow-xl space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-surface border border-line-2 flex items-center justify-center font-bold text-xs text-ink-soft">
                                {getInitials(nameDisplay, handleDisplay)}
                              </div>
                              <div>
                                <h3
                                  onClick={() => {
                                    onNavigate?.('Discover', displayedUser?.handle || handleDisplay, card.excerptId);
                                  }}
                                  className="text-lg font-extrabold text-white tracking-tight hover:text-accent cursor-pointer transition-colors"
                                  title="Open dialogue in Discover feed"
                                >
                                  {card.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 text-xs text-ink-faint">
                                  <span className="font-semibold text-ink-muted">{card.authorsSummary}</span>
                                  <span>·</span>
                                  <span>{card.time}</span>
                                  <span>·</span>
                                  <span className="text-ink-muted font-medium">{card.tag}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Compact Chat Preview (First 2 messages to save space) */}
                          {(() => {
                            const previewMessages = displayMessages.slice(0, 2);
                            const remainingCount = Math.max(0, displayMessages.length - previewMessages.length);
                            return (
                              <div className="space-y-3 py-1">
                                <div className="space-y-3">
                                  {previewMessages.map(msg => renderProfileMessage(msg, nameDisplay))}
                                </div>
                                <button
                                  onClick={() => onNavigate?.('Discover', displayedUser?.handle || handleDisplay, card.excerptId)}
                                  className="w-full py-2 px-3.5 rounded-2xl bg-surface hover:bg-surface-2 border border-line-2 hover:border-accent/40 text-xs font-semibold text-accent hover:text-accent-bright transition-colors flex items-center justify-between cursor-pointer group"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Compass className="w-3.5 h-3.5" />
                                    <span>
                                      {remainingCount > 0
                                        ? `+${remainingCount} more ${remainingCount === 1 ? 'message' : 'messages'} in full dialogue`
                                        : 'View full dialogue on Discover'}
                                    </span>
                                  </span>
                                  <span className="flex items-center gap-1 text-[11px] text-ink-muted group-hover:text-accent-bright">
                                    <span>Open in Discover</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </span>
                                </button>
                              </div>
                            );
                          })()}

                          {/* Card Footer */}
                          <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs text-ink-faint">
                            <span>{card.reads} · Public excerpt · Read & react only</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onNavigate?.('Discover', displayedUser?.handle || handleDisplay, card.excerptId)}
                                className="px-3 py-1.5 rounded-xl bg-accent-strong/15 border border-accent/30 hover:bg-accent-strong/25 text-xs font-semibold text-accent hover:text-accent-bright transition-colors cursor-pointer flex items-center gap-1.5"
                                title="Open this story on Discover"
                              >
                                <Compass className="w-3.5 h-3.5" />
                                <span>View in Discover</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              {card.conversationId && isOwnProfile && (
                                <button
                                  onClick={() => onNavigate?.('My chats', String(card.conversationId))}
                                  className="px-2.5 py-1.5 rounded-xl bg-surface border border-line-2 hover:bg-surface-2 text-xs font-semibold text-ink-soft transition-colors cursor-pointer flex items-center gap-1.5"
                                  title="Open original private conversation in My chats"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Private chat</span>
                                </button>
                              )}
                              <button
                                onClick={() => toggleSave(card.id)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  card.saved ? 'text-accent bg-accent/10' : 'text-ink-muted hover:text-white hover:bg-surface'
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
                                className="p-1.5 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
                                title="Share"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="p-6 rounded-3xl bg-canvas-2 border border-line-2 space-y-4 text-xs text-ink-soft shadow-xl">
                  <h4 className="font-bold text-white text-sm">About {nameDisplay}</h4>
                  <p className="leading-relaxed text-ink-muted">
                    {displayedUser?.bio || 'No bio provided yet.'}
                  </p>
                  <div className="pt-3 border-t border-line flex items-center gap-6 text-ink-muted">
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
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        {isOwnProfile ? (
          <>
            {/* Card 1: Your public profile */}
            <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-4 shadow-xl">
              <div>
                <h4 className="text-sm font-extrabold text-white tracking-tight">Your public profile</h4>
                <p className="text-[11px] text-ink-faint mt-0.5 leading-relaxed">
                  This is what readers see. Only your published chats appear here.
                </p>
              </div>

              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="w-full py-2.5 px-3 rounded-xl bg-surface border border-line-2 hover:bg-surface-2 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                {isEditingProfile ? 'Cancel editing' : 'Edit profile'}
              </button>

              <div className="pt-2 border-t border-line">
                <button
                  onClick={() => onNavigate && onNavigate('Account and settings')}
                  className="text-xs text-accent hover:underline font-semibold cursor-pointer"
                >
                  Account and settings
                </button>
              </div>
            </div>

            {/* Card 2: Public chat. Private identity */}
            <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
                <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
                  You published these excerpts. Other participants' names, handles and photos remain hidden unless they also publish.
                </p>
              </div>
            </div>

            {/* Card 3: Publication controls */}
            <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-3 shadow-xl">
              <h4 className="text-sm font-extrabold text-white tracking-tight">Publication controls</h4>
              <button
                onClick={() => onNavigate && onNavigate('Published chats')}
                className="text-xs font-bold text-accent hover:text-accent-bright flex items-center gap-1 cursor-pointer"
              >
                <span>Manage publications</span>
                <span>→</span>
              </button>
              <p className="text-[11px] text-ink-faint leading-relaxed">
                Manage titles, topics and which excerpts stay in the spotlight.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Card 1: Creator Summary */}
            <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-4 shadow-xl">
              <div>
                <h4 className="text-sm font-extrabold text-white tracking-tight">About this creator</h4>
                <p className="text-[11px] text-ink-faint mt-0.5 leading-relaxed">
                  {displayedUser?.bio || 'No bio provided yet.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFollow}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isFollowing
                      ? 'bg-surface border border-line-strong text-ink-soft hover:border-rose-500/50 hover:text-rose-400 group'
                      : 'bg-accent-strong hover:bg-accent text-white shadow-lg shadow-accent/20'
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
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    isFollowing
                      ? 'bg-surface border-line-2 hover:bg-surface-2 text-white'
                      : 'bg-surface/50 border-line text-ink-muted hover:text-white'
                  }`}
                  title={isFollowing ? 'Send message' : `Follow @${displayedUser?.handle?.replace('@', '') || 'user'} to message`}
                >
                  {isFollowing ? (
                    <MessageSquare className="w-4 h-4 text-accent" />
                  ) : (
                    <Lock className="w-4 h-4 text-ink-faint" />
                  )}
                </button>
              </div>
            </div>

            {/* Card 2: People you might like */}
            {suggestedPeople.length > 0 && (
              <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-4 shadow-xl">
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
                          <img src={person.avatar_url} alt={person.display_name} className="w-8 h-8 rounded-full object-cover border border-line-strong shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-surface border border-line-strong flex items-center justify-center font-bold text-[11px] text-ink-soft shrink-0">
                            {getInitials(person.display_name, person.handle)}
                          </div>
                        )}
                        <div className="truncate">
                          <div className="text-xs font-bold text-white leading-snug truncate">{person.display_name || person.handle}</div>
                          <div className="text-[10px] text-ink-faint truncate">{person.handle}</div>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          await cchatApi.toggleFollow(person.id || person.handle);
                          setSuggestedPeople(prev => prev.filter(p => p.id !== person.id));
                        }}
                        className="text-xs font-semibold text-accent hover:text-accent-bright cursor-pointer shrink-0 ml-2"
                      >
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 3: Public chat. Private identity */}
            <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
                <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
                  You only see excerpts {nameDisplay} has published. Anonymous co-participants remain anonymous.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Footer links */}
        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
          <FooterLinks onNavigate={onNavigate} />
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
      <div className="flex-1 flex flex-col border-r border-line min-w-0 bg-canvas-deep">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-2 -ml-2 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-white tracking-tight">Account and settings</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-48 md:w-64 lg:w-80">
              <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                onClick={() => onNavigate && onNavigate('Search')}
                placeholder="Search chats, people, plot twists"
                className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors cursor-pointer"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('Search')}
              className="sm:hidden p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer relative"
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
            <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
              Edit your profile and preferences in one place. Changes shown here are ready to review.
            </p>
          </div>

          {/* Section 1: Profile editing */}
          <section id="section-profile" className="p-6 rounded-3xl bg-canvas-2 border border-line-2 space-y-5 shadow-xl">
            <h3 className="text-sm font-extrabold text-white">Profile editing</h3>

            <div className="flex items-center gap-4">
              <UserAvatar
                src={avatarUrl}
                name={displayName || 'User'}
                handle={handle || '@user'}
                size="lg"
                className="w-12 h-12 border border-line-strong"
              />
              <div className="flex items-center gap-2 text-xs font-semibold text-accent">
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
                <span className="text-ink-faint">·</span>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="hover:underline text-ink-muted cursor-pointer"
                >
                  Remove photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-muted">Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-surface border border-line-2 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-muted">Handle</label>
                <input
                  type="text"
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  className="w-full bg-surface border border-line-2 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-ink-muted">Bio</label>
              <input
                type="text"
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full bg-surface border border-line-2 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-ink-faint pt-1">
                Visible on your public profile. Do not include someone else's private information.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2.5 rounded-xl bg-accent-strong hover:bg-accent text-white font-bold text-xs shadow-md shadow-accent-strong/25 transition-all cursor-pointer"
              >
                Save profile changes
              </button>
              {saveStatus && <span className="text-xs text-emerald-400 font-semibold">{saveStatus}</span>}
              <button
                onClick={() => onNavigate && onNavigate('Profile')}
                className="px-4 py-2.5 rounded-xl bg-surface border border-line-2 hover:bg-surface-2 text-xs font-semibold text-ink-soft transition-colors cursor-pointer"
              >
                Back to Profile
              </button>
            </div>
          </section>

          {/* Section 2: Account & sign-in */}
          <section id="section-account" className="p-6 rounded-3xl bg-canvas-2 border border-line-2 space-y-4 shadow-xl">
            <h3 className="text-sm font-extrabold text-white">Account & sign-in</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-muted">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-surface border border-line-2 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
                <span className="text-[10px] text-ink-faint block">Private · not shown on your public profile</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-muted">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface border border-line-2 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                />
                <span className="text-[10px] text-ink-faint block">Use a unique password.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-accent">
              <button className="hover:underline cursor-pointer">Update email & password</button>
              <span className="text-ink-faint">·</span>
              <button className="hover:underline text-ink-muted cursor-pointer">Sign out of this session</button>
            </div>
          </section>

          {/* Section 3: Notification preferences */}
          <section id="section-notifications" className="p-6 rounded-3xl bg-canvas-2 border border-line-2 space-y-5 shadow-xl">
            <h3 className="text-sm font-extrabold text-white">Notification preferences</h3>

            <div className="space-y-4">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Private message notifications</div>
                  <div className="text-[10px] text-ink-faint">Updates from conversations in your inbox</div>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, privateMessages: !p.privateMessages }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifPrefs.privateMessages ? 'bg-accent-strong' : 'bg-surface-2'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifPrefs.privateMessages ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Public reactions</div>
                  <div className="text-[10px] text-ink-faint">Reactions on your published messages</div>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, publicReactions: !p.publicReactions }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifPrefs.publicReactions ? 'bg-accent-strong' : 'bg-surface-2'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifPrefs.publicReactions ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">New followers</div>
                  <div className="text-[10px] text-ink-faint">People following your public profile</div>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, newFollowers: !p.newFollowers }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifPrefs.newFollowers ? 'bg-accent-strong' : 'bg-surface-2'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifPrefs.newFollowers ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 4 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Publication changes</div>
                  <div className="text-[10px] text-ink-faint">Updates when your excerpt changes visibility</div>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, publicationChanges: !p.publicationChanges }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifPrefs.publicationChanges ? 'bg-accent-strong' : 'bg-surface-2'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifPrefs.publicationChanges ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 5 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Email activity summaries</div>
                  <div className="text-[10px] text-ink-faint">Optional account activity reminders</div>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, emailSummaries: !p.emailSummaries }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifPrefs.emailSummaries ? 'bg-accent-strong' : 'bg-surface-2'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifPrefs.emailSummaries ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Section 4: Privacy defaults */}
          <section id="section-privacy" className="p-6 rounded-3xl bg-canvas-2 border border-line-2 space-y-5 shadow-xl">
            <h3 className="text-sm font-extrabold text-white">Privacy defaults</h3>

            <div className="space-y-4">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Keep new messages private</div>
                  <div className="text-[10px] text-ink-faint">Always on. No automatic publication of future messages.</div>
                </div>
                <button
                  onClick={() => setPrivacyDefaults(p => ({ ...p, keepNewPrivate: !p.keepNewPrivate }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    privacyDefaults.keepNewPrivate ? 'bg-accent-strong' : 'bg-surface-2'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${privacyDefaults.keepNewPrivate ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Show read receipts</div>
                  <div className="text-[10px] text-ink-faint">Let private-chat participants see when you've read a message.</div>
                </div>
                <button
                  onClick={() => setPrivacyDefaults(p => ({ ...p, showReadReceipts: !p.showReadReceipts }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    privacyDefaults.showReadReceipts ? 'bg-accent-strong' : 'bg-surface-2'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${privacyDefaults.showReadReceipts ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Allow messages from people you don't follow</div>
                  <div className="text-[10px] text-ink-faint">Turn off to limit new conversation requests.</div>
                </div>
                <button
                  onClick={() => setPrivacyDefaults(p => ({ ...p, allowFromUnfollowed: !p.allowFromUnfollowed }))}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    privacyDefaults.allowFromUnfollowed ? 'bg-accent-strong' : 'bg-surface-2'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${privacyDefaults.allowFromUnfollowed ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111624] border border-[#1b2b48] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">Publication identity rule</h5>
                <p className="text-[11px] text-ink-muted leading-relaxed mt-0.5">
                  If only you publish, the other person's name, handle and photo are hidden. Both identities appear only if both participants publish.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Safety & account controls */}
          <section id="section-safety" className="p-6 rounded-3xl bg-canvas-2 border border-line-2 space-y-4 shadow-xl mb-6">
            <h3 className="text-sm font-extrabold text-white">Safety & account controls</h3>

            <div>
              <div className="text-xs font-bold text-white">Blocked people · 1</div>
              <div className="text-[11px] text-ink-muted mt-0.5">
                @quietaccount · Blocked · <button className="text-accent hover:underline cursor-pointer">Unblock</button>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-ink-muted">Report an account or publication</label>
              <div className="relative">
                <select
                  value={reportCategory}
                  onChange={e => setReportCategory(e.target.value)}
                  className="w-full appearance-none bg-surface border border-line-2 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer pr-8"
                >
                  <option value="Privacy / personal information">Privacy / personal information</option>
                  <option value="Harassment or spam">Harassment or spam</option>
                  <option value="Impersonation">Impersonation</option>
                </select>
                <ChevronDown className="w-4 h-4 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[10px] text-ink-faint pt-0.5">
                Add context to a report in the chat's options menu. Avoid repeating sensitive data unnecessarily.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button className="px-4 py-2.5 rounded-xl bg-accent-strong hover:bg-accent text-white font-bold text-xs shadow-md shadow-accent-strong/25 transition-all cursor-pointer">
                Save preferences
              </button>
              <button className="px-4 py-2.5 rounded-xl bg-surface border border-line-2 hover:bg-surface-2 text-xs font-semibold text-ink-soft transition-colors cursor-pointer">
                Request account data
              </button>
              <button className="px-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/50 text-xs font-semibold text-rose-300 transition-colors cursor-pointer">
                Delete account
              </button>
            </div>

            <p className="text-[10px] text-ink-faint">
              Deleting an account is a separate decision from removing a publication. Review public excerpts before you confirm any account deletion.
            </p>
          </section>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        {/* Card 1: On this page */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-3.5 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">On this page</h4>
          <nav aria-label="On this page" className="space-y-2 text-xs">
            <button type="button" onClick={() => scrollToSection('section-profile')} className="block w-full text-left text-accent font-semibold hover:underline cursor-pointer">
              Profile editing
            </button>
            <button type="button" onClick={() => scrollToSection('section-account')} className="block w-full text-left text-ink-soft hover:text-white cursor-pointer">
              Account & sign-in
            </button>
            <button type="button" onClick={() => scrollToSection('section-notifications')} className="block w-full text-left text-ink-soft hover:text-white cursor-pointer">
              Notifications
            </button>
            <button type="button" onClick={() => scrollToSection('section-privacy')} className="block w-full text-left text-ink-soft hover:text-white cursor-pointer">
              Privacy defaults
            </button>
            <button type="button" onClick={() => scrollToSection('section-safety')} className="block w-full text-left text-ink-soft hover:text-white cursor-pointer">
              Safety & account controls
            </button>
          </nav>
        </div>

        {/* Card 2: Names aren't consent */}
        <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Names aren't consent.</h5>
            <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
              Editing your profile does not reveal an anonymous participant. Publication decisions are made separately for each excerpt.
            </p>
          </div>
        </div>

        {/* Card 3: Account state */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-2.5 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Account state</h4>
          <div className="text-xs font-bold text-white">
            Signed in as {currentUser?.display_name || displayName || 'User'}
          </div>
          <div className="text-[10px] text-ink-faint">
            {currentUser?.handle || handle || '@user'} · Current session
          </div>
          <div className="pt-2 border-t border-line text-xs font-semibold text-accent">
            <button className="hover:underline cursor-pointer">Privacy · Community rules</button>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
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
interface PublicationItem {
  id: string;
  excerptId?: number;
  conversationId?: number;
  title: string;
  chatName: string;
  topic: string;
  messagesCount: string;
  reads: string;
  publishedTime: string;
  isLive: boolean;
}

function PublishedChatsPage({
  currentUser,
  onNavigate,
  onOpenMenu,
}: {
  currentUser?: UserProfile | null;
  onNavigate?: (nav: string, handleOrTopic?: string, extraParam?: any) => void;
  onOpenMenu?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'All chats' | 'Published'>('Published');
  const [selectedPublication, setSelectedPublication] = useState('p1');
  const [editingTitle, setEditingTitle] = useState('the deck has 94 slides.');
  const [editingTopic, setEditingTopic] = useState('#workbesties');
  const [showConfirmRemove, setShowConfirmRemove] = useState(true);

  const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : (n || 0).toString());

  const mayaSeedPubs: PublicationItem[] = [
    {
      id: 'p1',
      excerptId: 2,
      conversationId: 3,
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
      excerptId: 3,
      conversationId: 4,
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
      excerptId: 1,
      conversationId: 1,
      title: 'the rent is due. the raccoon is not on the lease.',
      chatName: 'The apartment',
      topic: '#roommatelore',
      messagesCount: '6 messages',
      reads: '6.2k reads',
      publishedTime: 'Published 18m ago',
      isLive: true,
    },
  ];

  const [publications, setPublications] = useState<PublicationItem[]>(() => {
    return (currentUser?.handle === '@mayamaybe') ? mayaSeedPubs : [];
  });

  const handleViewInDiscover = (pub: PublicationItem) => {
    if (onNavigate) {
      onNavigate('Discover', currentUser?.handle || '@user', pub.excerptId);
    }
  };

  const handleViewFullChat = (pub: PublicationItem) => {
    const convId = pub.conversationId || (pub.id === 'p1' ? 3 : pub.id === 'p2' ? 4 : pub.id === 'p3' ? 1 : null);
    if (onNavigate) {
      if (convId) {
        onNavigate('My chats', String(convId));
      } else {
        onNavigate('My chats');
      }
    }
  };

  useEffect(() => {
    if (!currentUser?.handle) return;
    cchatApi.getExcerpts({ publisher: currentUser.handle })
      .then(excerpts => {
        if (excerpts && excerpts.length > 0) {
          setPublications(excerpts.map(e => {
            const fallbackConvId = e.id === 1 ? 1 : e.id === 2 ? 3 : e.id === 3 ? 4 : e.id === 10 ? 5 : undefined;
            return {
              id: `p${e.id}`,
              excerptId: e.id,
              conversationId: e.conversation_id || fallbackConvId,
              title: e.title,
              chatName: e.title || 'Private chat',
              topic: e.topic?.tag || '#chat',
              messagesCount: `${e.messages?.length || 0} messages`,
              reads: `${fmt(e.reads_count)} reads`,
              publishedTime: formatRelativeTime(e.created_at),
              isLive: true,
            };
          }));
        } else if (currentUser.handle === '@mayamaybe') {
          setPublications(mayaSeedPubs);
        } else {
          setPublications([]);
        }
      })
      .catch(() => {
        if (currentUser.handle === '@mayamaybe') {
          setPublications(mayaSeedPubs);
        } else {
          setPublications([]);
        }
      });
  }, [currentUser]);

  const handleSelectPub = (pub: PublicationItem) => {
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
      <div className="flex-1 flex flex-col border-r border-line min-w-0 bg-canvas-deep">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-2 -ml-2 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-white tracking-tight">Published chats</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-48 md:w-64 lg:w-80">
              <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                onClick={() => onNavigate && onNavigate('Search')}
                placeholder="Search chats, people, plot twists"
                className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors cursor-pointer"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('Search')}
              className="sm:hidden p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer relative"
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
            <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
              Manage only the excerpts you've chosen to make public.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-line pb-2 text-xs font-bold">
            <button
              onClick={() => onNavigate && onNavigate('My chats')}
              className="text-ink-faint hover:text-ink-soft transition-colors cursor-pointer pb-2"
            >
              All chats
            </button>
            <button
              className="text-white transition-colors cursor-pointer pb-2 relative"
            >
              Published
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"></span>
            </button>
          </div>

          {/* Publication Cards List */}
          <div className="space-y-4">
            {publications.length === 0 ? (
              <div className="p-8 rounded-3xl bg-canvas-2 border border-line-2 text-center space-y-3 shadow-xl">
                <MessageSquare className="w-8 h-8 text-ink-faint mx-auto" />
                <h4 className="text-sm font-bold text-white">No published chats yet</h4>
                <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
                  Only excerpts you've chosen to make public will appear here. Publish your best chat excerpts from My chats.
                </p>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('My chats')}
                    className="inline-block mt-2 px-4 py-2 rounded-xl bg-accent-strong hover:bg-accent text-white font-bold text-xs shadow-md shadow-accent-strong/25 transition-all cursor-pointer"
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
                  className={`p-5 rounded-3xl bg-canvas-2 border transition-all cursor-pointer shadow-xl space-y-3 ${
                    selectedPublication === pub.id ? 'border-accent/60 ring-1 ring-accent/30' : 'border-line-2 hover:border-line-strong'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={currentUser?.avatar_url}
                        name={currentUser?.display_name || 'Profile'}
                        handle={currentUser?.handle}
                        size="md"
                        className="w-10 h-10 border border-line-strong"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewInDiscover(pub);
                            }}
                            className="text-base font-extrabold text-white tracking-tight hover:text-accent transition-colors flex items-center gap-1.5 group cursor-pointer"
                            title="Click to view full story on Discover"
                          >
                            <span>{pub.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
                          </h3>
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-ink-faint mt-0.5">
                          <span className="text-ink-muted font-medium">{pub.topic}</span>
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

                  <div className="text-xs text-ink-muted leading-relaxed">
                    {currentUser?.handle || '@user'} × Anonymous · Only you published · Their name, handle and photo are hidden.
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-line">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewInDiscover(pub);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-accent-strong/15 border border-accent/30 hover:bg-accent-strong/25 text-xs font-semibold text-accent hover:text-accent-bright transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Open full dialogue on Discover"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>View in Discover</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewFullChat(pub);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-surface border border-line-2 hover:bg-surface-2 text-xs font-semibold text-ink-soft transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Open full conversation in My chats"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Private chat</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPub(pub);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-surface border border-line-2 hover:bg-surface-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        Edit title & topic
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPub(pub);
                          setShowConfirmRemove(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-surface border border-line-2 hover:bg-rose-950/30 text-xs font-semibold text-ink-muted hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        Remove publication
                      </button>
                    </div>
                    <span className="text-[11px] text-accent/80 font-medium">Private conversation retained</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Remove Publication Confirmation Banner */}
          {showConfirmRemove && (
            <div className="p-6 rounded-3xl bg-canvas-2 border border-line-2 space-y-3.5 shadow-xl">
              <h4 className="text-sm font-extrabold text-white">
                Remove "{editingTitle}" from public view?
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
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
                  className="px-4 py-2.5 rounded-xl bg-surface border border-line-2 hover:bg-surface-2 text-xs font-semibold text-ink-soft transition-colors cursor-pointer"
                >
                  Keep published
                </button>
              </div>

              <div className="text-[10px] text-ink-faint">
                Confirmation open · no change made yet
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Edit selected publication */}
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-4 shadow-xl">
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight">Edit selected publication</h4>
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono mt-1">
              WORK BESTIE · LIVE EXCERPT
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-ink-muted">Public title</label>
            <input
              type="text"
              value={editingTitle}
              onChange={e => setEditingTitle(e.target.value)}
              className="w-full bg-surface border border-line-2 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-ink-muted">Topic</label>
            <div className="relative">
              <select
                value={editingTopic}
                onChange={e => setEditingTopic(e.target.value)}
                className="w-full appearance-none bg-surface border border-line-2 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer pr-8"
              >
                <option value="#workbesties">#workbesties</option>
                <option value="#dating">#dating</option>
                <option value="#roommatelore">#roommatelore</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <p className="text-[11px] text-ink-muted leading-relaxed">
            6 messages selected. Future messages stay private.
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={handleSavePublicationChanges}
              className="w-full py-2.5 px-3 rounded-xl bg-accent-strong hover:bg-accent text-white font-bold text-xs shadow-md shadow-accent-strong/25 transition-all cursor-pointer"
            >
              Save publication changes
            </button>
            <button
              onClick={() => onNavigate && onNavigate('My chats')}
              className="w-full py-2 px-3 rounded-xl bg-surface border border-line-2 hover:bg-surface-2 text-xs font-semibold text-ink-soft transition-colors cursor-pointer"
            >
              Cancel editing
            </button>
          </div>
        </div>

        {/* Security / Inbox guarantee note */}
        <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Your chat stays in your inbox.</h5>
            <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
              Editing or removing your public excerpt doesn't delete the private conversation.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
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
  return (
    <DiscoverPage
      initialTab="Fresh"
      onNavigateTab={onNavigateTab}
      onNavigate={onNavigate}
      onOpenMenu={onOpenMenu}
    />
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
      quoteColor: 'text-accent',
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
      <div className="flex-1 flex flex-col border-r border-line min-w-0 bg-canvas-deep">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-1.5 -ml-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
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
              className="sm:hidden p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative w-48 sm:w-64 md:w-80 hidden sm:block">
              <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                onClick={() => onNavigate && onNavigate('Search')}
                placeholder="Search chats, people, plot twists"
                className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors cursor-pointer"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer relative"
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
              <span className="text-ink-faint">/</span>
              <span className="text-ink-muted">TOPICS</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1.5 leading-tight">In the group chat.</h1>
            <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
              Find the stories you came for. Stay for the very specific chaos.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-ink-muted">Find a topic</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search topics"
              className="w-full bg-canvas-2 border border-line-2 focus:border-accent rounded-2xl px-4 py-3 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors"
            />
            <div className="text-[11px] text-ink-faint pt-0.5">Showing all {filteredTopics.length} available topics</div>
          </div>

          {/* Topics Cards List */}
          <div className="space-y-4">
            {filteredTopics.map(topic => (
              <div
                key={topic.tag}
                className="p-6 rounded-3xl bg-canvas-2 border border-line-2 hover:border-line-strong transition-colors shadow-xl space-y-4"
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
                      <h4 className="text-sm font-bold text-ink">{topic.headline}</h4>
                      <p className="text-xs text-ink-muted leading-relaxed max-w-xl">{topic.desc}</p>
                      <div className={`text-xs font-semibold pt-1 ${topic.quoteColor}`}>
                        {topic.quote}
                      </div>
                      <div className="text-[10px] text-ink-faint pt-1">
                        {topic.stats}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate && onNavigate('Topic detail', topic.tag)}
                    className="px-4 py-2 rounded-xl bg-surface border border-line-2 hover:bg-surface-2 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5"
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
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        {/* Card 1: Pick your kind of chaos */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-3.5 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Pick your kind of chaos</h4>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Topics gather published excerpts, not private rooms. Read a chat, react to a message, save the plot for later.
          </p>
          <div className="text-[10px] text-accent font-semibold pt-1 border-t border-line">
            3 topics · All public
          </div>
        </div>

        {/* Card 2: No joining required */}
        <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">No joining required. Or possible.</h5>
            <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
              A topic is a reading feed. Reacting doesn't add you to anyone's private conversation.
            </p>
          </div>
        </div>

        {/* Card 3: Tonight's picks */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-3 shadow-xl">
          <div className="text-[10px] font-black uppercase tracking-wider text-ink-muted font-mono">
            TONIGHT'S PICKS
          </div>
          <h4 className="text-lg font-black text-white leading-tight">Small talk. Big energy.</h4>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            The after-hours edit brings a few standout public conversations together.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('Discover')}
            className="text-xs text-accent hover:text-accent-bright font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Explore tonight's picks</span>
            <span>↗</span>
          </button>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
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
  onNavigate?: (nav: string, topicOrHandle?: string | number, extraParam?: any) => void;
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
      <div className="flex-1 flex flex-col border-r border-line min-w-0 bg-canvas-deep">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => onNavigate && onNavigate('Discover')}
              className="p-1.5 -ml-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer shrink-0"
              title="Back to feed"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">{currentTopic}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('Search')}
              className="sm:hidden p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative w-48 sm:w-64 md:w-80 hidden sm:block">
              <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                onClick={() => onNavigate && onNavigate('Search')}
                placeholder="Search chats, people, plot twists"
                className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors cursor-pointer"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-5 pb-20 md:pb-8 overflow-y-auto space-y-6">
          {/* Breadcrumb & Topic Hero Header */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider font-mono">
              <button
                onClick={() => onNavigate && onNavigate('Topics directory')}
                className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
              >
                TOPICS
              </button>
              <span className="text-ink-faint">/</span>
              <span className="text-ink-muted">{topicConfig.breadcrumb}</span>
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <h1 className="text-3xl font-black text-white tracking-tight">{currentTopic}</h1>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isFollowing
                    ? 'bg-accent-strong/20 border-accent/50 text-accent-bright'
                    : 'bg-canvas-2 border-line-2 hover:bg-surface text-white'
                }`}
              >
                {isFollowing ? 'Following ✓' : 'Follow topic'}
              </button>
            </div>

            <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
              {topicConfig.subtitle}
            </p>
          </div>

          {/* Popular / Fresh Tabs */}
          <div className="flex items-center gap-6 border-b border-line">
            <button
              onClick={() => setActiveTab('Popular')}
              className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer relative ${
                activeTab === 'Popular' ? 'text-white' : 'text-ink-muted hover:text-ink'
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
                activeTab === 'Fresh' ? 'text-white' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Fresh
              {activeTab === 'Fresh' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          </div>

          {/* CHAT CARD 1: he brought a résumé to a first date. */}
          <div className="rounded-3xl bg-canvas-2 border border-line-2 p-6 space-y-5 shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Maya Chen"
                onClick={() => onNavigate?.('Profile', '@mayamaybe')}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-line-2 hover:ring-accent cursor-pointer transition-all"
              />
              <div>
                <h3
                  onClick={() => onNavigate?.('Discover', currentTopic, 3)}
                  className="text-base font-bold text-white tracking-tight hover:text-accent cursor-pointer transition-colors"
                  title="Read full chat in Discover"
                >
                  he brought a résumé to a first date.
                </h3>
                <div className="text-xs text-ink-muted mt-0.5">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('Profile', '@mayamaybe')}
                    className="font-semibold text-ink-muted hover:text-white transition-colors cursor-pointer"
                  >
                    @mayamaybe
                  </button>
                  <span className="mx-1">×</span>
                  <span>Anonymous · 2h ago · {currentTopic}</span>
                </div>
              </div>
            </div>

            {/* Reading now indicator */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-ink-muted font-medium py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>386 reading now · reactions set the mood</span>
            </div>

            {/* Dialogue Messages */}
            <div className="space-y-4 pt-1">
              {/* Msg 1 (Anonymous, Left) */}
              <div className="space-y-1 max-w-[75%]">
                <div className="text-[11px] text-ink-faint font-medium">Anonymous</div>
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
                      reactions1[0].active === 'heart' ? 'text-rose-400 font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions1[0].hearts)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(0, 'cap')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[0].active === 'cap' ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions1[0].caps)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(0, 'skull')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[0].active === 'skull' ? 'text-ink font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions1[0].skulls)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(0, 'fire')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[0].active === 'fire' ? 'text-amber-400 font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions1[0].fires)}</span>
                  </button>
                </div>
              </div>

              {/* Msg 2 (Maya, Right) */}
              <div className="space-y-1 ml-auto max-w-[75%] flex flex-col items-end">
                <div className="text-[11px] text-ink-faint font-medium">Maya</div>
                <div className="bg-[#481c2d] border border-[#642840] text-white px-4 py-3 rounded-2xl rounded-tr-xs text-xs font-medium leading-relaxed">
                  please tell me this is a metaphor
                </div>
                {/* Reactions */}
                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <button
                    onClick={() => handleReact1(1, 'heart')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[1].active === 'heart' ? 'text-rose-400 font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions1[1].hearts)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(1, 'cap')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[1].active === 'cap' ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions1[1].caps)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(1, 'skull')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[1].active === 'skull' ? 'text-ink font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions1[1].skulls)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(1, 'fire')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[1].active === 'fire' ? 'text-amber-400 font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions1[1].fires)}</span>
                  </button>
                </div>
              </div>

              {/* Msg 3 (Anonymous, Left) */}
              <div className="space-y-1 max-w-[75%]">
                <div className="text-[11px] text-ink-faint font-medium">Anonymous</div>
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
                      reactions1[2].active === 'heart' ? 'text-rose-400 font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions1[2].hearts)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(2, 'cap')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[2].active === 'cap' ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions1[2].caps)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(2, 'skull')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[2].active === 'skull' ? 'text-ink font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions1[2].skulls)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(2, 'fire')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[2].active === 'fire' ? 'text-amber-400 font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions1[2].fires)}</span>
                  </button>
                </div>
              </div>

              {/* Msg 4 (Maya, Right) */}
              <div className="space-y-1 ml-auto max-w-[75%] flex flex-col items-end">
                <div className="text-[11px] text-ink-faint font-medium">Maya</div>
                <div className="bg-surface-2 border border-line-strong text-white px-4 py-3 rounded-2xl rounded-tr-xs text-xs font-medium leading-relaxed">
                  did you at least get the position?
                </div>
                {/* Reactions */}
                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <button
                    onClick={() => handleReact1(3, 'heart')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[3].active === 'heart' ? 'text-rose-400 font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions1[3].hearts)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(3, 'cap')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[3].active === 'cap' ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions1[3].caps)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(3, 'skull')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[3].active === 'skull' ? 'text-ink font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions1[3].skulls)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(3, 'fire')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[3].active === 'fire' ? 'text-amber-400 font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions1[3].fires)}</span>
                  </button>
                </div>
              </div>

              {/* Msg 5 (Anonymous, Left) */}
              <div className="space-y-1 max-w-[75%]">
                <div className="text-[11px] text-ink-faint font-medium">Anonymous</div>
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
                      reactions1[4].active === 'heart' ? 'text-rose-400 font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions1[4].hearts)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(4, 'cap')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[4].active === 'cap' ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions1[4].caps)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(4, 'skull')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[4].active === 'skull' ? 'text-ink font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions1[4].skulls)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(4, 'fire')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[4].active === 'fire' ? 'text-amber-400 font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions1[4].fires)}</span>
                  </button>
                </div>
              </div>

              {/* Msg 6 (Maya, Right) */}
              <div className="space-y-1 ml-auto max-w-[75%] flex flex-col items-end">
                <div className="text-[11px] text-ink-faint font-medium">Maya</div>
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
                      reactions1[5].active === 'heart' ? 'text-rose-400 font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions1[5].hearts)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(5, 'cap')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[5].active === 'cap' ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions1[5].caps)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(5, 'skull')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[5].active === 'skull' ? 'text-ink font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions1[5].skulls)}</span>
                  </button>
                  <button
                    onClick={() => handleReact1(5, 'fire')}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      reactions1[5].active === 'fire' ? 'text-amber-400 font-bold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions1[5].fires)}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 1 Footer */}
            <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
              <span className="text-[11px] text-ink-faint">
                18.4k reads · Public excerpt · Read & react only
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate?.('Discover', currentTopic, 3)}
                  className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-2 text-ink-soft hover:text-white text-xs font-semibold border border-line-2 transition-colors cursor-pointer flex items-center gap-1"
                  title="Open full chat in Discover"
                >
                  <span>Read chat</span>
                  <ArrowRight className="w-3 h-3 text-accent" />
                </button>
                <button
                  onClick={() => setBookmarked1(!bookmarked1)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    bookmarked1 ? 'text-accent bg-blue-950/40' : 'text-ink-faint hover:text-ink-soft'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-ink-faint hover:text-ink-soft rounded-lg transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* UP NEXT IN #DATING TEASER */}
          <div
            onClick={() => onNavigate?.('Discover', currentTopic, 1)}
            className="p-4 rounded-2xl bg-canvas-2 border border-line flex flex-col justify-between hover:border-line-strong transition-colors cursor-pointer group"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-ink-muted font-mono">
              Up next in {currentTopic}
            </span>
            <h4 className="text-base font-extrabold text-white mt-1 group-hover:text-accent transition-colors flex items-center justify-between">
              <span>the apology came with a lasagna.</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </h4>
            <div className="text-xs text-ink-muted mt-0.5">
              @leosays × Anonymous · 6 messages · Click to read
            </div>
          </div>

          {/* CHAT CARD 2: the apology came with a lasagna. */}
          <div className="rounded-3xl bg-canvas-2 border border-line-2 p-6 space-y-5 shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => onNavigate?.('Profile', '@leomartinez')}
                className="w-10 h-10 rounded-full bg-surface border border-line-strong hover:border-accent flex items-center justify-center text-xs font-black text-ink-soft cursor-pointer transition-colors"
              >
                LE
              </div>
              <div>
                <h3
                  onClick={() => onNavigate?.('Discover', currentTopic, 1)}
                  className="text-base font-bold text-white tracking-tight hover:text-accent cursor-pointer transition-colors"
                  title="Read full chat in Discover"
                >
                  the apology came with a lasagna.
                </h3>
                <div className="text-xs text-ink-muted mt-0.5">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('Profile', '@leomartinez')}
                    className="font-semibold text-ink-muted hover:text-white transition-colors cursor-pointer"
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
                <div className="text-[11px] text-ink-faint font-medium">Anonymous</div>
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
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-ink-muted hover:text-ink transition-colors cursor-pointer"
                  >
                    <span>♥</span>
                    <span>{formatCount(reactions2[0].hearts)}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/80 border border-accent-strong text-accent-bright font-bold transition-colors cursor-pointer"
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions2[0].caps)}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-ink-muted hover:text-ink transition-colors cursor-pointer"
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions2[0].skulls)}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-ink-muted hover:text-ink transition-colors cursor-pointer"
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions2[0].fires)}</span>
                  </button>
                </div>
              </div>

              {/* Msg 2 (Leo, Right) */}
              <div className="space-y-1 ml-auto max-w-[75%] flex flex-col items-end">
                <div className="text-[11px] text-ink-faint font-medium">Leo</div>
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
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-ink-muted hover:text-ink transition-colors cursor-pointer"
                  >
                    <span>🧢</span>
                    <span>{formatCount(reactions2[1].caps)}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-ink-muted hover:text-ink transition-colors cursor-pointer"
                  >
                    <span>💀</span>
                    <span>{formatCount(reactions2[1].skulls)}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-ink-muted hover:text-ink transition-colors cursor-pointer"
                  >
                    <span>🔥</span>
                    <span>{formatCount(reactions2[1].fires)}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 Footer */}
            <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
              <span className="text-[11px] text-ink-faint">
                812 reads · Public excerpt · Read & react only
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate?.('Discover', currentTopic, 1)}
                  className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-2 text-ink-soft hover:text-white text-xs font-semibold border border-line-2 transition-colors cursor-pointer flex items-center gap-1"
                  title="Open full chat in Discover"
                >
                  <span>Read chat</span>
                  <ArrowRight className="w-3 h-3 text-accent" />
                </button>
                <button
                  onClick={() => setBookmarked2(!bookmarked2)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    bookmarked2 ? 'text-accent bg-blue-950/40' : 'text-ink-faint hover:text-ink-soft'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-ink-faint hover:text-ink-soft rounded-lg transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        {/* Card 1: The bar is in the basement */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-3.5 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">{topicConfig.sidebarTitle}</h4>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            {topicConfig.sidebarDesc}
          </p>
          <button
            onClick={() => onNavigate && onNavigate('Topics directory')}
            className="text-xs text-accent hover:text-accent-bright font-bold flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>Topics directory</span>
            <span>↗</span>
          </button>
        </div>

        {/* Card 2: Share this public excerpt */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-3 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">Share this public excerpt</h4>
          <div className="space-y-2 pt-1 text-xs">
            <button
              onClick={handleCopy}
              className="text-accent hover:text-accent-bright font-semibold block text-left cursor-pointer"
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
              className="text-ink-soft hover:text-white font-medium block text-left cursor-pointer"
            >
              {copiedPreview ? '✓ Excerpt preview link copied!' : 'Share excerpt preview'}
            </button>
            <button
              onClick={() => {
                setCopiedLink(false);
                setCopiedPreview(false);
              }}
              className="text-ink-muted hover:text-ink-soft font-medium block text-left cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <p className="text-[10px] text-ink-faint leading-relaxed pt-2 border-t border-line">
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
                  ? 'bg-surface border-accent/50 shadow-md'
                  : 'bg-canvas-2 border-line-2 hover:border-line-strong hover:bg-surface'
              }`}
            >
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span className={currentTopic === item.tag ? 'text-accent' : ''}>{item.tag}</span>
                {currentTopic === item.tag && (
                  <span className="text-[10px] text-accent font-semibold bg-blue-950/60 px-1.5 py-0.5 rounded">Active</span>
                )}
              </div>
              <div className="text-[11px] text-ink-muted mt-0.5">{item.title}</div>
              <div className="text-[10px] text-ink-faint mt-1">{item.chats}</div>
            </div>
          ))}
        </div>

        {/* Card 4: You set the mood */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-3.5 shadow-xl">
          <h4 className="text-sm font-extrabold text-white tracking-tight">You set the mood.</h4>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            React to a message. Its leading reaction colors the bubble.
          </p>
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-2xl bg-surface border border-line-2 hover:border-rose-500/50 flex flex-col items-center gap-1 cursor-pointer transition-colors">
              <span className="text-sm">♥</span>
              <span className="text-[10px] text-ink-muted">Heart</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-surface border border-line-2 hover:border-accent/50 flex flex-col items-center gap-1 cursor-pointer transition-colors">
              <span className="text-sm">🧢</span>
              <span className="text-[10px] text-ink-muted">Cap</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-surface border border-line-2 hover:border-line-strong flex flex-col items-center gap-1 cursor-pointer transition-colors">
              <span className="text-sm">💀</span>
              <span className="text-[10px] text-ink-muted">Skull</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-surface border border-line-2 hover:border-amber-500/50 flex flex-col items-center gap-1 cursor-pointer transition-colors">
              <span className="text-sm">🔥</span>
              <span className="text-[10px] text-ink-muted">Fire</span>
            </div>
          </div>
        </div>

        {/* Card 5: Public chat. Private identity */}
        <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
            <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
              One publisher: the other participant's name, handle and photo stay hidden. Both identities appear only when both publish.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
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
  const [selectedChatIdForMyChats, setSelectedChatIdForMyChats] = useState<number | null>(null);
  const [discoverFilterPublisher, setDiscoverFilterPublisher] = useState<string | null>(null);
  const [discoverTargetExcerptId, setDiscoverTargetExcerptId] = useState<number | null>(null);
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
        .then(chats => {
          let mutedIds: number[] = [];
          try {
            mutedIds = JSON.parse(localStorage.getItem('cchat_muted_chats') || '[]');
          } catch {
            mutedIds = [];
          }
          const mutedSet = new Set(mutedIds);
          const totalUnread = chats.reduce((sum, c) => {
            if (mutedSet.has(c.id)) return sum;
            return sum + (c.unread_count || 0);
          }, 0);
          setChatCount(totalUnread);
        })
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

  const handleNavigate = (nav: string, topicOrParam?: string | number, extraParam?: any) => {
    let nextTopic = selectedTopic;
    let nextProfileHandle = selectedProfileHandle;

    if (nav === 'Topic detail') {
      nextTopic = (typeof topicOrParam === 'string' ? topicOrParam : null) || selectedTopic;
      setSelectedTopic(nextTopic);
      setDiscoverFilterPublisher(null);
      setDiscoverTargetExcerptId(null);
    } else if (nav === 'Profile') {
      nextProfileHandle = (typeof topicOrParam === 'string' ? topicOrParam : null) || null;
      setSelectedProfileHandle(nextProfileHandle);
      setDiscoverFilterPublisher(null);
      setDiscoverTargetExcerptId(null);
    } else if (nav === 'My chats') {
      if (topicOrParam) {
        const parsed = parseInt(String(topicOrParam), 10);
        setSelectedChatIdForMyChats(isNaN(parsed) ? null : parsed);
      } else {
        setSelectedChatIdForMyChats(null);
      }
      setSelectedProfileHandle(null);
      nextProfileHandle = null;
      setDiscoverFilterPublisher(null);
      setDiscoverTargetExcerptId(null);
    } else if (nav === 'Discover') {
      let targetId: number | null = null;
      let publisher: string | null = null;

      if (typeof topicOrParam === 'number') {
        targetId = topicOrParam;
      } else if (typeof topicOrParam === 'string') {
        const trimmed = topicOrParam.trim();
        if (/^\d+$/.test(trimmed)) {
          targetId = parseInt(trimmed, 10);
        } else if (trimmed.startsWith('#')) {
          nextTopic = trimmed;
          setSelectedTopic(trimmed);
          targetId = extraParam ? Number(extraParam) : null;
        } else if (trimmed.startsWith('@')) {
          publisher = trimmed;
          targetId = extraParam ? Number(extraParam) : null;
        } else if (extraParam) {
          publisher = `@${trimmed}`;
          targetId = Number(extraParam);
        }
      } else if (extraParam) {
        targetId = Number(extraParam);
      }

      setDiscoverFilterPublisher(publisher);
      setDiscoverTargetExcerptId(targetId);
      setSelectedProfileHandle(null);
      nextProfileHandle = null;
      setSelectedChatIdForMyChats(null);
    } else {
      setSelectedProfileHandle(null);
      nextProfileHandle = null;
      setSelectedChatIdForMyChats(null);
      setDiscoverFilterPublisher(null);
      setDiscoverTargetExcerptId(null);
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
    setDiscoverFilterPublisher(null);
    setDiscoverTargetExcerptId(null);
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
      return (
        <DiscoverPage
          initialTab="For you"
          onNavigateTab={handleNavigateTab}
          onNavigate={handleNavigate}
          onOpenMenu={handleOpenMenu}
          filterPublisher={discoverFilterPublisher}
          targetExcerptId={discoverTargetExcerptId}
          onClearFilter={() => {
            setDiscoverFilterPublisher(null);
            setDiscoverTargetExcerptId(null);
          }}
        />
      );
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
          initialChatId={selectedChatIdForMyChats}
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
    return (
      <DiscoverPage
        onNavigateTab={handleNavigateTab}
        onNavigate={handleNavigate}
        onOpenMenu={handleOpenMenu}
        filterPublisher={discoverFilterPublisher}
        targetExcerptId={discoverTargetExcerptId}
        onClearFilter={() => {
          setDiscoverFilterPublisher(null);
          setDiscoverTargetExcerptId(null);
        }}
      />
    );
  };

  // ── True Responsive Layout ───────────────────────────────────
  // Mobile (< md): full-screen content + bottom nav + slide-in sidebar drawer
  // Desktop (≥ md): permanent left sidebar + content
  return (
    <div className="h-screen w-screen overflow-hidden bg-canvas-deep text-ink flex font-sans relative">

      {/* ── Mobile Sidebar Overlay Drawer ─────────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseMenu}
          />
          {/* Drawer panel */}
          <div className="relative w-72 max-w-[85vw] h-full flex flex-col bg-canvas-deep border-r border-line shadow-2xl z-10 animate-slide-in-left">
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
function TonightsPicksPage({ onNavigate, onOpenMenu }: { onNavigate?: (nav: string, topicOrHandle?: string | number, extraParam?: any) => void; onOpenMenu?: () => void }) {
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
          heart: 'text-rose-400', cap: 'text-accent', skull: 'text-ink', fire: 'text-amber-400'
        };
        const count = type === 'heart' ? r.hearts : type === 'cap' ? r.caps : type === 'skull' ? r.skulls : r.fires;
        return (
          <button
            key={type}
            onClick={() => react(rkey, type)}
            className={`flex items-center gap-1 transition-colors cursor-pointer ${active ? colors[type] + ' font-bold' : 'text-ink-muted hover:text-ink'}`}
          >
            <span>{icons[type]}</span>
            <span>{fmt(count)}</span>
          </button>
        );
      })}
    </div>
  );

  const CardFooter = ({ reads, bk, excerptId = 1 }: { reads: string; bk: 'c1' | 'c2' | 'c3'; excerptId?: number }) => (
    <div className="pt-3 border-t border-line flex items-center justify-between text-[11px]">
      <span className="text-ink-faint">{reads} · Public excerpt · Read & react only</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate?.('Discover', excerptId)}
          className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-2 text-ink-soft hover:text-white text-xs font-semibold border border-line-2 transition-colors cursor-pointer flex items-center gap-1"
          title="Open full chat in Discover"
        >
          <span>Read chat</span>
          <ArrowRight className="w-3 h-3 text-accent" />
        </button>
        <button
          onClick={() => setBookmarks(prev => ({ ...prev, [bk]: !prev[bk] }))}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${bookmarks[bk] ? 'text-accent' : 'text-ink-faint hover:text-ink-soft'}`}
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 text-ink-faint hover:text-ink-soft rounded-lg transition-colors cursor-pointer">
          <Share2 className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 text-ink-faint hover:text-ink-soft rounded-lg transition-colors cursor-pointer">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Main scrollable content */}
      <div className="flex-1 flex flex-col border-r border-line min-w-0 bg-canvas-deep">
        {/* Header */}
        <header className="h-16 px-8 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <button
              onClick={() => onNavigate && onNavigate('Discover')}
              className="text-ink-muted hover:text-white transition-colors cursor-pointer"
            >
              Tonight's picks
            </button>
            <span className="text-ink-faint">/</span>
            <span>The after-hours edit</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                onClick={() => onNavigate && onNavigate('Search')}
                placeholder="Search chats, people, plot twists"
                className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors cursor-pointer"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('Notifications')}
              className="p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
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
                <span className="text-[10px] font-black tracking-widest text-ink-muted uppercase font-mono">
                  · TONIGHT'S PICKS
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white leading-tight drop-shadow-xl">
                  Small talk.<br />Big energy.
                </h1>
                <p className="text-xs text-ink-soft mt-2">
                  Good chats for when the night isn't quite over.
                </p>
                <p className="text-[10px] text-ink-muted mt-1 font-mono">
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
                <span className="text-ink-faint">01 /</span>
                <span className="text-ink-faint">FRIDAY PLANS · </span>
                <span className="text-accent">THE 'ONE DRINK' DEFENSE</span>
              </div>

              {/* Card */}
              <div className="rounded-3xl bg-canvas-2 border border-line-2 p-5 space-y-4 shadow-xl">
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => onNavigate?.('Profile', '@julespark')}
                    className="w-10 h-10 rounded-full bg-surface border border-line-strong hover:border-accent flex items-center justify-center text-xs font-black text-ink-soft cursor-pointer transition-colors"
                  >
                    JU
                  </div>
                  <div>
                    <h3
                      onClick={() => onNavigate?.('Discover', 2)}
                      className="text-sm font-bold text-white tracking-tight hover:text-accent cursor-pointer transition-colors"
                      title="Read full chat in Discover"
                    >
                      we said one drink.
                    </h3>
                    <div className="text-xs text-ink-muted mt-0.5">
                      <button
                        type="button"
                        onClick={() => onNavigate?.('Profile', '@julespark')}
                        className="text-ink-muted hover:text-white transition-colors cursor-pointer"
                      >
                        @julespark
                      </button>
                      <span className="mx-1">×</span>
                      <span>Anonymous · 42m ago · #dating</span>
                    </div>
                  </div>
                </div>

                {/* Reading indicator */}
                <div className="flex items-center justify-center gap-2 text-[11px] text-ink-muted py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>386 reading now · reactions set the mood</span>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {/* Msg 1 – Anon left */}
                  <div className="space-y-1 max-w-[72%]">
                    <div className="text-[11px] text-ink-faint">Anonymous</div>
                    <div className="relative inline-block w-full">
                      <div className={`${getMessageBackgroundByReaction(reactions.c1m1, false).bubbleClass} px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs font-medium transition-all duration-300`}>
                        we said one drink
                      </div>
                    </div>
                    <ReactionBar rkey="c1m1" r={reactions.c1m1} />
                  </div>

                  {/* Msg 2 – Jules right */}
                  <div className="space-y-1 ml-auto max-w-[72%] flex flex-col items-end">
                    <div className="text-[11px] text-ink-faint">Jules</div>
                    <div className={`${getMessageBackgroundByReaction(reactions.c1m2, true).bubbleClass} px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs font-medium transition-all duration-300`}>
                      this is still the same evening
                    </div>
                    <ReactionBar rkey="c1m2" r={reactions.c1m2} />
                  </div>

                  {/* Msg 3 – Anon left */}
                  <div className="space-y-1 max-w-[72%]">
                    <div className="text-[11px] text-ink-faint">Anonymous</div>
                    <div className="relative inline-block w-full">
                      <div className={`${getMessageBackgroundByReaction(reactions.c1m3, false).bubbleClass} px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs font-medium transition-all duration-300`}>
                        it is Saturday
                      </div>
                    </div>
                    <ReactionBar rkey="c1m3" r={reactions.c1m3} />
                  </div>

                  {/* Msg 4 – Jules right */}
                  <div className="space-y-1 ml-auto max-w-[72%] flex flex-col items-end">
                    <div className="text-[11px] text-ink-faint">Jules</div>
                    <div className={`${getMessageBackgroundByReaction(reactions.c1m4, true).bubbleClass} px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs font-medium transition-all duration-300`}>
                      a technicality
                    </div>
                    <ReactionBar rkey="c1m4" r={reactions.c1m4} />
                  </div>

                  {/* Msg 5 – Anon left */}
                  <div className="space-y-1 max-w-[72%]">
                    <div className="text-[11px] text-ink-faint">Anonymous</div>
                    <div className="relative inline-block w-full">
                      <div className={`${getMessageBackgroundByReaction(reactions.c1m5, false).bubbleClass} px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs font-medium transition-all duration-300`}>
                        why is there a karaoke receipt
                      </div>
                    </div>
                    <ReactionBar rkey="c1m5" r={reactions.c1m5} />
                  </div>

                  {/* Msg 6 – Jules right */}
                  <div className="space-y-1 ml-auto max-w-[72%] flex flex-col items-end">
                    <div className="text-[11px] text-ink-faint">Jules</div>
                    <div className="relative inline-block">
                      <div className={`${getMessageBackgroundByReaction(reactions.c1m6, true).bubbleClass} px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs font-medium transition-all duration-300`}>
                        because we invested in the arts.
                      </div>
                    </div>
                    <ReactionBar rkey="c1m6" r={reactions.c1m6} />
                  </div>
                </div>

                <CardFooter reads="4.8k reads" bk="c1" excerptId={2} />
              </div>
            </div>

            {/* ── CHAT 2: the deck has 94 slides. ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase font-mono">
                <span className="text-ink-faint">02 /</span>
                <span className="text-ink-faint">WORK BESTIES · </span>
                <span className="text-amber-400">THE DECK CINEMATIC UNIVERSE</span>
              </div>

              <div className="rounded-3xl bg-canvas-2 border border-line-2 p-5 space-y-4 shadow-xl">
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
                    alt="Maya"
                    onClick={() => onNavigate?.('Profile', '@mayamaybe')}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-line-2 hover:ring-accent cursor-pointer transition-all"
                  />
                  <div>
                    <h3
                      onClick={() => onNavigate?.('Discover', 2)}
                      className="text-sm font-bold text-white tracking-tight hover:text-accent cursor-pointer transition-colors"
                      title="Read full chat in Discover"
                    >
                      the deck has 94 slides.
                    </h3>
                    <div className="text-xs text-ink-muted mt-0.5">
                      <button
                        type="button"
                        onClick={() => onNavigate?.('Profile', '@mayamaybe')}
                        className="text-ink-muted hover:text-white transition-colors cursor-pointer"
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
                    <div className="text-[11px] text-ink-faint">Anonymous</div>
                    <div className={`${getMessageBackgroundByReaction(reactions.c2m1, false).bubbleClass} px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs font-medium transition-all duration-300`}>
                      the deck has 94 slides
                    </div>
                    <ReactionBar rkey="c2m1" r={reactions.c2m1} />
                  </div>

                  {/* Msg 2 – Maya right */}
                  <div className="space-y-1 ml-auto max-w-[72%] flex flex-col items-end">
                    <div className="text-[11px] text-ink-faint">Maya</div>
                    <div className={`${getMessageBackgroundByReaction(reactions.c2m2, true).bubbleClass} px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs font-medium transition-all duration-300`}>
                      is the presentation a hostage situation
                    </div>
                    <ReactionBar rkey="c2m2" r={reactions.c2m2} />
                  </div>
                </div>

                <CardFooter reads="9.1k reads" bk="c2" excerptId={2} />
              </div>
            </div>

            {/* ── CHAT 3: he brought a résumé to a first date. ── */}
            <div className="space-y-4 pb-6">
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase font-mono">
                <span className="text-ink-faint">03 /</span>
                <span className="text-ink-faint">DATING · </span>
                <span className="text-rose-400">REFERENCES AVAILABLE ON REQUEST</span>
              </div>

              <div className="rounded-3xl bg-canvas-2 border border-line-2 p-5 space-y-4 shadow-xl">
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
                    alt="Maya"
                    onClick={() => onNavigate?.('Profile', '@mayamaybe')}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-line-2 hover:ring-accent cursor-pointer transition-all"
                  />
                  <div>
                    <h3
                      onClick={() => onNavigate?.('Discover', 3)}
                      className="text-sm font-bold text-white tracking-tight hover:text-accent cursor-pointer transition-colors"
                      title="Read full chat in Discover"
                    >
                      he brought a résumé to a first date.
                    </h3>
                    <div className="text-xs text-ink-muted mt-0.5">
                      <button
                        type="button"
                        onClick={() => onNavigate?.('Profile', '@mayamaybe')}
                        className="text-ink-muted hover:text-white transition-colors cursor-pointer"
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
                  {/* Msg 1 – Anon left */}
                  <div className="space-y-1 max-w-[72%]">
                    <div className="text-[11px] text-ink-faint">Anonymous</div>
                    <div className={`${getMessageBackgroundByReaction(reactions.c3m1, false).bubbleClass} px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs font-medium transition-all duration-300`}>
                      i brought a résumé to the date.
                    </div>
                    <ReactionBar rkey="c3m1" r={reactions.c3m1} />
                  </div>

                  {/* Msg 2 – Maya right */}
                  <div className="space-y-1 ml-auto max-w-[72%] flex flex-col items-end">
                    <div className="text-[11px] text-ink-faint">Maya</div>
                    <div className={`${getMessageBackgroundByReaction(reactions.c3m2, true).bubbleClass} px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs font-medium transition-all duration-300`}>
                      please tell me this is a metaphor
                    </div>
                    <ReactionBar rkey="c3m2" r={reactions.c3m2} />
                  </div>
                </div>

                <CardFooter reads="18.4k reads" bk="c3" excerptId={3} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        {/* The after-hours edit info card */}
        <div className="p-5 rounded-3xl bg-canvas-2 border border-line-2 space-y-4 shadow-xl">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-ink-muted font-mono">THE AFTER-HOURS EDIT</div>
            <div className="text-[11px] text-accent font-semibold mt-0.5">CURATED PUBLIC CHATS · OCT 12</div>
          </div>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Three small conversations with disproportionately big energy. Start with an allegedly quiet Friday.
          </p>
          <div className="space-y-2 pt-1 border-t border-line">
            <button
              onClick={() => onNavigate && onNavigate('Discover')}
              className="flex items-start gap-2 group cursor-pointer w-full text-left"
            >
              <span className="text-[11px] text-ink-faint font-mono shrink-0">01</span>
              <span className="text-[11px] text-ink-soft group-hover:text-white transition-colors">One drink, allegedly</span>
            </button>
            <button className="flex items-start gap-2 group cursor-pointer w-full text-left">
              <span className="text-[11px] text-ink-faint font-mono shrink-0">02</span>
              <span className="text-[11px] text-ink-soft group-hover:text-white transition-colors">Workplace extended universe</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('Topic detail', '#dating')}
              className="flex items-start gap-2 group cursor-pointer w-full text-left"
            >
              <span className="text-[11px] text-ink-faint font-mono shrink-0">03</span>
              <span className="text-[11px] text-ink-soft group-hover:text-white transition-colors">First-date interview</span>
            </button>
          </div>
        </div>

        {/* Editorial note */}
        <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 space-y-2">
          <div className="text-[11px] font-bold text-white">Editorial, not sponsored</div>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            These picks are organic public chats.{' '}
            <span
              onClick={() => onNavigate && onNavigate('After Hours sponsor detail')}
              className="text-accent hover:underline cursor-pointer font-medium"
            >
              After Hours sponsor content
            </span>{' '}
            is a separate, clearly labelled placement, not part of this edit.
          </p>
        </div>

        {/* Public chat. Private identity */}
        <div className="p-4 rounded-2xl bg-canvas-2 border border-line-2 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
            <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
              You can read and react, but never join the private conversation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
          <FooterLinks onNavigate={onNavigate} />
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}

export default App;
