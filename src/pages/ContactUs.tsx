import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/home/Footer";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ContactUs = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Side: Contact Info */}
          <div>
            <h1 className="text-5xl font-black mb-6 tracking-tight">Get in <span className="text-blue-500">Touch</span></h1>
            <p className="text-white/60 text-lg mb-10">
              Have a question about a product, order, or service? Our team is here to help you.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Our Location</h3>
                  <p className="text-white/60">Sri Raj Computers, Main Road, Peddapuram, East Godavari, AP — 533437</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Call Us</h3>
                  <p className="text-white/60">+91 99499 15177</p>
                  <p className="text-white/60">+91 97041 37266</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Email Us</h3>
                  <p className="text-white/60">srirajcomputers@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold">Message Sent!</h2>
                <p className="text-white/60">Thank you for reaching out. We'll contact you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-blue-400 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Email Address</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                      placeholder="Email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;
