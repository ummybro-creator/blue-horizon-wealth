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
      toast.error('Insufficient Balance', { description: 'Please recharge your wallet to invest.' });
      navigate('/recharge');
      return;
    }
    setInvestingProductId(product.id);
    try {
      await createInvestment.mutateAsync(product.id);
      toast.success(`Investment successful!`, { description: `You invested ₹${product.price.toLocaleString('en-IN')} in ${product.name}` });
    } catch (error: any) {
      if (error.message === 'Insufficient balance') {
        toast.error('Insufficient Balance', { description: 'Please recharge your wallet to invest.' });
        navigate('/recharge');
      } else {
        toast.error('Investment failed', { description: error.message || 'Please try again.' });
      }
    } finally {
      setInvestingProductId(null);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="clay-header pt-10 pb-8 px-4">
        <h1 className="text-2xl font-bold text-white text-center">Plan Store</h1>
      </div>

      {/* Tab Switcher */}
      <div className="px-6 -mt-4 relative z-10">
        <div className="clay-card flex p-1.5" style={{ borderRadius: '999px' }}>
          {(['daily', 'vip'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-200",
                activeTab === tab ? "clay-button" : "text-muted-foreground"
              )}
            >
              {tab === 'daily' ? 'Daily Plan' : 'Welfare Plan'}
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      <div className="px-4 pt-5 pb-8 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-9 h-9 animate-spin text-primary" />
          </div>
        ) : products && products.length > 0 ? (
          products.map((product, index) => (
            <div
              key={product.id}
              className="clay-card animate-slide-up overflow-hidden"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Badges - use description as tag */}
              <div className="flex justify-between items-start pt-3">
                <span className="clay-button px-4 py-1.5 text-xs" style={{ borderRadius: '0 999px 999px 0' }}>
                  {product.description || product.name}
                </span>
                <span className="clay-button px-3 py-1 text-[11px] mr-3" style={{ borderRadius: '999px' }}>
                  Days: {product.duration_days}
                </span>
              </div>

              {/* Image + Income */}
              <div className="flex items-center p-4 gap-4">
                <div className="flex-shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-20 h-[90px] rounded-2xl object-cover" style={{ boxShadow: 'none' }} />
                  ) : (
                    <div className="w-20 h-[90px] rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-[11px] font-bold text-center px-1">{product.name}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex justify-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-money">₹{product.daily_income.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Daily Income</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-money">₹{product.total_income.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Total Income</p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <p className="text-center text-sm font-semibold text-foreground pb-1">
                Price: <span className="text-lg font-extrabold text-money">₹{product.price.toLocaleString('en-IN')}</span>
              </p>

              {/* Buy Button */}
              <div className="px-5 pb-4 pt-1">
                <button
                  className={cn(
                    "w-full clay-button py-3.5 text-sm transition-all active:scale-[0.97]",
                    investingProductId === product.id && "opacity-70 pointer-events-none"
                  )}
                  onClick={() => handleInvest(product)}
                  disabled={investingProductId === product.id}
                >
                  {investingProductId === product.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />Investing...
                    </span>
                  ) : 'Buy Now'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground">No products available</div>
        )}
      </div>
    </AppLayout>
  );
};

export default Products;
