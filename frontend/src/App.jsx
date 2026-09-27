/* Hallmark · macrostructure: Marquee + live index · tone: tactile editorial · anchor hue: hot-pink */
import React, { useState } from 'react';
import { BrowserRouter as Router, Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Bookmark, ChevronRight, Eye, Flame, Heart, Moon, Search, Send, Skull, Sparkles, Sun } from 'lucide-react';
import axios from 'axios';
import './index.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const storedAccessToken = localStorage.getItem('access');
if (storedAccessToken) axios.defaults.headers.common.Authorization = `Bearer ${storedAccessToken}`;

const threads = [
  { id: 'CCHAT-031', title: 'Is ambition a love language?', category: 'LIFE / WORK', time: '4m ago', views: '1.8k', participants: [{ name: 'Maya', initials: 'MY', tone: 'pink' }, { name: 'Anon', initials: '?', tone: 'black' }], messages: [['Maya', 'I think ambition is just care with a calendar.'], ['Anon', 'Or fear wearing a very nice watch.'], ['Maya', 'Both can be true, honestly.']], counts: { fire: 42, skull: 9, heart: 18 } },
  { id: 'CCHAT-028', title: 'The internet made us lonelier?', category: 'CULTURE', time: '18m ago', views: '920', participants: [{ name: 'Rin', initials: 'RN', tone: 'yellow' }, { name: 'Jules', initials: 'JL', tone: 'blue' }], messages: [['Rin', 'We have never had more ways to be perceived.'], ['Jules', 'Perceived is not the same as known.'], ['Rin', 'That distinction is doing a lot of work.']], counts: { fire: 31, skull: 6, heart: 27 } },
  { id: 'CCHAT-019', title: 'Would you move for a better life?', category: 'BIG QUESTIONS', time: '42m ago', views: '2.4k', participants: [{ name: 'Sana', initials: 'SN', tone: 'green' }, { name: 'Anon', initials: '?', tone: 'black' }], messages: [['Sana', 'A better life is usually more ordinary than we imagine.'], ['Anon', 'Ordinary sounds expensive right now.'], ['Sana', 'Fair. Let’s start with a smaller apartment.']], counts: { fire: 58, skull: 12, heart: 33 } },
  { id: 'CCHAT-014', title: 'Hot take: rest is a skill', category: 'OFF THE CLOCK', time: '1h ago', views: '670', participants: [{ name: 'Noah', initials: 'NH', tone: 'purple' }, { name: 'K', initials: 'K', tone: 'orange' }], messages: [['Noah', 'I scheduled a nap and it changed my whole week.'], ['K', 'Scheduling joy feels illegal.'], ['Noah', 'Then we need better laws.']], counts: { fire: 26, skull: 4, heart: 44 } }
];
const liveThreads = ['CCHAT-031', 'CCHAT-033', 'CCHAT-028', 'CCHAT-035'];

function Avatar({ person, small = false }) { return <span className={`avatar avatar-${person.tone} ${small ? 'avatar-small' : ''}`} aria-label={`${person.name} avatar`}>{person.initials}</span>; }
function Logo() { return <Link to="/" className="logo" aria-label="CCHAT home">C<span>CHAT</span><i>.</i></Link>; }
function Header({ dark, onToggle }) { const storedUser = localStorage.getItem('user'); let username = ''; try { username = storedUser ? JSON.parse(storedUser).username : ''; } catch { username = ''; } return <header className="site-header"><Logo /><div className="header-actions"><button className="icon-button search-toggle" aria-label="Search threads"><Search size={18} /></button><Link className="header-link explore-link" to="/">Explore topics</Link><button className="theme-toggle" onClick={onToggle} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}>{dark ? <Sun size={16} /> : <Moon size={16} />}<span>{dark ? 'Light' : 'Dark'}</span></button>{username ? <Link className="login-link account-link" to="/messages">@{username} <ArrowUpRight size={15} /></Link> : <Link className="login-link" to="/login">Log in <ArrowUpRight size={15} /></Link>}</div></header>; }
function LiveStrip() { return <section className="live-strip" aria-label="Live conversations"><div className="live-label"><span className="live-dot" /> LIVE NOW <span className="live-count">12 conversations</span></div><div className="live-scroll">{liveThreads.map((id, i) => <Link key={id} to={`/chat/${id.replace('CCHAT-', '')}`} className="live-thread"><span>{id}</span><b>{['the group chat is…', 'is nostalgia useful?', 'internet loneliness', 'what counts as work?'][i]}</b><ChevronRight size={15} /></Link>)}</div></section>; }
function ReactionButton({ icon, label, count, onClick }) { const Icon = icon; return <button className="reaction-button" onClick={onClick} aria-label={`React ${label}`}><Icon size={14} strokeWidth={2.4} /><span className="reaction-count">{count}</span></button>; }
function ReactionRow({ counts }) { const [state, setState] = useState(counts); const bump = (key) => setState((current) => ({ ...current, [key]: current[key] + 1 })); return <div className="reaction-row" aria-live="polite"><ReactionButton icon={Flame} label="fire" count={state.fire} onClick={() => bump('fire')} /><ReactionButton icon={Skull} label="skull" count={state.skull} onClick={() => bump('skull')} /><ReactionButton icon={Heart} label="heart" count={state.heart} onClick={() => bump('heart')} /></div>; }
function ThreadCard({ thread }) { return <article className="thread-card"><div className="card-topline"><span className="thread-id">{thread.id}</span><span className="category">{thread.category}</span></div><h3>{thread.title}</h3><div className="card-participants">{thread.participants.map((p) => <span className="participant-chip" key={p.name}><Avatar person={p} small /><span>{p.name}</span></span>)}</div><div className="preview-stack">{thread.messages.map(([speaker, message], i) => <div className={`preview-line ${i === 2 ? 'preview-fade' : ''}`} key={`${speaker}-${message}`}><span>{speaker}</span><p>{message}</p></div>)}</div><div className="card-bottom"><ReactionRow counts={thread.counts} /><span className="card-stat"><Eye size={14} /> {thread.views}</span><span className="card-time">{thread.time}</span><Link className="open-thread" to={`/chat/${thread.id.replace('CCHAT-', '')}`} aria-label={`Open ${thread.title}`}>Open thread <ArrowUpRight size={15} /></Link></div></article>; }

function LandingPage() { const [dark, setDark] = useState(false); return <div className={`app-shell ${dark ? 'theme-dark' : ''}`}><Header dark={dark} onToggle={() => setDark(!dark)} /><main><section className="hero container"><div className="hero-copy"><div className="eyebrow"><Sparkles size={15} /> Public by default</div><h1>Say the thing.<br /><span>Stay unknown.</span></h1><p className="hero-lede">CCHAT is a living index of honest conversations between people who have nothing to prove.</p><div className="hero-actions"><Link to="/chat/031" className="button button-primary">Enter the conversation <ArrowUpRight size={18} /></Link><Link to="/login" className="text-link">Start a new thread <ArrowUpRight size={15} /></Link></div></div><div className="hero-side"><p className="side-note">A place for the in-between thoughts. The hot takes. The questions you only ask after midnight.</p><div className="feature-pills"><span>Unfiltered</span><span>Real-time</span><span>Anonymous</span></div><div className="hero-stamp"><span>01</span><strong>NO PROFILE<br />REQUIRED</strong><small>Read everything.<br />Reply when ready.</small></div></div></section><div className="container"><LiveStrip /></div><section className="feed-section container"><div className="section-heading"><div><span className="section-kicker">The public feed</span><h2>Fresh from the room</h2></div><div className="feed-controls"><button className="filter-chip active">All threads</button><button className="filter-chip">Most alive</button><button className="filter-chip">Newest</button></div></div><div className="thread-grid">{threads.map((thread) => <ThreadCard key={thread.id} thread={thread} />)}</div></section></main><Footer /></div>; }

function Message({ person, children, time, mine }) { return <div className={`message-row ${mine ? 'message-mine' : ''}`}><Avatar person={person} small /><div className="message-body"><div className="message-meta"><strong>{person.name}</strong><span>{time}</span></div><p>{children}</p><div className="message-reactions"><button aria-label="React with fire">🔥</button><button aria-label="React with heart">♥</button></div></div></div>; }
function ChatPage() { const { id } = useParams(); const [dark, setDark] = useState(false); const [sent, setSent] = useState(false); const thread = threads[0]; const maya = thread.participants[0]; const anon = thread.participants[1]; return <div className={`app-shell chat-shell ${dark ? 'theme-dark' : ''}`}><Header dark={dark} onToggle={() => setDark(!dark)} /><main className="chat-layout container"><aside className="chat-sidebar left-sidebar"><Link to="/" className="back-link"><ArrowLeft size={16} /> Back to feed</Link><div className="sidebar-block"><span className="sidebar-label">In this thread</span><div className="sidebar-people"><div><Avatar person={maya} /><strong>Maya</strong><small>public</small></div><div><Avatar person={anon} /><strong>Anon</strong><small>hidden by choice</small></div></div></div><div className="sidebar-block other-chats"><span className="sidebar-label">Other chats</span>{['Is the group chat dead?', 'Should I leave my job?', 'A good life, badly explained'].map((title, i) => <Link to={`/chat/${19 + i}`} key={title}><span>CCHAT-0{19 + i}</span>{title}<ChevronRight size={14} /></Link>)}</div></aside><section className="conversation"><div className="conversation-head"><div><span className="thread-id">CCHAT-{id || '031'}</span><h1>{thread.title}</h1><p><span className="live-dot" /> 2 people are here · public thread</p></div><button className="icon-button" aria-label="Bookmark thread"><Bookmark size={18} /></button></div><div className="conversation-stream"><div className="stream-note">Tuesday, 11:42 PM <span>·</span> Topic opened by Maya</div><Message person={maya} time="11:42 PM">I think ambition is just care with a calendar.</Message><Message person={anon} time="11:43 PM">Or fear wearing a very nice watch.</Message><Message person={maya} time="11:45 PM" mine>Both can be true, honestly. The best people I know are a little scared and still show up.</Message><div className="conversation-end"><span>END OF CONVERSATION</span><strong>Scroll for the next honest thought <ArrowUpRight size={16} /></strong></div></div><div className="reaction-dock"><span>React to the room</span><button aria-label="Fire reaction" onClick={() => setSent(true)}>🔥</button><button aria-label="Skull reaction">💀</button><button aria-label="Heart reaction">♥</button><Link to="/login" className="reply-cta">{sent ? 'Reaction sent' : 'Log in to reply'} <Send size={15} /></Link></div></section><aside className="chat-sidebar right-sidebar"><div className="related-card"><span className="sidebar-label">Related thread</span><div className="related-art">?</div><h3>What does a good life look like offline?</h3><p>Two strangers, zero advice, one surprisingly useful hour.</p><Link to="/chat/019">Open thread <ArrowUpRight size={14} /></Link></div><div className="native-note"><span>SUPPORTED BY CCHAT</span><strong>Good questions<br />deserve room.</strong><small>Keep the room human.</small></div></aside></main></div>; }
function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login/', { username, password });
      localStorage.setItem('access', response.data.tokens.access);
      localStorage.setItem('refresh', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      axios.defaults.headers.common.Authorization = `Bearer ${response.data.tokens.access}`;
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return <div className="app-shell auth-page"><Header dark={false} onToggle={() => {}} /><main className="auth-layout container"><div className="auth-intro"><span className="eyebrow">Back in the room</span><h1>Welcome<br /><span>back.</span></h1><p>Pick up the conversations you left open.</p></div><section className="auth-card"><div className="card-topline"><span className="thread-id">CCHAT / ACCESS</span><span className="category">SECURE ENTRY</span></div><h2>Log in to CCHAT.</h2>{error && <div className="auth-error" role="alert">{error}</div>}<form onSubmit={handleLogin} className="auth-form"><label>Username<input type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="your_username" autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="current-password" required /></label><button className="button button-primary auth-submit" type="submit" disabled={loading}>{loading ? 'Checking…' : 'Access the room'} <ArrowUpRight size={17} /></button></form><p className="auth-footnote">New here? <Link to="/register">Create an identity</Link></p></section></main></div>;
}
function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.password2) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register/', form);
      localStorage.setItem('access', response.data.tokens.access);
      localStorage.setItem('refresh', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      axios.defaults.headers.common.Authorization = `Bearer ${response.data.tokens.access}`;
      navigate('/');
    } catch (err) {
      const detail = err.response?.data;
      setError(detail?.username?.[0] || detail?.email?.[0] || detail?.password?.[0] || detail?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return <div className="app-shell auth-page"><Header dark={false} onToggle={() => {}} /><main className="auth-layout container"><div className="auth-intro"><span className="eyebrow">Make a little noise</span><h1>Find your<br /><span>people.</span></h1><p>One identity. As much anonymity as you want.</p></div><section className="auth-card"><div className="card-topline"><span className="thread-id">CCHAT / JOIN</span><span className="category">NO PROFILE REQUIRED</span></div><h2>Create your identity.</h2>{error && <div className="auth-error" role="alert">{error}</div>}<form onSubmit={handleRegister} className="auth-form"><label>Username<input type="text" value={form.username} onChange={update('username')} placeholder="your_username" autoComplete="username" required /></label><label>Email<input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input type="password" value={form.password} onChange={update('password')} placeholder="••••••••" autoComplete="new-password" required /></label><label>Confirm password<input type="password" value={form.password2} onChange={update('password2')} placeholder="••••••••" autoComplete="new-password" required /></label><button className="button button-primary auth-submit" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create identity'} <ArrowUpRight size={17} /></button></form><p className="auth-footnote">Already registered? <Link to="/login">Log in</Link></p></section></main></div>;
}
function SimplePage({ title }) { return <div className="app-shell simple-page"><Header dark={false} onToggle={() => {}} /><main className="simple-main container"><Link to="/" className="back-link"><ArrowLeft size={16} /> Back home</Link><h1>{title}</h1><p>This view is ready for the existing CCHAT flow.</p></main></div>; }
function Footer() { return <footer className="site-footer container"><Logo /><div><Link to="/">About</Link><Link to="/">Privacy</Link><Link to="/">How anonymity works</Link></div><span>© CCHAT / made for the curious</span></footer>; }
export default function App() { return <Router><Routes><Route path="/" element={<LandingPage />} /><Route path="/chat/:id" element={<ChatPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/messages" element={<SimplePage title="Your messages." />} /><Route path="/settings" element={<SimplePage title="Your settings." />} /></Routes></Router>; }
