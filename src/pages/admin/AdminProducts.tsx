import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface Product {
  id: string; name: string; image_url: string | null; price: number; daily_income: number;
  total_income: number; duration_days: number; category: string; is_enabled: boolean;
  is_special_offer: boolean; description: string | null;
}

const AdminProducts = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', daily_income: '', total_income: '', duration_days: '', category: 'daily', is_special_offer: false, description: '', image_url: '' });
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => { const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false }); if (error) throw error; return data as Product[]; },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const productData = { name: data.name, price: parseFloat(data.price), daily_income: parseFloat(data.daily_income), total_income: parseFloat(data.total_income), duration_days: parseInt(data.duration_days), category: data.category, is_special_offer: data.is_special_offer, description: data.description || null, image_url: data.image_url || null };
      if (editingProduct) { const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id); if (error) throw error; }
      else { const { error } = await supabase.from('products').insert(productData); if (error) throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success(editingProduct ? 'Product updated' : 'Product created'); resetForm(); },
    onError: () => { toast.error('Failed to save product'); },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => { const { error } = await supabase.from('products').update({ is_enabled: enabled }).eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('products').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
  });

  const resetForm = () => { setShowForm(false); setEditingProduct(null); setFormData({ name: '', price: '', daily_income: '', total_income: '', duration_days: '', category: 'daily', is_special_offer: false, description: '', image_url: '' }); };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, price: product.price.toString(), daily_income: product.daily_income.toString(), total_income: product.total_income.toString(), duration_days: product.duration_days.toString(), category: product.category, is_special_offer: product.is_special_offer, description: product.description || '', image_url: product.image_url || '' });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!formData.name || !formData.price || !formData.daily_income) { toast.error('Please fill all required fields'); return; } saveMutation.mutate(formData); };

  return (
    <div className="admin-bg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard" className="w-10 h-10 rounded-2xl flex items-center justify-center text-muted-foreground clay-card">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Product Management</h1>
            <p className="text-muted-foreground">Add, edit, or remove investment products</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2.5 rounded-2xl clay-button text-sm flex items-center gap-2 transition-all active:scale-95">
          <Plus className="w-4 h-4" />Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="clay-card-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Product Name *</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="rounded-2xl clay-inset border-none" placeholder="e.g., Tata Salt 1kg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-muted-foreground mb-1 block">Price (₹) *</label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="rounded-2xl clay-inset border-none" /></div>
                <div><label className="text-sm text-muted-foreground mb-1 block">Duration (Days) *</label><Input type="number" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })} className="rounded-2xl clay-inset border-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-muted-foreground mb-1 block">Daily Income (₹) *</label><Input type="number" value={formData.daily_income} onChange={(e) => setFormData({ ...formData, daily_income: e.target.value })} className="rounded-2xl clay-inset border-none" /></div>
                <div><label className="text-sm text-muted-foreground mb-1 block">Total Income (₹) *</label><Input type="number" value={formData.total_income} onChange={(e) => setFormData({ ...formData, total_income: e.target.value })} className="rounded-2xl clay-inset border-none" /></div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full h-10 rounded-2xl px-3 clay-inset border-none text-foreground">
                  <option value="daily">Daily Plans</option><option value="vip">VIP Plans</option>
                </select>
              </div>
              <div><label className="text-sm text-muted-foreground mb-1 block">Image URL</label><Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="rounded-2xl clay-inset border-none" /></div>
              <div><label className="text-sm text-muted-foreground mb-1 block">Description</label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-2xl clay-inset border-none" /></div>
              <div className="flex items-center gap-2"><Switch checked={formData.is_special_offer} onCheckedChange={(checked) => setFormData({ ...formData, is_special_offer: checked })} /><label className="text-sm text-muted-foreground">Special Offer</label></div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 rounded-2xl">Cancel</Button>
                <button type="submit" className="flex-1 rounded-2xl py-2.5 clay-button disabled:opacity-50" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full clay-card p-8 text-center text-muted-foreground">Loading products...</div>
        ) : products?.length === 0 ? (
          <div className="col-span-full clay-card p-8 text-center text-muted-foreground">No products found</div>
        ) : (
          products?.map((product) => (
            <div key={product.id} className="clay-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-foreground font-semibold">{product.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${product.category === 'vip' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'}`}>
                    {product.category.toUpperCase()}
                  </span>
                </div>
                <Switch checked={product.is_enabled} onCheckedChange={(checked) => toggleMutation.mutate({ id: product.id, enabled: checked })} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                {[{ l: 'Price', v: `₹${product.price}` }, { l: 'Duration', v: `${product.duration_days} days` }, { l: 'Daily', v: `₹${product.daily_income}`, green: true }, { l: 'Total', v: `₹${product.total_income}`, green: true }].map(d => (
                  <div key={d.l} className="clay-inset p-2">
                    <p className="text-muted-foreground">{d.l}</p>
                    <p className={`font-bold ${d.green ? 'text-primary' : 'text-foreground'}`}>{d.v}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 rounded-xl" onClick={() => openEditForm(product)}><Edit className="w-4 h-4 mr-1" />Edit</Button>
                <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(product.id); }}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
