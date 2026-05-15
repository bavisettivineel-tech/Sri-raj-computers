import React, { useEffect, useState, useCallback } from 'react';
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
          <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest mb-6 hover:text-primary transition-colors">
            ← Back to Order Feed
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</h1>
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${statusColors[selectedOrder.order_status]}`}>
                  {selectedOrder.order_status}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>
            
            <div className="flex gap-3">
               <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">Print Invoice</button>
               <button className="bg-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">Support Channel</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3 font-heading">
                  <Package className="w-5 h-5 text-slate-300" /> Manifest Contents
                </h3>
                <div className="space-y-8">
                  {items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-6 group">
                      <div className="w-20 h-20 bg-slate-50 rounded-2xl p-3 flex-shrink-0 border border-slate-100 flex items-center justify-center overflow-hidden">
                        <img src={item.image || '/placeholder.svg'} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 text-base line-clamp-1 font-heading">{item.name}</p>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1.5">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 text-base font-heading">₹{(item.quantity * Number(item.price)).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 pt-10 border-t border-slate-100 space-y-4">
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-400 uppercase tracking-widest">Gross Merchandise Value</span><span className="text-slate-900">₹{Number(selectedOrder.subtotal || selectedOrder.total).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-400 uppercase tracking-widest">Logistics Fee</span><span className="text-emerald-600 font-black">COMPLIMENTARY</span></div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <span className="text-base font-black text-slate-900 uppercase tracking-tight font-heading">Settlement Total</span>
                    <span className="text-3xl font-black text-primary tracking-tighter font-heading">₹{Number(selectedOrder.total).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3 font-heading">
                    <MapPin className="w-5 h-5 text-slate-300" /> Dispatch Destination
                  </h3>
                  {addr && (
                    <div className="space-y-1.5">
                      <p className="font-black text-slate-900 text-base font-heading">{addr.fullName || addr.full_name}</p>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium">
                        {addr.line1 || addr.address_line1}<br />
                        {(addr.line2 || addr.address_line2) ? `${addr.line2 || addr.address_line2}, ` : ''}
                        {addr.city}, {addr.state}<br />
                        {addr.pincode}
                      </p>
                      <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest mt-4 bg-primary/5 px-3 py-2 rounded-xl border border-primary/10 w-fit">
                        <Phone className="w-4 h-4" /> {addr.phone}
                      </div>
                      {addr.gstNumber && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">B2B Identification</p>
                          <p className="text-xs font-bold text-slate-900">{addr.businessName}</p>
                          <p className="text-[10px] font-black text-emerald-600 tracking-wider font-heading mt-0.5">{addr.gstNumber}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3 font-heading">
                    <CreditCard className="w-5 h-5 text-slate-300" /> Transaction Audit
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gateway</span>
                      <span className="text-xs font-bold text-slate-900 capitalize font-heading">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${selectedOrder.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {selectedOrder.order_status !== 'delivered' && selectedOrder.order_status !== 'cancelled' && (
                <div className="bg-primary rounded-[40px] p-10 shadow-xl text-white shadow-primary/20 border border-primary/10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-8 font-heading">Operational Controls</h3>
                  <div className="space-y-5">
                    <div className="relative">
                      <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-sm focus:bg-white/20 outline-none font-bold appearance-none transition-all cursor-pointer">
                        <option value="" className="text-slate-900">Select Status Action</option>
                        {statuses.filter(s => statuses.indexOf(s) > currentIdx).map(s => (
                          <option key={s} value={s} className="text-slate-900">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                        <option value="cancelled" className="text-slate-900">Void Order</option>
                      </select>
                    </div>
                    
                    {updateStatus === 'shipped' && (
                      <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                        placeholder="Logistics Docket ID"
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-sm focus:bg-white/20 outline-none font-bold placeholder:text-white/30 transition-all" />
                    )}
                    
                    <button onClick={handleUpdateStatus} disabled={!updateStatus}
                      className="w-full bg-white text-primary hover:bg-slate-50 disabled:opacity-30 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 mt-4">
                      Deploy Update
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 font-heading text-center">Execution Roadmap</h3>
                <div className="space-y-8">
                  {statuses.map((s, i) => {
                    const Icon = statusIcons[s] || Clock;
                    const isActive = i <= currentIdx;
                    return (
                      <div key={s} className="flex gap-5 relative">
                        {i < statuses.length - 1 && (
                          <div className={`absolute left-4 top-8 bottom-[-32px] w-[2px] ${i < currentIdx ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                        )}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center z-10 border-2 transition-all duration-500 ${isActive ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-white text-slate-200 border-slate-100'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-300'} font-heading`}>{s}</p>
                          {isActive && <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase">Phase Validated</p>}
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-heading">Fulfillment Log</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Track and process customer fulfillment requests.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
          {(['all', 'pending', 'delivered'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Ledger ID or Customer Name..."
            className="w-full pl-14 pr-6 py-4.5 border border-slate-200 rounded-2xl text-sm bg-white outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold shadow-sm" />
        </div>
        <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto hide-scrollbar">
          {['all', 'confirmed', 'packed', 'shipped', 'cancelled'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-white/50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="bg-white rounded-[32px] h-32 animate-pulse border border-slate-200 shadow-sm" />)
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200 shadow-sm">
            <Package className="w-20 h-20 text-slate-100 mx-auto mb-6" />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest font-heading">No ledger entries identified</p>
          </div>
        ) : filteredOrders.map(order => {
          const addr = order.shipping_address;
          const items = order.items;
          const Icon = statusIcons[order.order_status] || Clock;
          return (
            <button key={order.id} onClick={() => { setSelectedOrder(order); setUpdateStatus(''); setTrackingNumber(''); }}
              className="group bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 w-full text-left hover:shadow-xl hover:border-primary/20 transition-all duration-500 transform active:scale-[0.99] flex flex-col md:flex-row md:items-center gap-10">
              
              <div className={`w-16 h-16 rounded-[24px] flex-shrink-0 flex items-center justify-center border shadow-sm transition-all duration-500 group-hover:scale-105 ${statusColors[order.order_status]}`}>
                <Icon className="w-7 h-7" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-2">
                   <h3 className="font-black text-slate-900 text-lg tracking-tight font-heading group-hover:text-primary transition-colors">#{order.id.slice(0, 8).toUpperCase()}</h3>
                   <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border ${statusColors[order.order_status]}`}>
                    {order.order_status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-2 capitalize">
                    <span className="text-slate-300">USER:</span> {addr?.fullName || addr?.full_name || 'Guest'}
                  </p>
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-tight">
                    <span className="text-slate-300">HUB:</span> {addr?.city || 'Local'}
                  </p>
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <span className="text-slate-300">PAY:</span> {order.payment_method}
                  </p>
                </div>
              </div>

              <div className="md:text-right flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-heading">Total Value</p>
                 <p className="text-2xl font-black text-slate-900 leading-none font-heading tracking-tighter">₹{Number(order.total).toLocaleString('en-IN')}</p>
                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all border border-slate-100 shadow-sm">
                <ChevronRight className="w-6 h-6" />
              </div>
            </button>
          );
        })}
      </div>

      {totalCount > pageSize && (
        <div className="flex items-center justify-between mt-12 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Ledger Range: <span className="text-slate-900 font-bold">{(page-1)*pageSize + 1} - {Math.min(page*pageSize, totalCount)}</span> of <span className="text-slate-900 font-bold">{totalCount}</span>
          </p>
          <div className="flex gap-3">
            <button 
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="px-6 py-3 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all border border-slate-200 hover:bg-slate-50 active:scale-95"
            >
              Previous Page
            </button>
            <button 
              disabled={page * pageSize >= totalCount}
              onClick={() => setPage(prev => prev + 1)}
              className="px-6 py-3 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all border border-slate-200 hover:bg-slate-50 active:scale-95"
            >
              Next Page
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
