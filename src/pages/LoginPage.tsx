import React, { useState } from 'react';

// Shared double chat-bubble logo icon (duplicated locally so LoginPage is standalone)
const CchatLogoIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
    xmlns="http://www.w3.org/2000/svg" className="text-blue-400 stroke-current">
    <rect x="2" y="3" width="14" height="10" rx="3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 13L2 16L6 13" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 14V17C8 18.1046 8.89543 19 10 19H17L21 21L20.2 18.2C21.3 17.5 22 16.3 22 15C22 13.8954 21.1046 13 20 13H18"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface LoginPageProps {
  onLogin: (handle: string) => void;
}

type Tab = 'login' | 'signup';

export function LoginPage({ onLogin }: LoginPageProps) {
  const [tab, setTab] = useState<Tab>('login');

  // Login state
  const [loginHandle, setLoginHandle] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign up state
  const [signupHandle, setSignupHandle] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // ── Login submit ─────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginHandle.trim() || !loginPassword.trim()) {
      setLoginError('Please fill in all fields.');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: loginHandle.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.detail || 'Invalid handle or password.');
      } else {
        onLogin(data.handle || loginHandle.trim());
      }
    } catch {
      setLoginError('Cannot reach server. Make sure the backend is running.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Sign-up submit ───────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');
    if (!signupHandle.trim() || !signupDisplayName.trim() || !signupPassword.trim()) {
      setSignupError('Please fill in all fields.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    setSignupLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: signupHandle.trim().startsWith('@') ? signupHandle.trim() : `@${signupHandle.trim()}`,
          display_name: signupDisplayName.trim(),
          password: signupPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignupError(data.detail || Object.values(data).flat().join(' ') || 'Sign-up failed.');
      } else {
        setSignupSuccess('Account created! You can now log in.');
        setTab('login');
        setLoginHandle(signupHandle.trim().startsWith('@') ? signupHandle.trim() : `@${signupHandle.trim()}`);
      }
    } catch {
      setSignupError('Cannot reach server. Make sure the backend is running.');
    } finally {
      setSignupLoading(false);
    }
  };

  // ── Demo / bypass login (for local dev) ─────────────────────
  const handleDemoLogin = () => {
    onLogin('@mayamaybe');
  };

  return (
    <div className="h-screen w-screen bg-[#09090f] text-slate-100 flex font-sans overflow-hidden">
      {/* ── Left panel — branding ─────────────────────────────── */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-14 border-r border-[#171722] bg-[#080810] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3">
          <CchatLogoIcon />
          <span className="text-2xl font-black tracking-tight text-white">CCHAT</span>
        </div>

        {/* Hero text */}
        <div className="space-y-5 relative z-10">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 font-mono">
            Real chats. Main-character energy.
          </div>
          <h1 className="text-4xl font-black text-white leading-[1.15] tracking-tight">
            A little less posting.<br />A lot more plot.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            Share your best conversations with the world — or keep them just between you. CCHAT is where real talk goes public.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['Public excerpts', 'Anonymous by default', 'React with vibes', 'Save the plot twists'].map(f => (
              <span key={f} className="text-[11px] font-semibold text-slate-400 bg-[#141422] border border-[#232338] px-3 py-1.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <div className="text-[11px] text-slate-600 font-mono">
          © 2026 CCHAT. Keep it human.
        </div>
      </div>

      {/* ── Right panel — auth form ───────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <CchatLogoIcon />
          <span className="text-xl font-black tracking-tight text-white">CCHAT</span>
        </div>

        <div className="w-full max-w-sm space-y-7">
          {/* Heading */}
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {tab === 'login' ? 'Welcome back.' : 'Join the chat.'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {tab === 'login'
                ? 'Sign in to your CCHAT account.'
                : 'Create an account. No algorithm required.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl bg-[#111120] border border-[#1e1e2e] p-1 gap-1">
            {(['login', 'signup'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setLoginError(''); setSignupError(''); setSignupSuccess(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  tab === t
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ──────────────────────────────────── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {signupSuccess && (
                <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                  {signupSuccess}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Handle</label>
                <input
                  type="text"
                  value={loginHandle}
                  onChange={e => setLoginHandle(e.target.value)}
                  placeholder="@mayamaybe"
                  autoComplete="username"
                  className="w-full bg-[#0f0f1a] border border-[#212132] focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400">Password</label>
                  <button type="button" className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer">
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#0f0f1a] border border-[#212132] focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>

              {loginError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] cursor-pointer"
              >
                {loginLoading ? 'Signing in…' : 'Sign in'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#1e1e2e]" />
                <span className="text-[11px] text-slate-600 font-semibold">OR</span>
                <div className="flex-1 h-px bg-[#1e1e2e]" />
              </div>

              {/* Demo bypass */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-3 rounded-xl bg-[#111120] hover:bg-[#18182a] border border-[#232338] text-slate-300 hover:text-white font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                Continue as Maya (demo)
              </button>
            </form>
          )}

          {/* ── SIGN UP FORM ─────────────────────────────────── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Display name</label>
                <input
                  type="text"
                  value={signupDisplayName}
                  onChange={e => setSignupDisplayName(e.target.value)}
                  placeholder="Maya Chen"
                  autoComplete="name"
                  className="w-full bg-[#0f0f1a] border border-[#212132] focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Handle</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold select-none">@</span>
                  <input
                    type="text"
                    value={signupHandle.startsWith('@') ? signupHandle.slice(1) : signupHandle}
                    onChange={e => setSignupHandle(e.target.value)}
                    placeholder="mayamaybe"
                    autoComplete="username"
                    className="w-full bg-[#0f0f1a] border border-[#212132] focus:border-blue-500 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-[#0f0f1a] border border-[#212132] focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Confirm password</label>
                <input
                  type="password"
                  value={signupConfirm}
                  onChange={e => setSignupConfirm(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-[#0f0f1a] border border-[#212132] focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>

              {signupError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
                  {signupError}
                </div>
              )}

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] cursor-pointer"
              >
                {signupLoading ? 'Creating account…' : 'Create account'}
              </button>

              <p className="text-[11px] text-slate-600 text-center leading-relaxed">
                By signing up you agree to our{' '}
                <span className="text-blue-400 hover:underline cursor-pointer">Community rules</span>{' '}
                and{' '}
                <span className="text-blue-400 hover:underline cursor-pointer">Privacy policy</span>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
