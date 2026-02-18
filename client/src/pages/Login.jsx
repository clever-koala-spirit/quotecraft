import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Hammer } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Hammer className="w-8 h-8 text-accent" />
          <span className="text-2xl font-bold">QuoteCraft</span>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Log in</h2>
          {error && <div className="bg-danger/10 text-danger text-sm rounded-xl p-3 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-sm text-text-dim block mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div><label className="text-sm text-text-dim block mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <button type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors">
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-text-dim">or</span></div>
          </div>
          <button
            type="button"
            onClick={async () => { setLoading(true); try { await login({ email: 'demo@quotecraft.com', password: 'demo1234' }); navigate('/dashboard'); } catch(err) { setError('Demo account not found. Run seed first.'); } finally { setLoading(false); } }}
            disabled={loading}
            className="w-full border border-accent text-accent hover:bg-accent/10 disabled:opacity-50 py-3 rounded-xl font-medium transition-colors"
          >
            Try Demo Account
          </button>
          <p className="text-sm text-text-dim text-center mt-4">
            Don't have an account? <Link to="/signup" className="text-accent hover:text-accent-hover">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
