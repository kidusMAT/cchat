import React, { useState, useEffect } from 'react';
import { cchatApi, UserProfile } from '../services/api';
import { CchatLogo } from '../components/CchatLogo';
import { Button, Badge } from '../components/ui';

interface LoginPageProps {
  onLogin: (user: UserProfile | string) => void;
}

type Tab = 'login' | 'signup';

const FEATURES = [
  'Public excerpts',
  'Anonymous by default',
  'React with vibes',
  'Save the plot twists',
];

// Demo identities are for local preview builds only. Production bundles never
// render the control, even if a build environment mistakenly sets the flag.
const DEMO_LOGIN_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';

interface FieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  leading?: string;
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  leading,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-ink-muted">
        {label}
      </label>
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none text-sm font-bold text-ink-faint">
            {leading}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border border-line-2 bg-canvas-2 py-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-none ${
            leading ? 'pl-8 pr-4' : 'px-4'
          }`}
        />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [tab, setTab] = useState<Tab>('login');

  const [loginHandle, setLoginHandle] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get('oauth_error');
      if (oauthError) return `Google sign-in could not be completed: ${oauthError}`;
    }
    return '';
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGoogleEnabled, setIsGoogleEnabled] = useState(true);

  const [signupHandle, setSignupHandle] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    cchatApi.getOAuthStatus()
      .then((status) => {
        if (isMounted) setIsGoogleEnabled(status.google_enabled);
      })
      .catch(() => {
        if (isMounted) setIsGoogleEnabled(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginHandle.trim() || !loginPassword.trim()) {
      setLoginError('Please fill in all fields.');
      return;
    }
    setLoginLoading(true);
    try {
      const data = await cchatApi.login(loginHandle.trim(), loginPassword);
      localStorage.setItem('cchat_logged_in', 'true');
      if (data.user) {
        localStorage.setItem('cchat_user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        onLogin(loginHandle.trim());
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid username/handle or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setGoogleLoading(true);
    try {
      const url = await cchatApi.getGoogleLoginUrl();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Google authorization URL not returned');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Google sign-in is currently unavailable.');
      setGoogleLoading(false);
    }
  };

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
      const cleanHandle = signupHandle.trim().startsWith('@')
        ? signupHandle.trim()
        : `@${signupHandle.trim()}`;
      const data = await cchatApi.register({
        username: cleanHandle.replace(/^@/, ''),
        handle: cleanHandle,
        display_name: signupDisplayName.trim(),
        password: signupPassword,
      });
      localStorage.setItem('cchat_logged_in', 'true');
      if (data.user) {
        localStorage.setItem('cchat_user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setSignupSuccess('Account created! You can now log in.');
        setTab('login');
        setLoginHandle(cleanHandle);
      }
    } catch (err: any) {
      setSignupError(err.message || 'Sign-up failed.');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const data = await cchatApi.demoLogin('maya');
      localStorage.setItem('cchat_logged_in', 'true');
      if (data.user) {
        localStorage.setItem('cchat_user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        onLogin('@mayamaybe');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Demo sign-in is unavailable.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas-deep font-sans text-ink">
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden border-r border-line bg-canvas p-14 lg:flex">
        <div className="flex items-center gap-3">
          <CchatLogo size={36} />
          <span className="text-2xl font-black tracking-tight text-white">CCHAT</span>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-accent">
            Real chats. Main-character energy.
          </div>
          <h1 className="text-4xl font-black leading-[1.15] tracking-tight text-white">
            A little less posting.
            <br />A lot more plot.
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
            Share your best conversations with the world — or keep them just between
            you. CCHAT is where real talk goes public.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {FEATURES.map((f) => (
              <Badge key={f} className="px-3 py-1.5">
                {f}
              </Badge>
            ))}
          </div>
        </div>

        <div className="font-mono text-[11px] text-ink-faint">
          © 2026 CCHAT. Keep it human.
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
        <div className="mb-10 flex items-center gap-2 lg:hidden">
          <CchatLogo size={30} />
          <span className="text-xl font-black tracking-tight text-white">CCHAT</span>
        </div>

        <div className="w-full max-w-sm space-y-7">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {tab === 'login' ? 'Welcome back.' : 'Join the chat.'}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {tab === 'login'
                ? 'Sign in to your CCHAT account.'
                : 'Create an account. No algorithm required.'}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Authentication"
            className="flex gap-1 rounded-xl border border-line-2 bg-canvas-2 p-1"
          >
            {(['login', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => {
                  setTab(t);
                  setLoginError('');
                  setSignupError('');
                  setSignupSuccess('');
                }}
                className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-bold transition-all ${
                  tab === t
                    ? 'bg-accent text-white shadow-md shadow-accent/25'
                    : 'text-ink-muted hover:text-white'
                }`}
              >
                {t === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Social Sign In (Google OAuth) */}
          {isGoogleEnabled && (
            <div className="space-y-4">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                fullWidth
                loading={googleLoading}
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2.5 font-semibold border-line-2 bg-canvas-2 hover:bg-canvas text-ink"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-line-2" />
                <span className="text-[11px] font-semibold text-ink-faint">OR</span>
                <div className="h-px flex-1 bg-line-2" />
              </div>
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {signupSuccess && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400"
                >
                  {signupSuccess}
                </div>
              )}

              <Field
                id="login-handle"
                label="Username or @handle"
                type="text"
                value={loginHandle}
                onChange={setLoginHandle}
                placeholder="kidusMAT or @kidusMAT"
                autoComplete="username"
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-xs font-semibold text-ink-muted"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="cursor-pointer text-[11px] text-accent hover:text-accent-bright"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-line-2 bg-canvas-2 px-4 py-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-none"
                />
              </div>

              {loginError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-400"
                >
                  {loginError}
                </div>
              )}

              <Button type="submit" size="lg" fullWidth loading={loginLoading}>
                {loginLoading ? 'Signing in…' : 'Sign in'}
              </Button>

              {DEMO_LOGIN_ENABLED && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-line-2" />
                    <span className="text-[11px] font-semibold text-ink-faint">LOCAL DEMO</span>
                    <div className="h-px flex-1 bg-line-2" />
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={handleDemoLogin}
                  >
                    Continue as Maya (demo)
                  </Button>
                </>
              )}
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <Field
                id="signup-name"
                label="Display name"
                type="text"
                value={signupDisplayName}
                onChange={setSignupDisplayName}
                placeholder="Alex Morgan"
                autoComplete="name"
              />

              <Field
                id="signup-handle"
                label="Handle"
                type="text"
                value={signupHandle.startsWith('@') ? signupHandle.slice(1) : signupHandle}
                onChange={setSignupHandle}
                placeholder="alexm"
                autoComplete="username"
                leading="@"
              />

              <Field
                id="signup-password"
                label="Password"
                type="password"
                value={signupPassword}
                onChange={setSignupPassword}
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <Field
                id="signup-confirm"
                label="Confirm password"
                type="password"
                value={signupConfirm}
                onChange={setSignupConfirm}
                placeholder="••••••••"
                autoComplete="new-password"
              />

              {signupError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-400"
                >
                  {signupError}
                </div>
              )}

              <Button type="submit" size="lg" fullWidth loading={signupLoading}>
                {signupLoading ? 'Creating account…' : 'Create account'}
              </Button>

              <p className="text-center text-[11px] leading-relaxed text-ink-faint">
                By signing up you agree to our{' '}
                <span className="cursor-pointer text-accent hover:underline">
                  Community rules
                </span>{' '}
                and{' '}
                <span className="cursor-pointer text-accent hover:underline">
                  Privacy policy
                </span>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
