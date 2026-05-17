import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const fallbackBanners = [
  {
    title: 'POWER, PERFORMANCE, PRECISION',
    subtitle: 'Get the best gaming experience with BYDM',
    tag: 'BYDM SPECIAL',
    cta: 'Build Your PC',
    image_url: 'https://cdn.shopify.com/s/files/1/0832/3039/2605/files/BYDM_6.png?v=1711617478',
    bg: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #C026D3 100%)',
    accent: '#F59E0B',
  },
  {
    title: 'HP & Canon Toners',
    subtitle: 'Up to 40% OFF on Original Printer Cartridges',
    tag: 'HOT DEAL',
    cta: 'Shop Toners',
    image_url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=1600&auto=format&fit=crop&q=80',
    bg: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
    accent: '#F59E0B',
  },
  {
    title: 'Gaming Laptops & PCs',
    subtitle: 'Latest Dell, HP, Lenovo — EMI Available',
    tag: 'NEW ARRIVALS',
    cta: 'Shop Laptops',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
    bg: 'linear-gradient(135deg, #9333EA 0%, #C026D3 100%)',
    accent: '#F59E0B',
  },
  // Custom ad slides from user
  {
    title: 'Ad Slide 1',
    subtitle: '',
    tag: '',
    cta: '',
    image_url: 'https://res.cloudinary.com/dojckkkkm/image/upload/v1776943103/Screenshot_381_iddafo.png',
    bg: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    accent: '#F59E0B',
  },
  {
    title: 'Ad Slide 2',
    subtitle: '',
    tag: '',
    cta: '',
    image_url: 'https://res.cloudinary.com/dojckkkkm/image/upload/v1776943103/Screenshot_382_cs6tee.png',
    bg: 'linear-gradient(135deg, #5B21B6 0%, #1E1B4B 100%)',
    accent: '#F59E0B',
  },
];

interface Banner {
  id?: string;
  title?: string;
  subtitle?: string;
  tag?: string;
  cta?: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  bg?: string;
  accent?: string;
  gradient?: string;
  accentColor?: string;
  sort_order?: number;
}

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from('banners').select('*').eq('type', 'hero').eq('is_active', true).order('sort_order');
      setBanners(data && data.length > 0 ? data : fallbackBanners);
      setLoading(false);
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (loading) return (
    <div style={{ width: '100%', maxWidth: '1312px', margin: '0 auto', aspectRatio: '1312 / 670', background: 'rgba(124, 58, 237, 0.04)', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, rgba(124, 58, 237, 0.03) 25%, rgba(124, 58, 237, 0.08) 50%, rgba(124, 58, 237, 0.03) 75%)' }} />
  );

  const b = banners[current];

  return (
    <div id="hero-slider" style={{ position: 'relative', overflow: 'hidden', background: '#FFFFFF', width: '100%', maxWidth: '1312px', margin: '0 auto' }}>
      {/* Main Slide */}
      <div
        key={current}
        style={{
          width: '100%',
          aspectRatio: '1312 / 670',
          background: b.bg || b.gradient || `linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.6s ease',
        }}
      >
        {/* BG Image */}
        {b.image_url && (
          <img 
            src={b.image_url} 
            alt="" 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('placehold.co')) {
                target.src = 'https://placehold.co/1312x670/7C3AED/white?text=Special+Offers';
              }
            }}
          />
        )}

        {/* Content - Only Shop Now Button */}
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', zIndex: 10 }}>
          <style>{`
            .hero-cta {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: #F59E0B;
              color: #1E1B4B;
              padding: 12px 32px;
              border-radius: 4px;
              font-size: 16px;
              font-weight: 800;
              border: none;
              cursor: pointer;
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
              transition: all 0.3s;
              font-family: 'Space Grotesk', sans-serif;
              text-transform: uppercase;
              white-space: nowrap;
            }
            @media (max-width: 768px) {
              .hero-cta {
                padding: 6px 16px;
                font-size: 10px;
                gap: 4px;
                border-radius: 3px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              }
            }
          `}</style>
          <button
            onClick={() => navigate(b.button_link || '/shop')}
            className="hero-cta"
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'; }}>
            Shop Now
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={() => setCurrent(p => (p - 1 + banners.length) % banners.length)}
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.3s', color: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#7C3AED'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; }}>
            <ChevronLeft style={{ width: '20px', height: '20px' }} />
          </button>
          <button onClick={() => setCurrent(p => (p + 1) % banners.length)}
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.3s', color: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#7C3AED'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; }}>
            <ChevronRight style={{ width: '20px', height: '20px' }} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              style={{ height: '4px', width: i === current ? '24px' : '8px', borderRadius: '2px', background: i === current ? '#F59E0B' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
