import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus, Trash2, Edit, X, Percent, Flame, Star, Package, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  images?: string[];
  sale_price: number | string;
  mrp?: number | string;
  is_featured?: boolean;
}

interface Deal {
  id: string;
  product_id: string;
  deal_end_time: string;
  products?: Product;
}

const AdminDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState('hot');
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [dealEndTime, setDealEndTime] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [dealsRes, productsRes, featuredRes] = await Promise.all([
      supabase.from('deals').select('*, products(id, name, images, sale_price, mrp)').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, images, sale_price').order('name'),
      supabase.from('products').select('id, name, images, sale_price').eq('is_featured', true),
    ]);
    setDeals(dealsRes.data || []);
    setAllProducts(productsRes.data || []);
    setFeaturedProducts(featuredRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addDeal = async (productId: string) => {
    if (!dealEndTime) { toast.error('Set a valid termination window'); return; }
    const toastId = toast.loading('Synchronizing limited offer...');
    const { error } = await supabase.from('deals').insert({ product_id: productId, deal_end_time: dealEndTime });
    if (error) { toast.error(error.message, { id: toastId }); return; }
    
    toast.success('Offer live on terminal!', { id: toastId });
    setShowAddDeal(false);
    fetchData();
  };

  const removeDeal = async (id: string) => {
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Offer terminated');
    fetchData();
  };

  const toggleFeatured = async (productId: string, current: boolean) => {
    const { error } = await supabase.from('products').update({ is_featured: !current }).eq('id', productId);
    if (error) { toast.error('Status sync error'); return; }
    toast.success(current ? 'Marked as standard' : 'Marked as flagship');
    fetchData();
  };

  const filteredAllProducts = allProducts.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase()));

  return (
    <AdminLayout activeTab="deals">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Campaign Center</h1>
          <p className="text-white/50 text-sm mt-1 font-medium">Control high-impact store visibility and time-limited offers.</p>
        </div>
        <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
           {(
             [
               ['hot', 'Limited Offers', Flame],
               ['featured', 'Flagship Curations', Star]
             ] as [string, string, React.ElementType][]
           ).map(([k, l, Icon]) => (
             <button key={k} onClick={() => setTab(k)}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 tab === k ? 'glass-panel text-white shadow-lg' : 'text-white/40 hover:text-white/60'
               }`}>
               <Icon className={`w-4 h-4 ${tab === k ? 'text-blue-400' : 'text-white/30'}`} /> {l}
             </button>
           ))}
        </div>
      </div>

      {tab === 'hot' && (
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-blue-gradient rounded-[32px] p-8 shadow-2xl flex flex-col md:flex-row items-center gap-8 border border-white/5">
             <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[28px] flex items-center justify-center text-blue-400">
                <Clock className="w-8 h-8" />
             </div>
             <div className="flex-1 text-center md:text-left">
                <h3 className="text-white text-xl font-black tracking-tight">Set Universal Offer Window</h3>
                <p className="text-white/40 text-xs font-medium mt-1 uppercase tracking-widest">Controls termination for all upcoming campaigns</p>
             </div>
             <div className="w-full md:w-auto">
                <input type="datetime-local" value={dealEndTime} onChange={e => setDealEndTime(e.target.value)}
                  className="w-full md:w-64 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-sm text-white font-bold outline-none focus:bg-white/10 backdrop-blur-md focus:border-[#3B82F6] transition-all" />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map(deal => (
              <div key={deal.id} className="group glass-panel rounded-[40px] shadow-lg border border-white/10 p-8 flex flex-col hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500">
                <div className="aspect-square bg-white/5 backdrop-blur-md rounded-[32px] p-8 relative mb-6">
                  <img src={deal.products?.images?.[0] || '/placeholder.svg'} alt="" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                  <div className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-xl shadow-lg">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                </div>
                
                <h4 className="font-black text-white text-base mb-1 line-clamp-1">{deal.products?.name}</h4>
                <div className="flex items-center gap-2 mb-6">
                   <div className="text-[10px] font-black uppercase text-blue-400 tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">Active Offer</div>
                   <div className="text-[10px] font-bold text-white/40">Ends {new Date(deal.deal_end_time).toLocaleDateString()}</div>
                </div>

                <button onClick={() => removeDeal(deal.id)} className="w-full bg-white/5 backdrop-blur-md text-white/40 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center gap-2">
                   <Trash2 className="w-4 h-4" /> Terminate Offer
                </button>
              </div>
            ))}
            
            <button onClick={() => setShowAddDeal(true)} className="aspect-square rounded-[40px] border-4 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 group hover:border-blue-500/30 hover:bg-blue-500/10/10 transition-all">
               <div className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-md text-white/30 flex items-center justify-center group-hover:bg-blue-gradient group-hover:text-white transition-all shadow-lg">
                  <Plus className="w-8 h-8" />
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-white/30 group-hover:text-blue-400 transition-all">Attach New Asset</span>
            </button>
          </div>
        </div>
      )}

      {tab === 'featured' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map(p => (
            <div key={p.id} className="group glass-panel rounded-[40px] shadow-lg border border-white/10 p-8 flex flex-col items-center hover:shadow-2xl transition-all duration-500">
               <div className="w-24 h-24 bg-white/5 backdrop-blur-md rounded-3xl mb-6 p-4">
                  <img src={p.images?.[0] || '/placeholder.svg'} alt="" className="w-full h-full object-contain mix-blend-multiply" />
               </div>
               <h4 className="font-black text-white text-xs mb-8 text-center line-clamp-2">{p.name}</h4>
               <button onClick={() => toggleFeatured(p.id, true)} className="w-full py-3 rounded-2xl glass-panel border border-white/20 text-white/40 text-[9px] font-black uppercase tracking-widest hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 transition-all">
                  Retract Selection
               </button>
            </div>
          ))}
          <button onClick={() => { setTab('hot'); setShowAddDeal(true); }} className="rounded-[40px] border-2 border-dashed border-white/10 h-full flex flex-col items-center justify-center p-8 gap-3 text-white/30 hover:bg-white/5 backdrop-blur-md transition-all">
             <Star className="w-8 h-8" />
             <span className="text-[10px] font-black uppercase tracking-widest">Nominate From Catalog</span>
          </button>
        </div>
      )}

      {showAddDeal && (
        <div className="fixed inset-0 bg-blue-gradient/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-panel rounded-[40px] w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Select Asset</h3>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Available from inventory</p>
              </div>
              <button onClick={() => setShowAddDeal(false)} className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center text-white/40 hover:text-white transition-all"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="relative mb-8 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-500 transition-colors" />
                <input value={searchProduct} onChange={e => setSearchProduct(e.target.value)} placeholder="Filter catalog list..."
                  className="w-full pl-12 pr-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-sm font-bold outline-none focus:glass-panel focus:ring-4 focus:ring-blue-500/5 transition-all" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredAllProducts.map(p => (
                  <button key={p.id} onClick={() => { if(tab === 'featured') toggleFeatured(p.id, false); else addDeal(p.id); }} 
                    className="flex items-center gap-6 p-4 rounded-3xl hover:bg-blue-500/10/50 border border-transparent hover:border-blue-500/30 transition-all text-left group">
                    <div className="w-14 h-14 glass-panel shadow-lg rounded-2xl p-2 group-hover:scale-110 transition-transform">
                       <img src={p.images?.[0] || '/placeholder.svg'} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors line-clamp-1">{p.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Catalog Entry • ₹{Number(p.sale_price).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center text-white/20 group-hover:bg-blue-gradient group-hover:border-blue-600 group-hover:text-white transition-all">
                       <Plus className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDeals;
