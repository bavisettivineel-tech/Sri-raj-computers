import Header from "@/components/Header";
import Footer from "@/components/home/Footer";
import { FileText } from "lucide-react";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Terms & Conditions</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-white/70">
          <p>
            By accessing or using the Sri Raj Computers (SRC) website, you agree to be bound by these Terms and Conditions.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Use of the Website</h2>
            <p>
              You must be at least 18 years old or visiting under the supervision of a parent or guardian to use this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Product Information</h2>
            <p>
              We attempt to be as accurate as possible with product descriptions. However, SRC does not warrant that product descriptions or other content are 100% accurate, complete, or error-free. If a product offered by SRC is not as described, your sole remedy is to return it in unused condition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Pricing and Payments</h2>
            <p>
              All prices are listed in Indian Rupees (INR). We reserve the right to change prices without notice. Payments are processed securely via our payment gateway partner, Razorpay.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Limitation of Liability</h2>
            <p>
              SRC shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or for the cost of procurement of substitute goods.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Andhra Pradesh.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;
