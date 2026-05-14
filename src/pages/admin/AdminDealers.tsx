import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Store, Check, X as XIcon, Briefcase, MapPin, Globe, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface DealerApplication {
  id: string;
  user_id?: string;
  business_name: string;
  city?: string;
  email: string;
  gstin?: string;
  status: string;
  discount_percent?: number;
}

interface CategoryDiscount {
  category_id: string;
  discount_percent: number;
}

const AdminDealers = () => {
  const [dealers, setDealers] = useState<DealerApplication[]>([]);
  const [tab, setTab] = useState('pending');
  const [approveModal, setApproveModal] = useState<DealerApplication | null>(null);
  const [discount, setDiscount] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryDiscounts, setCategoryDiscounts] = useState<Record<string, string>>({});

  const fetchDealers = useCallback(async () => {
    setLoading(true);
    if (tab === 'category_discounts') {
      const { data: cats } = await supabase.from('categories').select('*');
      setCategories(cats || []);
      const { data: discs } = await supabase.from('b2b_category_discounts').select('*');
      const discMap: Record<string, string> = {};
      (discs || []).forEach((d) => {
        discMap[d.category_id] = d.discount_percent.toString();
      });
      setCategoryDiscounts(discMap);
    } else {
      const { data } = await supabase.from('dealer_applications').select('*').eq('status', tab).order('created_at', { ascending: false });
      setDealers(data || []);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchDealers(); }, [fetchDealers]);

  const saveCategoryDiscount = async (category: any, percentStr: string) => {
    const percent = Number(percentStr) || 0;
    const { error } = await supabase.from('b2b_category_discounts').upsert({
      category_id: category.id,
      category_name: category.name,
      discount_percent: percent
    }, { onConflict: 'category_id' });

    if (error) {
      toast.error(`Failed to save discount: ${error.message}`);
      console.error('B2B discount upsert error:', error);
    } else {
      setCategoryDiscounts(prev => ({ ...prev, [category.id]: percent.toString() }));
      toast.success('Category discount saved!');
    }
  };

  const handleApprove = async () => {
    if (!approveModal) return;
    const toastId = toast.loading('Upgrading account to B2B...');
    const { error } = await supabase.from('dealer_applications').update({ status: 'approved', discount_percent: Number(discount) || 0 }).eq('id', approveModal.id);
    if (error) { toast.error(error.message, { id: toastId }); return; }
    
    // Also update the profile is_dealer status if possible (assuming there's a user_id)
    if (approveModal.user_id) {
       await supabase.from('profiles').update({ is_dealer: true } as any).eq('user_id', approveModal.user_id);
    }
    
    toast.success('B2B Partner Approved!', { id: toastId });
    setApproveModal(null);
    fetchDealers();
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from('dealer_applications').update({ status: 'rejected' }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Application rejected');
    fetchDealers();
  };

  return (
    <AdminLayout activeTab="dealers">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Dealer Network</h1>
          <p className="text-white/50 text-sm mt-1 font-medium">B2B and agency partnership management.</p>
        </div>
        <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
          {[
            ['pending', 'Review'], 
            ['approved', 'Partners'], 
            ['rejected', 'Declined'],
            ['category_discounts', 'Category Discounts']
          ].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                tab === k ? 'glass-panel text-white shadow-lg' : 'text-white/40 hover:text-white/60'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="glass-panel rounded-[40px] h-48 animate-pulse border border-white/10" />)}
        </div>
      ) : tab === 'category_discounts' ? (
        <div className="glass-panel rounded-[40px] shadow-lg border border-white/10 p-8">
          <h2 className="text-xl font-black text-white mb-6">B2B Category Discounts</h2>
          <div className="space-y-4">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="font-bold text-white">{c.name}</div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-white/50">Discount %</span>
                  <input type="number" 
                    value={categoryDiscounts[c.id] || ''} 
                    onChange={e => setCategoryDiscounts({...categoryDiscounts, [c.id]: e.target.value})}
                    placeholder="0"
                    className="w-20 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#3B82F6] text-white" />
                  <button onClick={() => saveCategoryDiscount(c, categoryDiscounts[c.id])}
                    className="bg-[#3B82F6] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#2563EB] transition-colors">
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : dealers.length === 0 ? (
        <div className="glass-panel rounded-[40px] p-24 text-center border-2 border-dashed border-white/10">
          <Store className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 font-bold">No {tab} applications found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dealers.map(d => (
            <div key={d.id} className="glass-panel group rounded-[40px] shadow-lg border border-white/10 p-8 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
               <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-gradient text-white rounded-2xl flex items-center justify-center shadow-xl">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight line-clamp-1">{d.business_name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{d.city || 'Remote Partner'}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-xs font-bold text-white/50">
                  <Globe className="w-4 h-4 text-white/20" /> {d.email}
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-white/50">
                   <CreditCard className="w-4 h-4 text-white/20" /> GSTIN: <span className="text-white">{d.gstin || 'NON-GST'}</span>
                </div>
              </div>

              {tab === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => { setApproveModal(d); setDiscount(''); }} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                    Approve
                  </button>
                  <button onClick={() => handleReject(d.id)} className="flex-1 glass-panel border border-white/20 text-white/40 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all">
                    Decline
                  </button>
                </div>
              )}
              
              {tab === 'approved' && (
                <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                   <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4" /> Verified Partner
                   </div>
                   <span className="text-emerald-500 font-black text-sm">-{d.discount_percent}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {approveModal && (
        <div className="fixed inset-0 bg-blue-gradient/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-panel rounded-[40px] w-full max-w-sm p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-white mb-2">Accept Partner</h2>
            <p className="text-white/50 text-sm mb-8">Establish a discount percentage for <span className="font-bold text-white">{approveModal.business_name}</span>.</p>
            
            <div className="mb-8">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Partner Discount (%)</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="e.g. 15"
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-lg outline-none focus:glass-panel focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 font-black transition-all" />
            </div>

            <div className="flex flex-col gap-3">
               <button onClick={handleApprove} className="w-full bg-blue-gradient text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Activate License</button>
               <button onClick={() => setApproveModal(null)} className="w-full bg-white/10 backdrop-blur-md text-white/60 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Back</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDealers;
