import { X, Home, Store, Tag, Flame, Heart, User, Package, Phone, LogOut, ChevronDown, ChevronRight, MessageCircle, ShoppingCart, Shield } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useCategories } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const menuItems = [
  { id: 'menu-home',    icon: Home,         label: 'Home',         path: '/',        iconBg: 'rgba(124, 58, 237, 0.12)', iconColor: '#7C3AED' },
  { id: 'menu-shop',    icon: Store,        label: 'Shop All',     path: '/shop',    iconBg: 'rgba(124, 58, 237, 0.12)', iconColor: '#7C3AED' },
  { id: 'menu-deals',   icon: Flame,        label: 'Hot Deals',    path: '/shop',    iconBg: 'rgba(239, 68, 68, 0.12)', iconColor: '#EF4444' },
  { id: 'menu-account', icon: User,         label: 'My Account',   path: '/account', iconBg: 'rgba(124, 58, 237, 0.12)', iconColor: '#7C3AED' },
  { id: 'menu-orders',  icon: Package,      label: 'Track Order',  path: '/account', iconBg: 'rgba(16, 185, 129, 0.12)', iconColor: '#10B981' },
  { id: 'menu-contact', icon: Phone,        label: 'Contact Us',   path: '/contact', iconBg: 'rgba(245, 158, 11, 0.12)', iconColor: '#F59E0B' },
];

/* Real category images used in the sidebar list — keyed by lowercase category name */
const catImages: Record<string, string> = {
  'monitor':          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&auto=format&fit=crop&q=80',
  'monitors':         'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&auto=format&fit=crop&q=80',
  'cabinet':          'https://shwetacomputers.com/cdn/shop/collections/1_6d89113d-f730-4ffd-b767-48838256f623.webp?v=1722173204',
  'motherboard':      'https://shwetacomputers.com/cdn/shop/collections/2_4af50eda-28c4-469b-8e80-f96909a44d5a.webp?v=1722171397',
  'motherboards':     'https://shwetacomputers.com/cdn/shop/collections/2_4af50eda-28c4-469b-8e80-f96909a44d5a.webp?v=1722171397',
  'processor':        'https://shwetacomputers.com/cdn/shop/collections/61oDBiX7OWL.webp?v=1722173573',
  'processors':       'https://shwetacomputers.com/cdn/shop/collections/61oDBiX7OWL.webp?v=1722173573',
  'ram':              'https://shwetacomputers.com/cdn/shop/collections/2_18ff46f1-2250-460f-8ce4-7108ec3edd21.webp?v=1722173997',
  'ssd':              'https://shwetacomputers.com/cdn/shop/collections/3_ce1c85d6-4f0c-44be-bc3f-8d13fe76989f.webp?v=1722173743',
  'hdd':              'https://shwetacomputers.com/cdn/shop/collections/3_64221bc5-4608-438b-af02-ced7357e4b18.webp?v=1722172044',
  'graphics card':    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=80&auto=format&fit=crop&q=80',
  'graphics cards':   'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=80&auto=format&fit=crop&q=80',
  'gpu':              'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=80&auto=format&fit=crop&q=80',
  'air cooler':       'https://shwetacomputers.com/cdn/shop/collections/3_940x_f33020bb-4a20-4808-92e4-0be7c5f4a177.webp?v=1721731078',
  'air coolers':      'https://shwetacomputers.com/cdn/shop/collections/3_940x_f33020bb-4a20-4808-92e4-0be7c5f4a177.webp?v=1721731078',
  'cabinet fans':     'https://shwetacomputers.com/cdn/shop/collections/2_37446bef-eb05-4afc-8b14-29e26a9abc60.webp?v=1722173683',
  'liquid cooler':    'https://shwetacomputers.com/cdn/shop/collections/2_0c35221d-b8b7-42bc-bb42-78ded2d58b5b.webp?v=1722173832',
  'liquid coolers':   'https://shwetacomputers.com/cdn/shop/collections/2_0c35221d-b8b7-42bc-bb42-78ded2d58b5b.webp?v=1722173832',
  'power supply':     'https://shwetacomputers.com/cdn/shop/collections/1_95b4af1a-0ace-4c47-9755-99456c239e6e.webp?v=1722172518',
  'laptop':           'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=80&auto=format&fit=crop&q=80',
  'laptops':          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=80&auto=format&fit=crop&q=80',
  'gaming laptop':    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=80&auto=format&fit=crop&q=80',
  'gaming laptops':   'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=80&auto=format&fit=crop&q=80',
  'keyboard':         'https://shwetacomputers.com/cdn/shop/collections/1_533x_bb485f83-162c-4efd-b8cd-aae9d78a3211.webp?v=1722171638',
  'keyboards':        'https://shwetacomputers.com/cdn/shop/collections/1_533x_bb485f83-162c-4efd-b8cd-aae9d78a3211.webp?v=1722171638',
  'mouse':            'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=80&auto=format&fit=crop&q=80',
  'mouse pad':        'https://shwetacomputers.com/cdn/shop/collections/3_adaa8281-9720-4979-a988-3132c7ebad95.webp?v=1722171480',
  'mouse pads':       'https://shwetacomputers.com/cdn/shop/collections/3_adaa8281-9720-4979-a988-3132c7ebad95.webp?v=1722171480',
  'gaming chair':     'https://shwetacomputers.com/cdn/shop/collections/1_aa99e037-d7f1-4058-a6cc-df60b2ec6c4e.webp?v=1722171945',
  'gaming chairs':    'https://shwetacomputers.com/cdn/shop/collections/1_aa99e037-d7f1-4058-a6cc-df60b2ec6c4e.webp?v=1722171945',
  'headphone':        'https://shwetacomputers.com/cdn/shop/collections/4_f2ba3871-73e6-4b63-bcb9-a3054247deab.webp?v=1722173273',
  'headphones':       'https://shwetacomputers.com/cdn/shop/collections/4_f2ba3871-73e6-4b63-bcb9-a3054247deab.webp?v=1722173273',
  'microphone':       'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=80&auto=format&fit=crop&q=80',
  'microphones':      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=80&auto=format&fit=crop&q=80',
  'game controller':  'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=80&auto=format&fit=crop&q=80',
  'game controllers': 'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=80&auto=format&fit=crop&q=80',
  'printer':          'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=80&auto=format&fit=crop&q=80',
  'printers':         'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=80&auto=format&fit=crop&q=80',
  'toner':            'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=80&auto=format&fit=crop&q=80',
  'toners':           'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=80&auto=format&fit=crop&q=80',
  'cctv':             'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=80&auto=format&fit=crop&q=80',
  'networking':       'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=80&auto=format&fit=crop&q=80',
  'router':           'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=80&auto=format&fit=crop&q=80',
  'routers':          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=80&auto=format&fit=crop&q=80',
  'power bank':       'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=80&auto=format&fit=crop&q=80',
  'power banks':      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=80&auto=format&fit=crop&q=80',
  'cable':            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&auto=format&fit=crop&q=80',
  'cables':           'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&auto=format&fit=crop&q=80',
  'ups':              'https://images.unsplash.com/photo-1609902726285-00668009f004?w=80&auto=format&fit=crop&q=80',
  'peripherals':      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&auto=format&fit=crop&q=80',
  'prebuilt pc':      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=80&auto=format&fit=crop&q=80',
  'selfie stick':     'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=80&auto=format&fit=crop&q=80',
  'webcam':           'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=80&auto=format&fit=crop&q=80',
  'webcams':          'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=80&auto=format&fit=crop&q=80',
  'speaker':          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=80&auto=format&fit=crop&q=80',
  'speakers':         'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=80&auto=format&fit=crop&q=80',
  'thermal paste':    'https://images.unsplash.com/photo-1555617117-08a7aa0d8f61?w=80&auto=format&fit=crop&q=80',
  'thermal':          'https://images.unsplash.com/photo-1555617117-08a7aa0d8f61?w=80&auto=format&fit=crop&q=80',
  'accessories':      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&auto=format&fit=crop&q=80',
  'laptop stand':     'https://images.unsplash.com/photo-1593642532559-0c6d3fc62b89?w=80&auto=format&fit=crop&q=80',
  'laptop stands':    'https://images.unsplash.com/photo-1593642532559-0c6d3fc62b89?w=80&auto=format&fit=crop&q=80',
  'cooling stand':    'https://images.unsplash.com/photo-1593642532559-0c6d3fc62b89?w=80&auto=format&fit=crop&q=80',
  'earphone':         'https://images.unsplash.com/photo-1606400082777-ef05f3c5cde2?w=80&auto=format&fit=crop&q=80',
  'earphones':        'https://images.unsplash.com/photo-1606400082777-ef05f3c5cde2?w=80&auto=format&fit=crop&q=80',
  'converter':        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&auto=format&fit=crop&q=80',
  'converters':       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&auto=format&fit=crop&q=80',
  'adapter':          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&auto=format&fit=crop&q=80',
  'adapters':         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&auto=format&fit=crop&q=80',
  'powerbank':        'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=80&auto=format&fit=crop&q=80',
  'powerbanks':       'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=80&auto=format&fit=crop&q=80',
};
const fallbackCatImg = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=40&h=40&fit=crop&auto=format';

const SideMenu = () => {
  const { menuOpen, setMenuOpen, wishlist, getCartCount, setCartOpen, setAuthOpen, setSupportOpen } = useStore();
  const { data: categories = [] } = useCategories();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const cartCount = getCartCount();

  const handleNav = (path: string) => {
    setMenuOpen(false);
    if ((path === '/account') && !user) {
      setAuthOpen(true);
    } else if (path === '/account' && isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate(path);
    }
  };
  const userName = user?.email?.split('@')[0] ?? 'Guest';
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <AnimatePresence mode="wait">
      {menuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 998 }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            id="side-drawer"
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              width: '85%', maxWidth: '340px',
              background: '#FFFFFF',
              borderRight: '1px solid rgba(124, 58, 237, 0.25)',
              zIndex: 999, overflowY: 'auto', scrollbarWidth: 'thin',
              boxShadow: '10px 0 40px rgba(124, 58, 237, 0.1)',
              display: 'flex', flexDirection: 'column', color: '#1E1B4B',
            }}
          >
            {/* ── HEADER ── */}
            <div style={{
              background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
              borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
              padding: 'calc(env(safe-area-inset-top) + 20px) 20px 20px',
              position: 'relative', flexShrink: 0, overflow: 'hidden',
            }}>
              {/* Decorative glow orb */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', filter: 'blur(20px)', pointerEvents: 'none' }} />
              {/* Violet accent line */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #7C3AED, transparent)' }} />

              {/* Close */}
              <button id="side-menu-close" onClick={() => setMenuOpen(false)}
                style={{ position: 'absolute', top: '14px', right: '14px', width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,53,69,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
                <X style={{ width: '15px', height: '15px', color: 'white' }} />
              </button>

              {/* Logo */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: '#7C3AED', textShadow: '0 0 15px rgba(124, 58, 237, 0.4)', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>SRC</span>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block', marginBottom: '2px' }} />
                </div>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#F59E0B', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Space Grotesk, sans-serif' }}>IT SOLUTIONS</div>
              </div>

              {/* User Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.15)', border: '2px solid rgba(124, 58, 237, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: '#7C3AED', flexShrink: 0, boxShadow: '0 0 15px rgba(124, 58, 237, 0.2)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {user ? initials : <User style={{ width: '22px', height: '22px', color: '#7C3AED' }} />}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#1E1B4B', lineHeight: 1.2, fontFamily: 'Space Grotesk, sans-serif' }}>
                    {user ? (isAdmin ? 'Admin Panel' : `Hi, ${userName}`) : 'Welcome Back!'}
                  </p>
                  {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <p style={{ fontSize: '11px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                      {isAdmin && <span style={{ background: '#F59E0B', color: '#1E1B4B', borderRadius: '4px', padding: '1px 5px', fontSize: '8px', fontWeight: 900 }}>ADMIN</span>}
                    </div>
                  ) : (
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Sign in for full access</p>
                  )}
                </div>
              </div>

              {/* Auth buttons for guests */}
              {!user && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', position: 'relative', zIndex: 1 }}>
                  <button id="drawer-login-btn" onClick={() => { setMenuOpen(false); setAuthOpen(true); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(124, 58, 237, 0.4)', background: 'transparent', color: '#7C3AED', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    Login
                  </button>
                  <button id="drawer-register-btn" onClick={() => { setMenuOpen(false); setAuthOpen(true); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#7C3AED', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 15px rgba(124, 58, 237, 0.3)', transition: 'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#5B21B6')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}>
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* ── QUICK STATS BAR ── */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(124, 58, 237, 0.1)' }}>
              <button onClick={() => { setMenuOpen(false); useStore.getState().setWishlistOpen(true); }}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', borderRight: '1px solid rgba(124, 58, 237, 0.1)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ position: 'relative' }}>
                  <Heart style={{ width: '20px', height: '20px', color: '#EF4444' }} />
                  {wishlist.length > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#EF4444', color: 'white', width: '14px', height: '14px', borderRadius: '50%', fontSize: '8px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wishlist.length}</span>}
                </div>
                <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600 }}>Wishlist</span>
              </button>
              <button onClick={() => { setMenuOpen(false); setCartOpen(true); }}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', borderRight: '1px solid rgba(124, 58, 237, 0.1)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ position: 'relative' }}>
                  <ShoppingCart style={{ width: '20px', height: '20px', color: '#7C3AED' }} />
                  {cartCount > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#F59E0B', color: '#1E1B4B', width: '14px', height: '14px', borderRadius: '50%', fontSize: '8px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
                </div>
                <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600 }}>Cart</span>
              </button>
              <button onClick={() => handleNav('/account')}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <Package style={{ width: '20px', height: '20px', color: '#10B981' }} />
                <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600 }}>Orders</span>
              </button>
            </div>

            {/* ── MAIN MENU ITEMS ── */}
            <div style={{ padding: '8px 0', flex: 1 }}>
              {/* Section label */}
              <p style={{ fontSize: '10px', fontWeight: 800, color: '#334155', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '10px 20px 4px', fontFamily: 'Montserrat, sans-serif' }}>Navigation</p>

              {menuItems.map(item => (
                <button key={item.id} id={item.id} onClick={() => handleNav(item.path)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 20px', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s', borderLeft: '3px solid transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.06)'; e.currentTarget.style.borderLeftColor = '#7C3AED'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${item.iconColor}22` }}>
                      <item.icon style={{ width: '16px', height: '16px', color: item.iconColor }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif' }}>{item.label}</span>
                  </div>
                  <ChevronRight style={{ width: '14px', height: '14px', color: '#334155' }} />
                </button>
              ))}

              {/* Support */}
              <button id="menu-support" onClick={() => { setMenuOpen(false); setSupportOpen(true); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 20px', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s', borderLeft: '3px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.06)'; e.currentTarget.style.borderLeftColor = '#7C3AED'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle style={{ width: '16px', height: '16px', color: '#7C3AED' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif' }}>Live Support</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: '#22c55e', color: '#000', borderRadius: '10px', padding: '2px 6px', fontSize: '9px', fontWeight: 800 }}>LIVE</span>
                  <ChevronRight style={{ width: '14px', height: '14px', color: '#334155' }} />
                </div>
              </button>

              {/* Categories expandable */}
              <div>
                <p style={{ fontSize: '10px', fontWeight: 800, color: '#334155', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '14px 20px 4px', fontFamily: 'Montserrat, sans-serif' }}>Categories</p>
                <button id="menu-categories-toggle" onClick={() => setCategoriesOpen(!categoriesOpen)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 20px', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s', borderLeft: '3px solid transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.06)'; e.currentTarget.style.borderLeftColor = '#7C3AED'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Tag style={{ width: '16px', height: '16px', color: '#7C3AED' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif' }}>All Categories</span>
                  </div>
                  {categoriesOpen
                    ? <ChevronDown style={{ width: '14px', height: '14px', color: '#7C3AED' }} />
                    : <ChevronRight style={{ width: '14px', height: '14px', color: '#334155' }} />}
                </button>

                {categoriesOpen && (
                  <div style={{ background: 'rgba(124, 58, 237, 0.04)', borderTop: '1px solid rgba(124, 58, 237, 0.08)', borderBottom: '1px solid rgba(124, 58, 237, 0.08)' }}>
                    {categories.map(cat => {
                      const img = catImages[cat.name.toLowerCase()] || fallbackCatImg;
                      return (
                        <button key={cat.id} onClick={() => handleNav(`/shop?category=${cat.id}`)}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '9px 20px 9px 28px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(124, 58, 237, 0.06)', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                          {/* Real category image */}
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(124, 58, 237, 0.2)', background: '#F5F3FF' }}>
                            <img src={img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { (e.target as HTMLImageElement).src = fallbackCatImg; }} />
                          </div>
                          <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, fontFamily: 'Space Grotesk, sans-serif', flex: 1, textAlign: 'left' }}>
                            {cat.name}
                          </span>
                          <ChevronRight style={{ width: '12px', height: '12px', color: '#334155', flexShrink: 0 }} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Logout */}
              {user && (
                <button id="menu-logout-btn" onClick={async () => { await signOut(); setMenuOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '11px 20px', background: 'transparent', border: 'none', cursor: 'pointer', borderTop: '1px solid rgba(0,123,255,0.08)', marginTop: '8px', transition: 'all 0.15s', borderLeft: '3px solid transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,53,69,0.06)'; e.currentTarget.style.borderLeftColor = '#dc3545'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LogOut style={{ width: '16px', height: '16px', color: '#dc3545' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#dc3545', fontFamily: 'Montserrat, sans-serif' }}>Logout</span>
                </button>
              )}
            </div>

            {/* ── BOTTOM PROMO BOX ── */}
            <div style={{ margin: '12px 16px 16px', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(245, 243, 255, 0.8) 100%)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(124, 58, 237, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif' }}>100% Genuine Products</p>
                <p style={{ fontSize: '10px', color: '#6B7280' }}>GST: 37CQEPB1752N1ZQ</p>
              </div>
            </div>

            {/* Bottom version */}
            <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(124, 58, 237, 0.08)', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'Space Grotesk, sans-serif' }}>SRC IT Solutions © 2026</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;
