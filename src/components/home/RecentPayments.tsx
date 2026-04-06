import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Deepak', 'Pooja', 'Rajesh', 'Neha', 'Suresh', 'Kavita', 'Arjun', 'Manisha', 'Ravi'];

function randomAmount() {
  const amounts = [1000, 1500, 2000, 2500, 3000, 5000, 7000, 8000, 10000, 15000, 20000, 25000, 30000, 50000];
  return amounts[Math.floor(Math.random() * amounts.length)];
}

function randomId() {
  return `${Math.floor(Math.random() * 9000 + 1000)}****${Math.floor(Math.random() * 90 + 10)}`;
}

function generateFakeTransaction() {
  const isWithdraw = Math.random() > 0.4;
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: firstNames[Math.floor(Math.random() * firstNames.length)],
    maskedId: randomId(),
    amount: randomAmount(),
    type: isWithdraw ? 'withdraw' : 'recharge',
    time: `${Math.floor(Math.random() * 59 + 1)} min ago`,
  };
}

function generateList() {
  return Array.from({ length: 8 }, () => generateFakeTransaction());
}

export function RecentPayments() {
  const [transactions, setTransactions] = useState(generateList);

  useEffect(() => {
    const timer = setInterval(() => {
      setTransactions(prev => {
        const newTx = generateFakeTransaction();
        return [newTx, ...prev.slice(0, 7)];
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-4 mt-5">
      <h2 className="text-base font-bold text-foreground mb-3">Recent Activity</h2>
      <div className="space-y-1">
        {transactions.map((tx, index) => (
          <div
            key={tx.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500",
              index === 0 && "animate-slide-up"
            )}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
              {tx.type === 'withdraw' ? (
                <ArrowDownCircle className="w-4 h-4 text-primary" />
              ) : (
                <ArrowUpCircle className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{tx.name}</p>
              <p className="text-[10px] text-muted-foreground">ID: {tx.maskedId} · {tx.time}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">
                {tx.type === 'withdraw' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-primary font-medium">
                {tx.type === 'withdraw' ? 'Withdrawn' : 'Deposited'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
