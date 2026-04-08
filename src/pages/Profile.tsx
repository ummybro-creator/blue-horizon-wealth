import { useState } from 'react';
import {
  Building2, FileText, ChevronRight, ShoppingBag,
  Download, MessageSquare, BarChart3, LogOut, Wallet, Send
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/* ─────────────────────────────────────────────
   Design Token — matches Home / Promotion pages
───────────────────────────────────────────── */
const D = {
  primary:       '#22C55E',
  primaryDark:   '#16A34A',
  btnGrad:       'linear-gradient(135deg, #22C55E, #16A34A)',
  headerGrad:    'linear-gradient(135deg, #F04438, #E03328)',
  pageBg:        '#F7FCF9',
  card:          '#FFFFFF',
  statsCard:     '#F0FDF4',
  iconBg:        '#DCFCE7',
  textPrimary:   '#111827',
  textSecondary: '#6B7280',
  textGreen:     '#22C55E',
  border:        '#E5E7EB',
  shadowSoft:    '0 8px 20px rgba(0,0,0,0.05)',
  shadowGreen:   '0 10px 30px rgba(34,197,94,0.22)',
  shadowCard:    '0 2px 12px rgba(0,0,0,0.06)',
};

const AVATAR_URL = 'https://files.catbox.moe/imjd3p.jpg';

const menuItems = [
  { icon: Building2,     label: 'About Company',  path: '/about',       iconColor: '#22C55E' },
  { icon: BarChart3,     label: 'Income Record',   path: '/earnings',    iconColor: '#3B82F6' },
  { icon: FileText,      label: 'Withdraw Record', path: '/records',     iconColor: '#F59E0B' },
  { icon: MessageSquare, label: 'Redeem Code',     path: '/extra-bonus', iconColor: '#A855F7' },
  { icon: Download,      label: 'App Download',    path: '#',            iconColor: '#22C55E' },
];

const iconBgs: Record<string, string> = {
  '#22C55E': '#DCFCE7',
  '#3B82F6': '#EAF4FF',
  '#F59E0B': '#FFF6E5',
  '#A855F7': '#F3E8FF',
};

function formatPhone(phone: string | undefined) {
  if (!phone) return '';
  return phone.replace(/@app\.local$/, '');
}

const Profile = () => {
  const navigate  = useNavigate();
  const { profile, wallet, signOut } = useAuth();
  const userName   = profile?.full_name || 'User';
  const phone      = formatPhone(profile?.phone_number);

  const [promoForm, setPromoForm] = useState({ contact: '', audience: '', description: '' });
  const [promoStatus, setPromoStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');

  const handlePromoSubmit = async () => {
    if (!promoForm.contact.trim() || !promoForm.description.trim()) return;
    setPromoStatus('sending');
    try {
      const message = `📢 PROMOTER APPLICATION\n\nContact: ${promoForm.contact}\nAudience: ${promoForm.audience}\nDescription: ${promoForm.description}\n\nUser: ${userName} | ${phone}`;
      const { error } = await supabase.from('support_tickets').insert({
        user_id: profile?.id,
        subject: 'Promoter Application',
        message,
        status: 'open',
      });
      if (error) throw error;
      setPromoStatus('sent');
      setPromoForm({ contact: '', audience: '', description: '' });
    } catch {
      setPromoStatus('error');
    }
  };

  return (
    <AppLayout>
      {/* ── Page Shell ── */}
      <div className="min-h-screen pb-36" style={{ background: D.pageBg }}>

        {/* ══════════════ HEADER ══════════════ */}
        <div
          className="px-4 pt-10 pb-6"
          style={{
            background: D.headerGrad,
            borderRadius: '0 0 30px 30px',
            boxShadow: D.shadowSoft,
          }}
        >
          {/* Title */}
          <div className="relative flex items-center justify-center mb-5">
            <h1 className="text-xl font-extrabold text-white">Profile</h1>
            <button
              onClick={() => navigate('/active-plans')}
              className="absolute right-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <ShoppingBag className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-[68px] h-[68px] rounded-full overflow-hidden shrink-0"
              style={{ border: '3px solid rgba(255,255,255,0.5)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
            >
              <img src={AVATAR_URL} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[17px] font-extrabold leading-tight text-white">{userName}</p>
              <p className="text-sm mt-0.5 text-white/70">{phone}</p>
            </div>
          </div>

          {/* ── Balance Card ── */}
          <div
            className="rounded-[20px] px-5 py-4 flex items-center justify-between mb-4"
            style={{ background: D.card, boxShadow: D.shadowCard }}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet className="w-3.5 h-3.5" style={{ color: D.primary }} />
                <p className="text-xs font-semibold" style={{ color: D.textSecondary }}>
                  Account Balance
                </p>
              </div>
              <p className="text-[28px] font-extrabold leading-tight" style={{ color: D.textPrimary }}>
                ₹{(wallet?.total_balance ?? 0).toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => navigate('/recharge')}
              className="flex items-center gap-1.5 px-5 py-3 rounded-full text-sm font-extrabold text-white transition-all active:scale-95"
              style={{ background: D.btnGrad, boxShadow: D.shadowGreen }}
            >
              ⚡ Recharge
            </button>
          </div>

          {/* ── Stats Row ── */}
          <div
            className="rounded-[20px] grid grid-cols-3 overflow-hidden"
            style={{ background: D.statsCard, border: `1px solid ${D.border}` }}
          >
            {[
              { label: 'Recharge',  value: wallet?.recharge_balance      ?? 0 },
              { label: 'Withdraw',  value: wallet?.withdrawable_balance   ?? 0 },
              { label: 'Welfare',   value: wallet?.bonus_balance          ?? 0 },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="py-4 text-center"
                style={{
                  borderRight: i < 2 ? `1px solid ${D.border}` : 'none',
                }}
              >
                <p className="text-base font-extrabold" style={{ color: D.primary }}>
                  ₹{Number(stat.value).toFixed(2)}
                </p>
                <p className="text-[11px] mt-1 font-medium" style={{ color: D.textSecondary }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ MENU ══════════════ */}
        <div className="px-4 mt-5 space-y-3">
          {menuItems.map((item) => {
            const bg = iconBgs[item.iconColor] ?? D.iconBg;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                style={{ background: D.card, boxShadow: D.shadowCard }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: bg }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.iconColor }} />
                </div>
                <span className="flex-1 font-semibold text-sm" style={{ color: D.textPrimary }}>
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5" style={{ color: D.textSecondary }} />
              </button>
            );
          })}
        </div>

        {/* ══════════════ PROMOTER APPLICATION ══════════════ */}
        <div className="px-4 mt-5">
          <div
            className="rounded-[22px] overflow-hidden"
            style={{ background: D.card, boxShadow: D.shadowCard }}
          >
            {/* Section Header */}
            <div
              className="px-5 py-4"
              style={{ background: 'linear-gradient(135deg, #D9040A, #B50309)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Send className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white">Become a Promoter</p>
                  <p className="text-[10px] text-white/70 mt-0.5">Partner with Veltrix & earn more</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: D.textSecondary }}>
                  Telegram Username or Contact Number *
                </label>
                <input
                  type="text"
                  placeholder="@yourusername or +91 XXXXXXXXXX"
                  value={promoForm.contact}
                  onChange={e => setPromoForm(f => ({ ...f, contact: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: '#F7FCF9',
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                  }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: D.textSecondary }}>
                  Your Audience / Followers Data
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5000 Instagram followers, 2000 Telegram members"
                  value={promoForm.audience}
                  onChange={e => setPromoForm(f => ({ ...f, audience: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: '#F7FCF9',
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                  }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: D.textSecondary }}>
                  How will you promote Veltrix? *
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe your promotion strategy..."
                  value={promoForm.description}
                  onChange={e => setPromoForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{
                    background: '#F7FCF9',
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                  }}
                />
              </div>

              {promoStatus === 'sent' && (
                <div className="text-center py-2 px-4 rounded-xl text-xs font-semibold" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                  ✅ Application sent! Admin will contact you soon.
                </div>
              )}
              {promoStatus === 'error' && (
                <div className="text-center py-2 px-4 rounded-xl text-xs font-semibold" style={{ background: '#FEE2E2', color: '#B91C1C' }}>
                  ❌ Something went wrong. Please try again.
                </div>
              )}

              <button
                onClick={handlePromoSubmit}
                disabled={promoStatus === 'sending' || promoStatus === 'sent'}
                className="w-full py-3.5 rounded-xl text-sm font-extrabold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #D9040A, #B50309)', boxShadow: '0 6px 18px rgba(217,4,10,0.3)' }}
              >
                {promoStatus === 'sending' ? 'Sending...' : promoStatus === 'sent' ? '✅ Submitted' : '🚀 Submit Application'}
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════ EXIT APP ══════════════ */}
        <div className="px-4 mt-5">
          <button
            onClick={async () => { await signOut(); navigate('/login'); }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-extrabold text-white transition-all active:scale-[0.98]"
            style={{ background: D.btnGrad, boxShadow: D.shadowGreen }}
          >
            <LogOut className="w-5 h-5" />
            Exit App
          </button>
        </div>

      </div>
    </AppLayout>
  );
};

export default Profile;
