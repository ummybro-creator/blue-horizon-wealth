import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarCheck, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const defaultRewards = [5, 7, 9, 10, 12, 15, 20];

const AdminCheckins = () => {
  const queryClient = useQueryClient();
  const [rewards, setRewards] = useState(defaultRewards.map(String));
  const [checkinEnabled, setCheckinEnabled] = useState(true);

  const { data: settings } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => { const { data } = await supabase.from('app_settings').select('*').limit(1).single(); return data; },
  });

  useEffect(() => {
    if (settings) {
      setCheckinEnabled(Number(settings.checkin_bonus_amount) > 0);
    }
  }, [settings]);

  const weeklyTotal = rewards.reduce((s, r) => s + Number(r || 0), 0);

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

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('app_settings').update({
        checkin_bonus_amount: checkinEnabled ? Number(rewards[0]) : 0,
      }).eq('id', settings?.id || '');
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['app-settings'] }); toast.success('Check-in settings saved'); },
    onError: () => toast.error('Failed to save'),
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Check-in Control</h1>
        <p className="text-muted-foreground text-sm">Configure daily check-in rewards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="admin-card p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary" />Weekly Reward Schedule
          </h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-foreground">Check-in System</span>
            <Switch checked={checkinEnabled} onCheckedChange={setCheckinEnabled} />
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, i) => (
              <div key={day} className="text-center">
                <span className="text-[10px] text-muted-foreground block mb-1">{day}</span>
                <Input
                  type="number"
                  value={rewards[i]}
                  onChange={e => {
                    const newRewards = [...rewards];
                    newRewards[i] = e.target.value;
                    setRewards(newRewards);
                  }}
                  className="h-10 text-center text-xs rounded-xl admin-inset border-none p-1"
                  disabled={!checkinEnabled}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mb-4">
            Weekly total: <strong className="text-primary">₹{weeklyTotal}</strong>
          </p>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full clay-button h-11">
            <Save className="w-4 h-4 mr-2" />Save Check-in Settings
          </Button>
        </div>

        <div className="admin-card p-5">
          <h3 className="font-semibold text-foreground mb-3">Today's Stats</h3>
          <div className="admin-inset p-4 text-center mb-4">
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
