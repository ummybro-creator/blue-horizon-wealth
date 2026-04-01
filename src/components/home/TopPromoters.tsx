import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

const dummyPromoters = [
  { rank: 1, name: 'Raj Kumar', referrals: 127, reward: 2000 },
  { rank: 2, name: 'Priya Sharma', referrals: 98, reward: 1500 },
  { rank: 3, name: 'Amit Patel', referrals: 76, reward: 1000 },
  { rank: 4, name: 'Neha R.', referrals: 64, reward: 200 },
  { rank: 5, name: 'Vikram M.', referrals: 55, reward: 200 },
  { rank: 6, name: 'Sunita D.', referrals: 49, reward: 200 },
  { rank: 7, name: 'Rahul T.', referrals: 42, reward: 200 },
  { rank: 8, name: 'Kavita B.', referrals: 38, reward: 200 },
  { rank: 9, name: 'Suresh N.', referrals: 31, reward: 200 },
  { rank: 10, name: 'Meena G.', referrals: 27, reward: 200 },
];

const rankColors = ['', 'text-amber-500', 'text-slate-400', 'text-amber-700'];

export function TopPromoters() {
  const [promoters, setPromoters] = useState(dummyPromoters);

  // Fake activity animation - subtle referral count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setPromoters(prev => 
        prev.map(p => ({
          ...p,
          referrals: p.referrals + (Math.random() > 0.7 ? 1 : 0),
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-4 mt-5">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h2 className="text-base font-bold text-foreground">🏆 Top Promoters This Week</h2>
      </div>

      <div className="clay-card p-4">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground">
          <span className="col-span-1">#</span>
          <span className="col-span-5">User</span>
          <span className="col-span-3 text-center">Referrals</span>
          <span className="col-span-3 text-right">Reward</span>
        </div>

        <div className="space-y-1.5">
          {promoters.map((p) => (
            <div
              key={p.rank}
              className={cn(
                "grid grid-cols-12 gap-2 px-3 py-2.5 rounded-xl items-center transition-all duration-300",
                p.rank <= 3 ? "bg-primary/5" : "bg-muted/30"
              )}
            >
              <span className="col-span-1">
                {p.rank <= 3 ? (
                  <Medal className={cn("w-4 h-4", rankColors[p.rank])} />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">{p.rank}</span>
                )}
              </span>
              <div className="col-span-5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shadow-clay-sm">
                  {p.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-foreground truncate">{p.name}</span>
              </div>
              <div className="col-span-3 text-center">
                <span className="text-xs font-bold text-foreground flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  {p.referrals}
                </span>
              </div>
              <span className="col-span-3 text-right text-xs font-extrabold text-money">
                ₹{p.reward}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
