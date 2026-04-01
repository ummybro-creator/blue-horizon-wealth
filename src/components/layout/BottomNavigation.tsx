import { Home, Briefcase, BarChart3, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Briefcase, label: 'Products', path: '/products' },
  { icon: BarChart3, label: 'Promotion', path: '/team' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[calc(512px-2rem)]">
      <div className="clay-card flex items-center justify-around h-16 px-2" style={{ borderRadius: '30px' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 rounded-2xl",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "transition-all duration-200",
                isActive && "bg-primary/10 rounded-xl p-1.5"
              )}>
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive && "scale-110"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive ? 'currentColor' : 'none'}
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                isActive && "font-bold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
