import {
  DollarSign, Mail, CreditCard, Landmark,
  Package, FileText, MessageCircle, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { icon: DollarSign,    label: 'CheckIn',  path: '/checkin',  iconColor: '#22C55E', iconBg: '#DCFCE7' },
  { icon: Mail,          label: 'Invite',   path: '/team',     iconColor: '#3B82F6', iconBg: '#EAF4FF' },
  { icon: CreditCard,    label: 'Recharge', path: '/recharge', iconColor: '#F59E0B', iconBg: '#FFF6E5' },
  { icon: Landmark,      label: 'Withdraw', path: '/withdraw', iconColor: '#A855F7', iconBg: '#F3E8FF' },
  { icon: Package,       label: 'Orders',   path: '/records',  iconColor: '#EF4444', iconBg: '#FEE2E2' },
  { icon: FileText,      label: 'Record',   path: '/records',  iconColor: '#06B6D4', iconBg: '#ECFEFF' },
  { icon: MessageCircle, label: 'Support',  path: '/support',  iconColor: '#F97316', iconBg: '#FFF0E5' },
  { icon: Send,          label: 'Group',    path: '/telegram', iconColor: '#22C55E', iconBg: '#DCFCE7' },
];

export function QuickMenu() {
  const navigate = useNavigate();

  return (
    <div className="mx-4 mt-4">
      <div
        className="p-4 rounded-[20px]"
        style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="grid grid-cols-4 gap-3">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1.5 transition-all active:scale-95"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: item.iconBg }}
              >
                <item.icon className="w-5 h-5" style={{ color: item.iconColor }} />
              </div>
              <span className="text-[11px] font-semibold" style={{ color: '#374151' }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
