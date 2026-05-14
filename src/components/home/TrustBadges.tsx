import { Truck, ShieldCheck, Tag, Headphones, RotateCcw, Zap } from 'lucide-react';

const badges = [
  { icon: Truck,        title: 'Free Delivery',    subtitle: 'On all orders pan India', color: '#7C3AED' },
  { icon: ShieldCheck,  title: 'Secure Payment',   subtitle: '100% safe transactions',  color: '#10B981' },
  { icon: Tag,          title: 'Best Prices',       subtitle: 'Lowest price guaranteed', color: '#F59E0B' },
  { icon: Headphones,   title: '24/7 Support',      subtitle: 'Always here to help',     color: '#7C3AED' },
  { icon: RotateCcw,    title: 'Easy Returns',      subtitle: '7-day hassle-free return', color: '#EF4444' },
  { icon: Zap,          title: 'Fast Dispatch',     subtitle: 'Same day shipping',        color: '#7C3AED' },
];

const TrustBadges = () => (
  <section id="trust-badges-section" style={{ background: '#FFFFFF', borderTop: '1px solid rgba(124, 58, 237, 0.12)', borderBottom: '1px solid rgba(124, 58, 237, 0.12)', margin: '16px 0 0' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0', borderLeft: '1px solid rgba(124, 58, 237, 0.08)' }}
      className="sm:grid-cols-3 lg:grid-cols-6">
      <style>{`
        @media (min-width:640px) { #trust-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (min-width:1024px) { #trust-grid { grid-template-columns: repeat(6,1fr) !important; } }
      `}</style>
      <div id="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gridColumn: '1/-1' }}>
        {badges.map((b, i) => (
          <div
            key={b.title}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderRight: '1px solid rgba(124, 58, 237, 0.08)', borderBottom: i < badges.length - 2 ? '1px solid rgba(124, 58, 237, 0.08)' : 'none', transition: 'all 0.3s', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${b.color}15`, border: `1px solid ${b.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <b.icon style={{ width: '18px', height: '18px', color: b.color }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#1E1B4B', lineHeight: 1.2, fontFamily: 'Space Grotesk, sans-serif' }}>{b.title}</p>
              <p style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>{b.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBadges;
