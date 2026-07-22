import {
  Building2, FileText, ChevronRight, ShoppingBag,
  Download, MessageSquare, BarChart3, LogOut, Wallet, Send
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ORANGE      = '#FF6A00';
const BTN_GRAD    = 'linear-gradient(135deg, #FF8A00 0%, #FF6A00 100%)';
const BTN_SHADOW  = '0 10px 24px rgba(255,106,0,0.38)';
const CARD_STYLE  = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 8px 24px rgba(255,106,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.75)',
} as const;

const menuItems = [
  { icon: Building2,     label: 'About Company',  path: '/about',       iconColor: '#FF6A00', iconBg: '#FFE3C5' },
  { icon: BarChart3,     label: 'Income Record',   path: '/earnings',    iconColor: '#3B82F6', iconBg: '#EAF4FF' },
  { icon: FileText,      label: 'Withdraw Record', path: '/records',     iconColor: '#F59E0B', iconBg: '#FFF6E5' },
  { icon: MessageSquare, label: 'Redeem Code',     path: '/extra-bonus', iconColor: '#A855F7', iconBg: '#F3E8FF' },
  { icon: Download,      label: 'App Download',    path: '#',            iconColor: '#FF6A00', iconBg: '#FFE3C5' },
];

const AVATAR_URL = 'https://files.catbox.moe/imjd3p.jpg';

function formatPhone(phone: string | undefined) {
  if (!phone) return '';
  return phone.replace(/@app\.local$/, '');
}

const Profile = () => {
  const navigate = useNavigate();
  const { profile, wallet, signOut } = useAuth();
  const userName = profile?.full_name || 'User';
  const phone    = formatPhone(profile?.phone_number);

  return (
    <AppLayout>
      <div className="min-h-screen pb-10" style={{ fontFamily: "'Poppins', sans-serif" }}>

        {/* ── Header ── */}
        <div className="clay-header px-4 pt-10 pb-6">
          {/* Title row */}
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
              style={{ border: '3px solid rgba(255,255,255,0.5)', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
            >
              <img src={AVATAR_URL} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[17px] font-extrabold leading-tight text-white">{userName}</p>
              <p className="text-sm mt-0.5 text-white/70">{phone}</p>
            </div>
          </div>

          {/* Balance Card (inside header) */}
          <div
            className="rounded-[20px] px-5 py-4 flex items-center justify-between mb-4"
            style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet className="w-3.5 h-3.5" style={{ color: ORANGE }} />
                <p className="text-xs font-semibold" style={{ color: '#8A8A8A' }}>Account Balance</p>
              </div>
              <p className="text-[28px] font-extrabold leading-tight" style={{ color: '#2B2B2B' }}>
                ₹{(wallet?.total_balance ?? 0).toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => navigate('/recharge')}
              className="flex items-center gap-1.5 px-5 py-3 rounded-full text-sm font-extrabold text-white transition-all active:scale-95"
              style={{ background: BTN_GRAD, boxShadow: BTN_SHADOW }}
            >
              ⚡ Recharge
            </button>
          </div>

          {/* Stats Row */}
          <div
            className="rounded-[20px] grid grid-cols-3 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.6)' }}
          >
            {[
              { label: 'Recharge', value: wallet?.recharge_balance    ?? 0 },
              { label: 'Withdraw', value: wallet?.withdrawable_balance ?? 0 },
              { label: 'Welfare',  value: wallet?.bonus_balance        ?? 0 },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="py-4 text-center"
                style={{ borderRight: i < 2 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
              >
                <p className="text-base font-extrabold" style={{ color: ORANGE }}>
                  ₹{Number(stat.value).toFixed(2)}
                </p>
                <p className="text-[11px] mt-1 font-medium" style={{ color: '#8A8A8A' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Menu Items ── */}
        <div className="px-4 mt-5 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-[20px] text-left transition-all active:scale-[0.98]"
              style={CARD_STYLE}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: item.iconBg }}
              >
                <item.icon className="w-5 h-5" style={{ color: item.iconColor }} />
              </div>
              <span className="flex-1 font-semibold text-sm" style={{ color: '#2B2B2B' }}>
                {item.label}
              </span>
              <ChevronRight className="w-5 h-5" style={{ color: '#8A8A8A' }} />
            </button>
          ))}
        </div>

        {/* ── Become a Promoter ── */}
        <div className="px-4 mt-3">
          <button
            onClick={() => navigate('/become-promoter')}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-[20px] text-left transition-all active:scale-[0.98]"
            style={CARD_STYLE}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: '#FFE4E4' }}
            >
              <Send className="w-5 h-5" style={{ color: '#D9040A' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight" style={{ color: '#2B2B2B' }}>
                Become a Promoter
              </p>
              <p className="text-[11px] mt-0.5 font-medium" style={{ color: '#8A8A8A' }}>
                Partner with Veltrix &amp; earn more
              </p>
            </div>
            <ChevronRight className="w-5 h-5 shrink-0" style={{ color: '#8A8A8A' }} />
          </button>
        </div>

        {/* ── Sign Out ── */}
        <div className="px-4 mt-5 mb-4">
          <button
            onClick={async () => { await signOut(); navigate('/login'); }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-base font-extrabold text-white transition-all active:scale-[0.98]"
            style={{ background: BTN_GRAD, boxShadow: BTN_SHADOW }}
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
