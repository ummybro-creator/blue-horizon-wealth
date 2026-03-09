import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
      <div className="gradient-header pt-10 pb-6 px-4">
        <h1 className="text-xl font-bold text-primary-foreground text-center">Plan Store</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-card rounded-full p-1 shadow-card flex">
          <button
            onClick={() => setActiveTab('daily')}
            className={cn(
              "flex-1 py-2.5 rounded-full font-bold text-sm transition-all duration-200",
              activeTab === 'daily' 
                ? "gradient-primary text-primary-foreground shadow-button" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Daily Plan
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={cn(
              "flex-1 py-2.5 rounded-full font-bold text-sm transition-all duration-200",
              activeTab === 'vip' 
                ? "gradient-primary text-primary-foreground shadow-button" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            VIP Plan
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="px-4 mt-5 pb-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products && products.length > 0 ? (
          products.map((product, index) => (
            <div 
              key={product.id} 
              className="bg-card rounded-2xl shadow-card overflow-hidden animate-slide-up border border-border/40"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Badge row */}
              <div className="flex justify-between items-center px-4 pt-3">
                {product.is_special_offer ? (
                  <span className="px-3 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-bold">
                    Special plan
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-foreground">{product.name}</span>
                )}
                <span className="text-xs font-semibold text-muted-foreground">
                  Days: {product.duration_days}
                </span>
              </div>

              {/* Main content: image left, info right */}
              <div className="flex items-center gap-4 px-4 py-3">
                {/* Product image */}
                <div className="flex-shrink-0">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-secondary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-xs font-bold text-primary text-center leading-tight px-1">{product.name}</span>
                    </div>
                  )}
                </div>

                {/* Income info */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">₹{product.daily_income.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-muted-foreground">Daily</p>
                    <p className="text-[10px] text-muted-foreground">Income</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">₹{product.total_income.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                    <p className="text-[10px] text-muted-foreground">Income</p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <p className="text-center text-base font-semibold text-foreground pb-2">
                Price: <span className="text-xl font-bold">₹{product.price.toLocaleString('en-IN')}</span>
              </p>

              {/* Buy Now button */}
              <div className="px-4 pb-4">
                <Button 
                  variant="gradient" 
                  size="lg"
                  className="w-full rounded-full text-base font-bold"
                  onClick={() => handleInvest(product)}
                  disabled={investingProductId === product.id}
                >
                  {investingProductId === product.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Investing...
                    </>
                  ) : (
                    'Buy Now'
                  )}
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
