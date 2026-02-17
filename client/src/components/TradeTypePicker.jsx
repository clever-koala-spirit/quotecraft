import { Zap, Droplets, Building2, Paintbrush, TreePine, Hammer, Wind, Home, Grid3X3, Sparkles } from 'lucide-react';

const trades = [
  { id: 'electrician', label: 'Electrician', icon: Zap },
  { id: 'plumber', label: 'Plumber', icon: Droplets },
  { id: 'builder', label: 'Builder', icon: Building2 },
  { id: 'painter', label: 'Painter', icon: Paintbrush },
  { id: 'landscaper', label: 'Landscaper', icon: TreePine },
  { id: 'carpenter', label: 'Carpenter', icon: Hammer },
  { id: 'hvac', label: 'HVAC', icon: Wind },
  { id: 'roofer', label: 'Roofer', icon: Home },
  { id: 'tiler', label: 'Tiler', icon: Grid3X3 },
  { id: 'cleaner', label: 'Cleaner', icon: Sparkles },
];

export default function TradeTypePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {trades.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => onChange(id)}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
            value === id ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-card text-text-dim hover:border-accent/50 hover:text-text'
          }`}>
          <Icon className="w-6 h-6" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
