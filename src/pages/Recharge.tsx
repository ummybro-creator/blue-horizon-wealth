import { useState } from 'react';
import { ArrowLeft, Copy, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const UPI_ID = 'investment@paytm';

const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

const Recharge = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success('UPI ID copied to clipboard!');
  };

  const handleSubmit = () => {
    if (!amount || parseInt(amount) < 100) {
      toast.error('Minimum recharge amount is ₹100');
      return;
    }
    if (!transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }
    toast.success('Recharge request submitted!', {
      description: 'Your request will be processed within 24 hours.',
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
          <h1 className="text-xl font-bold text-primary-foreground">Recharge Wallet</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* UPI Section */}
        <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up">
          <h3 className="font-semibold text-foreground mb-4">Pay via UPI</h3>
          
          {/* QR Code Placeholder */}
          <div className="bg-secondary rounded-xl p-6 flex flex-col items-center mb-4">
            <div className="w-40 h-40 bg-background rounded-xl flex items-center justify-center mb-3">
              <QrCode className="w-24 h-24 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Scan to pay</p>
          </div>

          {/* UPI ID */}
          <div className="flex items-center gap-2 bg-secondary rounded-xl p-3">
            <span className="flex-1 font-mono text-foreground">{UPI_ID}</span>
            <Button variant="outline" size="sm" onClick={copyUPI}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Amount Selection */}
        <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold text-foreground mb-4">Select Amount</h3>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className={`py-3 rounded-xl font-semibold transition-all duration-200 ${
                  amount === amt.toString()
                    ? 'gradient-primary text-primary-foreground shadow-button'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          <Input
            type="number"
            placeholder="Enter custom amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-12 text-lg"
          />
        </div>

        {/* Transaction ID */}
        <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold text-foreground mb-4">Transaction Details</h3>
          <Input
            type="text"
            placeholder="Enter UPI Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="h-12"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Enter the 12-digit UPI transaction reference number
          </p>
        </div>

        {/* Submit Button */}
        <Button 
          variant="gradient" 
          size="xl" 
          className="w-full"
          onClick={handleSubmit}
        >
          Submit Recharge Request
        </Button>
      </div>
    </div>
  );
};

export default Recharge;
