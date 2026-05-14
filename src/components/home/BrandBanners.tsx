import { motion } from 'framer-motion';

const brands = [
  { name: 'HP', logo: 'https://www.google.com/s2/favicons?sz=128&domain=hp.com' },
  { name: 'Dell', logo: 'https://www.google.com/s2/favicons?sz=128&domain=dell.com' },
  { name: 'Lenovo', logo: 'https://www.google.com/s2/favicons?sz=128&domain=lenovo.com' },
  { name: 'Asus', logo: 'https://www.google.com/s2/favicons?sz=128&domain=asus.com' },
  { name: 'Acer', logo: 'https://www.google.com/s2/favicons?sz=128&domain=acer.com' },
  { name: 'Logitech', logo: 'https://www.google.com/s2/favicons?sz=128&domain=logitech.com' },
  { name: 'TP-Link', logo: 'https://www.google.com/s2/favicons?sz=128&domain=tp-link.com' },
  { name: 'Intel', logo: 'https://www.google.com/s2/favicons?sz=128&domain=intel.com' },
];

const duplicatedBrands = [...brands, ...brands];

const BrandBanners = () => {
  return (
    <section className="py-12 bg-[#0b121e] overflow-hidden">
      <div className="container mx-auto px-6 mb-10">
        <div className="flex flex-col items-center">
          <h2 className="text-[11px] font-black text-[#007bff] uppercase tracking-[0.4em] mb-3">Our Partners</h2>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter text-center">Authorized Dealer For Top Brands</h3>
          <div className="w-12 h-1 bg-[#007bff] mt-4 rounded-full shadow-[0_0_15px_#007bff]" />
        </div>
      </div>

      <div 
        className="relative w-full" 
        style={{ 
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' 
        }}
      >
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 25,
          }}
          className="flex gap-6 w-max px-6"
        >
          {duplicatedBrands.map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              className="w-[140px] sm:w-[160px] flex-shrink-0 group cursor-pointer"
            >
              <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#007bff]/50 transition-all duration-300 flex items-center justify-center aspect-square shadow-sm hover:shadow-xl hover:-translate-y-1">
                <img 
                   src={brand.logo} 
                   alt={brand.name} 
                   className="w-16 h-16 object-contain group-hover:scale-110 transition-all duration-300"
                   onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     if (!target.src.includes('placehold.co')) {
                       target.src = `https://placehold.co/128x128/ffffff/007bff?text=${brand.name}`;
                     }
                   }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BrandBanners;
