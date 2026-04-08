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
      {/* ── Header ── */}
      <div
        className="px-4 pt-12 pb-5 text-center"
        style={{
          background: 'linear-gradient(135deg, #F04438, #E03328)',
          borderRadius: '0 0 30px 30px',
          boxShadow: '0 6px 20px rgba(240,68,56,0.28)',
        }}
      >
        <h1 className="text-[22px] font-extrabold text-white">Home</h1>
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
