import { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useCreateWithdrawal } from '@/hooks/useWithdrawals';
import { useBankDetails } from '@/hooks/useBankDetails';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const ORANGE    = '#FF6A00';
const BTN_GRAD  = 'linear-gradient(135deg, #FF8A00 0%, #FF6A00 100%)';
const BTN_SHADOW = '0 10px 24px rgba(255,106,0,0.38)';

const CARD: React.CSSProperties = {
  background: '#FFFFFF',
  backdropFilter: 'blur(0px)',
  WebkitBackdropFilter: 'blur(0px)',
  boxShadow: '0 8px 24px rgba(17,24,39,0.08), 0 1px 3px rgba(17,24,39,0.05)',
  border: '1px solid #FFFFFF',
  borderRadius: 24,
  padding: '20px',
};

const Withdraw = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  const { wallet } = useAuth();
  const { data: settings } = useAppSettings();
  const { data: bankDetails } = useBankDetails();
  const createWithdrawal = useCreateWithdrawal();

  const minimumWithdrawal  = settings?.minimum_withdrawal || 500;
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
      toast.success('Withdrawal request submitted!', {
        description: 'Your request will be processed within 24-48 hours.',
      });
      navigate('/');
    } catch (error: any) {
      const raw: string = error?.message || 'Failed to submit withdrawal request';
      if (raw.includes('WITHDRAWAL_LOCKED')) {
        setLockMessage(raw.split('WITHDRAWAL_LOCKED:').pop()!.trim());
        return;
      }
      toast.error(raw);
    }
  };

  return (
    <AppLayout>
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        {/* Header */}
        <div className="clay-header pt-12 pb-8 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Withdraw</h1>
          </div>
        </div>

        <div className="px-4 py-5 space-y-4">
          {/* Balance Card */}
          <div style={{ ...CARD, marginTop: '-16px' }} className="animate-slide-up">
            <p className="text-sm mb-1" style={{ color: '#8A8A8A' }}>Withdrawable Balance</p>
            <h2 className="text-3xl font-extrabold" style={{ color: ORANGE }}>
              ₹{withdrawableBalance.toLocaleString('en-IN')}
            </h2>
          </div>

          {/* Info */}
          <div style={CARD} className="animate-slide-up">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: ORANGE }} />
              <div className="text-sm">
                <p className="font-semibold" style={{ color: '#2B2B2B' }}>Withdrawal Rules</p>
                <ul className="mt-1 space-y-1" style={{ color: '#8A8A8A' }}>
                  <li>• Minimum withdrawal: ₹{minimumWithdrawal}</li>
                  <li>• Processing time: 24-48 hours</li>
                  <li>• Withdrawals to your registered bank/UPI</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div style={CARD} className="animate-slide-up">
            <h3 className="font-bold mb-4" style={{ color: '#2B2B2B' }}>Enter Amount</h3>
            <input
              type="number"
              placeholder="Enter withdrawal amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-14 rounded-2xl px-4 text-xl font-semibold outline-none"
              style={{
                background: '#FFF4EE',
                border: '1px solid rgba(255,106,0,0.15)',
                color: '#2B2B2B',
                fontFamily: "'Poppins', sans-serif",
              }}
            />
            <button
              className="text-sm font-semibold mt-2"
              style={{ color: ORANGE }}
              onClick={() => setAmount(withdrawableBalance.toString())}
            >
              Withdraw All
            </button>
          </div>

          {/* Bank Details */}
          <div style={CARD} className="animate-slide-up">
            <h3 className="font-bold mb-3" style={{ color: '#2B2B2B' }}>Withdrawal To</h3>
            <div
              className="p-3 rounded-2xl"
              style={{ background: '#FFF4EE', border: '1px solid rgba(255,106,0,0.12)' }}
            >
              {bankDetails?.upi_id ? (
                <>
                  <p className="font-semibold" style={{ color: '#2B2B2B' }}>UPI</p>
                  <p className="text-sm" style={{ color: '#8A8A8A' }}>{bankDetails.upi_id}</p>
                </>
              ) : bankDetails?.account_number ? (
                <>
                  <p className="font-semibold" style={{ color: '#2B2B2B' }}>{bankDetails.bank_name || 'Bank Account'}</p>
                  <p className="text-sm" style={{ color: '#8A8A8A' }}>
                    A/C: XXXX XXXX {bankDetails.account_number.slice(-4)}
                  </p>
                </>
              ) : (
                <p className="text-sm" style={{ color: '#8A8A8A' }}>No bank details added</p>
              )}
            </div>
            <button
              className="text-sm font-semibold mt-2"
              style={{ color: ORANGE }}
              onClick={() => navigate('/bank-details')}
            >
              {bankDetails ? 'Change Bank Details' : 'Add Bank Details'}
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!amount || parseInt(amount) < minimumWithdrawal || createWithdrawal.isPending}
            className="w-full py-4 rounded-full text-base font-bold text-white transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ background: BTN_GRAD, boxShadow: BTN_SHADOW }}
          >
            {createWithdrawal.isPending ? 'Submitting...' : 'Submit Withdrawal Request'}
          </button>
        </div>
      </div>

      <Dialog open={!!lockMessage} onOpenChange={(o) => !o && setLockMessage(null)}>
        <DialogContent
          className="max-w-[320px] p-6 border-0"
          style={{ ...CARD, fontFamily: "'Poppins', sans-serif" }}
        >
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3"
              style={{ background: '#FFF4EE' }}
            >
              <AlertCircle className="w-7 h-7" style={{ color: ORANGE }} />
            </div>
            <h3 className="text-lg font-extrabold mb-2" style={{ color: '#2B2B2B' }}>
              Withdrawal Locked
            </h3>
            <p className="text-sm mb-5" style={{ color: '#8A8A8A' }}>
              {lockMessage}
            </p>
            <button
              onClick={() => { setLockMessage(null); navigate('/products'); }}
              className="w-full py-3 rounded-full font-bold text-white text-sm"
              style={{ background: BTN_GRAD, boxShadow: BTN_SHADOW }}
            >
              View VIP Plans
            </button>
            <button
              onClick={() => setLockMessage(null)}
              className="w-full py-3 mt-2 rounded-full font-semibold text-sm"
              style={{ background: '#FFF4EE', color: ORANGE }}
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Withdraw;
