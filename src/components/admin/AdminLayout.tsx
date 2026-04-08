import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, CreditCard, ArrowDownCircle, Package, ShoppingCart,
  Receipt, GitBranch, Gift, Trophy, BarChart3, Shield, Settings, LogOut,
  TrendingUp, Menu, X, CalendarCheck, Megaphone
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: CreditCard, label: 'Recharges', path: '/admin/recharges' },
  { icon: ArrowDownCircle, label: 'Withdrawals', path: '/admin/withdrawals' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Receipt, label: 'Transactions', path: '/admin/transactions' },
  { icon: GitBranch, label: 'Referral System', path: '/admin/referrals' },
  { icon: Gift, label: 'Reward Control', path: '/admin/rewards' },
  { icon: CalendarCheck, label: 'Check-in Control', path: '/admin/checkins' },
  { icon: Megaphone, label: 'Promoter Applications', path: '/admin/promoters' },
  { icon: Trophy, label: 'Leaderboard', path: '/admin/leaderboard' },
  { icon: BarChart3, label: 'Financial Reports', path: '/admin/reports' },
  { icon: Shield, label: 'Security', path: '/admin/security' },
  { icon: Settings, label: 'System Settings', path: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await signOut(); navigate('/admin/login'); };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center clay-button">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-foreground text-lg">Admin Panel</span>
      </div>
      <nav className="space-y-0.5 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:text-destructive transition-colors mt-4"
      >
        <LogOut className="w-4 h-4" /><span className="text-sm">Logout</span>
      </button>
    </>
  );

  return (
    <div className="admin-bg min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 p-4 hidden lg:flex flex-col admin-card" style={{ borderRadius: '0 22px 22px 0', zIndex: 40 }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 p-4 flex flex-col admin-card animate-fade-in" style={{ borderRadius: '0 22px 22px 0' }}>
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="lg:ml-60 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-4">
          <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-2xl flex items-center justify-center admin-card">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-bold text-foreground">Admin Panel</h1>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
