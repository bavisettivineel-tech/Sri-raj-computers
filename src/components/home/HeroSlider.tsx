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
    <div style={{ margin: '0', height: 'clamp(240px,42vw,480px)', background: 'rgba(124, 58, 237, 0.04)', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, rgba(124, 58, 237, 0.03) 25%, rgba(124, 58, 237, 0.08) 50%, rgba(124, 58, 237, 0.03) 75%)' }} />
  );

  const b = banners[current];
  const accent = b.accentColor || b.accent || '#7C3AED';
  const isBydmBanner = b.image_url?.includes('BYDM_6.png');

  return (
    <div id="hero-slider" style={{ position: 'relative', overflow: 'hidden', background: '#FFFFFF' }}>
      {/* Main Slide */}
      <div
        key={current}
        style={{
          height: 'clamp(240px,42vw,480px)',
          background: b.bg || b.gradient || `linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.6s ease',
        }}
      >
        {/* BG Image */}
        {b.image_url && (
          <>
            <img 
              src={b.image_url} 
              alt="" 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('placehold.co')) {
                  target.src = 'https://placehold.co/1600x600/7C3AED/white?text=Power+Performance+Precision';
                }
              }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(30, 27, 75, 0.9) 50%, rgba(30, 27, 75, 0.3))' }} />
          </>
        )}

        {/* Decorative glow orb */}
        <div style={{ position: 'absolute', right: '-5%', top: '50%', transform: 'translateY(-50%)', width: 'clamp(200px,35vw,380px)', height: 'clamp(200px,35vw,380px)', borderRadius: '50%', background: `radial-gradient(circle, ${accent}25 0%, transparent 70%)`, filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '-5%', bottom: '-20%', width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)`, filter: 'blur(40px)', pointerEvents: 'none' }} />

        {/* Grid pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(124, 58, 237, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 1) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />

        {/* Content */}
        {b.title && !isBydmBanner && (
          <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(24px,5vw,64px)', maxWidth: '700px' }} className="animate-slide-in-up">
            {b.tag && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${accent}20`, border: `1px solid ${accent}60`, borderRadius: '20px', padding: '5px 14px', marginBottom: '16px', boxShadow: `0 0 15px ${accent}30` }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: accent, letterSpacing: '1px', textTransform: 'uppercase' }}>{b.tag}</span>
              </div>
            )}
            <h1 style={{ fontSize: 'clamp(22px,4.5vw,52px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '14px', letterSpacing: '-0.5px', textShadow: '0 2px 20px rgba(0,0,0,0.5)', fontFamily: 'Space Grotesk, sans-serif' }}>
              {b.title}
            </h1>
            {b.subtitle && (
              <p style={{ fontSize: 'clamp(13px,2vw,18px)', color: 'rgba(255,255,255,0.7)', marginBottom: '28px', fontWeight: 500, lineHeight: 1.6 }}>
                {b.subtitle}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(b.button_link || '/shop')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, #F59E0B, #FBBF24)', color: '#1E1B4B', padding: 'clamp(10px,2vw,14px) clamp(20px,3vw,32px)', borderRadius: '8px', fontSize: 'clamp(13px,1.5vw,16px)', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(245,158,11,0.4)', transition: 'all 0.3s', fontFamily: 'Space Grotesk, sans-serif' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 30px rgba(245,158,11,0.6)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(245,158,11,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {b.button_text || b.cta || 'Shop Now'}
              </button>
              <button
                onClick={() => navigate('/shop')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: 'white', padding: 'clamp(10px,2vw,14px) clamp(20px,3vw,32px)', borderRadius: '8px', fontSize: 'clamp(13px,1.5vw,16px)', fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.3s', fontFamily: 'Space Grotesk, sans-serif' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}>
                View All Products
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={() => setCurrent(p => (p - 1 + banners.length) % banners.length)}
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.3s', color: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#7C3AED'; e.currentTarget.style.borderColor = '#7C3AED'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
            <ChevronLeft style={{ width: '18px', height: '18px' }} />
          </button>
          <button onClick={() => setCurrent(p => (p + 1) % banners.length)}
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.3s', color: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#7C3AED'; e.currentTarget.style.borderColor = '#7C3AED'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
            <ChevronRight style={{ width: '18px', height: '18px' }} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              style={{ height: '4px', width: i === current ? '30px' : '8px', borderRadius: '2px', background: i === current ? '#7C3AED' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.35s ease', boxShadow: i === current ? '0 0 10px #7C3AED' : 'none' }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
