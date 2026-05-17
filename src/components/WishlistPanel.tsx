import { X, Trash2, ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getProductImage } from '@/types/product';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const WishlistPanel = () => {
  const { wishlist, wishlistOpen, setWishlistOpen, toggleWishlist, addToCart } = useStore();
  const navigate = useNavigate();

  if (!wishlistOpen) return null;

  const panelStyle = {
    position: 'fixed' as const,
    top: 0, right: 0, bottom: 0,
    width: '100%',
    maxWidth: '420px',
    background: '#FFFFFF',
    borderLeft: '1px solid #DDD6FE',
    zIndex: 210,
    overflowY: 'auto' as const,
    scrollbarWidth: 'thin' as const,
    boxShadow: '-10px 0 40px rgba(124,58,237,0.1)',
    color: '#1E1B4B',
    display: 'flex',
    flexDirection: 'column' as const,
  };

  return (
    <AnimatePresence>
      {wishlistOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="slide-up-overlay" onClick={() => setWishlistOpen(false)} />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            id="wishlist-panel"
            style={panelStyle}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid #DDD6FE', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart style={{ width: '18px', height: '18px', color: '#EF4444', fill: '#FEE2E2' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif' }}>My Wishlist</h2>
                  {wishlist.length > 0 && <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>}
                </div>
              </div>
              <button id="wishlist-close-btn" onClick={() => setWishlistOpen(false)}
                style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.05)')}>
                <X style={{ width: '18px', height: '18px', color: '#1E1B4B' }} />
              </button>
            </div>

            {/* Empty State */}
            {wishlist.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#FEF2F2', border: '2px dashed #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Heart style={{ width: '40px', height: '40px', color: '#EF4444', opacity: 0.8 }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1B4B', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>Your wishlist is empty</h3>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px', fontWeight: 500 }}>Save items you love for later</p>
                <button id="wishlist-start-shopping-btn" onClick={() => { setWishlistOpen(false); navigate('/shop'); }}
                  style={{ background: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)', transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.3)'; }}>
                  Browse Products <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px', scrollbarWidth: 'thin' }}>
                {wishlist.map(product => (
                  <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0', borderBottom: '1px solid #F3F4F6' }}>
                    {/* Image */}
                    <div
                      onClick={() => { setWishlistOpen(false); navigate(`/product/${product.id}`); }}
                      style={{ width: '75px', height: '75px', flexShrink: 0, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E7EB')}>
                      <img src={getProductImage(product)} alt={product.name}
                        style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/58x58/F9FAFB/7C3AED?text=Img'; }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="line-clamp-2" style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B', lineHeight: 1.4, fontFamily: 'Space Grotesk, sans-serif' }}>{product.name}</p>
                      {product.brand_name && <p style={{ fontSize: '10px', color: '#7C3AED', marginTop: '2px', fontWeight: 800, textTransform: 'uppercase' }}>{product.brand_name}</p>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif' }}>₹{product.sale_price.toLocaleString('en-IN')}</span>
                        {product.mrp > product.sale_price && (
                          <span style={{ fontSize: '12px', color: '#6B7280', textDecoration: 'line-through', fontWeight: 500 }}>₹{product.mrp.toLocaleString('en-IN')}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button id={`wishlist-add-cart-${product.id}`}
                          onClick={() => { addToCart(product); toggleWishlist(product); }}
                          style={{ flex: 1, height: '36px', background: 'linear-gradient(90deg, #F59E0B, #FBBF24)', color: '#1E1B4B', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.2)'; }}>
                          <ShoppingCart style={{ width: '14px', height: '14px' }} /> Move to Cart
                        </button>
                        <button id={`wishlist-remove-${product.id}`}
                          onClick={() => toggleWishlist(product)}
                          style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#FEF2F2')}>
                          <Trash2 style={{ width: '15px', height: '15px', color: '#EF4444' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistPanel;
