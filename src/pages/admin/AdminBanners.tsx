import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Plus, Image, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
  sort_order: number;
  is_active: boolean;
  type: string;
}

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [tab, setTab] = useState('hero');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', button_text: '', button_link: '', sort_order: '0', is_active: true, type: 'hero' });

  const fetchBanners = useCallback(async () => {
    const { data, error } = await supabase.from('banners').select('*').eq('type', tab).order('sort_order');
    if (error) {
      toast.error('Failed to fetch banners');
      return;
    }
    setBanners(data || []);
  }, [tab]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const openForm = (banner?: Banner) => {
    if (banner) {
      setEditing(banner);
      setForm({ title: banner.title || '', subtitle: banner.subtitle || '', image_url: banner.image_url || '', button_text: banner.button_text || '', button_link: banner.button_link || '', sort_order: String(banner.sort_order || 0), is_active: banner.is_active !== false, type: tab });
    } else {
      setEditing(null);
      setForm({ title: '', subtitle: '', image_url: '', button_text: '', button_link: '', sort_order: '0', is_active: true, type: tab });
    }
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading('Uploading banner image...');
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setForm({ ...form, image_url: data.publicUrl });
      toast.success('Image uploaded successfully', { id: toastId });
    } catch (error: unknown) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.image_url) {
      toast.error('Please upload a banner image');
      return;
    }

    const payload = { 
      title: form.title || null, 
      subtitle: form.subtitle || null, 
      image_url: form.image_url, 
      button_text: form.button_text || null, 
      button_link: form.button_link || null, 
      sort_order: Number(form.sort_order), 
      is_active: form.is_active, 
      type: form.type 
    };

    if (editing) {
      const { error } = await supabase.from('banners').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Banner updated');
    } else {
      const { error } = await supabase.from('banners').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('Banner added');
    }
    setShowForm(false);
    fetchBanners();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Banner deleted');
    setDeleteConfirm(null);
    fetchBanners();
  };

  if (showForm) {
    return (
      <AdminLayout activeTab="banners">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-white text-neon-cyan">{editing ? 'Edit Banner' : 'Add New Banner'}</h1>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 backdrop-blur-md rounded-xl transition-colors text-white/50 border border-transparent hover:border-white/10">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="glass-panel rounded-2xl shadow-lg shadow-blue-500/10 border border-white/10 overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/50">Banner Image</label>
                <div className="relative group">
                  {form.image_url ? (
                    <div className="relative h-48 rounded-2xl overflow-hidden group border border-white/10">
                      <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <label className="cursor-pointer btn-primary px-6 py-2 rounded-xl text-xs font-bold shadow-blue transition-transform active:scale-95 border border-[#3B82F6]/50 inline-flex w-auto h-auto">
                          Change Image
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/20 rounded-2xl bg-white/5 backdrop-blur-md hover:bg-white/10 backdrop-blur-md hover:border-[#3B82F6]/50 transition-all cursor-pointer group">
                      <div className="w-12 h-12 glass-base rounded-xl shadow-lg flex items-center justify-center text-white/40 group-hover:text-[#3B82F6] group-hover:scale-110 transition-all border border-white/10">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="mt-3 text-sm font-bold text-white/70">Click to upload image</p>
                      <p className="text-xs text-white/40 mt-1">Recommended: 800×300px (JPG, PNG)</p>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center rounded-2xl z-10 border border-[#3B82F6]/30">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        <p className="mt-3 text-xs font-bold text-[#3B82F6] uppercase tracking-widest animate-pulse">Uploading...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/50">Title (Optional)</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Summer Sale 2024"
                    className="w-full border border-white/10 rounded-xl px-4 py-3 text-sm bg-white/5 backdrop-blur-md text-white outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition-all font-medium placeholder:text-white/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/50">Subtitle (Optional)</label>
                  <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="e.g. Up to 50% OFF on Laptops"
                    className="w-full border border-white/10 rounded-xl px-4 py-3 text-sm bg-white/5 backdrop-blur-md text-white outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition-all font-medium placeholder:text-white/30" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/50">Button Text</label>
                  <input value={form.button_text} onChange={e => setForm({ ...form, button_text: e.target.value })}
                    placeholder="e.g. Shop Now"
                    className="w-full border border-white/10 rounded-xl px-4 py-3 text-sm bg-white/5 backdrop-blur-md text-white outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition-all font-medium placeholder:text-white/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/50">Button Link</label>
                  <input value={form.button_link} onChange={e => setForm({ ...form, button_link: e.target.value })}
                    placeholder="e.g. /shop/laptops"
                    className="w-full border border-white/10 rounded-xl px-4 py-3 text-sm bg-white/5 backdrop-blur-md text-white outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition-all font-medium placeholder:text-white/30" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-white/50">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })}
                    className="w-24 border border-white/10 rounded-lg px-3 py-2 text-sm bg-[#0F172A] text-white outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] font-bold" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <span className="text-sm font-bold text-white/80">Active Status</span>
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 backdrop-blur-md peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:glass-panel after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6] peer-checked:shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-6 bg-white/5 backdrop-blur-md border-t border-white/10 flex gap-4">
              <button onClick={() => setShowForm(false)} className="flex-1 btn-ghost py-3 rounded-xl font-bold text-sm transition-colors text-center w-full h-auto">
                Cancel
              </button>
              <button onClick={handleSave} disabled={uploading} className="flex-1 btn-primary py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 w-full h-auto">
                Save Banner
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="banners">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight text-neon-cyan">Banners & Promotions</h1>
          <p className="text-white/60 text-sm mt-1 font-medium">Manage your homepage hero sliders and promotional ads.</p>
        </div>
        <button onClick={() => openForm()} className="btn-primary w-auto px-6 shadow-blue">
          <Plus className="w-5 h-5" /> Add New Banner
        </button>
      </div>

      <div className="glass-panel p-2 rounded-2xl shadow-lg border border-white/10 inline-flex gap-1 mb-6 max-w-full overflow-x-auto hide-scrollbar">
        {[
          ['hero', 'Hero Slider'], 
          ['promo', 'Promo Strips'], 
          ['category', 'Category Banners'], 
          ['popup', 'Popup Ads']
        ].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border border-transparent ${
              tab === k 
                ? 'bg-blue-gradient text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border-[#3B82F6]/30' 
                : 'bg-transparent text-white/50 hover:bg-white/5 backdrop-blur-md hover:text-white'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {banners.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center border-2 border-dashed border-white/20">
          <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 text-[#3B82F6]/50 border border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <Image className="w-10 h-10" />
          </div>
          <p className="text-white font-black text-lg">No banners found</p>
          <p className="text-white/50 text-sm max-w-xs mx-auto mt-2">Start by adding your first promotional banner for this section.</p>
          <button onClick={() => openForm()} className="mt-6 text-[#3B82F6] font-bold text-sm hover:underline hover:text-white transition-colors">
            + Create your first banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map(banner => (
            <div key={banner.id} className="group glass-panel rounded-2xl shadow-lg border border-white/10 overflow-hidden hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-[#3B82F6]/30 transition-all duration-300">
              <div className="relative h-40 bg-black/40 border-b border-white/10">
                {banner.image_url ? (
                  <img src={banner.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <Image className="w-10 h-10" />
                  </div>
                )}
                {!banner.is_active && (
                  <div className="absolute top-3 left-3 bg-[#0F172A]/80 backdrop-blur-md text-white/70 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                    Inactive
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openForm(banner)} className="w-8 h-8 glass-panel shadow-lg text-white rounded-lg flex items-center justify-center hover:bg-white/20 backdrop-blur-md active:scale-95 transition-all border border-white/20">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(banner.id)} className="w-8 h-8 glass-panel shadow-[0_0_10px_rgba(239,68,68,0.3)] text-red-400 border border-red-500/30 rounded-lg flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{banner.title || 'No Title'}</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Order: {banner.sort_order}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer scale-75 origin-right">
                    <input type="checkbox" checked={banner.is_active} onChange={async () => {
                      await supabase.from('banners').update({ is_active: !banner.is_active }).eq('id', banner.id);
                      fetchBanners();
                    }} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 backdrop-blur-md peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:glass-panel after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6] peer-checked:shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel border border-white/10 rounded-3xl w-full max-w-sm p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-slide-in-up">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white text-center mb-2">Delete Banner?</h3>
            <p className="text-white/60 text-center text-sm mb-8">This will permanently remove the banner. This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-ghost py-3 rounded-2xl font-bold text-sm h-auto text-center w-full">
                Keep it
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-bold text-sm shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-500 border border-red-400 hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all active:scale-95 text-center w-full h-auto">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBanners;
