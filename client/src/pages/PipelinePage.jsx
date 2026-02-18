import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Plus, X, GripVertical, DollarSign } from 'lucide-react';

const STAGES = [
  { id: 'lead', label: 'Lead', color: '#6B7280' },
  { id: 'quoted', label: 'Quoted', color: '#F59E0B' },
  { id: 'accepted', label: 'Accepted', color: '#10B981' },
  { id: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { id: 'completed', label: 'Completed', color: '#8B5CF6' },
  { id: 'paid', label: 'Paid', color: '#22D3EE' },
];

export default function PipelinePage() {
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', client_id: '', stage: 'lead', value: '', description: '' });
  const [dragging, setDragging] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    Promise.all([api.listJobs(), api.listClients()]).then(([j, c]) => { setJobs(j); setClients(c); }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.createJob({ ...form, value: parseFloat(form.value) || 0 });
    setForm({ title: '', client_id: '', stage: 'lead', value: '', description: '' });
    setShowAdd(false);
    load();
  };

  const moveJob = async (jobId, newStage) => {
    await api.updateJob(jobId, { stage: newStage });
    load();
  };

  const handleDragStart = (e, jobId) => {
    setDragging(jobId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (dragging) { moveJob(dragging, stageId); setDragging(null); }
  };

  const daysInStage = (job) => {
    const d = Math.floor((Date.now() - new Date(job.updated_at).getTime()) / 86400000);
    return d === 0 ? 'Today' : `${d}d`;
  };

  const stageTotal = (stageId) => jobs.filter(j => j.stage === stageId).reduce((s, j) => s + (j.value || 0), 0);

  if (loading) return <div className="text-center text-text-dim py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pipeline</h1>
        <button onClick={() => setShowAdd(true)} className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleAdd} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-lg font-bold">New Job</h2><button type="button" onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-text-dim" /></button></div>
            <input placeholder="Job title *" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full" />
            <select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} className="w-full">
              <option value="">Select client (optional)</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.stage} onChange={e => setForm({...form, stage: e.target.value})} className="w-full">
              {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <input type="number" placeholder="Value ($)" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="w-full" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full" rows={2} />
            <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-xl font-medium">Create Job</button>
          </form>
        </div>
      )}

      {/* Kanban - desktop */}
      <div className="hidden lg:grid grid-cols-6 gap-3">
        {STAGES.map(stage => (
          <div key={stage.id}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, stage.id)}
            className="min-h-[400px]"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-sm font-medium">{stage.label}</span>
                <span className="text-xs text-text-dim bg-card px-1.5 py-0.5 rounded">{jobs.filter(j => j.stage === stage.id).length}</span>
              </div>
            </div>
            {stageTotal(stage.id) > 0 && (
              <div className="text-xs text-text-dim mb-2 px-1 flex items-center gap-1"><DollarSign className="w-3 h-3" />${stageTotal(stage.id).toLocaleString()}</div>
            )}
            <div className="space-y-2">
              {jobs.filter(j => j.stage === stage.id).map(job => (
                <div key={job.id} draggable onDragStart={e => handleDragStart(e, job.id)}
                  className="bg-[#141519] border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-accent/30 transition-all"
                  style={{ borderLeftColor: stage.color, borderLeftWidth: '3px' }}
                >
                  <div className="text-sm font-medium mb-1">{job.title}</div>
                  {job.client_name && <div className="text-xs text-text-dim">{job.client_name}</div>}
                  <div className="flex items-center justify-between mt-2">
                    {job.value > 0 && <span className="text-xs font-bold text-accent">${Number(job.value).toLocaleString()}</span>}
                    <span className="text-xs text-text-dim">{daysInStage(job)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile - grouped list */}
      <div className="lg:hidden space-y-4">
        {STAGES.map(stage => {
          const stageJobs = jobs.filter(j => j.stage === stage.id);
          if (!stageJobs.length) return null;
          return (
            <div key={stage.id}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-sm font-medium">{stage.label}</span>
                <span className="text-xs text-text-dim">({stageJobs.length})</span>
              </div>
              <div className="space-y-2">
                {stageJobs.map(job => (
                  <div key={job.id} className="bg-[#141519] border border-border rounded-xl p-3" style={{ borderLeftColor: stage.color, borderLeftWidth: '3px' }}>
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm font-medium">{job.title}</div>
                        {job.client_name && <div className="text-xs text-text-dim">{job.client_name}</div>}
                      </div>
                      <div className="text-right">
                        {job.value > 0 && <div className="text-sm font-bold text-accent">${Number(job.value).toLocaleString()}</div>}
                        <div className="flex gap-1 mt-1">
                          {STAGES.filter(s => s.id !== job.stage).slice(0, 2).map(s => (
                            <button key={s.id} onClick={() => moveJob(job.id, s.id)} className="text-xs px-2 py-0.5 rounded bg-card border border-border text-text-dim hover:text-text">{s.label}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12 text-text-dim">
          <p>No jobs in your pipeline yet</p>
          <p className="text-sm mt-1">Jobs are auto-created when quotes are accepted, or add them manually</p>
        </div>
      )}
    </div>
  );
}
