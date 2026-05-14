import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Search, Eye, ChevronRight, Package, Truck, CheckCircle2, XCircle, Clock, MapPin, Phone, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-600 border-blue-200',
  packed: 'bg-purple-50 text-purple-600 border-purple-200',
  shipped: 'bg-orange-50 text-orange-600 border-orange-200',
  delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
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
          <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest mb-6 hover:text-slate-900 transition-colors">
            ← Back to Order Feed
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</h1>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${statusColors[selectedOrder.order_status]}`}>
                  {selectedOrder.order_status}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>
            
            <div className="flex gap-2">
               <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all">Print Invoice</button>
               <button className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">Contact Customer</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Items Card */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 font-heading">
                  <Package className="w-4 h-4" /> Ordered Items
                </h3>
                <div className="space-y-6">
                  {items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl p-2 flex-shrink-0 border border-slate-100">
                        <img src={item.image || '/placeholder.svg'} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm line-clamp-1 font-heading">{item.name}</p>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 text-sm font-heading">₹{(item.quantity * Number(item.price)).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-400 uppercase tracking-widest">Subtotal</span><span className="text-slate-900">₹{Number(selectedOrder.subtotal || selectedOrder.total).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-400 uppercase tracking-widest">Shipping Fee</span><span className="text-emerald-600 font-black">FREE</span></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight font-heading">Total Amount</span>
                    <span className="text-2xl font-black text-primary tracking-tighter font-heading">₹{Number(selectedOrder.total).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Customer Card */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 font-heading">
                    <MapPin className="w-4 h-4" /> Shipping Info
                  </h3>
                  {addr && (
                    <div className="space-y-1">
                      <p className="font-black text-slate-900 text-sm font-heading">{addr.fullName || addr.full_name}</p>
                      <p className="text-slate-500 text-xs leading-relaxed font-medium">
                        {addr.line1 || addr.address_line1}<br />
                        {(addr.line2 || addr.address_line2) ? `${addr.line2 || addr.address_line2}, ` : ''}
                        {addr.city}, {addr.state}<br />
                        {addr.pincode}
                      </p>
                      <div className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest mt-2">
                        <Phone className="w-3 h-3" /> {addr.phone}
                      </div>
                      {addr.gstNumber && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GST Details</p>
                          <p className="text-xs font-bold text-slate-900">{addr.businessName}</p>
                          <p className="text-[10px] font-medium text-emerald-600 tracking-wider font-mono">{addr.gstNumber}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 font-heading">
                    <CreditCard className="w-4 h-4" /> Payment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</span>
                      <span className="text-xs font-bold text-slate-900 capitalize">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${selectedOrder.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
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
                <div className="bg-primary rounded-[32px] p-8 shadow-xl text-white shadow-primary/20">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-6 font-heading">Execution Status</h3>
                  <div className="space-y-4">
                    <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:bg-white/20 outline-none font-bold appearance-none transition-all">
                      <option value="" className="text-slate-900">Select Next Status</option>
                      {statuses.filter(s => statuses.indexOf(s) > currentIdx).map(s => (
                        <option key={s} value={s} className="text-slate-900">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                      <option value="cancelled" className="text-slate-900">Cancelled</option>
                    </select>
                    
                    {updateStatus === 'shipped' && (
                      <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                        placeholder="Docket / Tracking #"
                        className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:bg-white/20 outline-none font-bold placeholder:text-white/30 transition-all" />
                    )}
                    
                    <button onClick={handleUpdateStatus} disabled={!updateStatus}
                      className="w-full bg-white text-primary hover:bg-slate-50 disabled:opacity-30 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                      Update Shipment
                    </button>
                  </div>
                </div>
              )}

              {/* Timeline Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 font-heading">Lifecycle Timeline</h3>
                <div className="space-y-6">
                  {statuses.map((s, i) => {
                    const Icon = statusIcons[s] || Clock;
                    const isActive = i <= currentIdx;
                    return (
                      <div key={s} className="flex gap-4 relative">
                        {i < statuses.length - 1 && (
                          <div className={`absolute left-3 top-6 bottom-[-24px] w-[2px] ${i < currentIdx ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                        )}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-300'}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-300'} font-heading`}>{s}</p>
                          {isActive && <p className="text-[10px] font-medium text-slate-400 mt-0.5">Completed</p>}
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
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-heading">Order Management</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Track and process customer fulfillment requests.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
          {(['all', 'pending', 'delivered'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ID or Customer..."
            className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm bg-white outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium" />
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto hide-scrollbar">
          {['all', 'confirmed', 'packed', 'shipped', 'cancelled'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="bg-white rounded-3xl h-32 animate-pulse border border-slate-100" />)
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold font-heading">No orders match your criteria</p>
          </div>
        ) : filteredOrders.map(order => {
          const addr = order.shipping_address;
          const items = order.items;
          const Icon = statusIcons[order.order_status] || Clock;
          return (
            <button key={order.id} onClick={() => { setSelectedOrder(order); setUpdateStatus(''); setTrackingNumber(''); }}
              className="group bg-white rounded-3xl shadow-sm border border-slate-200 p-6 w-full text-left hover:shadow-lg transition-all duration-300 transform active:scale-[0.99] flex flex-col md:flex-row md:items-center gap-6">
              
              <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${statusColors[order.order_status]}`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                   <h3 className="font-black text-slate-900 text-base tracking-tight font-heading">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                   <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md border ${statusColors[order.order_status]}`}>
                    {order.order_status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 capitalize">
                    👤 {addr?.fullName || addr?.full_name || 'Guest'}
                  </p>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    📍 {addr?.city || 'Local'}
                  </p>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    💳 {order.payment_method}
                  </p>
                </div>
              </div>

              <div className="md:text-right flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 font-heading">Revenue</p>
                 <p className="text-xl font-black text-slate-900 leading-none font-heading">₹{Number(order.total).toLocaleString('en-IN')}</p>
                 <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
              </div>

              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all border border-slate-100">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>

      {totalCount > pageSize && (
        <div className="flex items-center justify-between mt-12 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400">
            Showing <span className="text-slate-900">{(page-1)*pageSize + 1}</span> to <span className="text-slate-900">{Math.min(page*pageSize, totalCount)}</span> of <span className="text-slate-900">{totalCount}</span> orders
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 bg-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 transition-all border border-slate-200 hover:bg-slate-50"
            >
              Previous
            </button>
            <button 
              disabled={page * pageSize >= totalCount}
              onClick={() => setPage(prev => prev + 1)}
              className="px-4 py-2 bg-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 transition-all border border-slate-200 hover:bg-slate-50"
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
