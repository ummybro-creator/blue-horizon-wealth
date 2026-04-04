import { 
  LayoutDashboard, Users, CreditCard, ArrowDownCircle, Wallet, BarChart3, TrendingUp, TrendingDown, ShoppingCart, UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_dashboard_stats');
      return data as any;
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ['admin-revenue-chart'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_revenue_chart', { p_days: 14 });
      return (data || []).map((d: any) => ({
        date: new Date(d.log_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        deposits: Number(d.recharge_amount),
        withdrawals: Number(d.withdraw_amount),
        profit: Number(d.profit_amount),
      }));
    },
  });

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Users', value: stats?.active_users || 0, icon: UserCheck, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Deposits', value: `₹${Number(stats?.total_deposits || 0).toLocaleString('en-IN')}`, icon: CreditCard, color: 'from-green-500 to-green-600' },
    { label: 'Total Withdrawals', value: `₹${Number(stats?.total_withdrawals || 0).toLocaleString('en-IN')}`, icon: ArrowDownCircle, color: 'from-red-500 to-red-600' },
    { label: 'Active Investments', value: stats?.active_investments || 0, icon: ShoppingCart, color: 'from-purple-500 to-purple-600' },
    { label: 'Pending Recharges', value: stats?.pending_recharges || 0, icon: CreditCard, color: 'from-yellow-500 to-yellow-600', link: '/admin/recharges' },
    { label: 'Pending Withdrawals', value: stats?.pending_withdrawals || 0, icon: ArrowDownCircle, color: 'from-orange-500 to-orange-600', link: '/admin/withdrawals' },
    { label: 'Platform Profit', value: `₹${Number(stats?.profit || 0).toLocaleString('en-IN')}`, icon: Wallet, color: 'from-teal-500 to-teal-600' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((stat) => (
          <Link key={stat.label} to={(stat as any).link || '#'} className="admin-card p-4 transition-all hover:scale-[1.02]">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="admin-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />Deposits vs Withdrawals
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="deposits" fill="hsl(140 52% 43%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="withdrawals" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Area type="monotone" dataKey="profit" stroke="hsl(140 52% 43%)" fill="hsl(140 52% 43% / 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/recharges" className="admin-card p-5 transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold">Pending Recharges</h3>
              <p className="text-muted-foreground text-sm">{stats?.pending_recharges || 0} awaiting approval</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/withdrawals" className="admin-card p-5 transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold">Pending Withdrawals</h3>
              <p className="text-muted-foreground text-sm">{stats?.pending_withdrawals || 0} awaiting approval</p>
            </div>
          </div>
        </Link>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
