import { useState } from 'react';
import { Send } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BannerSlider } from '@/components/home/BannerSlider';
import { QuickMenu } from '@/components/home/QuickMenu';
import { RecentPayments } from '@/components/home/RecentPayments';
import { WelcomePopup } from '@/components/home/WelcomePopup';

const Index = () => {
  const hideToday = sessionStorage.getItem('hidePopupToday') === 'true';
  const [showPopup, setShowPopup] = useState(!hideToday);

  return (
    <AppLayout>
      {/* ── Light Gradient Header ── */}
      <div
        className="px-4 pt-12 pb-5 text-center"
        style={{
          background: 'linear-gradient(180deg, #E8F8EE 0%, #F7FCF9 100%)',
          borderRadius: '0 0 28px 28px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
        }}
      >
        <h1 className="text-xl font-extrabold" style={{ color: '#111827' }}>
          Home
        </h1>
      </div>

      {/* ── Banner ── */}
      <div className="mt-4 px-4">
        <BannerSlider />
      </div>

      {/* ── Quick Menu ── */}
      <QuickMenu />

      {/* ── Recent Activity ── */}
      <RecentPayments />

      {/* ── Floating Telegram Button ── */}
      <button
        onClick={() => window.open('https://t.me/tatanmak', '_blank')}
        className="fixed bottom-[80px] right-4 w-14 h-14 rounded-full flex items-center justify-center z-40 transition-all active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #22C55E, #16A34A)',
          boxShadow: '0 6px 20px rgba(34,197,94,0.35)',
        }}
      >
        <Send className="w-6 h-6 text-white" />
      </button>

      {/* ── Welcome Popup ── */}
      <WelcomePopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
    </AppLayout>
  );
};

export default Index;
