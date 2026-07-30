import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Headphones, MessageCircle, Clock, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

const ORANGE     = '#16A34A';
const BTN_GRAD   = 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)';
const BTN_SHADOW = '0 10px 24px rgba(22,163,74,0.38)';

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 8px 24px rgba(22,163,74,0.08), 0 2px 6px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.75)',
  borderRadius: 24,
};

const TELEGRAM_USERNAME = 'andry0725';
const TELEGRAM_URL = `https://t.me/${TELEGRAM_USERNAME}`;

const faqs = [
  { q: 'How do I recharge my wallet?', a: 'Go to Recharge, enter amount, scan the QR & submit your UTR after payment.' },
  { q: 'When will my funds be credited?', a: 'Funds are credited automatically after successful payment verification.' },
  { q: 'How do I withdraw my earnings?', a: 'Go to Profile → Withdraw. Minimum withdrawal is ₹180. Processed within 24 hrs.' },
  { q: 'How does the referral program work?', a: 'Share your referral code. You earn commission on every deposit your referrals make.' },
];

const ContactSupport = () => {
  const navigate = useNavigate();

  const openTelegram = () => {
    window.open(TELEGRAM_URL, '_blank');
  };

  return (
    <AppLayout>
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>

        {/* Header */}
        <div className="clay-header pt-12 pb-8 px-4">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Customer Support</h1>
          </div>

          {/* Hero */}
          <div
            className="rounded-[20px] px-5 py-4 flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.22)' }}
            >
              <Headphones className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-base font-extrabold text-white leading-tight">We're here to help</p>
              <p className="text-[12px] text-white/75 mt-1 leading-snug">
                Reach us on Telegram for fast support — usually within a few minutes.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 space-y-4 -mt-2">

          {/* Telegram Contact Card */}
          <div style={CARD} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Send className="w-4 h-4" style={{ color: ORANGE }} />
              <p className="font-bold text-sm" style={{ color: '#2B2B2B' }}>Contact via Telegram</p>
            </div>

            <div
              className="flex items-center gap-4 rounded-2xl px-4 py-3 mb-4"
              style={{ background: '#F0FDF4', border: '1px solid rgba(22,163,74,0.14)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: BTN_GRAD }}
              >
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#8A8A8A' }}>Telegram ID</p>
                <p className="text-base font-extrabold" style={{ color: ORANGE }}>@{TELEGRAM_USERNAME}</p>
              </div>
            </div>

            <button
              onClick={openTelegram}
              className="w-full py-4 rounded-full text-base font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{ background: BTN_GRAD, boxShadow: BTN_SHADOW }}
            >
              <Send className="w-5 h-5" />
              Contact Support on Telegram
            </button>
          </div>

          {/* Support Info */}
          <div style={CARD} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" style={{ color: ORANGE }} />
              <p className="font-bold text-sm" style={{ color: '#2B2B2B' }}>Support Info</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: Clock,          label: 'Response Time',    value: 'Within a few minutes' },
                { icon: MessageCircle,  label: 'Support Channel',  value: 'Telegram only' },
                { icon: Shield,         label: 'Available',        value: 'Mon – Sun, 9 AM – 9 PM' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: '#F0FDF4' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: ORANGE }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#8A8A8A' }}>{label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#2B2B2B' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div style={CARD} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4" style={{ color: ORANGE }} />
              <p className="font-bold text-sm" style={{ color: '#2B2B2B' }}>Common Questions</p>
            </div>
            <div className="space-y-2">
              {faqs.map(({ q, a }) => (
                <details key={q} className="group rounded-2xl overflow-hidden" style={{ background: '#F0FDF4' }}>
                  <summary
                    className="flex items-center justify-between px-4 py-3 cursor-pointer list-none text-xs font-semibold"
                    style={{ color: '#2B2B2B' }}
                  >
                    {q}
                    <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-open:rotate-90" style={{ color: ORANGE }} />
                  </summary>
                  <p className="px-4 pb-3 text-xs leading-relaxed" style={{ color: '#666' }}>{a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Chat Support CTA */}
          <button
            onClick={() => navigate('/support')}
            className="w-full py-4 rounded-full text-base font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            style={{
              background: '#F0FDF4',
              border: '1.5px solid rgba(22,163,74,0.2)',
              color: ORANGE,
            }}
          >
            <MessageCircle className="w-5 h-5" />
            Open Live Chat
          </button>

        </div>
      </div>
    </AppLayout>
  );
};

export default ContactSupport;
