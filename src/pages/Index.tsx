import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BannerSlider } from '@/components/home/BannerSlider';
import { QuickMenu } from '@/components/home/QuickMenu';
import { LatestNews } from '@/components/home/LatestNews';
import { WelcomePopup } from '@/components/home/WelcomePopup';

const Index = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Show popup once per session
    const hasSeenPopup = sessionStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenPopup) {
      setShowPopup(true);
      sessionStorage.setItem('hasSeenWelcomePopup', 'true');
    }
  }, []);

  return (
    <AppLayout>
      {/* Header */}
      <div className="gradient-header pt-12 pb-6 px-4">
        <h1 className="text-2xl font-bold text-primary-foreground text-center">Home</h1>
      </div>

      {/* Banner Slider */}
      <div className="-mt-2">
        <BannerSlider />
      </div>

      {/* Quick Menu */}
      <QuickMenu />

      {/* Latest News */}
      <LatestNews />

      {/* Floating Telegram Button */}
      <button
        onClick={() => window.open('https://t.me/tatanmak', '_blank')}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full gradient-primary shadow-button flex items-center justify-center z-40"
      >
        <Send className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Welcome Popup */}
      <WelcomePopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
    </AppLayout>
  );
};

export default Index;
