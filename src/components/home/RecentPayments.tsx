import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Deepak', 'Pooja', 'Rajesh', 'Neha', 'Suresh', 'Kavita', 'Arjun', 'Manisha', 'Ravi'];

function randomAmount(type: 'recharge' | 'withdraw') {
  const rechargeAmounts = [298, 450, 700, 850, 1000, 2000, 2600, 3000, 9800];
  const withdrawAmounts = [180, 250, 350, 500, 750, 1000, 1500, 2000];
  const pool = type === 'recharge' ? rechargeAmounts : withdrawAmounts;
  return pool[Math.floor(Math.random() * pool.length)];
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
    amount: randomAmount(isWithdraw ? 'withdraw' : 'recharge'),
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
      <h2
        className="text-[15px] font-bold mb-3"
        style={{ color: '#2B2B2B', fontFamily: "'Poppins', sans-serif" }}
      >
        Recent Activity
      </h2>
      <div
        className="rounded-[24px] overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 24px rgba(22,163,74,0.08), 0 2px 6px rgba(0,0,0,0.04)',
          border: '1px solid rgba(255,255,255,0.72)',
        }}
      >
        {transactions.map((tx, index) => (
          <div
            key={tx.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 transition-all duration-500',
              index === 0 && 'animate-slide-up',
              index < transactions.length - 1 && 'border-b border-gray-100'
            )}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: tx.type === 'withdraw' ? '#FEE2E2' : '#DCFCE7' }}
            >
              {tx.type === 'withdraw' ? (
                <ArrowDownCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
              ) : (
                <ArrowUpCircle className="w-4 h-4" style={{ color: '#16A34A' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold"
                style={{ color: '#2B2B2B', fontFamily: "'Poppins', sans-serif" }}
              >
                {tx.name}
              </p>
              <p className="text-[10px]" style={{ color: '#9CA3AF' }}>
                ID: {tx.maskedId} · {tx.time}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-sm font-bold"
                style={{ color: tx.type === 'withdraw' ? '#EF4444' : '#16A34A' }}
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
