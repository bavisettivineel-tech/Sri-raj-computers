import React, { useEffect, useState, useCallback } from 'react';
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
        <div className="max-w-2xl mx-auto pb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-heading">{editing ? 'Edit Banner' : 'Add New Banner'}</h1>
                <p className="text-slate-500 text-sm font-medium">Create promotional hero sliders or ad banners.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Banner Image</label>
                <div className="relative group">
                  {form.image_url ? (
                    <div className="relative h-48 rounded-2xl overflow-hidden group border border-slate-100 shadow-inner bg-slate-50">
                      <img src={form.image_url} alt="" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <label className="cursor-pointer bg-white text-slate-900 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transition-transform active:scale-95 border border-transparent inline-flex">
                          Change Image
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-all cursor-pointer group">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:scale-110 transition-all border border-slate-100">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-500">Click to upload image</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Recommended: 1920×600px (JPG, PNG)</p>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center rounded-3xl z-10">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/20" />
                        <p className="mt-3 text-xs font-black text-primary uppercase tracking-widest animate-pulse">Uploading...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Title (Optional)</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Summer Sale 2024"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm bg-white outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subtitle (Optional)</label>
                  <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="e.g. Up to 50% OFF"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm bg-white outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Button Text</label>
                  <input value={form.button_text} onChange={e => setForm({ ...form, button_text: e.target.value })}
                    placeholder="e.g. Shop Now"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm bg-white outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Button Link</label>
                  <input value={form.button_link} onChange={e => setForm({ ...form, button_link: e.target.value })}
                    placeholder="e.g. /shop"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm bg-white outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium" />
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })}
                    className="w-24 border border-slate-200 rounded-xl px-4 py-2 text-sm bg-white outline-none focus:border-primary font-bold shadow-sm" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Active</span>
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button onClick={() => setShowForm(false)} className="flex-1 bg-white text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={uploading} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-heading">Banners & Promotions</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage your homepage hero sliders and promotional ads.</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="w-5 h-5" /> Add New Banner
        </button>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar">
        {[
          ['hero', 'Hero Slider'], 
          ['promo', 'Promo Strips'], 
          ['category', 'Category Banners'], 
          ['popup', 'Popup Ads']
        ].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              tab === k 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100">
            <Image className="w-10 h-10" />
          </div>
          <p className="text-slate-900 font-black text-xl font-heading">No banners found</p>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 font-medium">Start by adding your first promotional banner for this section.</p>
          <button onClick={() => openForm()} className="mt-8 bg-primary/5 text-primary px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10">
            + Create Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {banners.map(banner => (
            <div key={banner.id} className="group bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-500">
              <div className="relative h-48 bg-slate-50 p-4">
                {banner.image_url ? (
                  <img src={banner.image_url} alt="" className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <Image className="w-10 h-10" />
                  </div>
                )}
                {!banner.is_active && (
                  <div className="absolute top-4 left-4 bg-slate-900/10 backdrop-blur-md text-slate-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                    Draft
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button onClick={() => openForm(banner)} className="w-10 h-10 bg-white shadow-lg text-slate-400 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-slate-100">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => setDeleteConfirm(banner.id)} className="w-10 h-10 bg-white shadow-lg text-red-400 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-slate-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order: {banner.sort_order}</span>
                  <span className={`w-2 h-2 rounded-full ${banner.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
                <h3 className="font-bold text-slate-900 text-base line-clamp-1 font-heading">{banner.title || 'Untitled Banner'}</h3>
                {banner.subtitle && <p className="text-xs text-slate-500 mt-1 font-medium line-clamp-1">{banner.subtitle}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-[40px] w-full max-w-sm p-10 shadow-2xl animate-slide-in-up">
            <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-[30px] flex items-center justify-center text-red-500 mb-8 mx-auto shadow-sm">
              <Trash2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center mb-2 font-heading">Delete Banner?</h3>
            <p className="text-slate-500 text-center text-sm mb-10 font-medium">This will permanently remove the banner from your website slider.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95">Confirm Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Keep Banner</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBanners;
