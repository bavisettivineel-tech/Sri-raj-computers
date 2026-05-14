import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, TrendingUp, UserCheck, Ticket, Plus, FolderOpen, Image, Megaphone } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cleanupOldOrders } from '@/utils/orderCleanup';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30',
  packed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  shipped: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

interface RecentOrder {
  id: string;
  total: number | string;
  order_status: string;
  created_at: string;
}

interface RevenueDataPoint {
  date: string;
  revenue: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, pending: 0, lowStock: 0, users: 0, pendingDealers: 0, activeCoupons: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    cleanupOldOrders();
    const fetchStats = async () => {
      const now = new Date();
      const startDate = new Date();
      if (period === 'week') startDate.setDate(now.getDate() - 7);
      else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
      else startDate.setFullYear(now.getFullYear() - 1);

      const [ordersRes, productsRes, pendingRes, lowStockRes, profilesRes, dealersRes, couponsRes] = await Promise.all([
        supabase.from('orders').select('total').gte('created_at', startDate.toISOString()),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'pending'),
        supabase.from('products').select('id', { count: 'exact', head: true }).lt('stock_qty', 5),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('dealer_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('coupons').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      const periodOrders = ordersRes.data || [];
      const revenue = periodOrders.reduce((s, o) => s + Number(o.total), 0);
      
      setStats({
        revenue,
        orders: periodOrders.length,
        products: productsRes.count || 0,
        pending: pendingRes.count || 0,
        lowStock: lowStockRes.count || 0,
        users: profilesRes.count || 0,
        pendingDealers: dealersRes.count || 0,
        activeCoupons: couponsRes.count || 0,
      });

      // Revenue chart data - fetch only last 100 orders for the chart to be fast
      const { data: chartOrders } = await supabase.from('orders')
        .select('total, created_at')
        .order('created_at', { ascending: false })
        .limit(period === 'week' ? 50 : (period === 'month' ? 200 : 500));

      const chartData: Record<string, number> = {};
      (chartOrders || []).reverse().forEach(o => {
        const d = new Date(o.created_at);
        const key = `${d.getDate()}/${d.getMonth() + 1}`;
        chartData[key] = (chartData[key] || 0) + Number(o.total);
      });
      setRevenueData(Object.entries(chartData).map(([date, amt]) => ({ date, revenue: amt })));

      const { data: recent } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
      setRecentOrders(recent || []);
    };
    fetchStats();
  }, [period]);

  const statCards = [
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', link: '/admin/reports' },
    { label: 'Total Orders', value: String(stats.orders), icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10', link: '/admin/orders' },
    { label: 'Products', value: String(stats.products), icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/products' },
    { label: 'Low Stock', value: String(stats.lowStock), icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/products' },
  ];

  return (
    <AdminLayout activeTab="dashboard">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight text-neon-cyan">Dashboard Overview</h1>
          <p className="text-white/60 text-sm mt-1 font-medium">Real-time performance metrics for Sri Raj Computers.</p>
        </div>
        <div className="flex gap-2 glass-panel p-1 rounded-2xl shadow-lg border border-white/10">
          {(['week', 'month', 'year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border border-transparent ${
                period === p 
                  ? 'bg-blue-gradient text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border-[#3B82F6]/30' 
                  : 'text-white/50 hover:bg-white/5 backdrop-blur-md hover:text-white'
              }`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid — 2 cols mobile, 2 cols tablet, 4 cols desktop */}
      <div className="stats-grid mb-8">
        {statCards.map(stat => (
          <button key={stat.label} onClick={() => navigate(stat.link)}
            className="group glass-panel rounded-3xl p-6 shadow-lg border border-white/10 text-left hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-[#3B82F6]/30 transition-all duration-300 active:scale-95">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md text-[#3B82F6] border border-white/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-blue`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 glass-panel rounded-3xl shadow-lg border border-white/10 p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 backdrop-blur-md text-[#3B82F6] border border-white/10 rounded-xl flex items-center justify-center shadow-blue">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-white">Revenue Growth</h2>
            </div>
          </div>
          <div className="mt-4" style={{ height: 'clamp(180px, 30vw, 320px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', color: 'white', boxShadow: '0 10px 30px rgba(59,130,246,0.2)', fontWeight: 'bold' }} 
                  formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} 
                />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={4} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#0F172A' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Launch */}
        <div className="glass-panel rounded-3xl p-6 text-white shadow-lg border border-white/10 overflow-hidden relative">
          <div className="relative z-10 h-full flex flex-col">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#3B82F6]" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3 flex-1">
              <button onClick={() => navigate('/admin/products?action=add')} className="bg-white/5 backdrop-blur-md hover:bg-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group backdrop-blur-md border border-white/10 hover:border-[#3B82F6]/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Plus className="w-5 h-5 text-[#3B82F6] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Add Product</span>
              </button>
              <button onClick={() => navigate('/admin/categories?action=add')} className="bg-white/5 backdrop-blur-md hover:bg-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group backdrop-blur-md border border-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <FolderOpen className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Add Category</span>
              </button>
              <button onClick={() => navigate('/admin/banners?action=add')} className="bg-white/5 backdrop-blur-md hover:bg-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group backdrop-blur-md border border-white/10 hover:border-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <Image className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Add Banner</span>
              </button>
              <button onClick={() => navigate('/admin/coupons?action=add')} className="bg-white/5 backdrop-blur-md hover:bg-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group backdrop-blur-md border border-white/10 hover:border-orange-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Ticket className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Add Coupon</span>
              </button>
            </div>
            <div className="mt-6 p-4 bg-blue-gradient rounded-2xl flex items-center justify-between group cursor-pointer hover:shadow-blue transition-all border border-[#3B82F6]/30" onClick={() => navigate('/admin/orders')}>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/90">Pending Orders</p>
                <p className="text-2xl font-black mt-1">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center group-hover:translate-x-1 transition-transform border border-white/30 shadow-lg">
                →
              </div>
            </div>
          </div>
          {/* Abstract decoration */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#3B82F6]/10 rounded-full blur-3xl shadow-2xl" />
        </div>
      </div>

      {/* Recent orders table style */}
      <div className="glass-panel rounded-3xl shadow-lg border border-white/10 overflow-hidden mb-8">
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 backdrop-blur-md text-[#10B981] rounded-xl flex items-center justify-center shadow-orange border border-white/10">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-white">Recent Orders</h2>
          </div>
          <button onClick={() => navigate('/admin/orders')} className="text-xs text-[#3B82F6] font-bold hover:text-white py-2 px-4 bg-white/5 backdrop-blur-md rounded-xl transition-colors border border-transparent hover:border-white/10">
            View All Orders
          </button>
        </div>
        <div className="table-scroll-wrapper overflow-x-auto hide-scrollbar">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="bg-white/5 backdrop-blur-md text-white/50 text-[10px] font-black uppercase tracking-widest border-b border-white/10">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4 text-center">Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-white/5 backdrop-blur-md transition-colors cursor-pointer group" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                  <td className="px-6 py-4 font-bold text-white text-sm">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-center text-white/60 text-xs font-semibold">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${statusColors[order.order_status] || 'bg-white/10 backdrop-blur-md text-white/50 border-white/10'}`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-white text-sm group-hover:text-[#3B82F6] transition-colors">₹{Number(order.total).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-white/40 text-sm font-medium">No orders found yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
