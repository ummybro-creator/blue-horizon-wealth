import { useState } from 'react';
import { X, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const bonusTiers = [
  { deposit: 100, bonus: 30, percent: 30 },
  { deposit: 500, bonus: 175, percent: 35 },
  { deposit: 1000, bonus: 350, percent: 35 },
  { deposit: 5000, bonus: 2000, percent: 40 },
  { deposit: 10000, bonus: 4000, percent: 40 },
];

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
  const navigate = useNavigate();
  const [noReminder, setNoReminder] = useState(false);

  if (!isOpen) return null;

  const handleActivity = () => {
    onClose();
    navigate('/recharge');
  };

  const handleClose = () => {
    if (noReminder) {
      sessionStorage.setItem('hidePopupToday', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-[340px] animate-scale-in overflow-hidden"
        style={{ borderRadius: '20px' }}
      >
        {/* Header with gradient */}
        <div
          className="relative px-5 pt-5 pb-4"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(142, 71%, 45%) 100%)',
          }}
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-extrabold text-white flex items-center justify-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center">🎁</span>
              Extra First Deposit Bonus
            </h2>
            <p className="text-white/80 text-xs mt-1">* Each account can claim reward once</p>
          </div>
        </div>

        {/* Bonus Tiers */}
        <div className="bg-white px-4 py-3 space-y-0">
          {bonusTiers.map((tier, index) => (
            <div key={tier.deposit}>
              {/* Progress bar row */}
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-300 rounded-full flex items-center pl-2">
                    <span className="text-[9px] text-white font-medium">0/{tier.deposit}</span>
                  </div>
                </div>
                <button
                  onClick={handleActivity}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:shadow-md active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(142, 71%, 45%))',
                    color: 'white',
                  }}
                >
                  Deposit
                </button>
              </div>

              {/* Info row */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    First deposit <span className="text-destructive">{tier.deposit.toLocaleString('en-IN')}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Deposit {tier.deposit.toLocaleString('en-IN')} for the first time and you can receive {tier.bonus.toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="text-destructive font-extrabold text-base whitespace-nowrap ml-2">
                  + ₹{tier.bonus.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Dashed separator */}
              {index < bonusTiers.length - 1 && (
                <div className="border-b border-dashed border-primary/30 my-2.5" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="bg-white px-4 pb-4 pt-2 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setNoReminder(!noReminder)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                noReminder ? 'border-primary bg-primary' : 'border-muted-foreground'
              }`}
            >
              {noReminder && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <span className="text-xs text-muted-foreground">No more reminders today</span>
          </label>

          <button
            onClick={handleActivity}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(142, 71%, 45%))',
            }}
          >
            Activity
          </button>
        </div>
      </div>
    </div>
  );
}
