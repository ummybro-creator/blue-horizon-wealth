import { ArrowLeft, Briefcase, Clock, TrendingUp, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInvestments, useCreditDailyIncome } from '@/hooks/useInvestments';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ActivePlans = () => {
  const navigate = useNavigate();
  const { data: investments = [], isLoading } = useInvestments();
  const creditDailyIncome = useCreditDailyIncome();

  const activeInvestments = investments.filter(i => i.status === 'active');

  // Get product details for investments
  const productIds = [...new Set(activeInvestments.map(i => i.product_id))];
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-investments', productIds],
    queryFn: async () => {
      if (!productIds.length) return [];
      const { data } = await supabase.from('products').select('*').in('id', productIds);
      return data || [];
    },
    enabled: productIds.length > 0,
  });

  const productMap = new Map(products.map((p: any) => [p.id, p]));

  const handleClaim = async () => {
    try {
      const count = await creditDailyIncome.mutateAsync();
      if (count > 0) {
        toast.success(`Claimed daily income from ${count} plan(s)!`);
      } else {
        toast.info('No income to claim yet. Come back tomorrow!');
      }
    } catch {
      toast.error('Failed to claim earnings');
    }
  };

  const canClaim = activeInvestments.some(i => {
    const lastCredited = i.last_credited_at;
    const today = new Date().toISOString().split('T')[0];
    return !lastCredited || lastCredited < today;
  });

  return (
    <div className="min-h-screen max-w-lg mx-auto app-bg">
      <div className="clay-header pt-12 pb-8 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/60 backdrop-blur flex items-center justify-center" style={{ border: '1px solid #C8E6C9' }}>
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: '#2E7D32' }}>Active Plans</h1>
        </div>
      </div>

      <div className="px-4 py-4 -mt-4 space-y-4">
        {/* Claim Button */}
        {activeInvestments.length > 0 && (
          <button
            onClick={handleClaim}
            disabled={!canClaim || creditDailyIncome.isPending}
            className="w-full clay-button py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.97] transition-all"
          >
            <Gift className="w-5 h-5" />
            {creditDailyIncome.isPending ? 'Claiming...' : canClaim ? 'Claim Daily Earnings' : 'Already Claimed Today'}
          </button>
        )}

        {isLoading ? (
          <div className="clay-card p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : activeInvestments.length === 0 ? (
          <div className="clay-card p-8 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-semibold text-foreground">No Active Plans</p>
            <p className="text-sm text-muted-foreground mt-1">Purchase a product to start earning daily income</p>
            <button onClick={() => navigate('/products')} className="mt-4 clay-button px-6 py-2.5 text-sm">
              Browse Products
            </button>
          </div>
        ) : (
          activeInvestments.map((inv) => {
            const product = productMap.get(inv.product_id);
            const daysLeft = Math.max(0, Math.ceil((new Date(inv.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            const totalDays = product?.duration_days || 30;
            const progress = Math.round(((totalDays - daysLeft) / totalDays) * 100);
            const claimedToday = inv.last_credited_at === new Date().toISOString().split('T')[0];

            return (
              <div key={inv.id} className="clay-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground">{product?.name || 'Investment'}</h3>
                    <p className="text-xs text-muted-foreground">Invested: ₹{inv.invested_amount}</p>
                  </div>
                  <span className={cn(
                    "text-xs px-2.5 py-1 rounded-full font-medium",
                    claimedToday ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                  )}>
                    {claimedToday ? 'Claimed' : 'Unclaimed'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="clay-inset p-2.5 rounded-xl text-center">
                    <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Daily</p>
                    <p className="text-sm font-bold text-primary">₹{product?.daily_income || 0}</p>
                  </div>
                  <div className="clay-inset p-2.5 rounded-xl text-center">
                    <Gift className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Earned</p>
                    <p className="text-sm font-bold text-foreground">₹{inv.total_earned || 0}</p>
                  </div>
                  <div className="clay-inset p-2.5 rounded-xl text-center">
                    <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Days Left</p>
                    <p className="text-sm font-bold text-foreground">{daysLeft}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{progress}% complete</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivePlans;
