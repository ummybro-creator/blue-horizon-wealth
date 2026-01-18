import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ArrowDownCircle,
  Package,
  Settings,
  LogOut,
  TrendingUp,
  Wallet,
  UserCheck
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Fetch dashboard stats
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
      const totalRecharge = recharges
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + Number(r.amount), 0);
      const pendingRecharges = recharges.filter(r => r.status === 'pending').length;
      
      const withdrawals = withdrawalsRes.data || [];
      const totalWithdraw = withdrawals
        .filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + Number(w.amount), 0);
      const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

      const totalBalance = (walletsRes.data || [])
        .reduce((sum, w) => sum + Number(w.total_balance), 0);

      return {
        totalUsers,
        totalRecharge,
        totalWithdraw,
        totalBalance,
        pendingRecharges,
        pendingWithdrawals,
      };
    },
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      link: '/admin/users'
    },
    { 
      label: 'Total Recharge', 
      value: `₹${(stats?.totalRecharge || 0).toLocaleString('en-IN')}`, 
      icon: CreditCard, 
      color: 'from-green-500 to-green-600',
      link: '/admin/recharges'
    },
    { 
      label: 'Total Withdraw', 
      value: `₹${(stats?.totalWithdraw || 0).toLocaleString('en-IN')}`, 
      icon: ArrowDownCircle, 
      color: 'from-red-500 to-red-600',
      link: '/admin/withdrawals'
    },
    { 
      label: 'Total Balance', 
      value: `₹${(stats?.totalBalance || 0).toLocaleString('en-IN')}`, 
      icon: Wallet, 
      color: 'from-purple-500 to-purple-600',
      link: '#'
    },
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
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 p-4 hidden lg:block">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg">Admin Panel</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                item.active 
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-600/20 text-orange-400' 
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-4 left-4 right-4 flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back, Admin</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/recharges"
            className="bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-orange-500/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Pending Recharges</h3>
                <p className="text-slate-400 text-sm">{stats?.pendingRecharges || 0} requests awaiting approval</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/withdrawals"
            className="bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-orange-500/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <ArrowDownCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Pending Withdrawals</h3>
                <p className="text-slate-400 text-sm">{stats?.pendingWithdrawals || 0} requests awaiting approval</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-2 lg:hidden">
          <div className="flex justify-around">
            {menuItems.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
                  item.active ? 'text-orange-400' : 'text-slate-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
