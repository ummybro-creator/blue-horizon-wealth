import { useState } from 'react';
import { 
  ArrowDownCircle, 
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface WithdrawalWithUser {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at: string | null;
  profile?: {
    phone_number: string;
    full_name: string | null;
  };
  bank_details?: {
    account_holder_name: string | null;
    bank_name: string | null;
    account_number: string | null;
    ifsc_code: string | null;
    upi_id: string | null;
  };
}

const AdminWithdrawals = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['admin-withdrawals', filter],
    queryFn: async () => {
      let query = supabase
        .from('withdrawals')
        .select('*')
        .order('requested_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      
      // Fetch profiles and bank details separately
      const userIds = [...new Set(data.map(w => w.user_id))];
      const [profilesRes, bankRes] = await Promise.all([
        supabase.from('profiles').select('id, phone_number, full_name').in('id', userIds),
        supabase.from('bank_details').select('*').in('user_id', userIds),
      ]);
      
      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);
      const bankMap = new Map(bankRes.data?.map(b => [b.user_id, b]) || []);
      
      return data.map(w => ({
        ...w,
        profile: profileMap.get(w.user_id),
        bank_details: bankMap.get(w.user_id)
      })) as WithdrawalWithUser[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (withdrawalId: string) => {
      const { error } = await supabase.rpc('approve_withdrawal', {
        p_withdrawal_id: withdrawalId,
        p_admin_id: user?.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Withdrawal approved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve withdrawal');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (withdrawalId: string) => {
      const { error } = await supabase.rpc('reject_withdrawal', {
        p_withdrawal_id: withdrawalId,
        p_admin_id: user?.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      toast.success('Withdrawal rejected');
    },
    onError: () => {
      toast.error('Failed to reject withdrawal');
    },
  });

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          to="/admin/dashboard"
          className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawal Management</h1>
          <p className="text-slate-400">Approve or reject withdrawal requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-2 mb-6 flex gap-2 overflow-x-auto">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === status 
                ? 'bg-orange-500 text-white' 
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Withdrawals List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center text-slate-400">
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              Loading withdrawals...
            </div>
          </div>
        ) : withdrawals?.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center text-slate-400">
            No withdrawal requests found
          </div>
        ) : (
          withdrawals?.map((withdrawal) => (
            <div key={withdrawal.id} className="bg-slate-800 rounded-xl p-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white">
                      {withdrawal.profile?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{withdrawal.profile?.full_name || 'User'}</p>
                      <p className="text-slate-400 text-sm">{withdrawal.profile?.phone_number}</p>
                    </div>
                  </div>
                  
                  {/* Bank Details */}
                  <div className="bg-slate-700/50 rounded-lg p-3 mt-3">
                    <p className="text-slate-400 text-xs mb-1">Bank Details</p>
                    {withdrawal.bank_details?.upi_id ? (
                      <p className="text-white">UPI: {withdrawal.bank_details.upi_id}</p>
                    ) : withdrawal.bank_details?.account_number ? (
                      <div className="text-white text-sm">
                        <p>{withdrawal.bank_details.account_holder_name}</p>
                        <p>{withdrawal.bank_details.bank_name} - {withdrawal.bank_details.account_number}</p>
                        <p className="text-slate-400">IFSC: {withdrawal.bank_details.ifsc_code}</p>
                      </div>
                    ) : (
                      <p className="text-slate-400">No bank details provided</p>
                    )}
                  </div>
                </div>

                {/* Amount & Status */}
                <div className="text-center lg:text-right">
                  <p className="text-3xl font-bold text-red-400">
                    ₹{Number(withdrawal.amount).toLocaleString('en-IN')}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${statusColors[withdrawal.status]}`}>
                    {withdrawal.status.toUpperCase()}
                  </span>
                  <p className="text-slate-500 text-xs mt-1">
                    {new Date(withdrawal.requested_at).toLocaleDateString()} at {new Date(withdrawal.requested_at).toLocaleTimeString()}
                  </p>
                </div>

                {/* Actions */}
                {withdrawal.status === 'pending' && (
                  <div className="flex gap-2 lg:flex-col">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => approveMutation.mutate(withdrawal.id)}
                      disabled={approveMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(withdrawal.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
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
