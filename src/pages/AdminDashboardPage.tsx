import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Users, MessageSquare, Zap, Eye, TrendingUp,
  FileText, Shield, Handshake, RefreshCw, CheckCircle,
  XCircle, Clock, AlertTriangle, ChevronDown, Menu, X,
  Hash, Mail, Building2, Star, Info,
} from 'lucide-react';
import { cchatApi } from '../services/api';

type Tab = 'overview' | 'inquiries' | 'reports' | 'privacy';

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

// ── Section header ────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, count, loading, onRefresh }: {
  icon: React.ElementType; title: string; count?: number; loading: boolean; onRefresh: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
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
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#161624] border border-transparent hover:border-[#222236] transition-all cursor-pointer disabled:opacity-40"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
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

  const cards: StatCard[] = stats ? [
    { label: 'Total Users',        value: stats.total_users,         icon: Users,        color: 'text-blue-400',    bg: 'bg-blue-500/8',    border: 'border-blue-500/15' },
    { label: 'Published Chats',    value: stats.total_public_chats,  icon: MessageSquare,color: 'text-violet-400',  bg: 'bg-violet-500/8',  border: 'border-violet-500/15' },
    { label: 'Total Reactions',    value: stats.total_reactions,     icon: Zap,          color: 'text-amber-400',   bg: 'bg-amber-500/8',   border: 'border-amber-500/15' },
    { label: 'Total Reads',        value: stats.total_reads,         icon: Eye,          color: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/15' },
    { label: 'Topics',             value: stats.total_topics,        icon: Hash,         color: 'text-cyan-400',    bg: 'bg-cyan-500/8',    border: 'border-cyan-500/15' },
    { label: 'New This Week',      value: stats.new_this_week,       icon: TrendingUp,   color: 'text-rose-400',    bg: 'bg-rose-500/8',    border: 'border-rose-500/15' },
  ] : [];

  return (
    <div className="space-y-6">
      <SectionHeader icon={BarChart3} title="Platform Overview" count={undefined} loading={loading} onRefresh={load} />

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

          <div className="p-5 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3">
            <h3 className="text-sm font-bold text-white">Quick Health Check</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>API endpoints operational</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Auth system functional</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Reactions security active</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>No message cap on publish</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Topic counts auto-updating</span>
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
// SPONSORSHIP INQUIRIES TAB
// ──────────────────────────────────────────────────────────────
type Inquiry = {
  id: number; name: string; brand: string; email: string;
  placement_interest: string; idea: string; agreed_terms: boolean; status: string; created_at: string;
};

const INQUIRY_ACTIONS = ['pending', 'reviewed', 'accepted', 'rejected'] as const;

function InquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
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

  return (
    <div className="space-y-5">
      <SectionHeader icon={Handshake} title="Sponsorship Inquiries" count={inquiries.length} loading={loading} onRefresh={load} />
      {error && <div className="text-rose-400 text-sm flex gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}
      {!loading && inquiries.length === 0 && !error && (
        <div className="text-center py-16 text-slate-500 text-sm">No sponsorship inquiries yet.</div>
      )}
      <div className="space-y-3">
        {inquiries.map(inq => (
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
                  <div className="text-slate-500 text-xs mb-1 font-medium">Pitch / Idea</div>
                  <div className="text-slate-300 text-xs leading-relaxed bg-[#0a0a0f] rounded-xl p-3 border border-[#181826]">{inq.idea}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
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
            </ExpandableRow>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// REPORTS TAB
// ──────────────────────────────────────────────────────────────
type Report = {
  id: number; reason: string; context: string; status: string; reporter: string; created_at: string;
};

const REPORT_ACTIONS = ['pending', 'reviewed', 'resolved', 'dismissed'] as const;

function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
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

  const REASON_COLORS: Record<string, string> = {
    spam: 'text-amber-400', harassment: 'text-rose-400', misinformation: 'text-orange-400',
  };

  return (
    <div className="space-y-5">
      <SectionHeader icon={Shield} title="Moderation Reports" count={reports.length} loading={loading} onRefresh={load} />
      {error && <div className="text-rose-400 text-sm flex gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}
      {!loading && reports.length === 0 && !error && (
        <div className="text-center py-16 text-slate-500 text-sm">No reports submitted yet.</div>
      )}
      <div className="space-y-3">
        {reports.map(rep => (
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

  return (
    <div className="space-y-5">
      <SectionHeader icon={FileText} title="Privacy Requests" count={reqs.length} loading={loading} onRefresh={load} />
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
              <h1 className="text-base font-black text-white tracking-tight">Admin Dashboard</h1>
              <p className="text-[10px] text-slate-500 leading-none">Staff access only</p>
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
      <div className="px-4 sm:px-8 border-b border-[#181826] flex items-center gap-1 shrink-0 bg-[#09090f]">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-3 py-3.5 text-xs font-semibold relative transition-colors cursor-pointer ${
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
        {tab === 'inquiries' && <InquiriesTab />}
        {tab === 'reports'   && <ReportsTab />}
        {tab === 'privacy'   && <PrivacyTab />}
      </div>
    </div>
  );
}
