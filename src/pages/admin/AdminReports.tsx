import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminReports = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-report-stats'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_dashboard_stats');
      return data as any;
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ['admin-revenue-chart'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_revenue_chart', { p_days: 30 });
      return (data || []).map((d: any) => ({
        date: new Date(d.log_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        deposits: Number(d.recharge_amount),
        withdrawals: Number(d.withdraw_amount),
        profit: Number(d.profit_amount),
      }));
    },
  });

  const cards = [
    { label: 'Total Deposits', value: `₹${Number(stats?.total_deposits || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-primary' },
    { label: 'Total Withdrawals', value: `₹${Number(stats?.total_withdrawals || 0).toLocaleString('en-IN')}`, icon: TrendingDown, color: 'text-destructive' },
    { label: 'Total Commissions', value: `₹${Number(stats?.total_commission_given || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-blue-600' },
    { label: 'Platform Profit', value: `₹${Number(stats?.profit || 0).toLocaleString('en-IN')}`, icon: BarChart3, color: 'text-primary' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Financial Reports</h1>
        <p className="text-muted-foreground text-sm">Revenue analytics & profit tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map(c => (
          <div key={c.label} className="admin-card p-4">
            <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
            <p className="text-lg font-extrabold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="admin-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Deposits vs Withdrawals (30 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
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
          <h3 className="font-semibold text-foreground mb-4">Profit Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="profit" stroke="hsl(140 52% 43%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
