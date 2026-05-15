import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Plus, FolderOpen, ChevronDown, ChevronRight, X, Upload, Layers, ListFilter } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  parent_id?: string;
  image_url?: string;
  sort_order?: number;
  is_active: boolean;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', parent_id: '', image_url: '', sort_order: '0', is_active: true });
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order').order('name');
    setCategories(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const topLevel = categories.filter(c => !c.parent_id);
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  const openForm = (cat?: Category) => {
    if (cat) {
      setEditing(cat);
      setForm({ name: cat.name, parent_id: cat.parent_id || '', image_url: cat.image_url || '', sort_order: String(cat.sort_order || 0), is_active: cat.is_active !== false });
    } else {
      setEditing(null);
      setForm({ name: '', parent_id: '', image_url: '', sort_order: '0', is_active: true });
    }
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const toastId = toast.loading('Uploading assets...');
    const path = `categories/${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) { toast.error(error.message, { id: toastId }); return; }
    
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    setForm({ ...form, image_url: data.publicUrl });
    toast.success('Asset uploaded!', { id: toastId });
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Category name is required'); return; }
    const payload = { name: form.name, parent_id: form.parent_id || null, image_url: form.image_url || null, sort_order: Number(form.sort_order), is_active: form.is_active };
    if (editing) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Category architecture updated');
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('New category established');
    }
    setShowForm(false);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Category removed');
    setDeleteConfirm(null);
    fetchCategories();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('categories').update({ is_active: !current }).eq('id', id);
    fetchCategories();
  };

  if (showForm) {
    return (
      <AdminLayout activeTab="categories">
        <div className="max-w-2xl mx-auto pb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">{editing ? 'Edit Category' : 'Add New Category'}</h1>
                <p className="text-slate-500 text-sm font-medium">Structure your product hierarchy.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Laptops, Accessories"
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold transition-all" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Parent Category</label>
                <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-primary font-bold">
                  <option value="">Top Level (Root)</option>
                  {topLevel.filter(c => c.id !== editing?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-primary font-bold" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Category Icon/Image</label>
              <div className="flex items-center gap-6">
                 {form.image_url ? (
                   <div className="relative group">
                     <img src={form.image_url} alt="" className="w-24 h-24 object-cover rounded-[24px] border border-slate-100 shadow-sm" />
                     <button onClick={() => setForm({...form, image_url: ''})} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg">×</button>
                   </div>
                 ) : (
                   <label className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all group">
                     <Upload className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                   </label>
                 )}
                 <div className="text-xs text-slate-400 font-medium leading-relaxed">
                   Upload a representative icon or <br />photo for this category cluster.
                 </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Status</span>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
               </div>
            </div>

            <div className="flex gap-3 pt-4">
               <button onClick={handleSave} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95">Save Category</button>
               <button onClick={() => setShowForm(false)} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="categories">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-heading">Category Architecture</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage and organize your store clusters.</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="w-5 h-5" /> New Category
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1,2,3].map(i => <div key={i} className="bg-white rounded-[32px] h-16 animate-pulse border border-slate-200" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200">
          <Layers className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">The library is currently empty</p>
          <button onClick={() => openForm()} className="mt-8 text-primary font-black text-xs uppercase tracking-widest hover:underline">Add your first category</button>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {topLevel.map(cat => {
            const children = getChildren(cat.id);
            const isExpanded = expanded.has(cat.id);
            return (
              <div key={cat.id} className="transition-all">
                <div className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {children.length > 0 ? (
                      <button onClick={() => { const next = new Set(expanded); if (isExpanded) { next.delete(cat.id); } else { next.add(cat.id); } setExpanded(next); }}
                         className={`w-full h-full rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                    )}
                  </div>
                  
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight font-heading">{cat.name}</h4>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => openForm(cat)} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-slate-200">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(cat.id)} className="w-9 h-9 rounded-xl bg-slate-100 text-red-400 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-slate-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {isExpanded && children.map(child => (
                  <div key={child.id} className="flex items-center gap-4 p-5 pl-20 bg-slate-50/50 border-t border-slate-100 group">
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-300">
                      <ListFilter className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-500">{child.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openForm(child)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all flex items-center justify-center">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(child.id)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl border border-slate-100 animate-slide-in-up text-center">
             <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-[30px] flex items-center justify-center text-red-500 mb-8 mx-auto shadow-sm">
                <Trash2 className="w-10 h-10" />
              </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight font-heading">Erase Category?</h2>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">Removing <span className="text-slate-900 font-bold">"{categories.find(c => c.id === deleteConfirm)?.name}"</span> will disconnect all nested items.</p>
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

export default AdminCategories;
