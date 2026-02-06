import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const saved = JSON.parse(localStorage.getItem('auth') || 'null');
  const [auth, setAuth] = useState(saved);

  useEffect(() => {
    if (auth) localStorage.setItem('auth', JSON.stringify(auth));
    else localStorage.removeItem('auth');
  }, [auth]);

  if (!auth) return <Login onLogin={setAuth} />;
  return <Dashboard auth={auth} onLogout={() => setAuth(null)} />;
}

export default App;
