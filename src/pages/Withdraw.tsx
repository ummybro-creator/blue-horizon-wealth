import { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
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
  const withdrawableBalance = wallet?.total_balance || 0;

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
      toast.success('Withdrawal request submitted!', { description: 'Your request will be processed within 24-48 hours.' });
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit withdrawal request');
    }
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto app-bg">
      <div className="clay-header pt-12 pb-8 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Withdraw</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Balance Card */}
        <div className="clay-card p-5 -mt-4 animate-slide-up">
          <p className="text-muted-foreground text-sm mb-1">Withdrawable Balance</p>
          <h2 className="text-3xl font-extrabold text-primary">
            ₹{withdrawableBalance.toLocaleString('en-IN')}
          </h2>
        </div>

        {/* Info Alert */}
        <div className="clay-card p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">Withdrawal Rules</p>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• Minimum withdrawal: ₹{minimumWithdrawal}</li>
                <li>• Processing time: 24-48 hours</li>
                <li>• Withdrawals to your registered bank/UPI</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="clay-card p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-bold text-foreground mb-4">Enter Amount</h3>
          <Input
            type="number"
            placeholder="Enter withdrawal amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-14 text-xl font-semibold rounded-2xl clay-inset border-none"
          />
          <button
            className="text-primary text-sm font-semibold mt-2"
            onClick={() => setAmount(withdrawableBalance.toString())}
          >
            Withdraw All
          </button>
        </div>

        {/* Bank Details */}
        <div className="clay-card p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-bold text-foreground mb-3">Withdrawal To</h3>
          <div className="clay-inset p-3">
            {bankDetails?.upi_id ? (
              <>
                <p className="font-semibold text-foreground">UPI</p>
                <p className="text-sm text-muted-foreground">{bankDetails.upi_id}</p>
              </>
            ) : bankDetails?.account_number ? (
              <>
                <p className="font-semibold text-foreground">{bankDetails.bank_name || 'Bank Account'}</p>
                <p className="text-sm text-muted-foreground">
                  A/C: XXXX XXXX {bankDetails.account_number.slice(-4)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No bank details added</p>
            )}
          </div>
          <button
            className="text-primary text-sm font-semibold mt-2"
            onClick={() => navigate('/bank-details')}
          >
            {bankDetails ? 'Change Bank Details' : 'Add Bank Details'}
          </button>
        </div>

        {/* Submit */}
        <button
          className="w-full clay-button py-4 text-base font-bold transition-all active:scale-[0.97] disabled:opacity-50"
          onClick={handleSubmit}
          disabled={!amount || parseInt(amount) < minimumWithdrawal || createWithdrawal.isPending}
        >
          {createWithdrawal.isPending ? 'Submitting...' : 'Submit Withdrawal Request'}
        </button>
      </div>
    </div>
  );
};

export default Withdraw;
