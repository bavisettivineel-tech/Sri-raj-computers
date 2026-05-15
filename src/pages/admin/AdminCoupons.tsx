import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Plus, Ticket, X, Calendar, Settings2, RefreshCw, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order?: number;
  max_uses?: number;
  used_count: number;
  expiry_date?: string;
  is_active: boolean;
}

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '', discount_type: 'percent', discount_value: '', min_order: '', max_uses: '', expiry_date: '', is_active: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (filter === 'active') query = query.eq('is_active', true);
    if (filter === 'expired') query = query.lt('expiry_date', new Date().toISOString());
    if (filter === 'disabled') query = query.eq('is_active', false);
    const { data } = await query;
    setCoupons(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm({ ...form, code });
  };

  const openForm = (coupon?: Coupon) => {
    if (coupon) {
      setEditing(coupon);
      setForm({
        code: coupon.code, discount_type: coupon.discount_type, discount_value: String(coupon.discount_value),
        min_order: coupon.min_order ? String(coupon.min_order) : '', max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
        expiry_date: coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '', is_active: coupon.is_active !== false,
      });
    } else {
      setEditing(null);
      setForm({ code: '', discount_type: 'percent', discount_value: '', min_order: '', max_uses: '', expiry_date: '', is_active: true });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discount_value) { toast.error('Essential parameters missing'); return; }
    const payload = {
      code: form.code.toUpperCase(), discount_type: form.discount_type, discount_value: Number(form.discount_value),
      min_order: form.min_order ? Number(form.min_order) : 0, max_uses: form.max_uses ? Number(form.max_uses) : null,
      expiry_date: form.expiry_date || null, is_active: form.is_active,
    };
    if (editing) {
      const { error } = await supabase.from('coupons').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Promotional parameters updated');
    } else {
      const { error } = await supabase.from('coupons').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('Campaign asset generated');
    }
    setShowForm(false);
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Asset liquidated');
    setDeleteConfirm(null);
    fetchCoupons();
  };

  if (showForm) {
    return (
      <AdminLayout activeTab="coupons">
        <div className="max-w-xl mx-auto pb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">{editing ? 'Edit Campaign' : 'New Campaign'}</h1>
                <p className="text-slate-500 text-sm font-medium">Configure discount structures and limits.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200 space-y-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Coupon Code</label>
              <div className="flex gap-2">
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                  placeholder="E.G. SAVE50"
                  className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-black tracking-widest uppercase transition-all" />
                <button onClick={generateCode} className="px-6 bg-primary text-white rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Discount Type</label>
                <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary">
                  <option value="percent">Percentage Off (%)</option>
                  <option value="flat">Flat Deduction (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Value</label>
                <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Min Order (₹)</label>
                <input type="number" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Usage Limit</label>
                <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Expiry Date</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none focus:border-primary" />
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Campaign Status</span>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
               </div>
            </div>

            <div className="flex gap-3 pt-4">
               <button onClick={handleSave} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95">Save Campaign</button>
               <button onClick={() => setShowForm(false)} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="coupons">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-heading">Coupon Console</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Engineer and monitor promotional discount assets.</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="w-5 h-5" /> New Campaign
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-8 hide-scrollbar">
        {[
          ['all', 'All Coupons'], 
          ['active', 'Active'], 
          ['expired', 'Expired'], 
          ['disabled', 'Disabled']
        ].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === k ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-[40px] h-48 animate-pulse border border-slate-200" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200">
          <Ticket className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">No promotional assets found</p>
          <button onClick={() => openForm()} className="mt-8 text-primary font-black text-xs uppercase tracking-widest hover:underline">Create your first coupon</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coupons.map(c => (
            <div key={c.id} className="group bg-white rounded-[40px] shadow-sm border border-slate-200 p-8 flex flex-col justify-between hover:shadow-xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                  <div className={`w-3 h-3 rounded-full ${c.is_active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-200'}`} />
               </div>
               
               <div>
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 shadow-sm">
                       <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-black text-slate-900 text-lg tracking-widest group-hover:text-primary transition-colors uppercase font-heading">{c.code}</h3>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          {c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                       </p>
                    </div>
                 </div>

                 <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usage Progress</span>
                       <span className="text-xs font-black text-slate-900">{c.used_count || 0} / {c.max_uses || '∞'}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                       <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(124,58,237,0.3)]" style={{ width: `${c.max_uses ? Math.min((c.used_count / c.max_uses) * 100, 100) : 0}%` }} />
                    </div>
                    {c.expiry_date && (
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest pt-2">
                          <Calendar className="w-4 h-4 text-slate-300" /> Valid thru {new Date(c.expiry_date).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })}
                       </div>
                    )}
                 </div>
               </div>

               <div className="flex gap-3">
                 <button onClick={() => openForm(c)} className="flex-1 bg-slate-50 border border-slate-100 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 shadow-sm">
                    <Settings2 className="w-4 h-4" /> Parameters
                 </button>
                 <button onClick={() => setDeleteConfirm(c.id)} className="w-14 h-14 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                    <Trash2 className="w-4 h-4" />
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl border border-slate-100 animate-slide-in-up text-center">
             <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-[30px] flex items-center justify-center text-red-500 mb-8 mx-auto shadow-sm">
                <Trash2 className="w-10 h-10" />
              </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight font-heading">Delete Coupon?</h2>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium text-center">Removing <span className="text-slate-900 font-bold">"{coupons.find(c => c.id === deleteConfirm)?.code}"</span> will immediately invalidate the code for all users.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all">Confirm Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCoupons;
