import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TeamMember {
  id: string;
  name: string;
  phone: string;
  level: number;
  joinedAt: string;
  totalRecharge: number;
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

const emptyStats: TeamStats = {
  level1Members: 0,
  level2Members: 0,
  level3Members: 0,
  totalMembers: 0,
  level1Recharges: 0,
  level2Recharges: 0,
  level3Recharges: 0,
};

export function useTeam() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team', user?.id],
    queryFn: async (): Promise<{ members: TeamMember[]; stats: TeamStats }> => {
      if (!user?.id) return { members: [], stats: emptyStats };

      // Server-side function: returns the full 3-level downline for the
      // signed-in user (profiles of other users aren't directly readable).
      const { data, error } = await supabase.rpc('get_my_team' as never);
      if (error) throw error;

      const members: TeamMember[] = ((data as any[]) || []).map((row) => ({
        id: row.id,
        name: row.name || 'User',
        phone: row.phone || '',
        level: Number(row.level) || 1,
        joinedAt: row.joined_at,
        totalRecharge: Number(row.total_recharge) || 0,
      }));

      const stats: TeamStats = { ...emptyStats };
      for (const m of members) {
        if (m.level === 1) { stats.level1Members++; stats.level1Recharges += m.totalRecharge; }
        else if (m.level === 2) { stats.level2Members++; stats.level2Recharges += m.totalRecharge; }
        else if (m.level === 3) { stats.level3Members++; stats.level3Recharges += m.totalRecharge; }
      }
      stats.totalMembers = stats.level1Members + stats.level2Members + stats.level3Members;

      return { members, stats };
    },
    enabled: !!user?.id,
    staleTime: 0,
  });
}
