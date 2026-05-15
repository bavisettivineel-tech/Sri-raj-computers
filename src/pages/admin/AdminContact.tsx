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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-heading">Support Operations</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage customer communications and global knowledge base.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
           {[ ['messages', 'Messages', MessageSquare], ['faqs', 'FAQs', HelpCircle] ].map(([k, l, Icon]: any) => (
             <button key={k} onClick={() => setTab(k)}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                 tab === k ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'
               }`}>
               <Icon className={`w-4 h-4 ${tab === k ? 'text-white' : 'text-slate-300'}`} /> {l}
             </button>
           ))}
        </div>
      </div>

      {tab === 'messages' && (
        <div className="space-y-8">
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {[ ['all', 'All Messages'], ['unread', 'Unread'], ['resolved', 'Archived'] ].map(([k, l]) => (
              <button key={k} onClick={() => setMsgFilter(k)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  msgFilter === k ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                }`}>
                {l}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMessages.length === 0 ? (
              <div className="lg:col-span-3 bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200">
                <MessageCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">No messages in this filter</p>
              </div>
            ) : filteredMessages.map(msg => (
              <div key={msg.id} className="group bg-white rounded-[40px] shadow-sm border border-slate-200 p-8 flex flex-col hover:shadow-xl transition-all duration-500 relative">
                 <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-primary rounded-2xl flex items-center justify-center font-black text-xl shadow-sm font-heading">
                       {(msg.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${msg.status === 'unread' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                       {msg.status}
                    </span>
                 </div>
                 
                 <h4 className="font-black text-slate-900 text-lg mb-2 tracking-tight font-heading">{msg.name}</h4>
                 <div className="flex flex-col gap-1.5 mb-8">
                    <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Phone className="w-3.5 h-3.5 text-slate-300" /> {msg.phone}</span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Mail className="w-3.5 h-3.5 text-slate-300" /> {msg.email}</span>
                 </div>

                 <div className="bg-slate-50 rounded-2xl p-6 mb-8 flex-1 border border-slate-100">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{msg.message}"</p>
                 </div>

                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <Clock className="w-4 h-4 text-slate-300" /> {new Date(msg.created_at).toLocaleDateString()}
                    </div>
                 </div>

                 <div className="flex gap-3">
                    {msg.status !== 'resolved' && (
                       <button onClick={() => markResolved(msg.id)} className="flex-1 bg-primary text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                          Mark Resolved
                       </button>
                    )}
                    <a href={`https://wa.me/91${msg.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                       className="flex items-center justify-center w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100 shadow-sm">
                       <Phone className="w-5 h-5" />
                    </a>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'faqs' && (
        <div className="max-w-4xl mx-auto pb-20">
          {showFaqForm ? (
            <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-200 space-y-8 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight font-heading">{editingFaq ? 'Edit FAQ' : 'Add FAQ Entry'}</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Global logic dictionary</p>
                  </div>
                  <button onClick={() => setShowFaqForm(false)} className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all shadow-sm border border-slate-200"><X className="w-6 h-6" /></button>
               </div>

               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Question</label>
                 <input value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                    placeholder="e.g. How to track my order?"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" />
               </div>

               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Answer</label>
                 <textarea value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                    placeholder="Provide a clear answer..."
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary min-h-[150px]" />
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
                    <input value={faqForm.category} onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                       placeholder="e.g. Shipping"
                       className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Sort Order</label>
                    <input type="number" value={faqForm.sort_order} onChange={e => setFaqForm({ ...faqForm, sort_order: e.target.value })}
                       className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold" />
                  </div>
               </div>

               <div className="flex gap-4 pt-6">
                  <button onClick={saveFaq} className="flex-[2] bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">Save Entry</button>
                  <button onClick={() => setShowFaqForm(false)} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
               </div>
            </div>
          ) : (
            <div className="space-y-8">
               <button onClick={() => openFaqForm()} className="w-full bg-primary text-white py-5 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
                  <Plus className="w-5 h-5" /> Add New FAQ Entry
               </button>

               <div className="grid grid-cols-1 gap-6">
                  {faqs.map(faq => (
                     <div key={faq.id} className="group bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="flex justify-between items-start gap-4 mb-6">
                           <h4 className="text-lg font-black text-slate-900 tracking-tight leading-snug font-heading">{faq.question}</h4>
                           <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">{faq.category || 'General'}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">{faq.answer}</p>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                           <button onClick={() => openFaqForm(faq)} className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-slate-200">
                              <Edit className="w-4 h-4" />
                           </button>
                           <button onClick={() => deleteFaq(faq.id)} className="w-10 h-10 bg-slate-100 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-slate-200">
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
