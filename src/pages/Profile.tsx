import { 
  User, 
  CreditCard, 
  FileText, 
  Shield, 
  Headphones, 
  Send, 
  LogOut,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockUser, mockWallet } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { icon: Wallet, label: 'Wallet Details', path: '/wallet' },
  { icon: CreditCard, label: 'Bank & UPI Details', path: '/bank-details' },
  { icon: FileText, label: 'Transaction History', path: '/records' },
  { icon: Shield, label: 'Security Settings', path: '/security' },
  { icon: Headphones, label: 'Customer Support', path: '/support' },
  { icon: Send, label: 'Join Telegram', path: '/telegram', external: true },
];

const Profile = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      {/* Header */}
      <div className="gradient-header pt-12 pb-24 px-4">
        <h1 className="text-2xl font-bold text-primary-foreground">Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="mx-4 -mt-16 relative z-10 animate-slide-up">
        <div className="bg-card rounded-2xl shadow-elevated p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">
                {mockUser.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{mockUser.name}</h2>
              <p className="text-muted-foreground text-sm">{mockUser.mobile}</p>
              <p className="text-primary text-sm font-medium">ID: {mockUser.referralCode}</p>
            </div>
          </div>

          {/* Balance Summary */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="bg-primary/5 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Balance</p>
              <p className="text-lg font-bold text-primary">₹{mockWallet.totalBalance.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-success/5 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Income</p>
              <p className="text-lg font-bold text-success">₹{mockWallet.totalIncome.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="mx-4 mt-5 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors",
                index !== menuItems.length - 1 && "border-b border-border"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          className="w-full mt-4 flex items-center justify-center gap-2 p-4 bg-destructive/10 rounded-2xl text-destructive font-semibold hover:bg-destructive/20 transition-colors"
          onClick={() => navigate('/login')}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </AppLayout>
  );
};

export default Profile;
