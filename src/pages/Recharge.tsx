import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MIN_RECHARGE = 300;

const Recharge = () => {
  const [amount, setAmount] = useState<number | "">("");
  const [showPayment, setShowPayment] = useState(false);

  const handleRecharge = () => {
    if (!amount || amount < MIN_RECHARGE) {
      toast.error(`Minimum recharge amount is ₹${MIN_RECHARGE}`);
      return;
    }
    setShowPayment(true);
  };

  return (
    <AppLayout>
      <div className="px-4 py-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Recharge
        </h1>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <p className="text-sm text-muted-foreground">
              Current Balance
            </p>
            <p className="text-2xl font-bold text-primary">
              ₹12
            </p>
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-card">
            <p className="text-sm text-muted-foreground">
              Recharge Balance
            </p>
            <p className="text-2xl font-bold text-primary">
              ₹0
            </p>
          </div>
        </div>

        {/* Enter Amount */}
        <div className="mb-4">
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
            Minimum recharge ₹{MIN_RECHARGE}
          </p>
        </div>

        {/* Quick Amount */}
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

        {/* PAYMENT PAGE */}
        {showPayment && (
          <div className="mt-8 bg-card rounded-2xl p-4 shadow-card">
            <h2 className="text-lg font-bold mb-2">
              Payment Amount
            </h2>
            <p className="text-2xl font-bold text-primary mb-4">
              ₹{amount}
            </p>

            <div className="mb-3">
              <p className="text-sm font-semibold">
                UPI ID
              </p>
              <div className="bg-secondary rounded-lg p-3 text-sm">
                7084234057@ptaxis
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold">
                QR Code
              </p>
              <div className="bg-secondary rounded-lg p-4 text-center text-sm">
                QR CODE FROM ADMIN
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              Payment can be made only once. Multiple payments
              are not valid.
            </p>

            <Button variant="outline" className="w-full">
              I Have Paid
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Recharge;
