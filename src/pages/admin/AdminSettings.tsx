import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Store, CreditCard, Truck, Shield, Share2, Wallet, Settings2, Save, Key, Globe, Receipt, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('store');
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from('app_settings').select('key, value');
      if (error) { toast.error('Synchronization failed'); return; }
      const map: Record<string, string> = {};
      (data || []).forEach(s => { map[s.key] = s.value || ''; });
      setSettings(map);
      setLoading(false);
    };
    fetch();
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSectionSettings = async (keys: string[]) => {
    setSaving(true);
    const toastId = toast.loading('Committing architectural changes...');
    try {
      const payload = keys.map(key => ({ 
        key, 
        value: settings[key] || '', 
        updated_at: new Date().toISOString() 
      }));
      const { error } = await supabase.from('app_settings').upsert(payload, { onConflict: 'key' });
      if (error) throw error;
      toast.success('Core parameters synchronized', { id: toastId });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : String(e), { id: toastId });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) { toast.error('Verification mismatch'); return; }
    if (passwordForm.new.length < 6) { toast.error('Security threshold not met (min 6 chars)'); return; }
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    if (error) { toast.error(error.message); return; }
    toast.success('Security partition credentials updated');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const tabs = [
    { key: 'store', label: 'Storefront', icon: Store },
    { key: 'pricing', label: 'Tax & B2B', icon: Receipt },
    { key: 'shipping', label: 'Logistics', icon: Truck },
    { key: 'payment', label: 'Transactions', icon: Wallet },
    { key: 'social', label: 'Channels', icon: Share2 },
    { key: 'security', label: 'Safety', icon: Shield },
  ];

  return (
    <AdminLayout activeTab="settings">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-heading">System Control</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Global configuration and platform orchestration.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm px-6">
           <Settings2 className="w-5 h-5 text-primary" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Environment: Production</span>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-8 hide-scrollbar">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent ${
              tab === t.key ? 'bg-primary text-white shadow-lg shadow-primary/20 border-primary/30' : 'bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-slate-200 shadow-sm'
            }`}>
            <t.icon className={`w-4 h-4 ${tab === t.key ? 'text-white' : 'text-slate-300'}`} /> {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        {tab === 'store' && (
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-slate-50 text-primary border border-slate-100 rounded-2xl flex items-center justify-center"><Store className="w-6 h-6" /></div>
               <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading">Public Identity</h2>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5">Brand & Contact Parameters</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[ { key: 'store_name', label: 'Corporate Title' }, { key: 'tagline', label: 'Slogan / Mission' }].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{f.label}</label>
                  <input value={settings[f.key] || ''} onChange={e => updateSetting(f.key, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all placeholder-slate-300" />
                </div>
              ))}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Headquarters Address</label>
              <textarea value={settings.address || ''} onChange={e => updateSetting('address', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:border-primary min-h-[120px] transition-all" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { key: 'phone1', label: 'Support Line' }, { key: 'email1', label: 'Public Email' }, { key: 'whatsapp', label: 'Direct WhatsApp' }
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{f.label}</label>
                  <input value={settings[f.key] || ''} onChange={e => updateSetting(f.key, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" />
                </div>
              ))}
            </div>

            <button onClick={() => saveSectionSettings(['store_name', 'tagline', 'address', 'phone1', 'email1', 'whatsapp'])}
              disabled={saving} className="flex items-center justify-center gap-2 w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Compiling Datastream...' : 'Update Architecture'}
            </button>
          </div>
        )}

        {tab === 'pricing' && (
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center"><Receipt className="w-6 h-6" /></div>
               <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading">Financial Mechanics</h2>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5">Taxation & Wholesale Logic</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Standard GST Factor (%)</label>
                <input type="number" value={settings.gst_percent || ''} onChange={e => updateSetting('gst_percent', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-6 py-4 text-lg font-black outline-none focus:bg-white focus:border-primary transition-all" />
              </div>
              <div className="flex flex-col justify-center">
                 <p className="text-xs text-slate-400 font-medium italic">Integrated calculation applies this factor to all catalog base prices unless specified per-item.</p>
              </div>
            </div>

            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-200 space-y-6">
               <h3 className="text-primary text-[10px] font-black uppercase tracking-widest font-heading">Wholesale B2B Partition</h3>
               <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center">
                  <p className="text-sm font-bold text-slate-600 mb-4">Quantity-based discounts are now managed in the Dealer / B2B section with multi-tier support.</p>
                  <button onClick={() => navigate('/admin/dealers')} className="bg-primary/10 text-primary px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                    Manage Quantity Discounts
                  </button>
               </div>
            </div>

            <button onClick={() => saveSectionSettings(['gst_percent', 'bulk_discount_percent', 'bulk_qty_threshold'])}
              disabled={saving} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
               Update Ledger Parameters
            </button>
          </div>
        )}

        {tab === 'shipping' && (
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl flex items-center justify-center"><Truck className="w-6 h-6" /></div>
               <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading">Logistics Engine</h2>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5">Fulfillment Costs & Methods</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                { key: 'free_shipping_threshold', label: 'Complimentary Threshold (₹)' },
                { key: 'shipping_charge', label: 'Base Delivery Fee (₹)' },
                { key: 'express_shipping_charge', label: 'Priority / Express Premium (₹)' },
                { key: 'cod_extra_charge', label: 'COD Risk Premium (₹)' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{f.label}</label>
                  <input type="number" value={settings[f.key] || ''} onChange={e => updateSetting(f.key, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary outline-none transition-all" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-200">
               <div>
                  <h4 className="font-black text-slate-900 text-sm tracking-tight font-heading">Cash on Delivery (COD)</h4>
                  <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Accept manual hand-offs at delivery</p>
               </div>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.cod_available === 'true'} onChange={e => updateSetting('cod_available', String(e.target.checked))} className="sr-only peer" />
                  <div className="w-14 h-7 bg-slate-200 border border-slate-300 rounded-full peer peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[26px]"></div>
               </div>
            </div>

            <button onClick={() => saveSectionSettings(['free_shipping_threshold', 'shipping_charge', 'express_shipping_charge', 'cod_extra_charge', 'cod_available'])}
              disabled={saving} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
              Synchronize Logistics Matrix
            </button>
          </div>
        )}

        {tab === 'security' && (
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center"><Shield className="w-6 h-6" /></div>
               <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading">Access Partition</h2>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5">Admin Security Control</p>
               </div>
            </div>

            <div className="space-y-6">
              {[ { key: 'new', label: 'Primary Security Key (New Password)' }, { key: 'confirm', label: 'Verify Security Key' }].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{f.label}</label>
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                    <input type="password" value={passwordForm[f.key as keyof typeof passwordForm]} onChange={e => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all placeholder-slate-300" />
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleChangePassword} className="w-full bg-red-50 text-red-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-100 shadow-sm hover:bg-red-600 hover:text-white hover:scale-[1.01] transition-all">
               Finalize Security Override
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
