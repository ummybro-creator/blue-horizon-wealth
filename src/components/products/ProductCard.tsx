import { TrendingUp, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onInvest: (product: Product) => void;
}

export function ProductCard({ product, onInvest }: ProductCardProps) {
  const returnPercentage = ((product.totalIncome / product.price) * 100).toFixed(0);

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden animate-scale-in">
      {/* Image Section */}
      <div className="relative h-36 bg-gradient-to-br from-secondary to-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-2xl gradient-primary/10 flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-primary" />
          </div>
        </div>
        {product.isSpecialOffer && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full gradient-gold">
            <Sparkles className="w-3.5 h-3.5 text-accent-foreground" />
            <span className="text-xs font-bold text-accent-foreground">Special</span>
          </div>
        )}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-success/90">
          <span className="text-xs font-bold text-success-foreground">{returnPercentage}% Return</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-lg mb-3">{product.name}</h3>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-secondary/50 rounded-lg p-2.5">
            <p className="text-xs text-muted-foreground">Daily Income</p>
            <p className="font-bold text-success">₹{product.dailyIncome}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2.5">
            <p className="text-xs text-muted-foreground">Total Income</p>
            <p className="font-bold text-foreground">₹{product.totalIncome}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{product.duration} Days</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <Button 
          variant="gradient" 
          className="w-full"
          onClick={() => onInvest(product)}
        >
          Invest Now
        </Button>
      </div>
    </div>
  );
}
