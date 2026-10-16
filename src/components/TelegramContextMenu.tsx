import React, { useEffect, useRef } from 'react';
import {
  Reply,
  Edit2,
  Pin,
  Copy,
  Forward,
  Trash2,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import { ChatMessage } from '../services/api';

const QUICK_REACTIONS = ['❤️', '👍', '😭', '👎', '🔥', '🥰', '👏'];

interface TelegramContextMenuProps {
  x: number;
  y: number;
  message: ChatMessage;
  isOwnMessage: boolean;
  onClose: () => void;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onPin: (message: ChatMessage) => void;
  onCopy: (message: ChatMessage) => void;
  onForward: (message: ChatMessage) => void;
  onDelete: (message: ChatMessage) => void;
  onReact: (message: ChatMessage, emoji: string) => void;
  onSelect?: (message: ChatMessage) => void;
}

export const TelegramContextMenu: React.FC<TelegramContextMenuProps> = ({
  x,
  y,
  message,
  isOwnMessage,
  onClose,
  onReply,
  onEdit,
  onPin,
  onCopy,
  onForward,
  onDelete,
  onReact,
  onSelect,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust coordinates so menu fits within screen boundaries
  const menuWidth = 220;
  const menuHeight = 310;
  const padding = 16;

  const adjustedX = Math.max(padding, Math.min(x, window.innerWidth - menuWidth - padding));
  const adjustedY = Math.max(padding, Math.min(y, window.innerHeight - menuHeight - padding));

  return (
    <div
      className="fixed inset-0 z-50 select-none overflow-hidden"
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        ref={menuRef}
        style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
        className="fixed z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Reactions Pill Bar matching Telegram exactly */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16212e]/95 backdrop-blur-md border border-[#26374a] shadow-xl w-fit">
          {QUICK_REACTIONS.map((emoji) => {
            const hasReacted = Boolean(
              message.quick_reactions &&
              message.quick_reactions[emoji] &&
              message.quick_reactions[emoji].length > 0
            );
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onReact(message, emoji);
                  onClose();
                }}
                className={`text-xl hover:scale-135 active:scale-95 transition-transform duration-150 p-1 cursor-pointer rounded-full ${
                  hasReacted ? 'bg-blue-600/30 ring-1 ring-blue-500' : ''
                }`}
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            );
          })}
          <div className="w-5 h-5 rounded-full bg-[#202f42] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer ml-0.5">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Telegram-style Dropdown Menu */}
        <div className="w-56 rounded-2xl bg-[#16212e]/95 backdrop-blur-md border border-[#26374a] shadow-2xl py-1.5 overflow-hidden text-slate-200">
          {/* Reply */}
          <button
            type="button"
            onClick={() => {
              onReply(message);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium hover:bg-[#202f42] hover:text-white transition-colors cursor-pointer text-left"
          >
            <Reply className="w-4 h-4 text-slate-400 shrink-0 stroke-[2.2]" />
            <span>Reply</span>
          </button>

          {/* Edit (Available only for own messages) */}
          {isOwnMessage && (
            <button
              type="button"
              onClick={() => {
                onEdit(message);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium hover:bg-[#202f42] hover:text-white transition-colors cursor-pointer text-left"
            >
              <Edit2 className="w-4 h-4 text-slate-400 shrink-0 stroke-[2.2]" />
              <span>Edit</span>
            </button>
          )}

          {/* Pin */}
          <button
            type="button"
            onClick={() => {
              onPin(message);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium hover:bg-[#202f42] hover:text-white transition-colors cursor-pointer text-left"
          >
            <Pin className="w-4 h-4 text-slate-400 shrink-0 stroke-[2.2]" />
            <span>Pin</span>
          </button>

          {/* Copy Text */}
          <button
            type="button"
            onClick={() => {
              onCopy(message);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium hover:bg-[#202f42] hover:text-white transition-colors cursor-pointer text-left"
          >
            <Copy className="w-4 h-4 text-slate-400 shrink-0 stroke-[2.2]" />
            <span>Copy Text</span>
          </button>

          {/* Forward */}
          <button
            type="button"
            onClick={() => {
              onForward(message);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium hover:bg-[#202f42] hover:text-white transition-colors cursor-pointer text-left"
          >
            <Forward className="w-4 h-4 text-slate-400 shrink-0 stroke-[2.2]" />
            <span>Forward</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => {
              onDelete(message);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-colors cursor-pointer text-left"
          >
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0 stroke-[2.2]" />
            <span>Delete</span>
          </button>

          {/* Select */}
          <button
            type="button"
            onClick={() => {
              if (onSelect) {
                onSelect(message);
              }
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium hover:bg-[#202f42] hover:text-white transition-colors cursor-pointer text-left border-t border-[#202f42]/70 mt-1"
          >
            <CheckCircle className="w-4 h-4 text-slate-400 shrink-0 stroke-[2.2]" />
            <span>Select</span>
          </button>
        </div>
      </div>
    </div>
  );
};
