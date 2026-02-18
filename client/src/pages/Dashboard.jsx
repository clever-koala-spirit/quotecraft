import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';
import { PlusCircle, FileText, TrendingUp, CheckCircle2, DollarSign, Search, Users, Kanban, Bell, Clock } from 'lucide-react';

export default function Dashboard() {
  const [quotes, setQuotes] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [crmStats, setCrmStats] = useState({ clients: 0, activeJobs: 0, followupsDue: 0, overdueFollowups: [] });
  const navigate = useNavigate();

  useEffect(() => {
    api.listQuotes(filter || undefined).then(setQuotes).catch(console.error).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    Promise.all([
      api.listClients().catch(() => []),
      api.listJobs().catch(() => []),
      api.listFollowups('active').catch(() => []),
    ]).then(([clients, jobs, followups]) => {
      const today = new Date().toISOString().split('T')[0];
      setCrmStats({
        clients: clients.length,
        activeJobs: jobs.filter(j => !['completed', 'paid'].includes(j.stage)).length,
        followupsDue: followups.filter(f => f.due_date <= today).length,
        overdueFollowups: followups.filter(f => f.due_date < today).slice(0, 3),
      });
    });
  }, []);

  const filtered = quotes.filter(q => !search || 
    q.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    q.job_description?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: quotes.length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    totalValue: quotes.reduce((s, q) => s + (q.total || 0), 0),
    avgValue: quotes.length ? quotes.reduce((s, q) => s + (q.total || 0), 0) / quotes.length : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={() => navigate('/quotes/new')} className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Quote
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Quotes', value: stats.total, icon: FileText, color: 'text-info' },
          { label: 'Conversion Rate', value: stats.total ? `${Math.round(stats.accepted / stats.total * 100)}%` : '0%', icon: TrendingUp, color: 'text-success' },
          { label: 'Total Value', value: `$${stats.totalValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-accent' },
          { label: 'Avg Quote', value: `$${stats.avgValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`, icon: CheckCircle2, color: 'text-warning' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-dim">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      {/* CRM Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div onClick={() => navigate('/clients')} className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-accent/30 transition-all">
          <div className="flex items-center justify-between mb-2"><span className="text-xs text-text-dim">Total Clients</span><Users className="w-4 h-4 text-cyan-400" /></div>
          <div className="text-xl font-bold">{crmStats.clients}</div>
        </div>
        <div onClick={() => navigate('/pipeline')} className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-accent/30 transition-all">
          <div className="flex items-center justify-between mb-2"><span className="text-xs text-text-dim">Active Jobs</span><Kanban className="w-4 h-4 text-blue-400" /></div>
          <div className="text-xl font-bold">{crmStats.activeJobs}</div>
        </div>
        <div onClick={() => navigate('/followups')} className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-accent/30 transition-all">
          <div className="flex items-center justify-between mb-2"><span className="text-xs text-text-dim">Follow-ups Due</span><Bell className={`w-4 h-4 ${crmStats.followupsDue > 0 ? 'text-red-400' : 'text-text-dim'}`} /></div>
          <div className={`text-xl font-bold ${crmStats.followupsDue > 0 ? 'text-red-400' : ''}`}>{crmStats.followupsDue}</div>
        </div>
      </div>

      {/* Overdue follow-ups alert */}
      {crmStats.overdueFollowups.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-red-400" /><span className="text-sm font-medium text-red-400">Overdue Follow-ups</span></div>
          {crmStats.overdueFollowups.map(f => (
            <div key={f.id} className="text-sm text-text-dim">{f.title} {f.client_name && `— ${f.client_name}`}</div>
          ))}
          <button onClick={() => navigate('/followups')} className="text-xs text-accent mt-2">View all →</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotes..."
            className="!pl-10 !rounded-xl" />
        </div>
        <div className="flex gap-2">
          {['', 'draft', 'sent', 'viewed', 'accepted', 'declined'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-sm transition-colors ${filter === s ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-card border border-border text-text-dim hover:text-text'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Quote list */}
      {loading ? (
        <div className="text-center text-text-dim py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-text-dim mx-auto mb-3" />
          <p className="text-text-dim">No quotes yet</p>
          <button onClick={() => navigate('/quotes/new')} className="text-accent hover:text-accent-hover text-sm mt-2">Create your first quote</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => (
            <div key={q.id} onClick={() => navigate(`/quotes/${q.id}`)}
              className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-accent/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{q.client_name || 'Unnamed Client'}</div>
                  <div className="text-sm text-text-dim mt-0.5 line-clamp-1">{q.job_description || 'No description'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-accent">${Number(q.total || 0).toFixed(2)}</div>
                  <StatusBadge status={q.status} />
                </div>
              </div>
              <div className="text-xs text-text-dim mt-2">{new Date(q.created_at).toLocaleDateString('en-AU')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
