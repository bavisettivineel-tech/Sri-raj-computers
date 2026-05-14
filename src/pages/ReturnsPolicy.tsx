import Header from "@/components/Header";
import Footer from "@/components/home/Footer";
import { RefreshCcw } from "lucide-react";

const ReturnsPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center">
            <RefreshCcw className="w-6 h-6 text-rose-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Returns & Refunds</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-white/70">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Return Eligibility</h2>
            <p>
              We accept returns within 7 days of delivery. To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Non-Returnable Items</h2>
            <p>
              Certain types of items cannot be returned, like perishable goods, custom products (such as special orders or personalized items), and personal care goods. We also do not accept returns for hazardous materials, flammable liquids, or gases.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Refund Process</h2>
            <p>
              Once we receive and inspect your return, we will notify you if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method within 10 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Shipping Costs for Returns</h2>
            <p>
              You will be responsible for paying for your own shipping costs for returning your item unless the product is defective or incorrect. Shipping costs are non-refundable.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnsPolicy;
