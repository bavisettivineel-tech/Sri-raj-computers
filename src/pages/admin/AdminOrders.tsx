import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Search, Eye, ChevronRight, Package, Truck, CheckCircle2, XCircle, Clock, MapPin, Phone, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  packed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  shipped: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle2,
  packed: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

interface OrderItem {
  name: string;
  price: number | string;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  full_name?: string;
  fullName?: string;
  address_line1?: string;
  line1?: string;
  address_line2?: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  gstNumber?: string;
  businessName?: string;
  discountAmount?: number;
  discountLabel?: string;
}

interface Order {
  id: string;
  created_at: string;
  total: number | string;
  subtotal: number | string;
  order_status: string;
  payment_method: string;
  payment_status: string;
  shipping_address?: ShippingAddress | null;
  items?: OrderItem[] | null;
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*', { count: 'exact' });
    
    if (filter !== 'all') query = query.eq('order_status', filter);
    if (search) {
      query = query.ilike('id', `%${search}%`);
    }
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) toast.error('Failed to load orders');
    setOrders((data as unknown as Order[]) || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [filter, search, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Search is now handled server-side
  const filteredOrders = orders;

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !updateStatus) return;
    const toastId = toast.loading('Updating order status...');
    const updates: { order_status: string; tracking_number?: string; updated_at: string } = { 
      order_status: updateStatus,
      updated_at: new Date().toISOString()
    };
    if (trackingNumber) updates.tracking_number = trackingNumber;
    
    const { error } = await supabase.from('orders').update(updates).eq('id', selectedOrder.id);
    if (error) { toast.error(error.message, { id: toastId }); return; }
    
    toast.success('Order updated successfully', { id: toastId });
    setSelectedOrder(null);
    fetchOrders();
  };

  if (selectedOrder) {
    const addr = selectedOrder.shipping_address;
    const items = selectedOrder.items;
    const statuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
    const currentIdx = statuses.indexOf(selectedOrder.order_status);

    return (
      <AdminLayout activeTab="orders">
        <div className="max-w-4xl mx-auto pb-12">
          <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-white/40 font-bold text-xs uppercase tracking-widest mb-6 hover:text-white transition-colors">
            ← Back to Order Feed
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-white tracking-tight">Order #{selectedOrder.id.slice(0, 8)}</h1>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${statusColors[selectedOrder.order_status]}`}>
                  {selectedOrder.order_status}
                </span>
              </div>
              <p className="text-white/50 text-sm font-medium">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>
            
            <div className="flex gap-2">
               <button className="glass-panel border border-white/20 px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-white/5 backdrop-blur-md transition-all">Print Invoice</button>
               <button className="bg-blue-gradient text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 transition-all">Contact Customer</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Items Card */}
              <div className="glass-panel rounded-3xl p-8 shadow-lg border border-white/10">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Ordered Items
                </h3>
                <div className="space-y-6">
                  {items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl p-2 flex-shrink-0">
                        <img src={item.image || '/placeholder.svg'} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm line-clamp-1">{item.name}</p>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-0.5">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white text-sm">₹{(item.quantity * Number(item.price)).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
                  <div className="flex justify-between text-xs font-bold"><span className="text-white/40 uppercase tracking-widest">Subtotal</span><span className="text-white">₹{Number(selectedOrder.subtotal || selectedOrder.total).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-xs font-bold"><span className="text-white/40 uppercase tracking-widest">Shipping Fee</span><span className="text-emerald-500 font-black">FREE</span></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-black text-white uppercase tracking-tight">Total Amount</span>
                    <span className="text-2xl font-black text-blue-400 tracking-tighter">₹{Number(selectedOrder.total).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Customer Card */}
              <div className="glass-panel rounded-3xl p-8 shadow-lg border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Shipping Info
                  </h3>
                  {addr && (
                    <div className="space-y-1">
                      <p className="font-black text-white text-sm">{addr.fullName || addr.full_name}</p>
                      <p className="text-white/50 text-xs leading-relaxed font-medium">
                        {addr.line1 || addr.address_line1}<br />
                        {(addr.line2 || addr.address_line2) ? `${addr.line2 || addr.address_line2}, ` : ''}
                        {addr.city}, {addr.state}<br />
                        {addr.pincode}
                      </p>
                      <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-black uppercase tracking-widest mt-2">
                        <Phone className="w-3 h-3" /> {addr.phone}
                      </div>
                      {addr.gstNumber && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">GST Details</p>
                          <p className="text-xs font-bold text-white">{addr.businessName}</p>
                          <p className="text-[10px] font-medium text-emerald-400 tracking-wider font-mono">{addr.gstNumber}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Payment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Method</span>
                      <span className="text-xs font-bold text-white capitalize">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Status</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${selectedOrder.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Order Status Action */}
              {selectedOrder.order_status !== 'delivered' && selectedOrder.order_status !== 'cancelled' && (
                <div className="bg-blue-gradient rounded-[32px] p-8 shadow-xl text-white">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6">Execution Status</h3>
                  <div className="space-y-4">
                    <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-sm focus:bg-white/20 backdrop-blur-md outline-none font-bold appearance-none transition-all">
                      <option value="" className="text-white">Select Next Status</option>
                      {statuses.filter(s => statuses.indexOf(s) > currentIdx).map(s => (
                        <option key={s} value={s} className="text-white">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                      <option value="cancelled" className="text-white">Cancelled</option>
                    </select>
                    
                    {updateStatus === 'shipped' && (
                      <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                        placeholder="Docket / Tracking #"
                        className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-sm focus:bg-white/20 backdrop-blur-md outline-none font-bold placeholder:text-white/30 transition-all" />
                    )}
                    
                    <button onClick={handleUpdateStatus} disabled={!updateStatus}
                      className="w-full bg-blue-gradient hover:shadow-blue disabled:opacity-30 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                      Update Shipment
                    </button>
                  </div>
                </div>
              )}

              {/* Timeline Card */}
              <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Lifecycle Timeline</h3>
                <div className="space-y-6">
                  {statuses.map((s, i) => {
                    const Icon = statusIcons[s] || Clock;
                    const isActive = i <= currentIdx;
                    return (
                      <div key={s} className="flex gap-4 relative">
                        {i < statuses.length - 1 && (
                          <div className={`absolute left-3 top-6 bottom-[-24px] w-[2px] ${i < currentIdx ? 'bg-emerald-500' : 'bg-white/10 backdrop-blur-md'}`} />
                        )}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/10 backdrop-blur-md text-white/30'}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/30'}`}>{s}</p>
                          {isActive && <p className="text-[10px] font-medium text-white/40 mt-0.5">Completed</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="orders">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Order Management</h1>
          <p className="text-white/50 text-sm mt-1 font-medium">Track and process customer fulfillment requests.</p>
        </div>
        <div className="flex items-center gap-2 p-1 glass-panel rounded-2xl border border-white/10">
          {(['all', 'pending', 'delivered'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-gradient text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-500 transition-colors" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ID or Customer..."
            className="w-full pl-12 pr-4 py-3.5 border border-white/20 rounded-2xl text-sm glass-panel outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#3B82F6] transition-all font-medium" />
        </div>
        <div className="flex gap-1 bg-white/10 backdrop-blur-md p-1 rounded-2xl overflow-x-auto hide-scrollbar">
          {['all', 'confirmed', 'packed', 'shipped', 'cancelled'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === f ? 'glass-panel text-white shadow-lg' : 'text-white/40 hover:bg-white/50 backdrop-blur-md'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="glass-panel rounded-3xl h-32 animate-pulse border border-white/10" />)
        ) : filteredOrders.length === 0 ? (
          <div className="glass-panel rounded-[40px] p-20 text-center border-2 border-dashed border-white/10">
            <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-bold">No orders match your criteria</p>
          </div>
        ) : filteredOrders.map(order => {
          const addr = order.shipping_address;
          const items = order.items;
          const Icon = statusIcons[order.order_status] || Clock;
          return (
            <button key={order.id} onClick={() => { setSelectedOrder(order); setUpdateStatus(''); setTrackingNumber(''); }}
              className="group glass-panel rounded-3xl shadow-lg border border-white/10 p-6 w-full text-left hover:shadow-2xl hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]/50 transition-all duration-300 transform active:scale-[0.99] flex flex-col md:flex-row md:items-center gap-6">
              
              <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${statusColors[order.order_status]}`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                   <h3 className="font-black text-white text-base tracking-tight">Order #{order.id.slice(0, 8)}</h3>
                   <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md border ${statusColors[order.order_status]}`}>
                    {order.order_status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <p className="text-xs font-bold text-white/40 flex items-center gap-1.5 capitalize">
                    👤 {addr?.fullName || addr?.full_name || 'Guest'}
                  </p>
                  <p className="text-xs font-bold text-white/40 flex items-center gap-1.5">
                    📍 {addr?.city || 'Local'}
                  </p>
                  <p className="text-xs font-bold text-white/40 flex items-center gap-1.5">
                    💳 {order.payment_method}
                  </p>
                </div>
              </div>

              <div className="md:text-right flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Revenue</p>
                 <p className="text-xl font-black text-white leading-none">₹{Number(order.total).toLocaleString('en-IN')}</p>
                 <p className="text-[10px] font-bold text-white/40 mt-1">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-white/30 group-hover:bg-blue-gradient group-hover:text-white transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>

      {totalCount > pageSize && (
        <div className="flex items-center justify-between mt-12 bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10">
          <p className="text-xs font-bold text-white/40">
            Showing <span className="text-white">{(page-1)*pageSize + 1}</span> to <span className="text-white">{Math.min(page*pageSize, totalCount)}</span> of <span className="text-white">{totalCount}</span> orders
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

export default AdminOrders;
