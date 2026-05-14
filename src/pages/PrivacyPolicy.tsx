import Header from "@/components/Header";
import Footer from "@/components/home/Footer";
import { ShieldCheck } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-white/70">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to Sri Raj Computers (SRC). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identity Data: Name, username or similar identifier.</li>
              <li>Contact Data: Billing address, delivery address, email address and telephone numbers.</li>
              <li>Financial Data: Payment card details (processed securely via Razorpay).</li>
              <li>Transaction Data: Details about payments to and from you and other details of products you have purchased from us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To register you as a new customer.</li>
              <li>To process and deliver your order.</li>
              <li>To manage our relationship with you.</li>
              <li>To improve our website, products/services, marketing or customer relationships.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
              <br />
              Email: srirajcomputers@gmail.com
              <br />
              Phone: +91 99499 15177
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
