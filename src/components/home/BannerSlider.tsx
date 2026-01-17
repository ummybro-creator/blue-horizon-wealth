import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  {
    id: 1,
    title: 'Unmatched range',
    subtitle: 'for your day to day needs',
    bgColor: 'bg-gradient-to-r from-amber-100 to-orange-100',
  },
  {
    id: 2,
    title: 'Premium Quality',
    subtitle: 'Best FMCG Products',
    bgColor: 'bg-gradient-to-r from-blue-100 to-cyan-100',
  },
  {
    id: 3,
    title: 'Daily Earnings',
    subtitle: 'Invest & Earn Daily',
    bgColor: 'bg-gradient-to-r from-green-100 to-emerald-100',
  },
];

export function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-4 rounded-2xl overflow-hidden shadow-card">
      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`min-w-full h-40 ${banner.bgColor} flex flex-col items-center justify-center p-4`}
          >
            <h3 className="text-xl font-bold text-primary">{banner.title}</h3>
            <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
            <div className="flex gap-2 mt-4">
              <div className="w-12 h-16 bg-card rounded-lg shadow-sm flex items-center justify-center">
                <span className="text-xs font-bold text-primary">TATA</span>
              </div>
              <div className="w-12 h-16 bg-card rounded-lg shadow-sm flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">Salt</span>
              </div>
              <div className="w-12 h-16 bg-card rounded-lg shadow-sm flex items-center justify-center">
                <span className="text-xs font-bold text-pink-500">Pink</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-primary w-4' : 'bg-primary/30'
            }`}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <p className="absolute bottom-0 left-0 right-0 text-[8px] text-muted-foreground text-center bg-card/80 py-1 px-2">
        *This is only a brand name and does not represent its true nature. Images are for illustration purpose.
      </p>
    </div>
  );
}
