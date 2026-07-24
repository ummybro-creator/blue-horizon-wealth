import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BannerSlider } from '@/components/home/BannerSlider';
import { QuickMenu } from '@/components/home/QuickMenu';
import { RecentPayments } from '@/components/home/RecentPayments';
import { FeaturedProduct } from '@/components/home/FeaturedProduct';
import { WelcomePopup } from '@/components/home/WelcomePopup';

const Index = () => {
  const [showPopup, setShowPopup] = useState(true);

  // Re-open popup whenever the home nav button is tapped (even if already on home)
  useEffect(() => {
    const handler = () => setShowPopup(true);
    window.addEventListener('show-home-popup', handler);
    return () => window.removeEventListener('show-home-popup', handler);
  }, []);

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div
        className="px-4 pt-12 pb-5 text-center clay-header"
      >
        <h1 className="text-[22px] font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Home
        </h1>
      </div>

      {/* ── Banner ── */}
      <div className="mt-4 px-4">
        <BannerSlider />
      </div>

      {/* ── Quick Menu ── */}
      <QuickMenu />

      {/* ── Featured Product ── */}
      <div className="mt-4">
        <FeaturedProduct />
      </div>

      {/* ── Recent Activity ── */}
      <RecentPayments />

      {/* ── Floating Telegram Button ── */}
      <button
        onClick={() => window.open('https://t.me/tatanmak', '_blank')}
        className="fixed bottom-[72px] right-4 w-14 h-14 rounded-full flex items-center justify-center z-40 transition-all active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #FF8A00, #FF6A00)',
          boxShadow: '0 6px 20px rgba(255,106,0,0.40)',
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
