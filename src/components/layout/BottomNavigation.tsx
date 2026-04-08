import { Home, Briefcase, BarChart3, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { icon: Home,     label: 'Home',      path: '/'         },
  { icon: Briefcase,label: 'Products',  path: '/products' },
  { icon: BarChart3,label: 'Promotion', path: '/team'     },
  { icon: User,     label: 'Profile',   path: '/profile'  },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate  = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
    >
      <div
        className="flex items-center justify-around h-[62px] px-2"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.07)',
          borderTop: '1px solid #F3F4F6',
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all duration-200"
            >
              <div
                className="flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(34,197,94,0.12)' : 'transparent',
                }}
              >
                <item.icon
                  className="w-[22px] h-[22px] transition-all duration-200"
                  style={{ color: isActive ? '#22C55E' : '#9CA3AF' }}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive ? 'rgba(34,197,94,0.08)' : 'none'}
                />
              </div>
              <span
                className="text-[10px] font-semibold transition-all duration-200"
                style={{ color: isActive ? '#22C55E' : '#9CA3AF' }}
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
