import { useState } from 'react';
import { ArrowLeft, TrendingUp, ArrowDownCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { cn } from '@/lib/utils';

type RecordType = 'income' | 'withdraw';

const Records = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RecordType>('withdraw');
  const { data: withdrawals, isLoading } = useWithdrawals();

  const tabs = [
    { id: 'income' as RecordType, label: 'Income', icon: TrendingUp },
    { id: 'withdraw' as RecordType, label: 'Withdraw', icon: ArrowDownCircle },
  ];

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' },
    approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Approved' },
    rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Rejected' },
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="gradient-header pt-12 pb-6 px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Records</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-3 relative z-10">
        <div className="bg-card rounded-xl p-1.5 shadow-card flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5",
                activeTab === tab.id 
                  ? "gradient-primary text-primary-foreground shadow-button" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div className="px-4 mt-5 pb-6">
        {activeTab === 'income' ? (
          <div className="bg-card rounded-2xl shadow-card p-8 text-center animate-slide-up">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No income records yet</p>
          </div>
        ) : isLoading ? (
          <div className="bg-card rounded-2xl shadow-card p-8 text-center animate-slide-up">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !withdrawals?.length ? (
          <div className="bg-card rounded-2xl shadow-card p-8 text-center animate-slide-up">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
              <ArrowDownCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No withdrawal records yet</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-card overflow-hidden animate-slide-up">
            {withdrawals.map((withdrawal, index) => {
              const status = statusConfig[withdrawal.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={withdrawal.id}
                  className={cn(
                    "flex items-center justify-between p-4",
                    index !== withdrawals.length - 1 && "border-b border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", status.bg)}>
                      <StatusIcon className={cn("w-5 h-5", status.color)} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Withdrawal Request</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(withdrawal.requested_at).toLocaleDateString('en-IN', { 
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{withdrawal.amount.toLocaleString('en-IN')}</p>
                    <span className={cn("text-xs font-medium", status.color)}>{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Records;
