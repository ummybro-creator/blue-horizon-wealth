import { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useCreateRecharge, useUpdateRechargeUTR } from '@/hooks/useRecharges';

const TIMER_DURATION = 10 * 60;

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount') || '0';

  const { data: settings } = useAppSettings();
  const createRecharge = useCreateRecharge();
  const updateRechargeUTR = useUpdateRechargeUTR();

  const [utrNumber, setUtrNumber] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [rechargeId, setRechargeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref guards prevent duplicate recharge creation on StrictMode double-invoke or remounts
  const creatingRef = useRef(false);
  const rechargeIdRef = useRef<string | null>(null);

  // Create recharge record once on mount
  useEffect(() => {
    if (!amount || amount === '0') return;
    if (creatingRef.current || rechargeIdRef.current) return;
    creatingRef.current = true;

    createRecharge
      .mutateAsync({ amount: parseInt(amount) })
      .then((result) => {
        rechargeIdRef.current = result.id;
        setRechargeId(result.id);
      })
      .catch(() => {
        toast.error('Failed to create recharge request');
        navigate('/recharge');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Single interval for the countdown — does NOT depend on timeLeft so it's created once
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Session expired. Please try again.');
          navigate('/recharge');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // Clean up on unmount (e.g. user navigates back) — prevents memory leak / stuck state
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const upiId = settings?.payment_upi_id || '';
  const appName = settings?.app_name || 'Recharge';

  // Build unique UPI intent URL with amount + unique transaction reference
  const upiUri = useMemo(() => {
    if (!upiId) return '';
    const tr = rechargeId ? rechargeId.replace(/-/g, '').slice(0, 20) : `TXN${Date.now()}`;
    const params = new URLSearchParams({
      pa: upiId,
      pn: appName,
      am: String(parseInt(amount || '0')),
      cu: 'INR',
      tn: `Recharge ${tr}`,
      tr,
    });
    return `upi://pay?${params.toString()}`;
  }, [upiId, appName, amount, rechargeId]);

  const qrImageUrl = useMemo(() => {
    if (!upiUri) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiUri)}`;
  }, [upiUri]);

  const handleSubmit = async () => {
    if (!utrNumber.trim()) {
      toast.error('Please enter UTR/Reference Number');
      return;
    }
    if (!rechargeId) {
      toast.error('Recharge request not found. Please try again.');
      navigate('/recharge');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateRechargeUTR.mutateAsync({ rechargeId, utrNumber: utrNumber.trim() });
      toast.success('Recharge request submitted!', {
        description: 'Your request will be processed within 24 hours.',
      });
      navigate('/');
    } catch {
      toast.error('Failed to submit recharge request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!amount || amount === '0') {
    navigate('/recharge');
    return null;
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-primary pt-12 pb-8 px-4 text-center relative">
        <button
          onClick={() => navigate('/recharge')}
          className="absolute left-4 top-12 w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-primary-foreground" />
        </button>

        <p className="text-primary-foreground/80 text-sm mb-1">Payment Amount</p>
        <h1 className="text-4xl font-bold text-primary-foreground mb-4">
          ₹{parseInt(amount).toLocaleString('en-IN')}
        </h1>

        <div className="inline-flex items-center gap-2 bg-primary-foreground/20 rounded-full px-4 py-2">
          <Clock className="w-4 h-4 text-primary-foreground" />
          <span className="text-primary-foreground font-mono text-lg">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* QR Code Card */}
        <div className="bg-card rounded-2xl p-6 border border-border flex flex-col items-center">
          <h3 className="font-semibold text-foreground mb-1">Scan QR Code to Pay</h3>
          <p className="text-xs text-muted-foreground mb-4 text-center">
            Amount is pre-filled. Just scan and pay with any UPI app.
          </p>

          <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center mb-4 border border-border overflow-hidden">
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="Payment QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-sm text-muted-foreground text-center px-4">
                Generating QR...
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="font-semibold text-foreground text-lg">
              ₹{parseInt(amount).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Pay with GPay, PhonePe, Paytm or any UPI app
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Payment can only be made once. Multiple payments are not valid!!!
          </p>
        </div>

        {/* UTR Input */}
        <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
          <h3 className="font-semibold text-foreground">
            Submit UTR / Reference No. after payment
          </h3>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="UTR (UPI Ref. ID)"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              className="flex-1 h-12"
            />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !rechargeId}
              className="h-12 px-6 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
