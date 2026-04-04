import { useState, useEffect } from 'react';
import { Gift, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminRewards = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => { const { data } = await supabase.from('app_settings').select('*').limit(1).single(); return data; },
  });

  const [signupBonus, setSignupBonus] = useState('');
  const [depositBonus, setDepositBonus] = useState('');
  const [checkinBonus, setCheckinBonus] = useState('');

  useEffect(() => {
    if (settings) {
      setSignupBonus(String(settings.signup_bonus || 0));
      setDepositBonus(String(settings.deposit_bonus_percent || 0));
      setCheckinBonus(String(settings.checkin_bonus_amount || 12));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('app_settings').update({
        signup_bonus: Number(signupBonus),
        deposit_bonus_percent: Number(depositBonus),
        checkin_bonus_amount: Number(checkinBonus),
      }).eq('id', settings?.id || '');
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['app-settings'] }); toast.success('Reward settings saved'); },
    onError: () => toast.error('Failed to save'),
  });

  const fields = [
    { label: 'Signup Bonus (₹)', value: signupBonus, set: setSignupBonus, desc: 'Bonus given to new users on registration' },
    { label: 'Deposit Cashback (%)', value: depositBonus, set: setDepositBonus, desc: 'Percentage bonus on each deposit' },
    { label: 'Daily Check-in Base (₹)', value: checkinBonus, set: setCheckinBonus, desc: 'Base check-in bonus amount' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reward Control</h1>
        <p className="text-muted-foreground text-sm">Manage bonuses & rewards</p>
      </div>

      <div className="admin-card p-5 max-w-xl">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Gift className="w-4 h-4 text-primary" />Reward Configuration
        </h3>
        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium text-foreground mb-1 block">{f.label}</label>
              <Input type="number" value={f.value} onChange={e => f.set(e.target.value)} className="h-11 rounded-2xl admin-inset border-none" />
              <p className="text-[10px] text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full clay-button h-11">
            <Save className="w-4 h-4 mr-2" />Save Rewards
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRewards;
