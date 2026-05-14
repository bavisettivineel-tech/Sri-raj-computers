import Header from "@/components/Header";
import Footer from "@/components/home/Footer";
import { Truck } from "lucide-react";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
            <Truck className="w-6 h-6 text-green-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Shipping Policy</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-white/70">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Shipping Coverage</h2>
            <p>
              Sri Raj Computers (SRC) delivers to all major locations across India. We use reliable courier partners to ensure your products reach you safely and on time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Shipping Charges</h2>
            <p>
              - Standard shipping is FREE on orders above ₹999.
              <br />
              - For orders below ₹999, a flat shipping fee of ₹99 is applicable.
              <br />
              - Shipping charges are calculated at the time of checkout.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Delivery Timeline</h2>
            <p>
              - Orders are typically processed within 1-2 business days.
              <br />
              - Delivery usually takes 3-7 business days depending on the destination.
              <br />
              - During peak seasons or sales, there might be slight delays.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Order Tracking</h2>
            <p>
              Once your order is shipped, you will receive a tracking number via email or SMS. You can also track your order directly on our website through the "Track Order" page in your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Damaged Shipments</h2>
            <p>
              If you receive a package that is visibly damaged, please do not accept it or record a video while unboxing. Contact our customer care immediately at +91 99499 15177 with your order details.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
