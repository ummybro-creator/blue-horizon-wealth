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
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] max-w-md"
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
    >
      <div className="clay-nav flex items-center justify-around h-[68px] px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all duration-300"
            >
              <div
                className="flex items-center justify-center w-11 h-9 rounded-2xl transition-all duration-300"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #FF7A00 0%, #FFA726 100%)'
                    : 'transparent',
                  boxShadow: isActive
                    ? '0 8px 20px rgba(255,122,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5)'
                    : 'none',
                  transform: isActive ? 'translateY(-2px)' : 'none',
                }}
              >
                <item.icon
                  className="w-[22px] h-[22px] transition-all duration-300"
                  style={{ color: isActive ? '#FFFFFF' : '#B08968' }}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className="text-[10px] font-bold tracking-wide transition-all duration-300"
                style={{ color: isActive ? '#FF7A00' : '#B08968' }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
