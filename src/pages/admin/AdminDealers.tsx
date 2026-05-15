import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Store, Check, X as XIcon, Briefcase, MapPin, Globe, CreditCard, ShieldCheck, User, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface DealerApplication {
  id: string;
  user_id?: string;
  business_name: string;
  contact_person?: string;
  phone?: string;
  address?: string;
  state?: string;
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
  const [quantityDiscounts, setQuantityDiscounts] = useState<any[]>([]);
  const [newQty, setNewQty] = useState('');
  const [newDisc, setNewDisc] = useState('');

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
    } else if (tab === 'quantity_discounts') {
      const { data } = await supabase.from('b2b_quantity_discounts').select('*').order('min_quantity', { ascending: true });
      setQuantityDiscounts(data || []);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-heading">Dealer Network</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">B2B and agency partnership management.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
          {[
            ['pending', 'Review'], 
            ['approved', 'Partners'], 
            ['rejected', 'Declined'],
            ['category_discounts', 'Category Disc'],
            ['quantity_discounts', 'Quantity Disc']
          ].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                tab === k ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-[40px] h-48 animate-pulse border border-slate-200" />)}
        </div>
      ) : tab === 'category_discounts' ? (
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-10 max-w-4xl mx-auto">
          <h2 className="text-xl font-black text-slate-900 mb-8 font-heading text-center">B2B Category Discounts</h2>
          <div className="space-y-4">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all group">
                <div className="font-bold text-slate-700 font-heading">{c.name}</div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Discount %</span>
                  <div className="relative">
                    <input type="number" 
                      value={categoryDiscounts[c.id] || ''} 
                      onChange={e => setCategoryDiscounts({...categoryDiscounts, [c.id]: e.target.value})}
                      placeholder="0"
                      className="w-24 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary text-slate-900 font-bold" />
                  </div>
                  <button onClick={() => saveCategoryDiscount(c, categoryDiscounts[c.id])}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'quantity_discounts' ? (
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-10 max-w-4xl mx-auto">
          <h2 className="text-xl font-black text-slate-900 mb-8 font-heading text-center">B2B Quantity-Based Discounts</h2>
          
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-10">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Add New Rule</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Min Quantity</label>
                <input type="number" value={newQty} onChange={e => setNewQty(e.target.value)} placeholder="e.g. 5"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary font-bold" />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Discount %</label>
                <input type="number" value={newDisc} onChange={e => setNewDisc(e.target.value)} placeholder="e.g. 10"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary font-bold" />
              </div>
              <button onClick={async () => {
                if (!newQty || !newDisc) return toast.error('Fill all fields');
                const { error } = await supabase.from('b2b_quantity_discounts').upsert({ 
                  min_quantity: parseInt(newQty), 
                  discount_percent: parseFloat(newDisc) 
                }, { onConflict: 'min_quantity' });
                if (error) toast.error(error.message);
                else {
                  toast.success('Discount rule saved!');
                  setNewQty(''); setNewDisc('');
                  fetchDealers();
                }
              }} className="bg-primary text-white h-[46px] px-8 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">
                Add Rule
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {quantityDiscounts.length === 0 ? (
              <p className="text-center text-slate-400 font-bold py-10">No rules defined yet.</p>
            ) : quantityDiscounts.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 hover:border-primary/20 transition-all shadow-sm">
                <div>
                  <div className="text-sm font-black text-slate-900 font-heading">Buy {rule.min_quantity}+ Products</div>
                  <div className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">{rule.discount_percent}% Discount Applied</div>
                </div>
                <button onClick={async () => {
                  const { error } = await supabase.from('b2b_quantity_discounts').delete().eq('id', rule.id);
                  if (error) toast.error(error.message);
                  else {
                    toast.success('Rule deleted');
                    fetchDealers();
                  }
                }} className="text-red-500 hover:bg-red-50 p-3 rounded-xl transition-colors">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-10 text-center font-bold uppercase tracking-tighter">
            Note: Multi-tier discounts are applied per product based on its quantity in cart.
          </p>
        </div>
      ) : dealers.length === 0 ? (
        <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200">
          <Store className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">No {tab} applications found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dealers.map(d => (
            <div key={d.id} className="bg-white group rounded-[40px] shadow-sm border border-slate-200 p-8 hover:shadow-xl transition-all duration-500 relative overflow-hidden">
               <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-primary rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg tracking-tight line-clamp-1 font-heading">{d.business_name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.city || 'Remote Partner'}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <Globe className="w-4 h-4 text-slate-300" /> {d.email}
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <Phone className="w-4 h-4 text-slate-300" /> {d.phone || 'No Phone'}
                </div>
                {d.contact_person && (
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <User className="w-4 h-4 text-slate-300" /> {d.contact_person}
                  </div>
                )}
                {d.address && (
                  <div className="flex items-start gap-3 text-xs font-bold text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-300 mt-0.5" /> 
                    <div className="flex-1">
                      {d.address}
                      {d.state && <span className="block text-slate-400 mt-0.5">{d.state}</span>}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                   <CreditCard className="w-4 h-4 text-slate-300" /> Ref Code: <span className="text-slate-900 uppercase">{d.gstin || 'None'}</span>
                </div>
              </div>

              {tab === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button onClick={() => { setApproveModal(d); setDiscount(''); }} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                    Approve
                  </button>
                  <button onClick={() => handleReject(d.id)} className="flex-1 bg-slate-50 text-slate-400 border border-slate-100 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">
                    Decline
                  </button>
                </div>
              )}
              
              {tab === 'approved' && (
                <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4" /> Verified Partner
                   </div>
                   <span className="text-emerald-600 font-black text-sm">-{d.discount_percent}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {approveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl border border-slate-100 animate-slide-in-up">
             <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-[30px] flex items-center justify-center text-emerald-500 mb-8 mx-auto shadow-sm">
                <ShieldCheck className="w-10 h-10" />
              </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight text-center font-heading">Accept Partner</h2>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed text-center font-medium">Establish a discount percentage for <span className="font-bold text-slate-900">{approveModal.business_name}</span>.</p>
            
            <div className="mb-10">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-center">Partner Discount (%)</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="e.g. 15"
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 text-2xl text-center outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-black transition-all" />
            </div>

            <div className="flex flex-col gap-3">
               <button onClick={handleApprove} className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">Activate Partner</button>
               <button onClick={() => setApproveModal(null)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDealers;
