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
    <div className="card auth-card">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
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
  );
}
