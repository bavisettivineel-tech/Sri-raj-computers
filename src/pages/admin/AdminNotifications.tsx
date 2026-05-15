import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Check, ShoppingBag, AlertTriangle, Users, Store, Globe, Trash2, CheckCircle2, Clock } from 'lucide-react';
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

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from('admin_notifications').delete().eq('id', id);
    if (error) { toast.error('Delete failed'); return; }
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const typeMeta: Record<string, { icon: React.ElementType, color: string, bg: string, border: string }> = {
    order: { icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' },
    stock: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    user: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    dealer: { icon: Store, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    system: { icon: Globe, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100' },
  };

  return (
    <AdminLayout activeTab="notifications">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-heading">Signal Feed</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Real-time system telemetry and activity logs.</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-primary hover:border-primary transition-all shadow-sm">
              Clear All Signals
           </button>
           <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              {[ ['all', 'All Logs'], ['unread', 'Critical'] ].map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filter === k ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'
                  }`}>
                  {l}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pb-12">
        {loading ? (
          <div className="space-y-6">
            {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-[32px] h-28 animate-pulse border border-slate-200 shadow-sm" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[30px] flex items-center justify-center text-slate-200 mx-auto mb-8 shadow-sm">
              <Bell className="w-10 h-10" />
            </div>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Silence across metrics</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notifications.map(n => {
              const meta = typeMeta[n.type] || typeMeta.system;
              const Icon = meta.icon;
              return (
                <div key={n.id} className={`group bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 transition-all duration-500 hover:shadow-xl hover:border-primary/20 flex items-start gap-8 relative ${!n.is_read ? 'border-l-4 border-l-primary' : ''}`}>
                  <div className={`w-16 h-16 ${meta.bg} ${meta.color} border ${meta.border} rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm transition-all duration-500 group-hover:scale-105`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="font-black text-slate-900 text-lg tracking-tight font-heading group-hover:text-primary transition-colors">{n.title}</h4>
                       <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                         <Clock className="w-3.5 h-3.5" /> {new Date(n.created_at).toLocaleDateString()}
                       </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">{n.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        {!n.is_read && (
                          <button onClick={() => markRead(n.id)} className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest hover:bg-primary/5 px-4 py-2 rounded-xl transition-all border border-primary/10">
                            <CheckCircle2 className="w-4 h-4" /> Acknowledge Signal
                          </button>
                        )}
                        <button onClick={() => deleteNotification(n.id)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest hover:bg-red-50 hover:text-red-500 px-4 py-2 rounded-xl transition-all border border-slate-100 hover:border-red-100">
                          <Trash2 className="w-4 h-4" /> Dismiss
                        </button>
                      </div>
                      
                      {!n.is_read && (
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                      )}
                    </div>
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
