import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTeam } from '@/hooks/useTeam';
import { cn } from '@/lib/utils';

const D = {
  primary: '#FF5A0A',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSec: '#6B7280',
  border: '#E5E7EB',
  shadowCard: '0 2px 12px rgba(0,0,0,0.06)',
  iconBg: '#FFE3C5',
};

const TeamMembers = () => {
  const navigate = useNavigate();
  const { data: teamData, isLoading } = useTeam();
  const members = teamData?.members ?? [];

  return (
    <AppLayout>
      <div
        className="px-4 pt-12 pb-6"
        style={{
          background: 'linear-gradient(135deg, #FF5A0A, #FF6F1F)',
          borderRadius: '0 0 30px 30px',
          boxShadow: '0 6px 20px rgba(240,68,56,0.28)',
        }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-[20px] font-extrabold text-white">Team Members</h1>
        </div>
      </div>

      <div className="mx-4 mt-4 mb-6">
        <div className="rounded-[20px] overflow-hidden" style={{ background: D.card, boxShadow: D.shadowCard }}>
          <div
            className="grid grid-cols-4 gap-2 px-4 py-3 text-xs font-semibold"
            style={{ background: '#F9FAFB', color: D.textSec, borderBottom: `1px solid ${D.border}` }}
          >
            <span>User</span>
            <span className="text-center">Level</span>
            <span className="text-center">Joined</span>
            <span className="text-right">Status</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center" style={{ color: D.textSec }}>Loading...</div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-10 h-10 mx-auto mb-2" style={{ color: '#FFE3C5' }} />
              <p className="text-sm" style={{ color: D.textSec }}>No team members yet</p>
            </div>
          ) : (
            members.map((member, index) => (
              <div
                key={member.id}
                className={cn('grid grid-cols-4 gap-2 px-4 py-3 items-center')}
                style={{ borderBottom: index !== members.length - 1 ? `1px solid ${D.border}` : 'none' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFE3C5' }}>
                    <span className="text-xs font-bold" style={{ color: D.primary }}>
                      {(member?.name ?? 'U').charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium truncate" style={{ color: D.textPrimary }}>
                    {member?.name ?? 'User'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FFE3C5', color: D.primary }}>
                    L{member.level}
                  </span>
                </div>
                <p className="text-xs text-center" style={{ color: D.textSec }}>
                  {new Date(member.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <div className="text-right">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FFE3C5', color: D.primary }}>
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

export default TeamMembers;
