import { ArrowLeft, TrendingUp, Gift, Users, Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'referral_bonus' | 'daily_income' | 'referral_deposit_bonus' | 'recharge' | 'manual_adjustment';

const Earnings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: ledger = [], isLoading } = useQuery({
    queryKey: ['earnings-ledger', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('transaction_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const filtered = filter === 'all' ? ledger : ledger.filter(t => t.type === filter);

  const totalReferral = ledger.filter(t => t.type === 'referral_bonus').reduce((s, t) => s + t.amount, 0);
  const totalDaily = ledger.filter(t => t.type === 'daily_income').reduce((s, t) => s + t.amount, 0);
  const totalBonus = ledger.filter(t => ['referral_deposit_bonus', 'manual_adjustment'].includes(t.type)).reduce((s, t) => s + t.amount, 0);

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Referral', value: 'referral_bonus' },
    { label: 'Daily', value: 'daily_income' },
    { label: 'Bonus', value: 'referral_deposit_bonus' },
  ];

  const typeLabel = (type: string) => {
    switch (type) {
      case 'referral_bonus': return 'Referral Commission';
      case 'daily_income': return 'Daily Income';
      case 'referral_deposit_bonus': return 'Referral Bonus';
      case 'recharge': return 'Recharge';
      case 'withdraw': return 'Withdrawal';
      case 'manual_adjustment': return 'Bonus';
      case 'withdraw_refund': return 'Refund';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto app-bg">
      <div className="clay-header pt-12 pb-8 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Earnings Details</h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="clay-card p-3 text-center">
            <Users className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Referral</p>
            <p className="text-base font-extrabold text-primary">₹{totalReferral.toFixed(0)}</p>
          </div>
          <div className="clay-card p-3 text-center">
            <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Daily</p>
            <p className="text-base font-extrabold text-primary">₹{totalDaily.toFixed(0)}</p>
          </div>
          <div className="clay-card p-3 text-center">
            <Gift className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Bonus</p>
            <p className="text-base font-extrabold text-primary">₹{totalBonus.toFixed(0)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                filter === f.value ? "clay-button" : "clay-card-sm text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="clay-card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            filtered.map((tx, i) => (
              <div key={tx.id} className={cn("px-4 py-3 flex items-center justify-between", i !== filtered.length - 1 && "border-b border-muted")}>
                <div>
                  <p className="text-sm font-semibold text-foreground">{typeLabel(tx.type)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {tx.description && ` · ${tx.description}`}
                  </p>
                </div>
                <span className={cn("text-sm font-bold", tx.amount >= 0 ? "text-primary" : "text-destructive")}>
                  {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(0)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;
