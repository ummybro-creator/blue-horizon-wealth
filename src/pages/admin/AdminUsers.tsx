import { useState } from 'react';
import { Users, Search, Ban, CheckCircle, Wallet, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UserWithWallet {
  id: string; phone_number: string; full_name: string | null; is_blocked: boolean; created_at: string;
  referral_code: string | null;
  wallet?: { total_balance: number; recharge_balance: number; bonus_balance: number; total_income: number; withdrawable_balance: number };
}

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithWallet | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const queryClient = useQueryClient();
  const { user: admin } = useAuth();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', search, statusFilter],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (search.trim()) query = query.or(`phone_number.ilike.%${search}%,referral_code.ilike.%${search}%`);
      if (statusFilter === 'active') query = query.eq('is_blocked', false);
      if (statusFilter === 'blocked') query = query.eq('is_blocked', true);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      const userIds = data.map(u => u.id);
      const { data: wallets } = await supabase.from('wallets').select('user_id, total_balance, recharge_balance, bonus_balance, total_income, withdrawable_balance').in('user_id', userIds);
      const walletMap = new Map(wallets?.map(w => [w.user_id, w]) || []);
      return data.map(u => ({ ...u, wallet: walletMap.get(u.id) || { total_balance: 0, recharge_balance: 0, bonus_balance: 0, total_income: 0, withdrawable_balance: 0 } })) as UserWithWallet[];
    },
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      const { error } = await supabase.from('profiles').update({ is_blocked: !isBlocked }).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_, { isBlocked }) => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success(isBlocked ? 'User unblocked' : 'User blocked'); },
  });

  const adjustWalletMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !adjustAmount) return;
      const { error } = await supabase.rpc('adjust_wallet', {
        p_admin_id: admin?.id!,
        p_user_id: selectedUser.id,
        p_amount: Number(adjustAmount),
        p_reason: adjustReason || 'Manual adjustment',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Wallet adjusted');
      setAdjustAmount(''); setAdjustReason(''); setSelectedUser(null);
    },
    onError: () => toast.error('Failed to adjust wallet'),
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground text-sm">Manage all registered users</p>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'blocked'] as const).map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${statusFilter === f ? 'clay-button' : 'admin-card'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by phone or referral code..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-2xl admin-inset border-none" />
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="admin-card p-8 text-center text-muted-foreground">Loading...</div>
        ) : users?.length === 0 ? (
          <div className="admin-card p-8 text-center text-muted-foreground">No users found</div>
        ) : users?.map(user => (
          <div key={user.id} className="admin-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {user.full_name?.charAt(0) || user.phone_number.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-sm">{user.full_name || 'User'}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${user.is_blocked ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      {user.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{user.phone_number} · {user.referral_code}</p>
                  <p className="text-xs text-primary font-semibold">₹{Number(user.wallet?.total_balance || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setSelectedUser(user)}>
                  <Wallet className="w-3 h-3 mr-1" />Wallet
                </Button>
                <Button size="sm" variant={user.is_blocked ? 'outline' : 'destructive'} className="h-8 text-xs"
                  onClick={() => toggleBlockMutation.mutate({ userId: user.id, isBlocked: user.is_blocked })}>
                  {user.is_blocked ? <><CheckCircle className="w-3 h-3 mr-1" />Unblock</> : <><Ban className="w-3 h-3 mr-1" />Block</>}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="clay-card-lg border-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Wallet Control — {selectedUser?.full_name || selectedUser?.phone_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Total', val: selectedUser?.wallet?.total_balance },
                { label: 'Recharge', val: selectedUser?.wallet?.recharge_balance },
                { label: 'Bonus', val: selectedUser?.wallet?.bonus_balance },
                { label: 'Withdrawable', val: selectedUser?.wallet?.withdrawable_balance },
              ].map(w => (
                <div key={w.label} className="admin-inset p-3">
                  <p className="text-[10px] text-muted-foreground">{w.label}</p>
                  <p className="font-bold text-sm text-primary">₹{Number(w.val || 0).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Amount (+₹ or -₹)</label>
              <Input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="e.g. 500 or -200" className="h-11 rounded-2xl admin-inset border-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Reason</label>
              <Input value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="Bonus / Penalty / Correction" className="h-11 rounded-2xl admin-inset border-none" />
            </div>
            <Button onClick={() => adjustWalletMutation.mutate()} disabled={adjustWalletMutation.isPending || !adjustAmount} className="w-full clay-button h-11">
              Adjust Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
