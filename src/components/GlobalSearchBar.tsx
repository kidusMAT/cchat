import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User, Hash, MessageSquare, ArrowRight } from 'lucide-react';
import { cchatApi, PublicExcerptItem, UserProfile } from '../services/api';

export interface GlobalSearchBarProps {
  onNavigate?: (nav: string, handleOrTopic?: any, extraParam?: any) => void;
  className?: string;
  placeholder?: string;
  initialQuery?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onNavigate,
  className = 'relative w-48 sm:w-64 md:w-80',
  placeholder = 'Search chats, people, plot twists',
  initialQuery = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    excerpts: PublicExcerptItem[];
    people: UserProfile[];
    topics: Array<{ id: number; tag: string; name: string; chats_count: number }>;
    total: number;
  }>({
    excerpts: [],
    people: [],
    topics: [],
    total: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize initialQuery if updated by parent
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setSearchTerm(initialQuery);
  }

  // Global keyboard shortcut: Ctrl+K / Cmd+K focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await cchatApi.unifiedSearch(trimmed);
        if (active) {
          setResults(data);
        }
      } catch (err) {
        console.warn('Search query error:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const activeResults = searchTerm.trim() ? results : { excerpts: [], people: [], topics: [], total: 0 };

  const handleCommitSearch = (queryToSearch: string) => {
    const finalQ = queryToSearch.trim();
    setIsOpen(false);
    inputRef.current?.blur();
    if (finalQ) {
      onNavigate?.('Search', finalQ);
    } else {
      onNavigate?.('Search');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitSearch(searchTerm);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const trendingTopics = [
    { tag: '#dating', name: 'First dates, red flags and awkward goodbyes' },
    { tag: '#roommatelore', name: 'Shared rent and unshared brain cells' },
    { tag: '#career', name: 'Slack receipts and exit interviews' },
    { tag: '#plot', name: 'Unfiltered plot twists from the archive' },
  ];

  return (
    <>
      {/* Mobile search button */}
      <button
        type="button"
        onClick={() => onNavigate?.('Search')}
        className="sm:hidden p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
        title="Search"
        aria-label="Open search"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Desktop interactive search container */}
      <div ref={containerRef} className={`${className} hidden sm:block relative z-40`}>
        <div className="relative">
          <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-14 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors shadow-sm"
          />

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading && <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />}
            {searchTerm && !loading && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-ink-faint hover:text-white rounded-full transition-colors cursor-pointer"
                title="Clear"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {!searchTerm && (
              <span className="text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong select-none">
                ⌘ K
              </span>
            )}
          </div>
        </div>

        {/* Live Search Results Dropdown Flyout */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[#0e1626]/98 backdrop-blur-xl border border-[#223147] rounded-2xl shadow-2xl overflow-hidden text-xs z-50 animate-in fade-in duration-150 divide-y divide-[#1e2a3c]">
            {/* If no query, show trending suggestions */}
            {!searchTerm.trim() ? (
              <div className="p-3 space-y-2">
                <div className="text-[10px] font-bold text-ink-faint uppercase tracking-wider px-1">
                  Trending Topics
                </div>
                <div className="space-y-1">
                  {trendingTopics.map((topic) => (
                    <div
                      key={topic.tag}
                      onClick={() => {
                        setIsOpen(false);
                        onNavigate?.('Topic detail', topic.tag);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Hash className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="font-semibold text-white group-hover:text-accent transition-colors truncate">
                          {topic.tag}
                        </span>
                        <span className="text-ink-faint text-[11px] truncate hidden md:inline">
                          — {topic.name}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-ink-faint group-hover:text-white transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto divide-y divide-[#182333]">
                {/* People Matches */}
                {activeResults.people.length > 0 && (
                  <div className="p-2.5">
                    <div className="text-[10px] font-bold text-ink-faint uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-cyan-400" />
                      <span>People</span>
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {activeResults.people.slice(0, 3).map((person) => (
                        <div
                          key={person.id}
                          onClick={() => {
                            setIsOpen(false);
                            onNavigate?.('Profile', person.handle);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          {person.avatar_url ? (
                            <img
                              src={person.avatar_url}
                              alt={person.display_name}
                              className="w-7 h-7 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center">
                              {person.display_name?.slice(0, 2).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-white group-hover:text-accent transition-colors truncate">
                              {person.display_name}
                            </div>
                            <div className="text-[10px] text-ink-faint truncate">
                              {person.handle}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topic Matches */}
                {activeResults.topics.length > 0 && (
                  <div className="p-2.5">
                    <div className="text-[10px] font-bold text-ink-faint uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                      <Hash className="w-3 h-3 text-cyan-400" />
                      <span>Topics</span>
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {activeResults.topics.slice(0, 3).map((topic) => (
                        <div
                          key={topic.id}
                          onClick={() => {
                            setIsOpen(false);
                            onNavigate?.('Topic detail', topic.tag);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="font-semibold text-accent truncate">
                              {topic.tag}
                            </div>
                            {topic.name && (
                              <div className="text-[10px] text-ink-faint truncate">
                                {topic.name}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-ink-faint font-mono shrink-0">
                            {topic.chats_count} chats
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Excerpt / Chat Matches */}
                {activeResults.excerpts.length > 0 && (
                  <div className="p-2.5">
                    <div className="text-[10px] font-bold text-ink-faint uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-cyan-400" />
                      <span>Public Chats</span>
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {activeResults.excerpts.slice(0, 4).map((excerpt) => (
                        <div
                          key={excerpt.id}
                          onClick={() => {
                            setIsOpen(false);
                            onNavigate?.('Discover', excerpt.id);
                          }}
                          className="p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <div className="font-medium text-white group-hover:text-accent transition-colors line-clamp-1">
                            {excerpt.title}
                          </div>
                          <div className="text-[10px] text-ink-faint flex items-center gap-2 mt-0.5">
                            {excerpt.topic?.tag && (
                              <span className="text-accent/90">{excerpt.topic.tag}</span>
                            )}
                            {excerpt.authors_summary && (
                              <span>by {excerpt.authors_summary}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zero State */}
                {activeResults.total === 0 && !loading && (
                  <div className="p-4 text-center text-ink-faint">
                    No immediate live matches for "{searchTerm}".
                  </div>
                )}
              </div>
            )}

            {/* Bottom Footer: Press Enter for full Search Page */}
            {searchTerm.trim() && (
              <button
                type="button"
                onClick={() => handleCommitSearch(searchTerm)}
                className="w-full p-2.5 bg-black/40 hover:bg-accent/15 transition-colors text-accent flex items-center justify-between text-xs font-semibold cursor-pointer group"
              >
                <span>See all results for "{searchTerm}"</span>
                <span className="flex items-center gap-1 text-[10px] text-ink-faint group-hover:text-accent">
                  <span>Enter</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
