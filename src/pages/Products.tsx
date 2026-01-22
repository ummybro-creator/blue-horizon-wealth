import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProducts, Product } from '@/hooks/useProducts';
import { useCreateInvestment } from '@/hooks/useInvestments';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Products = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'daily' | 'vip'>('daily');
  const [investingProductId, setInvestingProductId] = useState<string | null>(null);
  
  const { data: products, isLoading } = useProducts(activeTab);
  const { wallet } = useAuth();
  const createInvestment = useCreateInvestment();

  const handleInvest = async (product: Product) => {
    // Check balance first
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
      {/* Header */}
      <div className="gradient-header pt-12 pb-8 px-4">
        <h1 className="text-2xl font-bold text-primary-foreground text-center">Investment Plans</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-card rounded-2xl p-1.5 shadow-card flex">
          <button
            onClick={() => setActiveTab('daily')}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200",
              activeTab === 'daily' 
                ? "gradient-primary text-primary-foreground shadow-button" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Daily Plans
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200",
              activeTab === 'vip' 
                ? "gradient-primary text-primary-foreground shadow-button" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            VIP Plans
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 mt-5 pb-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products && products.length > 0 ? (
          products.map((product, index) => (
            <div 
              key={product.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden animate-slide-up border border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Badges */}
              <div className="flex justify-between items-start p-3">
                {product.is_special_offer && (
                  <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                    Special Offer
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold ml-auto">
                  {product.duration_days} Days
                </span>
              </div>

              {/* Product Image */}
              <div className="flex justify-center py-3">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20">
                    <span className="text-sm font-bold text-primary">{product.name}</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="px-4 pb-4">
                <p className="text-center text-muted-foreground text-sm mb-3">Daily income Daily withdrawal</p>
                
                <div className="bg-primary/5 rounded-xl p-4 mb-4 border border-primary/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">₹{product.daily_income.toLocaleString('en-IN')}.00</p>
                      <p className="text-xs text-muted-foreground mt-1">Daily Income</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">₹{product.total_income.toLocaleString('en-IN')}.00</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Income</p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-base mb-4">
                  Price: <span className="text-2xl font-bold text-primary">₹{product.price.toLocaleString('en-IN')}.00</span>
                </p>

                <Button 
                  variant="gradient" 
                  className="w-full h-11 text-base font-semibold"
                  onClick={() => handleInvest(product)}
                  disabled={investingProductId === product.id}
                >
                  {investingProductId === product.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {investingProductId === product.id ? 'Investing...' : 'Invest Now'}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No products available
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Products;
