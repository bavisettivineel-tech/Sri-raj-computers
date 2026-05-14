import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Store, CreditCard, Truck, Shield, Share2, Wallet, Settings2, Save, Key, Globe, Receipt, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
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
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight text-neon-cyan">System Control</h1>
          <p className="text-white/60 text-sm mt-1 font-medium">Global configuration and platform orchestration.</p>
        </div>
        <div className="flex items-center gap-3 glass-panel p-2 rounded-2xl border border-white/10 shadow-lg px-6">
           <Settings2 className="w-5 h-5 text-[#3B82F6]" />
           <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Environment: Production</span>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-8 hide-scrollbar">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent ${
              tab === t.key ? 'bg-blue-gradient text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border-[#3B82F6]/30' : 'glass-panel text-white/50 hover:text-white hover:bg-white/5 backdrop-blur-md border-white/5'
            }`}>
            <t.icon className={`w-4 h-4 ${tab === t.key ? 'text-[#3B82F6]' : 'text-white/30'}`} /> {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        {tab === 'store' && (
          <div className="glass-panel rounded-[40px] p-10 shadow-lg border border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-white/5 backdrop-blur-md text-[#3B82F6] border border-white/10 rounded-2xl flex items-center justify-center shadow-blue"><Store className="w-6 h-6" /></div>
               <div>
                  <h2 className="text-lg font-black text-white tracking-tight">Public Identity</h2>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-widest mt-0.5">Brand & Contact Parameters</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[ { key: 'store_name', label: 'Corporate Title' }, { key: 'tagline', label: 'Slogan / Mission' }].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">{f.label}</label>
                  <input value={settings[f.key] || ''} onChange={e => updateSetting(f.key, e.target.value)}
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white/10 backdrop-blur-md focus:border-[#3B82F6]/50 transition-all placeholder-white/20" />
                </div>
              ))}
            </div>

            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Headquarters Address</label>
              <textarea value={settings.address || ''} onChange={e => updateSetting('address', e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white/10 backdrop-blur-md focus:border-[#3B82F6]/50 min-h-[120px] transition-all" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { key: 'phone1', label: 'Support Line' }, { key: 'email1', label: 'Public Email' }, { key: 'whatsapp', label: 'Direct WhatsApp' }
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">{f.label}</label>
                  <input value={settings[f.key] || ''} onChange={e => updateSetting(f.key, e.target.value)}
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white/10 backdrop-blur-md focus:border-[#3B82F6]/50 transition-all" />
                </div>
              ))}
            </div>

            <button onClick={() => saveSectionSettings(['store_name', 'tagline', 'address', 'phone1', 'email1', 'whatsapp'])}
              disabled={saving} className="flex items-center justify-center gap-2 w-full bg-blue-gradient text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-blue transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 border border-[#3B82F6]/30">
              <Save className="w-4 h-4" /> {saving ? 'Compiling Datastream...' : 'Update Architecture'}
            </button>
          </div>
        )}

        {tab === 'pricing' && (
          <div className="glass-panel rounded-[40px] p-10 shadow-lg border border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-white/5 backdrop-blur-md text-emerald-400 border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]"><Receipt className="w-6 h-6" /></div>
               <div>
                  <h2 className="text-lg font-black text-white tracking-tight">Financial Mechanics</h2>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-widest mt-0.5">Taxation & Wholesale Logic</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Standard GST Factor (%)</label>
                <input type="number" value={settings.gst_percent || ''} onChange={e => updateSetting('gst_percent', e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl px-6 py-4 text-lg font-black outline-none focus:bg-white/10 backdrop-blur-md focus:border-[#3B82F6]/50 transition-all" />
              </div>
              <div className="flex flex-col justify-center">
                 <p className="text-xs text-white/40 font-medium italic">Integrated calculation applies this factor to all catalog base prices unless specified per-item.</p>
              </div>
            </div>

            <div className="p-8 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 space-y-6">
               <h3 className="text-[#3B82F6] text-[10px] font-black uppercase tracking-widest">Wholesale B2B Partition</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-[#3B82F6]/70 uppercase tracking-widest mb-2 block">Global Partner Discount (%)</label>
                    <input type="number" value={settings.bulk_discount_percent || ''} onChange={e => updateSetting('bulk_discount_percent', e.target.value)}
                      className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl px-5 py-4 font-black focus:bg-white/10 backdrop-blur-md focus:border-[#3B82F6]/50 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#3B82F6]/70 uppercase tracking-widest mb-2 block">Activation Threshold (Items)</label>
                    <input type="number" value={settings.bulk_qty_threshold || ''} onChange={e => updateSetting('bulk_qty_threshold', e.target.value)}
                      className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl px-5 py-4 font-black focus:bg-white/10 backdrop-blur-md focus:border-[#3B82F6]/50 transition-all" />
                  </div>
               </div>
            </div>

            <button onClick={() => saveSectionSettings(['gst_percent', 'bulk_discount_percent', 'bulk_qty_threshold'])}
              disabled={saving} className="w-full bg-blue-gradient text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-blue transition-all hover:scale-[1.01] active:scale-[0.99] border border-[#3B82F6]/30">
               Update Ledger Parameters
            </button>
          </div>
        )}

        {tab === 'shipping' && (
          <div className="glass-panel rounded-[40px] p-10 shadow-lg border border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-white/5 backdrop-blur-md text-orange-400 border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]"><Truck className="w-6 h-6" /></div>
               <div>
                  <h2 className="text-lg font-black text-white tracking-tight">Logistics Engine</h2>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-widest mt-0.5">Fulfillment Costs & Methods</p>
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
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">{f.label}</label>
                  <input type="number" value={settings[f.key] || ''} onChange={e => updateSetting(f.key, e.target.value)}
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white/10 backdrop-blur-md focus:border-[#3B82F6]/50 outline-none transition-all" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
               <div>
                  <h4 className="font-black text-white text-sm tracking-tight">Cash on Delivery (COD)</h4>
                  <p className="text-white/40 text-[10px] font-bold uppercase mt-1">Accept manual hand-offs at delivery</p>
               </div>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.cod_available === 'true'} onChange={e => updateSetting('cod_available', String(e.target.checked))} className="sr-only peer" />
                  <div className="w-14 h-7 bg-white/10 backdrop-blur-md border border-white/10 rounded-full peer peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:glass-panel after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[26px]"></div>
               </div>
            </div>

            <button onClick={() => saveSectionSettings(['free_shipping_threshold', 'shipping_charge', 'express_shipping_charge', 'cod_extra_charge', 'cod_available'])}
              disabled={saving} className="w-full bg-blue-gradient text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-blue transition-all hover:scale-[1.01] active:scale-[0.99] border border-[#3B82F6]/30">
              Synchronize Logistics Matrix
            </button>
          </div>
        )}

        {tab === 'security' && (
          <div className="glass-panel rounded-[40px] p-10 shadow-lg border border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-white/5 backdrop-blur-md text-red-400 border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(248,113,113,0.2)]"><Shield className="w-6 h-6" /></div>
               <div>
                  <h2 className="text-lg font-black text-white tracking-tight">Access Partition</h2>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-widest mt-0.5">Admin Security Control</p>
               </div>
            </div>

            <div className="space-y-6">
              {[ { key: 'new', label: 'Primary Security Key (New Password)' }, { key: 'confirm', label: 'Verify Security Key' }].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">{f.label}</label>
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3B82F6]/50" />
                    <input type="password" value={passwordForm[f.key as keyof typeof passwordForm]} onChange={e => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })}
                      className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:bg-white/10 backdrop-blur-md focus:border-[#3B82F6]/50 transition-all placeholder-white/20" />
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleChangePassword} className="w-full bg-red-500/20 text-red-400 py-5 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-red-500 hover:text-white hover:scale-[1.01] transition-all">
               Finalize Security Override
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
