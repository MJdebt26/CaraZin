'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, configured, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  function reset() {
    setError(''); setNotice(''); setPassword('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const res = await fn(email.trim(), password);
    setBusy(false);
    if (res.error) { setError(res.error); return; }
    if (res.needsConfirmation) {
      setNotice('Check your email to confirm your account, then sign in.');
      setMode('signin');
      return;
    }
    onClose();
  }

  // ── Signed-in account view ──
  const accountView = (
    <>
      <div className="eyebrow">Account</div>
      <h2>{user?.email}</h2>
      <Link href="/account" className="cz-btn" onClick={onClose}>Order history</Link>
      <button
        className="cz-btn"
        style={{ background: 'transparent', color: 'var(--black)', border: '1px solid var(--light)', marginTop: '.6rem' }}
        onClick={async () => { await signOut(); onClose(); }}
      >
        Sign out
      </button>
    </>
  );

  // ── Signed-out auth form ──
  const authView = (
    <>
      <div className="eyebrow">CaraZin</div>
      <h2>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
      {!configured && (
        <p className="cz-err">Accounts aren’t configured yet — add Supabase keys to .env.local.</p>
      )}
      <form onSubmit={submit}>
        <div className="cz-field">
          <label>Email</label>
          <input className="cz-input" type="email" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="cz-field">
          <label>Password</label>
          <input className="cz-input" type="password" required minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="cz-err">{error}</div>}
        {notice && <div className="cz-err" style={{ color: 'var(--gold)' }}>{notice}</div>}
        <button className="cz-btn" type="submit" disabled={busy || !configured}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>
      <div className="cz-switch">
        {mode === 'signin' ? (
          <>New here? <button onClick={() => { setMode('signup'); reset(); }}>Create an account</button></>
        ) : (
          <>Already have an account? <button onClick={() => { setMode('signin'); reset(); }}>Sign in</button></>
        )}
      </div>
    </>
  );

  return (
    <div className="cz-overlay open" id="cz-modal-overlay" onClick={onClose}>
      <div id="cz-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cz-modal">
          <button className="cz-modal-close" aria-label="Close" onClick={onClose}>×</button>
          {user ? accountView : authView}
        </div>
      </div>
    </div>
  );
}
