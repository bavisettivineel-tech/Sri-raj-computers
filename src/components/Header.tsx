import { Menu, ShoppingCart, Search, Heart, ChevronDown, Phone, Mail, MapPin, User, Laptop, Cpu, HardDrive, Monitor, MousePointer, Keyboard, Printer, Box, Zap, Speaker, Headphones, Database, CircuitBoard, Tag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MegaMenu from './MegaMenu';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '@/hooks/useProducts';


const categoryIcons: Record<string, any> = {
  'laptops': Laptop,
  'gaming laptops': Laptop,
  'laptop': Laptop,
  'cpu': Cpu,
  'processor': Cpu,
  'ram': Database,
  'memory': Database,
  'hard disk': HardDrive,
  'hdd': HardDrive,
  'ssd': HardDrive,
  'monitor': Monitor,
  'monitors': Monitor,
  'keyboard': Keyboard,
  'mouse': MousePointer,
  'headphone': Headphones,
  'headset': Headphones,
  'speaker': Speaker,
  'printer': Printer,
  'cabinet': Box,
  'psu': Zap,
  'gpu': CircuitBoard,
  'graphics card': CircuitBoard,
  'accessories': Tag,
};

const desktopNavItems = [
  { label: 'Home', path: '/' },
  { label: 'Discover', path: '#', isMega: true },
  { label: 'Shop', path: '/shop' },
  {
    label: 'Brands', path: '/shop',
    sub: ['HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Logitech', 'TP-Link'],
  },
  { label: 'Accessories', path: '/shop?category=accessories' },
  { label: 'Laptops', path: '/shop?category=laptops' },
  { label: 'BYDM', path: '/shop' },
  { label: 'Why SRC?', path: '/faq' },
  { label: 'Awards', path: '/awards' },
];

const Header = () => {
  const { setMenuOpen, setCartOpen, setSearchOpen, setWishlistOpen, getCartCount, wishlist, setAuthOpen } = useStore();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = getCartCount();
  const wishCount = wishlist.length;
  const [activeChip, setActiveChip] = useState('All');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: categories = [] } = useCategories();

  const handleChipClick = (chip: string, categoryId?: string) => {
    setActiveChip(chip);
    if (chip === 'All') {
      navigate('/shop');
    } else if (categoryId) {
      navigate(`/shop?category=${categoryId}`);
    } else {
      navigate(`/shop?q=${chip.toLowerCase()}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header id="main-header">
      {/* ── TOP INFO BAR ── */}
      <div style={{ background: '#F5F3FF', padding: '6px 0', borderBottom: '1px solid #DDD6FE', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', color: '#1E1B4B', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Phone style={{ width: '14px', height: '14px', color: '#7C3AED' }} />
          Product not found? Call Us! <a href="tel:+919949915177" style={{ color: '#7C3AED', textDecoration: 'none' }}>+91 99499 15177</a>
        </div>
      </div>

      {/* ── MAIN HEADER BAR ── */}
      <div className="header-top-bar">
        {/* Left Side: Hamburger + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Hamburger — mobile + tablet */}
          <button
            id="hamburger-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            className="lg:hidden"
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{ display: 'block', width: '22px', height: '2.5px', background: '#7C3AED', borderRadius: '2px' }} />
            ))}
          </button>

          {/* Logo */}
          <div
            style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
            onClick={() => navigate('/')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 900, color: '#F59E0B', letterSpacing: '-1.5px', lineHeight: 1, textTransform: 'uppercase', fontFamily: 'Space Grotesk, sans-serif' }}>SRI RAJ</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#7C3AED', display: 'inline-block', marginBottom: '2px', boxShadow: '0 0 10px #7C3AED' }} />
            </div>
            <div style={{ fontSize: 'clamp(8px,1vw,10px)', fontWeight: 800, color: '#1E1B4B', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '-2px', opacity: 0.8, fontFamily: 'Space Grotesk, sans-serif' }}>
              COMPUTERS
            </div>
          </div>
        </div>

        {/* Search Bar — desktop */}
        <div className="hidden md:flex flex-1 items-center mx-6 lg:mx-10 max-w-2xl">
          <div
            onClick={() => setSearchOpen(true)}
            id="header-search-bar-desktop"
            style={{
              display: 'flex', alignItems: 'center', width: '100%',
              background: 'rgba(124, 58, 237, 0.04)', border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '30px', height: '46px', cursor: 'pointer', overflow: 'hidden',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.7)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(124, 58, 237, 0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{ flex: 1, fontSize: '14px', color: '#6B7280', padding: '0 16px', userSelect: 'none', fontFamily: 'Space Grotesk, sans-serif' }}>
              Search products, brands, categories...
            </span>
            <div style={{ background: '#7C3AED', height: '46px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <Search style={{ width: '16px', height: '16px', color: 'white' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'white', fontFamily: 'Space Grotesk, sans-serif' }}>SEARCH</span>
            </div>
          </div>
        </div>

        {/* Right Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>


          {/* Account */}
          <button onClick={() => {
            if (!user) setAuthOpen(true);
            else if (isAdmin) navigate('/admin/dashboard');
            else navigate('/account');
          }} aria-label="My Account"
            style={{ flexDirection: 'column', alignItems: 'center', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', gap: '2px' }}
            className="flex"
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <User style={{ width: '20px', height: '20px', color: isAdmin ? '#F59E0B' : '#7C3AED' }} />
            <span style={{ fontSize: '9px', color: isAdmin ? '#F59E0B' : '#1E1B4B', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>
              {user ? (isAdmin ? 'Admin' : 'Account') : 'Login'}
            </span>
          </button>

          {/* Wishlist */}
          <button id="wishlist-btn" onClick={() => setWishlistOpen(true)} aria-label="Wishlist"
            style={{ flexDirection: 'column', alignItems: 'center', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', gap: '2px', position: 'relative' }}
            className="flex"
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Heart style={{ width: '20px', height: '20px', color: '#7C3AED' }} />
            <span style={{ fontSize: '9px', color: '#1E1B4B', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>Wishlist</span>
            {wishCount > 0 && (
              <span style={{ position: 'absolute', top: '4px', right: '4px', background: '#EF4444', color: 'white', width: '14px', height: '14px', borderRadius: '50%', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {wishCount > 9 ? '9+' : wishCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button id="cart-btn" onClick={() => setCartOpen(true)} aria-label="Cart"
            style={{ flexDirection: 'column', alignItems: 'center', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', gap: '2px', position: 'relative' }}
            className="hidden lg:flex"
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <ShoppingCart style={{ width: '22px', height: '22px', color: '#7C3AED' }} />
            <span style={{ fontSize: '9px', color: '#1E1B4B', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>Cart</span>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '4px', right: '4px', background: '#F59E0B', color: '#1E1B4B', width: '18px', height: '18px', borderRadius: '50%', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)' }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

        </div>
      </div>

      {/* ── MOBILE SEARCH ── */}
      <div className="md:hidden px-4 pb-2.5">
        <div onClick={() => setSearchOpen(true)} id="header-search-bar"
          style={{ display: 'flex', alignItems: 'center', background: 'rgba(124, 58, 237, 0.04)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: '8px', height: '42px', cursor: 'pointer', overflow: 'hidden' }}>
          <Search style={{ width: '16px', height: '16px', color: '#7C3AED', margin: '0 12px', flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: '13px', color: '#6B7280', userSelect: 'none', fontFamily: 'Space Grotesk, sans-serif' }}>Search products...</span>
          <div style={{ background: '#7C3AED', height: '42px', padding: '0 14px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'white', fontFamily: 'Space Grotesk, sans-serif' }}>GO</span>
          </div>
        </div>
      </div>


      {/* ── DESKTOP NAV ── */}
      <nav className="header-desktop-nav" ref={dropdownRef}>
        {desktopNavItems.map(item => (
          <div key={item.label} className="relative"
            onMouseEnter={() => !item.isMega && item.sub && setOpenDropdown(item.label)}
            onMouseLeave={() => setOpenDropdown(null)}>
            <button 
              onClick={() => {
                if (item.isMega) {
                  setIsMegaMenuOpen(true);
                } else {
                  navigate(item.path);
                }
              }}
              className={`nav-dropdown-item ${isActive(item.path) ? 'active' : ''}`}>
              {item.label}
              {(item.sub || item.isMega) && <ChevronDown style={{ width: '12px', height: '12px', opacity: 0.6 }} />}
            </button>
            {item.sub && openDropdown === item.label && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: '0',
                background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(124, 58, 237, 0.3)', borderTop: '2px solid #7C3AED',
                borderRadius: '0 0 10px 10px', minWidth: '220px', padding: '8px 0', zIndex: 1000,
                boxShadow: '0 10px 30px rgba(124, 58, 237, 0.1), 0 0 20px rgba(124, 58, 237, 0.05)',
                animation: 'fadeIn 0.2s ease',
              }}>
                {item.sub.map(sub => (
                  <button key={sub}
                    onClick={() => { navigate(`/shop?q=${sub.toLowerCase().replace(/ /g, '+')}`); setOpenDropdown(null); }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 18px', fontSize: '13px', color: '#1E1B4B', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Space Grotesk, sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)'; e.currentTarget.style.color = '#7C3AED'; e.currentTarget.style.paddingLeft = '22px'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1E1B4B'; e.currentTarget.style.paddingLeft = '18px'; }}>
                    › {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      
      {/* Phone number pinned to right in desktop nav */}
      <div className="hidden lg:flex absolute right-8 bottom-[10px] items-center gap-2 text-[#1E1B4B] font-bold text-sm">
        <Phone className="w-4 h-4 text-[#7C3AED]" />
        +91 99499 15177
      </div>

      {/* Mega Menu Overlay */}
      <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
    </header>
  );
};

export default Header;
