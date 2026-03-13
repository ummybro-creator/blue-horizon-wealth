import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProducts, Product } from '@/hooks/useProducts';
import { useCreateInvestment } from '@/hooks/useInvestments';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Products = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'daily' | 'vip'>('daily');
  const [investingProductId, setInvestingProductId] = useState<string | null>(null);
  
  const { data: products, isLoading } = useProducts(activeTab);
  const { wallet } = useAuth();
  const createInvestment = useCreateInvestment();

  const handleInvest = async (product: Product) => {
    const currentBalance = wallet?.total_balance ?? 0;
    
    if (currentBalance < product.price) {
      toast.error('Insufficient Balance', {
        description: 'Please recharge your wallet to invest.',
      });
      navigate('/recharge');
      return;
    }

    setInvestingProductId(product.id);
    
    try {
      await createInvestment.mutateAsync(product.id);
      toast.success(`Investment successful!`, {
        description: `You invested ₹${product.price.toLocaleString('en-IN')} in ${product.name}`,
      });
    } catch (error: any) {
      if (error.message === 'Insufficient balance') {
        toast.error('Insufficient Balance', {
          description: 'Please recharge your wallet to invest.',
        });
        navigate('/recharge');
      } else {
        toast.error('Investment failed', {
          description: error.message || 'Please try again.',
        });
      }
    } finally {
      setInvestingProductId(null);
    }
  };

  return (
    <AppLayout>
      {/* Green Gradient Header */}
      <div
        className="pt-10 pb-16 px-4"
        style={{
          background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
          borderRadius: '0 0 2rem 2rem',
        }}
      >
        <h1
          className="text-2xl font-extrabold text-center tracking-wide"
          style={{ color: '#fff', fontFamily: 'Poppins, sans-serif' }}
        >
          Plan Store
        </h1>
      </div>

      {/* Pill Tabs */}
      <div className="px-8 -mt-6 relative z-10">
        <div
          className="rounded-full p-1.5 flex"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}
        >
          <button
            onClick={() => setActiveTab('daily')}
            className="flex-1 py-2.5 rounded-full font-bold text-sm transition-all duration-200"
            style={{
              fontFamily: 'Poppins, sans-serif',
              ...(activeTab === 'daily'
                ? {
                    background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                  }
                : {
                    background: 'transparent',
                    color: '#9CA3AF',
                  }),
            }}
          >
            Daily Plan
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className="flex-1 py-2.5 rounded-full font-bold text-sm transition-all duration-200"
            style={{
              fontFamily: 'Poppins, sans-serif',
              ...(activeTab === 'vip'
                ? {
                    background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                  }
                : {
                    background: 'transparent',
                    color: '#9CA3AF',
                  }),
            }}
          >
            Welfare Plan
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="px-4 mt-5 pb-8 space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-9 h-9 animate-spin text-primary" />
          </div>
        ) : products && products.length > 0 ? (
          products.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up overflow-hidden"
              style={{
                animationDelay: `${index * 0.08}s`,
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid rgba(255,255,255,0.6)',
              }}
            >
              {/* Top badges row */}
              <div className="flex justify-between items-start pt-3">
                <span
                  className="px-5 py-1.5 rounded-r-full text-xs font-bold italic"
                  style={{
                    background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  {product.is_special_offer ? 'Special plan' : product.name}
                </span>
                <span
                  className="px-4 py-1.5 rounded-full text-[11px] font-bold mr-4"
                  style={{
                    background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Days: {product.duration_days}
                </span>
              </div>

              {/* Image left + Earnings right */}
              <div className="flex items-center px-5 pt-4 pb-2">
                <div className="flex-shrink-0">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="rounded-xl object-cover"
                      style={{ width: '90px', height: '100px' }}
                    />
                  ) : (
                    <div
                      className="rounded-xl flex items-center justify-center"
                      style={{
                        width: '90px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                        border: '1px solid #BBF7D0',
                      }}
                    >
                      <span
                        className="text-xs font-bold text-center leading-tight px-2"
                        style={{ color: '#16A34A', fontFamily: 'Poppins, sans-serif' }}
                      >
                        {product.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-6 flex-1 justify-center">
                  <div className="text-center">
                    <p style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <span className="text-xl font-extrabold" style={{ color: '#16A34A' }}>
                        ₹{product.daily_income.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-medium ml-1" style={{ color: '#9CA3AF' }}>
                        Daily
                      </span>
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#9CA3AF', fontFamily: 'Poppins, sans-serif' }}>
                      Income
                    </p>
                  </div>
                  <div className="text-center">
                    <p style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <span className="text-xl font-extrabold" style={{ color: '#16A34A' }}>
                        ₹{product.total_income.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-medium ml-1" style={{ color: '#9CA3AF' }}>
                        Total
                      </span>
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#9CA3AF', fontFamily: 'Poppins, sans-serif' }}>
                      Income
                    </p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <p
                className="text-center text-base font-semibold py-2"
                style={{ color: '#1F2937', fontFamily: 'Poppins, sans-serif' }}
              >
                Price:{' '}
                <span className="text-xl font-extrabold" style={{ color: '#1F2937' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </p>

              {/* Buy Now button */}
              <div className="px-6 pb-5 pt-1">
                <button
                  className={cn(
                    "w-full py-3.5 rounded-full font-bold text-base transition-all duration-200 active:scale-[0.98]",
                    investingProductId === product.id && "opacity-70 pointer-events-none"
                  )}
                  style={{
                    background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
                    color: '#fff',
                    boxShadow: '0 6px 20px rgba(22, 163, 74, 0.35)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                  onClick={() => handleInvest(product)}
                  disabled={investingProductId === product.id}
                >
                  {investingProductId === product.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Investing...
                    </span>
                  ) : (
                    'Buy Now'
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16" style={{ color: '#9CA3AF', fontFamily: 'Poppins, sans-serif' }}>
            No products available
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Products;
