import { 
  Building2, 
  FileText, 
  CreditCard, 
  ChevronRight,
  LogOut,
  ArrowDownToLine,
  ArrowUpFromLine,
  Target,
  Download,
  CheckCircle,
  ShoppingBag,
  Trophy
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Building2, label: 'About Company', path: '/about' },
  { icon: FileText, label: 'Financial Records', path: '/records' },
  { icon: CreditCard, label: 'Withdraw Records', path: '/records' },
  { icon: Target, label: 'Mission', path: '/checkin' },
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
      {/* Header with user info */}
      <div className="clay-header pt-10 pb-6 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-clay-sm">
              <span className="text-xl font-extrabold text-white">
                {userName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{userName}</h2>
              <p className="text-sm text-white/80">{phoneNumber}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/records')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white text-xs font-bold shadow-clay-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Orders
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2.5">
          <CheckCircle className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">
            Total Withdraw: ₹{wallet?.withdrawable_balance ?? 0}
          </span>
        </div>
      </div>

      {/* Deposit / Withdraw buttons */}
      <div className="px-5 mt-5">
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/recharge')}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl clay-card font-bold text-foreground text-sm transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4 text-primary" />
            </div>
            Deposit
          </button>
          <button
            onClick={() => navigate('/withdraw')}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl clay-card font-bold text-foreground text-sm transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ArrowUpFromLine className="w-4 h-4 text-primary" />
            </div>
            Withdraw
          </button>
        </div>
      </div>

      {/* Personal Details pill */}
      <div className="flex justify-center mt-5">
        <span className="px-5 py-1.5 rounded-full clay-button text-xs">
          Personal Details
        </span>
      </div>

      {/* Earnings section */}
      <div className="px-5 mt-4">
        <h3 className="text-base font-bold text-foreground mb-3">Earnings</h3>
        <div className="flex gap-3">
          <div className="flex-1 clay-card p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground font-medium">Main Balance</span>
            </div>
            <p className="text-xl font-extrabold text-foreground">
              ₹{(wallet?.total_balance ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="flex-1 clay-card p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground font-medium">Recharge Wallet</span>
            </div>
            <p className="text-xl font-extrabold text-foreground">
              ₹{(wallet?.recharge_balance ?? 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Menu list */}
      <div className="px-5 mt-6 pb-8">
        <div className="clay-card overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/50 transition-colors",
                index !== menuItems.length - 1 && "border-b border-muted"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shadow-clay-sm">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="flex-1 text-left font-semibold text-foreground text-sm">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}

          <button
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shadow-clay-sm">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <span className="flex-1 text-left font-semibold text-foreground text-sm">Log Out</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
