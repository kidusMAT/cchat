import React from 'react';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Bookmark, 
  Plus, 
  Sliders, 
  ChevronRight, 
  Pin, 
  Folder, 
  Sparkles,
  Bot,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { CharacterPersona, ChatSession } from '../types';

interface SidebarProps {
  activeTab: 'chat' | 'characters' | 'settings' | 'branches';
  setActiveTab: (tab: 'chat' | 'characters' | 'settings' | 'branches') => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  characters: CharacterPersona[];
  selectedCharacterId: string;
  onSelectCharacter: (id: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  characters,
  selectedCharacterId,
  onSelectCharacter,
  isOpen,
  onCloseMobile
}) => {
  const selectedChar = characters.find(c => c.id === selectedCharacterId);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs" 
          onClick={onCloseMobile} 
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-40
        w-[280px] bg-[#09080e] border-r border-[#1e1c27]
        flex flex-col text-slate-300 select-none
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Header & Logo */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#1b1924]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-sm tracking-wider">
              CC
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">theCCHAT</span>
              <span className="ml-1.5 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                v2.5
              </span>
            </div>
          </div>

          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-[#161520]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: New Conversation */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-3 pb-2 flex gap-1 border-b border-[#181622]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#181724] text-white text-shadow shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#13121c]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chats</span>
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'characters'
                ? 'bg-[#181724] text-white text-shadow shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#13121c]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Personas</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#181724] text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#13121c]'
            }`}
            title="Configuration"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Session / Character List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {activeTab === 'chat' ? (
            <>
              <div className="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase text-slate-500 tracking-wider flex items-center justify-between">
                <span>Recent Conversations</span>
                <span className="text-[10px] bg-[#171522] px-1.5 py-0.5 rounded text-slate-400">
                  {sessions.length}
                </span>
              </div>

              {sessions.map((sess) => {
                const char = characters.find(c => c.id === sess.characterId);
                const isSelected = sess.id === currentSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => onSelectSession(sess.id)}
                    className={`group w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#151420] border-[#2b273d] text-white shadow-xs'
                        : 'border-transparent text-slate-400 hover:bg-[#111019] hover:text-slate-200'
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <img 
                        src={char?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'} 
                        alt={char?.name}
                        className="w-7 h-7 rounded-full object-cover border border-[#2b283b]" 
                      />
                      {sess.pinned && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <Pin className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold truncate text-slate-200 group-hover:text-white">
                          {sess.title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                        <span className="truncate">{char?.name || 'Persona'}</span>
                        <span className="shrink-0 text-[10px]">{sess.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : activeTab === 'characters' ? (
            <>
              <div className="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
                <span>Select Character</span>
              </div>
              {characters.map((char) => {
                const isSelected = char.id === selectedCharacterId;
                return (
                  <div
                    key={char.id}
                    onClick={() => onSelectCharacter(char.id)}
                    className={`w-full p-2.5 rounded-lg flex items-center gap-3 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#151420] border-blue-500/40 text-white'
                        : 'border-transparent text-slate-400 hover:bg-[#111019] hover:text-slate-200'
                    }`}
                  >
                    <img 
                      src={char.avatar} 
                      alt={char.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#2c293c]" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold truncate text-slate-200">{char.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{char.title}</p>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500"></span>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <div className="p-3 text-xs text-slate-400 space-y-3">
              <div className="font-semibold text-slate-300 text-xs">Environment Options</div>
              <div className="p-2.5 rounded-lg bg-[#12111b] border border-[#211f2e] space-y-2">
                <div className="text-[11px] text-slate-400">Renderer Profile</div>
                <div className="text-xs font-medium text-white flex items-center justify-between">
                  <span>Cyberpunk Low-glow</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Active Persona Banner at bottom */}
        {selectedChar && (
          <div className="p-3 border-t border-[#181622] bg-[#0c0b13]">
            <div className="flex items-center gap-2.5">
              <img 
                src={selectedChar.avatar} 
                alt={selectedChar.name}
                className="w-8 h-8 rounded-full object-cover border border-blue-500/40" 
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{selectedChar.name}</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ready to respond
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
