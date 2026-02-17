import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';
import { Hammer, CheckCircle2, XCircle } from 'lucide-react';

export default function PublicQuote() {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responded, setResponded] = useState(false);

  useEffect(() => { api.viewQuote(id).then(setQuote).catch(console.error).finally(() => setLoading(false)); }, [id]);

  const handleAction = async (action) => {
    await api.acceptQuote(id, action);
    setResponded(true);
    setQuote(q => ({ ...q, status: action === 'accept' ? 'accepted' : 'declined' }));
  };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center text-text-dim">Loading...</div>;
  if (!quote) return <div className="min-h-screen bg-bg flex items-center justify-center text-text-dim">Quote not found</div>;

  const profile = quote.business_snapshot ? JSON.parse(quote.business_snapshot) : {};
  const items = quote.items || [];
  const subtotal = items.reduce((s, i) => s + (Number(i.total) || 0), 0);
  const gst = Math.round(subtotal * 0.1 * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;

  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              {profile.logo ? <img src={profile.logo} alt="" className="h-12 mb-2 rounded" /> : <Hammer className="w-8 h-8 text-accent mb-2" />}
              <h1 className="text-xl font-bold">{profile.business_name || 'QuoteCraft'}</h1>
              {profile.abn && <div className="text-sm text-text-dim">ABN: {profile.abn}</div>}
              {profile.licence_number && <div className="text-sm text-text-dim">Licence: {profile.licence_number}</div>}
              {profile.phone && <div className="text-sm text-text-dim">{profile.phone}</div>}
              {profile.email && <div className="text-sm text-text-dim">{profile.email}</div>}
              {profile.address && <div className="text-sm text-text-dim">{profile.address}</div>}
            </div>
            <StatusBadge status={quote.status} />
          </div>

          <div className="border-t border-border pt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-text-dim">Quote For</div>
              <div className="font-medium">{quote.client_name}</div>
              {quote.client_address && <div className="text-sm text-text-dim">{quote.client_address}</div>}
            </div>
            <div className="text-right">
              <div className="text-xs text-text-dim">Quote #{quote.id.slice(0, 8).toUpperCase()}</div>
              <div className="text-sm">{new Date(quote.created_at).toLocaleDateString('en-AU')}</div>
              <div className="text-xs text-text-dim">Valid for {quote.validity_days} days</div>
            </div>
          </div>
        </div>

        {/* Job */}
        {quote.job_description && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-6">
            <div className="text-xs text-text-dim mb-1">Job Description</div>
            <p className="text-sm">{quote.job_description}</p>
          </div>
        )}

        {/* Items */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-dim text-xs">
                <th className="text-left p-3">Description</th>
                <th className="text-right p-3">Qty</th>
                <th className="text-right p-3">Rate</th>
                <th className="text-right p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="p-3">{item.description}<span className="text-text-dim text-xs ml-1">({item.category})</span></td>
                  <td className="p-3 text-right">{item.quantity} {item.unit}</td>
                  <td className="p-3 text-right">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="p-3 text-right">${Number(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-border space-y-1">
            <div className="flex justify-between text-sm text-text-dim"><span>Subtotal (ex GST)</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-text-dim"><span>GST (10%)</span><span>${gst.toFixed(2)}</span></div>
            <div className="flex justify-between text-lg font-bold pt-1 border-t border-border"><span>Total (inc GST)</span><span className="text-accent">${total.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Payment terms */}
        {profile.payment_terms && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-6">
            <div className="text-xs text-text-dim mb-1">Payment Terms</div>
            <p className="text-sm">{profile.payment_terms}</p>
          </div>
        )}

        {/* Actions */}
        {(quote.status === 'sent' || quote.status === 'viewed') && !responded && (
          <div className="flex gap-3">
            <button onClick={() => handleAction('accept')}
              className="flex-1 bg-success hover:bg-success/80 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Accept Quote
            </button>
            <button onClick={() => handleAction('decline')}
              className="flex-1 border border-danger/30 text-danger hover:bg-danger/10 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              <XCircle className="w-5 h-5" /> Decline
            </button>
          </div>
        )}
        {responded && (
          <div className="text-center py-4 text-success font-medium">
            {quote.status === 'accepted' ? '✅ Quote accepted! The tradie has been notified.' : 'Quote declined.'}
          </div>
        )}

        <div className="text-center text-xs text-text-dim mt-8">Powered by QuoteCraft</div>
      </div>
    </div>
  );
}
