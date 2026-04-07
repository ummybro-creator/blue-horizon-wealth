import { useState } from 'react';
import { Check, X, Wallet, BarChart3, ShoppingBag } from 'lucide-react';
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
  wallet?: { total_balance: number; recharge_balance: number; withdrawable_balance: number; bonus_balance: number; total_income: number };
  teamStats?: { level1: number; level2: number; level3: number; totalDeposits: number };
  plans?: { name: string; invested_amount: number; daily_income: number; expires_at: string; status: string }[];
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
      if (userIds.length === 0) return [];

      const [profilesRes, bankRes, referralsRes, depositsRes, walletRes, investmentsRes] = await Promise.all([
        supabase.from('profiles').select('id, phone_number, full_name, referral_code').in('id', userIds),
        supabase.from('bank_details').select('*').in('user_id', userIds),
        supabase.from('referrals').select('referrer_id, level').in('referrer_id', userIds),
        supabase.from('recharges').select('user_id, amount').eq('status', 'approved').in('user_id', userIds),
        supabase.from('wallets').select('*').in('user_id', userIds),
        supabase.from('investments')
          .select('user_id, invested_amount, total_earned, expires_at, status, products(name, daily_income)')
          .in('user_id', userIds)
          .eq('status', 'active'),
      ]);

      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);
      const bankMap = new Map(bankRes.data?.map(b => [b.user_id, b]) || []);
      const walletMap = new Map(walletRes.data?.map(w => [w.user_id, w]) || []);

      // Team stats
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

      // Plans per user
      const plansMap = new Map<string, any[]>();
      (investmentsRes.data || []).forEach((inv: any) => {
        const list = plansMap.get(inv.user_id) || [];
        list.push(inv);
        plansMap.set(inv.user_id, list);
      });

      return data.map(w => ({
        ...w,
        profile: profileMap.get(w.user_id),
        bank_details: bankMap.get(w.user_id),
        wallet: walletMap.get(w.user_id),
        teamStats: {
          ...(teamMap.get(w.user_id) || { level1: 0, level2: 0, level3: 0 }),
          totalDeposits: depositMap.get(w.user_id) || 0,
        },
        plans: (plansMap.get(w.user_id) || []).map((inv: any) => ({
          name: inv.products?.name || 'Unknown Plan',
          invested_amount: inv.invested_amount,
          daily_income: inv.products?.daily_income || 0,
          expires_at: inv.expires_at,
          status: inv.status,
        })),
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
              {/* Top row: user info + amount + actions */}
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* User identity */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary font-bold bg-primary/10 shadow-clay-sm text-sm">
                      {w.profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-foreground font-bold text-sm">{w.profile?.full_name || 'User'}</p>
                      <p className="text-muted-foreground text-xs">{w.profile?.phone_number}</p>
                      {w.profile?.referral_code && (
                        <p className="text-xs text-primary font-medium">Ref: {w.profile.referral_code}</p>
                      )}
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="clay-inset p-3 mb-3 rounded-xl">
                    <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide mb-1.5">Bank Details</p>
                    {w.bank_details?.upi_id ? (
                      <p className="text-foreground text-sm font-medium">UPI: <span className="text-primary">{w.bank_details.upi_id}</span></p>
                    ) : w.bank_details?.account_number ? (
                      <div className="text-sm space-y-0.5">
                        <p className="font-medium text-foreground">{w.bank_details.account_holder_name}</p>
                        <p className="text-foreground">{w.bank_details.bank_name} — {w.bank_details.account_number}</p>
                        <p className="text-muted-foreground">IFSC: {w.bank_details.ifsc_code}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No bank details added</p>
                    )}
                  </div>

                  {/* Wallet & Balance — always visible */}
                  {w.wallet && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Wallet className="w-3.5 h-3.5 text-primary" />
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Wallet & Balance</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="clay-inset p-2.5 rounded-xl">
                          <p className="text-[10px] text-muted-foreground">Total Balance</p>
                          <p className="text-sm font-extrabold text-foreground">₹{Number(w.wallet.total_balance).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="clay-inset p-2.5 rounded-xl">
                          <p className="text-[10px] text-muted-foreground">Withdrawable</p>
                          <p className="text-sm font-extrabold text-primary">₹{Number(w.wallet.withdrawable_balance).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="clay-inset p-2.5 rounded-xl">
                          <p className="text-[10px] text-muted-foreground">Recharge Bal.</p>
                          <p className="text-sm font-extrabold text-foreground">₹{Number(w.wallet.recharge_balance).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="clay-inset p-2.5 rounded-xl">
                          <p className="text-[10px] text-muted-foreground">Total Income</p>
                          <p className="text-sm font-extrabold text-foreground">₹{Number(w.wallet.total_income).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="clay-inset p-2.5 rounded-xl col-span-2">
                          <p className="text-[10px] text-muted-foreground">Bonus / Welfare Balance</p>
                          <p className="text-sm font-extrabold text-foreground">₹{Number(w.wallet.bonus_balance).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Team Stats */}
                  {w.teamStats && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <BarChart3 className="w-3.5 h-3.5 text-primary" />
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Team & Earnings</p>
                      </div>
                      <div className="clay-inset p-3 rounded-xl grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div><span className="text-muted-foreground">L1 Team:</span> <strong className="text-foreground">{w.teamStats.level1}</strong></div>
                        <div><span className="text-muted-foreground">L2 Team:</span> <strong className="text-foreground">{w.teamStats.level2}</strong></div>
                        <div><span className="text-muted-foreground">L3 Team:</span> <strong className="text-foreground">{w.teamStats.level3}</strong></div>
                        <div><span className="text-muted-foreground">Total Team:</span> <strong className="text-foreground">{w.teamStats.level1 + w.teamStats.level2 + w.teamStats.level3}</strong></div>
                        <div className="col-span-2"><span className="text-muted-foreground">Total Deposits:</span> <strong className="text-primary">₹{w.teamStats.totalDeposits.toLocaleString('en-IN')}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Active Plans */}
                  {w.plans && w.plans.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Active Plans ({w.plans.length})</p>
                      </div>
                      <div className="space-y-1.5">
                        {w.plans.map((plan, i) => (
                          <div key={i} className="clay-inset p-2.5 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-foreground">{plan.name}</p>
                              <p className="text-muted-foreground">Invested: ₹{Number(plan.invested_amount).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">+₹{plan.daily_income}/day</p>
                              <p className="text-muted-foreground">Exp: {new Date(plan.expires_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {w.plans && w.plans.length === 0 && (
                    <div className="clay-inset p-2.5 rounded-xl">
                      <p className="text-xs text-muted-foreground text-center">No active plans</p>
                    </div>
                  )}
                </div>

                {/* Right: Amount + Status + Actions */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 lg:min-w-[130px]">
                  <div className="text-center lg:text-right">
                    <p className="text-3xl font-extrabold text-destructive">₹{Number(w.amount).toLocaleString('en-IN')}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${statusColors[w.status]}`}>{w.status.toUpperCase()}</span>
                    <p className="text-muted-foreground text-[10px] mt-1">{new Date(w.requested_at).toLocaleDateString()} {new Date(w.requested_at).toLocaleTimeString()}</p>
                  </div>
                  {w.status === 'pending' && (
                    <div className="flex gap-2 lg:flex-col w-full lg:w-auto">
                      <Button className="flex-1 rounded-xl clay-button" onClick={() => approveMutation.mutate(w.id)} disabled={approveMutation.isPending}>
                        <Check className="w-4 h-4 mr-1" />Approve
                      </Button>
                      <Button className="flex-1 rounded-xl" variant="destructive" onClick={() => rejectMutation.mutate(w.id)} disabled={rejectMutation.isPending}>
                        <X className="w-4 h-4 mr-1" />Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
