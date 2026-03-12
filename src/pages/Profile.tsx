import { 
  Building2, 
  FileText, 
  CreditCard, 
  ChevronRight,
  LogOut,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Target,
  Download,
  CheckCircle,
  ShoppingBag
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
  { icon: Download, label: 'Download App', path: '#' },
];

// Strip @app.local from phone number for display
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
      <div className="bg-primary pt-10 pb-6 px-5" style={{ borderRadius: '0 0 1.5rem 1.5rem' }}>
        <div className="flex items-center justify-between">
          {/* Avatar + Info */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-foreground flex items-center justify-center shadow-md">
              <span className="text-xl font-extrabold text-primary">
                {userName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold text-primary-foreground">{userName}</h2>
              <p className="text-sm text-primary-foreground/80">{phoneNumber}</p>
            </div>
          </div>

          {/* Orders button */}
          <button
            onClick={() => navigate('/records')}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-foreground text-primary text-xs font-bold shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Orders
          </button>
        </div>

        {/* Total Withdraw strip */}
        <div className="mt-4 flex items-center gap-2 bg-primary-foreground/15 rounded-full px-4 py-2">
          <CheckCircle className="w-4 h-4 text-primary-foreground" />
          <span className="text-sm font-semibold text-primary-foreground">
            Total Withdraw: ₹{wallet?.withdrawable_balance ?? 0}
          </span>
        </div>
      </div>

      {/* Deposit / Withdraw buttons */}
      <div className="px-5 mt-5">
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/recharge')}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-card border border-border shadow-sm font-bold text-foreground text-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4 text-primary" />
            </div>
            Deposit
          </button>
          <button
            onClick={() => navigate('/withdraw')}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-card border border-border shadow-sm font-bold text-foreground text-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowUpFromLine className="w-4 h-4 text-primary" />
            </div>
            Withdraw
          </button>
        </div>
      </div>

      {/* Personal Details pill */}
      <div className="flex justify-center mt-5">
        <span className="px-5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
          Personal Details
        </span>
      </div>

      {/* Earnings section */}
      <div className="px-5 mt-4">
        <h3 className="text-base font-bold text-foreground mb-3">Earnings</h3>
        <div className="flex gap-3">
          <div className="flex-1 bg-card rounded-2xl border border-border shadow-sm p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground font-medium">Main Balance</span>
            </div>
            <p className="text-xl font-extrabold text-foreground">
              ₹{(wallet?.total_balance ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="flex-1 bg-card rounded-2xl border border-border shadow-sm p-4">
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
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 transition-colors",
                index !== menuItems.length - 1 && "border-b border-border"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 text-left font-semibold text-foreground text-sm">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}

          {/* Log Out */}
          <button
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-muted-foreground" />
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
