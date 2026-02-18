import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import LineItemTable from '../components/LineItemTable';
import TemplatePicker from '../components/TemplatePicker';
import { ArrowLeft, Loader2, Sparkles, Send, Download, Upload, X, FileText, Image, File } from 'lucide-react';

export default function NewQuote() {
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null); // { title, description, items, notes, uploadedFiles }
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [client, setClient] = useState({ name: '', email: '', phone: '', address: '' });
  const [template, setTemplate] = useState('clean-modern');
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const addFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles).slice(0, 10 - files.length);
    const withPreviews = fileArray.map(f => ({
      file: f,
      name: f.name,
      type: f.type,
      size: f.size,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null
    }));
    setFiles(prev => [...prev, ...withPreviews].slice(0, 10));
  }, [files.length]);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleGenerate = async () => {
    if (!description && files.length === 0) return;
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('description', description);
      files.forEach(f => formData.append('files', f.file));

      const res = await api.generateQuote(formData);
      setGenerated(res);
      setTitle(res.title || '');
      setItems(res.items.map(i => ({ ...i, total: i.total || i.quantity * i.unitPrice })));
      setNotes(res.notes || '');
      if (res.description && !description) setDescription(res.description);
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
        trade_type: 'general',
        job_description: `${title}\n\n${description}`,
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone,
        client_address: client.address,
        items: items.map(i => ({ ...i, unitPrice: i.unitPrice })),
        notes,
        template,
        tempFiles: generated?.uploadedFiles || [],
      });
      if (send && quote.id) await api.sendQuote(quote.id);
      navigate(`/quotes/${quote.id}`);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const fileIcon = (type) => {
    if (type?.startsWith('image/')) return <Image className="w-5 h-5 text-blue-400" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-400" />;
    return <File className="w-5 h-5 text-text-dim" />;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/dashboard')} className="text-text-dim hover:text-text text-sm flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold">New Quote</h1>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-2xl p-8 md:p-12 text-center cursor-pointer hover:border-accent/60 transition-all group"
      >
        <Upload className="w-10 h-10 text-text-dim mx-auto mb-3 group-hover:text-accent transition-colors" />
        <p className="text-lg font-medium mb-1">Drop photos, documents, emails — anything about the job</p>
        <p className="text-sm text-text-dim">JPG, PNG, PDF, HEIC, or any document • Max 10 files, 10MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.eml,.msg,.heic"
          className="hidden"
          onChange={e => addFiles(e.target.files)}
        />
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {files.map((f, i) => (
            <div key={i} className="relative bg-card border border-border rounded-xl overflow-hidden group" style={{ width: f.preview ? 100 : 'auto' }}>
              {f.preview ? (
                <img src={f.preview} alt="" className="w-[100px] h-[100px] object-cover" />
              ) : (
                <div className="flex items-center gap-2 px-3 py-2">
                  {fileIcon(f.type)}
                  <div className="text-xs">
                    <div className="truncate max-w-[120px]">{f.name}</div>
                    <div className="text-text-dim">{formatSize(f.size)}</div>
                  </div>
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)); }}
                className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-text-dim block mb-2">Describe the job in your own words</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Rewire kitchen, 6 power points, new LED downlights, existing house built 1990... Paste anything here — emails, notes, job details."
          className="min-h-[120px] resize-y text-base"
        />
      </div>

      {/* Generate Button */}
      {!generated && (
        <button
          onClick={handleGenerate}
          disabled={generating || (!description && files.length === 0)}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-4 rounded-2xl text-lg font-bold transition-colors flex items-center justify-center gap-3"
        >
          {generating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>AI is analyzing your files...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              <span>Generate Quote</span>
            </>
          )}
        </button>
      )}

      {/* Generated Quote Preview */}
      {generated && (
        <div className="space-y-6 border-t border-border pt-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-text-dim block mb-1">Job Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="text-lg font-bold" />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">Line Items</h3>
              <span className="text-xs text-text-dim">Edit items as needed • All prices ex-GST</span>
            </div>
            <LineItemTable items={items} onChange={setItems} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-text-dim block mb-1">Notes & Assumptions</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[80px] resize-y text-sm" />
          </div>

          {/* Client Details */}
          <div>
            <h3 className="font-bold mb-3">Client Details</h3>
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

          {/* Template Picker */}
          <div>
            <button onClick={() => setShowTemplates(!showTemplates)} className="text-sm text-accent hover:text-accent-hover font-medium">
              {showTemplates ? 'Hide templates' : 'Choose PDF template →'}
            </button>
            {showTemplates && <TemplatePicker value={template} onChange={setTemplate} />}
          </div>

          {/* Regenerate */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="text-sm text-text-dim hover:text-accent transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Regenerate with AI
          </button>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            <button onClick={() => handleSave(false)} disabled={saving || !client.name}
              className="px-5 py-3 rounded-xl text-sm border border-border hover:border-accent/50 transition-colors flex items-center gap-2 font-medium">
              <Download className="w-4 h-4" /> Save Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={saving || !client.name || !client.email}
              className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
