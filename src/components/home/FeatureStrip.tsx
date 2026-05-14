import { Truck, ShieldCheck, Zap, Headphones } from 'lucide-react';

const FeatureStrip = () => {
  const features = [
    { icon: <Truck className="w-8 h-8 text-[#007bff]" />, title: 'Free Delivery', sub: 'PAN India' },
    { icon: <ShieldCheck className="w-8 h-8 text-[#007bff]" />, title: 'Secure Payment', sub: '100% Trust Worthy' },
    { icon: <Zap className="w-8 h-8 text-[#007bff]" />, title: 'Best Discounts', sub: 'On All Products' },
    { icon: <Headphones className="w-8 h-8 text-[#007bff]" />, title: 'Customer Support', sub: 'Dedicated Team' },
  ];

  return (
    <section className="bg-white py-8 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-4 group cursor-default">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{f.title}</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureStrip;
