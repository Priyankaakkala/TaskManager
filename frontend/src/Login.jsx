import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister ? { name, email, password } : { email, password };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) return setErr(data.message || 'Error');
      onLogin({ token: data.token, user: data.user });
    } catch (err) {
      setErr('Network error');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '28px auto', display: 'flex', gap: 24, alignItems: 'stretch' }}>
      <div className="hero" style={{ flex: 1, minHeight: 220 }}>
        <div style={{ flex: 1 }}>
          <h1>Welcome to Task Manager</h1>
          <p></p>          <p>Organize tasks, track progress, and stay productive — fast and simple.</p>
        </div>
        <div className="hero-illustration float">
          <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="22" width="108" height="56" rx="8" fill="#10B981" />
            <rect x="16" y="32" width="36" height="8" rx="2" fill="white" opacity="0.95" />
            <rect x="16" y="44" width="68" height="8" rx="2" fill="white" opacity="0.9" />
            <rect x="16" y="56" width="48" height="8" rx="2" fill="white" opacity="0.85" />
          </svg>
        </div>
      </div>

      <div className="card auth-card" style={{ width: 420 }}>
        <h2 style={{ marginBottom: 8 }}>{isRegister ? 'Create an account' : 'Welcome back'}</h2>
        <p style={{ marginTop: 0, marginBottom: 12, color: '#065f46' }}>{isRegister ? 'Register to get started.' : 'Sign in to continue to your dashboard.'}</p>
        <form onSubmit={submit} className="auth-form">
          {isRegister && (
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="actions">
            <button type="submit" className="btn primary">{loading ? 'Working...' : (isRegister ? 'Register' : 'Login')}</button>
            <button type="button" className="btn" onClick={() => setIsRegister(v => !v)}>
              {isRegister ? 'Switch to Login' : 'Switch to Register'}
            </button>
          </div>
          {err && <p className="error">{err}</p>}
        </form>
      </div>
    </div>
  );
}
