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
               <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 backdrop-blur-md rounded-xl transition-colors text-white/40">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">{editing ? 'Modify Concept' : 'Define Category'}</h1>
                <p className="text-white/50 text-sm font-medium">Structure your product hierarchy.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-8 shadow-lg border border-white/10 space-y-6">
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Identity Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:glass-panel focus:ring-4 focus:ring-blue-500/5 focus:border-[#3B82F6] font-bold transition-all" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Parent Context</label>
                <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })}
                  className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:glass-panel font-bold">
                  <option value="">Top Level (Root)</option>
                  {topLevel.filter(c => c.id !== editing?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Display Sequence</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })}
                  className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:glass-panel font-bold" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 block">Visual Representative</label>
              <div className="flex items-center gap-6">
                 {form.image_url ? (
                   <div className="relative group">
                     <img src={form.image_url} alt="" className="w-24 h-24 object-cover rounded-[24px] border-2 border-white/10 shadow-xl" />
                     <button onClick={() => setForm({...form, image_url: ''})} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all">×</button>
                   </div>
                 ) : (
                   <label className="w-24 h-24 border-2 border-dashed border-white/10 rounded-[24px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 backdrop-blur-md transition-all group">
                     <Upload className="w-6 h-6 text-white/20 group-hover:text-blue-500 transition-colors" />
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                   </label>
                 )}
                 <div className="text-xs text-white/40 font-medium leading-relaxed">
                   Upload a representative icon or <br />photo for this category cluster.
                 </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-2xl">
               <span className="text-xs font-black text-white uppercase tracking-widest">Public Availability</span>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/20 backdrop-blur-md rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:glass-panel after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
               </div>
            </div>

            <div className="flex gap-3 pt-4">
               <button onClick={handleSave} className="flex-[2] bg-blue-gradient text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">Save Definition</button>
               <button onClick={() => setShowForm(false)} className="flex-1 bg-white/10 backdrop-blur-md text-white/60 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="categories">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Category Hierarchy</h1>
          <p className="text-white/50 text-sm mt-1 font-medium">Manage and organize your store clusters.</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center gap-2 bg-blue-gradient text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 transition-all">
          <Plus className="w-5 h-5" /> New Category
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1,2,3].map(i => <div key={i} className="glass-panel rounded-[32px] h-16 animate-pulse border border-white/10" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-panel rounded-[40px] p-24 text-center border-2 border-dashed border-white/10">
          <Layers className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 font-bold">The library is currently empty</p>
        </div>
      ) : (
        <div className="glass-panel rounded-[32px] shadow-lg border border-white/10 overflow-hidden divide-y divide-white/5">
          {topLevel.map(cat => {
            const children = getChildren(cat.id);
            const isExpanded = expanded.has(cat.id);
            return (
              <div key={cat.id} className="transition-all">
                <div className="flex items-center gap-4 p-5 hover:bg-white/5 backdrop-blur-md transition-colors group">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {children.length > 0 ? (
                      <button onClick={() => { const next = new Set(expanded); if (isExpanded) { next.delete(cat.id); } else { next.add(cat.id); } setExpanded(next); }}
                         className="w-full h-full rounded-lg bg-white/10 backdrop-blur-md text-white/40 flex items-center justify-center group-hover:bg-blue-gradient group-hover:text-white transition-all">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/20 backdrop-blur-md" />
                    )}
                  </div>
                  
                  <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center text-white/30">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-white tracking-tight">{cat.name}</h4>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => openForm(cat)} className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-gradient hover:text-white transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(cat.id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {isExpanded && children.map(child => (
                  <div key={child.id} className="flex items-center gap-4 p-5 pl-20 bg-white/5 backdrop-blur-md border-t border-white/10 group">
                    <div className="w-8 h-8 glass-panel border border-white/10 rounded-xl flex items-center justify-center text-white/30">
                      <ListFilter className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white/60">{child.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openForm(child)} className="p-2 rounded-lg glass-panel border border-white/10 text-white/40 hover:text-blue-400 transition-all">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(child.id)} className="p-2 rounded-lg glass-panel border border-white/10 text-white/40 hover:text-red-400 transition-all">
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
        <div className="fixed inset-0 bg-blue-gradient/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-panel rounded-[40px] w-full max-w-sm p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Erase Cluster?</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">Removing <span className="text-white font-bold">"{categories.find(c => c.id === deleteConfirm)?.name}"</span> will disconnect all nested items. This cannot be undone.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20">Finalize Removal</button>
              <button onClick={() => setDeleteConfirm(null)} className="w-full bg-white/10 backdrop-blur-md text-white/60 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
