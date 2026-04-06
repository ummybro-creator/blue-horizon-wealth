import { useState } from 'react';
import { Check, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface WithdrawalWithUser {
  id: string; user_id: string; amount: number; status: 'pending' | 'approved' | 'rejected';
  requested_at: string; processed_at: string | null;
  profile?: { phone_number: string; full_name: string | null; referral_code: string | null };
  bank_details?: { account_holder_name: string | null; bank_name: string | null; account_number: string | null; ifsc_code: string | null; upi_id: string | null };
  teamStats?: { level1: number; level2: number; level3: number; totalDeposits: number };
}

const AdminWithdrawals = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['admin-withdrawals', filter],
    queryFn: async () => {
      let query = supabase.from('withdrawals').select('*').order('requested_at', { ascending: false });
      if (filter !== 'all') query = query.eq('status', filter);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      const userIds = [...new Set(data.map(w => w.user_id))];
      const [profilesRes, bankRes, referralsRes, depositsRes] = await Promise.all([
        supabase.from('profiles').select('id, phone_number, full_name, referral_code').in('id', userIds),
        supabase.from('bank_details').select('*').in('user_id', userIds),
        supabase.from('referrals').select('referrer_id, level').in('referrer_id', userIds),
        supabase.from('recharges').select('user_id, amount').eq('status', 'approved').in('user_id', userIds),
      ]);
      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);
      const bankMap = new Map(bankRes.data?.map(b => [b.user_id, b]) || []);

      // Build team stats per user
      const teamMap = new Map<string, { level1: number; level2: number; level3: number }>();
      (referralsRes.data || []).forEach(r => {
        const stats = teamMap.get(r.referrer_id) || { level1: 0, level2: 0, level3: 0 };
        if (r.level === 1) stats.level1++;
        else if (r.level === 2) stats.level2++;
        else if (r.level === 3) stats.level3++;
        teamMap.set(r.referrer_id, stats);
      });

      const depositMap = new Map<string, number>();
      (depositsRes.data || []).forEach(d => {
        depositMap.set(d.user_id, (depositMap.get(d.user_id) || 0) + d.amount);
      });

      return data.map(w => ({
        ...w,
        profile: profileMap.get(w.user_id),
        bank_details: bankMap.get(w.user_id),
        teamStats: {
          ...(teamMap.get(w.user_id) || { level1: 0, level2: 0, level3: 0 }),
          totalDeposits: depositMap.get(w.user_id) || 0,
        },
      })) as WithdrawalWithUser[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.rpc('approve_withdrawal', { p_withdrawal_id: id, p_admin_id: user?.id }); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success('Withdrawal approved'); },
    onError: (error: any) => { toast.error(error.message || 'Failed to approve'); },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.rpc('reject_withdrawal', { p_withdrawal_id: id, p_admin_id: user?.id }); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] }); toast.success('Withdrawal rejected'); },
    onError: () => { toast.error('Failed to reject'); },
  });

  const statusColors = { pending: 'bg-yellow-500/10 text-yellow-600', approved: 'bg-primary/10 text-primary', rejected: 'bg-destructive/10 text-destructive' };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Withdrawal Management</h1>
        <p className="text-muted-foreground text-sm">Approve or reject withdrawal requests</p>
      </div>

      <div className="clay-card p-1.5 mb-6 flex gap-1.5 overflow-x-auto">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
          <button key={status} onClick={() => setFilter(status)}
            className={`px-4 py-2.5 rounded-2xl font-medium transition-all whitespace-nowrap text-sm ${filter === status ? 'clay-button' : 'text-muted-foreground'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="clay-card p-8 text-center text-muted-foreground">Loading...</div>
        ) : withdrawals?.length === 0 ? (
          <div className="clay-card p-8 text-center text-muted-foreground">No withdrawal requests found</div>
        ) : (
          withdrawals?.map((w) => (
            <div key={w.id} className="clay-card p-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary font-medium bg-primary/10 shadow-clay-sm">
                      {w.profile?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{w.profile?.full_name || 'User'}</p>
                      <p className="text-muted-foreground text-sm">{w.profile?.phone_number}</p>
                    </div>
                  </div>
                  <div className="clay-inset p-3 mt-3">
                    <p className="text-muted-foreground text-xs mb-1">Bank Details</p>
                    {w.bank_details?.upi_id ? (
                      <p className="text-foreground">UPI: {w.bank_details.upi_id}</p>
                    ) : w.bank_details?.account_number ? (
                      <div className="text-foreground text-sm">
                        <p>{w.bank_details.account_holder_name}</p>
                        <p>{w.bank_details.bank_name} - {w.bank_details.account_number}</p>
                        <p className="text-muted-foreground">IFSC: {w.bank_details.ifsc_code}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No bank details</p>
                    )}
                  </div>

                  {/* Team Details Toggle */}
                  <button
                    onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
                    className="flex items-center gap-1.5 mt-2 text-xs text-primary font-semibold"
                  >
                    <Users className="w-3.5 h-3.5" />
                    {expandedId === w.id ? 'Hide' : 'View'} Team Details
                  </button>

                  {expandedId === w.id && w.teamStats && (
                    <div className="clay-inset p-3 mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Level 1:</span> <strong className="text-foreground">{w.teamStats.level1}</strong></div>
                      <div><span className="text-muted-foreground">Level 2:</span> <strong className="text-foreground">{w.teamStats.level2}</strong></div>
                      <div><span className="text-muted-foreground">Level 3:</span> <strong className="text-foreground">{w.teamStats.level3}</strong></div>
                      <div><span className="text-muted-foreground">Total Deposits:</span> <strong className="text-primary">₹{w.teamStats.totalDeposits.toLocaleString('en-IN')}</strong></div>
                      <div><span className="text-muted-foreground">Referral Code:</span> <strong className="text-foreground">{w.profile?.referral_code || '-'}</strong></div>
                      <div><span className="text-muted-foreground">Total Team:</span> <strong className="text-foreground">{w.teamStats.level1 + w.teamStats.level2 + w.teamStats.level3}</strong></div>
                    </div>
                  )}
                </div>
                <div className="text-center lg:text-right">
                  <p className="text-3xl font-extrabold text-destructive">₹{Number(w.amount).toLocaleString('en-IN')}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${statusColors[w.status]}`}>{w.status.toUpperCase()}</span>
                  <p className="text-muted-foreground text-xs mt-1">{new Date(w.requested_at).toLocaleDateString()} at {new Date(w.requested_at).toLocaleTimeString()}</p>
                </div>
                {w.status === 'pending' && (
                  <div className="flex gap-2 lg:flex-col">
                    <Button className="flex-1 rounded-xl clay-button" onClick={() => approveMutation.mutate(w.id)} disabled={approveMutation.isPending}>
                      <Check className="w-4 h-4 mr-1" />Approve</Button>
                    <Button className="flex-1 rounded-xl" variant="destructive" onClick={() => rejectMutation.mutate(w.id)} disabled={rejectMutation.isPending}>
                      <X className="w-4 h-4 mr-1" />Reject</Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
