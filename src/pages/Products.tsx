import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductCard } from '@/components/products/ProductCard';
import { mockProducts } from '@/data/mockData';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Products = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'vip'>('daily');
  
  const filteredProducts = mockProducts.filter(p => p.category === activeTab);

  const handleInvest = (product: Product) => {
    toast.success(`Investment request for ${product.name} submitted!`, {
      description: `Amount: ₹${product.price.toLocaleString('en-IN')}`,
    });
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="gradient-header pt-12 pb-6 px-4">
        <h1 className="text-2xl font-bold text-primary-foreground">Investment Plans</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">Choose a plan and start earning</p>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-3 relative z-10">
        <div className="bg-card rounded-xl p-1.5 shadow-card flex gap-1">
          <button
            onClick={() => setActiveTab('daily')}
            className={cn(
              "flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200",
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
              "flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200",
              activeTab === 'vip' 
                ? "gradient-gold text-accent-foreground shadow-button" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            VIP Plans
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 mt-5 pb-6 grid gap-4">
        {filteredProducts.map((product, index) => (
          <div 
            key={product.id} 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ProductCard product={product} onInvest={handleInvest} />
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Products;
