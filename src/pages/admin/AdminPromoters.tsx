import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Megaphone, CheckCircle, Clock, User, Phone, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';

const AdminPromoters = () => {
  const qc = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['admin-promoter-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('subject', 'Promoter Application')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promoter-applications'] });
      toast.success('Status updated');
    },
  });

  const parseMessage = (msg: string) => {
    const contactMatch = msg.match(/Contact:\s*(.+)/);
    const audienceMatch = msg.match(/Audience:\s*(.+)/);
    const descMatch = msg.match(/Description:\s*([\s\S]+?)\n\nUser:/);
    const userMatch = msg.match(/User:\s*(.+)/);
    return {
      contact: contactMatch?.[1]?.trim() || '—',
      audience: audienceMatch?.[1]?.trim() || '—',
      description: descMatch?.[1]?.trim() || '—',
      user: userMatch?.[1]?.trim() || '—',
    };
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F04438, #E03328)' }}>
          <Megaphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Promoter Applications</h1>
          <p className="text-muted-foreground text-sm">{applications.length} total applications</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading applications…</div>
      ) : applications.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold text-foreground">No applications yet</p>
          <p className="text-sm text-muted-foreground mt-1">Promoter applications will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app: any) => {
            const parsed = parseMessage(app.message || '');
            const isPending = app.status === 'open';
            return (
              <div key={app.id} className="admin-card p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#FEF2F2' }}>
                      <Megaphone className="w-5 h-5" style={{ color: '#F04438' }} />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Promoter Application</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isPending
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {isPending ? 'Pending' : 'Reviewed'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: '#F9FAFB' }}>
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">User</p>
                      <p className="text-sm font-semibold text-foreground">{parsed.user}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: '#F9FAFB' }}>
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Contact</p>
                      <p className="text-sm font-semibold text-foreground">{parsed.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: '#F9FAFB' }}>
                    <Users className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Audience</p>
                      <p className="text-sm font-semibold text-foreground">{parsed.audience}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-xl md:col-span-2" style={{ background: '#F9FAFB' }}>
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Promotion Strategy</p>
                      <p className="text-sm text-foreground">{parsed.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isPending && (
                    <button
                      onClick={() => updateStatus.mutate({ id: app.id, status: 'resolved' })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Reviewed
                    </button>
                  )}
                  {!isPending && (
                    <button
                      onClick={() => updateStatus.mutate({ id: app.id, status: 'open' })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                      style={{ background: '#F3F4F6', color: '#374151' }}
                    >
                      <Clock className="w-4 h-4" />
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPromoters;
