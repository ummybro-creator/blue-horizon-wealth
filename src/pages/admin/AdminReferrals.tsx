import { useState } from 'react';
import { GitBranch, Save, Gift, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminReferrals = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data } = await supabase.from('app_settings').select('*').limit(1).single();
      return data;
    },
  });

  const [l1, setL1] = useState('');
  const [l2, setL2] = useState('');
  const [l3, setL3] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [bonusEnabled, setBonusEnabled] = useState(true);
  const [bonus1, setBonus1] = useState('20');
  const [bonus2, setBonus2] = useState('30');
  const [bonus3, setBonus3] = useState('50');
  const [bonus4, setBonus4] = useState('100');
  const [bonus5, setBonus5] = useState('150');

  const initialized = settings && l1 === '';
  if (initialized) {
    setTimeout(() => {
      setL1(String(settings.level1_commission || 13));
      setL2(String(settings.level2_commission || 5));
      setL3(String(settings.level3_commission || 2));
      setEnabled(settings.referral_enabled ?? true);
      setBonusEnabled((settings as any).referral_deposit_bonus_enabled ?? true);
    }, 0);
  }

  const { data: topReferrers } = useQuery({
    queryKey: ['admin-top-referrers'],
    queryFn: async () => {
      const { data } = await supabase.from('referrals').select('referrer_id').eq('level', 1);
      const counts = new Map<string, number>();
      (data || []).forEach(r => counts.set(r.referrer_id, (counts.get(r.referrer_id) || 0) + 1));
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
      const ids = top.map(t => t[0]);
      if (!ids.length) return [];
      const { data: profiles } = await supabase.from('profiles').select('id, phone_number, full_name').in('id', ids);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      return top.map(([id, count]) => ({ ...profileMap.get(id), count }));
    },
  });

  const { data: bonusStats } = useQuery({
    queryKey: ['admin-referral-bonus-stats'],
    queryFn: async () => {
      const { data } = await supabase.from('referral_deposit_bonuses').select('*').order('created_at', { ascending: false }).limit(20);
      if (!data?.length) return [];
      const userIds = [...new Set(data.flatMap(b => [b.referrer_id, b.referred_id]))];
      const { data: profiles } = await supabase.from('profiles').select('id, phone_number, full_name').in('id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      return data.map(b => ({
        ...b,
        referrer: profileMap.get(b.referrer_id),
        referred: profileMap.get(b.referred_id),
      }));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('app_settings').update({
        level1_commission: Number(l1),
        level2_commission: Number(l2),
        level3_commission: Number(l3),
        referral_enabled: enabled,
        referral_deposit_bonus_enabled: bonusEnabled,
      } as any).eq('id', settings?.id || '');
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['app-settings'] }); toast.success('Referral settings saved'); },
    onError: () => toast.error('Failed to save'),
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Referral System</h1>
        <p className="text-muted-foreground text-sm">Configure referral commissions & bonuses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Commission Rates */}
        <div className="admin-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><GitBranch className="w-4 h-4 text-primary" />Commission Rates</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Referral System</span>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
            {[{ label: 'Level 1 (%)', val: l1, set: setL1 }, { label: 'Level 2 (%)', val: l2, set: setL2 }, { label: 'Level 3 (%)', val: l3, set: setL3 }].map(item => (
              <div key={item.label}>
                <label className="text-xs text-muted-foreground mb-1 block">{item.label}</label>
                <Input type="number" value={item.val} onChange={e => item.set(e.target.value)} className="h-11 rounded-2xl admin-inset border-none" />
              </div>
            ))}
          </div>
        </div>

        {/* ₹350 Bonus System */}
        <div className="admin-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Gift className="w-4 h-4 text-primary" />₹350 Deposit Bonus</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Enable ₹350 Bonus</span>
              <Switch checked={bonusEnabled} onCheckedChange={setBonusEnabled} />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: '1st', val: bonus1, set: setBonus1 },
                { label: '2nd', val: bonus2, set: setBonus2 },
                { label: '3rd', val: bonus3, set: setBonus3 },
                { label: '4th', val: bonus4, set: setBonus4 },
                { label: '5th', val: bonus5, set: setBonus5 },
              ].map(b => (
                <div key={b.label} className="text-center">
                  <label className="text-[10px] text-muted-foreground block mb-1">{b.label}</label>
                  <Input type="number" value={b.val} onChange={e => b.set(e.target.value)} className="h-9 text-center text-xs rounded-xl admin-inset border-none" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Total: ₹{Number(bonus1) + Number(bonus2) + Number(bonus3) + Number(bonus4) + Number(bonus5)} per referral
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="lg:col-span-2">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full clay-button h-11">
            <Save className="w-4 h-4 mr-2" />Save All Settings
          </Button>
        </div>

        {/* Top Promoters */}
        <div className="admin-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Top Promoters</h3>
          <div className="space-y-2">
            {topReferrers?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No referrals yet</p>
            ) : topReferrers?.map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 admin-inset">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{r?.phone_number}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary">{r.count} refs</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bonus Payouts */}
        <div className="admin-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" />Recent Bonus Payouts</h3>
          <div className="space-y-2">
            {!bonusStats?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">No bonus payouts yet</p>
            ) : bonusStats.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between p-3 admin-inset">
                <div>
                  <p className="text-sm font-medium text-foreground">{b.referrer?.full_name || 'User'}</p>
                  <p className="text-[10px] text-muted-foreground">Deposit #{b.deposit_number} from {b.referred?.full_name || 'User'}</p>
                </div>
                <span className="text-sm font-bold text-primary">+₹{b.bonus_amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReferrals;
