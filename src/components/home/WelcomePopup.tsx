import { X, Info, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-6">
      <div className="bg-card rounded-2xl shadow-elevated max-w-xs w-full animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="relative flex items-center justify-between px-4 pt-4 pb-2">
          <Info className="w-5 h-5 text-muted-foreground" />
          <div className="bg-primary rounded-full px-4 py-1.5">
            <span className="text-primary-foreground font-bold text-sm">Platform Information</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-3 text-center text-sm">
          <p className="text-foreground">
            1. Platform launch time: <span className="text-primary font-semibold">17 March – 2026</span>
          </p>
          <p className="text-foreground">
            2. Sign-up Bonus: <span className="text-primary font-semibold">₹5</span>
          </p>
          <p className="text-foreground">
            3. Daily Gift Code: <span className="text-primary font-semibold">₹12 to ₹200 (Need Plan)</span>
          </p>
          <p className="text-foreground">
            4. Level 3 agent commission cashback:<br />
            1st Level: <span className="text-primary font-semibold">13% Happy Earning</span>
          </p>
          <p className="text-foreground">
            5. Income: <span className="text-primary font-semibold">Daily Income Daily Withdrawal</span>
          </p>
          <p className="text-foreground">
            6. Minimum Withdrawal is: <span className="text-primary font-semibold">₹150 – ₹10000</span>
          </p>
          <p className="text-foreground">
            7. Number of withdrawals: <span className="text-primary font-semibold">Unlimited</span>
          </p>
        </div>

        {/* Button */}
        <div className="px-5 pb-5">
          <Button
            variant="gradient"
            className="w-full h-11 rounded-full"
            onClick={() => window.open('https://t.me/tatateaofficial', '_blank')}
          >
            <Send className="w-4 h-4 mr-2" />
            Telegram Channel
          </Button>
        </div>
      </div>
    </div>
  );
}
