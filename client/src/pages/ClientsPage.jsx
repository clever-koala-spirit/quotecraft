import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Search, Plus, Phone, Mail, FileText, Upload, X, Users } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', company: '', tags: '' });
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const load = () => api.listClients(search || undefined).then(setClients).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, [search]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.createClient({ ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] });
    setForm({ name: '', email: '', phone: '', address: '', company: '', tags: '' });
    setShowAdd(false);
    load();
  };

  const handleCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const clients = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i]; });
      return obj;
    }).filter(c => c.name);
    const res = await api.importClients(clients);
    alert(`Imported ${res.imported} clients`);
    load();
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()} className="bg-card border border-border text-text-dim hover:text-text px-3 py-2 rounded-xl text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          <button onClick={() => setShowAdd(true)} className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>
      </div>

      {/* Add client modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleAdd} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-lg font-bold">Add Client</h2><button type="button" onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-text-dim" /></button></div>
            <input placeholder="Name *" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full" />
            <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full" />
            <input placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full" />
            <input placeholder="Company (optional)" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full" />
            <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="w-full" />
            <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-xl font-medium">Add Client</button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." className="!pl-10 !rounded-xl w-full" />
      </div>

      {/* Client list */}
      {loading ? <div className="text-center text-text-dim py-12">Loading...</div> :
       clients.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-text-dim mx-auto mb-3" />
          <p className="text-text-dim">No clients yet</p>
          <p className="text-text-dim text-sm mt-1">Add clients manually or they'll be auto-created when you send quotes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map(c => (
            <div key={c.id} onClick={() => navigate(`/clients/${c.id}`)}
              className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-accent/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="flex items-center gap-4 text-sm text-text-dim mt-1">
                    {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                    {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                    {c.company && <span>{c.company}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-text-dim">{c.quote_count || 0} quotes</div>
                  {c.last_contact && <div className="text-xs text-text-dim">{new Date(c.last_contact).toLocaleDateString('en-AU')}</div>}
                </div>
              </div>
              {c.tags && JSON.parse(c.tags || '[]').length > 0 && (
                <div className="flex gap-1 mt-2">
                  {JSON.parse(c.tags).map(t => <span key={t} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
