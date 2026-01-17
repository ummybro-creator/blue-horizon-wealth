import { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { mockWallet } from '@/data/mockData';

const MINIMUM_WITHDRAWAL = 500;

const Withdraw = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    const withdrawAmount = parseInt(amount);
    
    if (!amount || withdrawAmount < MINIMUM_WITHDRAWAL) {
      toast.error(`Minimum withdrawal amount is ₹${MINIMUM_WITHDRAWAL}`);
      return;
    }
    
    if (withdrawAmount > mockWallet.withdrawableBalance) {
      toast.error('Insufficient withdrawable balance');
      return;
    }

    toast.success('Withdrawal request submitted!', {
      description: 'Your request will be processed within 24-48 hours.',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="gradient-header pt-12 pb-6 px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Withdraw</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Balance Card */}
        <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up">
          <p className="text-muted-foreground text-sm mb-1">Withdrawable Balance</p>
          <h2 className="text-3xl font-bold text-primary">
            ₹{mockWallet.withdrawableBalance.toLocaleString('en-IN')}
          </h2>
        </div>

        {/* Info Alert */}
        <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Withdrawal Rules</p>
            <ul className="text-muted-foreground mt-1 space-y-1">
              <li>• Minimum withdrawal: ₹{MINIMUM_WITHDRAWAL}</li>
              <li>• Processing time: 24-48 hours</li>
              <li>• Withdrawals are processed to your registered bank/UPI</li>
            </ul>
          </div>
        </div>

        {/* Amount Input */}
        <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold text-foreground mb-4">Enter Amount</h3>
          <Input
            type="number"
            placeholder="Enter withdrawal amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-14 text-xl font-semibold"
          />
          <button 
            className="text-primary text-sm font-medium mt-2"
            onClick={() => setAmount(mockWallet.withdrawableBalance.toString())}
          >
            Withdraw All
          </button>
        </div>

        {/* Bank Details Preview */}
        <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-semibold text-foreground mb-3">Withdrawal To</h3>
          <div className="bg-secondary/50 rounded-xl p-3">
            <p className="font-medium text-foreground">State Bank of India</p>
            <p className="text-sm text-muted-foreground">A/C: XXXX XXXX 4567</p>
          </div>
          <button 
            className="text-primary text-sm font-medium mt-2"
            onClick={() => navigate('/bank-details')}
          >
            Change Bank Details
          </button>
        </div>

        {/* Submit Button */}
        <Button 
          variant="gradient" 
          size="xl" 
          className="w-full"
          onClick={handleSubmit}
          disabled={!amount || parseInt(amount) < MINIMUM_WITHDRAWAL}
        >
          Submit Withdrawal Request
        </Button>
      </div>
    </div>
  );
};

export default Withdraw;
