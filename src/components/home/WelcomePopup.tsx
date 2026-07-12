import { useState } from 'react';
import { X, Gift } from 'lucide-react';
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

export function WelcomePopup({
  isOpen,
  onClose,
}: WelcomePopupProps) {
  const navigate = useNavigate();
  const [noReminder, setNoReminder] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = () => {
    onClose();
    navigate("/recharge");
  };

  const handleClose = () => {
    if (noReminder) {
      sessionStorage.setItem("hidePopupToday", "true");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-md p-5">

      <div className="w-full max-w-[360px] rounded-[28px] bg-white shadow-2xl overflow-hidden animate-scale-in">

        {/* Header */}
        <div className="relative px-6 py-6 border-b border-gray-100">

          <button
            onClick={handleClose}
            className="absolute right-5 top-5 h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">

            <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center">
              <Gift
                size={28}
                className="text-[#FF5A14]"
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                First Deposit Bonus
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Each account can claim once
              </p>
            </div>

          </div>
        </div>

        {/* Bonus List */}
        <div className="p-5 space-y-3">

          {bonusTiers.map((tier) => (

            <div
              key={tier.deposit}
              className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between"
            >

              <div>

                <h3 className="font-semibold text-gray-900">
                  Deposit ₹{tier.deposit.toLocaleString("en-IN")}
                </h3>

                <p className="text-sm text-gray-400">
                  Get extra bonus reward
                </p>

              </div>

              <div className="text-right">

                <p className="text-xl font-bold text-[#FF5A14]">
                  +₹{tier.bonus.toLocaleString("en-IN")}
                </p>

                <button
                  onClick={handleDeposit}
                  className="mt-2 px-5 py-2 rounded-full border border-[#FF5A14] text-[#FF5A14] font-semibold hover:bg-orange-50 transition"
                >
                  Deposit
                </button>

              </div>

            </div>

          ))}

        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between">

          <label
            onClick={() => setNoReminder(!noReminder)}
            className="flex items-center gap-3 cursor-pointer"
          >

            <div
              className={`w-5 h-5 rounded-full border-2 ${
                noReminder
                  ? "border-[#FF5A14] bg-[#FF5A14]"
                  : "border-gray-300"
              }`}
            />

            <span className="text-sm text-gray-500">
              No more reminders today
            </span>

          </label>

          <button
            onClick={handleDeposit}
            className="rounded-full bg-[#FF5A14] px-7 py-3 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            Deposit Now
          </button>

        </div>

      </div>

    </div>
  );
}
