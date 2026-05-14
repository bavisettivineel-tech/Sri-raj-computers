import { useCategories } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// High-quality category image map — overrides any incorrect DB image_url
const categoryImageMap: Record<string, string> = {
  'monitor':        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=120&auto=format&fit=crop&q=80',
  'monitors':       'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=120&auto=format&fit=crop&q=80',
  'cabinet':        'https://shwetacomputers.com/cdn/shop/collections/1_6d89113d-f730-4ffd-b767-48838256f623.webp?v=1722173204',
  'motherboard':    'https://shwetacomputers.com/cdn/shop/collections/2_4af50eda-28c4-469b-8e80-f96909a44d5a.webp?v=1722171397',
  'motherboards':   'https://shwetacomputers.com/cdn/shop/collections/2_4af50eda-28c4-469b-8e80-f96909a44d5a.webp?v=1722171397',
  'processor':      'https://shwetacomputers.com/cdn/shop/collections/61oDBiX7OWL.webp?v=1722173573',
  'processors':     'https://shwetacomputers.com/cdn/shop/collections/61oDBiX7OWL.webp?v=1722173573',
  'ram':            'https://shwetacomputers.com/cdn/shop/collections/2_18ff46f1-2250-460f-8ce4-7108ec3edd21.webp?v=1722173997',
  'ssd':            'https://shwetacomputers.com/cdn/shop/collections/3_ce1c85d6-4f0c-44be-bc3f-8d13fe76989f.webp?v=1722173743',
  'hdd':            'https://shwetacomputers.com/cdn/shop/collections/3_64221bc5-4608-438b-af02-ced7357e4b18.webp?v=1722172044',
  'graphics card':  'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=120&auto=format&fit=crop&q=80',
  'graphics cards': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=120&auto=format&fit=crop&q=80',
  'gpu':            'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=120&auto=format&fit=crop&q=80',
  'air cooler':     'https://shwetacomputers.com/cdn/shop/collections/3_940x_f33020bb-4a20-4808-92e4-0be7c5f4a177.webp?v=1721731078',
  'air coolers':    'https://shwetacomputers.com/cdn/shop/collections/3_940x_f33020bb-4a20-4808-92e4-0be7c5f4a177.webp?v=1721731078',
  'cabinet fans':   'https://shwetacomputers.com/cdn/shop/collections/2_37446bef-eb05-4afc-8b14-29e26a9abc60.webp?v=1722173683',
  'liquid cooler':  'https://shwetacomputers.com/cdn/shop/collections/2_0c35221d-b8b7-42bc-bb42-78ded2d58b5b.webp?v=1722173832',
  'liquid coolers': 'https://shwetacomputers.com/cdn/shop/collections/2_0c35221d-b8b7-42bc-bb42-78ded2d58b5b.webp?v=1722173832',
  'power supply':   'https://shwetacomputers.com/cdn/shop/collections/1_95b4af1a-0ace-4c47-9755-99456c239e6e.webp?v=1722172518',
  'gaming laptop':  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=120&auto=format&fit=crop&q=80',
  'gaming laptops': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=120&auto=format&fit=crop&q=80',
  'laptop':         'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=120&auto=format&fit=crop&q=80',
  'laptops':        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=120&auto=format&fit=crop&q=80',
  'keyboard':       'https://shwetacomputers.com/cdn/shop/collections/1_533x_bb485f83-162c-4efd-b8cd-aae9d78a3211.webp?v=1722171638',
  'keyboards':      'https://shwetacomputers.com/cdn/shop/collections/1_533x_bb485f83-162c-4efd-b8cd-aae9d78a3211.webp?v=1722171638',
  'mouse':          'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=120&auto=format&fit=crop&q=80',
  'mouse pad':      'https://shwetacomputers.com/cdn/shop/collections/3_adaa8281-9720-4979-a988-3132c7ebad95.webp?v=1722171480',
  'mouse pads':     'https://shwetacomputers.com/cdn/shop/collections/3_adaa8281-9720-4979-a988-3132c7ebad95.webp?v=1722171480',
  'gaming chair':   'https://shwetacomputers.com/cdn/shop/collections/1_aa99e037-d7f1-4058-a6cc-df60b2ec6c4e.webp?v=1722171945',
  'gaming chairs':  'https://shwetacomputers.com/cdn/shop/collections/1_aa99e037-d7f1-4058-a6cc-df60b2ec6c4e.webp?v=1722171945',
  'headphone':      'https://shwetacomputers.com/cdn/shop/collections/4_f2ba3871-73e6-4b63-bcb9-a3054247deab.webp?v=1722173273',
  'headphones':     'https://shwetacomputers.com/cdn/shop/collections/4_f2ba3871-73e6-4b63-bcb9-a3054247deab.webp?v=1722173273',
  'microphone':     'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=120&auto=format&fit=crop&q=80',
  'microphones':    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=120&auto=format&fit=crop&q=80',
  'printer':        'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=120&auto=format&fit=crop&q=80',
  'printers':       'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=120&auto=format&fit=crop&q=80',
  'cctv':           'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=120&auto=format&fit=crop&q=80',
  'networking':     'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120&auto=format&fit=crop&q=80',
  'router':         'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120&auto=format&fit=crop&q=80',
  'routers':        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120&auto=format&fit=crop&q=80',
  'power bank':     'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=120&auto=format&fit=crop&q=80',
  'power banks':    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=120&auto=format&fit=crop&q=80',
  'powerbank':      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=120&auto=format&fit=crop&q=80',
  'powerbanks':     'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=120&auto=format&fit=crop&q=80',
  'cable':          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&auto=format&fit=crop&q=80',
  'cables':         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&auto=format&fit=crop&q=80',
  'selfie stick':   'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=120&auto=format&fit=crop&q=80',
  'game controller':'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=120&auto=format&fit=crop&q=80',
  'game controllers':'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=120&auto=format&fit=crop&q=80',
  'prebuilt pc':    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=120&auto=format&fit=crop&q=80',
  'ups':            'https://images.unsplash.com/photo-1609902726285-00668009f004?w=120&auto=format&fit=crop&q=80',
  'webcam':         'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=120&auto=format&fit=crop&q=80',
  'webcams':        'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=120&auto=format&fit=crop&q=80',
  'speaker':        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=120&auto=format&fit=crop&q=80',
  'speakers':       'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=120&auto=format&fit=crop&q=80',
  'thermal paste':  'https://images.unsplash.com/photo-1555617117-08a7aa0d8f61?w=120&auto=format&fit=crop&q=80',
  'thermal':        'https://images.unsplash.com/photo-1555617117-08a7aa0d8f61?w=120&auto=format&fit=crop&q=80',
  'accessories':    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&auto=format&fit=crop&q=80',
  'laptop stand':   'https://images.unsplash.com/photo-1593642532559-0c6d3fc62b89?w=120&auto=format&fit=crop&q=80',
  'laptop stands':  'https://images.unsplash.com/photo-1593642532559-0c6d3fc62b89?w=120&auto=format&fit=crop&q=80',
  'cooling stand':  'https://images.unsplash.com/photo-1593642532559-0c6d3fc62b89?w=120&auto=format&fit=crop&q=80',
  'earphone':       'https://images.unsplash.com/photo-1606400082777-ef05f3c5cde2?w=120&auto=format&fit=crop&q=80',
  'earphones':      'https://images.unsplash.com/photo-1606400082777-ef05f3c5cde2?w=120&auto=format&fit=crop&q=80',
  'converter':      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&auto=format&fit=crop&q=80',
  'converters':     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&auto=format&fit=crop&q=80',
  'adapter':        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&auto=format&fit=crop&q=80',
  'adapters':       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&auto=format&fit=crop&q=80',
  'toner':          'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=120&auto=format&fit=crop&q=80',
  'toners':         'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=120&auto=format&fit=crop&q=80',
  'peripherals':    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&auto=format&fit=crop&q=80',
};

const MegaMenu = ({ isOpen, onClose }: MegaMenuProps) => {
  const { data: categories = [] } = useCategories();
  const navigate = useNavigate();

  const handleCategoryClick = (id: string) => {
    navigate(`/shop?category=${id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-[80px] left-0 right-0 bg-white border-b border-[#7C3AED]/30 shadow-[0_20px_50px_rgba(124, 58, 237, 0.1)] z-[120] max-h-[85vh] overflow-y-auto"
          >
            <div className="container mx-auto px-6 py-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-[#1E1B4B] uppercase tracking-tighter flex items-center gap-3 font-heading">
                  <span className="w-2 h-8 bg-[#F59E0B] rounded-full shadow-[0_0_15px_#F59E0B]" />
                  Explore Sri Raj Collections
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#a0a0a0] hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {categories.map((cat) => (
                  <div 
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="group cursor-pointer p-4 rounded-2xl border border-[#7C3AED]/10 bg-white hover:bg-[#7C3AED]/5 hover:border-[#7C3AED]/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-[#F5F3FF] flex items-center justify-center group-hover:bg-[#7C3AED]/20 transition-colors">
                        <img 
                          src={categoryImageMap[cat.name.toLowerCase()] || cat.image_url || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=50&h=50&fit=crop'} 
                          alt={cat.name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1E1B4B] group-hover:text-[#7C3AED] transition-colors line-clamp-1 font-heading">{cat.name}</h3>
                        <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-semibold">Starting from ₹999</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold uppercase tracking-wider">Explore All</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Brands Strip at bottom of Mega Menu */}
              <div className="mt-12 pt-8 border-t border-[#7C3AED]/10">
                <p className="text-xs font-black text-[#6B7280] uppercase tracking-[0.2em] mb-6 text-center">Top Brands We Carry</p>
                <div className="flex flex-wrap justify-center gap-10">
                  {[
                    { name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg' },
                    { name: 'Dell', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg' },
                    { name: 'Lenovo', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg' },
                    { name: 'Asus', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg' },
                    { name: 'Acer', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Acer_2011.svg' },
                  ].map(brand => (
                    <div key={brand.name} className="group/brand cursor-pointer">
                      <img 
                        src={brand.logo} 
                        alt={brand.name} 
                        className="h-8 object-contain opacity-40 grayscale group-hover/brand:opacity-100 group-hover/brand:grayscale-0 transition-all"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://logo.clearbit.com/${brand.name.toLowerCase()}.com`; }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MegaMenu;
