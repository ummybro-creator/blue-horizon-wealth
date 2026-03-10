import { 
  Building2, 
  FileText, 
  CreditCard, 
  ChevronRight,
  LogOut,
  TrendingUp
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { icon: Building2, label: 'About Company', path: '/about', color: 'text-primary' },
  { icon: FileText, label: 'Income Record', path: '/records', color: 'text-primary' },
  { icon: CreditCard, label: 'Withdraw Record', path: '/records', color: 'text-primary' },
  { icon: TrendingUp, label: 'Extra Referral Bonus', path: '/extra-bonus', color: 'text-primary' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { profile, wallet, signOut } = useAuth();
  const phoneNumber = profile?.phone_number || '';
  const maskedId = phoneNumber.length >= 8 
    ? `${phoneNumber.slice(0, 5)}****${phoneNumber.slice(-3)}`
    : '****';

  return (
    <AppLayout>
      {/* Header */}
      <div className="gradient-header pt-12 pb-32 px-4 relative">
        {/* Logout Button */}
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
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm">
              ID: {maskedId}
            </span>
          </div>
        </div>
      </div>

      {/* Account Summary Card */}
      <div className="mx-4 -mt-20 relative z-10">
        <div className="bg-card rounded-2xl shadow-elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Account Summary</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary/30 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-primary">₹{wallet?.total_balance ?? 0}</p>
              <p className="text-xs text-muted-foreground">Balance</p>
            </div>
            <div className="bg-secondary/30 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-primary">₹{wallet?.recharge_balance ?? 0}</p>
              <p className="text-xs text-muted-foreground">Recharge</p>
            </div>
            <div className="bg-secondary/30 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-primary">₹{(wallet?.total_income ?? 0).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total Income</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Account Section */}
      <div className="mx-4 mt-6 mb-6">
        <h2 className="font-bold text-foreground text-lg mb-3">My Account</h2>
        
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.path + item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
