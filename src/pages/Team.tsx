import { AppLayout } from '@/components/layout/AppLayout';
import { ReferralCard } from '@/components/team/ReferralCard';
import { TeamStats } from '@/components/team/TeamStats';
import { TeamMemberList } from '@/components/team/TeamMemberList';

const Team = () => {
  return (
    <AppLayout>
      {/* Header */}
      <div className="gradient-header pt-12 pb-24 px-4">
        <h1 className="text-2xl font-bold text-primary-foreground">My Team</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">Grow your network, earn more</p>
      </div>

      {/* Referral Card */}
      <ReferralCard />

      {/* Team Stats */}
      <TeamStats />

      {/* Team Member List */}
      <TeamMemberList />
    </AppLayout>
  );
};

export default Team;
