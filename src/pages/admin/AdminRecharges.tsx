import { useState } from 'react';
import { 
  CreditCard, 
  ArrowLeft,
  Check,
  X,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface RechargeWithUser {
  id: string;
  user_id: string;
  amount: number;
  utr_number: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at: string | null;
  profile?: {
    phone_number: string;
    full_name: string | null;
  };
}

const AdminRecharges = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: recharges, isLoading } = useQuery({
    queryKey: ['admin-recharges', filter],
    queryFn: async () => {
      let query = supabase
        .from('recharges')
        .select('*')
        .order('requested_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, phone_number, full_name')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(r => ({
        ...r,
        profile: profileMap.get(r.user_id)
      })) as RechargeWithUser[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (rechargeId: string) => {
      const { error } = await supabase.rpc('approve_recharge', {
        p_recharge_id: rechargeId,
        p_admin_id: user?.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recharges'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Recharge approved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve recharge');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (rechargeId: string) => {
      const { error } = await supabase.rpc('reject_recharge', {
        p_recharge_id: rechargeId,
        p_admin_id: user?.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recharges'] });
      toast.success('Recharge rejected');
    },
    onError: () => {
      toast.error('Failed to reject recharge');
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
          <h1 className="text-2xl font-bold text-white">Recharge Management</h1>
          <p className="text-slate-400">Approve or reject recharge requests</p>
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

      {/* Recharges Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left p-4 text-slate-300 font-medium">User</th>
                <th className="text-left p-4 text-slate-300 font-medium">Amount</th>
                <th className="text-left p-4 text-slate-300 font-medium">UTR Number</th>
                <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                <th className="text-left p-4 text-slate-300 font-medium">Date</th>
                <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      Loading recharges...
                    </div>
                  </td>
                </tr>
              ) : recharges?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No recharge requests found
                  </td>
                </tr>
              ) : (
                recharges?.map((recharge) => (
                  <tr key={recharge.id} className="hover:bg-slate-700/30">
                    <td className="p-4">
                      <div>
                        <p className="text-white">{recharge.profile?.full_name || 'User'}</p>
                        <p className="text-slate-400 text-sm">{recharge.profile?.phone_number}</p>
                      </div>
                    </td>
                    <td className="p-4 text-green-400 font-bold text-lg">
                      ₹{Number(recharge.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-slate-300 font-mono">
                      {recharge.utr_number || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[recharge.status]}`}>
                        {recharge.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(recharge.requested_at).toLocaleDateString()}
                      <br />
                      {new Date(recharge.requested_at).toLocaleTimeString()}
                    </td>
                    <td className="p-4">
                      {recharge.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate(recharge.id)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectMutation.mutate(recharge.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">
                          {recharge.processed_at && new Date(recharge.processed_at).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRecharges;
