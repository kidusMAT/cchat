import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles, AlertCircle, Flame, CheckCircle2 } from 'lucide-react';
import { BroadcastConfig } from '../services/api';

interface BroadcastBannerProps {
  broadcast: BroadcastConfig | null;
  onNavigate?: (nav: string, topicOrHandle?: string) => void;
}

const STYLES: Record<string, {
  container: string;
  badge: string;
  btn: string;
  glow: string;
  Icon: React.ElementType;
}> = {
  violet: {
    container: 'bg-gradient-to-r from-violet-950/90 via-[#181028]/95 to-indigo-950/90 border-violet-500/30 text-violet-100',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    btn: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20',
    glow: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
    Icon: Sparkles,
  },
  cyan: {
    container: 'bg-gradient-to-r from-cyan-950/90 via-[#0a1c24]/95 to-blue-950/90 border-cyan-500/30 text-cyan-100',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    btn: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20',
    glow: 'from-cyan-500/20 via-sky-500/10 to-transparent',
    Icon: Sparkles,
  },
  amber: {
    container: 'bg-gradient-to-r from-amber-950/90 via-[#261708]/95 to-orange-950/90 border-amber-500/30 text-amber-100',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20',
    glow: 'from-amber-500/20 via-orange-500/10 to-transparent',
    Icon: Flame,
  },
  emerald: {
    container: 'bg-gradient-to-r from-emerald-950/90 via-[#0a1e16]/95 to-teal-950/90 border-emerald-500/30 text-emerald-100',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20',
    glow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    Icon: CheckCircle2,
  },
};

export function BroadcastBanner({ broadcast, onNavigate }: BroadcastBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!broadcast || !broadcast.is_active) return;
    const sessionKey = `cchat_dismissed_broadcast_${broadcast.updated_at || broadcast.id || broadcast.message}`;
    if (sessionStorage.getItem(sessionKey) === 'true') {
      setDismissed(true);
    } else {
      setDismissed(false);
    }
  }, [broadcast]);

  if (!broadcast || !broadcast.is_active || !broadcast.message || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    const sessionKey = `cchat_dismissed_broadcast_${broadcast.updated_at || broadcast.id || broadcast.message}`;
    sessionStorage.setItem(sessionKey, 'true');
  };

  const handleActionClick = () => {
    if (!broadcast.action_url) return;
    if (broadcast.action_url.startsWith('http')) {
      window.open(broadcast.action_url, '_blank', 'noopener,noreferrer');
    } else if (onNavigate) {
      const url = broadcast.action_url.toLowerCase();
      if (url.includes('tonight')) onNavigate("Tonight's picks");
      else if (url.includes('after-hours') || url.includes('sponsor')) onNavigate('After Hours');
      else if (url.includes('rules')) onNavigate('Community rules');
      else if (url.includes('about')) onNavigate('About CCHAT');
      else if (url.includes('fresh')) onNavigate('Fresh');
      else if (url.includes('discover')) onNavigate('Discover');
      else window.location.href = broadcast.action_url;
    } else {
      window.location.href = broadcast.action_url;
    }
  };

  const styleConfig = STYLES[broadcast.style_variant] || STYLES.violet;
  const StyleIcon = styleConfig.Icon;

  return (
    <div className={`relative border-b ${styleConfig.container} backdrop-blur-md px-4 py-2.5 sm:px-6 transition-all duration-300 z-30`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${styleConfig.glow} pointer-events-none opacity-60`} />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm relative">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${styleConfig.badge}`}>
            <StyleIcon className="w-3 h-3" />
            {broadcast.badge_text || 'ANNOUNCEMENT'}
          </span>
          <p className="truncate font-medium text-slate-100 text-xs sm:text-[13px]">
            {broadcast.message}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {broadcast.action_label && (
            <button
              onClick={handleActionClick}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${styleConfig.btn}`}
            >
              <span>{broadcast.action_label}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
