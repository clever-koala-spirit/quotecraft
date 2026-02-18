import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { LayoutDashboard, PlusCircle, Settings, LogOut, Hammer, Users, Kanban, Bell, FileText } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/quotes/new', icon: PlusCircle, label: 'New Quote' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/followups', icon: Bell, label: 'Follow-ups' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg">
      {/* Top nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Hammer className="w-6 h-6 text-accent" />
            <span className="text-lg font-bold">QuoteCraft</span>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-accent/10 text-accent' : 'text-text-dim hover:text-text hover:bg-card'}`
              }>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
            <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-dim hover:text-danger transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
