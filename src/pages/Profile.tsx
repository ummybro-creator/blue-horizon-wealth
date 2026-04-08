import {
  Building2, FileText, ChevronRight, ShoppingBag,
  Download, MessageSquare, BarChart3, LogOut, Wallet
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────
   Design Token — matches Home / Promotion pages
───────────────────────────────────────────── */
const D = {
  primary:       '#22C55E',
  primaryDark:   '#16A34A',
  btnGrad:       'linear-gradient(135deg, #22C55E, #16A34A)',
  headerGrad:    'linear-gradient(180deg, #E8F8EE 0%, #F7FCF9 100%)',
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
            <h1 className="text-xl font-extrabold" style={{ color: D.textPrimary }}>
              Profile
            </h1>
            <button
              onClick={() => navigate('/active-plans')}
              className="absolute right-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95"
              style={{ background: D.card, boxShadow: D.shadowCard }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: D.primary }} />
            </button>
          </div>

          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-[68px] h-[68px] rounded-full overflow-hidden shrink-0"
              style={{ border: `3px solid ${D.primary}`, boxShadow: D.shadowGreen }}
            >
              <img src={AVATAR_URL} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[17px] font-extrabold leading-tight" style={{ color: D.textPrimary }}>
                {userName}
              </p>
              <p className="text-sm mt-0.5" style={{ color: D.textSecondary }}>{phone}</p>
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
