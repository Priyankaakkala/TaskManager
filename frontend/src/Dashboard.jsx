import React, { useEffect, useState, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard({ auth, onLogout }) {
  const token = auth.token;
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const api = async (path, opts = {}) => {
    const res = await fetch(path, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) }
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { /* non-json response */ }
    if (!res.ok) throw new Error((data && data.message) || res.statusText || 'Request failed');
    return data;
  };

  useEffect(() => {
    load();
  }, [token]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api('/api/tasks');
      console.debug('Dashboard.load - data:', data);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load tasks error', err);
      showToast(err.message || 'Failed to load tasks', 4000);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!title) return;
    await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title, description: desc }) });
    setTitle(''); setDesc('');
    load();
  };

  const showToast = (msg, ms = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  const toggle = async (t) => {
    const prev = tasks;
    // optimistic
    setTasks(ts => ts.map(x => x._id === t._id ? { ...x, completed: !x.completed } : x));
    try {
      const updated = await api(`/api/tasks/${t._id}`, { method: 'PUT', body: JSON.stringify({ completed: !t.completed }) });
      setTasks(ts => ts.map(x => x._id === updated._id ? updated : x));
    } catch (err) {
      setTasks(prev);
      showToast('Failed to update task');
    }
  };

  const remove = async (t) => {
    if (!window.confirm('Delete this task?')) return;
    const prev = tasks;
    setTasks(ts => ts.filter(x => x._id !== t._id));
    try {
      await api(`/api/tasks/${t._id}`, { method: 'DELETE' });
      showToast('Task deleted');
    } catch (err) {
      setTasks(prev);
      showToast('Failed to delete');
    }
  };

  const startEdit = (t) => {
    setEditing({ ...t });
  };


  const [saveLoading, setSaveLoading] = useState(false);
  const titleRef = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    if (editing && titleRef.current) titleRef.current.focus();
    if (editing && descRef.current) {
      // autoresize
      descRef.current.style.height = 'auto';
      descRef.current.style.height = descRef.current.scrollHeight + 'px';
    }
  }, [editing]);

  const saveEdit = async () => {
    if (!editing) return;
    try {
      setSaveLoading(true);
      const updated = await api(`/api/tasks/${editing._id}`, { method: 'PUT', body: JSON.stringify(editing) });
      setTasks(ts => ts.map(x => x._id === updated._id ? updated : x));
      setEditing(null);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleModalKey = (e) => {
    if (e.key === 'Escape') setEditing(null);
    if (e.key === 'Enter' && (e.target.tagName !== 'INPUT' || e.ctrlKey)) {
      e.preventDefault();
      saveEdit();
    }
  };

  return (
    <div className="card container">
      <div className="hero" style={{ marginBottom: 6 }}>
        <div>
          <h1>Welcome to Task Manager</h1>
          <p>Overview of your tasks and progress</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ width: 220 }} className="card">
          <h4 style={{ marginTop: 6 }}>Overview</h4>
          <Pie data={{
            labels: ['Completed', 'Remaining'],
            datasets: [{
              data: [tasks.filter(t => t.completed).length, tasks.filter(t => !t.completed).length],
              backgroundColor: ['#16a34a', '#2563eb']
            }]
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="topbar">
            <h2>Tasks — {auth.user?.name || auth.user?.email}</h2>
            <button className="btn" onClick={onLogout}>Logout</button>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            <div className="card" style={{ padding: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{tasks.length}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Total tasks</div>
            </div>
            <div className="card" style={{ padding: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{tasks.filter(t => t.completed).length}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Completed</div>
            </div>
            <div className="card" style={{ padding: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{tasks.filter(t => !t.completed).length}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Remaining</div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={create} className="task-form">
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
        <button type="submit" className="btn primary">Add</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <ul className="task-list">
          {tasks.map(t => (
            <li key={t._id} className={`task-item ${t.completed ? 'done' : ''}`}>
              <input type="checkbox" checked={t.completed} onChange={() => toggle(t)} />
              <div className="task-body" onDoubleClick={() => startEdit(t)}>
                <div className="task-title">{t.title}</div>
                <div className="task-desc">{t.description}</div>
              </div>
              <div className="task-actions">
                <button type="button" className="btn" onClick={() => startEdit(t)}>Edit</button>
                <button type="button" className="btn danger" onClick={() => remove(t)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="modal" onKeyDown={handleModalKey} tabIndex={-1} onClick={() => setEditing(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Edit Task</h3>
              <button type="button" className="btn" onClick={() => setEditing(null)}>Close</button>
            </div>

            <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>Title</label>
            <input ref={titleRef} value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />

            <label style={{ display: 'block', marginTop: 12, fontSize: 13 }}>Description</label>
            <textarea
              ref={descRef}
              value={editing.description}
              onChange={e => {
                let v = e.target.value;
                // enforce 1000-word limit
                const words = v.trim().split(/\s+/).filter(Boolean);
                if (words.length > 1000) {
                  v = words.slice(0, 1000).join(' ');
                }
                setEditing({ ...editing, description: v });
                // autoresize
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="char-count">{(editing.description || '').trim().split(/\s+/).filter(Boolean).length}/1000 words</div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <input type="checkbox" checked={!!editing.completed} onChange={e => setEditing({ ...editing, completed: e.target.checked })} />
              <span style={{ fontSize: 13 }}>Completed</span>
            </label>

            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button type="button" className="btn primary" onClick={saveEdit} disabled={saveLoading}>{saveLoading ? 'Saving...' : 'Save'}</button>
              <button type="button" className="btn" onClick={() => setEditing(null)}>Cancel</button>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280' }}>Tip: Press <strong>Esc</strong> to cancel, <strong>Ctrl+Enter</strong> to save.</div>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
