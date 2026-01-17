import { TrendingUp, Clock } from 'lucide-react';
import { mockInvestments } from '@/data/mockData';

export function ActiveInvestments() {
  const activeInvestments = mockInvestments.filter(inv => inv.status === 'active');

  if (activeInvestments.length === 0) return null;

  return (
    <div className="mx-4 mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="text-lg font-semibold text-foreground mb-3">Active Investments</h3>
      <div className="space-y-3">
        {activeInvestments.map((investment) => {
          const daysRemaining = Math.ceil(
            (investment.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          const progress = ((30 - daysRemaining) / 30) * 100;

          return (
            <div 
              key={investment.id} 
              className="bg-card rounded-xl p-4 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{investment.product.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{daysRemaining} days remaining</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-success font-semibold">+₹{investment.product.dailyIncome}/day</p>
                  <p className="text-xs text-muted-foreground">Earned: ₹{investment.totalEarned}</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
