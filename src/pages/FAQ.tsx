import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/home/Footer";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const { data, error } = await supabase
          .from("faqs")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        setFaqs(data || []);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const defaultFaqs = [
    {
      id: "1",
      question: "What products do you sell?",
      answer: "We sell a wide range of IT products including Laptops, Desktops, CCTV Cameras, Printers, Toners, and various Computer Peripherals."
    },
    {
      id: "2",
      question: "Do you provide installation services?",
      answer: "Yes, we provide professional installation services for CCTV systems and networking equipment in and around Peddapuram."
    },
    {
      id: "3",
      question: "How can I track my order?",
      answer: "You can track your order by going to the 'Track Order' page and entering your order ID or by visiting your 'My Account' section."
    },
    {
      id: "4",
      question: "What is your return policy?",
      answer: "We accept returns for defective products within 7 days of delivery. Please ensure the product is in its original packaging."
    }
  ];

  const displayedFaqs = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Frequently Asked Questions</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedFaqs.map((faq) => (
              <div 
                key={faq.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02]"
                >
                  <span className="font-bold text-lg">{faq.question}</span>
                  {openId === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-white/50" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/50" />
                  )}
                </button>
                {openId === faq.id && (
                  <div className="px-6 pb-5 text-white/60 leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;
