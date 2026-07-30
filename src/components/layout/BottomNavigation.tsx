import { Home, Briefcase, BarChart3, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { icon: Home,      label: 'Home',      path: '/'         },
  { icon: Briefcase, label: 'Products',  path: '/products' },
  { icon: BarChart3, label: 'Promotion', path: '/team'     },
  { icon: User,      label: 'Profile',   path: '/profile'  },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate  = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Flat, solid bottom nav — no glassmorphism, no blur */}
      <div
        className="bottom-nav-flat flex items-center justify-around h-[62px] px-2"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                if (item.path === '/' && location.pathname === '/') {
                  window.dispatchEvent(new CustomEvent('show-home-popup'));
                } else {
                  navigate(item.path);
                }
              }}
              className="relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all duration-200"
            >
              <item.icon
                className="w-[22px] h-[22px] transition-all duration-200"
                style={{ color: isActive ? '#16A34A' : '#AAAAAA' }}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className="text-[10px] font-semibold transition-all duration-200"
                style={{
                  color: isActive ? '#16A34A' : '#AAAAAA',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {item.label}
              </span>
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full"
                  style={{ background: 'linear-gradient(90deg, #22C55E, #16A34A)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
