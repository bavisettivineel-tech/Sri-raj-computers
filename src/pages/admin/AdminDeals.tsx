import React, { useEffect, useState } from 'react';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-heading">Campaign Center</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Control high-impact store visibility and time-limited offers.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
           {(
             [
               ['hot', 'Limited Offers', Flame],
               ['featured', 'Featured Items', Star]
             ] as [string, string, React.ElementType][]
           ).map(([k, l, Icon]) => (
             <button key={k} onClick={() => setTab(k)}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                 tab === k ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'
               }`}>
               <Icon className={`w-4 h-4 ${tab === k ? 'text-white' : 'text-slate-300'}`} /> {l}
             </button>
           ))}
        </div>
      </div>

      {tab === 'hot' && (
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="bg-primary rounded-[40px] p-10 shadow-xl shadow-primary/20 flex flex-col md:flex-row items-center gap-8 border border-primary/10">
             <div className="w-20 h-20 bg-white/10 rounded-[30px] flex items-center justify-center text-white backdrop-blur-sm shadow-sm border border-white/10">
                <Clock className="w-10 h-10" />
             </div>
             <div className="flex-1 text-center md:text-left">
                <h3 className="text-white text-2xl font-black tracking-tight font-heading">Set Universal Expiry Window</h3>
                <p className="text-white/60 text-xs font-medium mt-1 uppercase tracking-widest">Controls termination for all upcoming campaigns</p>
             </div>
             <div className="w-full md:w-auto">
                <input type="datetime-local" value={dealEndTime} onChange={e => setDealEndTime(e.target.value)}
                  className="w-full md:w-72 bg-white border border-white/20 rounded-2xl px-6 py-4 text-sm text-slate-900 font-bold outline-none focus:ring-4 focus:ring-white/20 transition-all shadow-sm" />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {deals.map(deal => (
              <div key={deal.id} className="group bg-white rounded-[40px] shadow-sm border border-slate-200 p-8 flex flex-col hover:shadow-xl hover:border-primary/20 transition-all duration-500">
                <div className="aspect-square bg-slate-50 rounded-[32px] p-8 relative mb-8 border border-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={deal.products?.images?.[0] || '/placeholder.svg'} alt="" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-red-600 text-white p-2.5 rounded-xl shadow-lg animate-pulse">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                </div>
                
                <h4 className="font-black text-slate-900 text-lg mb-2 line-clamp-1 font-heading">{deal.products?.name}</h4>
                <div className="flex items-center gap-3 mb-8">
                   <div className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">Active Offer</div>
                   <div className="text-[10px] font-bold text-slate-400">Ends {new Date(deal.deal_end_time).toLocaleDateString()}</div>
                </div>

                <button onClick={() => removeDeal(deal.id)} className="w-full bg-slate-50 border border-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2 shadow-sm">
                   <Trash2 className="w-4 h-4" /> Terminate Offer
                </button>
              </div>
            ))}
            
            <button onClick={() => setShowAddDeal(true)} className="aspect-square rounded-[40px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 group hover:border-primary/30 hover:bg-primary/5 transition-all bg-white shadow-sm">
               <div className="w-20 h-20 rounded-[30px] bg-slate-50 border border-slate-100 text-slate-300 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 shadow-sm">
                  <Plus className="w-10 h-10" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-all">Add Offer Product</span>
            </button>
          </div>
        </div>
      )}

      {tab === 'featured' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {featuredProducts.map(p => (
            <div key={p.id} className="group bg-white rounded-[40px] shadow-sm border border-slate-200 p-8 flex flex-col items-center hover:shadow-xl hover:border-primary/20 transition-all duration-500">
               <div className="w-28 h-28 bg-slate-50 rounded-[30px] mb-8 p-4 border border-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={p.images?.[0] || '/placeholder.svg'} alt="" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
               </div>
               <h4 className="font-black text-slate-900 text-sm mb-10 text-center line-clamp-2 font-heading min-h-[40px]">{p.name}</h4>
               <button onClick={() => toggleFeatured(p.id, true)} className="w-full py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                  Retract Selection
               </button>
            </div>
          ))}
          <button onClick={() => { setTab('hot'); setShowAddDeal(true); }} className="rounded-[40px] border-4 border-dashed border-slate-200 h-full flex flex-col items-center justify-center p-12 gap-4 text-slate-300 hover:bg-primary/5 hover:border-primary/30 transition-all bg-white shadow-sm min-h-[300px]">
             <Star className="w-12 h-12" />
             <span className="text-[10px] font-black uppercase tracking-widest text-center">Nominate From Catalog</span>
          </button>
        </div>
      )}

      {showAddDeal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-slide-in-up">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight font-heading">Select Product</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Available from inventory</p>
              </div>
              <button onClick={() => setShowAddDeal(false)} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-200 shadow-sm"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="relative mb-8 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input value={searchProduct} onChange={e => setSearchProduct(e.target.value)} placeholder="Filter catalog list..."
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredAllProducts.map(p => (
                  <button key={p.id} onClick={() => { if(tab === 'featured') toggleFeatured(p.id, false); else addDeal(p.id); }} 
                    className="flex items-center gap-6 p-5 rounded-3xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all text-left group bg-white shadow-sm border-slate-100">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 shadow-sm rounded-2xl p-2 group-hover:scale-110 transition-transform duration-500 overflow-hidden flex items-center justify-center">
                       <img src={p.images?.[0] || '/placeholder.svg'} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1 font-heading">{p.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Catalog Entry • ₹{Number(p.sale_price).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all shadow-sm">
                       <Plus className="w-5 h-5" />
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
