import { useState } from 'react';
import { X, Gift, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const bonusTiers = [
  { deposit: 100, bonus: 30 },
  { deposit: 500, bonus: 175 },
  { deposit: 1000, bonus: 350 },
  { deposit: 5000, bonus: 2000 },
  { deposit: 8000, bonus: 2300 },
  { deposit: 10000, bonus: 2800 },
];

const ORANGE = '#FF6A1A';
const ORANGE_DARK = '#F25A00';
const GRAD = `linear-gradient(135deg, ${ORANGE} 0%, #FF8A3D 100%)`;

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
  const navigate = useNavigate();
  const [noReminder, setNoReminder] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = () => {
    onClose();
    navigate('/recharge');
  };

  const handleClose = () => {
    if (noReminder) sessionStorage.setItem('hidePopupToday', 'true');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(30,10,0,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        fontFamily: "'Poppins', 'Inter', sans-serif",
      }}
    >
      <div
        className="w-full max-w-[300px] animate-scale-in overflow-hidden relative"
        style={{
          borderRadius: 22,
          background: '#fff',
          boxShadow: '0 20px 50px rgba(242,90,0,0.30), 0 6px 20px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div
          className="relative px-4 pt-4 pb-6 text-center overflow-hidden"
          style={{ background: GRAD }}
        >
          {/* soft decorative circles */}
          <div
            className="absolute -top-6 -left-6 w-24 h-24 rounded-full"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          />
          <div
            className="absolute -bottom-8 -right-5 w-28 h-28 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />
          <Sparkles
            className="absolute top-3 left-4 w-3.5 h-3.5 text-white/60"
          />
          <Sparkles
            className="absolute bottom-5 right-7 w-3 h-3 text-white/50"
          />

          <button
            onClick={handleClose}
            className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90"
            style={{ background: 'rgba(255,255,255,0.22)' }}
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>

          <div
            className="mx-auto mb-2.5 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.20)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.30)',
            }}
          >
            <Gift className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-white font-extrabold text-[16px] leading-tight tracking-tight">
            First Deposit Bonus
          </h2>
          <p className="text-white/80 text-[10px] mt-0.5 font-medium">
            Claim once — bigger deposit, bigger reward
          </p>
        </div>

        {/* Tiers card */}
        <div
          className="relative -mt-4 mx-2.5 rounded-xl bg-white"
          style={{ boxShadow: '0 4px 16px rgba(242,90,0,0.10)' }}
        >
          <div className="px-3 py-1.5">
            {bonusTiers.map((tier, index) => (
              <div key={tier.deposit}>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold"
                      style={{ background: '#FFF3E6', color: ORANGE_DARK }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-800 leading-none">
                        Deposit{' '}
                        <span style={{ color: ORANGE_DARK }}>
                          ₹{tier.deposit.toLocaleString('en-IN')}
                        </span>
                      </p>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        Get extra bonus reward
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[12px] font-extrabold"
                      style={{ color: ORANGE_DARK }}
                    >
                      +₹{tier.bonus}
                    </span>
                    <button
                      onClick={handleDeposit}
                      className="px-2.5 py-1 rounded-full text-[9.5px] font-bold text-white transition active:scale-95"
                      style={{
                        background: GRAD,
                        boxShadow: '0 3px 8px rgba(242,90,0,0.28)',
                      }}
                    >
                      Claim
                    </button>
                  </div>
                </div>

                {index < bonusTiers.length - 1 && (
                  <div className="border-b border-dashed border-orange-100" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3.5 pt-2.5 pb-3 flex items-center justify-between">
          <label
            className="flex items-center gap-1.5 cursor-pointer select-none"
            onClick={() => setNoReminder(!noReminder)}
          >
            <div
              className="w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: noReminder ? ORANGE : '#D1D5DB',
                background: noReminder ? ORANGE : 'transparent',
              }}
            >
              {noReminder && (
                <svg viewBox="0 0 12 12" className="w-2 h-2 text-white">
                  <path d="M2 6l2.5 2.5L10 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-[9.5px] text-gray-500 font-medium">
              Don't show again today
            </span>
          </label>

          <button
            onClick={handleDeposit}
            className="px-3 py-1.5 rounded-full text-[10.5px] font-extrabold text-white transition active:scale-95"
            style={{
              background: GRAD,
              boxShadow: '0 4px 10px rgba(242,90,0,0.30)',
            }}
          >
            Deposit Now →
          </button>
        </div>
      </div>
    </div>
  );
}
