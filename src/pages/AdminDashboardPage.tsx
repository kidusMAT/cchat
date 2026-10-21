import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Users, MessageSquare, Zap, Eye, TrendingUp,
  FileText, Shield, Handshake, RefreshCw, CheckCircle,
  XCircle, Clock, AlertTriangle, ChevronDown, Menu, X,
  Hash, Mail, Building2, Star, Info, Download, Radio,
  Sparkles, Copy, Check, ExternalLink, Send, Flame,
} from 'lucide-react';
import { cchatApi, BroadcastConfig } from '../services/api';
import { exportToCsv } from '../services/csvExport';

type Tab = 'overview' | 'broadcast' | 'inquiries' | 'reports' | 'privacy';

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

// ── Status badge ──────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-amber-500/10  border-amber-500/30  text-amber-400',
  reviewed:   'bg-blue-500/10   border-blue-500/30   text-blue-400',
  accepted:   'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  rejected:   'bg-rose-500/10   border-rose-500/30   text-rose-400',
  resolved:   'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  dismissed:  'bg-slate-500/10  border-slate-500/30  text-slate-400',
  received:   'bg-amber-500/10  border-amber-500/30  text-amber-400',
  in_review:  'bg-blue-500/10   border-blue-500/30   text-blue-400',
  processed:  'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLES[status] ?? 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

// ── Expandable row ────────────────────────────────────────────
function ExpandableRow({ children, expanded }: { children: React.ReactNode; expanded: boolean }) {
  return (
    <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
      {children}
    </div>
  );
}

// ── Section header with optional export ───────────────────────
function SectionHeader({ icon: Icon, title, count, loading, onRefresh, onExport, exportLabel }: {
  icon: React.ElementType;
  title: string;
  count?: number;
  loading: boolean;
  onRefresh: () => void;
  onExport?: () => void;
  exportLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#12121e] border border-[#1f1f32]">
          <Icon className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          {count !== undefined && (
            <p className="text-[11px] text-slate-500">{count} item{count !== 1 ? 's' : ''} total</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-lg transition-all cursor-pointer"
            title="Download formatted CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            {exportLabel || 'Export CSV'}
          </button>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#161624] border border-transparent hover:border-[#222236] transition-all cursor-pointer disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ──────────────────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState<{
    total_users: number; total_public_chats: number; total_reactions: number;
    total_reads: number; total_topics: number; new_this_week: number;
    reactions_breakdown?: { heart: number; cap: number; skull: number; fire: number };
    inquiries_summary?: { total: number; pending: number; reviewed: number; accepted: number; rejected: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await cchatApi.getAdminStats();
      setStats(data);
    } catch (e) {
      setError('Could not load stats. Make sure you are logged in as a staff user.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleExport = () => {
    if (!stats) return;
    const now = new Date().toISOString().slice(0, 10);
    const headers = ['Metric', 'Value', 'Category'];
    const rows = [
      ['Total Registered Users', stats.total_users, 'Audience'],
      ['Active Published Chats', stats.total_public_chats, 'Content'],
      ['Total Community Reactions', stats.total_reactions, 'Engagement'],
      ['Total Reads Count', stats.total_reads, 'Engagement'],
      ['Conversation Topics Count', stats.total_topics, 'Content'],
      ['New Stories This Week', stats.new_this_week, 'Growth'],
      ['Reaction: Hearts', stats.reactions_breakdown?.heart ?? 0, 'Sentiment'],
      ['Reaction: Caps (Doubt/Cap)', stats.reactions_breakdown?.cap ?? 0, 'Sentiment'],
      ['Reaction: Skulls (Dead)', stats.reactions_breakdown?.skull ?? 0, 'Sentiment'],
      ['Reaction: Fire (Lit)', stats.reactions_breakdown?.fire ?? 0, 'Sentiment'],
      ['Sponsor Inquiries Total', stats.inquiries_summary?.total ?? 0, 'Business'],
      ['Sponsor Deals Accepted', stats.inquiries_summary?.accepted ?? 0, 'Business'],
      ['Sponsor Deals Pending', stats.inquiries_summary?.pending ?? 0, 'Business'],
    ];
    exportToCsv(`cchat_platform_metrics_${now}`, headers, rows);
  };

  const cards: StatCard[] = stats ? [
    { label: 'Total Users',        value: stats.total_users,         icon: Users,        color: 'text-blue-400',    bg: 'bg-blue-500/8',    border: 'border-blue-500/15' },
    { label: 'Published Chats',    value: stats.total_public_chats,  icon: MessageSquare,color: 'text-violet-400',  bg: 'bg-violet-500/8',  border: 'border-violet-500/15' },
    { label: 'Total Reactions',    value: stats.total_reactions,     icon: Zap,          color: 'text-amber-400',   bg: 'bg-amber-500/8',   border: 'border-amber-500/15' },
    { label: 'Total Reads',        value: stats.total_reads,         icon: Eye,          color: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/15' },
    { label: 'Topics',             value: stats.total_topics,        icon: Hash,         color: 'text-cyan-400',    bg: 'bg-cyan-500/8',    border: 'border-cyan-500/15' },
    { label: 'New This Week',      value: stats.new_this_week,       icon: TrendingUp,   color: 'text-rose-400',    bg: 'bg-rose-500/8',    border: 'border-rose-500/15' },
  ] : [];

  const rx = stats?.reactions_breakdown;
  const totalRx = rx ? (rx.heart + rx.cap + rx.skull + rx.fire) : 0;
  const pct = (val: number) => totalRx > 0 ? Math.round((val / totalRx) * 100) : 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={BarChart3}
        title="Platform Overview"
        loading={loading}
        onRefresh={load}
        onExport={stats ? handleExport : undefined}
        exportLabel="Export Overview CSV"
      />

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/8 border border-rose-500/20 text-rose-300 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {loading && !stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#0f0f18] border border-[#1a1a28] animate-pulse" />
          ))}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cards.map(({ label, value, icon: Icon, color, bg, border }) => (
              <div key={label} className={`p-5 rounded-2xl ${bg} border ${border} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{label}</span>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className={`text-3xl font-black ${color}`}>
                  {typeof value === 'number' && value >= 1000
                    ? `${(value / 1000).toFixed(1).replace('.0', '')}k`
                    : value}
                </div>
              </div>
            ))}
          </div>

          {/* Reaction Culture Meter */}
          {rx && (
            <div className="p-5 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    Reaction Culture & Community Vibes
                  </h3>
                  <p className="text-xs text-slate-500">Live sentiment distribution across public dialogue excerpts</p>
                </div>
                <span className="text-xs font-semibold text-slate-400">{totalRx.toLocaleString()} reactions total</span>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full bg-[#161622] rounded-full overflow-hidden flex">
                <div style={{ width: `${pct(rx.heart)}%` }} className="bg-rose-500 transition-all duration-500" title={`Heart: ${pct(rx.heart)}%`} />
                <div style={{ width: `${pct(rx.cap)}%` }} className="bg-blue-500 transition-all duration-500" title={`Cap: ${pct(rx.cap)}%`} />
                <div style={{ width: `${pct(rx.skull)}%` }} className="bg-slate-300 transition-all duration-500" title={`Skull: ${pct(rx.skull)}%`} />
                <div style={{ width: `${pct(rx.fire)}%` }} className="bg-amber-500 transition-all duration-500" title={`Fire: ${pct(rx.fire)}%`} />
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-rose-300 font-semibold">❤️ Hearts (Real)</div>
                    <div className="text-lg font-black text-rose-400">{rx.heart.toLocaleString()}</div>
                  </div>
                  <span className="text-xs font-bold text-rose-400/80">{pct(rx.heart)}%</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-blue-300 font-semibold">🧢 Caps (Doubt)</div>
                    <div className="text-lg font-black text-blue-400">{rx.cap.toLocaleString()}</div>
                  </div>
                  <span className="text-xs font-bold text-blue-400/80">{pct(rx.cap)}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-400/5 border border-slate-400/15 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-300 font-semibold">💀 Skulls (Dead)</div>
                    <div className="text-lg font-black text-slate-200">{rx.skull.toLocaleString()}</div>
                  </div>
                  <span className="text-xs font-bold text-slate-300/80">{pct(rx.skull)}%</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-amber-300 font-semibold">🔥 Fires (Lit)</div>
                    <div className="text-lg font-black text-amber-400">{rx.fire.toLocaleString()}</div>
                  </div>
                  <span className="text-xs font-bold text-amber-400/80">{pct(rx.fire)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Health Check */}
          <div className="p-5 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3">
            <h3 className="text-sm font-bold text-white">Platform Health & Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>API endpoints operational</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Auth token security active</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Reactions boundary protected</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Zero message cap on publish</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Broadcast engine ready</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <Info className="w-3.5 h-3.5" />
                <span>Django admin at /admin/</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// BROADCAST ANNOUNCEMENTS TAB
// ──────────────────────────────────────────────────────────────
function BroadcastTab() {
  const [broadcast, setBroadcast] = useState<BroadcastConfig>({
    is_active: false,
    badge_text: 'ANNOUNCEMENT',
    message: 'Welcome to CCHAT — The Plot is Public!',
    style_variant: 'violet',
    action_label: "Explore Tonight's Picks",
    action_url: '/tonight',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await cchatApi.getAdminBroadcast();
      setBroadcast(data);
    } catch {
      setError('Could not load current broadcast banner.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const updated = await cchatApi.updateAdminBroadcast(broadcast);
      setBroadcast(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError('Failed to update broadcast banner.');
    } finally {
      setSaving(false);
    }
  };

  const THEMES: Array<{
    id: BroadcastConfig['style_variant'];
    name: string;
    preview: string;
    badgeStyle: string;
    borderStyle: string;
  }> = [
    { id: 'violet', name: 'Neon Violet', preview: 'bg-violet-950/80 border-violet-500/30 text-violet-200', badgeStyle: 'bg-violet-500/20 text-violet-300 border-violet-500/40', borderStyle: 'border-violet-500' },
    { id: 'cyan', name: 'Electric Cyan', preview: 'bg-cyan-950/80 border-cyan-500/30 text-cyan-200', badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', borderStyle: 'border-cyan-500' },
    { id: 'amber', name: 'Sunset Ember', preview: 'bg-amber-950/80 border-amber-500/30 text-amber-200', badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40', borderStyle: 'border-amber-500' },
    { id: 'emerald', name: 'Emerald Green', preview: 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200', badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', borderStyle: 'border-emerald-500' },
  ];

  const currentTheme = THEMES.find(t => t.id === broadcast.style_variant) || THEMES[0];

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionHeader
        icon={Radio}
        title="Live Broadcast & Announcement Banner"
        loading={loading}
        onRefresh={load}
      />

      <p className="text-xs text-slate-400 -mt-2">
        Publish platform-wide announcements, event alerts, or sponsor drops directly to all users at the top of the site without deploying code.
      </p>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Broadcast updated successfully! The banner is now {broadcast.is_active ? 'LIVE across CCHAT' : 'turned off'}.
        </div>
      )}

      {/* Live Preview Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            Live Preview (How visitors will see it)
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${broadcast.is_active ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-500/10 border-slate-500/30 text-slate-400'}`}>
            {broadcast.is_active ? '● LIVE' : '○ DRAFT / INACTIVE'}
          </span>
        </div>

        <div className={`p-3.5 rounded-xl border ${currentTheme.preview} flex items-center justify-between gap-3 shadow-lg relative overflow-hidden`}>
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${currentTheme.badgeStyle}`}>
              <Sparkles className="w-3 h-3" />
              {broadcast.badge_text || 'ANNOUNCEMENT'}
            </span>
            <p className="truncate font-medium text-xs sm:text-sm text-white">
              {broadcast.message || 'Enter your message below...'}
            </p>
          </div>
          {broadcast.action_label && (
            <div className="shrink-0">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20 shadow-xs">
                {broadcast.action_label} →
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-5">
        {/* Active Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#141422] border border-[#222238]">
          <div>
            <div className="text-sm font-bold text-white">Enable Live Broadcast</div>
            <p className="text-xs text-slate-400">When enabled, the announcement appears at the top of every screen.</p>
          </div>
          <button
            type="button"
            onClick={() => setBroadcast(b => ({ ...b, is_active: !b.is_active }))}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer border ${broadcast.is_active ? 'bg-emerald-600 border-emerald-500' : 'bg-[#222234] border-[#333348]'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${broadcast.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Badge & Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Badge Tag Label
            </label>
            <input
              type="text"
              value={broadcast.badge_text}
              onChange={e => setBroadcast(b => ({ ...b, badge_text: e.target.value }))}
              placeholder="e.g. TONIGHT, PROMO, HOT, UPDATE"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a10] border border-[#222234] text-white text-xs focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Color Style Variant
            </label>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setBroadcast(b => ({ ...b, style_variant: t.id }))}
                  className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                    broadcast.style_variant === t.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-[#0a0a10] border-[#222234] text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${t.id === 'violet' ? 'bg-violet-400' : t.id === 'cyan' ? 'bg-cyan-400' : t.id === 'amber' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Announcement Message
            </label>
            <span className="text-[10px] text-slate-500">{broadcast.message.length}/300</span>
          </div>
          <textarea
            rows={2}
            maxLength={300}
            value={broadcast.message}
            onChange={e => setBroadcast(b => ({ ...b, message: e.target.value }))}
            placeholder="e.g. Tonight's featured dialogue excerpt is now live! Read and react now."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a10] border border-[#222234] text-white text-xs focus:outline-hidden focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {/* Action Link Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Action Button Label (Optional)
            </label>
            <input
              type="text"
              value={broadcast.action_label}
              onChange={e => setBroadcast(b => ({ ...b, action_label: e.target.value }))}
              placeholder="e.g. Read Tonight's Pick"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a10] border border-[#222234] text-white text-xs focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Action Target Link or Route
            </label>
            <input
              type="text"
              value={broadcast.action_url}
              onChange={e => setBroadcast(b => ({ ...b, action_url: e.target.value }))}
              placeholder="e.g. /tonight, /after-hours, /discover"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a10] border border-[#222234] text-white text-xs focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Saving Broadcast...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Save & Publish Broadcast
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SPONSORSHIP INQUIRIES TAB (ENHANCED CRM & CSV EXPORT)
// ──────────────────────────────────────────────────────────────
type Inquiry = {
  id: number; name: string; brand: string; email: string;
  placement_interest: string; idea: string; agreed_terms: boolean; status: string; created_at: string;
};

const INQUIRY_ACTIONS = ['pending', 'reviewed', 'accepted', 'rejected'] as const;

function InquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setInquiries(await cchatApi.getAdminInquiries()); }
    catch { setError('Failed to load inquiries.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await cchatApi.patchInquiry(id, status);
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    } catch { /* ignore */ } finally { setUpdating(null); }
  };

  const handleCopyEmail = (id: number, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    const now = new Date().toISOString().slice(0, 10);
    const headers = ['Inquiry ID', 'Brand', 'Contact Name', 'Email', 'Placement Interest', 'Pitch Idea', 'Agreed to Terms', 'Status', 'Submitted Date'];
    const rows = inquiries.map(inq => [
      inq.id,
      inq.brand,
      inq.name,
      inq.email,
      inq.placement_interest,
      inq.idea,
      inq.agreed_terms ? 'Yes' : 'No',
      inq.status,
      new Date(inq.created_at).toLocaleString(),
    ]);
    exportToCsv(`cchat_sponsorship_leads_${now}`, headers, rows);
  };

  const filteredInquiries = statusFilter === 'all'
    ? inquiries
    : inquiries.filter(i => i.status.toLowerCase() === statusFilter.toLowerCase());

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={Handshake}
        title="Sponsorship Inquiries & Brand Leads"
        count={inquiries.length}
        loading={loading}
        onRefresh={load}
        onExport={inquiries.length > 0 ? handleExportCsv : undefined}
        exportLabel="Export Leads (.csv)"
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {['all', 'pending', 'reviewed', 'accepted', 'rejected'].map(st => {
          const count = st === 'all' ? inquiries.length : inquiries.filter(i => i.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === st
                  ? 'bg-blue-600/20 border-blue-500/50 text-white'
                  : 'bg-[#0f0f18] border-[#1f1f2e] text-slate-400 hover:text-white'
              }`}
            >
              <span>{st.charAt(0).toUpperCase() + st.slice(1)}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-slate-300">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error && <div className="text-rose-400 text-sm flex gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}
      {!loading && filteredInquiries.length === 0 && !error && (
        <div className="text-center py-16 text-slate-500 text-sm">
          {statusFilter === 'all' ? 'No sponsorship inquiries yet.' : `No inquiries marked as "${statusFilter}".`}
        </div>
      )}

      <div className="space-y-3">
        {filteredInquiries.map(inq => (
          <div key={inq.id} className="rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] overflow-hidden">
            {/* Row header */}
            <button
              onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#141420] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#161628] border border-[#222236] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{inq.brand}</div>
                  <div className="text-[11px] text-slate-500 truncate">{inq.name} · {inq.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <StatusBadge status={inq.status} />
                <span className="text-[10px] text-slate-600">{new Date(inq.created_at).toLocaleDateString()}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expanded === inq.id ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Expanded detail */}
            <ExpandableRow expanded={expanded === inq.id}>
              <div className="px-5 pb-5 border-t border-[#181826] pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500 mb-1 font-medium">Placement Interest</div>
                    <div className="text-slate-200">{inq.placement_interest}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1 font-medium">Agreed to Terms</div>
                    <div className={inq.agreed_terms ? 'text-emerald-400' : 'text-rose-400'}>
                      {inq.agreed_terms ? 'Yes ✓' : 'No ✗'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-xs mb-1 font-medium">Pitch / Collaboration Idea</div>
                  <div className="text-slate-300 text-xs leading-relaxed bg-[#0a0a0f] rounded-xl p-3 border border-[#181826]">{inq.idea}</div>
                </div>

                {/* Quick actions row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#151520]">
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${inq.email}?subject=CCHAT%20Sponsorship%20Inquiry%20-%20${encodeURIComponent(inq.brand)}`}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Reply via Email
                    </a>
                    <button
                      onClick={() => handleCopyEmail(inq.id, inq.email)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#141420] border border-[#222234] text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === inq.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === inq.id ? 'Copied!' : 'Copy Email'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Status:</span>
                    {INQUIRY_ACTIONS.map(s => (
                      <button
                        key={s}
                        disabled={updating === inq.id || inq.status === s}
                        onClick={() => handleStatus(inq.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer disabled:opacity-40 ${
                          inq.status === s
                            ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                            : 'bg-[#141420] border-[#222234] text-slate-400 hover:text-white hover:border-[#333348]'
                        }`}
                      >
                        {updating === inq.id ? '...' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ExpandableRow>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// REPORTS TAB (WITH CSV EXPORT & STATUS FILTER)
// ──────────────────────────────────────────────────────────────
type Report = {
  id: number; reason: string; context: string; status: string; reporter: string; created_at: string;
};

const REPORT_ACTIONS = ['pending', 'reviewed', 'resolved', 'dismissed'] as const;

function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setReports(await cchatApi.getAdminReports()); }
    catch { setError('Failed to load reports.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await cchatApi.patchReport(id, status);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch { /* ignore */ } finally { setUpdating(null); }
  };

  const handleExportCsv = () => {
    const now = new Date().toISOString().slice(0, 10);
    const headers = ['Report ID', 'Reason', 'Context', 'Reporter', 'Status', 'Date Submitted'];
    const rows = reports.map(r => [
      r.id,
      r.reason,
      r.context,
      r.reporter,
      r.status,
      new Date(r.created_at).toLocaleString(),
    ]);
    exportToCsv(`cchat_moderation_reports_${now}`, headers, rows);
  };

  const REASON_COLORS: Record<string, string> = {
    spam: 'text-amber-400', harassment: 'text-rose-400', misinformation: 'text-orange-400',
  };

  const filteredReports = statusFilter === 'all'
    ? reports
    : reports.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={Shield}
        title="Moderation & Safety Reports"
        count={reports.length}
        loading={loading}
        onRefresh={load}
        onExport={reports.length > 0 ? handleExportCsv : undefined}
        exportLabel="Export Reports (.csv)"
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {['all', 'pending', 'reviewed', 'resolved', 'dismissed'].map(st => {
          const count = st === 'all' ? reports.length : reports.filter(r => r.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === st
                  ? 'bg-blue-600/20 border-blue-500/50 text-white'
                  : 'bg-[#0f0f18] border-[#1f1f2e] text-slate-400 hover:text-white'
              }`}
            >
              <span>{st.charAt(0).toUpperCase() + st.slice(1)}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-slate-300">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error && <div className="text-rose-400 text-sm flex gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}
      {!loading && filteredReports.length === 0 && !error && (
        <div className="text-center py-16 text-slate-500 text-sm">
          {statusFilter === 'all' ? 'No reports submitted yet.' : `No reports with status "${statusFilter}".`}
        </div>
      )}

      <div className="space-y-3">
        {filteredReports.map(rep => (
          <div key={rep.id} className="rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === rep.id ? null : rep.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#141420] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#1a1015] border border-[#2d1520] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-bold truncate ${REASON_COLORS[rep.reason.toLowerCase()] ?? 'text-slate-200'}`}>
                    {rep.reason}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">by {rep.reporter}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <StatusBadge status={rep.status} />
                <span className="text-[10px] text-slate-600">{new Date(rep.created_at).toLocaleDateString()}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expanded === rep.id ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <ExpandableRow expanded={expanded === rep.id}>
              <div className="px-5 pb-5 border-t border-[#181826] pt-4 space-y-4">
                <div>
                  <div className="text-slate-500 text-xs mb-1 font-medium">Context / Details</div>
                  <div className="text-slate-300 text-xs leading-relaxed bg-[#0a0a0f] rounded-xl p-3 border border-[#181826]">{rep.context}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {REPORT_ACTIONS.map(s => (
                    <button
                      key={s}
                      disabled={updating === rep.id || rep.status === s}
                      onClick={() => handleStatus(rep.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer disabled:opacity-40 ${
                        rep.status === s
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                          : 'bg-[#141420] border-[#222234] text-slate-400 hover:text-white hover:border-[#333348]'
                      }`}
                    >
                      {updating === rep.id ? '...' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </ExpandableRow>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// PRIVACY REQUESTS TAB
// ──────────────────────────────────────────────────────────────
type PrivacyReq = {
  id: number; name: string; email: string; request_type: string;
  details: string; status: string; created_at: string;
};

const PRIVACY_ACTIONS = ['received', 'in_review', 'processed', 'rejected'] as const;

function PrivacyTab() {
  const [reqs, setReqs] = useState<PrivacyReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setReqs(await cchatApi.getAdminPrivacyRequests()); }
    catch { setError('Failed to load privacy requests.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await cchatApi.patchPrivacyRequest(id, status);
      setReqs(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch { /* ignore */ } finally { setUpdating(null); }
  };

  const handleExportCsv = () => {
    const now = new Date().toISOString().slice(0, 10);
    const headers = ['Request ID', 'Type', 'Name', 'Email', 'Details', 'Status', 'Date'];
    const rows = reqs.map(r => [
      r.id,
      r.request_type,
      r.name || 'Anonymous',
      r.email,
      r.details,
      r.status,
      new Date(r.created_at).toLocaleString(),
    ]);
    exportToCsv(`cchat_privacy_requests_${now}`, headers, rows);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={FileText}
        title="Privacy & Data Requests (GDPR/CCPA)"
        count={reqs.length}
        loading={loading}
        onRefresh={load}
        onExport={reqs.length > 0 ? handleExportCsv : undefined}
        exportLabel="Export Privacy CSV"
      />
      {error && <div className="text-rose-400 text-sm flex gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}
      {!loading && reqs.length === 0 && !error && (
        <div className="text-center py-16 text-slate-500 text-sm">No privacy requests submitted yet.</div>
      )}
      <div className="space-y-3">
        {reqs.map(req => (
          <div key={req.id} className="rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === req.id ? null : req.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#141420] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#10182a] border border-[#182845] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{req.request_type}</div>
                  <div className="text-[11px] text-slate-500 truncate">{req.name || 'Anonymous'} · {req.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <StatusBadge status={req.status} />
                <span className="text-[10px] text-slate-600">{new Date(req.created_at).toLocaleDateString()}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expanded === req.id ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <ExpandableRow expanded={expanded === req.id}>
              <div className="px-5 pb-5 border-t border-[#181826] pt-4 space-y-4">
                <div>
                  <div className="text-slate-500 text-xs mb-1 font-medium">Details / Request</div>
                  <div className="text-slate-300 text-xs leading-relaxed bg-[#0a0a0f] rounded-xl p-3 border border-[#181826]">{req.details}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRIVACY_ACTIONS.map(s => (
                    <button
                      key={s}
                      disabled={updating === req.id || req.status === s}
                      onClick={() => handleStatus(req.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer disabled:opacity-40 ${
                        req.status === s
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                          : 'bg-[#141420] border-[#222234] text-slate-400 hover:text-white hover:border-[#333348]'
                      }`}
                    >
                      {updating === req.id ? '...' : s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </ExpandableRow>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// MAIN ADMIN DASHBOARD PAGE
// ──────────────────────────────────────────────────────────────
interface AdminDashboardPageProps {
  onNavigate?: (nav: string) => void;
  onOpenMenu?: () => void;
}

export function AdminDashboardPage({ onNavigate, onOpenMenu }: AdminDashboardPageProps) {
  const [tab, setTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview',   label: 'Overview',    icon: BarChart3   },
    { id: 'broadcast',  label: 'Broadcast',   icon: Radio       },
    { id: 'inquiries',  label: 'Sponsorship', icon: Handshake   },
    { id: 'reports',    label: 'Reports',     icon: Shield      },
    { id: 'privacy',    label: 'Privacy',     icon: FileText    },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#09090f] h-full overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#09090f]/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#161624] transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20">
              <Star className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight">Owner & Admin Command Center</h1>
              <p className="text-[10px] text-slate-500 leading-none">Management suite & live platform controls</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Systems operational
          </span>
        </div>
      </header>

      {/* ── Tab nav ────────────────────────────────────────────── */}
      <div className="px-4 sm:px-8 border-b border-[#181826] flex items-center gap-1 shrink-0 bg-[#09090f] overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-3 py-3.5 text-xs font-semibold relative transition-colors cursor-pointer shrink-0 ${
              tab === id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {tab === id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        {tab === 'overview'  && <OverviewTab />}
        {tab === 'broadcast' && <BroadcastTab />}
        {tab === 'inquiries' && <InquiriesTab />}
        {tab === 'reports'   && <ReportsTab />}
        {tab === 'privacy'   && <PrivacyTab />}
      </div>
    </div>
  );
}
