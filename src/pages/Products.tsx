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
      <div className="bg-primary pt-8 pb-16 px-4" style={{ borderRadius: '0 0 2rem 2rem' }}>
        <h1 className="text-xl font-extrabold text-primary-foreground text-center tracking-wide">
          Plan Store
        </h1>
      </div>

      {/* Pill Tabs */}
      <div className="px-8 -mt-6 relative z-10">
        <div className="bg-card rounded-full p-1 shadow-md flex">
          <button
            onClick={() => setActiveTab('daily')}
            className={cn(
              "flex-1 py-2.5 rounded-full font-bold text-sm transition-all duration-200",
              activeTab === 'daily'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            Daily Plan
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={cn(
              "flex-1 py-2.5 rounded-full font-bold text-sm transition-all duration-200",
              activeTab === 'vip'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
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
              className="bg-card overflow-hidden animate-slide-up"
              style={{
                animationDelay: `${index * 0.08}s`,
                borderRadius: '20px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              }}
            >
              {/* Top badges row */}
              <div className="flex justify-between items-start pt-4 pr-4">
                <span className="px-5 py-1 rounded-r-full bg-primary text-primary-foreground text-xs font-bold">
                  {product.is_special_offer ? 'Special plan' : product.name}
                </span>
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  Days: {product.duration_days}
                </span>
              </div>

              {/* Image left + Earnings right */}
              <div className="flex items-center gap-4 px-5 pt-4 pb-3">
                <div className="flex-shrink-0">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="rounded-xl object-cover"
                      style={{ width: '90px', height: '90px' }}
                    />
                  ) : (
                    <div className="rounded-xl bg-muted/30 flex items-center justify-center border border-primary/20" style={{ width: '90px', height: '90px' }}>
                      <span className="text-xs font-bold text-primary text-center leading-tight px-2">
                        {product.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-6 flex-1 justify-center">
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-foreground">
                      ₹{product.daily_income.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight">Daily</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">Income</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-foreground">
                      ₹{product.total_income.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight">Total</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">Income</p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <p className="text-center text-lg font-bold text-foreground py-2">
                Price: <span className="text-2xl font-extrabold text-foreground">₹{product.price.toLocaleString('en-IN')}</span>
              </p>

              {/* Buy Now button */}
              <div className="px-8 pb-5 pt-1">
                <button
                  className={cn(
                    "w-full py-3 rounded-full font-bold text-base text-primary-foreground bg-primary shadow-md transition-all duration-200 active:scale-[0.98]",
                    investingProductId === product.id && "opacity-70 pointer-events-none"
                  )}
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
          <div className="text-center py-16 text-muted-foreground text-sm">
            No products available
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Products;
