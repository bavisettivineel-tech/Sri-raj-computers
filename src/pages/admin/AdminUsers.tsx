import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Search, Users, Eye, X, Mail, Phone, Calendar, ShoppingBag, CreditCard, ArrowUpRight, Package } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
}

interface UserOrder {
  id: string;
  created_at: string;
  total: number | string;
  order_status: string;
  payment_status: string;
}

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 18;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase.from('profiles').select('*', { count: 'exact' });
      
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
      if (error) toast.error('Failed to load customers');
      setProfiles(data || []);
      setTotalCount(count || 0);
      setLoading(false);
    };
    fetch();
  }, [search, page]);

  // Search is handled server-side
  const filteredProfiles = profiles;

  const viewUser = async (profile: UserProfile) => {
    setSelectedUser(profile);
    const { data } = await supabase.from('orders').select('*').eq('user_id', profile.user_id).order('created_at', { ascending: false });
    setUserOrders(data || []);
  };

  if (selectedUser) {
    const totalSpent = userOrders.reduce((s, o) => s + Number(o.total || 0), 0);
    return (
      <AdminLayout activeTab="users">
        <div className="max-w-4xl mx-auto pb-12">
          <button onClick={() => setSelectedUser(null)} className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-[0.2em] mb-8 hover:text-white transition-colors">
            ← Directory
          </button>
          
          <div className="glass-panel rounded-[40px] p-8 md:p-12 shadow-lg border border-white/10 mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10/50 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-blue-gradient text-white rounded-[32px] flex items-center justify-center text-3xl font-black shadow-2xl shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                {(selectedUser.first_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-black text-white tracking-tight">{selectedUser.first_name} {selectedUser.last_name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-white/50 font-bold text-xs">
                    <Phone className="w-3.5 h-3.5" /> {selectedUser.phone || 'No phone'}
                  </span>
                  <span className="flex items-center gap-1.5 text-white/50 font-bold text-xs">
                    <Calendar className="w-3.5 h-3.5" /> Since {new Date(selectedUser.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 relative z-10">
              {[
                { label: 'Purchases', value: userOrders.length, icon: ShoppingBag, color: 'bg-blue-500/10 text-blue-400' },
                { label: 'Revenue', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: CreditCard, color: 'bg-emerald-500/10 text-emerald-500' },
                { label: 'Avg Ticket', value: `₹${userOrders.length ? Math.round(totalSpent / userOrders.length).toLocaleString('en-IN') : 0}`, icon: ArrowUpRight, color: 'bg-white/10 backdrop-blur-md text-white' }
              ].map((stat, i) => (
                <div key={i} className="glass-panel border border-white/10 p-6 rounded-3xl group hover:shadow-xl hover:shadow-blue transition-all">
                  <div className={`w-10 h-10 rounded-2xl ${stat.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 px-4 tracking-tight">
            Purchase History <span className="text-[10px] bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full text-white/50">{userOrders.length}</span>
          </h2>
          
          <div className="space-y-4">
            {userOrders.map(order => (
              <div key={order.id} className="glass-panel group rounded-[32px] shadow-lg border border-white/10 p-6 flex items-center justify-between hover:border-blue-500/30 hover:shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">#{order.id.slice(0, 8)}</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
                      {new Date(order.created_at).toLocaleDateString()} • {order.order_status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-white tracking-tight">₹{Number(order.total).toLocaleString('en-IN')}</p>
                  <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${order.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {order.payment_status}
                  </div>
                </div>
              </div>
            ))}
            {userOrders.length === 0 && (
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-dashed border-white/10">
                 <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-2" />
                 <p className="text-white/40 font-bold text-sm">No shopping activity yet</p>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="users">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
           <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Customer Database</h1>
           <p className="text-white/50 text-sm mt-1 font-medium">Explore and manage your store's user base.</p>
        </div>
        <div className="glass-panel p-2 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3 px-6">
           <div className="text-right">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Active</p>
              <p className="text-xl font-black text-white leading-none">{totalCount}</p>
           </div>
           <Users className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      <div className="relative group mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-500 transition-colors" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search directory by name, tel or email..."
          className="w-full pl-12 pr-4 py-3.5 border border-white/20 rounded-3xl text-sm glass-panel outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#3B82F6] transition-all font-medium" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="glass-panel rounded-[40px] h-32 animate-pulse border border-white/10" />)}
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="glass-panel rounded-[40px] p-20 text-center border-2 border-dashed border-white/10">
          <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 font-bold">No customers match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map(profile => (
            <button key={profile.id} onClick={() => viewUser(profile)} 
              className="group glass-panel rounded-[40px] shadow-lg border border-white/10 p-8 text-left hover:shadow-2xl hover:border-blue-500/30 hover:shadow-blue transition-all duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all -translate-y-4 group-hover:translate-y-0">
                  <ArrowUpRight className="w-5 h-5 text-blue-400" />
               </div>
               
               <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-white/5 backdrop-blur-md text-white/40 group-hover:bg-blue-gradient group-hover:text-white rounded-2xl flex items-center justify-center text-lg font-black transition-all duration-500">
                  {(profile.first_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-black text-white group-hover:text-blue-400 transition-colors">{profile.first_name} {profile.last_name}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Regular Buyer</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/50 text-xs font-bold">
                   <Phone className="w-3.5 h-3.5 text-white/30" /> {profile.phone || 'Private line'}
                </div>
                <div className="flex items-center gap-2 text-white/50 text-xs font-bold">
                   <Calendar className="w-3.5 h-3.5 text-white/30" /> Joined {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {totalCount > pageSize && (
        <div className="flex items-center justify-between mt-12 bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10">
          <p className="text-xs font-bold text-white/40">
            Showing <span className="text-white">{(page-1)*pageSize + 1}</span> to <span className="text-white">{Math.min(page*pageSize, totalCount)}</span> of <span className="text-white">{totalCount}</span> users
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 glass-panel rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 transition-all border border-white/10 hover:border-blue-500/30"
            >
              Previous
            </button>
            <button 
              disabled={page * pageSize >= totalCount}
              onClick={() => setPage(prev => prev + 1)}
              className="px-4 py-2 glass-panel rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 transition-all border border-white/10 hover:border-blue-500/30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
