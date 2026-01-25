import { Link, User, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/hooks/useTeam';
import { cn } from '@/lib/utils';

/**
 * ✅ FORCE GoDaddy domain for referral
 * CHANGE ONLY HERE IF DOMAIN CHANGES IN FUTURE
 */
const BASE_REFERRAL_URL = 'https://tataearn.online/register';

const Team = () => {
  const { profile } = useAuth();
  const { data: teamData, isLoading } = useTeam();

  // referral code from backend
  const referralCode = profile?.referral_code ?? '';

  // final referral link
  const referralLink = referralCode
    ? `${BASE_REFERRAL_URL}?ref=${referralCode}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied!');
    } catch {
      toast.error('Failed to copy referral link');
    }
  };

  const levels = [
    {
      level: 'First Level',
      commission: '30%',
      recharges: teamData?.stats?.level1Recharges ?? 0,
      members: teamData?.stats?.level1Members ?? 0,
    },
    {
      level: 'Second Level',
      commission: '5%',
      recharges: teamData?.stats?.level2Recharges ?? 0,
      members: teamData?.stats?.level2Members ?? 0,
    },
    {
      level: 'Third Level',
      commission: '2%',
      recharges: teamData?.stats?.level3Recharges ?? 0,
      members: teamData?.stats?.level3Members ?? 0,
    },
  ];

  const totalTeamSize = teamData?.stats?.totalMembers ?? 0;
  const members = teamData?.members ?? [];

  return (
    <AppLayout>
      {/* Header */}
      <div className="gradient-header pt-12 pb-8 px-4">
        <h1 className="text-2xl font-bold text-primary-foreground text-center">
          Team
        </h1>
      </div>

      {/* Total Team Size */}
      <div className="mx-4 -mt-4 relative z-10">
        <div className="bg-card rounded-2xl shadow-elevated p-4 mb-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Team Size</p>
            <p className="text-2xl font-bold text-foreground">
              {totalTeamSize}
            </p>
          </div>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="mx-4">
        <div className="bg-primary rounded-2xl shadow-elevated overflow-hidden">
          <div className="p-4 flex items-center gap-2">
            <Link className="w-5 h-5 text-primary-foreground" />
            <span className="text-primary-foreground font-bold">
              Your Referral Link
            </span>
          </div>

          <div className="bg-card rounded-t-2xl p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary rounded-xl px-4 py-3 overflow-hidden">
                <p className="text-sm text-foreground truncate">
                  {referralLink || 'Referral link not available'}
                </p>
              </div>

              <Button
                variant="gradient"
                className="h-12 px-6 font-bold"
                onClick={handleCopy}
                disabled={!referralLink}
              >
                COPY
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Levels */}
      <div className="px-4 mt-4 space-y-4">
        {levels.map((level) => (
          <div
            key={level.level}
            className="bg-card rounded-2xl shadow-card p-5"
          >
            <h3 className="text-primary font-bold text-lg mb-4">
              {level.level}
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {level.commission}
                </p>
                <p className="text-sm text-muted-foreground">
                  Commission
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  ₹{level.recharges.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Recharges
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {level.members}
                </p>
                <p className="text-sm text-muted-foreground">
                  Members
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Members */}
      <div className="mx-4 mt-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Team Members
        </h3>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              No team members yet
            </div>
          ) : (
            members.map((member, index) => (
              <div
                key={member.id}
                className={cn(
                  'flex items-center gap-3 p-4',
                  index !== members.length - 1 && 'border-b border-border'
                )}
              >
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {(member?.name ?? 'U').charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {member?.name ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(member?.phone ?? '00000').slice(0, 5)}****
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Team;
