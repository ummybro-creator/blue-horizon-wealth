import { ArrowUpCircle, ArrowDownCircle, TrendingUp, Gift, Users } from 'lucide-react';
import { mockTransactions } from '@/data/mockData';
import { cn } from '@/lib/utils';

const transactionIcons = {
  recharge: ArrowUpCircle,
  withdraw: ArrowDownCircle,
  income: TrendingUp,
  bonus: Gift,
  referral: Users,
};

const transactionColors = {
  recharge: 'text-primary bg-primary/10',
  withdraw: 'text-destructive bg-destructive/10',
  income: 'text-success bg-success/10',
  bonus: 'text-accent bg-accent/10',
  referral: 'text-primary bg-primary/10',
};

export function RecentTransactions() {
  const recentTransactions = mockTransactions.slice(0, 4);

  return (
    <div className="mx-4 mt-6 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <button className="text-sm text-primary font-medium">View All</button>
      </div>
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        {recentTransactions.map((transaction, index) => {
          const Icon = transactionIcons[transaction.type];
          const colorClass = transactionColors[transaction.type];
          const isPositive = ['income', 'bonus', 'referral', 'recharge'].includes(transaction.type);

          return (
            <div 
              key={transaction.id}
              className={cn(
                "flex items-center gap-3 p-4",
                index !== recentTransactions.length - 1 && "border-b border-border"
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClass)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground capitalize">{transaction.type}</p>
                <p className="text-xs text-muted-foreground">
                  {transaction.createdAt.toLocaleDateString('en-IN', { 
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-semibold",
                  isPositive ? "text-success" : "text-foreground"
                )}>
                  {isPositive ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                </p>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  transaction.status === 'approved' && "bg-success/10 text-success",
                  transaction.status === 'pending' && "bg-warning/10 text-warning",
                  transaction.status === 'rejected' && "bg-destructive/10 text-destructive"
                )}>
                  {transaction.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
