import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { api, setToken, clearToken, isLoggedIn } from './api';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NewQuote from './pages/NewQuote';
import QuoteDetail from './pages/QuoteDetail';
import Settings from './pages/Settings';
import PublicQuote from './pages/PublicQuote';
import Pricing from './pages/Pricing';
import Layout from './components/Layout';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn()) {
      api.me().then(u => setUser(u)).catch(() => clearToken()).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data) => {
    const res = await api.login(data);
    setToken(res.token);
    setUser(res.user);
  };

  const signup = async (data) => {
    const res = await api.signup(data);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => { clearToken(); setUser(null); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg"><div className="text-text-dim">Loading...</div></div>;

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/q/:id" element={<PublicQuote />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quotes/new" element={<NewQuote />} />
            <Route path="/quotes/:id" element={<QuoteDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
