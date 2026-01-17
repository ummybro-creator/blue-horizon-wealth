import { Calendar, Gift, FileText, Headphones, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { icon: Calendar, label: 'Check In', path: '/checkin', color: 'text-primary' },
  { icon: Gift, label: 'Bonus', path: '/bonus', color: 'text-accent' },
  { icon: FileText, label: 'Records', path: '/records', color: 'text-success' },
  { icon: Headphones, label: 'Support', path: '/support', color: 'text-primary' },
  { icon: Send, label: 'Telegram', path: '/telegram', color: 'text-primary' },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="mx-4 mt-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex justify-between items-center">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-card shadow-card flex items-center justify-center transition-all duration-200 group-hover:shadow-elevated group-active:scale-95">
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
