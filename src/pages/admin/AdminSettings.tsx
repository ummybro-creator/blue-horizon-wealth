import { useState, useEffect } from 'react';
import { Settings, Save, MessageCircle, CreditCard, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ app_name: '', app_logo_url: '', payment_upi_id: '', payment_qr_code_url: '', support_whatsapp: '', support_email: '', support_phone: '', telegram_group_link: '', checkin_bonus_amount: '', minimum_withdrawal: '', minimum_recharge: '' });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => { const { data, error } = await supabase.from('app_settings').select('*').limit(1).maybeSingle(); if (error) throw error; return data; },
  });

  useEffect(() => {
    if (settings) setFormData({ app_name: settings.app_name || '', app_logo_url: settings.app_logo_url || '', payment_upi_id: settings.payment_upi_id || '', payment_qr_code_url: settings.payment_qr_code_url || '', support_whatsapp: settings.support_whatsapp || '', support_email: settings.support_email || '', support_phone: settings.support_phone || '', telegram_group_link: settings.telegram_group_link || '', checkin_bonus_amount: settings.checkin_bonus_amount?.toString() || '12', minimum_withdrawal: settings.minimum_withdrawal?.toString() || '500', minimum_recharge: settings.minimum_recharge?.toString() || '100' });
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updateData = { app_name: formData.app_name, app_logo_url: formData.app_logo_url || null, payment_upi_id: formData.payment_upi_id, payment_qr_code_url: formData.payment_qr_code_url || null, support_whatsapp: formData.support_whatsapp || null, support_email: formData.support_email || null, support_phone: formData.support_phone || null, telegram_group_link: formData.telegram_group_link || null, checkin_bonus_amount: parseFloat(formData.checkin_bonus_amount) || 12, minimum_withdrawal: parseFloat(formData.minimum_withdrawal) || 500, minimum_recharge: parseFloat(formData.minimum_recharge) || 100 };
      if (settings?.id) { const { error } = await supabase.from('app_settings').update(updateData).eq('id', settings.id); if (error) throw error; }
      else { const { error } = await supabase.from('app_settings').insert(updateData); if (error) throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['app-settings'] }); toast.success('Settings saved successfully'); },
    onError: () => { toast.error('Failed to save settings'); },
  });

  if (isLoading) return <div className="admin-bg flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const sections = [
    { title: 'App Branding', icon: Settings, fields: [
      { label: 'App Name', key: 'app_name', placeholder: 'My Investment App' },
      { label: 'App Logo URL', key: 'app_logo_url', placeholder: 'https://example.com/logo.png' },
    ]},
    { title: 'Payment Settings', icon: CreditCard, fields: [
      { label: 'UPI ID', key: 'payment_upi_id', placeholder: 'yourname@upi' },
      { label: 'QR Code Image URL', key: 'payment_qr_code_url', placeholder: 'https://example.com/qr.png' },
    ]},
    { title: 'Support Channels', icon: MessageCircle, fields: [
      { label: 'WhatsApp Number', key: 'support_whatsapp', placeholder: '+91 9876543210' },
      { label: 'Email', key: 'support_email', placeholder: 'support@example.com' },
      { label: 'Phone Number', key: 'support_phone', placeholder: '+91 9876543210' },
    ]},
    { title: 'Telegram & Limits', icon: Send, fields: [
      { label: 'Telegram Group Link', key: 'telegram_group_link', placeholder: 'https://t.me/yourgroup' },
      { label: 'Check-in Bonus Amount (₹)', key: 'checkin_bonus_amount', placeholder: '12', type: 'number' },
      { label: 'Minimum Recharge (₹)', key: 'minimum_recharge', placeholder: '100', type: 'number' },
      { label: 'Minimum Withdrawal (₹)', key: 'minimum_withdrawal', placeholder: '500', type: 'number' },
    ]},
  ];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground text-sm">Configure your platform</p>
        </div>
        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          className="px-4 py-2.5 rounded-2xl clay-button text-sm flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95">
          <Save className="w-4 h-4" />{saveMutation.isPending ? 'Saving...' : 'Save All'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="clay-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <section.icon className="w-5 h-5 text-primary" />{section.title}
            </h2>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="text-sm text-muted-foreground mb-1 block">{field.label}</label>
                  <Input
                    type={field.type || 'text'}
                    value={(formData as any)[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="rounded-2xl clay-inset border-none"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
