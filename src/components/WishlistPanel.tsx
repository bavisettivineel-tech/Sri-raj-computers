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
    background: '#050d1f',
    borderLeft: '1px solid rgba(0,123,255,0.2)',
    zIndex: 210,
    overflowY: 'auto' as const,
    scrollbarWidth: 'thin' as const,
    boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
    color: 'white',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(0,123,255,0.12)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart style={{ width: '18px', height: '18px', color: '#ef4444', fill: 'rgba(239,68,68,0.3)' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'white', fontFamily: 'Montserrat, sans-serif' }}>My Wishlist</h2>
                  {wishlist.length > 0 && <p style={{ fontSize: '11px', color: '#64748b' }}>{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>}
                </div>
              </div>
              <button id="wishlist-close-btn" onClick={() => setWishlistOpen(false)}
                style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                <X style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
              </button>
            </div>

            {/* Empty State */}
            {wishlist.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(239,68,68,0.08)', border: '2px dashed rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Heart style={{ width: '40px', height: '40px', color: '#ef4444', opacity: 0.7 }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '8px', fontFamily: 'Montserrat, sans-serif' }}>Your wishlist is empty</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>Save items you love for later</p>
                <button id="wishlist-start-shopping-btn" onClick={() => { setWishlistOpen(false); navigate('/shop'); }}
                  style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px rgba(0,123,255,0.3)' }}>
                  Browse Products <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px', scrollbarWidth: 'thin' }}>
                {wishlist.map(product => (
                  <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid rgba(0,123,255,0.08)' }}>
                    {/* Image */}
                    <div
                      onClick={() => { setWishlistOpen(false); navigate(`/product/${product.id}`); }}
                      style={{ width: '70px', height: '70px', flexShrink: 0, background: '#0b1629', border: '1px solid rgba(0,123,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,123,255,0.6)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,123,255,0.2)')}>
                      <img src={getProductImage(product)} alt={product.name}
                        style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/58x58/0b1629/007bff?text=Img'; }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="line-clamp-2" style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4 }}>{product.name}</p>
                      {product.brand_name && <p style={{ fontSize: '10px', color: '#007bff', marginTop: '2px' }}>{product.brand_name}</p>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#007bff' }}>₹{product.sale_price.toLocaleString('en-IN')}</span>
                        {product.mrp > product.sale_price && (
                          <span style={{ fontSize: '11px', color: '#475569', textDecoration: 'line-through' }}>₹{product.mrp.toLocaleString('en-IN')}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button id={`wishlist-add-cart-${product.id}`}
                          onClick={() => { addToCart(product); toggleWishlist(product); }}
                          style={{ flex: 1, height: '32px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'all 0.2s', fontFamily: 'Montserrat, sans-serif' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#e0a800')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#ffc107')}>
                          <ShoppingCart style={{ width: '12px', height: '12px' }} /> Move to Cart
                        </button>
                        <button id={`wishlist-remove-${product.id}`}
                          onClick={() => toggleWishlist(product)}
                          style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.25)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}>
                          <Trash2 style={{ width: '13px', height: '13px', color: '#ef4444' }} />
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
