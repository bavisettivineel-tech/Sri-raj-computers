import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import WhatsAppButton from '@/components/WhatsAppButton';
import HeroSlider from '@/components/home/HeroSlider';
import { PCComponents, GamingLaptops, GamingAccessories, StaticBanner } from '@/components/home/ShwetaSections';
import Footer from '@/components/home/Footer';
import PopupAds from '@/components/home/PopupAds';
import BrandBanners from '@/components/home/BrandBanners';
import MidBanner from '@/components/home/MidBanner';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const Index = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="app-shell bg-slate-50 min-h-screen">
      <Header />
      <main className="pb-20 lg:pb-0">
        {/* Hero */}
        <HeroSlider />

        {/* Marquee Strip */}
        <div className="bg-white py-3 overflow-hidden whitespace-nowrap border-b border-slate-200 relative z-10">
          <div className="inline-block animate-[scrollLeft_30s_linear_infinite] hover:[animation-play-state:paused] cursor-default">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mx-10">
                🚀 Special Discount on Gaming Laptops • Free Delivery over ₹999 • Genuine Spares & Service • CCTV Installation Support • 100% Quality Assurance
              </span>
            ))}
          </div>
        </div>

        {/* Section 1: PC Components */}
        <PCComponents />

        {/* Section 2: Built to Conquer Banner */}
        <MidBanner />

        {/* Section 3: Gaming Laptops */}
        <GamingLaptops />

        {/* Section 4: Level Up Banner (Placeholder) */}
        <StaticBanner img="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80" />

        {/* Section 5: Gaming Accessories */}
        <GamingAccessories />

        {/* Section 6: Brand Banners */}
        <BrandBanners />

        {/* Footer */}
        <Footer />
      </main>

      <PopupAds />

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          id="scroll-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          style={{ position: 'fixed', bottom: '84px', left: '16px', width: '42px', height: '42px', borderRadius: '50%', background: '#007bff', border: '2px solid rgba(0,123,255,0.5)', boxShadow: '0 0 20px rgba(0,123,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 30, animation: 'fadeIn 0.3s ease', transition: 'all 0.3s' }}
          className="lg:bottom-6 lg:left-6"
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 30px rgba(0,123,255,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(0,123,255,0.4)')}
        >
          <ArrowUp style={{ width: '18px', height: '18px', color: 'white' }} />
        </button>
      )}

      <WhatsAppButton />
      <BottomNav />
    </div>
  );
};

export default Index;
