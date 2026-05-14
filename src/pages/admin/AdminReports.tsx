import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, ShoppingBag, CreditCard, Package, AlertCircle, BarChart3, PieChart as PieIcon, LineChart as LineIcon, Layers } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface Order {
  id: string;
  created_at: string;
  total: number | string;
  items: { quantity?: number }[];
  payment_method?: string;
  order_status?: string;
  payment_status?: string;
}

interface Product {
  id: string;
  name: string;
  stock_qty: number;
  images?: string[];
}

const AdminReports = () => {
  const [tab, setTab] = useState('sales');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders')
          .select('id, total, created_at, items, payment_method')
          .gte('created_at', ninetyDaysAgo.toISOString())
          .order('created_at', { ascending: false }),
        supabase.from('products')
          .select('id, name, stock_qty, images')
          .order('stock_qty', { ascending: true }),
      ]);
      setOrders((ordersRes.data as unknown as Order[]) || []);
      setProducts(productsRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const avgOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;
  const totalItemsSold = orders.reduce((s, o) => s + (o.items?.reduce((a, i) => a + (i.quantity || 1), 0) || 0), 0);

  // Analytics derivation
  const revenueByDateMap: Record<string, number> = {};
  const ordersByDateMap: Record<string, number> = {};
  orders.forEach(o => {
    const d = new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    revenueByDateMap[d] = (revenueByDateMap[d] || 0) + Number(o.total || 0);
    ordersByDateMap[d] = (ordersByDateMap[d] || 0) + 1;
  });
  const revenueChartData = Object.entries(revenueByDateMap).reverse().map(([date, revenue]) => ({ date, revenue }));
  const ordersChartData = Object.entries(ordersByDateMap).reverse().map(([date, count]) => ({ date, count }));

  const paymentBreakdownMap: Record<string, number> = {};
  orders.forEach(o => { 
    const method = o.payment_method || 'other';
    paymentBreakdownMap[method] = (paymentBreakdownMap[method] || 0) + 1; 
  });
  const paymentPieData = Object.entries(paymentBreakdownMap).map(([name, value]) => ({ name, value }));

  const lowStockProducts = products.filter(p => p.stock_qty <= 5 && p.stock_qty > 0);
  const outOfStockProducts = products.filter(p => p.stock_qty === 0);

  return (
    <AdminLayout activeTab="reports">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Intelligence Terminal</h1>
          <p className="text-white/50 text-sm mt-1 font-medium">Holistic visualization of platform performance metrics.</p>
        </div>
        <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
           {(
             [
               ['sales', 'Commercials', BarChart3],
               ['products', 'Inventory', Layers],
               ['payments', 'Settlements', PieIcon]
             ] as [string, string, React.ElementType][]
           ).map(([k, l, Icon]) => (
             <button key={k} onClick={() => setTab(k)}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 tab === k ? 'glass-panel text-white shadow-lg' : 'text-white/40 hover:text-white/60'
               }`}>
               <Icon className={`w-3.5 h-3.5 ${tab === k ? 'text-blue-400' : 'text-white/30'}`} /> {l}
             </button>
           ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pb-12">
        {tab === 'sales' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Cumulative Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Transaction Volume', value: orders.length, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Mean Ticket Value', value: `₹${avgOrderValue.toLocaleString('en-IN')}`, icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'Inventory Dispatch', value: totalItemsSold, icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map(s => (
                <div key={s.label} className="glass-panel rounded-[40px] p-8 shadow-lg border border-white/10 flex flex-col justify-between">
                  <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6`}>
                     <s.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white tracking-tight">{s.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-panel rounded-[40px] p-10 shadow-lg border border-white/10">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                     <LineIcon className="w-4 h-4 text-blue-500" /> Revenue Stream
                   </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} />
                      <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel rounded-[40px] p-10 shadow-lg border border-white/10">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                     <BarChart3 className="w-4 h-4 text-emerald-500" /> Order Velocity
                   </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} />
                      <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }} />
                      <Bar dataKey="count" fill="#10B981" radius={[8, 8, 8, 8]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-panel rounded-[40px] p-10 shadow-lg border border-white/10">
              <div className="flex items-center gap-2 mb-8 text-red-400">
                 <AlertCircle className="w-5 h-5 flex-shrink-0" />
                 <h3 className="text-sm font-black uppercase tracking-widest leading-none">Depleted Stock ({outOfStockProducts.length})</h3>
              </div>
              <div className="space-y-4">
                {outOfStockProducts.length === 0 ? <p className="text-white/30 font-bold text-center py-10">All items are operational</p> : outOfStockProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 bg-red-500/10/30 rounded-3xl border border-red-50">
                    <img src={p.images?.[0] || '/placeholder.svg'} alt="" className="w-12 h-12 object-contain glass-panel rounded-xl shadow-lg" />
                    <div className="flex-1">
                      <p className="text-sm font-black text-white line-clamp-1">{p.name}</p>
                      <p className="text-[10px] font-black uppercase text-red-400 tracking-widest mt-0.5">Critical Depletion</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[40px] p-10 shadow-lg border border-white/10">
              <div className="flex items-center gap-2 mb-8 text-amber-500">
                 <Package className="w-5 h-5 flex-shrink-0" />
                 <h3 className="text-sm font-black uppercase tracking-widest leading-none">Low Reserve Alert ({lowStockProducts.length})</h3>
              </div>
              <div className="space-y-4">
                {lowStockProducts.length === 0 ? <p className="text-white/30 font-bold text-center py-10">Healthy reserves detected</p> : lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 bg-amber-50/30 rounded-3xl border border-amber-50">
                    <img src={p.images?.[0] || '/placeholder.svg'} alt="" className="w-12 h-12 object-contain glass-panel rounded-xl shadow-lg" />
                    <div className="flex-1">
                      <p className="text-sm font-black text-white line-clamp-1">{p.name}</p>
                      <p className="text-[10px] font-black uppercase text-amber-400 tracking-widest mt-0.5">{p.stock_qty} Units remaining</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="glass-panel rounded-[40px] p-12 shadow-lg border border-white/10 max-w-2xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-center gap-2 mb-12">
                <PieIcon className="w-6 h-6 text-blue-500" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white/40 leading-none">Settlement Distribution</h3>
             </div>
             
             {paymentPieData.length === 0 ? <p className="text-white/30 font-bold py-20">Awaiting transaction data...</p> : (
               <div className="flex flex-col md:flex-row items-center justify-around gap-12">
                 <div className="h-64 w-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={paymentPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                         {paymentPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                       </Pie>
                       <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }} />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="space-y-4 text-left">
                    {paymentPieData.map((d, i) => (
                      <div key={i} className="flex items-center gap-4">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                         <div>
                            <p className="text-xs font-black text-white uppercase tracking-widest">{d.name}</p>
                            <p className="text-[10px] font-bold text-white/40">{d.value} Transactions</p>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
             )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
