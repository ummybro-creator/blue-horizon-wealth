import { useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface WithdrawalWithUser {
  id: string; user_id: string; amount: number; status: 'pending' | 'approved' | 'rejected';
  requested_at: string; processed_at: string | null;
  profile?: { phone_number: string; full_name: string | null };
  bank_details?: { account_holder_name: string | null; bank_name: string | null; account_number: string | null; ifsc_code: string | null; upi_id: string | null };
}

const AdminWithdrawals = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
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
      const [profilesRes, bankRes] = await Promise.all([
        supabase.from('profiles').select('id, phone_number, full_name').in('id', userIds),
        supabase.from('bank_details').select('*').in('user_id', userIds),
      ]);
      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);
      const bankMap = new Map(bankRes.data?.map(b => [b.user_id, b]) || []);
      return data.map(w => ({ ...w, profile: profileMap.get(w.user_id), bank_details: bankMap.get(w.user_id) })) as WithdrawalWithUser[];
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

  const statusColors = { pending: 'bg-yellow-500/20 text-yellow-400', approved: 'bg-emerald-500/20 text-emerald-400', rejected: 'bg-red-500/20 text-red-400' };

  return (
    <div className="min-h-screen p-6" style={{ background: '#0F172A' }}>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/dashboard" className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-300 shadow-clay-dark" style={{ background: '#1E293B' }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawal Management</h1>
          <p className="text-slate-400">Approve or reject withdrawal requests</p>
        </div>
      </div>

      <div className="rounded-3xl p-1.5 mb-6 flex gap-1.5 overflow-x-auto shadow-clay-dark" style={{ background: '#1E293B' }}>
        {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
          <button key={status} onClick={() => setFilter(status)}
            className={`px-4 py-2.5 rounded-2xl font-medium transition-all whitespace-nowrap text-sm ${filter === status ? 'text-white shadow-clay-dark-sm' : 'text-slate-400'}`}
            style={filter === status ? { background: 'linear-gradient(135deg, #34A853, #2FA24F)' } : {}}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-3xl p-8 text-center text-slate-400 shadow-clay-dark" style={{ background: '#1E293B' }}>Loading...</div>
        ) : withdrawals?.length === 0 ? (
          <div className="rounded-3xl p-8 text-center text-slate-400 shadow-clay-dark" style={{ background: '#1E293B' }}>No withdrawal requests found</div>
        ) : (
          withdrawals?.map((w) => (
            <div key={w.id} className="rounded-3xl p-5 shadow-clay-dark" style={{ background: '#1E293B' }}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-clay-dark-sm" style={{ background: '#0F172A' }}>
                      {w.profile?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{w.profile?.full_name || 'User'}</p>
                      <p className="text-slate-400 text-sm">{w.profile?.phone_number}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl p-3 mt-3 shadow-clay-dark-inset" style={{ background: '#0F172A' }}>
                    <p className="text-slate-500 text-xs mb-1">Bank Details</p>
                    {w.bank_details?.upi_id ? (
                      <p className="text-white">UPI: {w.bank_details.upi_id}</p>
                    ) : w.bank_details?.account_number ? (
                      <div className="text-white text-sm">
                        <p>{w.bank_details.account_holder_name}</p>
                        <p>{w.bank_details.bank_name} - {w.bank_details.account_number}</p>
                        <p className="text-slate-400">IFSC: {w.bank_details.ifsc_code}</p>
                      </div>
                    ) : (
                      <p className="text-slate-400">No bank details</p>
                    )}
                  </div>
                </div>
                <div className="text-center lg:text-right">
                  <p className="text-3xl font-extrabold text-red-400">₹{Number(w.amount).toLocaleString('en-IN')}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${statusColors[w.status]}`}>{w.status.toUpperCase()}</span>
                  <p className="text-slate-500 text-xs mt-1">{new Date(w.requested_at).toLocaleDateString()} at {new Date(w.requested_at).toLocaleTimeString()}</p>
                </div>
                {w.status === 'pending' && (
                  <div className="flex gap-2 lg:flex-col">
                    <Button className="flex-1 rounded-xl" onClick={() => approveMutation.mutate(w.id)} disabled={approveMutation.isPending}
                      style={{ background: '#34A853' }}><Check className="w-4 h-4 mr-1" />Approve</Button>
                    <Button className="flex-1 rounded-xl" variant="destructive" onClick={() => rejectMutation.mutate(w.id)} disabled={rejectMutation.isPending}>
                      <X className="w-4 h-4 mr-1" />Reject</Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawals;
