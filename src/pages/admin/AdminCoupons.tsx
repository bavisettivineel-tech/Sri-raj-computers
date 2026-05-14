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
               <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 backdrop-blur-md rounded-xl transition-colors text-white/40">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">{editing ? 'Edit Campaign' : 'Initiate Campaign'}</h1>
                <p className="text-white/50 text-sm font-medium">Configure discount structures and limits.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[40px] p-10 shadow-lg border border-white/10 space-y-8">
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Promotion Access Code</label>
              <div className="flex gap-2">
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                  className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-xl outline-none focus:glass-panel focus:ring-4 focus:ring-blue-500/5 focus:border-[#3B82F6] font-black tracking-widest uppercase transition-all" />
                <button onClick={generateCode} className="px-6 bg-blue-gradient text-white rounded-2xl hover:scale-105 transition-all">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Discount Mechanics</label>
                <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })}
                  className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:glass-panel">
                  <option value="percent">Percentage Off (%)</option>
                  <option value="flat">Flat Deduction (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Value Reduction</label>
                <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })}
                  className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:glass-panel" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Minimum Requirement (₹)</label>
                <input type="number" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })}
                  className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:glass-panel" />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Usage Ceiling</label>
                <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })}
                  className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:glass-panel" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Termination Date</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                  className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none focus:glass-panel" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-2xl">
               <span className="text-xs font-black text-white uppercase tracking-widest">Active Circulation</span>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/20 backdrop-blur-md rounded-full peer peer-checked:bg-blue-gradient after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:glass-panel after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
               </div>
            </div>

            <div className="flex gap-3 pt-4">
               <button onClick={handleSave} className="flex-[2] bg-blue-gradient text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">Commit Asset</button>
               <button onClick={() => setShowForm(false)} className="flex-1 bg-white/10 backdrop-blur-md text-white/60 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="coupons">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Campaign Console</h1>
          <p className="text-white/50 text-sm mt-1 font-medium">Engineer and monitor promotional discount assets.</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center gap-2 bg-blue-gradient text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 transition-all">
          <Plus className="w-5 h-5" /> New Campaign
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-6 hide-scrollbar">
        {[
          ['all', 'All Campaigns'], 
          ['active', 'In Circulation'], 
          ['expired', 'Terminated'], 
          ['disabled', 'Suspended']
        ].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === k ? 'bg-blue-gradient text-white shadow-xl shadow-blue-500/20' : 'glass-panel text-white/40 border border-white/10'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3,4,5,6].map(i => <div key={i} className="glass-panel rounded-[40px] h-48 animate-pulse border border-white/10" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="glass-panel rounded-[40px] p-24 text-center border-2 border-dashed border-white/10">
          <Ticket className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 font-bold">No registered promotional assets</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map(c => (
            <div key={c.id} className="group glass-panel rounded-[40px] shadow-lg border border-white/10 p-8 flex flex-col justify-between hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                  <div className={`w-3 h-3 rounded-full ${c.is_active ? 'bg-emerald-500' : 'bg-white/20 backdrop-blur-md'} shadow-lg shadow-blue`} />
               </div>
               
               <div>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white/5 backdrop-blur-md text-white/30 rounded-2xl flex items-center justify-center group-hover:bg-blue-gradient group-hover:text-white transition-all">
                       <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-black text-white text-lg tracking-widest group-hover:text-blue-400 transition-colors uppercase">{c.code}</h3>
                       <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                          {c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                       </p>
                    </div>
                 </div>

                 <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Circulation Usage</span>
                       <span className="text-xs font-black text-white">{c.used_count || 0} / {c.max_uses || '∞'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 backdrop-blur-md rounded-full overflow-hidden">
                       <div className="h-full bg-blue-gradient rounded-full transition-all duration-1000" style={{ width: `${c.max_uses ? Math.min((c.used_count / c.max_uses) * 100, 100) : 0}%` }} />
                    </div>
                    {c.expiry_date && (
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/40 tracking-widest mt-4">
                          <Calendar className="w-3.5 h-3.5" /> Thru {new Date(c.expiry_date).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })}
                       </div>
                    )}
                 </div>
               </div>

               <div className="flex gap-2">
                 <button onClick={() => openForm(c)} className="flex-1 bg-white/5 backdrop-blur-md text-white/40 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-gradient hover:text-white transition-all flex items-center justify-center gap-2">
                    <Settings2 className="w-4 h-4" /> Parameters
                 </button>
                 <button onClick={() => setDeleteConfirm(c.id)} className="w-12 h-12 bg-white/5 backdrop-blur-md text-white/30 rounded-2xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-blue-gradient/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-panel rounded-[40px] w-full max-w-sm p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Erasing Asset?</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">Liquidating <span className="text-white font-bold">"{coupons.find(c => c.id === deleteConfirm)?.code}"</span> will immediately invalidate the promotion code for all users.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Finalize Liquidate</button>
              <button onClick={() => setDeleteConfirm(null)} className="w-full bg-white/10 backdrop-blur-md text-white/60 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Withdrawal</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCoupons;
