import { Copy, Share2, Users, User, TrendingUp, ChevronRight, Gift, MessageCircle, Send, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from 'sonner';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/contexts/AuthContext';

const ORANGE     = '#FF6A00';
const BTN_GRAD   = 'linear-gradient(135deg, #FF8A00 0%, #FF6A00 100%)';
const BTN_SHADOW = '0 8px 20px rgba(255,106,0,0.38)';

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 8px 24px rgba(255,106,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.75)',
  borderRadius: 20,
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
    const shareText = `Join & Start Earning! Use my referral code: ${referralCode}\n\nEarn up to ₹350 per referral!\n${referralLink}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Join & Start Earning!', text: shareText, url: referralLink }); }
      catch { handleCopy(referralLink, 'Referral link'); }
    } else { handleCopy(referralLink, 'Referral link'); }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Join & Start Earning! Use my referral code: ${referralCode}\n\nEarn up to ₹350 per referral!\n${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTelegram = () => {
    const text = encodeURIComponent(`Join & Start Earning! Use my referral code: ${referralCode}\nEarn up to ₹350 per referral!`);
    const url  = encodeURIComponent(referralLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const stats = teamData?.stats;
  const members = teamData?.members ?? [];

  const level1Earnings = (stats?.level1Recharges ?? 0) * 0.13;
  const level2Earnings = (stats?.level2Recharges ?? 0) * 0.05;
  const level3Earnings = (stats?.level3Recharges ?? 0) * 0.02;
  const totalEarnings  = level1Earnings + level2Earnings + level3Earnings;

  const steps = [
    { step: '1', title: 'Invite',    desc: 'Share your code' },
    { step: '2', title: 'Register',  desc: 'They sign up'    },
    { step: '3', title: 'Earn',      desc: 'Get commission'  },
  ];

  return (
    <AppLayout>
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>

        {/* ── Header ── */}
        <div
          className="clay-header px-4 pt-12 pb-6 text-center"
        >
          <h1 className="text-[22px] font-extrabold text-white">Earn Upto ₹350</h1>
          <p className="text-sm mt-1 text-white/75">Per Refer — Share &amp; earn unlimited commission</p>
        </div>

        {/* ── Commission Breakdown ── */}
        <div className="mx-4 mt-4">
          <div style={CARD} className="p-4">
            <h3 className="text-sm font-bold mb-3 text-center" style={{ color: '#2B2B2B' }}>
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
                  style={{ background: '#FFF4EE' }}
                >
                  <p className="text-2xl font-extrabold" style={{ color: ORANGE }}>{l.pct}</p>
                  <p className="text-[10px] mt-1 font-medium" style={{ color: '#8A8A8A' }}>{l.label}</p>
                </div>
              ))}
            </div>
            <div
              className="rounded-xl px-4 py-2.5 text-center"
              style={{ background: '#FFF4EE', border: '1px solid rgba(255,106,0,0.12)' }}
            >
              <p className="text-xs" style={{ color: '#8A8A8A' }}>
                + Extra ₹20 + ₹30 + ₹50 + ₹100 + ₹150 per referral's deposits
              </p>
            </div>
          </div>
        </div>

        {/* ── Referral Code Card ── */}
        <div className="mx-4 mt-4">
          <div style={CARD} className="p-4">
            <p className="text-xs font-semibold mb-2" style={{ color: '#8A8A8A' }}>Your Referral Code</p>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="flex-1 rounded-xl px-4 py-3 font-mono text-xl font-bold tracking-widest text-center"
                style={{ background: '#FFF4EE', border: '1px solid rgba(255,106,0,0.14)', color: ORANGE }}
              >
                {referralCode}
              </div>
              <button
                onClick={() => handleCopy(referralCode, 'Referral code')}
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
                style={{ background: '#FFE3C5' }}
              >
                <Copy className="w-4 h-4" style={{ color: ORANGE }} />
              </button>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={handleWhatsApp}
                className="py-3 rounded-full flex items-center justify-center gap-2 text-sm font-bold text-white transition-all active:scale-95"
                style={{ background: BTN_GRAD, boxShadow: BTN_SHADOW }}
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </button>
              <button
                onClick={handleTelegram}
                className="py-3 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95"
                style={{ background: '#FFF4EE', border: '1.5px solid rgba(255,106,0,0.18)', color: '#2B2B2B' }}
              >
                <Send className="w-4 h-4" /> Telegram
              </button>
            </div>
            <button
              onClick={handleShare}
              className="w-full py-3 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95"
              style={{ background: '#FFF4EE', border: '1.5px solid rgba(255,106,0,0.18)', color: '#2B2B2B' }}
            >
              <Share2 className="w-4 h-4" /> Share Link
            </button>
          </div>
        </div>

        {/* ── How It Works ── */}
        <div className="mx-4 mt-4">
          <div style={CARD} className="p-4">
            <h3 className="font-bold text-center mb-4" style={{ color: '#2B2B2B' }}>How It Works</h3>
            <div className="flex items-center justify-between">
              {steps.map((s, i) => (
                <div key={s.step} className="flex items-center gap-2">
                  <div className="text-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1"
                      style={{ background: BTN_GRAD, boxShadow: BTN_SHADOW }}
                    >
                      <span className="text-sm font-bold text-white">{s.step}</span>
                    </div>
                    <p className="text-xs font-bold" style={{ color: '#2B2B2B' }}>{s.title}</p>
                    <p className="text-[9px]" style={{ color: '#8A8A8A' }}>{s.desc}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 mx-1" style={{ color: '#8A8A8A' }} />
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
            <div key={s.label} style={{ ...CARD, padding: '16px' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: '#FFE3C5' }}>
                <s.icon className="w-4 h-4" style={{ color: ORANGE }} />
              </div>
              <p className="text-xs" style={{ color: '#8A8A8A' }}>{s.label}</p>
              <p className="text-2xl font-extrabold" style={{ color: '#2B2B2B' }}>
                {isLoading ? '...' : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Earnings Breakdown ── */}
        <div className="mx-4 mt-4">
          <div style={CARD} className="p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#2B2B2B' }}>
              <TrendingUp className="w-5 h-5" style={{ color: ORANGE }} />
              Referral Earnings
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Level 1 (13%)', value: level1Earnings },
                { label: 'Level 2 (5%)',  value: level2Earnings },
                { label: 'Level 3 (2%)',  value: level3Earnings },
              ].map((e) => (
                <div key={e.label} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#8A8A8A' }}>{e.label}</span>
                  <span className="font-bold" style={{ color: '#2B2B2B' }}>₹{e.value.toFixed(0)}</span>
                </div>
              ))}
              <div
                className="pt-3 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}
              >
                <span className="font-bold" style={{ color: '#2B2B2B' }}>Total Earnings</span>
                <span className="text-lg font-extrabold" style={{ color: ORANGE }}>
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
            style={{ background: BTN_GRAD, boxShadow: BTN_SHADOW }}
          >
            <Gift className="w-4 h-4" />
            Extra Referral Bonus
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        </div>

        {/* ── Team Members Link ── */}
        <div className="mx-4 mt-4 mb-6">
          <button
            onClick={() => navigate('/team-members')}
            className="w-full flex items-center justify-between px-4 py-4"
            style={CARD}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFE3C5' }}>
                <Users className="w-5 h-5" style={{ color: ORANGE }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: '#2B2B2B' }}>Team Members</p>
                <p className="text-xs" style={{ color: '#8A8A8A' }}>View all your team members</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: '#8A8A8A' }} />
          </button>
        </div>

      </div>
    </AppLayout>
  );
};

export default Team;
