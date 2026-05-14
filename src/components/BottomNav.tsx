import { Home, Store, ShoppingCart, Search, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';

const WHATSAPP_NUMBER = '919949915177';
const WHATSAPP_MSG = encodeURIComponent('Hi! I need help with a product on your website.');

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCartOpen, setSearchOpen, getCartCount } = useStore();
  const cartCount = getCartCount();

  const isActive = (path: string) => location.pathname === path;

  const tabs = [
    { id: 'nav-home',   icon: Home,   label: 'Home',   action: () => navigate('/'),    active: isActive('/') },
    { id: 'nav-shop',   icon: Store,  label: 'Shop',   action: () => navigate('/shop'), active: isActive('/shop') },
    { id: 'nav-search', icon: Search, label: 'Search', action: () => setSearchOpen(true), active: false },
    {
      id: 'nav-whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      action: () => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`, '_blank'),
      active: false,
      color: '#22C55E',
    },
  ];

  return (
    <nav
      id="bottom-nav"
      className="bottom-nav lg:hidden"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        background: '#FFFFFF',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(124, 58, 237, 0.15)',
        boxShadow: '0 -4px 25px rgba(124, 58, 237, 0.08)',
        height: 'calc(68px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 150,
      }}
    >
      {/* Left tabs (2) */}
      {tabs.slice(0, 2).map(tab => (
        <button
          key={tab.id}
          id={tab.id}
          onClick={tab.action}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 0',
            position: 'relative',
            minHeight: '44px',
          }}
        >
          {tab.active && (
            <span style={{
              position: 'absolute',
              top: 0,
              width: '32px',
              height: '3px',
              borderRadius: '0 0 3px 3px',
              background: '#7C3AED',
              boxShadow: '0 0 10px rgba(124, 58, 237, 0.6)',
            }} />
          )}
          <tab.icon
            style={{
              width: '22px',
              height: '22px',
              color: tab.active ? '#7C3AED' : '#6B7280',
              filter: tab.active ? 'drop-shadow(0 0 4px rgba(124, 58, 237, 0.4))' : 'none',
              transition: 'all 0.2s',
            }}
          />
          <span style={{
            fontSize: '11px',
            fontWeight: tab.active ? 700 : 500,
            color: tab.active ? '#7C3AED' : '#6B7280',
            fontFamily: 'Space Grotesk, sans-serif',
            transition: 'all 0.2s',
          }}>
            {tab.label}
          </span>
        </button>
      ))}

      {/* Center Floating Cart Button */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          id="nav-cart-btn"
          onClick={() => setCartOpen(true)}
          aria-label="Cart"
          style={{
            position: 'relative',
            width: '60px',
            height: '60px',
            minHeight: '60px',
            borderRadius: '50%',
            background: '#7C3AED',
            boxShadow: '0 0 25px rgba(124, 58, 237, 0.4), 0 8px 25px rgba(124, 58, 237, 0.15)',
            border: '3px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '-30px',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            zIndex: 5,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 35px rgba(124, 58, 237, 0.6), 0 10px 30px rgba(124, 58, 237, 0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(124, 58, 237, 0.4), 0 8px 25px rgba(124, 58, 237, 0.15)';
          }}
        >
          <ShoppingCart style={{ width: '26px', height: '26px', color: 'white' }} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#F59E0B',
              color: '#1E1B4B',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              fontSize: '11px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #FFFFFF',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
            }}>
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Right tabs (2) */}
      {tabs.slice(2).map(tab => (
        <button
          key={tab.id}
          id={tab.id}
          onClick={tab.action}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 0',
            minHeight: '44px',
          }}
        >
          <tab.icon
            style={{
              width: '22px',
              height: '22px',
              color: (tab as { color?: string }).color || '#64748b',
              transition: 'all 0.2s',
            }}
          />
          <span style={{
            fontSize: '11px',
            fontWeight: 500,
            color: (tab as { color?: string }).color || '#6B7280',
            fontFamily: 'Space Grotesk, sans-serif',
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
