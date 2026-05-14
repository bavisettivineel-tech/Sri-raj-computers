import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Phone, Mail, Facebook, Instagram, Youtube, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store/useStore';

const WA_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Footer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setAuthOpen } = useStore();
  const { data: categories = [] } = useCategories();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const toggle = (title: string) => setOpenSection(openSection === title ? null : title);

  const footerSections = [
    {
      title: 'QUICK LINKS',
      items: [
        { label: 'Home', path: '/' },
        { label: 'Shop All Products', path: '/shop' },
        { label: 'My Account', path: '/account' },
        { label: 'Track My Order', path: '/account' },
        { label: 'Returns & Refunds', path: '/returns-refunds' },
        { label: 'Contact Us', path: '/contact' },
      ],
    },
    {
      title: 'CATEGORIES',
      items: categories.slice(0, 7).map(cat => ({
        label: cat.name,
        path: `/shop?category=${cat.id}`,
      })),
    },
    {
      title: 'CUSTOMER CARE',
      items: [
        { label: 'FAQ', path: '/faq' },
        { label: 'Shipping Policy', path: '/shipping-policy' },
        { label: 'Privacy Policy', path: '/privacy-policy' },
        { label: 'Terms & Conditions', path: '/terms-conditions' },
        { label: 'Returns Policy', path: '/returns-refunds' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Facebook style={{ width: '16px', height: '16px' }} />, color: '#1877f2', href: 'https://facebook.com', label: 'Facebook' },
    { icon: <Instagram style={{ width: '16px', height: '16px' }} />, color: '#e4405f', href: 'https://instagram.com', label: 'Instagram' },
    { icon: <Youtube style={{ width: '16px', height: '16px' }} />, color: '#ff0000', href: 'https://youtube.com', label: 'YouTube' },
    { icon: WA_SVG, color: '#25D366', href: 'https://wa.me/919849004511', label: 'WhatsApp' },
  ];

  return (
    <footer id="site-footer">
      {/* ── MARQUEE STRIP ── */}
      <div className="marquee-strip">
        <div className="marquee-inner">
          {Array(2).fill([
            'Free Delivery Pan India',
            'Same Day Dispatch',
            '100% Secure Payments',
            'Genuine Products Only',
            'Expert Technical Support',
            'EMI Available',
            'Best Prices Guaranteed',
          ].join('  •  ')).join('  •  ')}
        </div>
      </div>

      {/* ── NEWSLETTER BANNER ── */}
      <div style={{ background: '#FFFFFF', borderTop: '1px solid #DDD6FE', borderBottom: '1px solid #DDD6FE', padding: '48px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.08)', border: '1.5px solid rgba(124, 58, 237, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send style={{ width: '20px', height: '20px', color: '#7C3AED' }} />
              </div>
              <h3 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>
                Join the SRC Insider!
              </h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '15px', fontWeight: 500 }}>Get exclusive tech deals, new arrivals & tips directly in your inbox.</p>
          </div>
          <div style={{ flex: 1, minWidth: '280px', maxWidth: '440px' }}>
            {subscribed ? (
              <div style={{ background: 'rgba(34,197,94,0.05)', border: '1.5px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '16px', color: '#16a34a', fontWeight: 700, textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                ✨ Success! You're on the list.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', padding: '6px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ flex: 1, padding: '10px 16px', background: 'transparent', border: 'none', color: '#1E1B4B', fontSize: '14px', outline: 'none', fontWeight: 500, fontFamily: 'Space Grotesk, sans-serif' }} />
                <button id="newsletter-subscribe-btn" onClick={() => { if (email) setSubscribed(true); }}
                  style={{ background: '#7C3AED', color: 'white', border: 'none', padding: '0 24px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#5B21B6'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#7C3AED'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  JOIN NOW
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER ── */}
      <div style={{ background: '#0F172A', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px 24px 48px' }}>
          <div id="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>
            <style>{`@media (min-width:1024px) { #footer-grid { grid-template-columns: 1.5fr 1fr 1fr 1fr !important; } }`}</style>
 
            {/* Col 1: Brand */}
            <div className="space-y-6">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 900, color: '#F59E0B', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-1.5px' }}>SRI RAJ</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.9 }}>COMPUTERS</span>
                </div>
                <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.8, maxWidth: '400px' }}>
                  Your premier destination for high-performance computing, enterprise IT solutions, and genuine tech spares. Empowering your digital journey since 2012.
                </p>
              </div>
 
              {/* Social Icons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {socialLinks.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'all 0.3s', textDecoration: 'none' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = s.color; el.style.borderColor = s.color; el.style.color = 'white'; el.style.boxShadow = `0 8px 16px ${s.color}40`; el.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(255,255,255,0.03)'; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.color = '#64748B'; el.style.boxShadow = 'none'; el.style.transform = 'translateY(0)'; }}>
                    {s.icon}
                  </a>
                ))}
              </div>
 
              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin style={{ width: '14px', height: '14px', color: '#F59E0B' }} />
                  </div>
                  <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.6 }}>Main Road, Peddapuram, East Godavari, AP — 533437</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone style={{ width: '14px', height: '14px', color: '#7C3AED' }} />
                  </div>
                  <a href="tel:+919949915177" style={{ fontSize: '13px', color: '#CBD5E1', textDecoration: 'none', fontWeight: 500 }}>+91 99499 15177</a>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail style={{ width: '14px', height: '14px', color: '#7C3AED' }} />
                  </div>
                  <a href="mailto:srirajcomputers@gmail.com" style={{ fontSize: '13px', color: '#CBD5E1', textDecoration: 'none', fontWeight: 500 }}>srirajcomputers@gmail.com</a>
                </div>
              </div>
            </div>
 
            {/* Cols 2-4: Link Sections */}
            {footerSections.map(section => (
              <div key={section.title} className="lg:border-t-0">
                <button
                  id={`footer-section-${section.title.toLowerCase().replace(/\s/g, '-')}`}
                  onClick={() => toggle(section.title)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  className="lg:pointer-events-none lg:pb-6 lg:pt-0">
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Space Grotesk, sans-serif' }}>{section.title}</span>
                  <span className="lg:hidden text-slate-400">
                    {openSection === section.title ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>
                <div className={`flex flex-col gap-3 pb-6 lg:pb-0 ${openSection === section.title ? 'block' : 'hidden'} lg:flex`}>
                  {section.items.map(item => (
                    <button key={item.label} onClick={() => {
                      if ((item.path === '/account') && !user) {
                        setAuthOpen(true);
                      } else {
                        navigate(item.path);
                      }
                    }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '14px', color: '#94A3B8', padding: '2px 0', transition: 'all 0.25s', fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#F59E0B'; e.currentTarget.style.transform = 'translateX(6px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                      <span style={{ fontSize: '16px', color: '#7C3AED', opacity: 0.6 }}>›</span> {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.03)', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', background: 'rgba(0,0,0,0.2)' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>© 2026 Sri Raj Computers & IT Solutions. All rights reserved.</p>
            <p style={{ fontSize: '11px', color: '#475569', marginTop: '4px', letterSpacing: '1px' }}>GST: 37CQEPB1752N1ZQ</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {['VISA', 'Mastercard', 'UPI', 'GPay', 'PhonePe', 'Paytm', 'Razorpay'].map(pm => (
              <span key={pm} style={{ fontSize: '11px', color: '#94A3B8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '4px 10px', fontWeight: 600, letterSpacing: '0.5px' }}>
                {pm}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
