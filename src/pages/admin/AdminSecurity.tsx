import { useState } from 'react';
import { Shield, Search, Monitor } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminSecurity = () => {
  const [tab, setTab] = useState<'logs' | 'devices'>('logs');

  const { data: adminLogs } = useQuery({
    queryKey: ['admin-security-logs'],
    queryFn: async () => {
      const { data } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(50);
      return data || [];
    },
    enabled: tab === 'logs',
  });

  const { data: devices } = useQuery({
    queryKey: ['admin-devices'],
    queryFn: async () => {
      const { data } = await supabase.from('user_devices').select('*').order('last_login_at', { ascending: false }).limit(50);
      const userIds = [...new Set((data || []).map(d => d.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, phone_number, full_name').in('id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      return (data || []).map(d => ({ ...d, profile: profileMap.get(d.user_id) }));
    },
    enabled: tab === 'devices',
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Security</h1>
        <p className="text-muted-foreground text-sm">Audit logs & device tracking</p>
      </div>

      <div className="flex gap-2 mb-4">
        {(['logs', 'devices'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === t ? 'clay-button' : 'admin-card'}`}>
            {t === 'logs' ? 'Admin Logs' : 'Device Tracking'}
          </button>
        ))}
      </div>

      {tab === 'logs' && (
        <div className="space-y-2">
          {adminLogs?.length === 0 ? (
            <div className="admin-card p-8 text-center text-muted-foreground">No logs yet</div>
          ) : adminLogs?.map(log => (
            <div key={log.id} className="admin-card p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{log.action.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.target_type && `${log.target_type} · `}
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'devices' && (
        <div className="space-y-2">
          {devices?.length === 0 ? (
            <div className="admin-card p-8 text-center text-muted-foreground">No devices tracked</div>
          ) : devices?.map((d: any) => (
            <div key={d.id} className="admin-card p-4">
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{d.profile?.full_name || 'User'} · {d.profile?.phone_number}</p>
                  <p className="text-xs text-muted-foreground truncate">{d.user_agent || 'Unknown device'}</p>
                  <p className="text-[10px] text-muted-foreground">IP: {d.ip_address || 'N/A'} · Last login: {new Date(d.last_login_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSecurity;
