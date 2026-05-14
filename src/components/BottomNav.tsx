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
        background: '#050d1f',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(0,123,255,0.2)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.8), 0 -1px 0 rgba(0,123,255,0.15)',
        height: 'calc(68px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 40,
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
              background: '#007bff',
              boxShadow: '0 0 10px rgba(0,123,255,0.8)',
            }} />
          )}
          <tab.icon
            style={{
              width: '22px',
              height: '22px',
              color: tab.active ? '#007bff' : '#64748b',
              filter: tab.active ? 'drop-shadow(0 0 4px rgba(0,123,255,0.8))' : 'none',
              transition: 'all 0.2s',
            }}
          />
          <span style={{
            fontSize: '11px',
            fontWeight: tab.active ? 700 : 500,
            color: tab.active ? '#007bff' : '#64748b',
            fontFamily: 'Montserrat, sans-serif',
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
            background: '#007bff',
            boxShadow: '0 0 25px rgba(0,123,255,0.5), 0 8px 25px rgba(0,0,0,0.7)',
            border: '3px solid #050d1f',
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
            e.currentTarget.style.boxShadow = '0 0 35px rgba(0,123,255,0.8), 0 10px 30px rgba(0,0,0,0.8)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(0,123,255,0.5), 0 8px 25px rgba(0,0,0,0.7)';
          }}
        >
          <ShoppingCart style={{ width: '26px', height: '26px', color: 'white' }} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ffc107',
              color: '#000',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              fontSize: '11px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #050d1f',
              boxShadow: '0 0 10px rgba(255,193,7,0.7)',
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
            color: (tab as { color?: string }).color || '#64748b',
            fontFamily: 'Montserrat, sans-serif',
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
