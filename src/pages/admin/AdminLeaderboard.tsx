import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trophy } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminLeaderboard = () => {
  const { data: leaders } = useQuery({
    queryKey: ['admin-leaderboard'],
    queryFn: async () => {
      const { data: referrals } = await supabase.from('referrals').select('referrer_id').eq('level', 1);
      const counts = new Map<string, number>();
      (referrals || []).forEach(r => counts.set(r.referrer_id, (counts.get(r.referrer_id) || 0) + 1));
      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
      const ids = sorted.map(s => s[0]);
      if (!ids.length) return [];
      const { data: profiles } = await supabase.from('profiles').select('id, phone_number, full_name').in('id', ids);
      const { data: wallets } = await supabase.from('wallets').select('user_id, total_income').in('user_id', ids);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const walletMap = new Map(wallets?.map(w => [w.user_id, w]) || []);
      return sorted.map(([id, count], i) => ({
        rank: i + 1,
        ...profileMap.get(id),
        referrals: count,
        earnings: walletMap.get(id)?.total_income || 0,
      }));
    },
  });

  const rewardTiers = [
    { rank: 'Top 1', reward: '₹5,000' },
    { rank: 'Top 2', reward: '₹3,000' },
    { rank: 'Top 3', reward: '₹2,000' },
    { rank: 'Top 4-10', reward: '₹500' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Leaderboard Control</h1>
        <p className="text-muted-foreground text-sm">Manage leaderboard & rewards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {rewardTiers.map(t => (
          <div key={t.rank} className="admin-card p-4 text-center">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">{t.rank}</p>
            <p className="text-lg font-extrabold text-primary">{t.reward}</p>
          </div>
        ))}
      </div>

      <div className="admin-card p-5">
        <h3 className="font-semibold text-foreground mb-4">Current Leaderboard</h3>
        <div className="space-y-2">
          {leaders?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
          ) : leaders?.map((l: any) => (
            <div key={l.rank} className="flex items-center justify-between p-3 admin-inset">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  l.rank <= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>{l.rank}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{l.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{l.phone_number}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{l.referrals} referrals</p>
                <p className="text-xs text-muted-foreground">₹{Number(l.earnings).toLocaleString('en-IN')} earned</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLeaderboard;
