import { useNavigate } from 'react-router-dom';
import { Hammer, CheckCircle2, ArrowLeft } from 'lucide-react';

const plans = [
  {
    name: 'Pro',
    price: '$15',
    desc: 'Perfect for sole traders',
    features: ['50 AI quotes per month', 'Professional PDF generation', 'Email delivery', 'Quote tracking & analytics', 'GST-compliant quotes', 'Custom business branding'],
  },
  {
    name: 'Business',
    price: '$29',
    desc: 'For growing trade businesses',
    popular: true,
    features: ['Unlimited AI quotes', 'Professional PDF generation', 'Email delivery', 'Quote tracking & analytics', 'GST-compliant quotes', 'Custom business branding', 'Priority support', 'Team access (coming soon)', 'Quote templates (coming soon)'],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Hammer className="w-6 h-6 text-accent" /><span className="text-lg font-bold">QuoteCraft</span>
          </div>
          <button onClick={() => navigate(-1)} className="text-sm text-text-dim hover:text-text flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">Simple, transparent pricing</h1>
        <p className="text-text-dim text-center mb-12">No lock-in contracts. Cancel anytime.</p>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map(plan => (
            <div key={plan.name} className={`rounded-2xl p-6 border ${plan.popular ? 'border-accent bg-accent/5' : 'border-border bg-card'}`}>
              {plan.popular && <div className="text-accent text-xs font-medium mb-2">MOST POPULAR</div>}
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className="text-text-dim text-sm mt-1">{plan.desc}</p>
              <div className="text-4xl font-bold mt-4">{plan.price}<span className="text-base text-text-dim font-normal">/mo</span></div>
              <ul className="space-y-3 mt-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')}
                className={`w-full mt-8 py-3 rounded-xl font-medium transition-colors ${
                  plan.popular ? 'bg-accent hover:bg-accent-hover text-white' : 'border border-border hover:border-accent/50'
                }`}>Start Free Trial</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
