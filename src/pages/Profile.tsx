import { Building2, FileText, CreditCard, ChevronRight, Lock, Download, MessageSquare, BarChart3 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AVATAR_URL = 'https://files.catbox.moe/imjd3p.jpg';

const menuItems = [
  {
    icon: Building2,
    label: 'About Company',
    path: '/about',
  },
  {
    icon: BarChart3,
    label: 'Income Record',
    path: '/earnings',
  },
  {
    icon: FileText,
    label: 'Withdraw Record',
    path: '/records',
  },
  {
    icon: MessageSquare,
    label: 'Redeem Code',
    path: '/extra-bonus',
  },
  {
    icon: Download,
    label: 'App Download',
    path: '#',
  },
];

function formatPhone(phone: string | undefined) {
  if (!phone) return '';
  return phone.replace(/@app\.local$/, '');
}

const GREEN = 'hsl(140,52%,43%)';
const GREEN_DARK = 'hsl(140,55%,36%)';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, wallet, signOut } = useAuth();
  const userName = profile?.full_name || 'User';
  const phoneNumber = formatPhone(profile?.phone_number);

  return (
    <AppLayout>
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}>

        {/* ── Top Section ── */}
        <div className="px-4 pt-10 pb-5">
          {/* Title row */}
          <div className="relative flex items-center justify-center mb-5">
            <h1 className="text-xl font-extrabold text-white tracking-wide">Profile</h1>
            <button
              onClick={() => navigate('/active-plans')}
              className="absolute right-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.22)' }}
            >
              <Lock className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Avatar + Name/Phone row */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full overflow-hidden border-[3px] border-white shrink-0"
              style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>
              <img src={AVATAR_URL} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-white leading-tight">{userName}</p>
              <p className="text-sm text-white font-medium mt-0.5 underline underline-offset-2 decoration-white/60">
                {phoneNumber}
              </p>
            </div>
          </div>

          {/* Account Balance Card */}
          <div className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between mb-3"
            style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.15)' }}>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: GREEN }}>Account Balance</p>
              <p className="text-3xl font-extrabold text-gray-900">
                ₹{(wallet?.total_balance ?? 0).toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => navigate('/recharge')}
              className="flex items-center gap-1.5 px-5 py-3 rounded-full text-sm font-extrabold text-white"
              style={{
                background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
                boxShadow: '0 4px 14px rgba(52,168,83,0.4)',
              }}
            >
              Recharge ⚡
            </button>
          </div>

          {/* Stats Row */}
          <div className="rounded-2xl px-3 py-4 grid grid-cols-3 text-center"
            style={{ background: 'rgba(0,0,0,0.18)' }}>
            <div className="border-r border-white/25 px-2">
              <p className="text-base font-extrabold text-white">
                ₹{(wallet?.recharge_balance ?? 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-white/80 mt-1">Recharge</p>
            </div>
            <div className="border-r border-white/25 px-2">
              <p className="text-base font-extrabold text-white">
                ₹{(wallet?.withdrawable_balance ?? 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-white/80 mt-1">Withdraw</p>
            </div>
            <div className="px-2">
              <p className="text-base font-extrabold text-white">
                ₹{(wallet?.bonus_balance ?? 0).toFixed(0)}
              </p>
              <p className="text-[11px] text-white/80 mt-1">Welflare</p>
            </div>
          </div>
        </div>

        {/* ── Menu Section ── */}
        <div
          className="rounded-t-3xl px-0 pb-36"
          style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(2px)' }}
        >
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/10"
              style={{ borderBottom: index < menuItems.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}
            >
              {/* Icon box */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="flex-1 text-left font-semibold text-white text-sm">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-white/70" />
            </button>
          ))}
        </div>

        {/* ── Exit App Button ── fixed at bottom above tab bar */}
        <div className="fixed bottom-[72px] left-0 right-0 px-5 pb-3 z-20">
          <button
            onClick={async () => { await signOut(); navigate('/login'); }}
            className="w-full py-4 rounded-2xl text-base font-extrabold text-white tracking-wide transition-all active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
              boxShadow: '0 4px 20px rgba(52,168,83,0.5)',
            }}
          >
            Exit App
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
