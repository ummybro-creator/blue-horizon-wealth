import { Building2, FileText, ChevronRight, Lock, Download, MessageSquare, BarChart3 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AVATAR_URL = 'https://files.catbox.moe/imjd3p.jpg';

/* ── Brand Color System ─────────────────────────────── */
const C = {
  greenDark:     '#1F8F4E',
  greenPrimary:  '#2FAE5B',
  greenLight:    '#4CCB73',
  gradient:      'linear-gradient(135deg, #4CCB73, #2FAE5B, #1F8F4E)',
  gradientV:     'linear-gradient(180deg, #4CCB73 0%, #2FAE5B 50%, #1F8F4E 100%)',
  btnStart:      '#34C46A',
  btnEnd:        '#249E55',
  bgMain:        '#F5F7F6',
  bgCard:        '#FFFFFF',
  greenSoft:     '#E9F7EF',
  greenLightBg:  '#DFF5E8',
  greenGlass:    'rgba(47,174,91,0.15)',
  textDark:      '#1A1A1A',
  textLight:     '#6B7280',
  textWhite:     '#FFFFFF',
  textGreen:     '#2FAE5B',
  borderLight:   '#E5E7EB',
  shadowSoft:    '0 8px 25px rgba(0,0,0,0.05)',
  shadowGreen:   '0 10px 30px rgba(47,174,91,0.25)',
  iconGreen:     '#E6F7EE',
};

const menuItems = [
  { icon: Building2,    label: 'About Company',  path: '/about'        },
  { icon: BarChart3,    label: 'Income Record',   path: '/earnings'     },
  { icon: FileText,     label: 'Withdraw Record', path: '/records'      },
  { icon: MessageSquare,label: 'Redeem Code',     path: '/extra-bonus'  },
  { icon: Download,     label: 'App Download',    path: '#'             },
];

function formatPhone(phone: string | undefined) {
  if (!phone) return '';
  return phone.replace(/@app\.local$/, '');
}

const Profile = () => {
  const navigate = useNavigate();
  const { profile, wallet, signOut } = useAuth();
  const userName  = profile?.full_name || 'User';
  const phoneNumber = formatPhone(profile?.phone_number);

  return (
    <AppLayout>
      <div className="min-h-screen" style={{ background: C.gradientV }}>

        {/* ── Header ── */}
        <div className="px-4 pt-10 pb-5">

          {/* Title row */}
          <div className="relative flex items-center justify-center mb-5">
            <h1 className="text-xl font-extrabold tracking-wide" style={{ color: C.textWhite }}>
              Profile
            </h1>
            <button
              onClick={() => navigate('/active-plans')}
              className="absolute right-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(4px)' }}
            >
              <Lock className="w-5 h-5" style={{ color: C.textWhite }} />
            </button>
          </div>

          {/* Avatar + user info */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-[3px] border-white"
              style={{ boxShadow: C.shadowGreen }}
            >
              <img src={AVATAR_URL} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-lg font-extrabold leading-tight" style={{ color: C.textWhite }}>
                {userName}
              </p>
              <p
                className="text-sm font-medium mt-0.5 underline underline-offset-2"
                style={{ color: 'rgba(255,255,255,0.85)', textDecorationColor: 'rgba(255,255,255,0.45)' }}
              >
                {phoneNumber}
              </p>
            </div>
          </div>

          {/* Account Balance Card */}
          <div
            className="rounded-2xl px-5 py-4 flex items-center justify-between mb-3"
            style={{ background: C.bgCard, boxShadow: C.shadowGreen }}
          >
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: C.textGreen }}>
                Account Balance
              </p>
              <p className="text-3xl font-extrabold" style={{ color: C.textDark }}>
                ₹{(wallet?.total_balance ?? 0).toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => navigate('/recharge')}
              className="flex items-center gap-1.5 px-5 py-3 rounded-full text-sm font-extrabold transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${C.btnStart}, ${C.btnEnd})`,
                color: C.textWhite,
                boxShadow: C.shadowGreen,
              }}
            >
              Recharge ⚡
            </button>
          </div>

          {/* Stats Row */}
          <div
            className="rounded-2xl px-3 py-4 grid grid-cols-3 text-center"
            style={{ background: 'rgba(0,0,0,0.18)' }}
          >
            <div className="px-2" style={{ borderRight: '1px solid rgba(255,255,255,0.22)' }}>
              <p className="text-base font-extrabold" style={{ color: C.textWhite }}>
                ₹{(wallet?.recharge_balance ?? 0).toFixed(2)}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.78)' }}>Recharge</p>
            </div>
            <div className="px-2" style={{ borderRight: '1px solid rgba(255,255,255,0.22)' }}>
              <p className="text-base font-extrabold" style={{ color: C.textWhite }}>
                ₹{(wallet?.withdrawable_balance ?? 0).toFixed(2)}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.78)' }}>Withdraw</p>
            </div>
            <div className="px-2">
              <p className="text-base font-extrabold" style={{ color: C.textWhite }}>
                ₹{(wallet?.bonus_balance ?? 0).toFixed(0)}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.78)' }}>Welflare</p>
            </div>
          </div>
        </div>

        {/* ── Menu ── */}
        <div
          className="rounded-t-3xl pb-36"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(3px)' }}
        >
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/10 active:bg-white/20"
              style={{
                borderBottom: index < menuItems.length - 1
                  ? '1px solid rgba(255,255,255,0.14)'
                  : 'none',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: C.iconGreen,
                  border: `1.5px solid ${C.greenPrimary}33`,
                }}
              >
                <item.icon className="w-5 h-5" style={{ color: C.greenDark }} />
              </div>
              <span className="flex-1 text-left font-semibold text-sm" style={{ color: C.textWhite }}>
                {item.label}
              </span>
              <ChevronRight className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.65)' }} />
            </button>
          ))}
        </div>

        {/* ── Exit App — fixed above bottom tab bar ── */}
        <div className="fixed bottom-[72px] left-0 right-0 px-5 pb-3 z-20">
          <button
            onClick={async () => { await signOut(); navigate('/login'); }}
            className="w-full py-4 rounded-2xl text-base font-extrabold tracking-wide transition-all active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${C.btnStart}, ${C.btnEnd})`,
              color: C.textWhite,
              boxShadow: C.shadowGreen,
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
