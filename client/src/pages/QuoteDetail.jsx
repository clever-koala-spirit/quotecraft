import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';
import LineItemTable from '../components/LineItemTable';
import { ArrowLeft, Send, Download, Trash2, Clock, Eye, CheckCircle2, XCircle, FileText } from 'lucide-react';

const eventIcons = { created: FileText, sent: Send, viewed: Eye, accepted: CheckCircle2, declined: XCircle };

export default function QuoteDetail() {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => api.getQuote(id).then(setQuote).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const handleSend = async () => {
    await api.sendQuote(id);
    load();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this quote?')) return;
    await api.deleteQuote(id);
    navigate('/dashboard');
  };

  const handlePdf = async () => {
    const blob = await api.downloadPdf(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Quote-${id.slice(0, 8)}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center text-text-dim py-12">Loading...</div>;
  if (!quote) return <div className="text-center text-text-dim py-12">Quote not found</div>;

  const items = (quote.items || []).map(i => ({
    description: i.description, quantity: i.quantity, unit: i.unit,
    unitPrice: i.unit_price, total: i.total, category: i.category,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/dashboard')} className="text-text-dim hover:text-text text-sm flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{quote.client_name || 'Unnamed Client'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={quote.status} />
            <span className="text-sm text-text-dim">#{quote.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePdf} className="px-3 py-2 rounded-xl text-sm border border-border hover:border-accent/50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> PDF
          </button>
          {quote.status === 'draft' && (
            <button onClick={handleSend} className="bg-accent hover:bg-accent-hover text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
              <Send className="w-4 h-4" /> Send
            </button>
          )}
          <button onClick={handleDelete} className="px-3 py-2 rounded-xl text-sm border border-danger/30 text-danger hover:bg-danger/10 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Client info */}
      <div className="bg-card border border-border rounded-2xl p-4 grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-text-dim mb-1">Client</div>
          <div className="font-medium">{quote.client_name}</div>
          {quote.client_email && <div className="text-sm text-text-dim">{quote.client_email}</div>}
          {quote.client_phone && <div className="text-sm text-text-dim">{quote.client_phone}</div>}
          {quote.client_address && <div className="text-sm text-text-dim">{quote.client_address}</div>}
        </div>
        <div>
          <div className="text-xs text-text-dim mb-1">Job</div>
          <div className="text-sm capitalize">{quote.trade_type}</div>
          <div className="text-sm text-text-dim mt-1">{quote.job_description}</div>
        </div>
      </div>

      {/* Line items */}
      <LineItemTable items={items} onChange={() => {}} readOnly />

      {/* Public link */}
      {quote.status !== 'draft' && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-xs text-text-dim mb-1">Public Link</div>
          <code className="text-sm text-accent">{window.location.origin}/q/{quote.id}</code>
        </div>
      )}

      {/* Timeline */}
      {quote.events?.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-medium mb-3">Timeline</h3>
          <div className="space-y-3">
            {quote.events.map(e => {
              const Icon = eventIcons[e.event_type] || Clock;
              return (
                <div key={e.id} className="flex items-center gap-3 text-sm">
                  <Icon className="w-4 h-4 text-text-dim shrink-0" />
                  <span className="capitalize">{e.event_type.replace('status_', '')}</span>
                  <span className="text-text-dim ml-auto">{new Date(e.created_at).toLocaleString('en-AU')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
