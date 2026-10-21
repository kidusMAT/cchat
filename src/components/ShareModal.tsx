import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, ExternalLink, MessageCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export interface ShareData {
  title: string;
  url?: string;
  snippet?: string;
  authors?: string;
  tag?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareData | null;
}

export function ShareModal({ isOpen, onClose, data }: ShareModalProps) {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cchat.app';
  const shareUrl = data.url
    ? (data.url.startsWith('http') ? data.url : `${origin}${data.url}`)
    : window.location.href;

  const shareText = `"${data.title}" on CCHAT — The Plot is Public.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(true);
      success('Link copied!');
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or not supported
      }
    } else {
      handleCopy();
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-3xl bg-[#0e0e16] border border-[#242232] shadow-2xl p-6 overflow-hidden animate-modal-in z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Share Excerpt</h3>
              <p className="text-[11px] text-slate-400">Spread the plot with friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1928] transition-colors cursor-pointer"
            aria-label="Close share dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Excerpt Preview Card */}
        <div className="p-4 rounded-2xl bg-[#141320] border border-[#1f1d2c] space-y-2">
          {data.tag && (
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              {data.tag}
            </span>
          )}
          <h4 className="text-sm font-bold text-white line-clamp-1">{data.title}</h4>
          {data.snippet && (
            <p className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed">
              &ldquo;{data.snippet}&rdquo;
            </p>
          )}
          {data.authors && (
            <p className="text-[10px] text-slate-500">by {data.authors}</p>
          )}
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#12121e] border border-[#1f1e2e] hover:border-blue-500/40 hover:bg-[#161626] transition-all cursor-pointer group"
          >
            <span className="text-sm font-black text-white group-hover:text-blue-400">𝕏</span>
            <span className="text-[11px] font-medium text-slate-400">X (Twitter)</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#12121e] border border-[#1f1e2e] hover:border-emerald-500/40 hover:bg-[#161626] transition-all cursor-pointer group"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-medium text-slate-400">WhatsApp</span>
          </a>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#12121e] border border-[#1f1e2e] hover:border-sky-500/40 hover:bg-[#161626] transition-all cursor-pointer group"
          >
            <Send className="w-4 h-4 text-sky-400" />
            <span className="text-[11px] font-medium text-slate-400">Telegram</span>
          </a>
        </div>

        {/* Link Copy Box */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400">Direct Link</label>
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#09090f] border border-[#222133]">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={e => e.target.select()}
              className="bg-transparent px-3 py-1 text-xs text-slate-300 w-full focus:outline-hidden truncate"
            />
            <button
              onClick={handleCopy}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Native Web Share on Mobile */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-xl border border-[#232136] bg-[#141422] hover:bg-[#19182a] text-xs font-semibold text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            More Share Options
          </button>
        )}
      </div>
    </div>
  );
}
