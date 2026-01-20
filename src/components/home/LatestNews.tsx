import { CheckCircle } from 'lucide-react';
import { useMemo } from 'react';

const generateRandomWithdraws = () => {
  const names = ['Raj K.', 'Priya S.', 'Amit P.', 'Neha R.', 'Vikram M.', 'Sunita D.', 'Rahul T.', 'Kavita B.', 'Suresh N.', 'Meena G.'];
  
  return Array.from({ length: 6 }, (_, i) => ({
    id: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
    name: names[Math.floor(Math.random() * names.length)],
    amount: Math.floor(500 + Math.random() * 49500),
    userId: `****${Math.floor(1000 + Math.random() * 9000)}`,
  }));
};

export function LatestNews() {
  const withdraws = useMemo(() => generateRandomWithdraws(), []);

  return (
    <div className="mx-4 mt-4 mb-6">
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-bold text-primary">Latest Withdraw Success</h2>
        </div>
        
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {withdraws.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">ID: {item.userId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">₹{item.amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
