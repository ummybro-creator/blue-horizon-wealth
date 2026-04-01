import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const Recharge = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | "">("");
  const { wallet } = useAuth();

  const handleRecharge = () => {
    if (!amount || amount < 250) {
      alert("Minimum recharge amount is ₹250");
      return;
    }
    navigate(`/payment?amount=${amount}`);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="clay-header pt-12 pb-8 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Recharge</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3 -mt-4">
          <div className="clay-card p-4">
            <p className="text-xs text-muted-foreground font-medium">Current Balance</p>
            <p className="text-xl font-extrabold text-primary mt-1">₹{wallet?.total_balance ?? 0}</p>
          </div>
          <div className="clay-card p-4">
            <p className="text-xs text-muted-foreground font-medium">Recharge Balance</p>
            <p className="text-xl font-extrabold text-primary mt-1">₹{wallet?.recharge_balance ?? 0}</p>
          </div>
        </div>

        {/* Amount Input */}
        <div className="clay-card p-5">
          <label className="block text-sm font-bold text-foreground mb-2">Enter Amount</label>
          <input
            type="number"
            placeholder="Recharge Amount"
            className="w-full h-12 rounded-2xl clay-inset px-4 outline-none text-foreground font-semibold"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
          />
          <p className="text-xs text-muted-foreground mt-2">Minimum recharge amount ₹250</p>
        </div>

        {/* Quick Amount */}
        <div className="clay-card p-5">
          <p className="font-bold text-foreground text-sm mb-3">Quick Amount</p>
          <div className="grid grid-cols-3 gap-3">
            {[250, 500, 1000, 2000, 5000, 8500].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`h-12 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                  amount === amt 
                    ? 'clay-button' 
                    : 'clay-inset text-foreground hover:shadow-clay'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Recharge Button */}
        <button
          className="w-full clay-button py-4 text-base font-bold transition-all active:scale-[0.97]"
          onClick={handleRecharge}
        >
          Recharge Now
        </button>
      </div>
    </AppLayout>
  );
};

export default Recharge;
