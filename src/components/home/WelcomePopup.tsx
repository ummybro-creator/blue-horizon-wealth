import { X, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const bonusTiers = [
  { deposit: 300, bonus: 7 },
  { deposit: 500, bonus: 30 },
  { deposit: 700, bonus: 50 },
  { deposit: 1000, bonus: 80 },
  { deposit: 1500, bonus: 200 },
  { deposit: 2000, bonus: 500 },
];

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGotIt = () => {
    onClose();
    navigate('/recharge');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30 p-6">
      <div className="clay-card-lg max-w-[300px] w-full animate-scale-in overflow-hidden p-4 relative" style={{ borderRadius: '24px' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="w-12 h-12 rounded-xl clay-button flex items-center justify-center mx-auto mb-2">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-base font-extrabold text-foreground">🎉 First Deposit Bonus</h2>
          <p className="text-[10px] text-destructive font-bold mt-1">Limited Time Offer</p>
        </div>

        {/* Bonus Tiers */}
        <div className="space-y-1.5">
          {bonusTiers.map((tier) => (
            <div
              key={tier.deposit}
              className="clay-inset flex items-center justify-between px-3 py-2"
            >
              <span className="text-xs font-medium text-foreground">
                Deposit <span className="font-bold">₹{tier.deposit}</span>
              </span>
              <span className="text-xs font-extrabold text-primary">
                +₹{tier.bonus}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleGotIt}
          className="w-full mt-3 clay-button py-2.5 text-sm font-bold"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
