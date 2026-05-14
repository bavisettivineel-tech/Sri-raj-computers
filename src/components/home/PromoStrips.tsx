import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  button_link?: string;
}

const PromoStrips = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('type', 'promo')
        .eq('is_active', true)
        .order('sort_order');
      
      if (data) setBanners(data);
    };
    fetchBanners();
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="px-4 py-4 space-y-4">
      {banners.map(banner => (
        <div 
          key={banner.id}
          onClick={() => banner.button_link && navigate(banner.button_link)}
          className="relative h-32 md:h-40 rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:scale-[1.01] transition-all"
        >
          <img 
            src={banner.image_url} 
            alt={banner.title || ''} 
            className="w-full h-full object-cover"
          />
          {(banner.title || banner.subtitle) && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex flex-col justify-center px-6">
              {banner.title && <h3 className="text-[#1E1B4B] font-black text-lg md:text-xl leading-tight font-heading">{banner.title}</h3>}
              {banner.subtitle && <p className="text-[#7C3AED] text-xs md:text-sm font-bold uppercase tracking-wider">{banner.subtitle}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PromoStrips;
