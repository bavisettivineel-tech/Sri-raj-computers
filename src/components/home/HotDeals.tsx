import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { getDiscount, getProductImage } from '@/types/product';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { Flame, ShoppingCart, Clock } from 'lucide-react';

const HotDeals = () => {
  const { data: products = [] } = useProducts();
  const { addToCart } = useStore();
  const navigate = useNavigate();

  const dealEnd = new Date();
  dealEnd.setDate(dealEnd.getDate() + 3);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = dealEnd.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days:  Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins:  Math.floor((diff / (1000 * 60)) % 60),
        secs:  Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dealProducts = products.filter(p => getDiscount(p) >= 5).slice(0, 6);
  if (dealProducts.length === 0) return null;

  const timerUnits = [
    { label: 'Days',  value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins',  value: timeLeft.mins },
    { label: 'Secs',  value: timeLeft.secs },
  ];

  return (
    <section id="hot-deals-section" style={{ background: '#000b1d', padding: '4px 16px 8px' }}
      className="md:px-6 lg:px-8 xl:px-16">

      {/* Container */}
      <div style={{ background: '#0b1629', border: '1px solid rgba(0,123,255,0.25)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>

        {/* Header strip */}
        <div style={{ background: 'linear-gradient(90deg, #dc3545 0%, #c82333 100%)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame style={{ width: '22px', height: '22px', color: 'white' }} />
            <span style={{ fontWeight: 900, color: 'white', fontSize: 'clamp(16px,3vw,22px)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
              Hot Deals
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', fontWeight: 800, letterSpacing: '1px' }}>
              LIMITED TIME
            </span>
          </div>

          {/* Countdown Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.7)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginRight: '4px' }}>Ends in:</span>
            {timerUnits.map((unit, idx) => (
              <div key={unit.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', width: 'clamp(36px,5vw,48px)', height: 'clamp(36px,5vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(14px,2.5vw,20px)', fontWeight: 800, color: 'white', fontFamily: 'Montserrat, sans-serif' }}>
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', marginTop: '2px', fontWeight: 700, textTransform: 'uppercase' }}>{unit.label}</div>
                </div>
                {idx < 3 && <span style={{ color: 'white', fontWeight: 900, fontSize: '18px', marginBottom: '12px' }}>:</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}
          className="md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          <style>{`
            @media (min-width: 768px) { #hot-deals-grid { grid-template-columns: repeat(3,1fr) !important; } }
            @media (min-width: 1024px) { #hot-deals-grid { grid-template-columns: repeat(5,1fr) !important; } }
          `}</style>
          <div id="hot-deals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', gridColumn: '1/-1' }}>
            {dealProducts.map(p => {
              const disc = getDiscount(p);
              return (
                <div
                  key={p.id}
                  style={{ background: '#050d1f', border: '1px solid rgba(0,123,255,0.18)', borderRadius: '10px', padding: '12px', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', display: 'flex', flexDirection: 'column' }}
                  onClick={() => navigate(`/product/${p.id}`)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,123,255,0.6)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,123,255,0.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,123,255,0.18)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* Discount badge */}
                  {disc > 0 && (
                    <span style={{ display: 'inline-block', background: '#dc3545', color: 'white', borderRadius: '4px', padding: '2px 7px', fontSize: '10px', fontWeight: 800, marginBottom: '8px', alignSelf: 'flex-start', fontFamily: 'Montserrat, sans-serif' }}>
                      -{disc}% OFF
                    </span>
                  )}

                  {/* Image */}
                  <div style={{ background: '#0b1629', borderRadius: '8px', padding: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'clamp(80px,12vw,110px)' }}>
                    <img src={getProductImage(p)} alt={p.name} style={{ objectFit: 'contain', height: '100%', width: '100%' }}
                      onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/90x90/0b1629/007bff?text=Product'; }} />
                  </div>

                  {/* Name */}
                  <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', lineHeight: 1.4, marginBottom: '8px' }}>
                    {p.name}
                  </p>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '10px', flexWrap: 'wrap', marginTop: 'auto' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#007bff', textShadow: '0 0 8px rgba(0,123,255,0.4)' }}>
                      ₹{p.sale_price.toLocaleString('en-IN')}
                    </span>
                    {p.mrp > p.sale_price && (
                      <span style={{ fontSize: '10px', color: '#475569', textDecoration: 'line-through' }}>
                        ₹{p.mrp.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <button
                    id={`hot-deal-add-${p.id}`}
                    onClick={e => { e.stopPropagation(); addToCart(p, 1); }}
                    style={{ width: '100%', background: '#ffc107', color: '#000', border: 'none', borderRadius: '6px', padding: '7px 0', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.2s', fontFamily: 'Montserrat, sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e0a800'; e.currentTarget.style.boxShadow = '0 0 12px rgba(255,193,7,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ffc107'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <ShoppingCart style={{ width: '12px', height: '12px' }} />
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotDeals;
