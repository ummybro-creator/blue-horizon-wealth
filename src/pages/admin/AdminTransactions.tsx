import { useState } from 'react';
import { Receipt, Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';

const typeColors: Record<string, string> = {
  recharge: 'bg-primary/10 text-primary',
  withdraw: 'bg-destructive/10 text-destructive',
  referral_bonus: 'bg-blue-100 text-blue-700',
  daily_income: 'bg-amber-100 text-amber-700',
  manual_adjustment: 'bg-purple-100 text-purple-700',
  withdraw_refund: 'bg-orange-100 text-orange-700',
  checkin_bonus: 'bg-emerald-100 text-emerald-700',
};

const AdminTransactions = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['admin-transactions', search, typeFilter],
    queryFn: async () => {
      let query = supabase.from('transaction_ledger').select('*').order('created_at', { ascending: false }).limit(100);
      if (typeFilter !== 'all') query = query.eq('type', typeFilter);
      const { data, error } = await query;
      if (error) throw error;
      const userIds = [...new Set((data || []).map(t => t.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, phone_number, full_name').in('id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      return (data || []).map(t => ({ ...t, profile: profileMap.get(t.user_id) }));
    },
  });

  const types = ['all', 'recharge', 'withdraw', 'referral_bonus', 'daily_income', 'manual_adjustment'];

  const handleExport = () => {
    if (!transactions?.length) return;
    const csv = ['Date,User,Type,Amount,Balance After,Description']
      .concat(transactions.map(t => `${new Date(t.created_at).toLocaleString()},${(t as any).profile?.phone_number || t.user_id},${t.type},${t.amount},${t.balance_after},${t.description || ''}`))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'transactions.csv'; a.click();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transaction Log</h1>
          <p className="text-muted-foreground text-sm">All financial transactions</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="rounded-2xl">
          <Download className="w-4 h-4 mr-1" />Export
        </Button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${typeFilter === t ? 'clay-button' : 'admin-card'}`}>
            {t === 'all' ? 'All' : t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="admin-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11 rounded-2xl admin-inset border-none" />
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="admin-card p-8 text-center text-muted-foreground">Loading...</div>
        ) : transactions?.length === 0 ? (
          <div className="admin-card p-8 text-center text-muted-foreground">No transactions found</div>
        ) : transactions?.map(tx => (
          <div key={tx.id} className="admin-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[tx.type] || 'bg-muted text-muted-foreground'}`}>
                    {tx.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{(tx as any).profile?.phone_number || 'Unknown'} · {tx.description || ''}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className={`font-bold text-sm ${Number(tx.amount) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {Number(tx.amount) >= 0 ? '+' : ''}₹{Math.abs(Number(tx.amount)).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-muted-foreground">Bal: ₹{Number(tx.balance_after).toLocaleString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminTransactions;
