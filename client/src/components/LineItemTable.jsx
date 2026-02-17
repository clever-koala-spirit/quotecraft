import { Plus, Trash2 } from 'lucide-react';

export default function LineItemTable({ items, onChange, readOnly }) {
  const updateItem = (i, field, val) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: val };
    if (field === 'quantity' || field === 'unitPrice') {
      updated[i].total = (Number(updated[i].quantity) || 0) * (Number(updated[i].unitPrice) || 0);
      updated[i].total = Math.round(updated[i].total * 100) / 100;
    }
    onChange(updated);
  };

  const addItem = () => onChange([...items, { description: '', quantity: 1, unit: 'each', unitPrice: 0, total: 0, category: 'labour' }]);
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, i) => s + (Number(i.total) || 0), 0);
  const gst = Math.round(subtotal * 0.1 * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;

  return (
    <div className="space-y-3">
      {/* Header - desktop */}
      <div className="hidden md:grid grid-cols-[1fr_80px_80px_100px_100px_40px_100px] gap-2 text-xs text-text-dim font-medium px-1">
        <span>Description</span><span>Qty</span><span>Unit</span><span>Rate</span><span>Total</span><span></span><span>Category</span>
      </div>
      
      {items.map((item, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-3 md:p-2 md:rounded-lg">
          <div className="md:grid md:grid-cols-[1fr_80px_80px_100px_100px_40px_100px] md:gap-2 md:items-center space-y-2 md:space-y-0">
            <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Description" readOnly={readOnly}
              className="!rounded-lg !p-2 text-sm" />
            <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} readOnly={readOnly}
              className="!rounded-lg !p-2 text-sm" />
            <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} disabled={readOnly} className="!rounded-lg !p-2 text-sm">
              {['each', 'm', 'm²', 'hr', 'day', 'lot', 'kg', 'L'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} readOnly={readOnly}
              className="!rounded-lg !p-2 text-sm" step="0.01" />
            <div className="text-sm font-medium p-2">${(Number(item.total) || 0).toFixed(2)}</div>
            {!readOnly && (
              <button onClick={() => removeItem(i)} className="text-text-dim hover:text-danger transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <select value={item.category} onChange={e => updateItem(i, 'category', e.target.value)} disabled={readOnly} className="!rounded-lg !p-2 text-sm">
              <option value="labour">Labour</option>
              <option value="materials">Materials</option>
            </select>
          </div>
        </div>
      ))}

      {!readOnly && (
        <button onClick={addItem} className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors py-2">
          <Plus className="w-4 h-4" /> Add line item
        </button>
      )}

      <div className="bg-card border border-border rounded-xl p-4 space-y-2 max-w-xs ml-auto">
        <div className="flex justify-between text-sm text-text-dim">
          <span>Subtotal (ex GST)</span><span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-text-dim">
          <span>GST (10%)</span><span>${gst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t border-border pt-2">
          <span>Total (inc GST)</span><span className="text-accent">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
