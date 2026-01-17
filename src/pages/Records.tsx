import { useState } from 'react';
import { ArrowLeft, TrendingUp, Users, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockTransactions } from '@/data/mockData';
import { cn } from '@/lib/utils';

type RecordType = 'income' | 'referral' | 'bonus';

const Records = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RecordType>('income');

  const tabs = [
    { id: 'income' as RecordType, label: 'Daily Income', icon: TrendingUp },
    { id: 'referral' as RecordType, label: 'Referral', icon: Users },
    { id: 'bonus' as RecordType, label: 'Bonus', icon: Gift },
  ];

  const filteredTransactions = mockTransactions.filter(t => t.type === activeTab);

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
          <h1 className="text-xl font-bold text-primary-foreground">Income Records</h1>
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
        {filteredTransactions.length === 0 ? (
          <div className="bg-card rounded-2xl shadow-card p-8 text-center animate-slide-up">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
              {activeTab === 'income' && <TrendingUp className="w-8 h-8 text-muted-foreground" />}
              {activeTab === 'referral' && <Users className="w-8 h-8 text-muted-foreground" />}
              {activeTab === 'bonus' && <Gift className="w-8 h-8 text-muted-foreground" />}
            </div>
            <p className="text-muted-foreground">No {activeTab} records yet</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-card overflow-hidden animate-slide-up">
            {filteredTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-center justify-between p-4",
                  index !== filteredTransactions.length - 1 && "border-b border-border"
                )}
              >
                <div>
                  <p className="font-medium text-foreground capitalize">{transaction.description || transaction.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.createdAt.toLocaleDateString('en-IN', { 
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <p className="font-semibold text-success">+₹{transaction.amount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Records;
