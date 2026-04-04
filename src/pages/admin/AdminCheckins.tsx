import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarCheck } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const dayRewards = [5, 7, 9, 10, 12, 15, 20];
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AdminCheckins = () => {
  const { data: recentCheckins } = useQuery({
    queryKey: ['admin-checkins'],
    queryFn: async () => {
      const { data } = await supabase.from('daily_checkins').select('*').order('checked_in_at', { ascending: false }).limit(50);
      const userIds = [...new Set((data || []).map(c => c.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, phone_number, full_name').in('id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      return (data || []).map(c => ({ ...c, profile: profileMap.get(c.user_id) }));
    },
  });

  const { data: todayCount } = useQuery({
    queryKey: ['admin-checkins-today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase.from('daily_checkins').select('id', { count: 'exact' }).eq('checked_in_at', today);
      return count || 0;
    },
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Check-in Control</h1>
        <p className="text-muted-foreground text-sm">Monitor daily check-ins</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="admin-card p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary" />Weekly Reward Schedule
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => (
              <div key={day} className="text-center">
                <div className="w-full aspect-square rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                  <span className="text-xs font-bold text-primary">₹{dayRewards[i]}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">Weekly total: <strong className="text-primary">₹78</strong></p>
        </div>

        <div className="admin-card p-5">
          <h3 className="font-semibold text-foreground mb-3">Today's Stats</h3>
          <div className="admin-inset p-4 text-center">
            <p className="text-3xl font-extrabold text-primary">{todayCount}</p>
            <p className="text-sm text-muted-foreground">Users checked in today</p>
          </div>
        </div>
      </div>

      <div className="admin-card p-5">
        <h3 className="font-semibold text-foreground mb-3">Recent Check-ins</h3>
        <div className="space-y-2">
          {recentCheckins?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No check-ins yet</p>
          ) : recentCheckins?.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between p-3 admin-inset">
              <div>
                <p className="text-sm font-medium text-foreground">{c.profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{c.profile?.phone_number} · {c.checked_in_at}</p>
              </div>
              <span className="text-sm font-bold text-primary">+₹{c.bonus_amount}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCheckins;
