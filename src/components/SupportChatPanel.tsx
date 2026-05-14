import { useState } from 'react';
import { X, Send, MessageCircle, Phone, Mail, User, ShieldCheck } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SupportChatPanel = () => {
  const { supportOpen, setSupportOpen } = useStore();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert([{
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      status: 'unread'
    }]);

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success('Message transmitted to command center!');
      setTimeout(() => {
        setSent(false);
        setForm({ name: '', email: '', phone: '', message: '' });
        setSupportOpen(false);
      }, 3000);
    }
  };

  if (!supportOpen) return null;

  return (
    <AnimatePresence>
      {supportOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setSupportOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0F172A]/95 backdrop-blur-2xl z-[101] shadow-2xl border-l border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
               
               <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#10B981] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <MessageCircle className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Live Support</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6]">Encrypted Channel</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => setSupportOpen(false)}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-none">
               {sent ? (
                 <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                       <ShieldCheck className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Message Dispatched</h3>
                    <p className="text-white/50 text-sm max-w-[240px]">Our support division has received your transmission and will respond shortly.</p>
                 </div>
               ) : (
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Identity</label>
                       <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#3B82F6] transition-colors" />
                          <input 
                            required
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                            placeholder="Your full name"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-[#3B82F6]/50 transition-all"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Communication Email</label>
                          <div className="relative group">
                             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#3B82F6] transition-colors" />
                             <input 
                               type="email"
                               value={form.email}
                               onChange={e => setForm({...form, email: e.target.value})}
                               placeholder="mail@example.com"
                               className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-[#3B82F6]/50 transition-all"
                             />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Contact Number</label>
                          <div className="relative group">
                             <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#3B82F6] transition-colors" />
                             <input 
                               value={form.phone}
                               onChange={e => setForm({...form, phone: e.target.value})}
                               placeholder="+91"
                               className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-[#3B82F6]/50 transition-all"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Transmission Data</label>
                       <textarea 
                         required
                         value={form.message}
                         onChange={e => setForm({...form, message: e.target.value})}
                         placeholder="Describe your inquiry or technical issue..."
                         className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-medium text-white outline-none focus:bg-white/10 focus:border-[#3B82F6]/50 min-h-[180px] transition-all resize-none"
                       />
                    </div>

                    <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                       <p className="text-[11px] text-white/40 font-medium leading-relaxed italic">
                          "Connecting directly to our administrative mainframe. Response times vary based on system load."
                       </p>
                    </div>
                 </form>
               )}
            </div>

            {/* Footer */}
            {!sent && (
              <div className="p-8 border-t border-white/10">
                 <button 
                   onClick={handleSubmit}
                   disabled={loading}
                   className="w-full bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Initialize Connection
                      </>
                    )}
                 </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SupportChatPanel;
