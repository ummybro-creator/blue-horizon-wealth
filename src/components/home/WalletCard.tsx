import { Wallet, TrendingUp, Gift, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ORANGE    = '#FF6A00';
const BTN_GRAD  = 'linear-gradient(135deg, #FF8A00 0%, #FF6A00 100%)';
const BTN_SHADOW = '0 8px 20px rgba(255,106,0,0.38)';

export function WalletCard() {
  const navigate = useNavigate();
  const { wallet } = useAuth();

  const balanceItems = [
    { icon: Wallet,           label: 'Recharge',    value: wallet?.recharge_balance ?? 0,    iconColor: ORANGE,     iconBg: '#FFE3C5' },
    { icon: Gift,             label: 'Bonus',       value: wallet?.bonus_balance     ?? 0,    iconColor: '#A855F7',  iconBg: '#F3E8FF' },
    { icon: TrendingUp,       label: 'Total Income',value: wallet?.total_income      ?? 0,    iconColor: '#22C55E',  iconBg: '#DCFCE7' },
    { icon: ArrowDownCircle,  label: 'Withdrawable',value: wallet?.total_balance     ?? 0,    iconColor: ORANGE,     iconBg: '#FFE3C5' },
  ];

  return (
    <div className="mx-4 -mt-20 relative z-10 animate-slide-up">
      <div
        className="rounded-[24px] p-5"
        style={{
          background: '#FFFFFF',
          backdropFilter: 'blur(0px)',
          WebkitBackdropFilter: 'blur(0px)',
          boxShadow: '0 16px 48px rgba(255,106,0,0.14), 0 4px 12px rgba(0,0,0,0.06)',
          border: '1px solid #FFFFFF',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {/* Total Balance */}
        <div className="text-center mb-5">
          <p className="text-sm font-medium mb-1" style={{ color: '#8A8A8A' }}>Total Balance</p>
          <h2 className="text-3xl font-extrabold" style={{ color: '#2B2B2B' }}>
            ₹{(wallet?.total_balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
        </div>

        {/* Balance Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {balanceItems.map((b) => (
            <div
              key={b.label}
              className="rounded-2xl p-3"
              style={{ background: '#FFF4EE', border: '1px solid rgba(255,106,0,0.08)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: b.iconBg }}
                >
                  <b.icon className="w-3.5 h-3.5" style={{ color: b.iconColor }} />
                </div>
                <span className="text-xs font-medium" style={{ color: '#8A8A8A' }}>{b.label}</span>
              </div>
              <p className="font-bold" style={{ color: '#2B2B2B' }}>
                ₹{b.value.toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/recharge')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-white text-sm transition-all active:scale-95"
            style={{ background: BTN_GRAD, boxShadow: BTN_SHADOW }}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Recharge
          </button>
          <button
            onClick={() => navigate('/withdraw')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-sm transition-all active:scale-95"
            style={{
              background: '#FFF4EE',
              border: '1.5px solid rgba(255,106,0,0.20)',
              color: ORANGE,
            }}
          >
            <ArrowDownCircle className="w-4 h-4" />
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
