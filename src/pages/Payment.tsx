import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Copy, QrCode, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useCreateRecharge, useUpdateRechargeUTR } from '@/hooks/useRecharges';

const TIMER_DURATION = 10 * 60; // 10 minutes in seconds

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount') || '0';
  
  const { data: settings, isLoading: settingsLoading } = useAppSettings();
  const createRecharge = useCreateRecharge();
  const updateRechargeUTR = useUpdateRechargeUTR();
  
  const [utrNumber, setUtrNumber] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [rechargeId, setRechargeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingRecharge, setIsCreatingRecharge] = useState(false);

  // Create recharge request when page loads
  useEffect(() => {
    const createRechargeRequest = async () => {
      if (!amount || amount === '0' || isCreatingRecharge || rechargeId) return;
      
      setIsCreatingRecharge(true);
      try {
        const result = await createRecharge.mutateAsync({ amount: parseInt(amount) });
        setRechargeId(result.id);
      } catch (error: any) {
        toast.error('Failed to create recharge request');
        navigate('/recharge');
      }
    };

    createRechargeRequest();
  }, [amount]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      toast.error('Session expired. Please try again.');
      navigate('/recharge');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  }, []);

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
      await updateRechargeUTR.mutateAsync({ 
        rechargeId, 
        utrNumber: utrNumber.trim() 
      });
      toast.success('Recharge request submitted!', {
        description: 'Your request will be processed within 24 hours.',
      });
      navigate('/');
    } catch (error: any) {
      toast.error('Failed to submit recharge request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const upiId = settings?.payment_upi_id || 'loading...';
  const qrCodeUrl = settings?.payment_qr_code_url;

  if (!amount || amount === '0') {
    navigate('/recharge');
    return null;
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-primary pt-12 pb-8 px-4 text-center">
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
        
        {/* Timer */}
        <div className="inline-flex items-center gap-2 bg-primary-foreground/20 rounded-full px-4 py-2">
          <Clock className="w-4 h-4 text-primary-foreground" />
          <span className="text-primary-foreground font-mono text-lg">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Payment Tabs */}
        <Tabs defaultValue="transfer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="transfer" className="text-primary data-[state=active]:text-primary">
              Direct Transfer
            </TabsTrigger>
            <TabsTrigger value="qr">Scan QRCode</TabsTrigger>
          </TabsList>

          <TabsContent value="transfer" className="space-y-4">
            {/* Payment Methods */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-3">Select Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-lg p-3 flex items-center gap-2 border border-border">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    PTM
                  </div>
                  <span className="text-sm font-medium">Paytm</span>
                </div>
                <div className="bg-secondary rounded-lg p-3 flex items-center gap-2 border border-border">
                  <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    PE
                  </div>
                  <span className="text-sm font-medium">Phonepe</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-400">⚠️</span>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Payment can only be made once. Multiple payments are not valid!!!
              </p>
            </div>

            {/* UPI Details */}
            <div className="bg-card rounded-xl p-4 border border-border space-y-4">
              <h3 className="font-semibold text-foreground">
                1. Transfer ₹{parseInt(amount).toLocaleString('en-IN')} to the following UPI
              </h3>
              
              {/* UPI ID */}
              <div className="flex items-center justify-between bg-secondary rounded-lg p-3 border border-border">
                <span className="font-mono text-foreground">{upiId}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(upiId, 'UPI ID')}
                  disabled={settingsLoading}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between bg-secondary rounded-lg p-3 border border-border">
                <span className="font-mono text-foreground">{amount} RS</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(amount, 'Amount')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* UTR Input */}
            <div className="bg-card rounded-xl p-4 border border-border space-y-3">
              <h3 className="font-semibold text-foreground">
                2. Submit Ref No/Reference No/UTR
              </h3>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="UTR(UPI Ref.ID)"
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

            {/* UPI Logos */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="text-2xl font-bold text-primary">UPI</div>
              <div className="text-2xl font-bold text-blue-600">BHIM</div>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            {/* QR Code */}
            <div className="bg-card rounded-xl p-6 border border-border flex flex-col items-center">
              <h3 className="font-semibold text-foreground mb-4">Scan QR Code to Pay</h3>
              
              <div className="w-48 h-48 bg-secondary rounded-xl flex items-center justify-center mb-4 border border-border">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="Payment QR Code" 
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <QrCode className="w-24 h-24 text-muted-foreground" />
                )}
              </div>
              
              <p className="text-muted-foreground text-sm text-center">
                Scan this QR code using any UPI app
              </p>
              
              <div className="mt-4 text-center">
                <p className="font-semibold text-foreground">Amount: ₹{parseInt(amount).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-400">⚠️</span>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Payment can only be made once. Multiple payments are not valid!!!
              </p>
            </div>

            {/* UTR Input */}
            <div className="bg-card rounded-xl p-4 border border-border space-y-3">
              <h3 className="font-semibold text-foreground">
                Submit Ref No/Reference No/UTR after payment
              </h3>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="UTR(UPI Ref.ID)"
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Payment;
