import { useRecharges } from '@/hooks/useRecharges';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' },
  approved: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Rejected' },
};

export function RecentPayments() {
  const { data: recharges } = useRecharges();
  const { data: withdrawals } = useWithdrawals();

  const combined = [
    ...(recharges || []).map(r => ({ ...r, type: 'recharge' as const })),
    ...(withdrawals || []).map(w => ({ ...w, type: 'withdrawal' as const })),
  ]
    .sort((a, b) => new Date(b.requested_at || '').getTime() - new Date(a.requested_at || '').getTime())
    .slice(0, 5);

  if (!combined.length) return null;

  return (
    <div className="mx-4 mt-5">
      <h2 className="text-base font-bold text-foreground mb-3">Recent Payments</h2>
      <div className="clay-card overflow-hidden">
        {combined.map((item, index) => {
          const status = statusConfig[item.status];
          const StatusIcon = status.icon;
          const isRecharge = item.type === 'recharge';
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                index !== combined.length - 1 && "border-b border-muted"
              )}
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", isRecharge ? 'bg-primary/10' : 'bg-destructive/10')}>
                {isRecharge ? <ArrowUpCircle className="w-4 h-4 text-primary" /> : <ArrowDownCircle className="w-4 h-4 text-destructive" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{isRecharge ? 'Recharge' : 'Withdrawal'}</p>
                <p className="text-[10px] text-muted-foreground">
                  {item.requested_at ? new Date(item.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                </p>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-bold", isRecharge ? 'text-primary' : 'text-foreground')}>
                  {isRecharge ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                </p>
                <span className={cn("text-[10px] font-medium", status.color)}>{status.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
