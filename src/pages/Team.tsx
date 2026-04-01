import { Copy, Share2, Users, User, TrendingUp, ChevronRight, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Team = () => {
  const navigate = useNavigate();
  const { data: teamData, isLoading } = useTeam();
  const { profile } = useAuth();

  const referralCode = profile?.referral_code || '------';
  const referralLink = `${window.location.origin}/login?ref=${referralCode}`;

  const handleCopy = async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); toast.success(`${label} copied!`); }
    catch { toast.error('Failed to copy'); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Join & Start Earning!', text: `Use my referral code: ${referralCode}`, url: referralLink }); }
      catch { handleCopy(referralLink, 'Referral link'); }
    } else { handleCopy(referralLink, 'Referral link'); }
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

  return (
    <AppLayout>
      {/* Header */}
      <div className="clay-header pt-12 pb-20 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur mx-auto mb-2 flex items-center justify-center shadow-clay-sm">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Invite Friends & Earn</h1>
        <p className="text-white/80 text-sm mt-1">Share your referral and earn commission</p>
      </div>

      {/* Referral Card */}
      <div className="mx-4 -mt-12 relative z-10">
        <div className="clay-card-lg p-5">
          <p className="text-xs text-muted-foreground mb-1">Your Referral Code</p>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 clay-inset px-4 py-3 font-mono text-xl font-bold text-primary tracking-widest text-center">
              {referralCode}
            </div>
            <button onClick={() => handleCopy(referralCode, 'Referral code')} className="w-11 h-11 rounded-xl clay-card-sm flex items-center justify-center">
              <Copy className="w-4 h-4 text-foreground" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-1">Your Referral Link</p>
          <div className="clay-inset px-4 py-3 text-sm text-muted-foreground truncate mb-4">
            {referralLink}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleCopy(referralLink, 'Referral link')} className="clay-card-sm py-3 flex items-center justify-center gap-2 text-sm font-bold text-foreground active:scale-95 transition-all">
              <Copy className="w-4 h-4" /> Copy Link
            </button>
            <button onClick={handleShare} className="clay-button py-3 flex items-center justify-center gap-2 text-sm active:scale-95 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-4 mt-5 grid grid-cols-2 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="clay-card p-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2 shadow-clay-sm">
              <s.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-extrabold text-foreground">{isLoading ? '...' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Earnings */}
      <div className="mx-4 mt-5">
        <div className="clay-card p-5">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Referral Earnings
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Level 1 Earnings (13%)', value: level1Earnings },
              { label: 'Level 2 Earnings (5%)', value: level2Earnings },
              { label: 'Level 3 Earnings (2%)', value: level3Earnings },
            ].map((e) => (
              <div key={e.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{e.label}</span>
                <span className="font-bold text-foreground">₹{e.value.toFixed(0)}</span>
              </div>
            ))}
            <div className="border-t border-muted pt-3 flex items-center justify-between">
              <span className="font-bold text-foreground">Total Earnings</span>
              <span className="text-lg font-extrabold text-primary">₹{totalEarnings.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Bonus */}
      <div className="mx-4 mt-5">
        <button onClick={() => navigate('/extra-bonus')} className="w-full clay-button py-3.5 flex items-center justify-center gap-2 text-sm active:scale-[0.97] transition-all">
          <Gift className="w-4 h-4" /> Extra Referral Bonus <ChevronRight className="w-4 h-4 ml-auto" />
        </button>
      </div>

      {/* Team Members */}
      <div className="mx-4 mt-5 mb-6">
        <h3 className="text-base font-bold text-foreground mb-3">Team Members</h3>
        <div className="clay-card overflow-hidden">
          <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-muted/30 text-xs font-semibold text-muted-foreground">
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
            </div>
          ) : (
            members.map((member, index) => (
              <div key={member.id} className={cn('grid grid-cols-4 gap-2 px-4 py-3 items-center', index !== members.length - 1 && 'border-b border-muted')}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 shadow-clay-sm">
                    <span className="text-xs font-bold text-primary">{(member?.name ?? 'U').charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">{member?.name ?? 'User'}</span>
                </div>
                <div className="text-center">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">L{member.level}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {new Date(member.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <div className="text-right">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Active</span>
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
