import React, { useEffect, useState } from 'react';

export default function Dashboard({ auth, onLogout }) {
  const token = auth.token;
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const api = (path, opts = {}) => fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) }
  }).then(r => r.json());

  const load = async () => {
    setLoading(true);
    const data = await api('/api/tasks');
    setTasks(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!title) return;
    await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title, description: desc }) });
    setTitle(''); setDesc('');
    load();
  };

  const toggle = async (t) => {
    const updated = await api(`/api/tasks/${t._id}`, { method: 'PUT', body: JSON.stringify({ completed: !t.completed }) });
    setTasks(ts => ts.map(x => x._id === updated._id ? updated : x));
  };

  const remove = async (t) => {
    await api(`/api/tasks/${t._id}`, { method: 'DELETE' });
    setTasks(ts => ts.filter(x => x._id !== t._id));
    load();
  };

  const startEdit = (t) => {
    setEditing({ ...t });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const updated = await api(`/api/tasks/${editing._id}`, { method: 'PUT', body: JSON.stringify(editing) });
    setTasks(ts => ts.map(x => x._id === updated._id ? updated : x));
    setEditing(null);
  };

  return (
    <div className="card container">
      <div className="topbar">
        <h2>Tasks — {auth.user?.name || auth.user?.email}</h2>
        <button className="btn" onClick={onLogout}>Logout</button>
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
                <button className="btn" onClick={() => startEdit(t)}>Edit</button>
                <button className="btn danger" onClick={() => remove(t)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="modal">
          <div className="modal-card">
            <h3>Edit Task</h3>
            <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            <input value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            <div style={{ marginTop: 8 }}>
              <button className="btn primary" onClick={saveEdit}>Save</button>
              <button className="btn" onClick={() => setEditing(null)} style={{ marginLeft: 8 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
