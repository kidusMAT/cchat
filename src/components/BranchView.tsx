import React from 'react';
import { 
  GitBranch, 
  X, 
  MessageSquare, 
  ArrowRight, 
  ChevronRight, 
  Clock, 
  Plus,
  Play
} from 'lucide-react';
import { Message, ChatSession } from '../types';

interface BranchViewProps {
  isOpen: boolean;
  session: ChatSession;
  messages: Message[];
  onSelectBranchMessage: (msgId: string) => void;
  onClose: () => void;
}

export const BranchView: React.FC<BranchViewProps> = ({
  isOpen,
  session,
  messages,
  onSelectBranchMessage,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div 
        className="bg-[#0c0b12] border border-[#232034] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-[#1b1926]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Conversation Branch Explorer</h3>
              <p className="text-[11px] text-slate-400">Fork and explore alternative timeline outcomes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a1827] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tree Canvas */}
        <div className="flex-1 overflow-auto p-6 bg-[#08070d]">
          <div className="space-y-6 max-w-2xl mx-auto">
            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              const isAssistant = msg.sender === 'assistant';
              const isUser = msg.sender === 'user';

              return (
                <div key={msg.id} className="relative flex items-start gap-4 group">
                  {/* Vertical Connection Line */}
                  {!isLast && (
                    <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-[#1f1d2c] group-hover:bg-blue-500/40 transition-colors" />
                  )}

                  {/* Node Circle */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold shrink-0 transition-transform group-hover:scale-110 ${
                    isAssistant
                      ? 'bg-[#12233c] border-[#1e3a63] text-blue-400'
                      : isUser
                      ? 'bg-[#3d1d32] border-[#5c2a4c] text-rose-300'
                      : 'bg-[#181624] border-[#29263b] text-slate-400'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Node Content Card */}
                  <div 
                    onClick={() => onSelectBranchMessage(msg.id)}
                    className="flex-1 p-3.5 rounded-xl bg-[#11101a] border border-[#211f30] hover:border-blue-500/50 hover:bg-[#151422] transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{msg.senderName}</span>
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#181726] text-slate-400 group-hover:text-blue-400 border border-[#242136]">
                        Branch Node
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {msg.content}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#1a1827] flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Sequence point
                      </span>
                      <span className="text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Rollback here</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1b1926] bg-[#0c0b13] flex justify-between items-center text-xs text-slate-400">
          <span>Click any node to navigate back or fork a new alternative conversation stream.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
