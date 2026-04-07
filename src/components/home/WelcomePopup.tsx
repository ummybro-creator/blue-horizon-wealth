import { useState } from 'react';
import { X } from 'lucide-react';
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
];

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
  const navigate = useNavigate();
  const [noReminder, setNoReminder] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = () => { onClose(); navigate('/recharge'); };

  const handleClose = () => {
    if (noReminder) sessionStorage.setItem('hidePopupToday', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-[300px] animate-scale-in overflow-hidden rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="relative px-4 pt-4 pb-3"
          style={{ background: 'linear-gradient(135deg, hsl(140,52%,43%) 0%, hsl(142,71%,45%) 100%)' }}>
          <button onClick={handleClose}
            className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white">
            <X className="w-3 h-3" />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-extrabold text-white flex items-center justify-center gap-1.5">
              🎁 First Deposit Bonus
            </h2>
            <p className="text-white/75 text-[10px] mt-0.5">Each account can claim once</p>
          </div>
        </div>

        {/* Tiers */}
        <div className="bg-white px-3 py-2 space-y-0">
          {bonusTiers.map((tier, index) => (
            <div key={tier.deposit}>
              <div className="flex items-center justify-between py-1.5">
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Deposit <span className="text-red-500">₹{tier.deposit.toLocaleString('en-IN')}</span>
                  </p>
                  <p className="text-[10px] text-gray-400">Get extra bonus reward</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-red-500">+₹{tier.bonus}</span>
                  <button onClick={handleDeposit}
                    className="px-3 py-1 rounded-full text-[10px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(140,52%,43%), hsl(142,71%,45%))' }}>
                    Deposit
                  </button>
                </div>
              </div>
              {index < bonusTiers.length - 1 && (
                <div className="border-b border-dashed border-green-200" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-white px-3 pb-3 pt-1 flex items-center justify-between border-t border-gray-100">
          <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setNoReminder(!noReminder)}>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${noReminder ? 'border-primary bg-primary' : 'border-gray-400'}`}>
              {noReminder && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <span className="text-[10px] text-gray-500">No more reminders today</span>
          </label>
          <button onClick={handleDeposit}
            className="px-4 py-1.5 rounded-full text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, hsl(140,52%,43%), hsl(142,71%,45%))' }}>
            Deposit Now
          </button>
        </div>
      </div>
    </div>
  );
}
