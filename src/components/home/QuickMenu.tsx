import { 
  DollarSign, 
  Mail, 
  CreditCard, 
  Landmark, 
  Package, 
  FileText, 
  MessageCircle, 
  Send 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { icon: DollarSign, label: 'CheckIn', path: '/checkin', bg: 'bg-emerald-50' },
  { icon: Mail, label: 'Invite', path: '/team', bg: 'bg-blue-50' },
  { icon: CreditCard, label: 'Recharge', path: '/recharge', bg: 'bg-amber-50' },
  { icon: Landmark, label: 'Withdraw', path: '/withdraw', bg: 'bg-purple-50' },
  { icon: Package, label: 'Orders', path: '/records', bg: 'bg-pink-50' },
  { icon: FileText, label: 'Record', path: '/records', bg: 'bg-cyan-50' },
  { icon: MessageCircle, label: 'Support', path: '/support', bg: 'bg-orange-50' },
  { icon: Send, label: 'Group', path: '/telegram', bg: 'bg-teal-50' },
];

export function QuickMenu() {
  const navigate = useNavigate();

  return (
    <div className="mx-4 mt-5">
      <div className="clay-card p-5">
        <div className="grid grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center shadow-clay-sm transition-all group-hover:scale-105 group-active:scale-95`}>
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
