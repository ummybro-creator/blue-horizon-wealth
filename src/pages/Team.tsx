import { Copy, Link } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mockUser } from '@/data/mockData';

const levels = [
  { level: 'First Level', commission: '10%', recharges: 0, members: 0 },
  { level: 'Second Level', commission: '2%', recharges: 0, members: 0 },
  { level: 'Third Level', commission: '1%', recharges: 0, members: 0 },
];

const Team = () => {
  const referralLink = `https://www.tata-namak.com/register?ref=${mockUser.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="gradient-header pt-12 pb-8 px-4">
        <h1 className="text-2xl font-bold text-primary-foreground text-center">Team</h1>
      </div>

      {/* Referral Card */}
      <div className="mx-4 -mt-4 relative z-10">
        <div className="bg-primary rounded-2xl shadow-elevated overflow-hidden">
          <div className="p-4 flex items-center gap-2">
            <Link className="w-5 h-5 text-primary-foreground" />
            <span className="text-primary-foreground font-bold">Your Referral Link</span>
          </div>
          <div className="bg-card rounded-t-2xl p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary rounded-xl px-4 py-3 overflow-hidden">
                <p className="text-sm text-foreground truncate">{referralLink}</p>
              </div>
              <Button 
                variant="gradient" 
                className="h-12 px-6 font-bold"
                onClick={handleCopy}
              >
                COPY
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Level Cards */}
      <div className="px-4 mt-4 pb-6 space-y-4">
        {levels.map((level, index) => (
          <div 
            key={level.level}
            className="bg-card rounded-2xl shadow-card p-5 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <h3 className="text-primary font-bold text-lg mb-4">{level.level}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{level.commission}</p>
                <p className="text-sm text-muted-foreground">Commission</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">₹{level.recharges}</p>
                <p className="text-sm text-muted-foreground">Recharges</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{level.members}</p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Team;
