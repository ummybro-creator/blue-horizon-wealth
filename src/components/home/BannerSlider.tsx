import { useState, useEffect } from 'react';
import { LazyImage } from '@/components/ui/LazyImage';

const banners = [
  { id: 1, image: 'https://files.catbox.moe/22p7fe.jpg' },
  { id: 2, image: 'https://files.catbox.moe/notm4r.jpg' },
  { id: 3, image: 'https://files.catbox.moe/tnvmtm.jpg' },
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
    <div
      className="relative overflow-hidden"
      style={{ borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full h-52">
            <LazyImage
              src={banner.image}
              alt={`Banner ${banner.id}`}
              className="w-full h-full object-cover"
              wrapperClassName="w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-primary w-5' : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
