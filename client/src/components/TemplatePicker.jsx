const templates = [
  { id: 'clean-modern', name: 'Clean Modern', desc: 'Minimal, lots of whitespace', color: '#333', accent: '#333' },
  { id: 'professional-blue', name: 'Professional Blue', desc: 'Corporate feel', color: '#1a4b8c', accent: '#1a4b8c' },
  { id: 'trade-bold', name: 'Trade Bold', desc: 'Strong headers, construction feel', color: '#f97316', accent: '#f97316' },
  { id: 'minimal', name: 'Minimal', desc: 'Just the essentials', color: '#666', accent: '#888' },
  { id: 'detailed', name: 'Detailed', desc: 'Extra breakdown sections', color: '#2d3748', accent: '#2d3748' },
  { id: 'premium', name: 'Premium', desc: 'High-end, luxury trades', color: '#1a1a2e', accent: '#b8860b' },
  { id: 'compact', name: 'Compact', desc: 'Fits on one page', color: '#444', accent: '#444' },
  { id: 'photo-gallery', name: 'Photo Gallery', desc: 'Large job photos included', color: '#2d5016', accent: '#2d5016' },
  { id: 'itemised', name: 'Itemised', desc: 'Detailed line-by-line', color: '#4a1d96', accent: '#4a1d96' },
  { id: 'custom', name: 'Custom', desc: 'Adjustable colors & layout', color: '#f97316', accent: '#f97316' },
];

export default function TemplatePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-3">
      {templates.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`relative border-2 rounded-xl p-3 text-left transition-all hover:scale-105 ${
            value === t.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/40'
          }`}
        >
          {/* Mini PDF preview */}
          <div className="w-full aspect-[3/4] bg-white rounded-lg mb-2 overflow-hidden relative">
            <div className="absolute inset-0 p-2">
              <div className="h-2 rounded-sm mb-1" style={{ background: t.accent, width: '60%' }} />
              <div className="h-1 bg-gray-200 rounded-sm mb-1 w-full" />
              <div className="h-1 bg-gray-200 rounded-sm mb-1 w-3/4" />
              <div className="h-3 rounded-sm mt-2 mb-1" style={{ background: t.color, width: '100%' }} />
              <div className="h-1 bg-gray-100 rounded-sm mb-0.5 w-full" />
              <div className="h-1 bg-gray-50 rounded-sm mb-0.5 w-full" />
              <div className="h-1 bg-gray-100 rounded-sm mb-0.5 w-full" />
              <div className="h-1 bg-gray-50 rounded-sm w-full" />
            </div>
          </div>
          <div className="text-xs font-bold truncate">{t.name}</div>
          <div className="text-[10px] text-text-dim truncate">{t.desc}</div>
          {value === t.id && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white text-[10px]">✓</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
