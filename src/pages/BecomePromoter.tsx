import { useState } from 'react';
import { ArrowLeft, Send, Users, Megaphone, CheckCircle2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const D = {
  redGrad:       'linear-gradient(135deg, #D9040A, #B50309)',
  redGradLight:  'linear-gradient(135deg, #F04438, #D9040A)',
  pageBg:        '#FFF5F5',
  card:          '#FFFFFF',
  textPrimary:   '#111827',
  textSecondary: '#6B7280',
  border:        '#E5E7EB',
  inputBg:       '#FAF8F8',
  shadowCard:    '0 2px 16px rgba(0,0,0,0.06)',
  shadowRed:     '0 8px 24px rgba(217,4,10,0.28)',
  shadowSoft:    '0 8px 20px rgba(0,0,0,0.05)',
};

function formatPhone(phone: string | undefined) {
  if (!phone) return '';
  return phone.replace(/@app\.local$/, '');
}

const BecomePromoter = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const userName = profile?.full_name || 'User';
  const phone    = formatPhone(profile?.phone_number);

  const [form, setForm]     = useState({ contact: '', audience: '', strategy: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const isValid    = form.contact.trim().length > 0 && form.strategy.trim().length > 0;
  const isSending  = status === 'sending';
  const isSent     = status === 'sent';
  const isDisabled = isSending || isSent || !isValid;

  const handleSubmit = async () => {
    if (!isValid || isSending) return;
    setStatus('sending');
    try {
      const message =
        `📢 PROMOTER APPLICATION\n\n` +
        `Contact: ${form.contact}\n` +
        `Audience: ${form.audience || 'Not specified'}\n` +
        `Strategy: ${form.strategy}\n\n` +
        `User: ${userName} | ${phone}`;

      const { error } = await supabase.from('support_tickets').insert({
        user_id: profile?.id,
        subject: 'Promoter Application',
        message,
        status:  'open',
      });

      if (error) throw error;
      setStatus('sent');
      setForm({ contact: '', audience: '', strategy: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <AppLayout>
      <div
        className="min-h-screen pb-36"
        style={{ background: D.pageBg }}
      >
        {/* ══════════════ HEADER ══════════════ */}
        <div
          className="px-4 pt-10 pb-8"
          style={{
            background: D.redGrad,
            borderRadius: '0 0 32px 32px',
            boxShadow: D.shadowSoft,
          }}
        >
          {/* Back row */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-extrabold text-white">Become a Promoter</h1>
          </div>

          {/* Hero card */}
          <div
            className="rounded-[20px] px-5 py-5 flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.22)' }}
            >
              <Megaphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-base font-extrabold text-white leading-tight">
                Partner with Veltrix &amp; earn more
              </p>
              <p className="text-[12px] text-white/75 mt-1 leading-snug">
                Join our promoter network and unlock exclusive rewards for every referral you bring.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════ FORM CARD ══════════════ */}
        <div
          className="mx-4 mt-5 rounded-[22px] overflow-hidden"
          style={{ background: D.card, boxShadow: D.shadowCard }}
        >
          <div className="px-5 py-5 space-y-5">

            {/* Field 1 — Contact */}
            <div>
              <label
                className="flex items-center gap-1.5 text-[11px] font-bold mb-2 uppercase tracking-wide"
                style={{ color: '#D9040A' }}
              >
                <Send className="w-3 h-3" />
                Telegram Username or Contact Number
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="@yourusername or +91 XXXXXXXXXX"
                value={form.contact}
                onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                disabled={isSent}
                className="w-full px-4 py-3.5 rounded-[14px] text-sm outline-none transition-all"
                style={{
                  background: D.inputBg,
                  border: `1.5px solid ${form.contact.trim() ? '#D9040A' : D.border}`,
                  color: D.textPrimary,
                  boxShadow: form.contact.trim() ? '0 0 0 3px rgba(217,4,10,0.08)' : 'none',
                }}
              />
            </div>

            {/* Field 2 — Audience */}
            <div>
              <label
                className="flex items-center gap-1.5 text-[11px] font-bold mb-2 uppercase tracking-wide"
                style={{ color: '#D9040A' }}
              >
                <Users className="w-3 h-3" />
                Audience / Followers Data
              </label>
              <input
                type="text"
                placeholder="e.g. 5 000 Instagram followers, 2 000 Telegram members"
                value={form.audience}
                onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                disabled={isSent}
                className="w-full px-4 py-3.5 rounded-[14px] text-sm outline-none transition-all"
                style={{
                  background: D.inputBg,
                  border: `1.5px solid ${form.audience.trim() ? '#D9040A' : D.border}`,
                  color: D.textPrimary,
                  boxShadow: form.audience.trim() ? '0 0 0 3px rgba(217,4,10,0.08)' : 'none',
                }}
              />
            </div>

            {/* Field 3 — Strategy */}
            <div>
              <label
                className="flex items-center gap-1.5 text-[11px] font-bold mb-2 uppercase tracking-wide"
                style={{ color: '#D9040A' }}
              >
                <Megaphone className="w-3 h-3" />
                Promotion Strategy
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Briefly describe how you plan to promote Veltrix — channels, tactics, content ideas..."
                value={form.strategy}
                onChange={e => setForm(f => ({ ...f, strategy: e.target.value }))}
                disabled={isSent}
                className="w-full px-4 py-3.5 rounded-[14px] text-sm outline-none resize-none transition-all"
                style={{
                  background: D.inputBg,
                  border: `1.5px solid ${form.strategy.trim() ? '#D9040A' : D.border}`,
                  color: D.textPrimary,
                  boxShadow: form.strategy.trim() ? '0 0 0 3px rgba(217,4,10,0.08)' : 'none',
                }}
              />
            </div>

            {/* Status messages */}
            {isSent && (
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-[14px]"
                style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#059669' }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: '#065F46' }}>Application submitted!</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#059669' }}>
                    Our team will review it and reach out to you shortly.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div
                className="px-4 py-3 rounded-[14px] text-sm font-semibold text-center"
                style={{ background: '#FEE2E2', color: '#B91C1C' }}
              >
                ❌ Something went wrong. Please try again.
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="w-full py-4 rounded-[16px] text-sm font-extrabold text-white transition-all active:scale-[0.98]"
              style={{
                background: isDisabled ? '#E5E7EB' : D.redGrad,
                boxShadow: isDisabled ? 'none' : D.shadowRed,
                color: isDisabled ? D.textSecondary : '#FFFFFF',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : isSent ? (
                '✅ Application Submitted'
              ) : (
                '🚀 Submit Application'
              )}
            </button>

            <p className="text-center text-[11px]" style={{ color: D.textSecondary }}>
              Fields marked with <span className="text-red-500 font-bold">*</span> are required
            </p>
          </div>
        </div>

        {/* ══════════════ WHY PROMOTE ══════════════ */}
        <div className="px-4 mt-4">
          <div
            className="rounded-[20px] px-5 py-4"
            style={{ background: D.card, boxShadow: D.shadowCard }}
          >
            <p className="text-xs font-extrabold uppercase tracking-wide mb-3" style={{ color: '#D9040A' }}>
              Why become a promoter?
            </p>
            {[
              { emoji: '💰', text: 'Earn commissions on every referral you bring' },
              { emoji: '🏆', text: 'Exclusive rewards and early access to new features' },
              { emoji: '📊', text: 'Track your earnings in real-time on the dashboard' },
              { emoji: '🤝', text: 'Dedicated support from the Veltrix team' },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-3 py-2">
                <span className="text-base">{emoji}</span>
                <p className="text-[12px] font-medium" style={{ color: D.textPrimary }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default BecomePromoter;
