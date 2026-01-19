import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSettings } from '@/hooks/useAppSettings';

const quickAmounts = [799, 299, 699, 1099, 1999, 8500];

const Recharge = () => {
  const navigate = useNavigate();
  const { wallet } = useAuth();
  const { data: settings } = useAppSettings();
  const [amount, setAmount] = useState('');

  const handleRechargeNow = () => {
    const amountNum = parseInt(amount);
    const minRecharge = settings?.minimum_recharge || 100;
    
    if (!amount || amountNum < minRecharge) {
      toast.error(`Minimum recharge amount is ₹${minRecharge}`);
      return;
    }
    
    // Navigate to payment page with amount
    navigate(`/payment?amount=${amountNum}`);
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-primary pt-12 pb-8 px-4 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Recharge</h1>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-foreground/10 rounded-xl p-4 border border-primary-foreground/20">
            <p className="text-3xl font-bold text-primary-foreground">
              ₹{wallet?.total_balance?.toLocaleString('en-IN') || 0}
            </p>
            <p className="text-sm text-primary-foreground/70">Current Balance</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-4 border border-primary-foreground/20">
            <p className="text-3xl font-bold text-primary-foreground">
              ₹{wallet?.recharge_balance?.toLocaleString('en-IN') || 0}
            </p>
            <p className="text-sm text-primary-foreground/70">Recharge Balance</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Enter Amount */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Enter Amount</h3>
          <Input
            type="number"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-14 text-lg bg-card border-border"
          />
        </div>

        {/* Quick Amount */}
        <div>
          <h3 className="font-semibold text-primary mb-3">Quick Amount</h3>
          <div className="grid grid-cols-3 gap-3">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className={`py-3 rounded-xl font-semibold transition-all duration-200 border-2 ${
                  amount === amt.toString()
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        {/* Online Channel */}
        <div>
          <h3 className="font-semibold text-primary mb-3">Online Channel</h3>
          <div className="bg-primary rounded-xl p-4 flex items-center justify-between">
            <span className="text-primary-foreground font-medium">PAYMENT 001</span>
            <div className="w-5 h-5 rounded-full border-2 border-primary-foreground flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary-foreground"></div>
            </div>
          </div>
        </div>

        {/* Recharge Now Button */}
        <Button 
          onClick={handleRechargeNow}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          Recharge Now
        </Button>
      </div>
    </div>
  );
};

export default Recharge;
