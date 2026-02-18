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

function Section({ children, className = '', id }) {
  const [ref, visible] = useInView();
  return (
    <section id={id} ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </section>
  );
}

/* ───── Counting number animation ───── */
function CountUp({ end, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => { start += step; if (start >= end) { setVal(end); clearInterval(id); } else setVal(Math.floor(start)); }, 16);
    return () => clearInterval(id);
  }, [visible, end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
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

/* ───── Hero Phone Mockup ───── */
function HeroMockup() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % 3), 2500);
    return () => clearInterval(id);
  }, []);
  const labels = ['📸 Upload Photos', '🤖 AI Generating...', '📄 Quote Ready!'];
  const colors = ['#3b82f6', '#f97316', '#22c55e'];
  return (
    <div className="relative animate-float mx-auto w-56 md:w-64">
      <div className="bg-[#1a1b23] rounded-[2rem] p-3 border border-[var(--color-border)] shadow-2xl shadow-orange-500/10">
        <div className="bg-[#0a0b0f] rounded-[1.5rem] h-80 md:h-96 flex flex-col items-center justify-center gap-4 overflow-hidden relative">
          {[0, 1, 2].map(i => (
            <div key={i} className={`absolute inset-0 flex flex-col items-center justify-center gap-4 transition-all duration-500 ${step === i ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="text-5xl">{['📸', '⚡', '✅'][i]}</div>
              <div className="text-sm font-medium px-4 py-2 rounded-full" style={{ background: colors[i] + '22', color: colors[i] }}>{labels[i]}</div>
              {i === 2 && <div className="w-36 space-y-2 mt-2">{[1,2,3].map(j => <div key={j} className="h-2 rounded-full bg-[var(--color-border)]" style={{width: `${100-j*20}%`}}/>)}</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-[var(--color-text-dim)]/30" />
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

      {/* ── 1. Hero ── */}
      <Section id="hero" className="pt-28 pb-20 md:pt-36 md:pb-28 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Stop Losing Jobs to <span className="text-[var(--color-accent)]">Bad Quotes</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--color-text-dim)] mb-8 max-w-lg mx-auto md:mx-0">
              Upload photos. Describe the job. Get a professional quote in 60 seconds — powered by AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/signup" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/20 text-center">
                Start Free — No Card Required
              </Link>
              <button onClick={() => scrollTo('how-it-works')} className="border border-[var(--color-border)] hover:border-[var(--color-text-dim)] text-[var(--color-text)] font-medium text-lg px-8 py-4 rounded-xl transition-all text-center">
                See How It Works ↓
              </button>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-8 justify-center md:justify-start text-sm text-[var(--color-text-dim)]">
              <span>✅ Join 500+ tradies</span>
              <span>📱 iPhone & Android</span>
              <span>🇦🇺 Australian Made</span>
            </div>
          </div>
          <HeroMockup />
        </div>
      </Section>

      {/* ── 2. Problem Section ── */}
      <Section id="problem" className="py-20 md:py-28 px-4 bg-[#141519]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4">Sound Familiar?</h2>
          <p className="text-center text-[var(--color-text-dim)] mb-12 max-w-2xl mx-auto">Every tradie knows these pain points. It's time to fix them.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ['😤', 'Spending your Sunday night writing quotes instead of watching the footy'],
              ['📱', 'Sending quotes from your Notes app and wondering why clients ghost you'],
              ['💸', 'Losing jobs because your quote looked unprofessional next to the competition'],
              ['⏰', 'Spending 30 minutes per quote when you could be on the tools'],
              ['📧', 'No idea if the client even opened your quote'],
              ['🤯', 'Paying $35+/mo for bloated software you barely use'],
            ].map(([icon, text], i) => (
              <div key={i} className="bg-[#0a0b0f] border border-[var(--color-border)] rounded-2xl p-5 hover:border-red-500/30 transition-colors">
                <span className="text-2xl">{icon}</span>
                <p className="mt-3 text-[var(--color-text-dim)] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 3. Solution — How It Works ── */}
      <Section id="how-it-works" className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4">There's a Better Way</h2>
          <p className="text-center text-[var(--color-text-dim)] mb-14 max-w-2xl mx-auto">Three steps. Sixty seconds. One professional quote.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              ['1', '📤', 'Upload Anything', 'Photos, documents, emails — drop it all in. Our AI reads everything.'],
              ['2', '🤖', 'AI Does the Work', 'Describe the job in plain English. AI generates professional line items with market-rate pricing.'],
              ['3', '🚀', 'Send & Track', 'Pick from 10 templates. Send a branded PDF. Know when they open it.'],
            ].map(([num, icon, title, desc]) => (
              <div key={num} className="relative bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-8 text-center hover:-translate-y-1 transition-transform">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--color-accent)] text-white text-sm font-bold flex items-center justify-center">{num}</div>
                <div className="text-4xl mb-4 mt-2">{icon}</div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-[var(--color-text-dim)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/signup" className="inline-block bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/20">
              Try It Free Now
            </Link>
          </div>
        </div>
      </Section>

      {/* ── 4. Features Grid ── */}
      <Section id="features" className="py-20 md:py-28 px-4 bg-[#141519]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4">Everything You Need, Nothing You Don't</h2>
          <p className="text-center text-[var(--color-text-dim)] mb-14 max-w-2xl mx-auto">Built for tradies, not accountants. Every feature earns its place.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              ['🤖', 'AI Quote Builder', 'Upload photos, describe the job, done'],
              ['🎤', 'Voice-to-Quote', 'Talk to the app on-site, it writes the quote'],
              ['💬', 'AI Chat Assistant', 'Chat with AI to build quotes conversationally'],
              ['📄', '10 PDF Templates', 'Professional quotes that win jobs'],
              ['📸', 'Photo Attachments', 'Job photos embedded right in the quote'],
              ['👥', 'Client CRM', 'All your clients, quotes, and history in one place'],
              ['📊', 'Job Pipeline', 'Track jobs from lead to paid'],
              ['🔔', 'Follow-up Reminders', 'Never forget to chase a quote'],
              ['✅', 'Digital Acceptance', 'Clients approve quotes with one tap'],
              ['📈', 'Quote Tracking', 'Know when they open, view, and decide'],
              ['🧾', 'GST Handling', '10% GST calculated automatically'],
              ['📱', 'Mobile-First', 'Built for tradies on the tools, not desk jockeys'],
            ].map(([icon, title, desc], i) => (
              <div key={i} className="bg-[#0a0b0f] border border-[var(--color-border)] rounded-2xl p-5 hover:-translate-y-1 hover:border-[var(--color-accent)]/30 transition-all">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-semibold mt-3 mb-1">{title}</h3>
                <p className="text-sm text-[var(--color-text-dim)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 5. Comparison ── */}
      <Section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-14">QuoteCraft vs The Old Way</h2>
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center text-lg font-semibold text-red-400 mb-4">❌ Without QuoteCraft</div>
              <div className="text-center text-lg font-semibold text-[var(--color-success)] mb-4">✅ With QuoteCraft</div>
              {[
                ['Typing quotes in Notes/Word', 'AI generates in 60 seconds'],
                ['No idea if client saw it', 'Real-time open tracking'],
                ['Ugly text quotes', '10 professional templates'],
                ['Forgetting to follow up', 'Automatic reminders'],
                ['Scattered client info', 'CRM with full history'],
                ['$35+/mo for bloated software', 'Simple. $15/mo. Done.'],
              ].map(([bad, good], i) => (
                <div key={i} className="contents">
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-[var(--color-text-dim)]">{bad}</div>
                  <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4 text-[var(--color-text)]">{good}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile stacked */}
          <div className="md:hidden space-y-4">
            {[
              ['Typing quotes in Notes/Word', 'AI generates in 60 seconds'],
              ['No idea if client saw it', 'Real-time open tracking'],
              ['Ugly text quotes', '10 professional templates'],
              ['Forgetting to follow up', 'Automatic reminders'],
              ['Scattered client info', 'CRM with full history'],
              ['$35+/mo for bloated software', 'Simple. $15/mo. Done.'],
            ].map(([bad, good], i) => (
              <div key={i} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5">
                <div className="text-red-400 text-sm mb-2">❌ {bad}</div>
                <div className="text-[var(--color-success)] font-medium">✅ {good}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/signup" className="inline-block bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/20">
              Switch to QuoteCraft
            </Link>
          </div>
        </div>
      </Section>

      {/* ── 6. Testimonials ── */}
      <Section className="py-20 md:py-28 px-4 bg-[#141519]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-14">Tradies Love QuoteCraft</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['Dave M.', 'Electrician, Melbourne', 'I was spending 2 hours a night on quotes. Now I do them in the van between jobs.'],
              ['Sarah K.', 'Plumber, Sydney', 'My quotes look more professional than companies 10x my size.'],
              ['Jake T.', 'Builder, Brisbane', 'The AI quoted a bathroom reno from photos alone. Saved me an hour.'],
              ['Tom R.', 'Painter, Perth', "Finally something that isn't trying to be a whole office suite. Just quotes, done right."],
            ].map(([name, role, quote], i) => (
              <div key={i} className="bg-[#0a0b0f] border border-[var(--color-border)] rounded-2xl p-6">
                <div className="text-[var(--color-accent)] text-sm mb-3">★★★★★</div>
                <p className="text-[var(--color-text-dim)] leading-relaxed mb-4">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] font-bold text-sm">{name[0]}</div>
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

      {/* ── 7. Pricing ── */}
      <Section id="pricing" className="py-20 md:py-28 px-4">
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

      {/* ── 8. FAQ ── */}
      <Section id="faq" className="py-20 md:py-28 px-4 bg-[#141519]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-14">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              ['Do I need to download an app?', 'Nope. QuoteCraft works in your browser on any device — phone, tablet, or desktop. No app store required.'],
              ['How does the AI know what to charge?', 'We use Australian market-rate data by trade and region. You always review and adjust before sending — the AI gives you a smart starting point.'],
              ['Is my data secure?', 'Bank-grade encryption. Your client data is stored securely and never shared with third parties.'],
              ['Can I use my own logo and branding?', 'Yes — upload your logo, set your colours, and every quote looks like it came from YOUR business.'],
              ['What trades does it support?', 'Electricians, plumbers, builders, painters, landscapers, carpenters, HVAC, roofers, tilers, cleaners — and more. If you quote for work, QuoteCraft works for you.'],
              ['Do I need an ABN?', 'If you\'re in Australia, we include your ABN on every quote automatically — it\'s a legal requirement.'],
              ['Can my clients sign quotes digitally?', 'Yes — clients get a link, review the quote, and accept with one tap. No printing, no scanning.'],
              ['What if I want to cancel?', 'Cancel anytime, no lock-in contracts. Your data stays yours and you can export everything.'],
            ].map(([q, a], i) => <FAQ key={i} q={q} a={a} />)}
          </div>
        </div>
      </Section>

      {/* ── 9. Final CTA ── */}
      <Section className="py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Your Next Quote Takes <span className="text-[var(--color-accent)]">60 Seconds</span>
          </h2>
          <p className="text-lg text-[var(--color-text-dim)] mb-10 max-w-xl mx-auto">
            Join tradies across Australia who are winning more jobs with professional AI-powered quotes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/20">
              Start Free — No Card Required
            </Link>
          </div>
          <p className="text-sm text-[var(--color-text-dim)] mt-6">Free plan available — start today</p>
        </div>
      </Section>

      {/* ── 10. Footer ── */}
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
            <span>Made with 🔨 in Australia</span>
            <span>ABN: XX XXX XXX XXX</span>
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

      {/* Float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
