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
  { icon: DollarSign, label: 'CheckIn', path: '/checkin', color: 'text-primary' },
  { icon: Mail, label: 'Invite', path: '/team', color: 'text-primary' },
  { icon: CreditCard, label: 'Recharge', path: '/recharge', color: 'text-primary' },
  { icon: Landmark, label: 'Withdraw', path: '/withdraw', color: 'text-primary' },
  { icon: Package, label: 'Orders', path: '/records', color: 'text-primary' },
  { icon: FileText, label: 'Record', path: '/records', color: 'text-primary' },
  { icon: MessageCircle, label: 'Support', path: '/support', color: 'text-primary' },
  { icon: Send, label: 'Group', path: '/telegram', color: 'text-primary' },
];

export function QuickMenu() {
  const navigate = useNavigate();

  return (
    <div className="mx-4 mt-4">
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="grid grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl border border-border bg-card flex items-center justify-center">
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <span className="text-xs font-medium text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
