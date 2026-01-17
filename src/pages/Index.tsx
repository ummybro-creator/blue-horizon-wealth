import { Bell, Wallet } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { WalletCard } from '@/components/home/WalletCard';
import { QuickActions } from '@/components/home/QuickActions';
import { ActiveInvestments } from '@/components/home/ActiveInvestments';
import { RecentTransactions } from '@/components/home/RecentTransactions';
import { mockUser } from '@/data/mockData';

const Index = () => {
  return (
    <AppLayout>
      {/* Header */}
      <div className="gradient-header pt-12 pb-28 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm">Good Morning</p>
            <h1 className="text-xl font-bold text-primary-foreground">{mockUser.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <WalletCard />

      {/* Quick Actions */}
      <QuickActions />

      {/* Active Investments */}
      <ActiveInvestments />

      {/* Recent Transactions */}
      <RecentTransactions />
    </AppLayout>
  );
};

export default Index;
