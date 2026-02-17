import { useState, useEffect } from 'react';
import { api } from '../api';
import { Save, Upload, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const [profile, setProfile] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.getProfile().then(setProfile).catch(console.error); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile(profile);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile({ ...profile, logo: reader.result });
    reader.readAsDataURL(file);
  };

  const update = (field) => (e) => setProfile({ ...profile, [field]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Business Profile</h1>
        <button onClick={handleSave} disabled={saving}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
        </button>
      </div>

      {/* Logo */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-medium mb-3">Logo</h3>
        <div className="flex items-center gap-4">
          {profile.logo ? (
            <img src={profile.logo} alt="Logo" className="w-20 h-20 rounded-xl object-contain bg-white p-2" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-border flex items-center justify-center text-text-dim text-xs">No logo</div>
          )}
          <label className="cursor-pointer border border-border hover:border-accent/50 px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload
            <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </label>
        </div>
      </div>

      {/* Details */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-medium">Business Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="text-sm text-text-dim block mb-1">Business Name</label>
            <input value={profile.business_name || ''} onChange={update('business_name')} /></div>
          <div><label className="text-sm text-text-dim block mb-1">ABN *</label>
            <input value={profile.abn || ''} onChange={update('abn')} placeholder="XX XXX XXX XXX" /></div>
          <div><label className="text-sm text-text-dim block mb-1">Licence Number</label>
            <input value={profile.licence_number || ''} onChange={update('licence_number')} /></div>
          <div><label className="text-sm text-text-dim block mb-1">Trade Type</label>
            <input value={profile.trade_type || ''} onChange={update('trade_type')} /></div>
          <div><label className="text-sm text-text-dim block mb-1">Phone</label>
            <input value={profile.phone || ''} onChange={update('phone')} /></div>
          <div><label className="text-sm text-text-dim block mb-1">Email</label>
            <input type="email" value={profile.email || ''} onChange={update('email')} /></div>
          <div className="sm:col-span-2"><label className="text-sm text-text-dim block mb-1">Address</label>
            <input value={profile.address || ''} onChange={update('address')} /></div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-medium">Payment</h3>
        <div><label className="text-sm text-text-dim block mb-1">Payment Terms</label>
          <textarea value={profile.payment_terms || ''} onChange={update('payment_terms')}
            placeholder="e.g. 50% deposit required. Balance due on completion. Payment within 14 days." className="min-h-[80px]" /></div>
        <div><label className="text-sm text-text-dim block mb-1">Bank Details</label>
          <textarea value={profile.bank_details || ''} onChange={update('bank_details')}
            placeholder="BSB: XXX-XXX&#10;Account: XXXXXXXX&#10;Account Name: Your Business" className="min-h-[80px]" /></div>
      </div>
    </div>
  );
}
