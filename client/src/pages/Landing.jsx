import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ───── Intersection Observer Hook ───── */
function useInView(opts = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); ob.unobserve(el); } }, { threshold: 0.15, ...opts });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return [ref, visible];
}

function Section({ children, className = '', id, style }) {
  const [ref, visible] = useInView();
  return (
    <section id={id} ref={ref} style={style} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </section>
  );
}

/* ───── Counting number animation ───── */
function CountUp({ end, suffix = '', prefix = '', duration = 2000 }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => { start += step; if (start >= end) { setVal(end); clearInterval(id); } else setVal(Math.floor(start)); }, 16);
    return () => clearInterval(id);
  }, [visible, end, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ───── FAQ Accordion ───── */
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-[#141519] transition-colors">
        <span className="font-medium text-[var(--color-text)] pr-4">{q}</span>
        <svg className={`w-5 h-5 shrink-0 text-[var(--color-text-dim)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 pb-5 px-5' : 'max-h-0'}`}>
        <p className="text-[var(--color-text-dim)] leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ───── Device Frames ───── */
function LaptopFrame({ children }) {
  return (
    <div className="relative" style={{ filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.5))' }}>
      <div className="bg-[#2a2a2e] rounded-t-xl pt-3 px-3">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          <div className="flex-1 mx-8 h-5 bg-[#1a1a1e] rounded text-[10px] text-gray-500 flex items-center justify-center">app.quotecraft.au</div>
        </div>
      </div>
      <div className="bg-[#0a0b0f] rounded-b-lg overflow-hidden border-x-4 border-b-4 border-[#2a2a2e]">
        {children}
      </div>
      <div className="mx-auto w-1/3 h-3 bg-[#2a2a2e] rounded-b-xl" />
    </div>
  );
}

function PhoneFrame({ children }) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 280, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }}>
      <div className="bg-[#1a1b23] rounded-[2.5rem] p-2.5 border border-[#333]">
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1a1b23] rounded-b-2xl z-10" />
        <div className="bg-[#0a0b0f] rounded-[2rem] overflow-hidden min-h-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ───── App Screenshot Previews ───── */
function DashboardPreview() {
  return (
    <div className="p-4 text-xs" style={{ minHeight: 300 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-sm text-white">⚡ Dashboard</div>
        <div className="w-6 h-6 rounded-full bg-orange-500/20" />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[['17', 'Quotes', '#3b82f6'], ['$42.5K', 'Quoted', '#f97316'], ['76%', 'Won', '#22c55e']].map(([val, label, color]) => (
          <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: color + '15' }}>
            <div className="font-bold text-sm" style={{ color }}>{val}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      {/* Mini chart */}
      <div className="bg-[#141519] rounded-xl p-3 mb-3">
        <div className="text-[10px] text-gray-500 mb-2">Revenue (6mo)</div>
        <div className="flex items-end gap-1 h-12">
          {[30, 45, 35, 60, 75, 90].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 5 ? '#f97316' : '#f97316' + '40' }} />
          ))}
        </div>
      </div>
      {/* Recent quotes */}
      <div className="text-[10px] text-gray-500 mb-1.5">Recent Quotes</div>
      {[['Kitchen Reno', '$8,400', 'bg-green-500/20 text-green-400'], ['Bathroom Fit', '$3,200', 'bg-yellow-500/20 text-yellow-400'], ['Office Wiring', '$12,800', 'bg-blue-500/20 text-blue-400']].map(([name, price, badge]) => (
        <div key={name} className="flex items-center justify-between py-1.5 border-b border-[#1a1b23]">
          <span className="text-gray-300">{name}</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{price}</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${badge}`}>{badge.includes('green') ? 'Won' : badge.includes('yellow') ? 'Sent' : 'Draft'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuoteBuilderPreview() {
  return (
    <div className="p-4 text-xs">
      <div className="font-bold text-sm text-white mb-3">📝 New Quote</div>
      <div className="mb-3">
        <div className="text-[10px] text-gray-500 mb-1">Job Photos</div>
        <div className="flex gap-2">
          <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=200&fit=crop" loading="lazy" alt="" className="w-16 h-16 rounded-lg object-cover" />
          <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop" loading="lazy" alt="" className="w-16 h-16 rounded-lg object-cover" />
          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-[#333] flex items-center justify-center text-gray-600 text-lg">+</div>
        </div>
      </div>
      <div className="mb-3">
        <div className="text-[10px] text-gray-500 mb-1">Describe the job</div>
        <div className="bg-[#141519] rounded-lg p-2.5 text-gray-400 border border-[#222]">
          Install 12 LED downlights in kitchen and living area, replace old switchboard...
        </div>
      </div>
      <div className="mb-3">
        <div className="text-[10px] text-gray-500 mb-1">Client</div>
        <div className="bg-[#141519] rounded-lg p-2.5 text-gray-300 border border-[#222]">James Wilson — 14 Oak St, Richmond</div>
      </div>
      <button className="w-full bg-[#f97316] text-white font-semibold py-2.5 rounded-xl text-sm">
        ⚡ Generate Quote with AI
      </button>
    </div>
  );
}

function PDFPreview() {
  return (
    <div className="bg-white text-gray-900 p-5 text-xs" style={{ minHeight: 360 }}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm font-bold">⚡</div>
          <div>
            <div className="font-bold text-sm">Spark Electric</div>
            <div className="text-[10px] text-gray-500">ABN 12 345 678 901 | Lic #EC12345</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-orange-500">QUOTE</div>
          <div className="text-[10px] text-gray-500">#QC-0042</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
        <div>
          <div className="text-gray-500 mb-0.5">Prepared for</div>
          <div className="font-semibold">James Wilson</div>
          <div className="text-gray-500">14 Oak Street, Richmond VIC 3121</div>
        </div>
        <div className="text-right">
          <div className="text-gray-500 mb-0.5">Date</div>
          <div className="font-semibold">18 Feb 2026</div>
          <div className="text-gray-500">Valid for 30 days</div>
        </div>
      </div>
      {/* Line items */}
      <table className="w-full text-[10px] mb-3">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-1.5 font-semibold">Item</th>
            <th className="text-right p-1.5 font-semibold">Qty</th>
            <th className="text-right p-1.5 font-semibold">Rate</th>
            <th className="text-right p-1.5 font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {[['LED Downlights (Clipsal)', '12', '$45', '$540.00'], ['Installation Labour', '4 hrs', '$95', '$380.00'], ['Switchboard Upgrade', '1', '$420', '$420.00'], ['Testing & Certification', '1', '$150', '$150.00']].map(([item, qty, rate, amt]) => (
            <tr key={item} className="border-b border-gray-100">
              <td className="p-1.5">{item}</td>
              <td className="p-1.5 text-right text-gray-500">{qty}</td>
              <td className="p-1.5 text-right text-gray-500">{rate}</td>
              <td className="p-1.5 text-right font-medium">{amt}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end">
        <div className="w-40 text-[10px] space-y-1">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>$1,490.00</span></div>
          <div className="flex justify-between text-gray-500"><span>GST (10%)</span><span>$149.00</span></div>
          <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1"><span>Total</span><span>$1,639.00</span></div>
        </div>
      </div>
      <div className="mt-4 bg-green-50 border border-green-200 text-green-700 text-[10px] text-center py-2 rounded-lg font-medium">
        ✅ Click to Accept Quote
      </div>
    </div>
  );
}

function PipelinePreview() {
  const cols = [
    { title: 'Lead', color: '#3b82f6', cards: [{ name: 'Bathroom Reno', price: '$8,400' }, { name: 'Deck Build', price: '$12,000' }] },
    { title: 'Quoted', color: '#f97316', cards: [{ name: 'Kitchen Wiring', price: '$3,200' }, { name: 'Office Fit-out', price: '$15,800' }, { name: 'Pool Lighting', price: '$2,100' }] },
    { title: 'Accepted', color: '#22c55e', cards: [{ name: 'Shop Reno', price: '$6,750' }] },
    { title: 'In Progress', color: '#a855f7', cards: [{ name: 'House Rewire', price: '$18,400' }, { name: 'Solar Install', price: '$9,200' }] },
  ];
  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex gap-3" style={{ minWidth: 600 }}>
        {cols.map(col => (
          <div key={col.title} className="flex-1 min-w-[140px]">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <span className="text-[10px] font-semibold text-gray-400">{col.title}</span>
              <span className="text-[10px] text-gray-600 ml-auto">{col.cards.length}</span>
            </div>
            <div className="space-y-1.5">
              {col.cards.map(card => (
                <div key={card.name} className="bg-[#141519] rounded-lg p-2 border border-[#222]">
                  <div className="text-[10px] text-gray-300 font-medium">{card.name}</div>
                  <div className="text-[10px] text-gray-500">{card.price}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════ */
/*            LANDING PAGE              */
/* ═════════════════════════════════════ */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  }, []);

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] overflow-x-hidden">
      {/* ── Sticky Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0b0f]/90 backdrop-blur-xl border-b border-[var(--color-border)]' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <button onClick={() => scrollTo('hero')} className="text-xl font-bold tracking-tight">⚡ QuoteCraft</button>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => <button key={l.id} onClick={() => scrollTo(l.id)} className="text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors">{l.label}</button>)}
            <Link to="/login" className="text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors">Log In</Link>
            <Link to="/signup" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02]">Get Started Free</Link>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenu ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-[#0a0b0f]/95 backdrop-blur-xl border-b border-[var(--color-border)] px-4 pb-4 space-y-3">
            {navLinks.map(l => <button key={l.id} onClick={() => scrollTo(l.id)} className="block w-full text-left py-2 text-[var(--color-text-dim)]">{l.label}</button>)}
            <Link to="/login" className="block py-2 text-[var(--color-text-dim)]">Log In</Link>
            <Link to="/signup" className="block bg-[var(--color-accent)] text-white text-center font-semibold py-3 rounded-xl">Get Started Free</Link>
          </div>
        )}
      </nav>

      {/* ── 1. HERO — Full-width background image ── */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80"
            alt=""
            loading="eager"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b0f] via-[#0a0b0f]/90 to-[#0a0b0f]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0f] via-transparent to-[#0a0b0f]/30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 rounded-full px-4 py-1.5 text-sm text-[var(--color-text-dim)] mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Now live — 850+ tradies onboard
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
              Stop Losing Jobs to{' '}
              <span className="text-[var(--color-accent)] relative">
                Bad Quotes
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none"><path d="M2 6c40-4 80-4 196 0" stroke="#f97316" strokeWidth="3" strokeLinecap="round" /></svg>
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Snap a photo, describe the job, and fire off a professional quote before you're back in the ute. AI handles the hard bit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/25 text-center">
                Start Free — No Card Required
              </Link>
              <button onClick={() => scrollTo('how-it-works')} className="border border-white/20 hover:border-white/40 text-white font-medium text-lg px-8 py-4 rounded-xl transition-all text-center backdrop-blur-sm">
                See How It Works ↓
              </button>
            </div>
          </div>
          {/* Laptop with dashboard */}
          <div className="hidden lg:block">
            <LaptopFrame>
              <DashboardPreview />
            </LaptopFrame>
          </div>
        </div>
      </section>

      {/* ── 2. Trust Bar ── */}
      <Section className="py-8 px-4 border-y border-[var(--color-border)] bg-[#0e0f14]">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16 items-center">
          {[
            ['2,400+', 'Quotes Generated', '📄'],
            ['850+', 'Happy Tradies', '👷'],
            ['$4.2M+', 'Dollars Quoted', '💰'],
            ['🇦🇺', 'Australian Made', ''],
          ].map(([val, label, icon], i) => (
            <div key={i} className="flex items-center gap-3 text-center">
              {icon && <span className="text-2xl">{icon}</span>}
              <div>
                <div className="font-bold text-lg text-white">{val}</div>
                <div className="text-xs text-[var(--color-text-dim)]">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3. Problem — "Sound Familiar?" ── */}
      <Section id="problem" className="py-20 md:py-28 px-4 bg-[#141519]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4">Sound Familiar?</h2>
          <p className="text-center text-[var(--color-text-dim)] mb-14 max-w-2xl mx-auto">Every tradie knows these pain points. It's time to fix them.</p>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              {[
                ['😤', 'Spending your Sunday arvo writing quotes instead of watching the footy'],
                ['📱', 'Sending quotes from your Notes app and wondering why clients ghost you'],
                ['💸', 'Losing jobs because your quote looked dodgy next to the competition'],
                ['⏰', 'Spending 30 minutes per quote when you could be on the tools'],
                ['🤯', 'Paying $35+/mo for bloated software you barely use'],
              ].map(([icon, text], i) => (
                <div key={i} className="flex gap-4 items-start bg-[#0a0b0f] border border-[var(--color-border)] rounded-2xl p-4 hover:border-red-500/30 transition-colors">
                  <span className="text-2xl shrink-0">{icon}</span>
                  <p className="text-[var(--color-text-dim)] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
                alt="Frustrated with paperwork"
                loading="lazy"
                className="w-full h-full object-cover rounded-2xl"
                style={{ minHeight: 400 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141519] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-[#0a0b0f]/90 backdrop-blur border border-red-500/20 rounded-xl p-4">
                  <div className="text-red-400 font-semibold text-sm mb-1">The Old Way</div>
                  <div className="font-mono text-xs text-gray-500 leading-relaxed">
                    hey mate heres the quote<br />
                    12 downlights - $540<br />
                    labour - dunno maybe $400?<br />
                    plus gst i think<br />
                    <span className="text-gray-600">sent from my iphone</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 4. Solution — How It Works ── */}
      <Section id="how-it-works" className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4">There's a Better Way</h2>
          <p className="text-center text-[var(--color-text-dim)] mb-14 max-w-2xl mx-auto">Three steps. Sixty seconds. One professional quote.</p>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--color-accent)] text-white text-sm font-bold flex items-center justify-center z-10">1</div>
                <PhoneFrame>
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80"
                      alt="Job site photo"
                      loading="lazy"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex gap-2 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-[#141519]" />
                        <div className="w-10 h-10 rounded-lg bg-[#141519]" />
                        <div className="w-10 h-10 rounded-lg border border-dashed border-[#333] flex items-center justify-center text-gray-600 text-xs">+</div>
                      </div>
                      <div className="bg-[#141519] rounded-lg p-2 text-[10px] text-gray-500">Describe the job...</div>
                    </div>
                  </div>
                </PhoneFrame>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Anything</h3>
              <p className="text-[var(--color-text-dim)] text-sm">Photos, documents, emails — drop it all in. Our AI reads everything.</p>
            </div>
            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--color-accent)] text-white text-sm font-bold flex items-center justify-center z-10">2</div>
                <PhoneFrame>
                  <QuoteBuilderPreview />
                </PhoneFrame>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Does the Work</h3>
              <p className="text-[var(--color-text-dim)] text-sm">Describe the job in plain English. AI generates professional line items with market-rate pricing.</p>
            </div>
            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--color-accent)] text-white text-sm font-bold flex items-center justify-center z-10">3</div>
                <PhoneFrame>
                  <div style={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
                    <PDFPreview />
                  </div>
                </PhoneFrame>
              </div>
              <h3 className="text-xl font-semibold mb-2">Send & Track</h3>
              <p className="text-[var(--color-text-dim)] text-sm">Pick from 10 templates. Send a branded PDF. Know when they open it.</p>
            </div>
          </div>
          <div className="text-center mt-14">
            <Link to="/signup" className="inline-block bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/20">
              Try It Free Now
            </Link>
          </div>
        </div>
      </Section>

      {/* ── 5. App Screenshots Showcase ── */}
      <Section className="py-20 md:py-28 px-4 bg-[#141519]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4">See It in Action</h2>
          <p className="text-center text-[var(--color-text-dim)] mb-10">Real tools for real tradies. Click to explore.</p>
          {/* Tab switcher */}
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {['Dashboard', 'Quote Builder', 'PDF Output', 'Job Pipeline'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === i ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-orange-500/20' : 'bg-[#0a0b0f] text-[var(--color-text-dim)] border border-[var(--color-border)] hover:border-[var(--color-text-dim)]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Screenshot display */}
          <div className="max-w-4xl mx-auto">
            <LaptopFrame>
              <div className="transition-all duration-500">
                {activeTab === 0 && <DashboardPreview />}
                {activeTab === 1 && <QuoteBuilderPreview />}
                {activeTab === 2 && <PDFPreview />}
                {activeTab === 3 && <PipelinePreview />}
              </div>
            </LaptopFrame>
          </div>
        </div>
      </Section>

      {/* ── 6. Before / After ── */}
      <Section className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4">From Dodgy to Professional</h2>
          <p className="text-center text-[var(--color-text-dim)] mb-12">See the difference a proper quote makes, mate.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="relative">
              <div className="absolute -top-3 left-6 bg-red-500 text-white text-xs font-bold px-4 py-1 rounded-full z-10">BEFORE</div>
              <div className="bg-[#1a1b20] border border-red-500/20 rounded-2xl overflow-hidden">
                <div className="bg-[#2a2a2e] px-4 py-2 flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  iMessage — Today 9:47 PM
                </div>
                <div className="p-6">
                  <div className="bg-[#2a2b30] rounded-2xl rounded-bl-sm p-4 max-w-[85%] mb-3">
                    <p className="text-sm text-gray-400 font-mono leading-relaxed">
                      hey mate heres the quote for ur kitchen<br /><br />
                      12 downlights - $540<br />
                      labour - dunno maybe $400?<br />
                      switchboard stuff - $350 ish<br />
                      plus gst i think<br /><br />
                      total around $1400 give or take<br /><br />
                      lemme know 👍
                    </p>
                  </div>
                  <div className="text-[10px] text-gray-600 ml-2">sent from my iphone</div>
                </div>
              </div>
              <div className="text-center mt-4 text-sm text-red-400">❌ 23% acceptance rate</div>
            </div>
            {/* After */}
            <div className="relative">
              <div className="absolute -top-3 left-6 bg-[var(--color-accent)] text-white text-xs font-bold px-4 py-1 rounded-full z-10">AFTER</div>
              <div className="border border-[var(--color-accent)]/30 rounded-2xl overflow-hidden shadow-xl shadow-orange-500/5">
                <PDFPreview />
              </div>
              <div className="text-center mt-4 text-sm text-green-400">✅ 76% acceptance rate</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 7. Features Grid ── */}
      <Section id="features" className="py-20 md:py-28 px-4 bg-[#141519]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4">Everything You Need, Nothing You Don't</h2>
          <p className="text-center text-[var(--color-text-dim)] mb-14 max-w-2xl mx-auto">Built for tradies on the tools, not desk jockeys.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              ['🤖', 'AI Quote Builder', 'Upload photos, describe the job, done', '#f97316'],
              ['🎤', 'Voice-to-Quote', 'Talk to the app on-site, it writes the quote', '#a855f7'],
              ['💬', 'AI Chat Assistant', 'Chat with AI to build quotes conversationally', '#3b82f6'],
              ['📄', '10 PDF Templates', 'Professional quotes that win jobs', '#22c55e'],
              ['📸', 'Photo Attachments', 'Job photos embedded right in the quote', '#ec4899'],
              ['👥', 'Client CRM', 'All your clients, quotes, and history', '#06b6d4'],
              ['📊', 'Job Pipeline', 'Track jobs from lead to paid', '#8b5cf6'],
              ['🔔', 'Follow-up Reminders', 'Never forget to chase a quote', '#f59e0b'],
              ['✅', 'Digital Acceptance', 'Clients approve quotes with one tap', '#10b981'],
              ['📈', 'Quote Tracking', 'Know when they open, view, and decide', '#6366f1'],
              ['🧾', 'GST Handling', '10% GST calculated automatically', '#14b8a6'],
              ['📱', 'Mobile-First', 'Built for the job site, not the desk', '#f43f5e'],
            ].map(([icon, title, desc, color], i) => (
              <div key={i} className="group bg-[#0a0b0f] border border-[var(--color-border)] rounded-2xl p-5 hover:-translate-y-1 transition-all hover:shadow-lg" style={{ '--hover-border': color + '40' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: color + '15' }}>
                  {icon}
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-[var(--color-text-dim)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 8. Pipeline Preview (full width) ── */}
      <Section className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-sm text-[var(--color-accent)] font-semibold mb-2 uppercase tracking-wider">Job Pipeline</div>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Track Every Job from Lead to Paid</h2>
            <p className="text-[var(--color-text-dim)] leading-relaxed mb-6">
              Drag-and-drop kanban board so you always know where every job stands. No more sticky notes or spreadsheets.
            </p>
            <ul className="space-y-3 mb-8">
              {['See all jobs at a glance', 'Drag cards between stages', 'Never lose track of a lead', 'Know exactly what\'s coming in'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[var(--color-text-dim)]">
                  <span className="text-[var(--color-success)]">✓</span>{item}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="inline-block bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/20">
              Try the Pipeline Free
            </Link>
          </div>
          <LaptopFrame>
            <PipelinePreview />
          </LaptopFrame>
        </div>
      </Section>

      {/* ── 9. Stats Bar with Background Image ── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1920&q=80"
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0a0b0f]/85" />
        </div>
        <div className="relative max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ['', 2400, '+', 'Quotes Generated'],
            ['', 850, '+', 'Happy Tradies'],
            ['$', 4200000, '+', 'Dollars Quoted'],
            ['', 60, 's', 'Avg Quote Time'],
          ].map(([pre, n, s, label], i) => (
            <div key={i}>
              <div className="text-3xl md:text-5xl font-bold text-[var(--color-accent)]">
                <CountUp end={n} suffix={s} prefix={pre} />
              </div>
              <div className="text-sm text-gray-300 mt-2">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. Testimonials ── */}
      <Section className="py-20 md:py-28 px-4 bg-[#141519]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-14">Tradies Love QuoteCraft</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['Dave M.', 'Electrician, Melbourne', 'I was spending 2 hours a night on quotes. Now I do them in the van between jobs. Game changer.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'],
              ['Sarah K.', 'Plumber, Sydney', 'My quotes look more professional than companies 10x my size. Clients actually comment on it.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face'],
              ['Jake T.', 'Builder, Brisbane', 'The AI quoted a bathroom reno from photos alone. Saved me an hour and the price was spot on.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'],
              ['Emma R.', 'Painter, Perth', "Finally something that isn't bloated enterprise rubbish. Simple, fast, and my win rate is up 40%.", 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face'],
            ].map(([name, role, quote, avatar], i) => (
              <div key={i} className="bg-[#0a0b0f] border border-[var(--color-border)] rounded-2xl p-6 hover:-translate-y-1 transition-transform">
                <div className="text-[var(--color-accent)] text-sm mb-3">★★★★★</div>
                <p className="text-[var(--color-text-dim)] leading-relaxed mb-5">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={avatar} alt={name} loading="lazy" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-sm">{name}</div>
                    <div className="text-xs text-[var(--color-text-dim)]">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Trade Icons ── */}
      <Section className="py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[var(--color-text-dim)] mb-6 text-sm uppercase tracking-widest">Built for every trade</p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {[['⚡','Electrician'],['🔧','Plumber'],['🏗️','Builder'],['🎨','Painter'],['🌿','Landscaper'],['🔨','Carpenter']].map(([icon,label]) => (
              <div key={label} className="flex flex-col items-center gap-1 group">
                <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">{icon}</span>
                <span className="text-xs text-[var(--color-text-dim)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 11. Pricing ── */}
      <Section id="pricing" className="py-20 md:py-28 px-4 bg-[#141519]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4">Simple, Honest Pricing</h2>
          <p className="text-center text-[var(--color-text-dim)] mb-8 max-w-2xl mx-auto">No lock-in contracts. No hidden fees. Cancel anytime.</p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-sm ${!annual ? 'text-[var(--color-text)]' : 'text-[var(--color-text-dim)]'}`}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}>
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${annual ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-sm ${annual ? 'text-[var(--color-text)]' : 'text-[var(--color-text-dim)]'}`}>Annual <span className="text-[var(--color-success)] font-medium">Save 20%</span></span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free', price: 0, pop: false,
                features: ['3 quotes per month', '1 PDF template', 'Basic AI generation', 'Email delivery'],
                cta: 'Get Started Free', ctaStyle: 'border border-[var(--color-border)] hover:border-[var(--color-text-dim)] text-[var(--color-text)]'
              },
              {
                name: 'Pro', price: 15, pop: true,
                features: ['Unlimited quotes', 'All 10 templates + custom', 'Photo & voice-to-quote', 'Quote tracking & notifications', 'Client CRM', 'Follow-up reminders'],
                cta: 'Start 14-Day Free Trial', ctaStyle: 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-lg shadow-orange-500/20'
              },
              {
                name: 'Business', price: 29, pop: false,
                features: ['Everything in Pro', 'Job pipeline (kanban)', 'AI chat assistant', 'Priority AI (faster, smarter)', 'CSV import', 'Team features (coming soon)'],
                cta: 'Start 14-Day Free Trial', ctaStyle: 'border border-[var(--color-border)] hover:border-[var(--color-text-dim)] text-[var(--color-text)]'
              },
            ].map((plan) => {
              const displayPrice = plan.price === 0 ? 0 : annual ? Math.round(plan.price * 0.8) : plan.price;
              return (
                <div key={plan.name} className={`relative bg-[var(--color-card)] border rounded-2xl p-8 ${plan.pop ? 'border-[var(--color-accent)] scale-[1.02] md:scale-105' : 'border-[var(--color-border)]'}`}>
                  {plan.pop && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[var(--color-accent)] text-white text-xs font-bold px-4 py-1 rounded-full">MOST POPULAR</div>}
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${displayPrice}</span>
                    <span className="text-[var(--color-text-dim)]">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-dim)]">
                        <span className="text-[var(--color-success)] mt-0.5">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className={`block text-center font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] ${plan.ctaStyle}`}>
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-[var(--color-text-dim)] mt-8">Competitors charge $35+/mo for less. We keep it simple.</p>
        </div>
      </Section>

      {/* ── 12. FAQ ── */}
      <Section id="faq" className="py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-14">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              ['Do I need to download an app?', 'Nope. QuoteCraft works in your browser on any device — phone, tablet, or desktop. No app store required.'],
              ['How does the AI know what to charge?', 'We use Australian market-rate data by trade and region. You always review and adjust before sending — the AI gives you a smart starting point.'],
              ['Is my data secure?', 'Bank-grade encryption. Your client data is stored securely and never shared with third parties.'],
              ['Can I use my own logo and branding?', 'Yes — upload your logo, set your colours, and every quote looks like it came from YOUR business.'],
              ['What trades does it support?', 'Electricians, plumbers, builders, painters, landscapers, carpenters, HVAC, roofers, tilers, cleaners — and more. If you quote for work, QuoteCraft works for you.'],
              ['Can my clients sign quotes digitally?', 'Yes — clients get a link, review the quote, and accept with one tap. No printing, no scanning.'],
              ['What if I want to cancel?', 'Cancel anytime, no lock-in contracts. Your data stays yours and you can export everything.'],
            ].map(([q, a], i) => <FAQ key={i} q={q} a={a} />)}
          </div>
        </div>
      </Section>

      {/* ── 13. Final CTA — Background image ── */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80"
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0a0b0f]/80" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Your Next Quote Takes <span className="text-[var(--color-accent)]">60 Seconds</span>
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">
            Join tradies across Australia who are winning more jobs and knocking off earlier with AI-powered quotes.
          </p>
          <Link to="/signup" className="inline-block bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-lg px-10 py-5 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/25">
            Start Free — No Card Required
          </Link>
          <p className="text-sm text-gray-400 mt-6">Free plan available · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* ── 14. Footer ── */}
      <footer className="border-t border-[var(--color-border)] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-lg font-bold mb-3">⚡ QuoteCraft</div>
              <p className="text-sm text-[var(--color-text-dim)]">AI-powered quotes for tradies who'd rather be on the tools.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <div className="space-y-2 text-sm text-[var(--color-text-dim)]">
                <button onClick={() => scrollTo('features')} className="block hover:text-[var(--color-text)]">Features</button>
                <button onClick={() => scrollTo('pricing')} className="block hover:text-[var(--color-text)]">Pricing</button>
                <button onClick={() => scrollTo('faq')} className="block hover:text-[var(--color-text)]">FAQ</button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <div className="space-y-2 text-sm text-[var(--color-text-dim)]">
                <a href="#" className="block hover:text-[var(--color-text)]">Privacy Policy</a>
                <a href="#" className="block hover:text-[var(--color-text)]">Terms of Service</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Connect</h4>
              <div className="space-y-2 text-sm text-[var(--color-text-dim)]">
                <a href="mailto:hello@quotecraft.au" className="block hover:text-[var(--color-text)]">hello@quotecraft.au</a>
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--color-border)] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[var(--color-text-dim)]">
            <span>🇦🇺 Made with 🔨 in Australia</span>
            <span>© {new Date().getFullYear()} QuoteCraft. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* ── Sticky Mobile CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-[#0a0b0f]/95 backdrop-blur-xl border-t border-[var(--color-border)] p-3 z-50">
        <Link to="/signup" className="block bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-center py-3.5 rounded-xl transition-all">
          Start Free — No Card Required
        </Link>
      </div>
    </div>
  );
}
