import { useState } from 'react';
import { ShoppingCart, Search, Pause, Play, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminOrders = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'cancelled'>('all');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', search, filter],
    queryFn: async () => {
      let query = supabase.from('investments').select('*, products(name, price, daily_income, duration_days)').order('invested_at', { ascending: false });
      if (filter !== 'all') query = query.eq('status', filter);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      const userIds = [...new Set((data || []).map(o => o.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, phone_number, full_name').in('id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      return (data || []).map(o => ({ ...o, profile: profileMap.get(o.user_id) }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('investments').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order updated'); },
    onError: () => toast.error('Failed to update order'),
  });

  const tabs = ['all', 'active', 'expired', 'cancelled'] as const;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
        <p className="text-muted-foreground text-sm">Manage all investments & purchases</p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === t ? 'clay-button' : 'admin-card'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11 rounded-2xl admin-inset border-none" />
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="admin-card p-8 text-center text-muted-foreground">Loading...</div>
        ) : orders?.length === 0 ? (
          <div className="admin-card p-8 text-center text-muted-foreground">No orders found</div>
        ) : orders?.map(order => (
          <div key={order.id} className="admin-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground text-sm">{(order as any).products?.name || 'Product'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    order.status === 'active' ? 'bg-primary/10 text-primary' : order.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                  }`}>{order.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">{(order as any).profile?.phone_number || 'Unknown'} · {(order as any).profile?.full_name || 'User'}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="text-foreground">Invested: <strong className="text-primary">₹{Number(order.invested_amount).toLocaleString('en-IN')}</strong></span>
                  <span className="text-foreground">Earned: <strong className="text-primary">₹{Number(order.total_earned || 0).toLocaleString('en-IN')}</strong></span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(order.invested_at || '').toLocaleDateString()} → {new Date(order.expires_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {order.status === 'active' && (
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}>
                    <XCircle className="w-3 h-3 mr-1" />Cancel
                  </Button>
                )}
                {order.status === 'cancelled' && (
                  <Button size="sm" variant="outline" className="h-8 text-xs border-primary text-primary" onClick={() => updateStatus.mutate({ id: order.id, status: 'active' })}>
                    <Play className="w-3 h-3 mr-1" />Restart
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
