import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MessageSquare,
  Sparkles,
  Flame,
  Bookmark,
  Hash,
  User,
  Shield,
  Handshake,
  Compass,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Topics' | 'People' | 'Quick Actions';
  icon: React.ElementType;
  hint?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (nav: string, topicOrHandle?: string) => void;
  isStaff?: boolean;
}

export function CommandPalette({ isOpen, onClose, onNavigate, isStaff }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const ITEMS: PaletteItem[] = [
    // Navigation
    {
      id: 'nav-discover',
      title: 'Discover Feed',
      category: 'Navigation',
      icon: Compass,
      hint: 'Explore public excerpts',
      action: () => onNavigate('Discover'),
    },
    {
      id: 'nav-tonight',
      title: "Tonight's Picks",
      category: 'Navigation',
      icon: Sparkles,
      hint: 'Curated dialogue highlights',
      action: () => onNavigate("Tonight's picks"),
    },
    {
      id: 'nav-fresh',
      title: 'Fresh Stories',
      category: 'Navigation',
      icon: Clock,
      hint: 'Latest community drops',
      action: () => onNavigate('Fresh'),
    },
    {
      id: 'nav-chats',
      title: 'My Inboxes & Chats',
      category: 'Navigation',
      icon: MessageSquare,
      hint: 'Private conversations',
      action: () => onNavigate('My chats'),
    },
    {
      id: 'nav-saved',
      title: 'Saved Excerpts',
      category: 'Navigation',
      icon: Bookmark,
      hint: 'Your bookmarked stories',
      action: () => onNavigate('Saved'),
    },
    {
      id: 'nav-sponsor',
      title: 'After Hours Sponsorship',
      category: 'Navigation',
      icon: Handshake,
      hint: 'Brand placement details',
      action: () => onNavigate('After Hours'),
    },
    ...(isStaff ? [{
      id: 'nav-admin',
      title: 'Owner & Admin Command Center',
      category: 'Navigation' as const,
      icon: Shield,
      hint: 'Broadcasts, CRM & analytics',
      action: () => onNavigate('Admin'),
    }] : []),

    // Topics
    {
      id: 'topic-dating',
      title: '#dating',
      category: 'Topics',
      icon: Hash,
      hint: 'Filter conversations by #dating',
      action: () => onNavigate('Topic detail', '#dating'),
    },
    {
      id: 'topic-career',
      title: '#career',
      category: 'Topics',
      icon: Hash,
      hint: 'Filter conversations by #career',
      action: () => onNavigate('Topic detail', '#career'),
    },
    {
      id: 'topic-roommates',
      title: '#roommates',
      category: 'Topics',
      icon: Hash,
      hint: 'Filter conversations by #roommates',
      action: () => onNavigate('Topic detail', '#roommates'),
    },
    {
      id: 'topic-confessions',
      title: '#confessions',
      category: 'Topics',
      icon: Hash,
      hint: 'Filter conversations by #confessions',
      action: () => onNavigate('Topic detail', '#confessions'),
    },

    // People
    {
      id: 'person-maya',
      title: 'Maya Lin (@mayamaybe)',
      category: 'People',
      icon: User,
      hint: 'View creator profile',
      action: () => onNavigate('Profile', '@mayamaybe'),
    },
    {
      id: 'person-jules',
      title: 'Jules Vance (@jules)',
      category: 'People',
      icon: User,
      hint: 'View creator profile',
      action: () => onNavigate('Profile', '@jules'),
    },
    {
      id: 'person-leo',
      title: 'Leo Sterling (@leo)',
      category: 'People',
      icon: User,
      hint: 'View creator profile',
      action: () => onNavigate('Profile', '@leo'),
    },
  ];

  const filteredItems = query.trim() === ''
    ? ITEMS
    : ITEMS.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        (item.hint && item.hint.toLowerCase().includes(query.toLowerCase()))
      );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0b0b12] border border-[#232236] shadow-2xl shadow-blue-950/40 overflow-hidden animate-modal-in z-10 flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1c1b2c] shrink-0 bg-[#0e0e18]">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a destination, topic, or creator (e.g. #dating, Maya, Tonight)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[#161524] border border-[#2a2840] text-[10px] text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching destinations found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-xs'
                      : 'text-slate-300 hover:bg-[#131220] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-blue-500 text-white' : 'bg-[#151424] text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-full bg-black/40 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      {item.hint && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.hint}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 ml-2 animate-pulse" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-5 py-2.5 border-t border-[#191828] bg-[#09090f] flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#161524] border border-[#232136] text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[#161524] border border-[#232136] text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#161524] border border-[#232136] text-[10px]">↵</kbd>
              Select
            </span>
          </div>
          <span>CCHAT Spotlight</span>
        </div>
      </div>
    </div>
  );
}
