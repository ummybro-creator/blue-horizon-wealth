import { X, Gift, Sparkles } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30 p-4">
      <div className="clay-card-lg max-w-sm w-full animate-scale-in overflow-hidden p-5 max-h-[72vh] overflow-y-auto mb-20" style={{ borderRadius: '28px' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-2xl clay-button flex items-center justify-center mx-auto mb-3">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground">🎉 First Deposit Bonus</h2>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Limited Time Offer
          </div>
        </div>

        {/* Bonus Tiers */}
        <div className="space-y-2.5">
          {bonusTiers.map((tier) => (
            <div
              key={tier.deposit}
              className="clay-inset flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm font-medium text-foreground">
                Deposit <span className="font-bold">₹{tier.deposit}</span>
              </span>
              <span className="text-sm font-extrabold text-primary">
                +₹{tier.bonus} Bonus
              </span>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Bonus applies ONLY to your first deposit
        </p>

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 clay-button py-3.5 text-sm font-bold"
        >
          Got It!
        </button>
      </div>
    </div>
  );
}
