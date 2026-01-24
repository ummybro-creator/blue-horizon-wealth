import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

const Recharge = () => {
  return (
    <AppLayout>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Recharge
        </h1>

        <div className="bg-card rounded-2xl shadow-card p-4">
          <p className="text-muted-foreground mb-4">
            Recharge feature coming soon.
          </p>

          <Button className="w-full">
            Proceed to Recharge
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Recharge;
