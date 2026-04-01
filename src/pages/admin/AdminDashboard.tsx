import { 
  LayoutDashboard, Users, CreditCard, ArrowDownCircle, Package, Settings, LogOut, TrendingUp, Wallet, BarChart3
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, rechargesRes, withdrawalsRes, walletsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('recharges').select('amount, status'),
        supabase.from('withdrawals').select('amount, status'),
        supabase.from('wallets').select('total_balance'),
      ]);
      const totalUsers = usersRes.count || 0;
      const recharges = rechargesRes.data || [];
      const totalRecharge = recharges.filter(r => r.status === 'approved').reduce((sum, r) => sum + Number(r.amount), 0);
      const pendingRecharges = recharges.filter(r => r.status === 'pending').length;
      const withdrawals = withdrawalsRes.data || [];
      const totalWithdraw = withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + Number(w.amount), 0);
      const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
      const totalBalance = (walletsRes.data || []).reduce((sum, w) => sum + Number(w.total_balance), 0);
      return { totalUsers, totalRecharge, totalWithdraw, totalBalance, pendingRecharges, pendingWithdrawals };
    },
  });

  const handleLogout = async () => { await signOut(); navigate('/admin/login'); };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, gradient: 'from-blue-500 to-blue-600', link: '/admin/users' },
    { label: 'Total Deposits', value: `₹${(stats?.totalRecharge || 0).toLocaleString('en-IN')}`, icon: CreditCard, gradient: 'from-emerald-500 to-emerald-600', link: '/admin/recharges' },
    { label: 'Total Withdrawals', value: `₹${(stats?.totalWithdraw || 0).toLocaleString('en-IN')}`, icon: ArrowDownCircle, gradient: 'from-red-500 to-red-600', link: '/admin/withdrawals' },
    { label: 'Total Balance', value: `₹${(stats?.totalBalance || 0).toLocaleString('en-IN')}`, icon: Wallet, gradient: 'from-purple-500 to-purple-600', link: '#' },
  ];

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', active: true },
    { icon: Users, label: 'Users', path: '/admin/users', badge: stats?.totalUsers },
    { icon: CreditCard, label: 'Recharges', path: '/admin/recharges', badge: stats?.pendingRecharges },
    { icon: ArrowDownCircle, label: 'Withdrawals', path: '/admin/withdrawals', badge: stats?.pendingWithdrawals },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 p-4 hidden lg:block shadow-clay-dark" style={{ background: '#1E293B' }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-clay-dark" style={{ background: 'linear-gradient(135deg, #34A853, #2FA24F)' }}>
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg">Admin Panel</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                item.active ? 'text-white shadow-clay-dark' : 'text-slate-400 hover:text-white'
              }`}
              style={item.active ? { background: 'linear-gradient(135deg, rgba(52,168,83,0.15), rgba(47,162,79,0.1))' } : {}}>
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-white text-xs font-bold" style={{ background: '#34A853' }}>{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="absolute bottom-4 left-4 right-4 flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" /><span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back, Admin</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Link key={stat.label} to={stat.link} className="rounded-3xl p-5 transition-all hover:scale-[1.02] shadow-clay-dark" style={{ background: '#1E293B' }}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-clay-dark-sm`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/admin/recharges" className="rounded-3xl p-5 transition-all hover:scale-[1.01] shadow-clay-dark" style={{ background: '#1E293B' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-clay-dark-sm" style={{ background: 'rgba(52,168,83,0.15)' }}>
                <CreditCard className="w-6 h-6" style={{ color: '#34A853' }} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Pending Recharges</h3>
                <p className="text-slate-400 text-sm">{stats?.pendingRecharges || 0} requests awaiting approval</p>
              </div>
            </div>
          </Link>
          <Link to="/admin/withdrawals" className="rounded-3xl p-5 transition-all hover:scale-[1.01] shadow-clay-dark" style={{ background: '#1E293B' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-clay-dark-sm" style={{ background: 'rgba(52,168,83,0.15)' }}>
                <ArrowDownCircle className="w-6 h-6" style={{ color: '#34A853' }} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Pending Withdrawals</h3>
                <p className="text-slate-400 text-sm">{stats?.pendingWithdrawals || 0} requests awaiting approval</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Platform Profit */}
        <div className="mt-6 rounded-3xl p-5 shadow-clay-dark" style={{ background: '#1E293B' }}>
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-5 h-5" style={{ color: '#34A853' }} />
            <h3 className="text-white font-semibold">Estimated Platform Profit</h3>
          </div>
          <p className="text-3xl font-extrabold" style={{ color: '#34A853' }}>
            ₹{((stats?.totalRecharge || 0) - (stats?.totalWithdraw || 0)).toLocaleString('en-IN')}
          </p>
          <p className="text-slate-400 text-sm mt-1">Deposits − Withdrawals</p>
        </div>

        {/* Mobile Nav */}
        <div className="fixed bottom-0 left-0 right-0 p-2 lg:hidden shadow-clay-dark" style={{ background: '#1E293B' }}>
          <div className="flex justify-around">
            {menuItems.slice(0, 5).map((item) => (
              <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 p-2 rounded-xl ${item.active ? '' : 'text-slate-400'}`}
                style={item.active ? { color: '#34A853' } : {}}>
                <item.icon className="w-5 h-5" /><span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
