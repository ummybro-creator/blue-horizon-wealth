import { useState, useEffect } from 'react';
import { 
  Settings, 
  ArrowLeft,
  Save,
  MessageCircle,
  Mail,
  Phone,
  Send,
  CreditCard,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    app_name: '',
    app_logo_url: '',
    payment_upi_id: '',
    payment_qr_code_url: '',
    support_whatsapp: '',
    support_email: '',
    support_phone: '',
    telegram_group_link: '',
    checkin_bonus_amount: '',
    minimum_withdrawal: '',
    minimum_recharge: '',
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        app_name: settings.app_name || '',
        app_logo_url: settings.app_logo_url || '',
        payment_upi_id: settings.payment_upi_id || '',
        payment_qr_code_url: settings.payment_qr_code_url || '',
        support_whatsapp: settings.support_whatsapp || '',
        support_email: settings.support_email || '',
        support_phone: settings.support_phone || '',
        telegram_group_link: settings.telegram_group_link || '',
        checkin_bonus_amount: settings.checkin_bonus_amount?.toString() || '12',
        minimum_withdrawal: settings.minimum_withdrawal?.toString() || '500',
        minimum_recharge: settings.minimum_recharge?.toString() || '100',
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updateData = {
        app_name: formData.app_name,
        app_logo_url: formData.app_logo_url || null,
        payment_upi_id: formData.payment_upi_id,
        payment_qr_code_url: formData.payment_qr_code_url || null,
        support_whatsapp: formData.support_whatsapp || null,
        support_email: formData.support_email || null,
        support_phone: formData.support_phone || null,
        telegram_group_link: formData.telegram_group_link || null,
        checkin_bonus_amount: parseFloat(formData.checkin_bonus_amount) || 12,
        minimum_withdrawal: parseFloat(formData.minimum_withdrawal) || 500,
        minimum_recharge: parseFloat(formData.minimum_recharge) || 100,
      };

      if (settings?.id) {
        const { error } = await supabase
          .from('app_settings')
          .update(updateData)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('app_settings')
          .insert(updateData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      toast.success('Settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/dashboard"
            className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">App Settings</h1>
            <p className="text-slate-400">Configure your platform</p>
          </div>
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-gradient-to-r from-orange-500 to-amber-600"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App Branding */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" />
            App Branding
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">App Name</label>
              <Input
                value={formData.app_name}
                onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="My Investment App"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">App Logo URL</label>
              <Input
                value={formData.app_logo_url}
                onChange={(e) => setFormData({ ...formData, app_logo_url: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-400" />
            Payment Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">UPI ID</label>
              <Input
                value={formData.payment_upi_id}
                onChange={(e) => setFormData({ ...formData, payment_upi_id: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="yourname@upi"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">QR Code Image URL</label>
              <Input
                value={formData.payment_qr_code_url}
                onChange={(e) => setFormData({ ...formData, payment_qr_code_url: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="https://example.com/qr.png"
              />
            </div>
          </div>
        </div>

        {/* Support Settings */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-400" />
            Support Channels
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> WhatsApp Number
              </label>
              <Input
                value={formData.support_whatsapp}
                onChange={(e) => setFormData({ ...formData, support_whatsapp: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <Input
                value={formData.support_email}
                onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="support@example.com"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone Number
              </label>
              <Input
                value={formData.support_phone}
                onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="+91 9876543210"
              />
            </div>
          </div>
        </div>

        {/* Telegram & Limits */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-orange-400" />
            Telegram & Limits
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Telegram Group Link</label>
              <Input
                value={formData.telegram_group_link}
                onChange={(e) => setFormData({ ...formData, telegram_group_link: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="https://t.me/yourgroup"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Check-in Bonus Amount (₹)</label>
              <Input
                type="number"
                value={formData.checkin_bonus_amount}
                onChange={(e) => setFormData({ ...formData, checkin_bonus_amount: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="12"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Minimum Recharge (₹)</label>
              <Input
                type="number"
                value={formData.minimum_recharge}
                onChange={(e) => setFormData({ ...formData, minimum_recharge: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="100"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Minimum Withdrawal (₹)</label>
              <Input
                type="number"
                value={formData.minimum_withdrawal}
                onChange={(e) => setFormData({ ...formData, minimum_withdrawal: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
