import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Plus, Edit, Trash2, X, Check, Phone, Mail, Clock, HelpCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  status: string;
  created_at: string;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
  is_active: boolean;
}

const AdminContact = () => {
  const [tab, setTab] = useState('messages');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [msgFilter, setMsgFilter] = useState('all');
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: '', sort_order: '0', is_active: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [msgRes, faqRes] = await Promise.all([
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('faqs').select('*').order('sort_order')
      ]);
      setMessages(msgRes.data || []);
      setFaqs(faqRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [msgFilter]);

  const markResolved = async (id: string) => {
    const { error } = await supabase.from('contact_messages').update({ status: 'resolved' }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Communication thread archived');
    setMessages(messages.map(m => m.id === id ? { ...m, status: 'resolved' } : m));
  };

  const openFaqForm = (faq?: Faq) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category || '', sort_order: String(faq.sort_order || 0), is_active: faq.is_active !== false });
    } else {
      setEditingFaq(null);
      setFaqForm({ question: '', answer: '', category: '', sort_order: '0', is_active: true });
    }
    setShowFaqForm(true);
  };

  const saveFaq = async () => {
    if (!faqForm.question || !faqForm.answer) { toast.error('Required fields missing'); return; }
    const payload = { question: faqForm.question, answer: faqForm.answer, category: faqForm.category || null, sort_order: Number(faqForm.sort_order), is_active: faqForm.is_active };
    if (editingFaq) {
      await supabase.from('faqs').update(payload).eq('id', editingFaq.id);
      toast.success('Knowledge base entry synchronized');
    } else {
      await supabase.from('faqs').insert(payload);
      toast.success('New logic entry generated');
    }
    setShowFaqForm(false);
    const { data } = await supabase.from('faqs').select('*').order('sort_order');
    setFaqs(data || []);
  };

  const deleteFaq = async (id: string) => {
    await supabase.from('faqs').delete().eq('id', id);
    toast.success('Entry erased');
    setFaqs(faqs.filter(f => f.id !== id));
  };

  const filteredMessages = messages.filter(m => {
     if (msgFilter === 'unread') return m.status === 'unread';
     if (msgFilter === 'resolved') return m.status === 'resolved';
     return true;
  });

  return (
    <AdminLayout activeTab="contact">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Support Operations</h1>
          <p className="text-white/50 text-sm mt-1 font-medium">Manage customer communications and global knowledge base.</p>
        </div>
        <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
           {[ ['messages', 'Incoming Feed', MessageSquare], ['faqs', 'Knowledge Base', HelpCircle] ].map(([k, l, Icon]: any) => (
             <button key={k} onClick={() => setTab(k)}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 tab === k ? 'glass-panel text-white shadow-lg' : 'text-white/40 hover:text-white/60'
               }`}>
               <Icon className={`w-4 h-4 ${tab === k ? 'text-blue-400' : 'text-white/30'}`} /> {l}
             </button>
           ))}
        </div>
      </div>

      {tab === 'messages' && (
        <div className="space-y-6">
          <div className="flex gap-1.5 overflow-x-auto pb-2 hide-scrollbar">
            {[ ['all', 'All Threads'], ['unread', 'Unread Only'], ['resolved', 'Archived'] ].map(([k, l]) => (
              <button key={k} onClick={() => setMsgFilter(k)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  msgFilter === k ? 'bg-blue-gradient text-white shadow-xl' : 'glass-panel text-white/40 border border-white/10'
                }`}>
                {l}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMessages.length === 0 ? (
              <div className="lg:col-span-3 glass-panel rounded-[40px] p-24 text-center border-2 border-dashed border-white/10">
                <MessageCircle className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.2em]">Queue clear</p>
              </div>
            ) : filteredMessages.map(msg => (
              <div key={msg.id} className="group glass-panel rounded-[40px] shadow-lg border border-white/10 p-8 flex flex-col hover:shadow-2xl transition-all duration-500 relative">
                 <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-blue-gradient text-white rounded-2xl flex items-center justify-center font-black">
                       {(msg.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${msg.status === 'unread' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                       {msg.status}
                    </span>
                 </div>
                 
                 <h4 className="font-black text-white text-base mb-1 tracking-tight">{msg.name}</h4>
                 <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-white/20" /> {msg.phone}</span>
                    <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-white/20" /> {msg.email}</span>
                 </div>

                 <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 mb-8 flex-1 group-hover:bg-blue-500/10/30 transition-colors">
                    <p className="text-xs font-medium text-white/60 leading-relaxed italic">"{msg.message}"</p>
                 </div>

                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-white/30 uppercase tracking-widest">
                       <Clock className="w-3.5 h-3.5" /> {new Date(msg.created_at).toLocaleDateString()}
                    </div>
                 </div>

                 <div className="flex gap-2">
                    {msg.status !== 'resolved' && (
                       <button onClick={() => markResolved(msg.id)} className="flex-1 bg-blue-gradient text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">
                          Finalize
                       </button>
                    )}
                    <a href={`https://wa.me/91${msg.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                       className="flex items-center justify-center w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all">
                       <Phone className="w-5 h-5" />
                    </a>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'faqs' && (
        <div className="max-w-4xl mx-auto">
          {showFaqForm ? (
            <div className="glass-panel rounded-[40px] p-10 shadow-lg border border-white/10 space-y-8 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">{editingFaq ? 'Edit Intelligence' : 'Register Entry'}</h2>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Global logic dictionary</p>
                  </div>
                  <button onClick={() => setShowFaqForm(false)} className="w-12 h-12 bg-white/5 backdrop-blur-md text-white/30 rounded-2xl flex items-center justify-center hover:text-white transition-all"><X className="w-6 h-6" /></button>
               </div>

               <div>
                 <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">System Query</label>
                 <input value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                   className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:glass-panel focus:ring-4 focus:ring-blue-500/5 transition-all" />
               </div>

               <div>
                 <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Logic Dispatch (Answer)</label>
                 <textarea value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                   className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold underline-none focus:glass-panel min-h-[150px]" />
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Classification</label>
                    <input value={faqForm.category} onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                      className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Deployment Index</label>
                    <input type="number" value={faqForm.sort_order} onChange={e => setFaqForm({ ...faqForm, sort_order: e.target.value })}
                      className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold" />
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <button onClick={saveFaq} className="flex-[2] bg-blue-gradient text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Commit Intelligence</button>
                  <button onClick={() => setShowFaqForm(false)} className="flex-1 bg-white/10 backdrop-blur-md text-white/60 py-5 rounded-2xl font-black text-xs uppercase tracking-widest">Abort</button>
               </div>
            </div>
          ) : (
            <div className="space-y-6">
               <button onClick={() => openFaqForm()} className="w-full bg-blue-gradient text-white py-5 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
                  <Plus className="w-5 h-5" /> Expand Logic Catalog
               </button>

               <div className="grid grid-cols-1 gap-4">
                 {faqs.map(faq => (
                    <div key={faq.id} className="group glass-panel rounded-[32px] border border-white/10 p-8 hover:shadow-2xl transition-all duration-500">
                       <div className="flex justify-between items-start gap-4 mb-4">
                          <h4 className="text-base font-black text-white tracking-tight leading-snug">{faq.question}</h4>
                          <span className="bg-white/5 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black text-white/40 uppercase tracking-widest">{faq.category || 'General'}</span>
                       </div>
                       <p className="text-sm font-medium text-white/50 leading-relaxed mb-8">{faq.answer}</p>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => openFaqForm(faq)} className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-gradient hover:text-white transition-all">
                             <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteFaq(faq.id)} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminContact;
