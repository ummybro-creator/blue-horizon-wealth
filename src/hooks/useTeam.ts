import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TeamMember {
  id: string;
  name: string;
  phone: string;
  level: number;
  joinedAt: string;
}

interface TeamStats {
  level1Members: number;
  level2Members: number;
  level3Members: number;
  totalMembers: number;
  level1Recharges: number;
  level2Recharges: number;
  level3Recharges: number;
}

export function useTeam() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team', user?.id],
    queryFn: async (): Promise<{ members: TeamMember[]; stats: TeamStats }> => {
      if (!user?.id) {
        return {
          members: [],
          stats: {
            level1Members: 0,
            level2Members: 0,
            level3Members: 0,
            totalMembers: 0,
            level1Recharges: 0,
            level2Recharges: 0,
            level3Recharges: 0,
          },
        };
      }

      // Fetch referrals where current user is the referrer
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('referred_id, level, created_at')
        .eq('referrer_id', user.id);

      if (referralsError) throw referralsError;

      // Get referred user profiles
      const referredIds = referrals?.map(r => r.referred_id) || [];
      
      let members: TeamMember[] = [];
      
      if (referredIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number, created_at')
          .in('id', referredIds);

        if (profilesError) throw profilesError;

        members = (profiles || []).map(profile => {
          const referral = referrals?.find(r => r.referred_id === profile.id);
          return {
            id: profile.id,
            name: profile.full_name || 'User',
            phone: profile.phone_number,
            level: referral?.level || 1,
            joinedAt: profile.created_at,
          };
        });
      }

      // Calculate stats
      const level1Members = members.filter(m => m.level === 1).length;
      const level2Members = members.filter(m => m.level === 2).length;
      const level3Members = members.filter(m => m.level === 3).length;

      // Get approved recharges from team members
      let level1Recharges = 0;
      let level2Recharges = 0;
      let level3Recharges = 0;

      if (referredIds.length > 0) {
        const { data: recharges, error: rechargesError } = await supabase
          .from('recharges')
          .select('user_id, amount')
          .in('user_id', referredIds)
          .eq('status', 'approved');

        if (!rechargesError && recharges) {
          recharges.forEach(recharge => {
            const referral = referrals?.find(r => r.referred_id === recharge.user_id);
            if (referral) {
              if (referral.level === 1) level1Recharges += Number(recharge.amount);
              else if (referral.level === 2) level2Recharges += Number(recharge.amount);
              else if (referral.level === 3) level3Recharges += Number(recharge.amount);
            }
          });
        }
      }

      return {
        members,
        stats: {
          level1Members,
          level2Members,
          level3Members,
          totalMembers: level1Members + level2Members + level3Members,
          level1Recharges,
          level2Recharges,
          level3Recharges,
        },
      };
    },
    enabled: !!user?.id,
  });
}
