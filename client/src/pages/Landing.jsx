import { useNavigate } from 'react-router-dom';
import { Hammer, Zap, Shield, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hammer className="w-6 h-6 text-accent" />
            <span className="text-lg font-bold">QuoteCraft</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/pricing')} className="text-sm text-text-dim hover:text-text transition-colors">Pricing</button>
            <button onClick={() => navigate('/login')} className="text-sm text-text-dim hover:text-text transition-colors">Log in</button>
            <button onClick={() => navigate('/signup')} className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent text-sm mb-6">
          <Zap className="w-3.5 h-3.5" /> AI-Powered Quotes in Seconds
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
          Stop sending quotes from your <span className="text-accent">Notes app</span>
        </h1>
        <p className="text-lg text-text-dim max-w-2xl mx-auto mb-8">
          QuoteCraft uses AI to generate professional, itemised quotes for tradies in under 5 seconds. 
          GST-compliant, branded PDFs your clients will actually want to accept.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/signup')} className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-xl text-base font-medium transition-colors flex items-center justify-center gap-2">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/pricing')} className="border border-border hover:border-accent/50 px-8 py-3 rounded-xl text-base font-medium transition-colors">
            View Pricing
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'AI Quote Generation', desc: 'Describe the job, get itemised line items with accurate AU trade pricing in seconds.' },
            { icon: Shield, title: 'GST & ABN Compliant', desc: 'Every quote includes your ABN, proper GST calculation, and meets Australian standards.' },
            { icon: Clock, title: 'Track & Close', desc: 'Know when clients view your quote. Track acceptance rates. Close more jobs.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-text-dim text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Simple pricing for every tradie</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {[
            { name: 'Pro', price: '$15', features: ['50 AI quotes/mo', 'PDF generation', 'Email delivery', 'Quote tracking'] },
            { name: 'Business', price: '$29', features: ['Unlimited AI quotes', 'Custom branding', 'Priority support', 'Team access (coming soon)'], popular: true },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-6 border ${plan.popular ? 'border-accent bg-accent/5' : 'border-border bg-card'}`}>
              {plan.popular && <div className="text-accent text-xs font-medium mb-2">MOST POPULAR</div>}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="text-3xl font-bold mt-2 mb-1">{plan.price}<span className="text-sm text-text-dim font-normal">/mo</span></div>
              <ul className="space-y-2 mt-4">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-dim">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')} className={`w-full mt-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                plan.popular ? 'bg-accent hover:bg-accent-hover text-white' : 'border border-border hover:border-accent/50'
              }`}>Get Started</button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-text-dim">
        <p>© 2026 QuoteCraft. Built for Australian tradies.</p>
      </footer>
    </div>
  );
}
