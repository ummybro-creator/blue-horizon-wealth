import { Gift, ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTeam } from '@/hooks/useTeam';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const bonusRules = [
  { target: 100, reward: 20 },
  { target: 200, reward: 50 },
  { target: 300, reward: 80 },
  { target: 400, reward: 120 },
  { target: 500, reward: 180 },
  { target: 600, reward: 200 },
];

const ExtraReferralBonus = () => {
  const navigate = useNavigate();
  const { data: teamData, isLoading } = useTeam();
  const totalMembers = teamData?.stats?.totalMembers ?? 0;

  const handleClaim = (target: number, reward: number) => {
    if (totalMembers < target) {
      toast.error(`You need ${target - totalMembers} more referrals to claim this bonus.`);
      return;
    }
    toast.info('Claim feature coming soon!');
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="gradient-header pt-10 pb-6 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Invite & Earn</h1>
        </div>
      </div>

      {/* Bonus Cards */}
      <div className="px-4 py-4 space-y-4">
        {bonusRules.map(({ target, reward }) => {
          const progress = Math.min(totalMembers, target);
          const percentage = Math.round((progress / target) * 100);
          const canClaim = totalMembers >= target;

          return (
            <div
              key={target}
              className="bg-card rounded-2xl border border-border shadow-card p-5"
            >
              {/* Title row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Invite {target} friends{' '}
                    <span className="text-primary font-bold">+₹{reward}</span>
                  </p>
                </div>
              </div>

              {/* Progress info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Progress: {isLoading ? '...' : `${progress}/${target}`}</span>
                <span>{isLoading ? '...' : `${percentage}%`}</span>
              </div>

              {/* Progress bar */}
              <Progress value={percentage} className="h-2.5 mb-4" />

              {/* Claim button */}
              <Button
                variant="gradient"
                className="w-full"
                disabled={!canClaim}
                onClick={() => handleClaim(target, reward)}
              >
                Claim ₹{reward}
              </Button>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default ExtraReferralBonus;
