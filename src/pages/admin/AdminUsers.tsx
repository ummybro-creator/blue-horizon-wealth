import { useState } from 'react';
import { Users, Search, ArrowLeft, Ban, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserWithWallet {
  id: string; phone_number: string; full_name: string | null; is_blocked: boolean; created_at: string;
  wallet?: { total_balance: number };
}

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (search.trim()) query = query.ilike('phone_number', `%${search}%`);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      const userIds = data.map(u => u.id);
      const { data: wallets } = await supabase.from('wallets').select('user_id, total_balance').in('user_id', userIds);
      const walletMap = new Map(wallets?.map(w => [w.user_id, w]) || []);
      return data.map(u => ({ ...u, wallet: walletMap.get(u.id) || { total_balance: 0 } })) as UserWithWallet[];
    },
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      const { error } = await supabase.from('profiles').update({ is_blocked: !isBlocked }).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_, { isBlocked }) => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success(isBlocked ? 'User unblocked' : 'User blocked'); },
    onError: () => { toast.error('Failed to update user status'); },
  });

  return (
    <div className="admin-bg p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/dashboard" className="w-10 h-10 rounded-2xl flex items-center justify-center text-muted-foreground clay-card">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage all registered users</p>
        </div>
      </div>

      <div className="clay-card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input type="text" placeholder="Search by phone number..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 rounded-2xl clay-inset border-none" />
        </div>
      </div>

      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Phone</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Balance</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Joined</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading users...</td></tr>
              ) : users?.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No users found</td></tr>
              ) : (
                users?.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary font-medium bg-primary/10 shadow-clay-sm">
                          {user.full_name?.charAt(0) || user.phone_number.charAt(0)}
                        </div>
                        <span className="text-foreground">{user.full_name || 'User'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{user.phone_number}</td>
                    <td className="p-4 font-medium text-primary">₹{Number(user.wallet?.total_balance || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_blocked ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                        {user.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Button size="sm" variant={user.is_blocked ? 'outline' : 'destructive'}
                        onClick={() => toggleBlockMutation.mutate({ userId: user.id, isBlocked: user.is_blocked })}
                        disabled={toggleBlockMutation.isPending}
                        className={user.is_blocked ? 'border-primary text-primary hover:bg-primary/10' : ''}>
                        {user.is_blocked ? <><CheckCircle className="w-4 h-4 mr-1" />Unblock</> : <><Ban className="w-4 h-4 mr-1" />Block</>}
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
