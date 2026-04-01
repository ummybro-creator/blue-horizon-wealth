import { CheckCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const names = ['Raj K.', 'Priya S.', 'Amit P.', 'Neha R.', 'Vikram M.', 'Sunita D.', 'Rahul T.', 'Kavita B.', 'Suresh N.', 'Meena G.', 'Anil V.', 'Pooja M.', 'Ravi S.', 'Anjali D.'];

const generatePayment = () => ({
  id: `TXN${Date.now()}${Math.random()}`,
  name: names[Math.floor(Math.random() * names.length)],
  amount: Math.floor(500 + Math.random() * 49500),
  userId: `****${Math.floor(1000 + Math.random() * 9000)}`,
  isNew: true,
});

export function LatestNews() {
  const [payments, setPayments] = useState(() => 
    Array.from({ length: 4 }, generatePayment).map(p => ({ ...p, isNew: false }))
  );

  const addNewPayment = useCallback(() => {
    setPayments(prev => {
      const updated = prev.map(p => ({ ...p, isNew: false }));
      return [generatePayment(), ...updated.slice(0, 3)];
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(addNewPayment, 3000);
    return () => clearInterval(interval);
  }, [addNewPayment]);

  return (
    <div className="mx-4 mt-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">Recent Payments</h2>
      </div>
      
      <div className="clay-card p-4 space-y-2">
        {payments.map((item) => (
          <div 
            key={item.id} 
            className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-500 ease-out ${
              item.isNew ? 'animate-fade-in bg-primary/5' : 'bg-muted/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shadow-clay-sm">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">ID: {item.userId}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-money">₹{item.amount.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
