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
    <div className="mx-4 mt-4 mb-4">
      <h2 className="text-[15px] font-bold mb-3" style={{ color: '#111827' }}>
        Recent Activity
      </h2>
      <div
        className="rounded-[20px] overflow-hidden"
        style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        {transactions.map((tx, index) => (
          <div
            key={tx.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 transition-all duration-500',
              index === 0 && 'animate-slide-up',
              index < transactions.length - 1 && 'border-b'
            )}
            style={{ borderColor: '#F3F4F6' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: tx.type === 'withdraw' ? '#FEE2E2' : '#DCFCE7' }}
            >
              {tx.type === 'withdraw' ? (
                <ArrowDownCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
              ) : (
                <ArrowUpCircle className="w-4 h-4" style={{ color: '#22C55E' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>{tx.name}</p>
              <p className="text-[10px]" style={{ color: '#9CA3AF' }}>ID: {tx.maskedId} · {tx.time}</p>
            </div>
            <div className="text-right">
              <p
                className="text-sm font-bold"
                style={{ color: tx.type === 'withdraw' ? '#EF4444' : '#22C55E' }}
              >
                {tx.type === 'withdraw' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] font-medium" style={{ color: '#9CA3AF' }}>
                {tx.type === 'withdraw' ? 'Withdrawn' : 'Deposited'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
