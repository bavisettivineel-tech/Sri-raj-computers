import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Plus, Tag, X, Upload, Bookmark, Award } from 'lucide-react';
import { toast } from 'sonner';

interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  is_active: boolean;
}

const AdminBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', logo_url: '', is_active: true });
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    setLoading(true);
    const { data } = await supabase.from('brands').select('*').order('name');
    setBrands(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBrands(); }, []);

  const openForm = (brand?: Brand) => {
    if (brand) {
      setEditing(brand);
      setForm({ name: brand.name, logo_url: brand.logo_url || '', is_active: brand.is_active !== false });
    } else {
      setEditing(null);
      setForm({ name: '', logo_url: '', is_active: true });
    }
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const toastId = toast.loading('Uploading brand mark...');
    const path = `brands/${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) { toast.error(error.message, { id: toastId }); return; }
    
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    setForm({ ...form, logo_url: data.publicUrl });
    toast.success('Mark uploaded!', { id: toastId });
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Brand name is required'); return; }
    const payload = { name: form.name, logo_url: form.logo_url || null, is_active: form.is_active };
    if (editing) {
      const { error } = await supabase.from('brands').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Brand redefined successfully');
    } else {
      const { error } = await supabase.from('brands').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('New brand registered');
    }
    setShowForm(false);
    fetchBrands();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Brand record erased');
    setDeleteConfirm(null);
    fetchBrands();
  };

  if (showForm) {
    return (
      <AdminLayout activeTab="brands">
        <div className="max-w-2xl mx-auto pb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 backdrop-blur-md rounded-xl transition-colors text-white/40">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">{editing ? 'Modify Affiliate' : 'Define Brand'}</h1>
                <p className="text-white/50 text-sm font-medium">Register and organize product vendors.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[40px] p-10 shadow-lg border border-white/10 space-y-8">
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Brand Identity Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:glass-panel focus:ring-4 focus:ring-blue-500/5 focus:border-[#3B82F6] font-bold transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 block">Official Insignia</label>
              <div className="flex items-center gap-8">
                 {form.logo_url ? (
                   <div className="relative group">
                     <img src={form.logo_url} alt="" className="w-32 h-32 object-contain rounded-3xl border-2 border-white/10 bg-white/5 backdrop-blur-md p-4" />
                     <button onClick={() => setForm({...form, logo_url: ''})} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all">×</button>
                   </div>
                 ) : (
                   <label className="w-32 h-32 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 backdrop-blur-md transition-all group">
                     <Upload className="w-6 h-6 text-white/20 group-hover:text-blue-500 transition-colors" />
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                   </label>
                 )}
                 <div className="text-xs text-white/40 font-medium leading-relaxed max-w-[200px]">
                   A clear PNG or SVG logo works best for brand representation.
                 </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-2xl">
               <span className="text-xs font-black text-white uppercase tracking-widest">Partnership Status</span>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/20 backdrop-blur-md rounded-full peer peer-checked:bg-blue-gradient after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:glass-panel after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
               <button onClick={handleSave} className="flex-[2] bg-blue-gradient text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">Verify & Save</button>
               <button onClick={() => setShowForm(false)} className="flex-1 bg-white/10 backdrop-blur-md text-white/60 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Back</button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="brands">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Product Marks</h1>
          <p className="text-white/50 text-sm mt-1 font-medium">Manage your verified vendor partners.</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center gap-2 bg-blue-gradient text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 transition-all">
          <Plus className="w-5 h-5" /> New Brand
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="glass-panel rounded-[32px] h-32 animate-pulse border border-white/10" />)}
        </div>
      ) : brands.length === 0 ? (
        <div className="glass-panel rounded-[40px] p-24 text-center border-2 border-dashed border-white/10">
          <Award className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 font-bold">No registered brands found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map(brand => (
            <div key={brand.id} className="group glass-panel rounded-[40px] shadow-lg border border-white/10 p-8 flex flex-col items-center hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500">
              <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-3xl mb-6 flex items-center justify-center p-4 relative overflow-hidden">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="text-white/20 group-hover:text-blue-400 transition-colors">
                    <Bookmark className="w-8 h-8" />
                  </div>
                )}
                {!brand.is_active && <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center font-black text-[8px] uppercase tracking-widest text-white/40">Suspended</div>}
              </div>
              
              <h3 className="font-black text-white text-sm mb-6 text-center line-clamp-1">{brand.name}</h3>
              
              <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button onClick={() => openForm(brand)} className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-gradient hover:text-white transition-all">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteConfirm(brand.id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-blue-gradient/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-panel rounded-[40px] w-full max-w-sm p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Erasing Mark?</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">This will remove the brand <span className="text-white font-bold">"{brands.find(b => b.id === deleteConfirm)?.name}"</span> from your registry of partners.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Confirm Erase</button>
              <button onClick={() => setDeleteConfirm(null)} className="w-full bg-white/10 backdrop-blur-md text-white/60 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Back</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBrands;
