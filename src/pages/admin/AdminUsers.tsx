import { useState } from 'react';
import { 
  Users, 
  Search, 
  ArrowLeft,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserWithWallet {
  id: string;
  phone_number: string;
  full_name: string | null;
  is_blocked: boolean;
  created_at: string;
  wallet?: {
    total_balance: number;
  };
}

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (search.trim()) {
        query = query.ilike('phone_number', `%${search}%`);
      }
      
      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      
      // Fetch wallets separately
      const userIds = data.map(u => u.id);
      const { data: wallets } = await supabase
        .from('wallets')
        .select('user_id, total_balance')
        .in('user_id', userIds);
      
      const walletMap = new Map(wallets?.map(w => [w.user_id, w]) || []);
      
      return data.map(u => ({
        ...u,
        wallet: walletMap.get(u.id) || { total_balance: 0 }
      })) as UserWithWallet[];
    },
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !isBlocked })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, { isBlocked }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(isBlocked ? 'User unblocked' : 'User blocked');
    },
    onError: () => {
      toast.error('Failed to update user status');
    },
  });

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
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400">Manage all registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-slate-700/50 border-slate-600 text-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left p-4 text-slate-300 font-medium">User</th>
                <th className="text-left p-4 text-slate-300 font-medium">Phone</th>
                <th className="text-left p-4 text-slate-300 font-medium">Balance</th>
                <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                <th className="text-left p-4 text-slate-300 font-medium">Joined</th>
                <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium">
                          {user.full_name?.charAt(0) || user.phone_number.charAt(0)}
                        </div>
                        <span className="text-white">{user.full_name || 'User'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{user.phone_number}</td>
                    <td className="p-4 text-green-400 font-medium">
                      ₹{Number(user.wallet?.total_balance || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_blocked 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {user.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant={user.is_blocked ? 'outline' : 'destructive'}
                        onClick={() => toggleBlockMutation.mutate({ userId: user.id, isBlocked: user.is_blocked })}
                        disabled={toggleBlockMutation.isPending}
                        className={user.is_blocked ? 'border-green-500 text-green-400 hover:bg-green-500/20' : ''}
                      >
                        {user.is_blocked ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Block
                          </>
                        )}
                      </Button>
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

export default AdminUsers;
