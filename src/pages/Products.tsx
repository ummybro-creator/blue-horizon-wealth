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
      {/* Green Gradient Header - deep curve */}
      <div
        style={{
          background: 'linear-gradient(180deg, #34A853 0%, #2FA24F 100%)',
          borderRadius: '0 0 2.5rem 2.5rem',
          paddingTop: '2.5rem',
          paddingBottom: '3.5rem',
        }}
      >
        <h1
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#fff',
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          Plan Store
        </h1>
      </div>

      {/* Floating Pill Tabs */}
      <div className="px-6 relative z-10" style={{ marginTop: '-1.6rem' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(14px)',
            borderRadius: '999px',
            padding: '5px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            border: '1px solid rgba(255,255,255,0.7)',
            display: 'flex',
          }}
        >
          {(['daily', 'vip'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '999px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.875rem',
                fontWeight: 700,
                transition: 'all 0.2s',
                ...(activeTab === tab
                  ? {
                      background: 'linear-gradient(135deg, #34A853 0%, #2FA24F 100%)',
                      color: '#fff',
                      boxShadow: '0 4px 14px rgba(52,168,83,0.35)',
                    }
                  : {
                      background: 'transparent',
                      color: '#9CA3AF',
                    }),
              }}
            >
              {tab === 'daily' ? 'Daily Plan' : 'Welfare Plan'}
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      <div style={{ padding: '1.25rem 1rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-9 h-9 animate-spin text-primary" />
          </div>
        ) : products && products.length > 0 ? (
          products.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{
                animationDelay: `${index * 0.08}s`,
                borderRadius: '22px',
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 6px 28px rgba(0,0,0,0.07), 0 1.5px 6px rgba(0,0,0,0.04)',
                border: '1.5px solid #E5E7EB',
                overflow: 'hidden',
              }}
            >
              {/* Badges row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: '10px' }}>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #34A853 0%, #2FA24F 100%)',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    fontStyle: 'italic',
                    padding: '5px 20px 5px 16px',
                    borderRadius: '0 999px 999px 0',
                  }}
                >
                  {product.is_special_offer ? 'Special plan' : product.name}
                </span>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #34A853 0%, #2FA24F 100%)',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '5px 14px',
                    borderRadius: '999px',
                    marginRight: '12px',
                  }}
                >
                  Days: {product.duration_days}
                </span>
              </div>

              {/* Image + Income row */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px 8px' }}>
                {/* Product image */}
                <div style={{ flexShrink: 0 }}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{
                        width: '95px',
                        height: '105px',
                        borderRadius: '14px',
                        objectFit: 'cover',
                        border: '1px solid #E5E7EB',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '95px',
                        height: '105px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #E8F5EC 0%, #CFE8D8 100%)',
                        border: '1px solid #DDE5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          color: '#1E9E48',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          lineHeight: 1.3,
                          padding: '0 6px',
                        }}
                      >
                        {product.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Income stats */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', margin: 0, lineHeight: 1.2 }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E9E48' }}>
                        ₹{product.daily_income.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.6rem', fontWeight: 500, color: '#9CA3AF', marginLeft: '3px' }}>
                        Daily
                      </span>
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.65rem', color: '#9CA3AF', margin: '2px 0 0' }}>
                      Income
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', margin: 0, lineHeight: 1.2 }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E9E48' }}>
                        ₹{product.total_income.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.6rem', fontWeight: 500, color: '#9CA3AF', marginLeft: '3px' }}>
                        Total
                      </span>
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.65rem', color: '#9CA3AF', margin: '2px 0 0' }}>
                      Income
                    </p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <p
                style={{
                  textAlign: 'center',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#1F2937',
                  margin: '4px 0 2px',
                }}
              >
                Price:{' '}
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </p>

              {/* Buy Now button */}
              <div style={{ padding: '6px 20px 18px' }}>
                <button
                  className={cn(
                    "w-full transition-all duration-200 active:scale-[0.98]",
                    investingProductId === product.id && "opacity-70 pointer-events-none"
                  )}
                  style={{
                    background: 'linear-gradient(135deg, #34A853 0%, #2FA24F 100%)',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '1rem',
                    fontWeight: 700,
                    padding: '14px 0',
                    borderRadius: '999px',
                    border: 'none',
                    boxShadow: '0 6px 20px rgba(52, 168, 83, 0.30)',
                    cursor: 'pointer',
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
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9CA3AF', fontFamily: 'Poppins, sans-serif' }}>
            No products available
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Products;
