import { useState, useEffect } from 'react';
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

      {/* ── Welcome Popup ── */}
      <WelcomePopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
    </AppLayout>
  );
};

export default Index;
