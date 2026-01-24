import { 
  Building2, 
  FileText, 
  CreditCard, 
  ChevronRight,
  LogOut,
  TrendingUp,
  Gift
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

const menuItems = [
  { icon: Building2, label: 'About Company', path: '/about', color: 'text-primary' },
  { icon: FileText, label: 'Income Record', path: '/records', color: 'text-primary' },
  { icon: CreditCard, label: 'Withdraw Record', path: '/records', color: 'text-primary' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { profile, wallet, signOut, refreshWallet } = useAuth();
  const [loading, setLoading] = useState(false);

  const phoneNumber = profile?.phone_number || '';
  const maskedId =
    phoneNumber.length >= 8
      ? `${phoneNumber.slice(0, 5)}****${phoneNumber.slice(-3)}`
      : '****';

  /* =========================
     DAILY INCOME CLAIM LOGIC
     ========================= */
  const claimDailyIncome = async () => {
    if (!profile?.id) return;

    setLoading(true);

    const today = new Date().toISOString().split('T')[0];

    // get active investments
    const { data: investments } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'active');

    if (!investments || investments.length === 0) {
      alert('No active investment');
      setLoading(false);
      return;
    }

    for (const inv of investments) {
      // already claimed today
      if (inv.last_credited_date === today) continue;

      // expired investment
      if (new Date(inv.end_date) < new Date()) {
        await supabase
          .from('investments')
          .update({ status: 'expired' })
          .eq('id', inv.id);
        continue;
      }

      // credit balance
      await supabase.rpc('increment_balance', {
        uid: profile.id,
        amount: inv.daily_income,
      });

      // update last credited date
      await supabase
        .from('investments')
        .update({ last_credited_date: today })
        .eq('id', inv.id);
    }

    await refreshWallet();
    alert('Daily income claimed successfully ✅');
    setLoading(false);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="gradient-header pt-12 pb-32 px-4 relative">
        {/* Logout */}
        <button
          onClick={async () => {
            await signOut();
            navigate('/login');
          }}
          className="absolute top-12 right-4 w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center"
        >
          <LogOut className="w-5 h-5 text-primary-foreground" />
        </button>

        {/* Profile Info */}
        <div className="flex items-center gap-4 mt-8">
          <div className="w-20 h-20 rounded-full bg-primary-foreground flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">
              {profile?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm">
            ID: {maskedId}
          </span>
        </div>
      </div>

      {/* Account Summary */}
      <div className="mx-4 -mt-20 relative z-10">
        <div className="bg-card rounded-2xl shadow-elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Account Summary</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary/30 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-primary">
                ₹{wallet?.total_balance ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Balance</p>
            </div>

            <div className="bg-secondary/30 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-primary">
                ₹{wallet?.recharge_balance ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Recharge</p>
            </div>

            <div className="bg-secondary/30 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-primary">
                ₹{(wallet?.total_income ?? 0).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Total Income</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Claim Button */}
      <div className="mx-4 mt-6">
        <button
          disabled={loading}
          onClick={claimDailyIncome}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg disabled:opacity-60"
        >
          <Gift className="w-5 h-5" />
          {loading ? 'Processing...' : 'Claim Daily Income'}
        </button>
      </div>

      {/* My Account */}
      <div className="mx-4 mt-6 mb-6">
        <h2 className="font-bold text-lg mb-3">My Account</h2>
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 p-4 ${
                index !== menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;


