import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProducts, Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Products = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'vip'>('daily');
  
  const { data: products, isLoading } = useProducts(activeTab);

  const handleInvest = (product: Product) => {
    toast.success(`Investment request for ${product.name} submitted!`, {
      description: `Amount: ₹${product.price.toLocaleString('en-IN')}`,
    });
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
              className="bg-card rounded-2xl shadow-card overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Badges */}
              <div className="flex justify-between items-start p-4 pb-0">
                {product.is_special_offer && (
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    Special Offer
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold ml-auto">
                  {product.duration_days} Days
                </span>
              </div>

              {/* Product Image */}
              <div className="flex justify-center py-3">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-secondary/20 to-muted flex items-center justify-center">
                    <span className="text-sm font-bold text-muted-foreground">{product.name}</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="px-4 pb-4">
                <p className="text-center text-muted-foreground mb-3">Daily income Daily withdrawal</p>
                
                <div className="bg-secondary/30 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">₹{product.daily_income.toLocaleString('en-IN')}.00</p>
                      <p className="text-sm text-muted-foreground">Daily Income</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">₹{product.total_income.toLocaleString('en-IN')}.00</p>
                      <p className="text-sm text-muted-foreground">Total Income</p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-lg mb-4">
                  Price: <span className="text-2xl font-bold text-primary">₹{product.price.toLocaleString('en-IN')}.00</span>
                </p>

                <Button 
                  variant="gradient" 
                  className="w-full h-12 text-lg font-bold"
                  onClick={() => handleInvest(product)}
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Invest Now
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
