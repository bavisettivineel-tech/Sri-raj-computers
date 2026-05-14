import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Check, ShoppingBag, AlertTriangle, Users, Store, Globe, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('admin_notifications').select('*').order('created_at', { ascending: false });
    if (filter === 'unread') query = query.eq('is_read', false);
    const { data } = await query;
    setNotifications(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    const channel = supabase.channel('admin-notifs-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_notifications' }, () => fetchNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const { error } = await supabase.from('admin_notifications').update({ is_read: true }).eq('is_read', false);
    if (error) { toast.error('Command failure'); return; }
    toast.success('System buffer cleared');
    fetchNotifications();
  };

  const typeMeta: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
    order: { icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    stock: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    user: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    dealer: { icon: Store, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    system: { icon: Globe, color: 'text-white/60', bg: 'bg-white/5 backdrop-blur-md' },
  };

  return (
    <AdminLayout activeTab="notifications">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Signal Feed</h1>
          <p className="text-white/50 text-sm mt-1 font-medium">Real-time system telemetry and activity logs.</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-700 px-4 py-2 bg-blue-500/10/50 rounded-xl transition-all">
              Mark all read
           </button>
           <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl">
              {[ ['all', 'All Logs'], ['unread', 'Criticals'] ].map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === k ? 'glass-panel text-white shadow-lg' : 'text-white/40 hover:text-white/60'
                  }`}>
                  {l}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pb-12">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="glass-panel rounded-[32px] h-24 animate-pulse border border-white/10" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-panel rounded-[40px] p-24 text-center border-2 border-dashed border-white/10 animate-in fade-in zoom-in-95 duration-500">
            <Bell className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.2em]">Silence across metrics</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(n => {
              const meta = typeMeta[n.type] || typeMeta.system;
              const Icon = meta.icon;
              return (
                <div key={n.id} className={`group glass-panel rounded-[32px] p-6 shadow-lg border border-white/10 transition-all duration-500 hover:shadow-xl hover:border-blue-500/30 flex items-start gap-6 ${!n.is_read ? 'bg-blue-500/10/20' : ''}`}>
                  <div className={`w-14 h-14 ${meta.bg} ${meta.color} rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                       <h4 className="font-black text-white text-base tracking-tight">{n.title}</h4>
                       <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-medium text-white/50 leading-relaxed mb-4">{n.message}</p>
                    
                    {!n.is_read && (
                      <button onClick={() => markRead(n.id)} className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 tracking-widest hover:text-blue-700 transition-colors">
                        <CheckCircle2 className="w-4 h-4" /> Acknowledge Signal
                      </button>
                    )}
                  </div>

                  <div className="w-2 flex-shrink-0 flex flex-col justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="text-white/20 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
