import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

const Recharge = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | "">("");

  const handleRecharge = () => {
    if (!amount || amount < 250) {
      alert("Minimum recharge amount is ₹250");
      return;
    }

    // Redirect to payment page with amount
    navigate(`/payment?amount=${amount}`);
  };

  return (
    <AppLayout>
      <div className="px-4 py-6">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6">Recharge</h1>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <p className="text-sm text-muted-foreground">
              Current Balance
            </p>
            <p className="text-2xl font-bold text-primary">₹12</p>
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-card">
            <p className="text-sm text-muted-foreground">
              Recharge Balance
            </p>
            <p className="text-2xl font-bold text-primary">₹0</p>
          </div>
        </div>

        {/* Enter Amount */}
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2">
            Enter Amount
          </label>
          <input
            type="number"
            placeholder="Recharge Amount"
            className="w-full h-12 rounded-xl border border-primary px-4 outline-none"
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value ? Number(e.target.value) : ""
              )
            }
          />
          <p className="text-xs text-muted-foreground mt-1">
            Minimum recharge amount ₹300
          </p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="mb-6">
          <p className="font-semibold mb-3">Quick Amount</p>
          <div className="grid grid-cols-3 gap-3">
            {[300, 500, 1000, 2000, 5000, 8500].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className="h-12 rounded-xl border border-primary text-primary font-semibold"
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Recharge Button */}
        <Button
          className="w-full h-12 text-lg"
          onClick={handleRecharge}
        >
          Recharge Now
        </Button>
      </div>
    </AppLayout>
  );
};

export default Recharge;
