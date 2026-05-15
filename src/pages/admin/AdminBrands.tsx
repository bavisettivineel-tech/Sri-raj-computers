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
               <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">{editing ? 'Edit Brand' : 'Add New Brand'}</h1>
                <p className="text-slate-500 text-sm font-medium">Register and organize product vendors.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200 space-y-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Brand Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Dell, HP, Apple"
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Brand Logo</label>
              <div className="flex items-center gap-8">
                 {form.logo_url ? (
                   <div className="relative group">
                     <img src={form.logo_url} alt="" className="w-32 h-32 object-contain rounded-3xl border border-slate-100 bg-slate-50 p-4" />
                     <button onClick={() => setForm({...form, logo_url: ''})} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg">×</button>
                   </div>
                 ) : (
                   <label className="w-32 h-32 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all group">
                     <Upload className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                   </label>
                 )}
                 <div className="text-xs text-slate-400 font-medium leading-relaxed max-w-[200px]">
                   A clear PNG or SVG logo works best. Recommended size: 400x400px.
                 </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Status</span>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
               <button onClick={handleSave} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95">Save Brand</button>
               <button onClick={() => setShowForm(false)} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="brands">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-heading">Product Brands</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage your verified vendor partners.</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="w-5 h-5" /> Add New Brand
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="bg-white rounded-[32px] h-32 animate-pulse border border-slate-200" />)}
        </div>
      ) : brands.length === 0 ? (
        <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200">
          <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">No registered brands found</p>
          <button onClick={() => openForm()} className="mt-8 text-primary font-black text-xs uppercase tracking-widest hover:underline">Register your first brand</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map(brand => (
            <div key={brand.id} className="group bg-white rounded-[40px] shadow-sm border border-slate-200 p-8 flex flex-col items-center hover:shadow-xl hover:border-primary/20 transition-all duration-500">
              <div className="w-24 h-24 bg-slate-50 rounded-3xl mb-6 flex items-center justify-center p-4 relative overflow-hidden border border-slate-100">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="text-slate-200 group-hover:text-primary transition-colors">
                    <Bookmark className="w-10 h-10" />
                  </div>
                )}
                {!brand.is_active && <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-md flex items-center justify-center font-black text-[8px] uppercase tracking-widest text-slate-400">Inactive</div>}
              </div>
              
              <h3 className="font-black text-slate-900 text-sm mb-6 text-center line-clamp-1 font-heading">{brand.name}</h3>
              
              <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button onClick={() => openForm(brand)} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-slate-200">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirm(brand.id)} className="w-10 h-10 rounded-xl bg-slate-100 text-red-400 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-slate-200">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl border border-slate-100 animate-slide-in-up">
             <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-[30px] flex items-center justify-center text-red-500 mb-8 mx-auto shadow-sm">
                <Trash2 className="w-10 h-10" />
              </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight text-center font-heading">Delete Brand?</h2>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed text-center font-medium">This will remove <span className="text-slate-900 font-bold">"{brands.find(b => b.id === deleteConfirm)?.name}"</span> from your registry.</p>
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

export default AdminBrands;
