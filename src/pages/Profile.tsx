import { 
  Building2, 
  FileText, 
  CreditCard, 
  ChevronRight,
  LogOut,
  Target,
  Download,
  ShoppingBag,
  Trophy,
  Briefcase,
  BarChart3
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AVATAR_URL = 'https://files.catbox.moe/imjd3p.jpg';

const menuItems = [
  { icon: Briefcase, label: 'Active Plan', path: '/active-plans' },
  { icon: BarChart3, label: 'Earnings Details', path: '/earnings' },
  { icon: Building2, label: 'About Company', path: '/about' },
  { icon: FileText, label: 'Financial Records', path: '/records' },
  { icon: CreditCard, label: 'Withdraw Records', path: '/records' },
  { icon: Target, label: 'Mission', path: '/extra-bonus' },
  { icon: Trophy, label: 'Top Promoters', path: '/leaderboard' },
  { icon: Download, label: 'Download App', path: '#' },
];

function formatPhone(phone: string | undefined) {
  if (!phone) return '';
  return phone.replace(/@app\.local$/, '');
}

const Profile = () => {
  const navigate = useNavigate();
  const { profile, wallet, signOut } = useAuth();
  const userName = profile?.full_name || 'User';
  const phoneNumber = formatPhone(profile?.phone_number);

  return (
    <AppLayout>
      {/* Green gradient header */}
      <div
        className="pt-10 pb-8 px-5"
        style={{ background: 'linear-gradient(180deg, hsl(140,52%,43%) 0%, hsl(140,55%,36%) 100%)' }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between mb-5">
          <div className="w-9" />
          <h1 className="text-xl font-extrabold text-white tracking-wide">Profile</h1>
          {/* Shopping bag → Active Plans */}
          <button
            onClick={() => navigate('/active-plans')}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur"
          >
            <ShoppingBag className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/40 mb-3"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            <img src={AVATAR_URL} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-lg font-extrabold text-white">{userName}</h2>
          <p className="text-sm text-white/80 mt-0.5">{phoneNumber}</p>
        </div>

        {/* Account Balance Card */}
        <div className="mt-5 bg-white rounded-2xl px-5 py-4 flex items-center justify-between"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
          <div>
            <p className="text-xs font-semibold text-primary mb-1">Account Balance</p>
            <p className="text-2xl font-extrabold text-gray-800">
              ₹{(wallet?.total_balance ?? 0).toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => navigate('/recharge')}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, hsl(140,52%,43%) 0%, hsl(140,60%,38%) 100%)', boxShadow: '0 3px 12px rgba(52,168,83,0.35)' }}
          >
            Recharge ⚡
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-3 rounded-2xl px-2 py-4 grid grid-cols-3 text-center"
          style={{ background: 'rgba(0,0,0,0.15)' }}>
          <div className="border-r border-white/20">
            <p className="text-base font-extrabold text-white">
              ₹{(wallet?.recharge_balance ?? 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-white/75 mt-0.5">Recharge</p>
          </div>
          <div className="border-r border-white/20">
            <p className="text-base font-extrabold text-white">
              ₹{(wallet?.withdrawable_balance ?? 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-white/75 mt-0.5">Withdraw</p>
          </div>
          <div>
            <p className="text-base font-extrabold text-white">
              ₹{(wallet?.bonus_balance ?? 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-white/75 mt-0.5">Welfare</p>
          </div>
        </div>
      </div>

      {/* Menu list */}
      <div className="px-4 mt-4 pb-8">
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors",
                index !== menuItems.length - 1 && "border-b border-gray-100"
              )}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(52,168,83,0.1)' }}>
                <item.icon className="w-4.5 h-4.5 text-primary" style={{ width: '18px', height: '18px' }} />
              </div>
              <span className="flex-1 text-left font-semibold text-gray-800 text-sm">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}

          {/* Logout */}
          <button
            onClick={async () => { await signOut(); navigate('/login'); }}
            className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50">
              <LogOut className="w-4.5 h-4.5 text-red-500" style={{ width: '18px', height: '18px' }} />
            </div>
            <span className="flex-1 text-left font-semibold text-red-500 text-sm">Log Out</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
