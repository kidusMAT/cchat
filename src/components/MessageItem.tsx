import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Copy, 
  ThumbsUp, 
  RotateCw, 
  Share2, 
  MoreHorizontal, 
  GitBranch, 
  Check, 
  Clock, 
  Sparkles,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  onForkBranch?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  onToggleLike?: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onForkBranch,
  onRegenerate,
  onToggleLike
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAssistant = message.sender === 'assistant';
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const isNarrator = message.sender === 'narrator';

  // Specific styling matching Figma message tiles:
  // Assistant: Deep blue slate container with subtle glow (#142845, #0f1c30)
  // User: Deep plum / crimson container (#422036, #36182c)
  // Narrator: Warm amber tone (#3f2913, #4a3219)
  // System: Neutral slate border (#15141f)

  if (isSystem) {
    return (
      <div className="my-3 px-4 py-2.5 rounded-lg bg-[#12111b] border border-[#211f2e] text-xs text-slate-400 flex items-start gap-2.5 max-w-3xl mx-auto shadow-xs">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] mr-2">Scenario</span>
          {message.content}
        </div>
      </div>
    );
  }

  if (isNarrator) {
    return (
      <div className="my-3 px-4 py-3 rounded-xl bg-[#2e1c0d]/80 border border-[#543419] text-xs text-amber-200/90 flex items-start gap-3 max-w-3xl mx-auto shadow-sm shadow-amber-950/20">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{message.senderName}</div>
          <div className="leading-relaxed">{message.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative flex gap-3.5 my-4 max-w-4xl mx-auto ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="shrink-0">
        {message.avatar ? (
          <img 
            src={message.avatar} 
            alt={message.senderName} 
            className="w-8 h-8 rounded-full object-cover border border-[#2d293d] shadow-sm"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isUser 
              ? 'bg-gradient-to-tr from-purple-700 to-pink-600 text-white' 
              : 'bg-gradient-to-tr from-blue-700 to-indigo-600 text-white'
          }`}>
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
        )}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Name and Header Info */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-semibold text-slate-300">
            {message.senderName}
          </span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {message.timestamp}
          </span>
          {message.model && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#171624] text-slate-400 border border-[#262438]">
              {message.model}
            </span>
          )}
        </div>

        {/* Bubble Body with matching Figma palette */}
        <div className={`
          relative rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md transition-all
          ${isAssistant ? 'bg-[#12233c] border border-[#1e3a63] text-slate-100 rounded-tl-xs' : ''}
          ${isUser ? 'bg-[#3d1d32] border border-[#5c2a4c] text-rose-50 rounded-tr-xs' : ''}
        `}>
          <div className="whitespace-pre-wrap selection:bg-blue-500/30">
            {message.content}
          </div>

          {/* Tokens / stats footer if available */}
          {message.tokens && (
            <div className="mt-2 pt-1.5 border-t border-blue-400/10 flex items-center justify-between text-[10px] text-blue-300/70">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {message.tokens} tokens
              </span>
              <span>Speed: 42 t/s</span>
            </div>
          )}
        </div>

        {/* Message Action Toolbar (Hover Actions) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 mt-1 px-1">
          <button
            onClick={handleCopy}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#1a1827] transition-colors cursor-pointer"
            title="Copy message"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {isAssistant && onRegenerate && (
            <button
              onClick={() => onRegenerate(message.id)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#1a1827] transition-colors cursor-pointer"
              title="Regenerate response"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {onForkBranch && (
            <button
              onClick={() => onForkBranch(message.id)}
              className="p-1 text-slate-400 hover:text-blue-400 rounded hover:bg-[#1a1827] transition-colors cursor-pointer"
              title="Branch from this node"
            >
              <GitBranch className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleLike && (
            <button
              onClick={() => onToggleLike(message.id)}
              className={`p-1 rounded hover:bg-[#1a1827] transition-colors cursor-pointer ${
                message.liked ? 'text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Bookmark / Like"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
