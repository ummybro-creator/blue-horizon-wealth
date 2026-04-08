import { Copy, Share2, Users, User, TrendingUp, ChevronRight, Gift, MessageCircle, Send, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from 'sonner';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

/* ── Design tokens ── */
const D = {
  primary:     '#22C55E',
  primaryDark: '#16A34A',
  btnGrad:     'linear-gradient(135deg, #22C55E, #16A34A)',
  headerGrad:  'linear-gradient(180deg, #E8F8EE 0%, #F7FCF9 100%)',
  statsCard:   '#F0FDF4',
  card:        '#FFFFFF',
  textPrimary: '#111827',
  textSec:     '#6B7280',
  border:      '#E5E7EB',
  shadowCard:  '0 2px 12px rgba(0,0,0,0.06)',
  shadowGreen: '0 8px 24px rgba(34,197,94,0.22)',
  iconBg:      '#DCFCE7',
};

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
    const shareText = `🎉 Join & Start Earning! Use my referral code: ${referralCode}\n\nEarn up to ₹350 per referral!\n${referralLink}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Join & Start Earning!', text: shareText, url: referralLink }); }
      catch { handleCopy(referralLink, 'Referral link'); }
    } else { handleCopy(referralLink, 'Referral link'); }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`🎉 Join & Start Earning! Use my referral code: ${referralCode}\n\nEarn up to ₹350 per referral!\n${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTelegram = () => {
    const text = encodeURIComponent(`🎉 Join & Start Earning! Use my referral code: ${referralCode}\nEarn up to ₹350 per referral!`);
    const url = encodeURIComponent(referralLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const stats = teamData?.stats;
  const members = teamData?.members ?? [];

  const level1Earnings = (stats?.level1Recharges ?? 0) * 0.13;
  const level2Earnings = (stats?.level2Recharges ?? 0) * 0.05;
  const level3Earnings = (stats?.level3Recharges ?? 0) * 0.02;
  const totalEarnings = level1Earnings + level2Earnings + level3Earnings;

  const steps = [
    { step: '1', title: 'Invite',    desc: 'Share your code' },
    { step: '2', title: 'Register',  desc: 'They sign up'    },
    { step: '3', title: 'Earn',      desc: 'Get commission'  },
  ];

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div
        className="px-4 pt-12 pb-6 text-center"
        style={{
          background: 'linear-gradient(135deg, #D9040A, #B50309)',
          borderRadius: '0 0 30px 30px',
          boxShadow: '0 6px 20px rgba(217,4,10,0.25)',
        }}
      >
        <h1 className="text-[22px] font-extrabold text-white">Earn Upto ₹350</h1>
        <p className="text-sm mt-1 text-white/75">Per Refer — Share & earn unlimited commission</p>
      </div>

      {/* ── Commission Breakdown ── */}
      <div className="mx-4 mt-4">
        <div
          className="rounded-[20px] p-4"
          style={{ background: D.card, boxShadow: D.shadowCard }}
        >
          <h3 className="text-sm font-bold mb-3 text-center" style={{ color: D.textPrimary }}>
            Commission Rates
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label: 'Level 1', pct: '13%' },
              { label: 'Level 2', pct: '5%'  },
              { label: 'Level 3', pct: '2%'  },
            ].map((l) => (
              <div
                key={l.label}
                className="text-center py-3 px-2 rounded-2xl"
                style={{ background: D.statsCard }}
              >
                <p className="text-2xl font-extrabold" style={{ color: D.primary }}>{l.pct}</p>
                <p className="text-[10px] mt-1 font-medium" style={{ color: D.textSec }}>{l.label}</p>
              </div>
            ))}
          </div>
          <div
            className="rounded-xl px-4 py-2.5 text-center"
            style={{ background: '#F9FAFB', border: `1px solid ${D.border}` }}
          >
            <p className="text-xs" style={{ color: D.textSec }}>
              + Extra ₹20 + ₹30 + ₹50 + ₹100 + ₹150 per referral's deposits
            </p>
          </div>
        </div>
      </div>

      {/* ── Referral Code Card ── */}
      <div className="mx-4 mt-4">
        <div
          className="rounded-[20px] p-4"
          style={{ background: D.card, boxShadow: D.shadowCard }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: D.textSec }}>Your Referral Code</p>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex-1 rounded-xl px-4 py-3 font-mono text-xl font-bold tracking-widest text-center"
              style={{
                background: '#F9FAFB',
                border: `1px solid ${D.border}`,
                color: D.primary,
              }}
            >
              {referralCode}
            </div>
            <button
              onClick={() => handleCopy(referralCode, 'Referral code')}
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
              style={{ background: D.iconBg }}
            >
              <Copy className="w-4 h-4" style={{ color: D.primary }} />
            </button>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={handleWhatsApp}
              className="py-3 rounded-full flex items-center justify-center gap-2 text-sm font-bold text-white transition-all active:scale-95"
              style={{ background: D.btnGrad, boxShadow: D.shadowGreen }}
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            <button
              onClick={handleTelegram}
              className="py-3 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95"
              style={{
                background: D.card,
                border: `1.5px solid ${D.border}`,
                color: D.textPrimary,
              }}
            >
              <Send className="w-4 h-4" /> Telegram
            </button>
          </div>
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95"
            style={{
              background: '#F9FAFB',
              border: `1.5px solid ${D.border}`,
              color: D.textPrimary,
            }}
          >
            <Share2 className="w-4 h-4" /> Share Link
          </button>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="mx-4 mt-4">
        <div
          className="rounded-[20px] p-4"
          style={{ background: D.card, boxShadow: D.shadowCard }}
        >
          <h3 className="font-bold text-center mb-4" style={{ color: D.textPrimary }}>
            How It Works
          </h3>
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.step} className="flex items-center gap-2">
                <div className="text-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1"
                    style={{ background: D.btnGrad, boxShadow: D.shadowGreen }}
                  >
                    <span className="text-sm font-bold text-white">{s.step}</span>
                  </div>
                  <p className="text-xs font-bold" style={{ color: D.textPrimary }}>{s.title}</p>
                  <p className="text-[9px]" style={{ color: D.textSec }}>{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 mx-1" style={{ color: D.textSec }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        {[
          { label: 'Total Team', value: stats?.totalMembers ?? 0, icon: Users },
          { label: 'Level 1',    value: stats?.level1Members ?? 0, icon: User  },
          { label: 'Level 2',    value: stats?.level2Members ?? 0, icon: User  },
          { label: 'Level 3',    value: stats?.level3Members ?? 0, icon: User  },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[18px] p-4"
            style={{ background: D.card, boxShadow: D.shadowCard }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
              style={{ background: D.iconBg }}
            >
              <s.icon className="w-4 h-4" style={{ color: D.primary }} />
            </div>
            <p className="text-xs" style={{ color: D.textSec }}>{s.label}</p>
            <p className="text-2xl font-extrabold" style={{ color: D.textPrimary }}>
              {isLoading ? '...' : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Earnings Breakdown ── */}
      <div className="mx-4 mt-4">
        <div
          className="rounded-[20px] p-4"
          style={{ background: D.card, boxShadow: D.shadowCard }}
        >
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: D.textPrimary }}>
            <TrendingUp className="w-5 h-5" style={{ color: D.primary }} />
            Referral Earnings
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Level 1 (13%)', value: level1Earnings },
              { label: 'Level 2 (5%)',  value: level2Earnings },
              { label: 'Level 3 (2%)',  value: level3Earnings },
            ].map((e) => (
              <div key={e.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: D.textSec }}>{e.label}</span>
                <span className="font-bold" style={{ color: D.textPrimary }}>₹{e.value.toFixed(0)}</span>
              </div>
            ))}
            <div
              className="pt-3 flex items-center justify-between"
              style={{ borderTop: `1px solid ${D.border}` }}
            >
              <span className="font-bold" style={{ color: D.textPrimary }}>Total Earnings</span>
              <span className="text-lg font-extrabold" style={{ color: D.primary }}>
                ₹{totalEarnings.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Extra Bonus Button ── */}
      <div className="mx-4 mt-4">
        <button
          onClick={() => navigate('/extra-bonus')}
          className="w-full py-4 rounded-full flex items-center justify-center gap-2 text-sm font-bold text-white transition-all active:scale-[0.97]"
          style={{ background: D.btnGrad, boxShadow: D.shadowGreen }}
        >
          <Gift className="w-4 h-4" />
          Extra Referral Bonus
          <ChevronRight className="w-4 h-4 ml-auto" />
        </button>
      </div>

      {/* ── Team Members ── */}
      <div className="mx-4 mt-4 mb-6">
        <h3 className="text-base font-bold mb-3" style={{ color: D.textPrimary }}>Team Members</h3>
        <div
          className="rounded-[20px] overflow-hidden"
          style={{ background: D.card, boxShadow: D.shadowCard }}
        >
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
              <Users className="w-10 h-10 mx-auto mb-2" style={{ color: '#D1FAE5' }} />
              <p className="text-sm" style={{ color: D.textSec }}>No team members yet</p>
            </div>
          ) : (
            members.map((member, index) => (
              <div
                key={member.id}
                className={cn('grid grid-cols-4 gap-2 px-4 py-3 items-center')}
                style={{
                  borderBottom: index !== members.length - 1 ? `1px solid ${D.border}` : 'none',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: '#DCFCE7' }}
                  >
                    <span className="text-xs font-bold" style={{ color: D.primary }}>
                      {(member?.name ?? 'U').charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium truncate" style={{ color: D.textPrimary }}>
                    {member?.name ?? 'User'}
                  </span>
                </div>
                <div className="text-center">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: '#DCFCE7', color: D.primary }}
                  >
                    L{member.level}
                  </span>
                </div>
                <p className="text-xs text-center" style={{ color: D.textSec }}>
                  {new Date(member.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <div className="text-right">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: '#DCFCE7', color: D.primary }}
                  >
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
