import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
}

const PopupAds = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchPopups = async () => {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('type', 'popup')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (data && data[0]) {
        // Only show if not dismissed in this session
        const dismissed = sessionStorage.getItem(`dismissed_popup_${data[0].id}`);
        if (!dismissed) {
          setBanner(data[0]);
          setTimeout(() => setShow(true), 1500);
        }
      }
    };
    fetchPopups();
  }, []);

  const close = () => {
    setShow(false);
    if (banner) sessionStorage.setItem(`dismissed_popup_${banner.id}`, 'true');
  };

  if (!banner || !show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
        <button 
          onClick={close}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="aspect-[4/5] relative">
          <img 
            src={banner.image_url} 
            alt={banner.title || ''} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {(banner.title || banner.subtitle) && (
          <div className="p-6 text-center">
            {banner.title && <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{banner.title}</h3>}
            {banner.subtitle && <p className="text-sm font-medium text-slate-500 mb-6">{banner.subtitle}</p>}
            
            {banner.button_link && (
              <a 
                href={banner.button_link}
                className="block w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
                onClick={close}
              >
                {banner.button_text || 'Shop Now'}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupAds;
