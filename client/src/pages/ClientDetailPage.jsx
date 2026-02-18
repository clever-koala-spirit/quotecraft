import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ArrowLeft, Phone, Mail, MapPin, Building, FileText, Plus, Send, Clock, MessageSquare, CheckCircle2, XCircle, Eye, Bell, Trash2, Edit3 } from 'lucide-react';

const timelineIcons = {
  note: MessageSquare, quote_sent: Send, quote_viewed: Eye, quote_accepted: CheckCircle2,
  quote_declined: XCircle, email: Mail, call: Phone, followup: Bell,
};
const timelineColors = {
  note: 'bg-blue-500', quote_sent: 'bg-amber-500', quote_viewed: 'bg-purple-500',
  quote_accepted: 'bg-emerald-500', quote_declined: 'bg-red-500', email: 'bg-cyan-500',
  call: 'bg-green-500', followup: 'bg-orange-500',
};

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [tab, setTab] = useState('timeline');
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  const load = () => api.getClient(id).then(c => { setClient(c); setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address, company: c.company, tags: (JSON.parse(c.tags || '[]')).join(', ') }); }).catch(() => navigate('/clients')).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await api.addClientNote(id, { content: note, type: 'note' });
    setNote('');
    load();
  };

  const saveEdit = async () => {
    await api.updateClient(id, { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] });
    setEditing(false);
    load();
  };

  const deleteClient = async () => {
    if (!confirm('Delete this client?')) return;
    await api.deleteClient(id);
    navigate('/clients');
  };

  if (loading) return <div className="text-center text-text-dim py-12">Loading...</div>;
  if (!client) return null;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/clients')} className="flex items-center gap-2 text-text-dim hover:text-text text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </button>

      {/* Client header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        {editing ? (
          <div className="space-y-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="text-xl font-bold w-full" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
              <input placeholder="Phone" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
              <input placeholder="Address" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
              <input placeholder="Company" value={form.company || ''} onChange={e => setForm({...form, company: e.target.value})} />
            </div>
            <input placeholder="Tags (comma separated)" value={form.tags || ''} onChange={e => setForm({...form, tags: e.target.value})} />
            <div className="flex gap-2">
              <button onClick={saveEdit} className="bg-accent text-white px-4 py-2 rounded-xl text-sm">Save</button>
              <button onClick={() => setEditing(false)} className="text-text-dim px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{client.name}</h1>
                {client.company && <p className="text-text-dim flex items-center gap-1 mt-1"><Building className="w-4 h-4" />{client.company}</p>}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-text-dim">
                  {client.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{client.phone}</span>}
                  {client.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{client.email}</span>}
                  {client.address && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{client.address}</span>}
                </div>
                {client.tags && JSON.parse(client.tags || '[]').length > 0 && (
                  <div className="flex gap-1 mt-3">
                    {JSON.parse(client.tags).map(t => <span key={t} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{t}</span>)}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {client.phone && <a href={`tel:${client.phone}`} className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl hover:bg-emerald-500/20"><Phone className="w-4 h-4" /></a>}
                {client.email && <a href={`mailto:${client.email}`} className="bg-blue-500/10 text-blue-500 p-2 rounded-xl hover:bg-blue-500/20"><Mail className="w-4 h-4" /></a>}
                <button onClick={() => navigate('/quotes/new')} className="bg-accent/10 text-accent p-2 rounded-xl hover:bg-accent/20"><FileText className="w-4 h-4" /></button>
                <button onClick={() => setEditing(true)} className="bg-card border border-border p-2 rounded-xl hover:bg-white/5"><Edit3 className="w-4 h-4 text-text-dim" /></button>
                <button onClick={deleteClient} className="bg-card border border-border p-2 rounded-xl hover:bg-red-500/10"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {['timeline', 'quotes', 'jobs'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${tab === t ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-text-dim hover:text-text'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)} {t === 'quotes' ? `(${client.quotes?.length || 0})` : t === 'jobs' ? `(${client.jobs?.length || 0})` : ''}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'timeline' && (
        <div className="space-y-4">
          <form onSubmit={addNote} className="flex gap-2">
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." className="flex-1 !rounded-xl" />
            <button type="submit" disabled={!note.trim()} className="bg-accent hover:bg-accent-hover disabled:opacity-30 text-white px-4 py-2 rounded-xl text-sm">Add Note</button>
          </form>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            {(client.timeline || []).map(t => {
              const Icon = timelineIcons[t.type] || MessageSquare;
              const color = timelineColors[t.type] || 'bg-gray-500';
              return (
                <div key={t.id} className="relative pl-10 pb-4">
                  <div className={`absolute left-2 w-5 h-5 rounded-full ${color} flex items-center justify-center`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3">
                    <div className="flex justify-between items-start">
                      <p className="text-sm">{t.content}</p>
                      <span className="text-xs text-text-dim whitespace-nowrap ml-3">{new Date(t.created_at).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="text-xs text-text-dim capitalize">{t.type.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              );
            })}
            {(!client.timeline || client.timeline.length === 0) && <p className="text-text-dim text-sm pl-10">No timeline events yet</p>}
          </div>
        </div>
      )}

      {tab === 'quotes' && (
        <div className="space-y-2">
          {(client.quotes || []).map(q => (
            <div key={q.id} onClick={() => navigate(`/quotes/${q.id}`)} className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-accent/30">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium text-sm">{q.job_description || 'No description'}</div>
                  <div className="text-xs text-text-dim mt-1">{new Date(q.created_at).toLocaleDateString('en-AU')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-accent">${Number(q.total || 0).toFixed(2)}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${q.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500' : q.status === 'declined' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>{q.status}</span>
                </div>
              </div>
            </div>
          ))}
          {(!client.quotes || client.quotes.length === 0) && <p className="text-text-dim text-sm">No quotes yet</p>}
        </div>
      )}

      {tab === 'jobs' && (
        <div className="space-y-2">
          {(client.jobs || []).map(j => (
            <div key={j.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium text-sm">{j.title}</div>
                  <span className="text-xs text-text-dim capitalize">{j.stage?.replace(/_/g, ' ')}</span>
                </div>
                <div className="font-bold text-accent">${Number(j.value || 0).toFixed(2)}</div>
              </div>
            </div>
          ))}
          {(!client.jobs || client.jobs.length === 0) && <p className="text-text-dim text-sm">No jobs yet</p>}
        </div>
      )}
    </div>
  );
}
