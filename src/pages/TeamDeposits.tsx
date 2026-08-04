import { ArrowLeft, Wallet, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTeam } from '@/hooks/useTeam';

const D = {
  primary: '#FF5A0A',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSec: '#6B7280',
  border: '#E5E7EB',
  shadowCard: '0 2px 12px rgba(0,0,0,0.06)',
  iconBg: '#FFE3C5',
};

const inr = (n: number) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const TeamDeposits = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useTeam();
  const members = data?.members ?? [];
  const stats = data?.stats;

  const totalDeposit =
    (stats?.level1Recharges ?? 0) + (stats?.level2Recharges ?? 0) + (stats?.level3Recharges ?? 0);

  const depositors = members.filter((m) => m.totalRecharge > 0);

  const levels = [
    { level: 1, amount: stats?.level1Recharges ?? 0, count: stats?.level1Members ?? 0 },
    { level: 2, amount: stats?.level2Recharges ?? 0, count: stats?.level2Members ?? 0 },
    { level: 3, amount: stats?.level3Recharges ?? 0, count: stats?.level3Members ?? 0 },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div
        className="px-4 pt-12 pb-16"
        style={{
          background: 'linear-gradient(135deg, #FF5A0A, #FF6F1F)',
          borderRadius: '0 0 30px 30px',
          boxShadow: '0 6px 20px rgba(240,68,56,0.28)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-[20px] font-extrabold text-white">Team Deposits</h1>
        </div>
      </div>

      {/* Total deposit card */}
      <div className="mx-4 -mt-10 relative z-10">
        <div className="rounded-[22px] px-5 py-5" style={{ background: D.card, boxShadow: D.shadowCard }}>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4" style={{ color: D.primary }} />
            <p className="text-xs font-semibold" style={{ color: D.textSec }}>
              Total Team Deposit
            </p>
          </div>
          <p className="text-[30px] font-extrabold leading-tight" style={{ color: D.textPrimary }}>
            {isLoading ? '—' : inr(totalDeposit)}
          </p>
          <p className="text-xs mt-1" style={{ color: D.textSec }}>
            From {depositors.length} depositing member{depositors.length === 1 ? '' : 's'} in your team
          </p>
        </div>
      </div>

      {/* Level breakdown */}
      <div className="mx-4 mt-4 grid grid-cols-3 gap-3">
        {levels.map((l) => (
          <div
            key={l.level}
            className="rounded-[18px] px-3 py-4 text-center"
            style={{ background: D.card, boxShadow: D.shadowCard }}
          >
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: D.iconBg, color: D.primary }}
            >
              LEVEL {l.level}
            </span>
            <p className="text-[15px] font-extrabold mt-2" style={{ color: D.textPrimary }}>
              {isLoading ? '—' : inr(l.amount)}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: D.textSec }}>
              {l.count} member{l.count === 1 ? '' : 's'}
            </p>
          </div>
        ))}
      </div>

      {/* Member deposit list */}
      <div className="mx-4 mt-5 mb-8">
        <h2 className="text-sm font-bold mb-2" style={{ color: D.textPrimary }}>
          Deposits by Member
        </h2>
        <div className="rounded-[20px] overflow-hidden" style={{ background: D.card, boxShadow: D.shadowCard }}>
          <div
            className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-3 text-xs font-semibold"
            style={{ background: '#F9FAFB', color: D.textSec, borderBottom: `1px solid ${D.border}` }}
          >
            <span>Member</span>
            <span className="text-center">Level</span>
            <span className="text-right">Deposited</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center" style={{ color: D.textSec }}>
              Loading...
            </div>
          ) : depositors.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-10 h-10 mx-auto mb-2" style={{ color: D.iconBg }} />
              <p className="text-sm" style={{ color: D.textSec }}>
                No deposits from your team yet
              </p>
              <p className="text-xs mt-1" style={{ color: D.textSec }}>
                Invite friends and earn commission on their deposits
              </p>
            </div>
          ) : (
            depositors
              .slice()
              .sort((a, b) => b.totalRecharge - a.totalRecharge)
              .map((m, i) => (
                <div
                  key={`${m.id}-${m.level}`}
                  className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-3 items-center"
                  style={{ borderBottom: i !== depositors.length - 1 ? `1px solid ${D.border}` : 'none' }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: D.iconBg }}
                    >
                      <span className="text-xs font-bold" style={{ color: D.primary }}>
                        {(m.name ?? 'U').charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: D.textPrimary }}>
                        {(m.name ?? 'User').split(' ')[0]}
                      </p>
                      <p className="text-[10px]" style={{ color: D.textSec }}>
                        Joined{' '}
                        {new Date(m.joinedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium text-center"
                    style={{ background: D.iconBg, color: D.primary }}
                  >
                    L{m.level}
                  </span>
                  <p
                    className="text-sm font-bold text-right flex items-center gap-1 justify-end"
                    style={{ color: '#12B76A' }}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    {inr(m.totalRecharge)}
                  </p>
                </div>
              ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TeamDeposits;
