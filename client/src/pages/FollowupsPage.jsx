import { useState, useEffect } from 'react';
import { api } from '../api';
import { Bell, Plus, Check, X, Clock, AlertTriangle, Calendar } from 'lucide-react';

export default function FollowupsPage() {
  const [followups, setFollowups] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', client_id: '', due_date: '', notes: '' });

  const load = () => {
    Promise.all([api.listFollowups(), api.listClients()]).then(([f, c]) => { setFollowups(f); setClients(c); }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.createFollowup(form);
    setForm({ title: '', client_id: '', due_date: '', notes: '' });
    setShowAdd(false);
    load();
  };

  const toggleComplete = async (f) => {
    await api.updateFollowup(f.id, { completed: !f.completed });
    load();
  };

  const deleteFollowup = async (id) => {
    await api.deleteFollowup(id);
    load();
  };

  const today = new Date().toISOString().split('T')[0];
  const overdue = followups.filter(f => !f.completed && f.due_date < today);
  const todayItems = followups.filter(f => !f.completed && f.due_date === today);
  const upcoming = followups.filter(f => !f.completed && f.due_date > today);
  const completed = followups.filter(f => f.completed);

  const FollowupItem = ({ f }) => (
    <div className={`bg-card border border-border rounded-xl p-4 flex items-center gap-3 ${f.completed ? 'opacity-50' : ''}`}>
      <button onClick={() => toggleComplete(f)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${f.completed ? 'bg-emerald-500 border-emerald-500' : 'border-text-dim hover:border-accent'}`}>
        {f.completed && <Check className="w-3 h-3 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${f.completed ? 'line-through' : ''}`}>{f.title}</div>
        <div className="flex items-center gap-3 text-xs text-text-dim mt-0.5">
          {f.client_name && <span>{f.client_name}</span>}
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(f.due_date + 'T00:00').toLocaleDateString('en-AU')}</span>
        </div>
        {f.notes && <div className="text-xs text-text-dim mt-1">{f.notes}</div>}
      </div>
      <button onClick={() => deleteFollowup(f.id)} className="text-text-dim hover:text-red-400 p-1"><X className="w-4 h-4" /></button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Follow-ups</h1>
        <button onClick={() => setShowAdd(true)} className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Reminder
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleAdd} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-lg font-bold">New Follow-up</h2><button type="button" onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-text-dim" /></button></div>
            <input placeholder="What do you need to do? *" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full" />
            <select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} className="w-full">
              <option value="">Select client (optional)</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" required value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="w-full" />
            <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full" rows={2} />
            <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-xl font-medium">Create Reminder</button>
          </form>
        </div>
      )}

      {loading ? <div className="text-center text-text-dim py-12">Loading...</div> : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-red-400" /><h2 className="text-sm font-semibold text-red-400">Overdue ({overdue.length})</h2></div>
              <div className="space-y-2">{overdue.map(f => <FollowupItem key={f.id} f={f} />)}</div>
            </div>
          )}
          {todayItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-amber-400" /><h2 className="text-sm font-semibold text-amber-400">Today ({todayItems.length})</h2></div>
              <div className="space-y-2">{todayItems.map(f => <FollowupItem key={f.id} f={f} />)}</div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-text-dim" /><h2 className="text-sm font-semibold text-text-dim">Upcoming ({upcoming.length})</h2></div>
              <div className="space-y-2">{upcoming.map(f => <FollowupItem key={f.id} f={f} />)}</div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3"><Check className="w-4 h-4 text-emerald-400" /><h2 className="text-sm font-semibold text-text-dim">Completed ({completed.length})</h2></div>
              <div className="space-y-2">{completed.map(f => <FollowupItem key={f.id} f={f} />)}</div>
            </div>
          )}
          {followups.length === 0 && (
            <div className="text-center py-12 text-text-dim">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No follow-ups yet</p>
              <p className="text-sm mt-1">Set reminders to follow up with clients</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
