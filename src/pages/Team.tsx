import { Copy, Share2, Users, User, TrendingUp, ChevronRight, Gift } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Team = () => {
  const { data: teamData, isLoading } = useTeam();
  const { profile } = useAuth();

  const referralCode = profile?.referral_code || '------';
  const referralLink = `https://tataearn.online/register?ref=${referralCode}`;

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join & Start Earning!',
          text: `Use my referral code: ${referralCode}`,
          url: referralLink,
        });
      } catch {
        handleCopy(referralLink, 'Referral link');
      }
    } else {
      handleCopy(referralLink, 'Referral link');
    }
  };

  const stats = teamData?.stats;
  const members = teamData?.members ?? [];

  const level1Earnings = (stats?.level1Recharges ?? 0) * 0.13;
  const level2Earnings = (stats?.level2Recharges ?? 0) * 0.05;
  const level3Earnings = (stats?.level3Recharges ?? 0) * 0.02;
  const totalEarnings = level1Earnings + level2Earnings + level3Earnings;

  const statCards = [
    { label: 'Total Team', value: stats?.totalMembers ?? 0, icon: Users },
    { label: 'Level 1', value: stats?.level1Members ?? 0, icon: User },
    { label: 'Level 2', value: stats?.level2Members ?? 0, icon: User },
    { label: 'Level 3', value: stats?.level3Members ?? 0, icon: User },
  ];

  const commissionLevels = [
    { level: 'Level 1', rate: '13%', color: 'bg-primary' },
    { level: 'Level 2', rate: '5%', color: 'bg-secondary' },
    { level: 'Level 3', rate: '2%', color: 'bg-accent' },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="gradient-header pt-12 pb-20 px-4 text-center">
        <Gift className="w-10 h-10 text-primary-foreground mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-primary-foreground">Invite Friends & Earn</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">Share your referral and earn commission</p>
      </div>

      {/* Referral Card */}
      <div className="mx-4 -mt-12 relative z-10">
        <div className="bg-card rounded-2xl shadow-elevated p-5 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Your Referral Code</p>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-secondary/10 rounded-xl px-4 py-3 font-mono text-xl font-bold text-primary tracking-widest text-center">
              {referralCode}
            </div>
            <Button variant="outline" size="icon" onClick={() => handleCopy(referralCode, 'Referral code')}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-1">Your Referral Link</p>
          <div className="bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground truncate mb-4">
            {referralLink}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" onClick={() => handleCopy(referralLink, 'Referral link')}>
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
            <Button variant="gradient" className="w-full" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mx-4 mt-5 grid grid-cols-2 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border shadow-card">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <s.icon className="w-4.5 h-4.5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{isLoading ? '...' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Referral Earnings Card */}
      <div className="mx-4 mt-5">
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Referral Earnings
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Level 1 Earnings', value: level1Earnings },
              { label: 'Level 2 Earnings', value: level2Earnings },
              { label: 'Level 3 Earnings', value: level3Earnings },
            ].map((e) => (
              <div key={e.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{e.label}</span>
                <span className="font-semibold text-foreground">₹{e.value.toFixed(0)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="font-semibold text-foreground">Total Earnings</span>
              <span className="text-lg font-bold text-primary">₹{totalEarnings.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mx-4 mt-5">
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4">How It Works</h3>
          <div className="space-y-3">
            {commissionLevels.map((c) => (
              <div key={c.level} className="flex items-center gap-3">
                <div className={cn('w-2 h-2 rounded-full', c.color)} />
                <span className="text-sm text-muted-foreground flex-1">{c.level} – Commission</span>
                <span className="font-bold text-primary">{c.rate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="mx-4 mt-5 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Team Members</h3>
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-muted/50 text-xs font-semibold text-muted-foreground">
            <span>User</span>
            <span className="text-center">Level</span>
            <span className="text-center">Joined</span>
            <span className="text-right">Status</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No team members yet</p>
              <p className="text-xs text-muted-foreground">Share your referral to grow your team</p>
            </div>
          ) : (
            members.map((member, index) => (
              <div
                key={member.id}
                className={cn(
                  'grid grid-cols-4 gap-2 px-4 py-3 items-center',
                  index !== members.length - 1 && 'border-b border-border'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-primary">
                      {(member?.name ?? 'U').charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">
                    {member?.name ?? 'User'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    L{member.level}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {new Date(member.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <div className="text-right">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                    Active
                  </span>
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
