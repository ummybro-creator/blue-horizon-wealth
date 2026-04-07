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
      {/* Header */}
      <div className="clay-header pt-12 pb-8 px-4">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-2xl font-bold text-primary-foreground">Home</h1>
        </div>
      </div>

      {/* Banner Slider */}
      <div className="-mt-4 px-4">
        <BannerSlider />
      </div>

      {/* Quick Menu */}
      <QuickMenu />

      {/* Recent Activity */}
      <RecentPayments />

      {/* Floating Telegram Button */}
      <button
        onClick={() => window.open('https://t.me/tatanmak', '_blank')}
        className="fixed bottom-28 right-4 w-14 h-14 rounded-full clay-button flex items-center justify-center z-40"
      >
        <Send className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Welcome Popup */}
      <WelcomePopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
    </AppLayout>
  );
};

export default Index;
