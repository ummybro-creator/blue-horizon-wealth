import { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpCircle,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingDown,
  Settings2,
  BadgeCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { useRecharges } from '@/hooks/useRecharges';
import { useAppSettings } from '@/hooks/useAppSettings';
import { cn } from '@/lib/utils';

type PageType = 'withdraw' | 'recharge';
type FilterType = 'all' | 'pending' | 'done';

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hr ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} day ago`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function shortId(id: string, index: number) {
  return `#${String(index + 1).padStart(6, '0')}`;
}

const Records = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState<PageType>('withdraw');
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: withdrawals = [], isLoading: wLoading } = useWithdrawals();
  const { data: recharges = [], isLoading: rLoading } = useRecharges();
  const { data: settings } = useAppSettings();

  const feePercent = (settings as any)?.withdraw_charge_percent ?? 0;

  const isLoading = page === 'withdraw' ? wLoading : rLoading;
  const allRecords = page === 'withdraw' ? withdrawals : recharges;

  const filtered = allRecords.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'done') return r.status === 'approved';
    return true;
  });

  const totalAmount = allRecords.reduce((s, r) => s + r.amount, 0);

  const filterTabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: '≡ All' },
    { id: 'pending', label: 'Pending' },
    { id: 'done', label: page === 'withdraw' ? 'Completed' : 'Success' },
  ];

  const statusMap: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb', icon: Clock },
    approved: {
      label: page === 'withdraw' ? 'Completed' : 'Success',
      color: '#22c55e',
      bg: '#f0fdf4',
      icon: BadgeCheck,
    },
    rejected: { label: 'Failed', color: '#ef4444', bg: '#fef2f2', icon: XCircle },
  };

  return (
    <div
      className="min-h-screen max-w-lg mx-auto"
      style={{ background: 'linear-gradient(180deg, #e8f5e9 0%, #f1f8f2 40%, #f7faf7 100%)', fontFamily: 'Inter, sans-serif' }}
    >
      {/* ── HEADER ── */}
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-center flex-1 pr-10" style={{ color: '#16a34a' }}>
          {page === 'withdraw' ? 'Withdrawal History' : 'Recharge History'}
        </h1>
      </div>

      {/* ── PAGE SWITCHER ── */}
      <div className="mx-4 mb-4 flex rounded-2xl p-1" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <button
          onClick={() => { setPage('withdraw'); setFilter('all'); }}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={page === 'withdraw'
            ? { background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }
            : { color: '#6b7280' }}
        >
          Withdrawals
        </button>
        <button
          onClick={() => { setPage('recharge'); setFilter('all'); }}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={page === 'recharge'
            ? { background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }
            : { color: '#6b7280' }}
        >
          Recharges
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="mx-4 mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: '#f0fdf4' }}>
            {page === 'withdraw'
              ? <TrendingDown className="w-5 h-5" style={{ color: '#22c55e' }} />
              : <Wallet className="w-5 h-5" style={{ color: '#22c55e' }} />}
          </div>
          <p className="text-2xl font-extrabold" style={{ color: '#111827' }}>{allRecords.length}</p>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            {page === 'withdraw' ? 'Total Withdrawals' : 'Total Recharges'}
          </p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: '#f0fdf4' }}>
            <div className="w-5 h-5 rounded-full" style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }} />
          </div>
          <p className="text-2xl font-extrabold" style={{ color: '#111827' }}>
            ₹{totalAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Total Amount</p>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="mx-4 mb-4 flex gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={filter === tab.id
              ? { background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }
              : { background: '#fff', color: '#6b7280', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            {tab.id === 'pending' && <Clock className="w-3.5 h-3.5" />}
            {tab.id === 'done' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── RECORDS LIST ── */}
      <div className="mx-4 pb-8 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#22c55e' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#f0fdf4' }}
            >
              {page === 'withdraw'
                ? <ArrowUpCircle className="w-8 h-8" style={{ color: '#22c55e' }} />
                : <Wallet className="w-8 h-8" style={{ color: '#22c55e' }} />}
            </div>
            <p className="font-semibold" style={{ color: '#374151' }}>No records found</p>
            <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
              {page === 'withdraw' ? 'No withdrawal history yet' : 'No recharge history yet'}
            </p>
          </div>
        ) : (
          filtered.map((record, index) => {
            const fee = page === 'withdraw' ? (record.amount * feePercent) / 100 : 0;
            const received = record.amount - fee;
            const st = statusMap[record.status] || statusMap.pending;
            const StatusIcon = st.icon;
            const dateStr = (record as any).requested_at;

            return (
              <div
                key={record.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
              >
                {/* Card top row */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <span className="text-sm font-bold" style={{ color: '#111827' }}>
                    {shortId(record.id, index)}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: '#9ca3af' }}>
                    <Clock className="w-3.5 h-3.5" />
                    {dateStr ? formatDate(dateStr) : '—'}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f3f4f6', marginBottom: 12 }} />

                {/* Type row */}
                <div className="flex items-center justify-between px-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: page === 'withdraw' ? '#fef2f2' : '#f0fdf4' }}
                    >
                      {page === 'withdraw'
                        ? <ArrowUpCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
                        : <Wallet className="w-4 h-4" style={{ color: '#22c55e' }} />}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: '#374151' }}>
                      {page === 'withdraw' ? 'Withdrawal' : 'Recharge'}
                    </span>
                  </div>
                  <span className="text-base font-extrabold" style={{ color: '#111827' }}>
                    ₹{record.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Fee row (withdrawals only) */}
                {page === 'withdraw' && feePercent > 0 && (
                  <div className="flex items-center justify-between px-4 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: '#fff7ed' }}
                      >
                        <Settings2 className="w-4 h-4" style={{ color: '#f97316' }} />
                      </div>
                      <span className="text-sm" style={{ color: '#6b7280' }}>
                        Fee ({feePercent}%)
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#ef4444' }}>
                      −₹{fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {/* Received row */}
                <div className="flex items-center justify-between px-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: '#f0fdf4' }}
                    >
                      <CheckCircle2 className="w-4 h-4" style={{ color: '#22c55e' }} />
                    </div>
                    <span className="text-sm" style={{ color: '#6b7280' }}>
                      {page === 'withdraw' ? 'Received' : 'Credited'}
                    </span>
                  </div>
                  <span className="text-base font-extrabold" style={{ color: '#16a34a' }}>
                    ₹{received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f3f4f6' }} />

                {/* Bottom row */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: '#9ca3af' }}>
                    <Clock className="w-3.5 h-3.5" />
                    {dateStr ? timeAgo(dateStr) : '—'}
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: st.bg, color: st.color }}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {st.label}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Records;
