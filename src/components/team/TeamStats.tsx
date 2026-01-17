import { Users, TrendingUp, Layers } from 'lucide-react';
import { mockTeamMembers } from '@/data/mockData';

export function TeamStats() {
  const totalMembers = mockTeamMembers.length;
  const totalCommission = mockTeamMembers.reduce((sum, m) => sum + m.commission, 0);
  const level1Members = mockTeamMembers.filter(m => m.level === 1).length;
  const level2Members = mockTeamMembers.filter(m => m.level === 2).length;

  const stats = [
    { icon: Users, label: 'Total Members', value: totalMembers.toString(), color: 'text-primary bg-primary/10' },
    { icon: TrendingUp, label: 'Total Commission', value: `₹${totalCommission}`, color: 'text-success bg-success/10' },
    { icon: Layers, label: 'Level 1', value: level1Members.toString(), color: 'text-accent bg-accent/10' },
    { icon: Layers, label: 'Level 2', value: level2Members.toString(), color: 'text-primary bg-primary/10' },
  ];

  return (
    <div className="mx-4 mt-5 grid grid-cols-2 gap-3 animate-slide-up">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card">
          <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-2`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
          <p className="text-xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
