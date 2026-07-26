import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const ORANGE    = '#FF6A00';
const BTN_GRAD  = 'linear-gradient(135deg, #FF8A00 0%, #FF6A00 100%)';
const BTN_SHADOW = '0 10px 24px rgba(255,106,0,0.38)';

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 8px 24px rgba(255,106,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.75)',
  borderRadius: 24,
  padding: '20px',
};

const Recharge = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | "">("");
  const { wallet } = useAuth();

  const handleRecharge = () => {
    if (!amount || amount < 298) {
      alert("Minimum recharge amount is ₹298");
      return;
    }
    navigate(`/payment?amount=${amount}`);
  };

  return (
    <AppLayout>
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        {/* Header */}
        <div className="clay-header pt-12 pb-8 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Recharge</h1>
          </div>
        </div>

        <div className="px-4 py-5 space-y-4">
          {/* Balance Cards */}
          <div className="grid grid-cols-2 gap-3 -mt-4">
            <div style={CARD}>
              <p className="text-xs font-medium" style={{ color: '#8A8A8A' }}>Current Balance</p>
              <p className="text-xl font-extrabold mt-1" style={{ color: ORANGE }}>
                ₹{wallet?.total_balance ?? 0}
              </p>
            </div>
            <div style={CARD}>
              <p className="text-xs font-medium" style={{ color: '#8A8A8A' }}>Recharge Balance</p>
              <p className="text-xl font-extrabold mt-1" style={{ color: ORANGE }}>
                ₹{wallet?.recharge_balance ?? 0}
              </p>
            </div>
          </div>

          {/* Amount Input */}
          <div style={CARD}>
            <label className="block text-sm font-bold mb-2" style={{ color: '#2B2B2B' }}>
              Enter Amount
            </label>
            <input
              type="number"
              placeholder="Recharge Amount"
              className="w-full h-12 rounded-2xl px-4 outline-none font-semibold"
              style={{
                background: '#FFF4EE',
                border: '1px solid rgba(255,106,0,0.15)',
                color: '#2B2B2B',
                fontFamily: "'Poppins', sans-serif",
              }}
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            />
            <p className="text-xs mt-2" style={{ color: '#8A8A8A' }}>
              Minimum recharge amount ₹298
            </p>
          </div>

          {/* Quick Amount */}
          <div style={CARD}>
            <p className="font-bold text-sm mb-3" style={{ color: '#2B2B2B' }}>Quick Amount</p>
            <div className="grid grid-cols-3 gap-3">
              {[298, 500, 1000, 3000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className="h-12 rounded-2xl font-bold text-sm transition-all active:scale-95"
                  style={
                    amount === amt
                      ? { background: BTN_GRAD, color: '#fff', boxShadow: BTN_SHADOW }
                      : { background: '#FFF4EE', color: '#2B2B2B', border: '1px solid rgba(255,106,0,0.12)' }
                  }
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div style={{ ...CARD, padding: '18px 20px' }}>
            <p className="font-bold text-sm mb-3" style={{ color: '#2B2B2B' }}>
              📋 Recharge Instructions
            </p>
            <div className="space-y-2.5">
              {[
                { n: '1', text: 'Enter or select your recharge amount (minimum ₹298).' },
                { n: '2', text: 'Tap "Recharge Now" — a UPI QR code will be generated for you.' },
                { n: '3', text: 'Scan the QR with any UPI app (GPay, PhonePe, Paytm, etc.) and complete the payment.' },
                { n: '4', text: 'After payment, copy your UTR / Reference number from your UPI app and paste it on the next screen.' },
                { n: '5', text: 'Your wallet will be credited within 5–10 minutes after verification. Do not pay multiple times for the same order.' },
              ].map(({ n, text }) => (
                <div key={n} className="flex items-start gap-2.5">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white mt-0.5"
                    style={{ background: BTN_GRAD }}
                  >
                    {n}
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: '#555', fontFamily: "'Poppins', sans-serif" }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recharge Button */}
          <button
            onClick={handleRecharge}
            className="w-full py-4 rounded-full text-base font-bold text-white transition-all active:scale-[0.97]"
            style={{ background: BTN_GRAD, boxShadow: BTN_SHADOW }}
          >
            Recharge Now
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Recharge;
