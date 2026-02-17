import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import TradeTypePicker from '../components/TradeTypePicker';
import LineItemTable from '../components/LineItemTable';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Send, Download, Upload, X } from 'lucide-react';

const steps = ['Trade Type', 'Job Details', 'Line Items', 'Client Details', 'Preview & Send'];

export default function NewQuote() {
  const [step, setStep] = useState(0);
  const [tradeType, setTradeType] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [items, setItems] = useState([]);
  const [client, setClient] = useState({ name: '', email: '', phone: '', address: '' });
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.generateQuote({ tradeType, jobDescription, photos, clientName: client.name });
      setItems(res.items.map(i => ({ ...i, total: i.total || i.quantity * i.unitPrice })));
      setStep(2);
    } catch (err) {
      alert('Generation failed: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (send = false) => {
    setSaving(true);
    try {
      const quote = await api.createQuote({
        trade_type: tradeType,
        job_description: jobDescription,
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone,
        client_address: client.address,
        items: items.map(i => ({ ...i, unitPrice: i.unitPrice })),
      });
      if (send && quote.id) await api.sendQuote(quote.id);
      navigate(`/quotes/${quote.id}`);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || e.target.files || []);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => setPhotos(prev => [...prev, { name: f.name, data: reader.result }]);
      reader.readAsDataURL(f);
    });
  };

  const subtotal = items.reduce((s, i) => s + (Number(i.total) || 0), 0);
  const gst = Math.round(subtotal * 0.1 * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;

  const canNext = () => {
    if (step === 0) return !!tradeType;
    if (step === 1) return !!jobDescription;
    if (step === 2) return items.length > 0;
    if (step === 3) return !!client.name;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/dashboard')} className="text-text-dim hover:text-text text-sm flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s} className={`flex items-center gap-2 shrink-0 ${i <= step ? 'text-accent' : 'text-text-dim'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              i < step ? 'bg-accent text-white' : i === step ? 'border-2 border-accent' : 'border border-border'
            }`}>{i + 1}</div>
            <span className="text-xs hidden sm:inline">{s}</span>
            {i < steps.length - 1 && <div className={`w-8 h-px ${i < step ? 'bg-accent' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Trade Type */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">What type of trade?</h2>
          <TradeTypePicker value={tradeType} onChange={setTradeType} />
        </div>
      )}

      {/* Step 1: Job Details */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Describe the job</h2>
          <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)}
            placeholder="e.g. Install 6 new GPOs in a kitchen renovation, run new circuit from switchboard, LED downlights x8..."
            className="min-h-[150px] resize-y" />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Photos (optional)</h3>
            <div onDrop={handlePhotoDrop} onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => document.getElementById('photo-input').click()}>
              <Upload className="w-8 h-8 text-text-dim mx-auto mb-2" />
              <p className="text-sm text-text-dim">Drag & drop photos or click to browse</p>
              <input id="photo-input" type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoDrop} />
            </div>
            {photos.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {photos.map((p, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <img src={p.data} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Line Items */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Line Items</h2>
            <span className="text-xs text-text-dim">Edit items as needed • All prices ex-GST</span>
          </div>
          <LineItemTable items={items} onChange={setItems} />
        </div>
      )}

      {/* Step 3: Client Details */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Client Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-sm text-text-dim block mb-1">Name *</label>
              <input value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} /></div>
            <div><label className="text-sm text-text-dim block mb-1">Email</label>
              <input type="email" value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} /></div>
            <div><label className="text-sm text-text-dim block mb-1">Phone</label>
              <input value={client.phone} onChange={e => setClient({ ...client, phone: e.target.value })} /></div>
            <div><label className="text-sm text-text-dim block mb-1">Address</label>
              <input value={client.address} onChange={e => setClient({ ...client, address: e.target.value })} /></div>
          </div>
        </div>
      )}

      {/* Step 4: Preview */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Preview & Send</h2>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex justify-between">
              <div>
                <div className="font-bold text-lg">{client.name}</div>
                <div className="text-sm text-text-dim">{client.email} {client.phone && `• ${client.phone}`}</div>
                {client.address && <div className="text-sm text-text-dim">{client.address}</div>}
              </div>
              <div className="text-right">
                <div className="text-sm text-text-dim capitalize">{tradeType}</div>
              </div>
            </div>
            {jobDescription && <p className="text-sm text-text-dim border-t border-border pt-3">{jobDescription}</p>}
            <LineItemTable items={items} onChange={() => {}} readOnly />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="px-4 py-2 rounded-xl text-sm border border-border disabled:opacity-30 hover:border-accent/50 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-2">
          {step === 1 && (
            <button onClick={handleGenerate} disabled={!canNext() || generating}
              className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Quote</>}
            </button>
          )}
          {step === 4 ? (
            <>
              <button onClick={() => handleSave(false)} disabled={saving}
                className="px-4 py-2 rounded-xl text-sm border border-border hover:border-accent/50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" /> Save Draft
              </button>
              <button onClick={() => handleSave(true)} disabled={saving || !client.email}
                className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Quote
              </button>
            </>
          ) : step !== 1 && (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
