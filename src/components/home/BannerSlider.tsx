import { useState, useEffect } from 'react';

const banners = [
  { id: 1, image: 'https://files.catbox.moe/jpq9i3.jpg' },
  { id: 2, image: 'https://files.catbox.moe/mr1kts.jpg' },
  { id: 3, image: 'https://files.catbox.moe/ksfp44.jpg' },
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
    <div className="clay-card overflow-hidden" style={{ borderRadius: '22px' }}>
      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full h-40">
            <img 
              src={banner.image} 
              alt={`Banner ${banner.id}`}
              className="w-full h-full object-cover"
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
