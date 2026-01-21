import { Wallet, TrendingUp, Gift, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function WalletCard() {
  const navigate = useNavigate();
  const { wallet } = useAuth();

  return (
    <div className="mx-4 -mt-20 relative z-10 animate-slide-up">
      <div className="bg-card rounded-2xl shadow-elevated p-5">
        {/* Total Balance */}
        <div className="text-center mb-5">
          <p className="text-muted-foreground text-sm font-medium mb-1">Total Balance</p>
          <h2 className="text-3xl font-bold text-foreground">
            ₹{(wallet?.total_balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
        </div>

        {/* Balance Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Recharge</span>
            </div>
            <p className="font-semibold text-foreground">₹{(wallet?.recharge_balance ?? 0).toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Bonus</span>
            </div>
            <p className="font-semibold text-foreground">₹{(wallet?.bonus_balance ?? 0).toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Total Income</span>
            </div>
            <p className="font-semibold text-success">₹{(wallet?.total_income ?? 0).toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Withdrawable</span>
            </div>
            <p className="font-semibold text-foreground">₹{(wallet?.total_balance ?? 0).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="gradient" 
            className="flex-1"
            onClick={() => navigate('/recharge')}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Recharge
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/withdraw')}
          >
            <ArrowDownCircle className="w-4 h-4" />
            Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
}
