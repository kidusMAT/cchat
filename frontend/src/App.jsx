/* Hallmark · macrostructure: Marquee + live index · tone: tactile editorial · anchor hue: hot-pink */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Bookmark, ChevronRight, Eye, EyeOff, Flame, Flag, Heart, LogOut, Menu, Mic, Moon, Paperclip, Pause, Play, Search, Send, Skull, Sparkles, Square, Sun, Trash2, Users, X } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import SettingsPage from './Settings.jsx';
import './index.css';

function VoiceMessagePlayer({ src, text }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="voice-player" onClick={(e) => e.stopPropagation()}>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrentTime(0); }}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
      />
      <button
        type="button"
        className="voice-play-btn"
        onClick={togglePlay}
        aria-label={playing ? 'Pause voice message' : 'Play voice message'}
      >
        {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} />}
      </button>
      <div
        className="voice-track"
        onClick={(e) => {
          if (!audioRef.current || !duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const pct = Math.max(0, Math.min(1, clickX / rect.width));
          audioRef.current.currentTime = pct * duration;
        }}
      >
        <div className="voice-progress" style={{ width: `${progress}%` }} />
      </div>
      <span className="voice-time">
        {formatTime(currentTime)}{duration ? ` / ${formatTime(duration)}` : ''}
      </span>
      {text && text !== 'Voice message' && <p className="voice-text">{text}</p>}
    </div>
  );
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.baseURL = API_URL;

function sessionUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}
function token() { return localStorage.getItem('access'); }
const READING_HISTORY_KEY = 'cchat_reading_history';
function readReadingHistory() { try { return JSON.parse(localStorage.getItem(READING_HISTORY_KEY) || '{}'); } catch { return {}; } }
function saveReadingPosition(conversationId, messageId) {
  if (!messageId) return;
  const history = readReadingHistory();
  history[String(conversationId)] = { messageId: String(messageId), updatedAt: Date.now() };
  localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(history));
}
function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('cchat_theme') === 'dark');
  const toggle = () => setDark((current) => {
    const next = !current;
    localStorage.setItem('cchat_theme', next ? 'dark' : 'light');
    return next;
  });
  return [dark, toggle];
}
function authConfig() { const access = token(); return access ? { headers: { Authorization: `Bearer ${access}` } } : {}; }
function saveSession(data) {
  localStorage.setItem('access', data.tokens.access);
  localStorage.setItem('refresh', data.tokens.refresh);
  localStorage.setItem('user', JSON.stringify(data.user));
  axios.defaults.headers.common.Authorization = `Bearer ${data.tokens.access}`;
}
function clearSession() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common.Authorization;
  window.dispatchEvent(new Event('cchat:auth-expired'));
}
const initialToken = token();
if (initialToken) axios.defaults.headers.common.Authorization = `Bearer ${initialToken}`;
if (!window.__cchatAuthInterceptor) {
  axios.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401 && token()) clearSession();
    return Promise.reject(error);
  });
  window.__cchatAuthInterceptor = true;
}

function initials(name) { return name && name !== 'Anonymous' ? name.slice(0, 2).toUpperCase() : '?'; }
function relativeTime(value) { if (!value) return 'active'; const date = new Date(value); if (Number.isNaN(date.getTime())) return 'active'; const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000)); if (minutes < 1) return 'now'; if (minutes < 60) return `${minutes}m ago`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h ago`; return `${Math.floor(hours / 24)}d ago`; }
function displayName(participant) { return participant?.username || 'Anonymous'; }
function resolveMediaUrl(value) { if (!value) return ''; return /^https?:\/\//i.test(value) ? value : `${API_URL}${value.startsWith('/') ? '' : '/'}${value}`; }
function memberSince(value) { if (!value) return 'member since unknown'; const date = new Date(value); return Number.isNaN(date.getTime()) ? 'member since unknown' : `member since ${date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`; }
function participantTone(index, participant) { if (participant?.is_anonymous) return 'black'; return ['pink', 'blue', 'yellow', 'green'][index % 4]; }

/* ─── SOUND ENGINE (Web Audio API, no files) ─── */
let _ac = null;

function _getAC() {
  if (!_ac) {
    try { _ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
  }
  return _ac;
}

// Unlock AudioContext on ANY user gesture, globally, for the life of the page.
// This covers all pages — not just PrivateChatPage.
const _doUnlock = () => {
  const ac = _getAC();
  if (ac && ac.state !== 'running') ac.resume().catch(() => {});
};
document.addEventListener('click', _doUnlock, { passive: true });
document.addEventListener('keydown', _doUnlock, { passive: true });
document.addEventListener('touchstart', _doUnlock, { passive: true });

/**
 * Play a synthesised sound. async so it can await resume() if needed.
 * @param {'send'|'receive'|'reaction'|'open'|'notify'} type
 */
async function playSound(type) {
  try {
    if (localStorage.getItem('cchat_sounds') === 'off') return;
    const ac = _getAC();
    if (!ac) return;
    // Always resume if suspended — await so notes don't fire before audio starts
    if (ac.state === 'suspended') await ac.resume();
    // Small offset: gives browser a breath after resume before oscillators fire
    const t = ac.currentTime + 0.02;

    if (type === 'send') {
      // Two-tone blip: 660 Hz then 880 Hz, 80 ms each
      [660, 880].forEach((freq, i) => {
        const g = ac.createGain();
        const osc = ac.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t + i * 0.05);
        g.gain.linearRampToValueAtTime(0.22, t + i * 0.05 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.05 + 0.09);
        osc.connect(g); g.connect(ac.destination);
        osc.start(t + i * 0.05); osc.stop(t + i * 0.05 + 0.1);
      });
    } else if (type === 'receive') {
      // Rising chime: 520 → 780 Hz, 150 ms
      const g = ac.createGain();
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.linearRampToValueAtTime(780, t + 0.1);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.26, t + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      osc.connect(g); g.connect(ac.destination);
      osc.start(t); osc.stop(t + 0.16);
    } else if (type === 'reaction') {
      // Bubble pop: triangle, 420 → 200 Hz, 80 ms
      const g = ac.createGain();
      const osc = ac.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.07);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      osc.connect(g); g.connect(ac.destination);
      osc.start(t); osc.stop(t + 0.09);
    } else if (type === 'open') {
      // Ascending three-step: 330, 440, 550 Hz
      [330, 440, 550].forEach((freq, i) => {
        const g = ac.createGain();
        const osc = ac.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t + i * 0.06);
        g.gain.linearRampToValueAtTime(0.16, t + i * 0.06 + 0.014);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.06);
        osc.connect(g); g.connect(ac.destination);
        osc.start(t + i * 0.06); osc.stop(t + i * 0.06 + 0.07);
      });
    } else if (type === 'notify') {
      // Quiet tick: 1200 Hz, 35 ms
      const g = ac.createGain();
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 1200;
      g.gain.setValueAtTime(0.09, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
      osc.connect(g); g.connect(ac.destination);
      osc.start(t); osc.stop(t + 0.04);
    }
  } catch { /* AudioContext unavailable or policy — silent */ }
}


/* Username click → always opens profile page */
function ParticipantLink({ person, children, className }) {
  return person?.is_public && !person?.is_anonymous && person?.username
    ? <Link className={className} to={`/profile/${encodeURIComponent(person.username)}`} onClick={(event) => event.stopPropagation()}>{children}</Link>
    : <span className={className}>{children}</span>;
}

function Avatar({ person, small = false, index = 0 }) {
  const isAnon = typeof person === 'object' && (person?.is_anonymous || person?.is_public === false);
  const name = typeof person === 'string' ? person : displayName(person);
  const image = isAnon
    ? resolveMediaUrl(person?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`)
    : (typeof person === 'object' ? resolveMediaUrl(person?.avatar_url || '') : '');
  return <span className={`avatar avatar-${participantTone(index, typeof person === 'string' ? null : person)} ${small ? 'avatar-small' : ''}`} aria-label={`${name} avatar`}>{image ? <img src={image} alt="" /> : initials(name)}</span>;
}
function Logo() { return <Link to="/" className="logo" aria-label="CCHAT home">C<span>CHAT</span><i>.</i></Link>; }
function ThemeToggle({ dark, onToggle }) { return <button className="theme-toggle" onClick={onToggle} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}>{dark ? <Sun size={16} /> : <Moon size={16} />}<span>{dark ? 'Light' : 'Dark'}</span></button>; }

function Header({ dark, onToggle }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(sessionUser());
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { const sync = () => setUser(sessionUser()); window.addEventListener('storage', sync); window.addEventListener('cchat:auth-expired', sync); return () => { window.removeEventListener('storage', sync); window.removeEventListener('cchat:auth-expired', sync); }; }, []);
  const logout = async () => { try { if (token()) await axios.post('/api/auth/logout/', {}, authConfig()); } catch { /* local cleanup still matters */ } finally { clearSession(); navigate('/'); } };
  const openSearch = () => { setMenuOpen(false); window.dispatchEvent(new Event('cchat:open-search')); };
  const closeMenu = () => setMenuOpen(false);
  return <header className="site-header"><Logo /><div className="header-actions"><button className="icon-button search-toggle" onClick={openSearch} aria-label="Search threads"><Search size={18} /></button><Link className="header-link explore-link" to="/explore">Explore topics</Link><ThemeToggle dark={dark} onToggle={onToggle} />{user ? <><Link className="login-link account-link" to={`/profile/${encodeURIComponent(user.username)}`}>@{user.username} <ArrowUpRight size={15} /></Link><Link className="icon-button" to="/inbox" aria-label="Inbox"><Users size={17} /></Link><button className="icon-button" onClick={logout} aria-label="Log out"><LogOut size={17} /></button></> : <Link className="login-link" to="/login">Log in <ArrowUpRight size={15} /></Link>}</div><button type="button" className="mobile-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>{menuOpen && <nav className="mobile-menu-panel" aria-label="Mobile navigation"><button type="button" onClick={openSearch}><Search size={16} /> Search threads</button><Link to="/explore" onClick={closeMenu}><Sparkles size={16} /> Explore topics</Link><button type="button" onClick={onToggle}><ThemeToggle dark={dark} onToggle={() => {}} /><span>Switch to {dark ? 'light' : 'dark'} mode</span></button>{user ? <><Link to={`/profile/${encodeURIComponent(user.username)}`} onClick={closeMenu}><ArrowUpRight size={16} /> @{user.username}</Link><Link to="/inbox" onClick={closeMenu}><Users size={16} /> Inbox</Link><button type="button" onClick={() => { closeMenu(); logout(); }}><LogOut size={16} /> Log out</button></> : <Link to="/login" onClick={closeMenu}><ArrowUpRight size={16} /> Log in</Link>}</nav>}</header>;
}

function InlineSearch({ open, onClose }) {
  const [query, setQuery] = useState(''); const [results, setResults] = useState([]); const [loading, setLoading] = useState(false);
  useEffect(() => { if (!open) return undefined; const timer = setTimeout(async () => { if (!query.trim()) { setResults([]); return; } setLoading(true); try { const response = await axios.get(`/api/search/?q=${encodeURIComponent(query.trim())}`, authConfig()); setResults(response.data?.results || []); } catch { setResults([]); } finally { setLoading(false); } }, 260); return () => clearTimeout(timer); }, [open, query]);
  if (!open) return null;
  return <section className="inline-search container" aria-label="Search conversations"><div className="inline-search-head"><div><span className="eyebrow">Hybrid search · words + meaning</span><h2>Find the moment.</h2></div><button className="inline-search-close" onClick={onClose} aria-label="Close search">×</button></div><input className="search-input" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exact phrases or ideas…" aria-label="Search messages" />{loading && <p className="sidebar-muted">Searching messages…</p>}{!loading && query && !results.length && <p className="empty-copy">No messages matched that search.</p>}<div className="search-results">{results.map((result) => <SearchResultCard key={result.message_id} result={result} />)}</div></section>;
}

function SearchResultCard({ result }) {
  const navigate = useNavigate();
  const timestamp = result.timestamp ? new Date(result.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '';
  return <button type="button" className="search-result-card" onClick={() => navigate(`/chat/${result.conversation_id}`)}><div className="search-result-topline"><span>CCHAT-{String(result.conversation_id).padStart(3, '0')}</span><time dateTime={result.timestamp}>{timestamp}</time></div><p>{result.message}</p><div className="search-result-meta"><strong>{result.conversation_label || 'Conversation'}</strong><span>by {result.sender || 'Anonymous'}</span>{result.is_private && <span className="pill-badge is-private">Private</span>}</div></button>;
}

function ReactionButton({ icon, label, count, onClick, active }) { return <button type="button" className={`reaction-button ${active ? 'is-active' : ''}`} onClick={(e) => { e.stopPropagation(); playSound('reaction'); onClick?.(); }} aria-label={`React ${label}`}>{React.createElement(icon, { size: 14, strokeWidth: 2.4 })}<span className="reaction-count">{count ?? 0}</span></button>; }
function ReactionRow({ thread, onReact }) { return <div className="reaction-row"><ReactionButton icon={Flame} label="fire" count={thread.likes} onClick={() => onReact?.('like')} active={thread.user_reactions?.includes('like')} /><ReactionButton icon={Skull} label="skull" count={thread.dislikes} onClick={() => onReact?.('dislike')} active={thread.user_reactions?.includes('dislike')} /><ReactionButton icon={Heart} label="heart" count={thread.caps} onClick={() => onReact?.('cap')} active={thread.user_reactions?.includes('cap')} /></div>; }

function ThreadCard({ thread, onReact }) {
  const navigate = useNavigate();
  const participants = thread.participants || thread.chatters || [];
  const messages = (thread.messages || []).slice(-4);
  const handleCardClick = (e) => {
    if (e.target.closest('a, button, input, textarea')) return;
    navigate(`/chat/${thread.conversation_id}`);
  };
  return (
    <article className="thread-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="thread-card-link">
        <div className="card-topline">
          <span className="thread-id">CCHAT-{String(thread.conversation_id).padStart(3, '0')}</span>
          <span className="category">{thread._feed?.is_breakout ? 'BREAKOUT' : 'PUBLIC THREAD'}</span>
        </div>
        <Link to={`/chat/${thread.conversation_id}`}><h3>{participants.map(displayName).join(' × ')}</h3></Link>
        <div className="card-participants">
          {participants.map((p, i) => (
            <span className="participant-chip" key={`${p.id || p.username}-${i}`}>
              <Avatar person={p} small index={i} />
              <ParticipantLink person={p}>{displayName(p)}</ParticipantLink>
            </span>
          ))}
        </div>
        <div className="preview-stack">
          {messages.length ? messages.map((message, i) => (
            <div className={`preview-line ${i === messages.length - 1 ? 'preview-fade' : ''}`} key={message.id || `${message.timestamp}-${i}`}>
              <span>{(message.sender_username || 'ANON').toUpperCase()}</span>
              <p>{message.text}</p>
            </div>
          )) : <div className="empty-copy">No messages yet.</div>}
        </div>
      </div>
      <div className="card-bottom">
        <ReactionRow thread={thread} onReact={onReact ? (type) => onReact(thread.conversation_id, type) : undefined} />
        <span className="card-stat"><Eye size={14} /> {thread.views ?? 0}</span>
        <span className="card-time">{relativeTime(thread.updated_at || thread.created_at)}</span>
        <Link className="open-thread" to={`/chat/${thread.conversation_id}`}>Open thread <ArrowUpRight size={15} /></Link>
      </div>
    </article>
  );
}

function CreateThreadModal({ onClose, initialUsername = '' }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState(initialUsername); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  useEffect(() => { playSound('open'); }, []);
  const submit = async (event) => { event.preventDefault(); setLoading(true); setError(''); try { const response = await axios.post('/api/conversations/create/', { username }, authConfig()); onClose(); navigate(`/inbox/${response.data.id}`); } catch (err) { if (err.response?.status === 401) { clearSession(); navigate('/login?next=%2F&intent=create'); } else setError(err.response?.data?.error || 'Could not start that conversation.'); } finally { setLoading(false); } };
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-thread-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label="Close">×</button><span className="eyebrow">New room</span><h2 id="create-thread-title">Who do you want to talk to?</h2>{error && <p className="auth-error" role="alert">{error}</p>}<form onSubmit={submit} className="auth-form"><label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="their_username" required autoFocus /></label><button className="button button-primary auth-submit" disabled={loading}>{loading ? 'Opening…' : 'Open conversation'} <ArrowUpRight size={17} /></button></form></section></div>;
}

function LandingPage() {
  const [dark, setDark] = useDarkMode(); const [threads, setThreads] = useState([]); const [landingStats, setLandingStats] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [createOpen, setCreateOpen] = useState(false); const [searchOpen, setSearchOpen] = useState(false); const location = useLocation(); const navigate = useNavigate();
  useEffect(() => { if (token() && new URLSearchParams(location.search).get('intent') === 'create') setCreateOpen(true); }, [location.search]);
  useEffect(() => { const open = () => setSearchOpen(true); window.addEventListener('cchat:open-search', open); return () => window.removeEventListener('cchat:open-search', open); }, []);
  useEffect(() => { let active = true; (async () => { try { const response = await axios.get('/api/chats/recommended/', authConfig()); if (!active) return; setThreads(response.data || []); localStorage.setItem('recommended_chats_ids', JSON.stringify((response.data || []).map((item) => item.conversation_id))); } catch (err) { if (err.response?.status !== 401 && active) setError('The public feed is quiet right now.'); } finally { if (active) setLoading(false); } })(); return () => { active = false; }; }, []);
  useEffect(() => { axios.get('/api/stats/landing/').then((response) => setLandingStats(response.data)).catch(() => {}); }, []);
  const startThread = () => { if (!token()) navigate('/login?next=%2F&intent=create'); else setCreateOpen(true); };
  const react = async (conversationId, type) => { if (!token()) { navigate(`/login?next=%2Fchat%2F${conversationId}`); return; } try { const response = await axios.post(`/api/conversations/${conversationId}/react/`, { reaction_type: type }, authConfig()); setThreads((current) => current.map((thread) => thread.conversation_id === conversationId ? { ...thread, ...response.data } : thread)); } catch { /* reaction affordance remains usable if the server is temporarily unavailable */ } };
  const trendingThreads = threads.slice(0, 5); const feedThreads = threads.slice(5); const hasStats = landingStats && (landingStats.reactions_today > 0 || landingStats.threads_started_this_hour > 0);
  return <div className={`app-shell ${dark ? 'theme-dark' : ''}`}><Header dark={dark} onToggle={() => setDark(!dark)} /><main>{searchOpen && <InlineSearch open={searchOpen} onClose={() => setSearchOpen(false)} />}<section className="hero container"><div className="hero-copy"><div className="eyebrow"><Sparkles size={15} /> Public by default</div><h1>Say the thing.<br /><span>Stay unknown.</span></h1><p className="hero-lede">CCHAT is a living index of honest conversations between people who have nothing to prove.</p><div className="hero-actions"><button className="button button-primary" onClick={startThread}>Start a new thread <ArrowUpRight size={18} /></button><Link to="/chat/1" className="text-link">Browse the room <ArrowUpRight size={15} /></Link></div></div><div className="hero-side"><p className="side-note">A place for the in-between thoughts. The hot takes. The questions you only ask after midnight.</p><div className="feature-pills"><span>Unfiltered</span><span>Real-time</span><span>Anonymous</span></div>{hasStats && <p className="hero-live-stat"><span className="live-dot" /> {landingStats.reactions_today.toLocaleString()} reactions today · {landingStats.threads_started_this_hour.toLocaleString()} threads started this hour.</p>}<div className="hero-stamp"><span>01</span><strong>NO PROFILE<br />REQUIRED</strong><small>Read everything.<br />Reply when ready.</small></div><div className="hero-stamp"><span>02</span><strong>PUBLIC<br />BY CHOICE</strong><small>Share a room<br />when it feels right.</small></div><div className="hero-stamp"><span>03</span><strong>REACT<br />HONESTLY</strong><small>Mark the moments<br />that hit home.</small></div></div></section><div className="container"><section className="live-strip" aria-label="Live conversations"><div className="live-label"><span className="live-dot" /> LIVE NOW <span className="live-count">{threads.length} public threads</span></div><div className="live-scroll">{threads.slice(0, 4).map((thread) => <Link key={thread.conversation_id} to={`/chat/${thread.conversation_id}`} className="live-thread"><span>CCHAT-{String(thread.conversation_id).padStart(3, '0')}</span><b>{(thread.messages?.[thread.messages.length - 1]?.text || 'conversation is live').slice(0, 30)}</b><ChevronRight size={15} /></Link>)}</div></section></div>{!loading && trendingThreads.length > 0 && <section className="trending-section container"><div className="section-heading"><div><span className="section-kicker">Ranked by the room</span><h2>Trending now</h2></div></div><div className="trending-strip">{trendingThreads.map((thread, index) => <Link className="trending-card" to={`/chat/${thread.conversation_id}`} key={thread.conversation_id}><span className="trending-rank">0{index + 1}</span><strong>{(thread.participants || []).map(displayName).join(' × ')}</strong><small>{thread._feed?.velocity || 0} messages this hour · {thread.likes + thread.caps + thread.smiles} positive reactions</small></Link>)}</div></section>}<section className="feed-section container"><div className="section-heading"><div><span className="section-kicker">The public feed</span><h2>Fresh from the room</h2></div></div>{error && <p className="empty-state">{error}</p>}{loading ? <div className="thread-grid"><div className="thread-card skeleton-card" /><div className="thread-card skeleton-card" /></div> : feedThreads.length ? <div className="thread-grid">{feedThreads.map((thread) => <ThreadCard key={thread.conversation_id} thread={thread} onReact={react} />)}</div> : <p className="empty-state">No more public conversations yet. Start one and make the room interesting.</p>}</section></main><Footer />{createOpen && <CreateThreadModal onClose={() => { setCreateOpen(false); if (location.search) navigate('/', { replace: true }); }} />}</div>;
}

function AmbientLayer() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const wsBase = import.meta.env.VITE_WS_URL || API_URL.replace(/^http/, 'ws');
    const socket = new WebSocket(`${wsBase}/ws/ambient/`);
    let lastNotify = 0;
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'ambient.event' || !data.emoji) return;
        const item = { id: `${Date.now()}-${Math.random()}`, emoji: data.emoji, left: `${Math.random() * 100}%` };
        setEvents((current) => {
          if (current.length >= 6) return current;
          return [...current, item];
        });
        window.setTimeout(() => setEvents((current) => current.filter((entry) => entry.id !== item.id)), 1200);
        // Throttle notify sound to at most once every 3 s
        const now = Date.now();
        if (now - lastNotify > 3000) { lastNotify = now; playSound('notify'); }
      } catch { /* ignore malformed ambient messages */ }
    };
    return () => socket.close();
  }, []);
  return <div className="ambient-layer" aria-hidden="true">{events.map((item) => <span className="floating-emoji ambient-emoji" style={{ left: item.left }} key={item.id}>{item.emoji}</span>)}</div>;
}

/* Compute message background tint based on highest reaction count */
function getMessageBgStyle(message) {
  const likes = message.likes || 0;
  const smiles = message.smiles || 0;
  const caps = message.caps || 0;
  const dislikes = message.dislikes || 0;
  const maxReaction = Math.max(likes, smiles, caps, dislikes);
  if (maxReaction === 0) return {};
  const intensity = Math.min(maxReaction / 10, 1); // normalize 0..1 at 10+ reactions
  const alpha = 0.08 + intensity * 0.22; // 8%–30% tint
  if (likes >= smiles && likes >= caps && likes >= dislikes) {
    // fire dominant → warm orange-red tint
    return { background: `color-mix(in srgb, #ff6b35 ${Math.round(alpha * 100)}%, var(--surface))` };
  }
  if (smiles >= likes && smiles >= caps && smiles >= dislikes) {
    // heart/smile dominant → pink tint
    return { background: `color-mix(in srgb, #ff2d55 ${Math.round(alpha * 100)}%, var(--surface))` };
  }
  if (caps >= likes && caps >= smiles && caps >= dislikes) {
    // cap dominant → blue tint
    return { background: `color-mix(in srgb, #0284c7 ${Math.round(alpha * 100)}%, var(--surface))` };
  }
  // skull/dislike dominant → purple tint
  return { background: `color-mix(in srgb, #8b5cf6 ${Math.round(alpha * 100)}%, var(--surface))` };
}

function isCurrentUserSender(message, currentUser, otherParticipant = null) {
  const session = sessionUser();
  const myUserId = session?.id || currentUser?.user_id;
  const myUsername = (session?.username || currentUser?.username || '').toLowerCase();

  const senderId = message.sender ?? message.sender_id ?? message.senderId;
  const rawSenderName = message.sender_username || message.senderName || message.senderId;
  const senderName = typeof rawSenderName === 'string' ? rawSenderName.toLowerCase() : '';

  // 1. Direct match by current user ID
  if (myUserId && senderId && String(senderId) === String(myUserId)) {
    return true;
  }

  // 2. Direct match by current username
  if (myUsername && senderName && senderName === myUsername) {
    return true;
  }

  // 3. In a 1-on-1 private chat with otherParticipant known:
  if (otherParticipant) {
    const otherId = otherParticipant.id;
    const otherUsername = (otherParticipant.username || '').toLowerCase();

    // If it was sent by the other person -> not mine
    if (otherId && senderId && String(senderId) === String(otherId)) return false;
    if (otherUsername && senderName && senderName === otherUsername) return false;

    // If sender info is present and definitely not the other person -> it's mine!
    if (senderId !== undefined && senderId !== null) return true;
    if (senderName) return true;
  }

  return false;
}

function DeleteMessagesModal({ count, onCancel, onConfirm, deleting }) {
  return (
    <div className="delete-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <span className="eyebrow">PERMANENT ACTION</span>
        <h2 id="delete-modal-title">Delete {count === 1 ? 'this message' : `${count} messages`}?</h2>
        <p>{count === 1 ? 'This message will be removed from the conversation.' : 'These messages will be removed from the conversation.'}</p>
        <div className="delete-modal-actions">
          <button type="button" className="button" onClick={onCancel} disabled={deleting}>Keep {count === 1 ? 'message' : 'messages'}</button>
          <button type="button" className="button button-primary" onClick={onConfirm} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button>
        </div>
      </section>
    </div>
  );
}

const REPORT_REASONS = [
  ['harassment', 'Harassment'],
  ['doxxing', 'Doxxing or personal information'],
  ['minor', 'Involves a minor'],
  ['non_consensual', 'Non-consensual sharing'],
  ['spam', 'Spam'],
  ['other', 'Other'],
];

function ReportModal({ target, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState('harassment');
  const [detail, setDetail] = useState('');
  const submit = (event) => { event.preventDefault(); onSubmit({ reason, detail }); };
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="create-modal report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <span className="eyebrow"><Flag size={14} /> Report {target.type}</span>
        <h2 id="report-title">Help keep CCHAT healthy.</h2>
        <p className="report-intro">Reports are reviewed by the moderation team. Please choose the closest reason and add context if it helps.</p>
        <form onSubmit={submit} className="auth-form">
          <label>Reason<select value={reason} onChange={(event) => setReason(event.target.value)}>{REPORT_REASONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>Details (optional)<textarea value={detail} maxLength={4000} onChange={(event) => setDetail(event.target.value)} placeholder="What should moderators know?" /></label>
          <div className="report-modal-actions"><button type="button" className="button" onClick={onClose} disabled={submitting}>Cancel</button><button className="button button-primary" disabled={submitting}>{submitting ? 'Sending…' : 'Submit report'} <Flag size={15} /></button></div>
        </form>
      </section>
    </div>
  );
}

function Message({ message, historyKey, currentUser, participants = [], onReact, onDelete, onReport, selectionMode, selected, onToggleSelect, isPublic: conversationIsPublic }) {
  const senderId = message.sender ?? message.sender_id;
  let participantIndex = participants.findIndex((p) => p.id && String(p.id) === String(senderId));
  if (participantIndex < 0 && message.sender_username) {
    participantIndex = participants.findIndex((p) => p.username && p.username === message.sender_username);
  }

  const isMine = isCurrentUserSender(message, currentUser);

  // Check if current user is an active participant in this conversation
  const session = sessionUser();
  const myUserId = session?.id || currentUser?.user_id;
  const myUsername = (session?.username || currentUser?.username || '').toLowerCase();
  const viewerIndex = participants.findIndex((p) =>
    (myUserId && p.id && String(p.id) === String(myUserId)) ||
    (myUsername && p.username && p.username.toLowerCase() === myUsername)
  );
  const isViewerInConversation = viewerIndex >= 0;

  let visualRight = false;
  if (isViewerInConversation) {
    // If the viewer is in the chat, their own messages are on the right, others on the left
    visualRight = isMine || (participantIndex >= 0 && participantIndex === viewerIndex);
  } else {
    // If the viewer is a spectator/reader, Participant 0 is on the left, Participant 1 (or odd index) is on the right
    if (participantIndex >= 0) {
      visualRight = participantIndex % 2 === 1;
    } else {
      // Fallback for anonymous messages without indexed participant
      const hash = String(senderId || message.sender_username || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      visualRight = hash % 2 === 1;
    }
  }

  const senderName = message.sender_username || (isMine ? currentUser?.username : (participants[participantIndex]?.username || 'Anonymous'));
  const sender = participants[participantIndex >= 0 ? participantIndex : (visualRight ? 1 : 0)];
  const bgStyle = getMessageBgStyle(message);

  return (
    <div className={`message-row ${visualRight ? 'message-mine' : 'message-other'} ${selected ? 'is-selected' : ''} ${selectionMode ? 'is-selectable' : ''}`} data-message-id={historyKey} onClick={() => { if (selectionMode && isMine) onToggleSelect(message.id); }} aria-selected={selectionMode ? selected : undefined}>
      <Avatar person={sender || senderName} small index={participantIndex >= 0 ? participantIndex : (visualRight ? 1 : 0)} />
      <div className="message-body">
        {isMine && selectionMode && <span className={`message-selection-mark ${selected ? 'is-selected' : ''}`} aria-hidden="true">{selected ? '✓' : ''}</span>}
        <div className="message-meta">
          <ParticipantLink person={isMine ? null : sender}><strong>{isMine ? 'You' : senderName}</strong></ParticipantLink>
          <span>{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}</span>
        </div>
        {message.message_type === 'image' || (message.attachment && /\.(png|jpe?g|gif|webp|svg)($|\?)/i.test(message.attachment)) ? (
          <div className="message-attachment">
            <img src={message.attachment} alt="attachment" className="message-attachment-image" />
            {message.text && message.text !== 'Image attachment' && <p style={bgStyle}>{message.text}</p>}
          </div>
        ) : message.message_type === 'audio' || (message.attachment && /\.(mp3|wav|ogg|m4a|webm)($|\?)/i.test(message.attachment)) ? (
          <div className="message-attachment">
            <VoiceMessagePlayer src={message.attachment} text={message.text} />
          </div>
        ) : message.attachment ? (
          <div className="message-attachment">
            <a href={message.attachment} download target="_blank" rel="noopener noreferrer" className="message-attachment-file">
              <Paperclip size={14} /> {message.text || 'Download file'}
            </a>
          </div>
        ) : (
          <p style={bgStyle}>{message.text}</p>
        )}
        <div className="message-reactions">
          {isMine && selectionMode && (
            <span className="message-select-hint">{selected ? 'Selected' : 'Tap to select'}</span>
          )}
          {isMine && onDelete && (
            <button type="button" className="message-delete-button" onClick={(e) => { e.stopPropagation(); onDelete(message.id); }} aria-label="Delete your message" title="Delete message">
              <Trash2 size={14} />
            </button>
          )}
          {!isMine && onReport && <button type="button" className="message-report-button" onClick={(e) => { e.stopPropagation(); onReport(message.id); }} aria-label="Report message" title="Report message"><Flag size={14} /></button>}
          <button
            type="button"
            className={`reaction-btn reaction-flame ${message.user_reaction === 'like' ? 'is-active' : ''}`}
            onClick={(e) => { playSound('reaction'); onReact(message.id, 'like', e); }}
            aria-label="React with fire"
            title="Fire"
          >
            <span className="reaction-emoji">🔥</span>
            {(message.likes || 0) > 0 && <span className="reaction-count">{message.likes}</span>}
          </button>
          <button
            type="button"
            className={`reaction-btn reaction-heart ${message.user_reaction === 'smile' ? 'is-active' : ''}`}
            onClick={(e) => { playSound('reaction'); onReact(message.id, 'smile', e); }}
            aria-label="React with heart"
            title="Heart"
          >
            <span className="reaction-emoji">♥</span>
            {(message.smiles || 0) > 0 && <span className="reaction-count">{message.smiles}</span>}
          </button>
          <button
            type="button"
            className={`reaction-btn reaction-skull ${message.user_reaction === 'dislike' ? 'is-active' : ''}`}
            onClick={(e) => { playSound('reaction'); onReact(message.id, 'dislike', e); }}
            aria-label="React with skull"
            title="Skull"
          >
            <span className="reaction-emoji">💀</span>
            {(message.dislikes || 0) > 0 && <span className="reaction-count">{message.dislikes}</span>}
          </button>
          <button
            type="button"
            className={`reaction-btn reaction-cap ${message.user_reaction === 'cap' ? 'is-active' : ''}`}
            onClick={(e) => { playSound('reaction'); onReact(message.id, 'cap', e); }}
            aria-label="React with cap"
            title="Cap"
          >
            <span className="reaction-emoji">🧢</span>
            {(message.caps || 0) > 0 && <span className="reaction-count">{message.caps}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Eye icon toggle for public/private on a per-participant basis */
function EyeToggle({ isPublic, onToggle, disabled }) {
  return (
    <button
      type="button"
      className={`eye-toggle ${isPublic ? 'eye-open' : 'eye-closed'}`}
      onClick={onToggle}
      disabled={disabled}
      aria-label={isPublic ? 'Make private (currently public)' : 'Make public (currently private)'}
      title={isPublic ? 'Public: Click to make private' : 'Private: Click to make public'}
    >
      {isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
      <span className="eye-toggle-label">{isPublic ? 'Public' : 'Private'}</span>
    </button>
  );
}

function ChatPage() {
  const { id } = useParams(); const navigate = useNavigate(); const [dark, setDark] = useDarkMode(); const [conversation, setConversation] = useState(null); const [messages, setMessages] = useState([]); const [currentUser, setCurrentUser] = useState(sessionUser()); const [participantChats, setParticipantChats] = useState({}); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [input, setInput] = useState(''); const [floating, setFloating] = useState([]); const [selectionMode, setSelectionMode] = useState(false); const [selectedMessageIds, setSelectedMessageIds] = useState([]); const [deleteRequest, setDeleteRequest] = useState(null); const [deleting, setDeleting] = useState(false); const [reportTarget, setReportTarget] = useState(null); const [reporting, setReporting] = useState(false); const [resumeMessageId, setResumeMessageId] = useState(null); const resumeApplied = useRef(false); const socketRef = useRef(null); const streamRef = useRef(null); const moving = useRef(false); const pullRef = useRef({ amount: 0, direction: 0 }); const touchStartRef = useRef(null);
  const participants = conversation?.participants || [];
  const viewerParticipant = participants.find((p) => currentUser && String(p.id) === String(currentUser.id));

  useEffect(() => {
    const saved = readReadingHistory()[String(id)];
    const linkedMessage = new URLSearchParams(window.location.search).get('message');
    setResumeMessageId(linkedMessage || saved?.messageId || null);
    resumeApplied.current = false;
  }, [id]);

  useEffect(() => {
    if (!messages.length || !resumeMessageId || resumeApplied.current) return undefined;
    const timer = window.setTimeout(() => {
      const target = Array.from(streamRef.current?.querySelectorAll('[data-message-id]') || [])
        .find((element) => element.dataset.messageId === String(resumeMessageId));
      if (target) {
        target.scrollIntoView({ block: 'center', behavior: 'auto' });
        resumeApplied.current = true;
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [messages, resumeMessageId]);

  useEffect(() => {
    let frame = 0;
    const rememberPosition = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const stream = streamRef.current;
        if (!stream) return;
        const bounds = stream.getBoundingClientRect();
        const threshold = stream.scrollHeight > stream.clientHeight + 16 ? bounds.top + 96 : 180;
        const visible = Array.from(stream.querySelectorAll('[data-message-id]'))
          .filter((element) => element.getBoundingClientRect().top <= threshold)
          .pop();
        if (visible?.dataset.messageId) saveReadingPosition(id, visible.dataset.messageId);
      });
    };
    window.addEventListener('scroll', rememberPosition, { passive: true });
    streamRef.current?.addEventListener('scroll', rememberPosition, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', rememberPosition);
      streamRef.current?.removeEventListener('scroll', rememberPosition);
    };
  }, [id, messages.length]);

  const ids = useMemo(() => { try { return JSON.parse(localStorage.getItem('recommended_chats_ids') || '[]').map(Number); } catch { return []; } }, [conversation]);
  const move = (delta) => { if (moving.current || ids.length < 2) return; const index = ids.indexOf(Number(id)); const next = ids[(index < 0 ? 0 : index + delta + ids.length) % ids.length]; if (!next || next === Number(id)) return; moving.current = true; const el = streamRef.current; if (el) el.style.transform = `translateY(${delta > 0 ? -100 : 100}px)`; setTimeout(() => navigate(`/chat/${next}`), 180); setTimeout(() => { moving.current = false; }, 560); };
  useEffect(() => { let settleTimer; const onWheel = (event) => { const el = streamRef.current; if (!el || moving.current) return; const hasInternalScroll = el.scrollHeight > el.clientHeight + 16; const atBottom = hasInternalScroll ? (el.scrollHeight - el.scrollTop <= el.clientHeight + 8) : (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24); const atTop = hasInternalScroll ? (el.scrollTop <= 8) : (window.scrollY <= 8); const direction = event.deltaY > 0 && atBottom ? 1 : event.deltaY < 0 && atTop ? -1 : 0; if (!direction) { pullRef.current = { amount: 0, direction: 0 }; el.style.transform = 'translateY(0)'; return; } const state = pullRef.current.direction === direction ? pullRef.current : { amount: 0, direction }; state.amount = Math.min(380, state.amount + Math.abs(event.deltaY) * 0.34); pullRef.current = state; el.style.transform = `translateY(${direction * -Math.min(120, state.amount * 0.38)}px)`; clearTimeout(settleTimer); settleTimer = setTimeout(() => { if (!moving.current && streamRef.current) { streamRef.current.style.transform = 'translateY(0)'; pullRef.current = { amount: 0, direction: 0 }; } }, 120); if (state.amount > 340) { pullRef.current = { amount: 0, direction: 0 }; move(direction); } }; window.addEventListener('wheel', onWheel, { passive: true }); return () => { clearTimeout(settleTimer); window.removeEventListener('wheel', onWheel); }; }, [id, ids]);
  useEffect(() => {
    const onTouchStart = (event) => {
      if (event.touches.length === 1) touchStartRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };
    const onTouchEnd = (event) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start || moving.current || !event.changedTouches.length) return;
      const touch = event.changedTouches[0];
      const deltaX = start.x - touch.clientX;
      const deltaY = start.y - touch.clientY;
      if (Math.abs(deltaY) < 72 || Math.abs(deltaY) <= Math.abs(deltaX)) return;
      const stream = streamRef.current;
      if (!stream) return;
      const hasInternalScroll = stream.scrollHeight > stream.clientHeight + 16;
      const atBottom = hasInternalScroll ? stream.scrollHeight - stream.scrollTop <= stream.clientHeight + 8 : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
      const atTop = hasInternalScroll ? stream.scrollTop <= 8 : window.scrollY <= 8;
      if (deltaY > 0 && atBottom) move(1);
      if (deltaY < 0 && atTop) move(-1);
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => { window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchend', onTouchEnd); };
  }, [id, ids]);
  useEffect(() => { let active = true; setLoading(true); setError(''); (async () => { try { const chatResponse = await axios.get(`/api/conversations/${id}/`, authConfig()); if (!active) return; setConversation(chatResponse.data.conversation); setMessages(chatResponse.data.messages || []); if (token()) { try { const profileResponse = await axios.get('/api/profile/', authConfig()); if (active && profileResponse.data) setCurrentUser({ ...sessionUser(), ...profileResponse.data }); } catch {} } } catch (err) { if (active) setError(err.response?.data?.error || 'This conversation is unavailable.'); } finally { if (active) setLoading(false); } })(); return () => { active = false; }; }, [id]);
  useEffect(() => { if (!participants.length) return; let active = true; (async () => { const next = {}; await Promise.all(participants.filter((person) => person.is_public).map(async (person) => { try { if (currentUser && String(currentUser.id) === String(person.id)) { const response = await axios.get('/api/conversations/', authConfig()); next[person.id] = (response.data || []).filter((item) => Number(item.id) !== Number(id)); } else { const response = await axios.get(`/api/profile/${encodeURIComponent(person.username)}/conversations/`, authConfig()); next[person.id] = response.data || []; } } catch { next[person.id] = []; } })); if (active) setParticipantChats(next); })(); return () => { active = false; }; }, [id, participants.length, currentUser?.id]);
  useEffect(() => { const wsBase = import.meta.env.VITE_WS_URL || API_URL.replace(/^http/, 'ws'); const query = token() ? `?token=${encodeURIComponent(token())}` : ''; const socket = new WebSocket(`${wsBase}/ws/chat/${id}/${query}`); socket.onmessage = (event) => { const data = JSON.parse(event.data); if (data.type === 'receive_message') setMessages((current) => [...current, { id: data.id, sender: data.sender_id || data.senderId, sender_username: data.sender_username, text: data.text, timestamp: data.timestamp }]); if (data.type === 'message_deleted') setMessages((current) => current.filter((message) => String(message.id) !== String(data.messageId))); if (data.type === 'sponsorship_update' && data.sponsorship) setConversation((current) => ({ ...current, sponsorships: [data.sponsorship] })); }; socketRef.current = socket; return () => { socket.close(); socketRef.current = null; }; }, [id]);
  const react = async (type) => { if (!token()) { navigate(`/login?next=%2Fchat%2F${id}`); return; } try { const response = await axios.post(`/api/conversations/${id}/react/`, { reaction_type: type }, authConfig()); setConversation((current) => ({ ...current, ...response.data, participants: current?.participants || [] })); } catch { /* keep the conversation readable */ } };
  const toggleBookmark = async () => { if (!token()) { navigate(`/login?next=%2Fchat%2F${id}`); return; } try { playSound('reaction'); const response = await axios.post(`/api/conversations/${id}/bookmark/`, {}, authConfig()); setConversation((current) => ({ ...current, is_bookmarked: response.data.is_bookmarked })); } catch { setError('Could not save this room right now.'); } };

  const floatReaction = (emoji, event) => {
    let left = window.innerWidth / 2;
    let top = window.innerHeight / 2;
    if (event?.clientX && event?.clientY) {
      left = event.clientX;
      top = event.clientY;
    } else if (event?.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      left = rect.left + rect.width / 2;
      top = rect.top;
    }
    const item = { id: `${Date.now()}-${Math.random()}`, emoji, left: `${left}px`, top: `${top}px` };
    setFloating((items) => [...items, item]);
    setTimeout(() => setFloating((items) => items.filter((entry) => entry.id !== item.id)), 1200);
  };

  const reactMessage = async (messageId, type, event) => {
    const emojiMap = { like: '🔥', smile: '♥', dislike: '💀', cap: '🧢' };
    if (emojiMap[type]) floatReaction(emojiMap[type], event);
    if (!token()) {
      navigate(`/login?next=%2Fchat%2F${id}`);
      return;
    }
    try {
      const response = await axios.post(`/api/messages/${messageId}/react/`, { reaction_type: type }, authConfig());
      setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, ...response.data, sender_username: message.sender_username } : message)));
    } catch {}
  };

  const requestDeleteMessages = (messageIds) => {
    const idsToDelete = [...new Set(messageIds.filter(Boolean))];
    if (idsToDelete.length) setDeleteRequest(idsToDelete);
  };
  const deleteMessages = async () => {
    if (!deleteRequest?.length) return;
    setDeleting(true);
    try {
      await Promise.all(deleteRequest.map((messageId) => axios.delete(`/api/messages/${messageId}/delete/`, authConfig())));
      setMessages((current) => current.filter((message) => !deleteRequest.includes(message.id)));
      setSelectedMessageIds([]);
      setSelectionMode(false);
      setDeleteRequest(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Some messages could not be deleted.');
    } finally { setDeleting(false); }
  };

  const voteSponsorship = async (sponsorshipId, accepted) => { if (!token()) { navigate(`/login?next=%2Fchat%2F${id}`); return; } const response = await axios.post(`/api/conversations/${id}/sponsorships/${sponsorshipId}/vote/`, { accepted }, authConfig()); setConversation((current) => ({ ...current, sponsorships: (current.sponsorships || []).map((item) => item.id === sponsorshipId ? { ...item, ...response.data } : item) })); };
  const submitReport = async ({ reason, detail }) => { if (!token()) { navigate(`/login?next=%2Fchat%2F${id}`); return; } setReporting(true); try { const targetPath = reportTarget.type === 'message' ? `/api/report/message/${reportTarget.id}/` : `/api/report/conversation/${id}/`; await axios.post(targetPath, { reason, detail }, authConfig()); setReportTarget(null); setError('Report submitted. Thank you for helping keep the room safe.'); } catch (err) { setError(err.response?.data?.error || 'Could not submit this report.'); } finally { setReporting(false); } };
  const send = async (event) => { event.preventDefault(); if (!input.trim()) return; if (!token()) { navigate(`/login?next=%2Fchat%2F${id}`); return; } const text = input.trim(); setInput(''); if (socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(JSON.stringify({ type: 'send_message', senderId: currentUser?.username, text })); else { try { const response = await axios.post('/api/messages/send/', { conversation_id: id, text }, authConfig()); setMessages((current) => [...current, response.data]); } catch (err) { setError(err.response?.data?.error || 'Message could not be sent.'); } } };
  if (loading) return <div className={`app-shell ${dark ? 'theme-dark' : ''}`}><Header dark={dark} onToggle={() => setDark(!dark)} /><main className="loading-state">Loading conversation…</main></div>;
  if (error || !conversation) return <div className={`app-shell ${dark ? 'theme-dark' : ''}`}><Header dark={dark} onToggle={() => setDark(!dark)} /><main className="empty-state container"><Link to="/" className="back-link"><ArrowLeft size={16} /> Back to feed</Link><h1>{error || 'Conversation unavailable.'}</h1></main></div>;
  const sponsorship = conversation.sponsorships?.[0];
  const totalReactions = (conversation.likes ?? 0) + (conversation.dislikes ?? 0) + (conversation.caps ?? 0);
  return (
    <div className={`app-shell chat-shell ${dark ? 'theme-dark' : ''}`}>
      <Header dark={dark} onToggle={() => setDark(!dark)} />
      <main className="chat-layout container">
        <aside className="chat-sidebar left-sidebar">
          <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to feed</Link>
          <div className="sidebar-block">
            <span className="sidebar-label">In this thread</span>
            <div className="sidebar-people">
              {participants.map((person, index) => (
                <div key={person.id || index}>
                  <Avatar person={person} index={index} />
                  <div className="sidebar-person-name">
                    <ParticipantLink person={person}>{displayName(person)}</ParticipantLink>
                    <div className="sidebar-person-status">
                      <small>{person.is_public ? 'public profile' : 'anonymous'}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {participants.filter((person) => person.is_public).map((person) => {
            const chats = participantChats[person.id] || [];
            const own = currentUser && String(currentUser.id) === String(person.id);
            return (
              <div className="sidebar-block other-chats" key={person.id}>
                <span className="sidebar-label">{own ? 'Your other chats' : `${displayName(person)}'s other chats`}</span>
                {chats.length ? chats.map((chat) => (
                  /* Sidebar other-chats: link to /chat/ since these are public conversations */
                  <Link to={`/chat/${chat.id}`} key={chat.id}>
                    <span>CCHAT-{String(chat.id).padStart(3, '0')}</span>
                    {displayName(chat.other_participant) || chat.last_message?.text || 'Conversation'}
                    <ChevronRight size={14} />
                  </Link>
                )) : <span className="sidebar-muted">No public chats yet.</span>}
              </div>
            );
          })}
        </aside>
        <section className="conversation">
          <div className="conversation-head">
            <div>
              <span className="thread-id">CCHAT-{String(id).padStart(3, '0')}</span>
              <h1>
                {participants.length ? participants.map((person, index) => (
                  <React.Fragment key={person.id || index}>
                    {index > 0 && <span className="head-sep" aria-hidden="true">×</span>}
                    <span className="head-participant">
                    <ParticipantLink person={person}>{displayName(person)}</ParticipantLink>
                    </span>
                  </React.Fragment>
                )) : 'Public conversation'}
              </h1>
              <p><span className="live-dot" /> {conversation.status || 'ACTIVE'} · {conversation.is_public ? 'public thread' : 'private thread'}</p>
            </div>
            <div className={`conversation-head-actions ${selectionMode ? 'selection-toolbar' : ''}`}>
              {selectionMode ? <>
                <button type="button" className="selection-close" onClick={() => { setSelectionMode(false); setSelectedMessageIds([]); }} aria-label="Cancel selection">×</button>
                <strong>{selectedMessageIds.length} selected</strong>
                <button type="button" className="selection-delete" disabled={!selectedMessageIds.length} onClick={() => requestDeleteMessages(selectedMessageIds)}><Trash2 size={15} /> Delete</button>
              </> : <><button type="button" className="select-messages-button" onClick={() => setSelectionMode(true)} aria-label="Select messages" title="Select messages">Select</button><button type="button" className="report-thread-button" onClick={() => setReportTarget({ type: 'conversation' })} aria-label="Report conversation" title="Report conversation"><Flag size={16} /></button></>}
              <button
                type="button"
                className={`icon-button bookmark-button ${conversation?.is_bookmarked ? 'is-saved' : ''}`}
                onClick={toggleBookmark}
                aria-label={conversation?.is_bookmarked ? 'Remove bookmark' : 'Bookmark thread'}
                aria-pressed={Boolean(conversation?.is_bookmarked)}
                title={conversation?.is_bookmarked ? 'Remove bookmark' : 'Bookmark thread'}
              >
                <Bookmark size={18} fill={conversation?.is_bookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
          {sponsorship && <div className={`sponsor-banner ${sponsorship.user1_accepted && sponsorship.user2_accepted ? 'sponsor-live' : 'sponsor-pending'}`}>{sponsorship.sponsor_logo && <img src={resolveMediaUrl(sponsorship.sponsor_logo)} alt={`${sponsorship.sponsor_name} logo`} className="sponsor-logo" />}<div className="sponsor-copy"><strong>{sponsorship.user1_accepted && sponsorship.user2_accepted ? `Presented by ${sponsorship.sponsor_name}` : `Possible sponsor: ${sponsorship.sponsor_name}`}</strong>{(sponsorship.sponsor_description || sponsorship.sponsor_text) && <span>{sponsorship.sponsor_description || sponsorship.sponsor_text}</span>}{sponsorship.attached_message_link && <Link className="sponsor-message-link" to={sponsorship.attached_message_link}>View attached message <ArrowUpRight size={13} /></Link>}</div>{viewerParticipant && <div className="sponsor-actions"><button onClick={() => voteSponsorship(sponsorship.id, true)} disabled={(viewerParticipant.id === sponsorship.user1 && sponsorship.user1_accepted) || (viewerParticipant.id === sponsorship.user2 && sponsorship.user2_accepted)}>Accept</button><button onClick={() => voteSponsorship(sponsorship.id, false)}>Decline</button></div>}</div>}
          <div className="conversation-stream" ref={streamRef}>
            {messages.length ? messages.map((message) => {
              const historyKey = String(message.id || `${message.timestamp}-${message.text}`);
              return (
                <React.Fragment key={historyKey}>
                  {String(resumeMessageId) === historyKey && <div className="reading-history-marker" aria-label="You were here"><span>You were here</span></div>}
                  <Message
                    historyKey={historyKey}
                    message={message}
                    currentUser={currentUser}
                    participants={participants}
                    onReact={reactMessage}
                    onDelete={(messageId) => requestDeleteMessages([messageId])}
                    onReport={(messageId) => setReportTarget({ type: 'message', id: messageId })}
                    selectionMode={selectionMode}
                    selected={selectedMessageIds.includes(message.id)}
                    onToggleSelect={(messageId) => setSelectedMessageIds((current) => current.includes(messageId) ? current.filter((value) => value !== messageId) : [...current, messageId])}
                    isPublic={conversation.is_public}
                  />
                </React.Fragment>
              );
            }) : <p className="empty-state">No messages yet. Be the first voice in the room.</p>}
            <div className="conversation-end">
              <span>END OF CONVERSATION</span>
              <strong>{ids.length > 1 ? 'Scroll for the next honest thought' : 'You reached the end of this room'} <ArrowUpRight size={16} /></strong>
            </div>
          </div>
          {floating.map((item) => (
            <span
              className="room-floating-emoji"
              style={{ left: item.left, top: item.top }}
              key={item.id}
            >
              {item.emoji}
            </span>
          ))}
          {/* Live audience bar */}
          <div className="audience-bar">
            <span className="audience-bar-label"><Eye size={12} /> {conversation.views ?? 0} watching</span>
            <span className="audience-bar-reactions">
              🔥 {conversation.likes ?? 0} · 💀 {conversation.dislikes ?? 0} · ♥ {conversation.caps ?? 0}
            </span>
          </div>
        </section>
        <aside className="chat-sidebar right-sidebar">
          <div className="related-card">
            <span className="sidebar-label">Thread stats</span>
            <div className="related-art">{conversation.views ?? 0}</div>
            <h3>People are reading this room.</h3>
            <p>{conversation.likes ?? 0} fires · {conversation.dislikes ?? 0} skulls · {conversation.caps ?? 0} hearts</p>
          </div>
          <div className="native-note">
            <span>CCHAT / LIVE</span>
            <strong>Good questions<br />deserve room.</strong>
            <small>Keep the room human.</small>
          </div>
        </aside>
      </main>
      {deleteRequest && <DeleteMessagesModal count={deleteRequest.length} onCancel={() => setDeleteRequest(null)} onConfirm={deleteMessages} deleting={deleting} />}
      {reportTarget && <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} onSubmit={submitReport} submitting={reporting} />}
    </div>
  );
}

/* ─── INBOX: list of private conversations ─── */
function PrivateConversationList({ conversations, activeId, loading, dark, onToggle, onCloseSidebar }) {
  return (
    <aside className="private-inbox-list">
      <div className="private-inbox-list-head">
        <div className="private-inbox-top-actions">
          <Logo />
          <div className="private-inbox-actions"><ThemeToggle dark={dark} onToggle={onToggle} /><Link to="/" className="back-link"><ArrowLeft size={14} /> Feed</Link>{onCloseSidebar && <button type="button" className="private-sidebar-close" onClick={onCloseSidebar} aria-label="Hide conversations"><X size={18} /></button>}</div>
        </div>
        <span className="eyebrow">Private messages</span>
        <h1>Inbox</h1>
        <div className="private-inbox-summary"><span><i className="live-dot" /> {conversations.length ? 'Room ready' : 'Quiet room'}</span><span>{conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}</span></div>
      </div>
      {loading ? (
        <p className="private-muted">Loading conversations…</p>
      ) : conversations.length ? (
        <div className="private-conversation-items">
          {conversations.map((conversation) => {
            const name = displayName(conversation.other_participant);
            return (
              <Link
                className={`private-conversation-row ${String(activeId) === String(conversation.id) ? 'is-active' : ''}`}
                to={`/inbox/${conversation.id}`}
                key={conversation.id}
                onClick={onCloseSidebar}
              >
                <Avatar person={conversation.other_participant || 'Anonymous'} small />
                <span className="private-conversation-copy">
                  <span className="private-conversation-name-row">
                    <strong>{name}</strong>
                    <span
                      className={`eye-icon-mini ${conversation.is_public ? 'eye-open' : 'eye-closed'}`}
                      title={conversation.is_public ? 'Public' : 'Private'}
                      aria-label={conversation.is_public ? 'Public' : 'Private'}
                    >
                      {conversation.is_public ? <Eye size={13} /> : <EyeOff size={13} />}
                    </span>
                  </span>
                  <small>{conversation.last_message?.text || 'No messages yet.'}</small>
                </span>
                <ChevronRight size={15} />
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="private-muted">No private conversations yet.</p>
      )}
    </aside>
  );
}

/* /inbox — redirect to first conversation or show empty state */
function InboxPage() {
  const navigate = useNavigate();
  const [dark, onToggle] = useDarkMode();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!token()) { navigate('/login?next=%2Finbox'); return; }
    axios.get('/api/conversations/', authConfig()).then((response) => setConversations(response.data || [])).finally(() => setLoading(false));
  }, [navigate]);
  if (!token()) return null;
  return (
    <div className={`app-shell private-inbox-shell ${dark ? 'theme-dark' : ''}`}>
      <main className="private-inbox-layout container">
        <PrivateConversationList conversations={conversations} loading={loading} dark={dark} onToggle={onToggle} />
        <section className="private-empty-pane">
          <div className="private-empty-art" aria-hidden="true"><span>✳</span></div>
          <div className="card-topline">
            <span className="thread-id">YOUR ROOM</span>
            <span className="category">DIRECT MESSAGES</span>
          </div>
          <h2>Make room for a real conversation.</h2>
          <p>Choose a private conversation from the index to continue where you left off. Your messages stay between the people in the room until you decide otherwise.</p>
          <div className="private-empty-note"><span className="live-dot" /> Private by default <span>·</span> public by choice</div>
        </section>
      </main>
    </div>
  );
}

/* /inbox/:id — individual private chat */
function PrivateChatPage() {
  const { id } = useParams(); const navigate = useNavigate();
  const [dark, onToggle] = useDarkMode();
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(sessionUser());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [deleteRequest, setDeleteRequest] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [eyeLoading, setEyeLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const socketRef = useRef(null);
  const streamRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const toggleEye = async () => {
    if (!token() || eyeLoading) return;
    setEyeLoading(true);
    try {
      const response = await axios.post(`/api/conversations/${id}/toggle-visibility/`, {}, authConfig());
      const nextPublic = response.data?.is_public ?? !conversation?.is_public;
      setConversation((current) => ({
        ...current,
        is_public: nextPublic,
      }));
      setConversations((current) =>
        current.map((c) =>
          String(c.id) === String(id) ? { ...c, is_public: nextPublic } : c
        )
      );
    } catch { /* ignore */ } finally { setEyeLoading(false); }
  };

  useEffect(() => {
    if (!token()) { navigate(`/login?next=%2Finbox%2F${id}`); return; }
    let active = true;
    setLoading(true);
    Promise.all([
      axios.get('/api/conversations/', authConfig()),
      axios.get(`/api/conversations/${id}/`, authConfig()),
      axios.get('/api/profile/', authConfig()),
    ]).then(([list, detail, profile]) => {
      if (!active) return;
      setConversations(list.data || []);
      setConversation(detail.data.conversation);
      setMessages(detail.data.messages || []);
      const sUser = sessionUser();
      setCurrentUser({
        ...sUser,
        ...profile.data,
        id: sUser?.id || profile.data?.user_id || profile.data?.id,
        user_id: sUser?.id,
      });
    }).catch((err) => {
      if (active) setError(err.response?.data?.error || 'This private conversation is unavailable.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, navigate]);

  /* Scroll to bottom on new messages */
  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!id || !token()) return undefined;
    const wsBase = import.meta.env.VITE_WS_URL || API_URL.replace(/^http/, 'ws');
    const query = `?token=${encodeURIComponent(token())}`;
    const socket = new WebSocket(`${wsBase}/ws/chat/${id}/${query}`);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'receive_message') {
        setMessages((current) => {
          if (data.id && current.some((m) => m.id === data.id)) return current;
          return [...current, {
            id: data.id,
            sender: data.sender_id || data.senderId,
            sender_username: data.sender_username,
            text: data.text,
            timestamp: data.timestamp,
            message_type: data.message_type,
            attachment: data.attachment
          }];
        });
        const myUsername = sessionUser()?.username;
        if (data.sender_username && data.sender_username !== myUsername) playSound('receive');
      }
      if (data.type === 'message_deleted') {
        setMessages((current) => current.filter((message) => String(message.id) !== String(data.messageId)));
      }
    };
    socketRef.current = socket;
    return () => { socket.close(); socketRef.current = null; };
  }, [id]);

  const send = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    playSound('send');
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'send_message', senderId: currentUser?.username, text }));
    } else {
      try { const response = await axios.post('/api/messages/send/', { conversation_id: id, text }, authConfig()); setMessages((current) => [...current, response.data]); }
      catch { setError('Message could not be sent.'); }
    }
  };

  const requestDeleteMessages = (messageIds) => {
    const idsToDelete = [...new Set(messageIds.filter(Boolean))];
    if (idsToDelete.length) setDeleteRequest(idsToDelete);
  };
  const deleteMessages = async () => {
    if (!deleteRequest?.length) return;
    setDeleting(true);
    try {
      await Promise.all(deleteRequest.map((messageId) => axios.delete(`/api/messages/${messageId}/delete/`, authConfig())));
      setMessages((current) => current.filter((message) => !deleteRequest.includes(message.id)));
      setSelectedMessageIds([]);
      setSelectionMode(false);
      setDeleteRequest(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Some messages could not be deleted.');
    } finally { setDeleting(false); }
  };

  const submitReport = async ({ reason, detail }) => { if (!token()) { navigate(`/login?next=%2Finbox%2F${id}`); return; } setReporting(true); try { const targetPath = reportTarget.type === 'message' ? `/api/report/message/${reportTarget.id}/` : `/api/report/conversation/${id}/`; await axios.post(targetPath, { reason, detail }, authConfig()); setReportTarget(null); setError('Report submitted. Thank you for helping keep the room safe.'); } catch (err) { setError(err.response?.data?.error || 'Could not submit this report.'); } finally { setReporting(false); } };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    const isImg = file.type.startsWith('image/');
    const isAud = file.type.startsWith('audio/');
    const msgType = isImg ? 'image' : isAud ? 'audio' : 'file';
    const formData = new FormData();
    formData.append('conversation_id', id);
    formData.append('message_type', msgType);
    formData.append('attachment', file);
    formData.append('text', file.name);
    playSound('send');
    try {
      const response = await axios.post('/api/messages/send/', formData, authConfig());
      setMessages((current) => {
        if (current.some((m) => m.id === response.data.id)) return current;
        return [...current, response.data];
      });
    } catch {
      setError('File could not be uploaded.');
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setRecording(false);
      }
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const formData = new FormData();
        formData.append('conversation_id', id);
        formData.append('message_type', 'audio');
        formData.append('attachment', blob, 'voice_message.webm');
        formData.append('text', 'Voice message');
        playSound('send');
        try {
          const response = await axios.post('/api/messages/send/', formData, authConfig());
          setMessages((current) => {
            if (current.some((m) => m.id === response.data.id)) return current;
            return [...current, response.data];
          });
        } catch {
          setError('Voice message could not be sent.');
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError('Could not access microphone.');
    }
  };

  if (!token()) return null;
  const otherName = displayName(conversation?.other_participant);
  const otherParticipant = conversation?.other_participant;

  return (
    <div className={`app-shell private-inbox-shell ${dark ? 'theme-dark' : ''}`}>
      <main className={`private-inbox-layout container has-active-chat ${sidebarOpen ? 'is-sidebar-open' : ''}`}>
        <PrivateConversationList conversations={conversations} activeId={id} loading={loading} dark={dark} onToggle={onToggle} onCloseSidebar={() => setSidebarOpen(false)} />
        <section className="private-chat-pane">
          {loading ? (
            <div className="private-empty-pane"><p className="private-muted">Loading conversation…</p></div>
          ) : error ? (
            <div className="private-empty-pane"><p className="auth-error">{error}</p></div>
          ) : (
            <>
              <header className="private-chat-head">
                <div className="private-chat-head-main">
                  <button
                    type="button"
                    className="private-sidebar-toggle"
                    onClick={() => setSidebarOpen((open) => !open)}
                    aria-label={sidebarOpen ? 'Hide conversations' : 'Show conversations'}
                    aria-expanded={sidebarOpen}
                  >
                    {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
                  </button>
                  <Link to="/inbox" className="private-back"><ArrowLeft size={16} /> Inbox</Link>
                  <Avatar person={otherParticipant || otherName} small />
                  <div className="private-chat-head-copy">
                    <div className="private-chat-title-row">
                      {otherParticipant?.username
                        ? <Link to={`/profile/${encodeURIComponent(otherParticipant.username)}`} className="private-chat-username"><h2>{otherName}</h2></Link>
                        : <h2>{otherName}</h2>}
                    </div>
                    <p><span className="live-dot" /> {conversation?.is_public ? 'public conversation' : 'private conversation'}</p>
                  </div>
                </div>
                <div className={`private-chat-head-actions ${selectionMode ? 'selection-toolbar' : ''}`}>
                  {selectionMode ? <>
                    <button type="button" className="selection-close" onClick={() => { setSelectionMode(false); setSelectedMessageIds([]); }} aria-label="Cancel selection">×</button>
                    <strong>{selectedMessageIds.length} selected</strong>
                    <button type="button" className="selection-delete" disabled={!selectedMessageIds.length} onClick={() => requestDeleteMessages(selectedMessageIds)}><Trash2 size={15} /> Delete</button>
                  </> : <><button type="button" className="select-messages-button" onClick={() => setSelectionMode(true)} aria-label="Select messages" title="Select messages">Select</button><button type="button" className="report-thread-button" onClick={() => setReportTarget({ type: 'conversation' })} aria-label="Report conversation" title="Report conversation"><Flag size={16} /></button></>}
                  <EyeToggle
                    isPublic={Boolean(conversation?.is_public)}
                    onToggle={toggleEye}
                    disabled={eyeLoading}
                  />
                </div>
              </header>
              <div className="private-message-stream" ref={streamRef}>
                {messages.length ? messages.map((message) => {
                  const isMine = isCurrentUserSender(message, currentUser, otherParticipant);
                  const bgStyle = getMessageBgStyle(message);
                  return (
                    <div className={`private-message-row ${isMine ? 'is-mine' : 'is-other'} ${selectionMode && isMine ? 'is-selectable' : ''} ${selectedMessageIds.includes(message.id) ? 'is-selected' : ''}`} key={message.id || `${message.timestamp}-${message.text}`} onClick={() => { if (selectionMode && isMine) setSelectedMessageIds((current) => current.includes(message.id) ? current.filter((value) => value !== message.id) : [...current, message.id]); }} aria-selected={selectionMode && isMine ? selectedMessageIds.includes(message.id) : undefined}>
                      <Avatar person={isMine ? (currentUser?.username || 'You') : (otherParticipant || otherName)} small />
                      <div className="private-message-body">
                        <div className="private-message-meta">
                          <strong>{isMine ? 'You' : otherName}</strong>
                          <span>{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}</span>
                        </div>
                        <div className="private-message-bubble" style={bgStyle}>
                          {message.message_type === 'image' || (message.attachment && /\.(png|jpe?g|gif|webp|svg)($|\?)/i.test(message.attachment)) ? (
                            <div className="message-attachment">
                              <img src={message.attachment} alt="attachment" className="message-attachment-image" />
                              {message.text && message.text !== 'Image attachment' && <p>{message.text}</p>}
                            </div>
                          ) : message.message_type === 'audio' || (message.attachment && /\.(mp3|wav|ogg|m4a|webm)($|\?)/i.test(message.attachment)) ? (
                            <div className="message-attachment">
                              <VoiceMessagePlayer src={message.attachment} text={message.text} />
                            </div>
                          ) : message.attachment ? (
                            <div className="message-attachment">
                              <a href={message.attachment} download target="_blank" rel="noopener noreferrer" className="message-attachment-file">
                                <Paperclip size={14} /> {message.text || 'Download file'}
                              </a>
                            </div>
                          ) : (
                            <p>{message.text}</p>
                          )}
                        </div>
                        {isMine && <>
                          {selectionMode && <span className={`message-selection-mark ${selectedMessageIds.includes(message.id) ? 'is-selected' : ''}`} aria-hidden="true">{selectedMessageIds.includes(message.id) ? '✓' : ''}</span>}
                          <button type="button" className="private-message-delete" onClick={() => requestDeleteMessages([message.id])} aria-label="Delete your message" title="Delete message"><Trash2 size={14} /></button>
                        </>}
                        {!isMine && <button type="button" className="private-message-report" onClick={() => setReportTarget({ type: 'message', id: message.id })} aria-label="Report message" title="Report message"><Flag size={14} /></button>}
                      </div>
                    </div>
                  );
                }) : <p className="private-muted private-no-messages">No messages yet. Say hello.</p>}
              </div>
              <form className="private-composer" onSubmit={send}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                <button type="button" className="composer-btn" onClick={() => fileInputRef.current?.click()} title="Attach file" aria-label="Attach file">
                  <Paperclip size={17} />
                </button>
                <button type="button" className={`composer-btn ${recording ? 'is-recording' : ''}`} onClick={toggleRecording} title={recording ? 'Stop recording' : 'Record voice message'} aria-label="Voice message">
                  {recording ? <Square size={14} /> : <Mic size={17} />}
                </button>
                <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Message ${otherName}`} aria-label="Private message" />
                <button type="submit" aria-label="Send private message"><Send size={17} /></button>
              </form>
            </>
          )}
        </section>
      </main>
      {deleteRequest && <DeleteMessagesModal count={deleteRequest.length} onCancel={() => setDeleteRequest(null)} onConfirm={deleteMessages} deleting={deleting} />}
      {reportTarget && <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} onSubmit={submitReport} submitting={reporting} />}
    </div>
  );
}

function LoginPage() { const navigate = useNavigate(); const location = useLocation(); const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [googleLoading, setGoogleLoading] = useState(false); const next = new URLSearchParams(location.search).get('next') || '/'; const intent = new URLSearchParams(location.search).get('intent'); const finishLogin = (data) => { saveSession(data); navigate(intent === 'create' ? `${next}?intent=create` : next); }; const google = useGoogleLogin({ onSuccess: async (response) => { setGoogleLoading(true); setError(''); try { const result = await axios.post('/api/auth/google/', { token: response.access_token }); finishLogin(result.data); } catch (err) { setError(err.response?.data?.error || 'Google sign-in failed.'); } finally { setGoogleLoading(false); } }, onError: () => setError('Google sign-in was cancelled or failed.') }); const submit = async (event) => { event.preventDefault(); setLoading(true); setError(''); try { const response = await axios.post('/api/auth/login/', { username, password }); finishLogin(response.data); } catch (err) { setError(err.response?.data?.error || 'Invalid username or password'); } finally { setLoading(false); } }; return <AuthForm title="Log in to CCHAT." intro="Welcome back." submitLabel="Access the room" fields={[['Username', username, setUsername, 'text'], ['Password', password, setPassword, 'password']]} onSubmit={submit} loading={loading} error={error} onGoogle={google} googleLoading={googleLoading} footer={<span>New here? <Link to="/register">Create an identity</Link></span>} />; }
function RegisterPage() { const navigate = useNavigate(); const location = useLocation(); const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' }); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value })); const submit = async (event) => { event.preventDefault(); if (form.password !== form.password2) { setError('Passwords do not match'); return; } setLoading(true); setError(''); try { const response = await axios.post('/api/auth/register/', form); saveSession(response.data); navigate(new URLSearchParams(location.search).get('next') || '/'); } catch (err) { const detail = err.response?.data; setError(detail?.username?.[0] || detail?.email?.[0] || detail?.password?.[0] || detail?.detail || 'Registration failed'); } finally { setLoading(false); } }; return <AuthForm title="Create your identity." intro="Find your people." submitLabel="Create identity" fields={[['Username', form.username, update('username'), 'text'], ['Email', form.email, update('email'), 'email'], ['Password', form.password, update('password'), 'password'], ['Confirm password', form.password2, update('password2'), 'password']]} onSubmit={submit} loading={loading} error={error} footer={<span>Already registered? <Link to="/login">Log in</Link></span>} />; }
function AuthForm({ title, intro, submitLabel, fields, onSubmit, loading, error, onGoogle, googleLoading, footer }) { return <div className="app-shell auth-page"><Header dark={false} onToggle={() => {}} /><main className="auth-layout container"><div className="auth-intro"><span className="eyebrow">CCHAT / ACCESS</span><h1>{intro}<br /><span>here.</span></h1><p>One identity. As much anonymity as you want.</p></div><section className="auth-card"><div className="card-topline"><span className="thread-id">SECURE ENTRY</span><span className="category">CCHAT</span></div><h2>{title}</h2>{error && <div className="auth-error" role="alert">{error}</div>}{onGoogle && <><button type="button" className="google-auth-button" onClick={() => onGoogle()} disabled={googleLoading || loading}><span className="google-mark">G</span>{googleLoading ? 'Connecting…' : 'Continue with Google'}</button><div className="auth-divider"><span>or</span></div></>}<form onSubmit={onSubmit} className="auth-form">{fields.map(([label, value, onChange, type]) => <label key={label}>{label}<input type={type} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} required autoComplete={type === 'password' ? 'current-password' : label.toLowerCase()} /></label>)}<button className="button button-primary auth-submit" type="submit" disabled={loading || googleLoading}>{loading ? 'Working…' : submitLabel} <ArrowUpRight size={17} /></button></form><p className="auth-footnote">{footer}</p></section></main></div>; }
function Footer() {
  return (
    <footer className="site-footer container">
      <Logo />
      <div>
        <Link to="/about">About</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/how-anonymity-works">How anonymity works</Link>
      </div>
      <span>© CCHAT / made for the curious</span>
    </footer>
  );
}
function ProfileStats({ profile, className = '' }) {
  return (
    <div className={`profile-stats ${className}`}>
      <span><strong>{profile.followers_count ?? 0}</strong> followers</span>
      <span><strong>{profile.following_count ?? 0}</strong> following</span>
      <span><strong>{profile.posts_count ?? 0}</strong> posts</span>
      <span><strong>{profile.reactions_received ?? 0}</strong> reactions received</span>
      <span>{memberSince(profile.created_at)}</span>
    </div>
  );
}

/* ─── PROFILE PAGE: /profile/:username ─── */
function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [dark, setDark] = useDarkMode();
  const [profile, setProfile] = useState(null);
  const [chats, setChats] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState('conversations');
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);

  const currentUser = sessionUser();
  const isOwnProfile = currentUser && currentUser.username === username;

  useEffect(() => {
    const fetches = [
      axios.get(`/api/profile/${encodeURIComponent(username)}/`, authConfig()),
      axios.get(`/api/profile/${encodeURIComponent(username)}/conversations/`, authConfig()),
    ];
    if (isOwnProfile) fetches.push(axios.get('/api/bookmarks/', authConfig()));
    Promise.all(fetches).then(([p, c, b]) => {
      setProfile(p.data);
      setChats(c.data || []);
      if (b) setBookmarks(b.data || []);
    }).catch((err) => setError(err.response?.data?.error || 'Profile unavailable.'));
  }, [username]);

  useEffect(() => {
    if (!isOwnProfile) return;
    if (!query.trim()) { setUsers([]); return; }
    const timer = setTimeout(async () => {
      const response = await axios.get(`/api/search/users/?q=${encodeURIComponent(query.trim())}`, authConfig());
      setUsers(response.data || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, isOwnProfile]);


  return (
    <div className={`app-shell ${dark ? 'theme-dark' : ''}`}>
      <Header dark={dark} onToggle={() => setDark(!dark)} />
      {error ? (
        <main className="empty-state container"><h1>{error}</h1></main>
      ) : (
        <main className="profile-page container">
          {profile ? (
            <>
              <div className="profile-hero">
                <Avatar person={profile} />
                <div>
                  <span className="eyebrow">{isOwnProfile ? 'Your room' : 'Public profile'}</span>
                  <h1>@{profile.username}</h1>
                  <p className={`profile-bio ${!profile.bio ? 'is-fallback' : ''}`}>
                    {profile.bio || (isOwnProfile ? 'Your private conversations, in one place.' : 'No bio yet.')}
                  </p>
                </div>
                <div className="profile-hero-actions">
                  {isOwnProfile ? (
                    <>
                      <button className="button button-primary" onClick={() => setFinderOpen((o) => !o)}>
                        Find a user <Search size={16} />
                      </button>
                      <Link className="button" to="/settings">
                        Edit settings <ArrowUpRight size={16} />
                      </Link>
                    </>
                  ) : (
                    <>
                      <button className="button" onClick={() => navigate('/inbox')}>
                        <Search size={16} /> Find a user
                      </button>
                      <button className="button button-primary" onClick={() => setCreateOpen(true)}>
                        Start a chat <ArrowUpRight size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <ProfileStats profile={profile} />

              {/* Owner-only: user finder */}
              {isOwnProfile && finderOpen && (
                <section className="user-finder">
                  <label>Find a user<input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search username" /></label>
                  {users.map((user) => (
                    <Link to={`/profile/${user.username}`} key={user.id}>{user.username} <ArrowUpRight size={14} /></Link>
                  ))}
                </section>
              )}

              <section className="account-list">
                <div className="section-heading">
                  <div>
                    <span className="section-kicker">
                      {isOwnProfile ? 'Your activity' : 'Public activity'}
                    </span>
                    <h2>{isOwnProfile
                      ? (activeTab === 'conversations' ? 'Your conversations' : 'Bookmarks')
                      : 'Public conversations'}
                    </h2>
                  </div>
                  {/* Owner-only: tabs */}
                  {isOwnProfile && (
                    <div className="account-tabs">
                      <button
                        type="button"
                        className={`account-tab ${activeTab === 'conversations' ? 'is-active' : ''}`}
                        onClick={() => setActiveTab('conversations')}
                      >
                        Conversations ({chats.length})
                      </button>
                      <button
                        type="button"
                        className={`account-tab ${activeTab === 'bookmarks' ? 'is-active' : ''}`}
                        onClick={() => setActiveTab('bookmarks')}
                      >
                        <Bookmark size={13} style={{ marginRight: 4, verticalAlign: -1 }} />
                        Bookmarks ({bookmarks.length})
                      </button>
                    </div>
                  )}
                </div>

                {/* Conversations tab (also the only tab for non-owners) */}
                {(!isOwnProfile || activeTab === 'conversations') && (
                  chats.length ? (
                    chats.map((chat) => (
                      <Link
                        className="account-conversation"
                        to={`/inbox/${chat.id}`}
                        key={chat.id}
                      >
                        <div className="account-conv-name">
                          <strong>{displayName(chat.other_participant) || 'Conversation'}</strong>
                        </div>
                        <span>{chat.last_message?.text || 'No messages yet.'}</span>
                        <ChevronRight size={16} />
                      </Link>
                    ))
                  ) : (
                    <div className="account-empty-state">
                      <p>{isOwnProfile ? "You haven't started a thread yet." : "No public conversations yet."}</p>
                      {isOwnProfile && (
                        <button className="button button-primary" onClick={() => setCreateOpen(true)}>
                          Start a thread <ArrowUpRight size={16} />
                        </button>
                      )}
                    </div>
                  )
                )}

                {/* Bookmarks tab — owner only */}
                {isOwnProfile && activeTab === 'bookmarks' && (
                  bookmarks.length ? (
                    bookmarks.map((conversation) => (
                      <Link
                        className="account-conversation"
                        to={conversation.is_public ? `/chat/${conversation.id}` : `/inbox/${conversation.id}`}
                        key={conversation.id}
                      >
                        <div className="account-conv-name">
                          <strong>{displayName(conversation.other_participant) || 'Conversation'}</strong>
                        </div>
                        <span>{conversation.last_message?.text || 'No messages yet.'}</span>
                        <ChevronRight size={16} />
                      </Link>
                    ))
                  ) : (
                    <div className="account-empty-state">
                      <p>You haven't bookmarked any conversations yet.</p>
                      <Link className="button button-primary" to="/explore">
                        Explore topics <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  )
                )}
              </section>
            </>
          ) : <div className="loading-state">Loading profile…</div>}
        </main>
      )}
      {createOpen && <CreateThreadModal initialUsername={isOwnProfile ? '' : username} onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

/* ─── /messages redirect: sends old bookmarks to the owner's profile ─── */
function MessagesRedirect() {
  const user = sessionUser();
  if (!user?.username) return <Navigate to="/login" replace />;
  return <Navigate to={`/profile/${user.username}`} replace />;
}

function AdminDashboardPage() {
  const [dark, setDark] = useDarkMode();
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState([]);
  const [verification, setVerification] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState('');
  const [sponsorForm, setSponsorForm] = useState({ conversation_id: '', sponsor_name: '', sponsor_text: '' });
  const [sponsorLogo, setSponsorLogo] = useState(null);
  const [sponsorSaving, setSponsorSaving] = useState(false);
  const load = async () => {
    try {
      const [summary, reportList, verificationList, sponsorshipList] = await Promise.all([
        axios.get('/api/moderation/dashboard/', authConfig()),
        axios.get('/api/moderation/reports/', authConfig()),
        axios.get('/api/moderation/verification-requests/', authConfig()),
        axios.get('/api/moderation/sponsorships/', authConfig()),
      ]);
      setDashboard(summary.data);
      setReports(reportList.data || []);
      setVerification(verificationList.data || []);
      setSponsorships(sponsorshipList.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.status === 403 ? 'Not authorized.' : 'Could not load the staff dashboard.');
    }
  };
  useEffect(() => { load(); }, []);
  const reviewReport = async (id, action) => { await axios.post(`/api/moderation/reports/${id}/action/`, { action }, authConfig()); load(); };
  const reviewVerification = async (id, action) => { await axios.post(`/api/moderation/verification-requests/${id}/review/`, { action }, authConfig()); load(); };
  const createSponsorship = async (event) => { event.preventDefault(); setSponsorSaving(true); try { const payload = new FormData(); Object.entries(sponsorForm).forEach(([key, value]) => payload.append(key, value)); if (sponsorLogo) payload.append('sponsor_logo', sponsorLogo); await axios.post('/api/moderation/sponsorships/create/', payload, authConfig()); setSponsorForm({ conversation_id: '', sponsor_name: '', sponsor_text: '' }); setSponsorLogo(null); await load(); } catch (err) { setError(err.response?.data?.error || 'Could not create sponsorship.'); } finally { setSponsorSaving(false); } };
  const statItems = dashboard ? [['Users', dashboard.stats.users], ['Rooms', dashboard.stats.conversations], ['Messages', dashboard.stats.messages], ['Active / 7d', dashboard.stats.active_users_7d], ['Reports', dashboard.stats.pending_reports], ['Verification', dashboard.stats.pending_verification]] : [];
  if (error) return <div className={`app-shell ${dark ? 'theme-dark' : ''}`}><Header dark={dark} onToggle={() => setDark(!dark)} /><main className="empty-state container"><h1>{error}</h1></main></div>;
  return (
    <div className={`app-shell ${dark ? 'theme-dark' : ''}`}>
      <Header dark={dark} onToggle={() => setDark(!dark)} />
      <main className="admin-dashboard container">
        <div className="admin-dashboard-head"><div><span className="eyebrow">CCHAT / STAFF CONTROL</span><h1>Command room.</h1><p>Moderate the room, review trust signals, and keep the conversation healthy.</p></div><button className="button" onClick={load}>Refresh <ArrowUpRight size={16} /></button></div>
        <div className="admin-stat-grid">{statItems.map(([label, value]) => <article className="admin-stat-card" key={label}><span>{label}</span><strong>{value ?? '—'}</strong></article>)}</div>
        <nav className="admin-tabs" aria-label="Dashboard sections">{[['overview', 'Overview'], ['reports', `Reports (${reports.length})`], ['verification', `Verification (${verification.length})`], ['sponsorships', `Sponsorships (${sponsorships.length})`]].map(([value, label]) => <button type="button" className={tab === value ? 'is-active' : ''} onClick={() => setTab(value)} key={value}>{label}</button>)}</nav>
        {tab === 'overview' && dashboard && <div className="admin-dashboard-grid"><section className="admin-panel"><div className="admin-panel-head"><span className="section-kicker">Recent people</span><strong>New identities</strong></div>{dashboard.recent_users.map((user) => <div className="admin-row" key={user.id}><strong>@{user.username}</strong><span>{user.verification_status}</span><small>{new Date(user.joined_at).toLocaleDateString()}</small></div>)}</section><section className="admin-panel"><div className="admin-panel-head"><span className="section-kicker">Recent rooms</span><strong>Conversation activity</strong></div>{dashboard.recent_conversations.map((room) => <div className="admin-row" key={room.id}><strong>CCHAT-{String(room.id).padStart(3, '0')}</strong><span>{room.participants.join(' × ') || 'No participants'}</span><small>{room.message_count} messages</small></div>)}</section></div>}
        {tab === 'reports' && <section className="admin-panel admin-queue"><div className="admin-panel-head"><span className="section-kicker">Trust & safety</span><strong>Pending reports</strong></div>{reports.length ? reports.map((report) => <article className="admin-queue-item" key={report.id}><div><strong>{report.reason}</strong><span>{report.target_type} #{report.target_id} · reported by @{report.reporter}</span><p>{report.detail || 'No additional detail.'}</p></div><div className="admin-queue-actions"><button onClick={() => reviewReport(report.id, 'dismiss')}>Dismiss</button><button className="is-danger" onClick={() => reviewReport(report.id, 'remove_content')}>Remove content</button><button className="is-danger" onClick={() => reviewReport(report.id, 'suspend_user')}>Suspend user</button></div></article>) : <p className="empty-state">No pending reports.</p>}</section>}
        {tab === 'verification' && <section className="admin-panel admin-queue"><div className="admin-panel-head"><span className="section-kicker">Identity review</span><strong>Verification requests</strong></div>{verification.length ? verification.map((request) => <article className="admin-queue-item" key={request.profile_id}><div><strong>@{request.username}</strong><span>{request.verification_url}</span><p>{request.verification_text}</p></div><div className="admin-queue-actions"><button onClick={() => reviewVerification(request.profile_id, 'reject')}>Reject</button><button className="is-approve" onClick={() => reviewVerification(request.profile_id, 'approve')}>Approve</button></div></article>) : <p className="empty-state">No pending verification requests.</p>}</section>}
        {tab === 'sponsorships' && <section className="admin-panel admin-queue"><div className="admin-panel-head"><span className="section-kicker">Partner content</span><strong>Create and review</strong></div><form className="admin-sponsor-form" onSubmit={createSponsorship}><input required inputMode="numeric" placeholder="Conversation ID" value={sponsorForm.conversation_id} onChange={(event) => setSponsorForm({ ...sponsorForm, conversation_id: event.target.value })} /><input type="file" accept="image/*" onChange={(event) => setSponsorLogo(event.target.files?.[0] || null)} /><input required placeholder="Sponsor name" value={sponsorForm.sponsor_name} onChange={(event) => setSponsorForm({ ...sponsorForm, sponsor_name: event.target.value })} /><textarea required placeholder="Sponsor description" value={sponsorForm.sponsor_text} onChange={(event) => setSponsorForm({ ...sponsorForm, sponsor_text: event.target.value })} /><input inputMode="numeric" placeholder="Attached message ID / index (optional)" value={sponsorForm.message_id || ''} onChange={(event) => setSponsorForm({ ...sponsorForm, message_id: event.target.value })} /><button className="button button-primary" disabled={sponsorSaving}>{sponsorSaving ? 'Creating…' : 'Create sponsorship'}</button></form>{sponsorships.length ? sponsorships.map((item) => <article className="admin-queue-item" key={item.id}><div>{item.sponsor_logo && <img src={resolveMediaUrl(item.sponsor_logo)} alt="" className="admin-sponsor-logo" />}<strong>{item.sponsor_name}</strong><span>Conversation {item.conversation} · {item.status || 'pending'}{item.attached_message_id ? ` · message #${item.attached_message_id}` : ''}</span><p>{item.sponsor_description || item.sponsor_text || 'No sponsor description.'}</p></div></article>) : <p className="empty-state">No sponsorships yet.</p>}</section>}
      </main>
    </div>
  );
}

function SponsorshipAdminPage() {
  const [profile, setProfile] = useState(null); const [items, setItems] = useState([]); const [form, setForm] = useState({ conversation_id: '', sponsor_name: '', sponsor_text: '' }); const [message, setMessage] = useState('');
  const load = async () => { try { const response = await axios.get('/api/moderation/sponsorships/', authConfig()); setItems(response.data || []); } catch (error) { if (error.response?.status === 403) setMessage('Not authorized'); else setMessage('Could not load sponsorships.'); } };
  useEffect(() => { (async () => { try { const { data } = await axios.get('/api/profile/', authConfig()); setProfile(data); if (data.is_staff) await load(); else setMessage('Not authorized'); } catch { setMessage('Not authorized'); } })(); }, []);
  const submit = async (event) => { event.preventDefault(); setMessage(''); try { await axios.post('/api/moderation/sponsorships/create/', form, authConfig()); setForm({ conversation_id: '', sponsor_name: '', sponsor_text: '' }); setMessage('Sponsorship created.'); load(); } catch (error) { setMessage(error.response?.data?.error || 'Could not create sponsorship.'); } };
  if (message === 'Not authorized' || profile?.is_staff === false) return <div className="app-shell"><Header dark={false} onToggle={() => {}} /><main className="simple-main container"><h1>Not authorized.</h1></main></div>;
  return <div className="app-shell"><Header dark={false} onToggle={() => {}} /><main className="admin-page container"><span className="eyebrow">CCHAT / STAFF</span><h1>Sponsorships.</h1>{message && <p className="settings-status" role="status">{message}</p>}<form className="settings-form admin-form" onSubmit={submit}><label>Conversation ID<input required value={form.conversation_id} onChange={(event) => setForm({ ...form, conversation_id: event.target.value })} /></label><label>Sponsor name<input required value={form.sponsor_name} onChange={(event) => setForm({ ...form, sponsor_name: event.target.value })} /></label><label>Sponsor text<textarea value={form.sponsor_text} onChange={(event) => setForm({ ...form, sponsor_text: event.target.value })} /></label><button className="button button-primary" type="submit">Create sponsorship</button></form><section className="admin-list"><h2>Existing sponsorships</h2>{items.length ? items.map((item) => <article className="admin-item" key={item.id}><strong>{item.sponsor_name}</strong><span>Conversation {item.conversation} · {item.status || (item.user1_accepted && item.user2_accepted ? 'live' : 'pending')}</span><p>{item.sponsor_text}</p></article>) : <p className="empty-state">No sponsorships yet.</p>}</section></main></div>;
}

/* ─── EXPLORE TOPICS PAGE: /explore ─── */
function ExplorePage() {
  const [dark, setDark] = useDarkMode();
  const [threads, setThreads] = useState([]);
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('All');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const topics = ['All', 'Late Night', 'Hot Takes', 'Philosophy', 'Tech & AI', 'Confessions', 'Culture', 'Unfiltered'];

  useEffect(() => {
    let active = true;
    axios.get('/api/chats/recommended/', authConfig())
      .then((res) => {
        if (active) setThreads(res.data || []);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (!term) { setSearchResults(null); setSearching(false); return undefined; }
    let active = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await axios.get(`/api/search/conversations/?q=${encodeURIComponent(term)}`, authConfig());
        if (active) setSearchResults(response.data || []);
      } catch {
        if (active) setSearchResults(null);
      } finally { if (active) setSearching(false); }
    }, 240);
    return () => { active = false; clearTimeout(timer); };
  }, [query]);

  const filteredThreads = useMemo(() => {
    const source = query.trim() && searchResults ? searchResults : threads;
    const topicTerms = {
      'Late Night': ['late', 'night', 'midnight', 'sleep', 'dream', 'insomnia'],
      'Hot Takes': ['hot take', 'opinion', 'controversial', 'unpopular', 'take:'],
      'Philosophy': ['why', 'meaning', 'life', 'truth', 'ethics', 'existence', 'philosophy'],
      'Tech & AI': ['tech', ' ai ', 'code', 'coding', 'computer', 'software', 'app', 'machine'],
      'Confessions': ['confess', 'secret', 'regret', 'admit', 'guilty', 'never told'],
      'Culture': ['music', 'movie', 'film', 'art', 'book', 'fashion', 'game', 'culture'],
    };
    const terms = topicTerms[activeTopic] || [];
    return source.filter((t) => {
      const corpus = [...(t.messages || []).map((m) => m.text || ''), ...(t.participants || []).map((p) => displayName(p))].join(' ').toLowerCase();
      const matchQuery = !query.trim() || Boolean(searchResults) || corpus.includes(query.trim().toLowerCase());
      const matchTopic = activeTopic === 'All' || activeTopic === 'Unfiltered' || terms.some((term) => corpus.includes(term));
      return matchQuery && matchTopic;
    });
  }, [threads, searchResults, query, activeTopic]);

  return (
    <div className={`app-shell ${dark ? 'theme-dark' : ''}`}>
      <Header dark={dark} onToggle={() => setDark(!dark)} />
      <main className="editorial-page container">
        <header className="editorial-header">
          <span className="eyebrow"><Sparkles size={15} /> Topic Index</span>
          <h1>Explore the room.<br /><span>Find every honest angle.</span></h1>
          <p className="lede">
            Discover real conversations happening right now. Search keywords, filter by themes, or dive into breakout debates.
          </p>
          <div className="explore-search-wrap" style={{ marginTop: '24px' }}>
            <input
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter topics, themes, or usernames…"
              aria-label="Search topics"
            />
          </div>
          <div className="explore-filter-bar">
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                className={`explore-topic-btn ${activeTopic === topic ? 'is-active' : ''}`}
                onClick={() => setActiveTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </header>
        {loading ? (
          <div className="thread-grid">
            <div className="thread-card skeleton-card" />
            <div className="thread-card skeleton-card" />
          </div>
        ) : filteredThreads.length ? (
          <div className="thread-grid">
            {filteredThreads.map((thread) => (
              <ThreadCard key={thread.conversation_id} thread={thread} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>{searching ? 'Searching the room…' : `No conversations matched "${query || activeTopic}". Start a new one and bring your topic to the room.`}</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

/* ─── ABOUT PAGE: /about ─── */
function AboutPage() {
  const [dark, setDark] = useDarkMode();
  const navigate = useNavigate();

  return (
    <div className={`app-shell ${dark ? 'theme-dark' : ''}`}>
      <Header dark={dark} onToggle={() => setDark(!dark)} />
      <main className="editorial-page container">
        <header className="editorial-header">
          <span className="eyebrow"><Sparkles size={15} /> About CCHAT</span>
          <h1>Say the thing.<br /><span>Stay unknown.</span></h1>
          <p className="lede">
            CCHAT is a living index of unfiltered, honest conversations between people with nothing to prove and no profiles to polish.
          </p>
        </header>

        <section className="editorial-grid">
          <div className="editorial-card">
            <div>
              <span className="editorial-stamp-num">01 / UNFILTERED DIALOGUE</span>
              <strong>No Profile Posturing</strong>
              <p>
                Social feeds are broken by personal branding. CCHAT removes vanity metrics, follower counts from the conversational stream, and curated avatars so you can focus strictly on raw ideas.
              </p>
            </div>
          </div>
          <div className="editorial-card">
            <div>
              <span className="editorial-stamp-num">02 / DUAL IDENTITY</span>
              <strong>Public by Choice</strong>
              <p>
                Every participant retains sovereign control over their identity. Toggle your visibility between Public (open eye) and Private (closed eye) in real time with a single tap.
              </p>
            </div>
          </div>
          <div className="editorial-card">
            <div>
              <span className="editorial-stamp-num">03 / REAL-TIME PULSE</span>
              <strong>Audience Telemetry</strong>
              <p>
                Watch real reactions ripple through public threads as readers drop fire 🔥, skull 💀, and heart ♥ marks on moments that resonate without invading the speaker's privacy.
              </p>
            </div>
          </div>
        </section>

        <article className="editorial-prose">
          <h2>The CCHAT Philosophy</h2>
          <p>
            We created CCHAT for the in-between thoughts: the hot takes you wouldn’t post on a corporate network, the vulnerable questions you only ask late at night, and the genuine debates that die under algorithms engineered for outrage.
          </p>
          <h2>How it works</h2>
          <ul>
            <li><strong>Start a room:</strong> Pick someone to talk with, or open a public thread for anyone to read.</li>
            <li><strong>Control your visibility:</strong> Use the eye icon next to your name to switch between your public persona and masked anonymity.</li>
            <li><strong>React honestly:</strong> Fire marks heat, skulls mark hard truths, and hearts acknowledge pure authenticity.</li>
          </ul>
        </article>

        <div className="editorial-cta-banner">
          <div>
            <h3>Ready to speak freely?</h3>
            <p>Enter the room with total anonymity. No public profile required.</p>
          </div>
          <button className="button button-primary" onClick={() => navigate('/login?intent=create')}>
            Start a thread <ArrowUpRight size={18} />
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ─── PRIVACY PAGE: /privacy ─── */
function PrivacyPage() {
  const [dark, setDark] = useDarkMode();

  return (
    <div className={`app-shell ${dark ? 'theme-dark' : ''}`}>
      <Header dark={dark} onToggle={() => setDark(!dark)} />
      <main className="editorial-page container">
        <header className="editorial-header">
          <span className="eyebrow"><Sparkles size={15} /> Security & Integrity</span>
          <h1>Privacy.<br /><span>No fine print.</span></h1>
          <p className="lede">
            Privacy on CCHAT is not a hidden checklist in settings. It is built into every layer of our protocol.
          </p>
        </header>

        <section className="editorial-grid">
          <div className="editorial-card">
            <div>
              <span className="editorial-stamp-num">01 / PSEUDONYMITY</span>
              <strong>Masked Personas</strong>
              <p>
                In anonymous mode, your real username is never transmitted to other readers. We assign randomly generated aliases per conversation to prevent cross-thread profiling.
              </p>
            </div>
          </div>
          <div className="editorial-card">
            <div>
              <span className="editorial-stamp-num">02 / EYE TOGGLE</span>
              <strong>Granular Consent</strong>
              <p>
                Your conversation side is private by default until you deliberately click the Eye Toggle. You can revert to private mode at any time, instantly masking all associated messages.
              </p>
            </div>
          </div>
          <div className="editorial-card">
            <div>
              <span className="editorial-stamp-num">03 / NO SURVEILLANCE</span>
              <strong>Zero Ad Trackers</strong>
              <p>
                We do not sell user data, embed third-party tracking pixels, or build behavioral ad profiles. Your thoughts belong solely to the room.
              </p>
            </div>
          </div>
        </section>

        <article className="editorial-prose">
          <h2>Data Protection Principles</h2>
          <p>
            We believe you own your conversations. Below is how we treat your information:
          </p>
          <ul>
            <li><strong>Session Authentication:</strong> Industry-standard JWT tokens stored securely in local browser storage, revocable on logout.</li>
            <li><strong>Message Deletion:</strong> Authors can delete or edit their messages with real-time updates.</li>
            <li><strong>Account Deactivation:</strong> Instantly wipes your public presence from all live discovery feeds.</li>
          </ul>
        </article>
      </main>
      <Footer />
    </div>
  );
}

/* ─── HOW ANONYMITY WORKS PAGE: /how-anonymity-works ─── */
function HowAnonymityWorksPage() {
  const [dark, setDark] = useDarkMode();
  const [demoPublic, setDemoPublic] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={`app-shell ${dark ? 'theme-dark' : ''}`}>
      <Header dark={dark} onToggle={() => setDark(!dark)} />
      <main className="editorial-page container">
        <header className="editorial-header">
          <span className="eyebrow"><Sparkles size={15} /> Protocol Guide</span>
          <h1>How anonymity works<br /><span>on CCHAT.</span></h1>
          <p className="lede">
            A step-by-step breakdown of how CCHAT balances genuine human connection with total identity protection.
          </p>
        </header>

        <section className="editorial-grid">
          <div className="editorial-card">
            <div>
              <span className="editorial-stamp-num">STEP 01</span>
              <strong>The Dual Identity</strong>
              <p>
                When you create an account, you have a private registered identity. Inside individual threads, you can choose to broadcast your handle or remain completely unknown with an automatic masked persona.
              </p>
            </div>
          </div>
          <div className="editorial-card">
            <div>
              <span className="editorial-stamp-num">STEP 02</span>
              <strong>The Eye Icon Toggle</strong>
              <p>
                Next to every participant in a chat, the Eye Icon indicates status:
                <br /><br />
                • <strong>Open Eye:</strong> Public side — visible to audience readers.
                <br />
                • <strong>Closed / Slashed Eye:</strong> Private side — visible only to direct chat participants.
              </p>
            </div>
          </div>
          <div className="editorial-card">
            <div>
              <span className="editorial-stamp-num">STEP 03</span>
              <strong>Independent Consent</strong>
              <p>
                One participant can choose to be public while the other stays anonymous. A room only becomes fully public when both sides permit visibility.
              </p>
            </div>
          </div>
        </section>

        <section className="editorial-card" style={{ margin: '48px 0', padding: '32px' }}>
          <span className="eyebrow">Interactive Demo</span>
          <h2 style={{ fontSize: '28px', letterSpacing: '-0.05em', margin: '8px 0 16px' }}>Try the Eye Toggle</h2>
          <p style={{ font: '13px/1.5 var(--mono)', color: 'var(--muted)', marginBottom: '20px' }}>
            Click the button below to see how your message appearance changes from Private to Public in real time:
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <EyeToggle
              isPublic={demoPublic}
              onToggle={() => setDemoPublic(!demoPublic)}
            />
            <span style={{ font: '12px var(--mono)', color: demoPublic ? 'var(--accent)' : 'var(--muted)' }}>
              Current state: <strong>{demoPublic ? 'PUBLIC (Visible to room)' : 'PRIVATE (Hidden from room)'}</strong>
            </span>
          </div>
          <div className={`message-row ${demoPublic ? 'message-mine' : 'message-other'}`} style={{ margin: '16px 0' }}>
            <Avatar person={demoPublic ? (sessionUser()?.username || 'You') : 'Anonymous'} small />
            <div className="message-body">
              <div className="message-meta">
                <strong>{demoPublic ? (sessionUser()?.username ? `@${sessionUser()?.username}` : 'You (Public)') : 'Anonymous Panther'}</strong>
                <span>now</span>
              </div>
              <p>{demoPublic ? 'This message is broadcast to the public feed with your identity.' : 'This message is masked with an anonymous identity.'}</p>
            </div>
          </div>
        </section>

        <div className="editorial-cta-banner">
          <div>
            <h3>Start an honest conversation</h3>
            <p>Experience the freedom of speaking with zero judgment.</p>
          </div>
          <button className="button button-primary" onClick={() => navigate('/login?intent=create')}>
            Open a conversation <ArrowUpRight size={18} />
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AmbientLayer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Public/anonymous threads */}
        <Route path="/chat/:id" element={<ChatPage />} />
        {/* Explore topics & discussions */}
        <Route path="/explore" element={<ExplorePage />} />
        {/* Editorial information pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/how-anonymity-works" element={<HowAnonymityWorksPage />} />
        {/* Inbox: list of private conversations */}
        <Route path="/inbox" element={<InboxPage />} />
        {/* Private chat: individual private conversation */}
        <Route path="/inbox/:id" element={<PrivateChatPage />} />
        {/* /messages: redirect to own profile; /messages/:id stays as private chat alias */}
        <Route path="/messages" element={<MessagesRedirect />} />
        <Route path="/messages/:id" element={<PrivateChatPage />} />
        {/* Profile page */}
        <Route path="/profile/:username" element={<ProfilePage />} />
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/sponsorships" element={<SponsorshipAdminPage />} />
      </Routes>
    </Router>
  );
}
