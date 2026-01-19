import { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useCreateWithdrawal } from '@/hooks/useWithdrawals';
import { useBankDetails } from '@/hooks/useBankDetails';

const Withdraw = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const { wallet } = useAuth();
  const { data: settings } = useAppSettings();
  const { data: bankDetails } = useBankDetails();
  const createWithdrawal = useCreateWithdrawal();

  const minimumWithdrawal = settings?.minimum_withdrawal || 500;
  const withdrawableBalance = wallet?.withdrawable_balance || 0;

  const handleSubmit = async () => {
    const withdrawAmount = parseInt(amount);
    
    if (!amount || withdrawAmount < minimumWithdrawal) {
      toast.error(`Minimum withdrawal amount is ₹${minimumWithdrawal}`);
      return;
    }
    
    if (withdrawAmount > withdrawableBalance) {
      toast.error('Insufficient withdrawable balance');
      return;
    }

    if (!bankDetails?.upi_id && !bankDetails?.account_number) {
      toast.error('Please add your bank details first');
      navigate('/bank-details');
      return;
    }

    try {
      await createWithdrawal.mutateAsync({ amount: withdrawAmount });
      toast.success('Withdrawal request submitted!', {
        description: 'Your request will be processed within 24-48 hours.',
      });
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit withdrawal request');
    }
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
            ₹{withdrawableBalance.toLocaleString('en-IN')}
          </h2>
        </div>

        {/* Info Alert */}
        <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Withdrawal Rules</p>
            <ul className="text-muted-foreground mt-1 space-y-1">
              <li>• Minimum withdrawal: ₹{minimumWithdrawal}</li>
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
            onClick={() => setAmount(withdrawableBalance.toString())}
          >
            Withdraw All
          </button>
        </div>

        {/* Bank Details Preview */}
        <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-semibold text-foreground mb-3">Withdrawal To</h3>
          <div className="bg-secondary/50 rounded-xl p-3">
            {bankDetails?.upi_id ? (
              <>
                <p className="font-medium text-foreground">UPI</p>
                <p className="text-sm text-muted-foreground">{bankDetails.upi_id}</p>
              </>
            ) : bankDetails?.account_number ? (
              <>
                <p className="font-medium text-foreground">{bankDetails.bank_name || 'Bank Account'}</p>
                <p className="text-sm text-muted-foreground">
                  A/C: XXXX XXXX {bankDetails.account_number.slice(-4)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No bank details added</p>
            )}
          </div>
          <button 
            className="text-primary text-sm font-medium mt-2"
            onClick={() => navigate('/bank-details')}
          >
            {bankDetails ? 'Change Bank Details' : 'Add Bank Details'}
          </button>
        </div>

        {/* Submit Button */}
        <Button 
          variant="gradient" 
          size="xl" 
          className="w-full"
          onClick={handleSubmit}
          disabled={!amount || parseInt(amount) < minimumWithdrawal || createWithdrawal.isPending}
        >
          {createWithdrawal.isPending ? 'Submitting...' : 'Submit Withdrawal Request'}
        </Button>
      </div>
    </div>
  );
};

export default Withdraw;