import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Plus, Search, X, Upload, Package, Laptop, Database, FileUp, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { runShwetaScrape } from '@/utils/scrapeShweta';

interface Category {
  id: string;
  name: string;
}
interface Brand {
  id: string;
  name: string;
}
interface Product {
  id: string;
  name: string;
  brands?: { name?: string };
  categories?: { name?: string };
  category_id?: string;
  brand_id?: string;
  description?: string;
  mrp: number | string;
  sale_price: number | string;
  b2b_price?: number | string;
  stock_qty: number | string;
  is_featured?: boolean;
  is_active?: boolean;
  images?: string[];
  specifications?: Record<string, string>;
}

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [form, setForm] = useState({
    name: '', category_id: '', brand_id: '', description: '', mrp: '', sale_price: '',
    b2b_price: '', stock_qty: '0', is_featured: false, is_active: true, images: [] as string[],
    specifications: [] as { key: string; value: string }[],
  });
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('products').select('*, brands(name), categories(name)', { count: 'exact' });
    
    if (filter === 'active') query = query.eq('is_active', true);
    else if (filter === 'inactive') query = query.eq('is_active', false);
    else if (filter === 'out') query = query.eq('stock_qty', 0);
    else if (filter === 'low') query = query.lt('stock_qty', 10).gt('stock_qty', 0);
    else if (filter === 'featured') query = query.eq('is_featured', true);
    
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else if (sort === 'oldest') query = query.order('created_at', { ascending: true });
    else if (sort === 'price_asc') query = query.order('sale_price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('sale_price', { ascending: false });
    else if (sort === 'stock_asc') query = query.order('stock_qty', { ascending: true });
    else if (sort === 'stock_desc') query = query.order('stock_qty', { ascending: false });
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await query.range(from, to);
    if (error) toast.error('Failed to load products');
    setProducts((data as unknown as Product[]) || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [filter, sort, search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);


  useEffect(() => {
    const fetchMeta = async () => {
      const [catRes, brandRes] = await Promise.all([
        supabase.from('categories').select('id, name').eq('is_active', true).order('name'),
        supabase.from('brands').select('id, name').eq('is_active', true).order('name'),
      ]);
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
    };
    fetchMeta();
  }, []);

  // Search is now handled server-side in fetchProducts
  const filteredProducts = products;

  const openForm = (product?: Product) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name, category_id: product.category_id || '', brand_id: product.brand_id || '',
        description: product.description || '', mrp: String(product.mrp), sale_price: String(product.sale_price),
        b2b_price: product.b2b_price ? String(product.b2b_price) : '', stock_qty: String(product.stock_qty),
        is_featured: !!product.is_featured, is_active: product.is_active !== false,
        images: product.images || [],
        specifications: product.specifications ? Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) })) : [],
      });
    } else {
      setEditing(null);
      setForm({ name: '', category_id: '', brand_id: '', description: '', mrp: '', sale_price: '', b2b_price: '', stock_qty: '0', is_featured: false, is_active: true, images: [], specifications: [] });
    }
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || form.images.length >= 8) return;
    
    setUploading(true);
    const toastId = toast.loading(`Uploading ${files.length} images...`);
    const newImages = [...form.images];
    
    try {
      for (let i = 0; i < Math.min(files.length, 8 - form.images.length); i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        newImages.push(urlData.publicUrl);
      }
      setForm({ ...form, images: newImages });
      toast.success('Images uploaded successfully', { id: toastId });
    } catch (error: unknown) {
      toast.error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.mrp || !form.sale_price) {
      toast.error('Please fill required fields');
      return;
    }
    const specs: Record<string, string> = {};
    form.specifications.forEach(s => { if (s.key) specs[s.key] = s.value; });

    const payload = {
      name: form.name, category_id: form.category_id || null, brand_id: form.brand_id || null,
      description: form.description, mrp: Number(form.mrp), sale_price: Number(form.sale_price),
      b2b_price: form.b2b_price ? Number(form.b2b_price) : null, stock_qty: Number(form.stock_qty),
      is_featured: form.is_featured, is_active: form.is_active, images: form.images,
      specifications: specs,
    };

    const loadingToast = toast.loading(editing ? 'Updating product...' : 'Adding product...');
    
    try {
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Product updated', { id: loadingToast });
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        toast.success('Product added successfully', { id: loadingToast });
      }
      setShowForm(false);
      fetchProducts();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error), { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Product deleted');
    setDeleteConfirm(null);
    fetchProducts();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    fetchProducts();
  };



  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const toastId = toast.loading('Parsing spreadsheet...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n').filter(r => r.trim());
        if (rows.length < 2) throw new Error('Empty CSV');
        
        const products = rows.slice(1).map(row => {
          const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          return {
            name: cols[0], mrp: Number(cols[1]), sale_price: Number(cols[2]), stock_qty: Number(cols[3] || 10), is_active: true
          };
        });
        const { error } = await supabase.from('products').insert(products);
        if (error) throw error;
        toast.success(`Imported ${products.length} products!`, { id: toastId });
        fetchProducts();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : String(err), { id: toastId });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportShweta = useCallback(async () => {
    setIsImporting(true);
    const toastId = toast.loading('Starting Shweta Computers import...');
    try {
      const res = await runShwetaScrape((msg) => {
        toast.loading(msg, { id: toastId });
      });
      toast.success(`Import complete! Fetched: ${res.totalFetched}, Inserted: ${res.totalInserted}`, { id: toastId });
      fetchProducts();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error(`Import failed: ${errorMsg}`, { id: toastId });
    } finally {
      setIsImporting(false);
    }
  }, [fetchProducts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoImport') === 'true' && !isImporting) {
      handleImportShweta();
      // Remove the param so it doesn't run again on refresh
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [handleImportShweta, isImporting]);

  const discount = form.mrp && form.sale_price ? Math.round((1 - Number(form.sale_price) / Number(form.mrp)) * 100) : 0;

  if (showForm) {
    return (
      <AdminLayout activeTab="products">
        <div className="max-w-4xl mx-auto pb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 backdrop-blur-md rounded-xl transition-colors text-white/40">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">{editing ? 'Edit Product' : 'Add New Product'}</h1>
                <p className="text-white/50 text-sm font-medium">Fill in the details to list your product.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel rounded-3xl p-6 shadow-lg border border-white/10 space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-2">Basic Information</h2>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-1.5 block">Product Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-white/20 rounded-xl px-4 py-3 text-sm glass-panel outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/60 mb-1.5 block">Category *</label>
                    <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                      className="w-full border border-white/20 rounded-xl px-3 py-3 text-sm glass-panel outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium">
                      <option value="">Select</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/60 mb-1.5 block">Brand *</label>
                    <select value={form.brand_id} onChange={e => setForm({ ...form, brand_id: e.target.value })}
                      className="w-full border border-white/20 rounded-xl px-3 py-3 text-sm glass-panel outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium">
                      <option value="">Select</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-white/20 rounded-xl px-4 py-3 text-sm glass-panel outline-none focus:ring-2 focus:ring-[#3B82F6]/20 min-h-[120px] font-medium" />
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-6 shadow-lg border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Specifications</h2>
                  <button onClick={() => setForm({ ...form, specifications: [...form.specifications, { key: '', value: '' }] })}
                    className="text-xs font-black text-blue-400 hover:text-blue-700">+ Add New</button>
                </div>
                <div className="space-y-3">
                  {form.specifications.map((spec, i) => (
                    <div key={i} className="flex gap-2 group">
                      <input placeholder="Key" value={spec.key} onChange={e => {
                        const specs = [...form.specifications];
                        specs[i].key = e.target.value;
                        setForm({ ...form, specifications: specs });
                      }} className="flex-1 border border-white/20 rounded-xl px-4 py-2 text-sm glass-panel outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium" />
                      <input placeholder="Value" value={spec.value} onChange={e => {
                        const specs = [...form.specifications];
                        specs[i].value = e.target.value;
                        setForm({ ...form, specifications: specs });
                      }} className="flex-1 border border-white/20 rounded-xl px-4 py-2 text-sm glass-panel outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-medium" />
                      <button onClick={() => setForm({ ...form, specifications: form.specifications.filter((_, j) => j !== i) })}
                        className="w-10 h-10 border border-white/20 rounded-xl flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-colors">×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-gradient rounded-3xl p-6 shadow-xl text-white space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-white/60 mb-1 block uppercase">MRP (₹)</label>
                    <input type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })}
                      className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white/20 backdrop-blur-md font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/60 mb-1 block uppercase">Sale (₹)</label>
                    <input type="number" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })}
                      className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white/20 backdrop-blur-md font-bold" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/60 mb-1 block uppercase">Inventory Stock</label>
                  <input type="number" value={form.stock_qty} onChange={e => setForm({ ...form, stock_qty: e.target.value })}
                    className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white/20 backdrop-blur-md font-bold" />
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-6 shadow-lg border border-white/10">
                <h2 className="text-sm font-black text-white mb-4">Product Images</h2>
                <div className="grid grid-cols-3 gap-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative aspect-square">
                      <img src={img} alt="" className="w-full h-full object-cover rounded-2xl border border-white/10" />
                      <button onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">×</button>
                    </div>
                  ))}
                  {form.images.length < 8 && (
                    <label className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 backdrop-blur-md transition-all">
                      <Upload className="w-6 h-6 text-white/30" />
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 md:left-[64px] lg:left-[260px] right-0 bg-white/90 backdrop-blur-md backdrop-blur-xl border-t border-white/10 p-4 z-50 transition-all duration-300">
            <div className="max-w-4xl mx-auto flex gap-4">
              <button onClick={() => setShowForm(false)} className="flex-1 bg-white/10 backdrop-blur-md text-white/60 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 backdrop-blur-md transition-all">
                Discard
              </button>
              <button onClick={handleSave} className="flex-[2] bg-blue-gradient text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:shadow-blue transition-all">
                {editing ? 'Update Changes' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="products">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Products Catalog</h1>
          <p className="text-white/50 text-sm mt-1 font-medium">Add, manage and track your store inventory.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleImportShweta} disabled={isImporting} className="flex items-center gap-2 bg-purple-600/20 text-purple-400 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-600/30 transition-all cursor-pointer disabled:opacity-50 border border-purple-500/20">
            <Database className="w-4 h-4" /> {isImporting ? 'Importing...' : 'Shweta Import'}
          </button>
          <label className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all cursor-pointer">
            <FileUp className="w-4 h-4" /> Import CSV
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>
          <button onClick={() => openForm()} className="flex items-center gap-2 bg-blue-gradient text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 transition-all">
            <Plus className="w-5 h-5" /> Add Product
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-500 transition-colors" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search catalog..."
            className="w-full pl-12 pr-4 py-3.5 border border-white/20 rounded-2xl text-sm glass-panel outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#3B82F6] transition-all font-medium" />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="md:w-64 border border-white/20 rounded-2xl px-4 py-3.5 text-sm glass-panel outline-none font-bold text-white/80">
          <option value="newest">Recent First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="stock_asc">Stock: Low to High</option>
        </select>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-6 hide-scrollbar">
        {[
          ['all', 'All Products'], ['active', 'Live Stores'], ['inactive', 'Drafts'], ['out', 'Out of Stock'], ['low', 'Low Stock'], ['featured', 'Featured']
        ].map(([k, l]) => (
          <button key={k} onClick={() => { setFilter(k); setPage(1); }}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === k ? 'bg-blue-gradient text-white shadow-lg' : 'glass-panel text-white/50 border border-white/10'
            }`}>
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="glass-panel rounded-3xl h-64 animate-pulse border border-white/10" />)
        ) : products.length === 0 ? (
          <div className="lg:col-span-4 glass-panel rounded-3xl p-20 text-center border-2 border-dashed border-white/10">
            <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-bold">No results found in catalog</p>
          </div>
        ) : products.map(product => (
          <div key={product.id} className="group glass-panel rounded-3xl shadow-lg border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="aspect-square bg-white/5 backdrop-blur-md p-6 relative">
              <img src={product.images?.[0] || '/placeholder.svg'} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <button onClick={() => openForm(product)} className="w-8 h-8 glass-panel shadow-lg text-white/60 rounded-lg flex items-center justify-center hover:bg-blue-gradient hover:text-white transition-all">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirm(product.id)} className="w-8 h-8 glass-panel shadow-lg text-red-400 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{product.brands?.name || 'GENERIC'}</span>
                <span className={`w-2 h-2 rounded-full ${product.is_active ? 'bg-emerald-500' : 'bg-white/20 backdrop-blur-md'}`} />
              </div>
              <h3 className="font-bold text-white text-sm mb-3 line-clamp-1">{product.name}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">₹{Number(product.sale_price).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-white/40 line-through">₹{Number(product.mrp).toLocaleString('en-IN')}</p>
                </div>
                <div className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-lg text-[10px] font-black text-white/60 uppercase tracking-widest">
                   {product.stock_qty} STOCK
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-between mt-8 mb-4 px-2">
          <p className="text-white/50 text-sm font-medium">
            Showing {Math.min((page - 1) * pageSize + 1, totalCount)}–{Math.min(page * pageSize, totalCount)} of {totalCount} products
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed glass-panel text-white/60 border border-white/10 hover:bg-white/10"
            >
              ← Previous
            </button>
            {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
              .filter(p => p === 1 || p === Math.ceil(totalCount / pageSize) || Math.abs(p - page) <= 2)
              .reduce((acc: (number | string)[], p, i, arr) => {
                if (i > 0 && (arr[i] as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                typeof p === 'string' ? (
                  <span key={`dots-${i}`} className="text-white/30 px-1">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                      page === p 
                        ? 'bg-blue-gradient text-white shadow-lg' 
                        : 'glass-panel text-white/50 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {p}
                  </button>
                )
              )
            }
            <button 
              onClick={() => setPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))} 
              disabled={page >= Math.ceil(totalCount / pageSize)}
              className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed glass-panel text-white/60 border border-white/10 hover:bg-white/10"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-blue-gradient/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-panel rounded-[40px] w-full max-w-sm p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-2">Delete Item?</h2>
            <p className="text-white/50 text-sm mb-8">This action is permanent and cannot be reversed.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Confirm Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="w-full bg-white/10 backdrop-blur-md text-white/60 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
