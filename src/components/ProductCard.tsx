import { Heart, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '@/types/product';
import { getProductImage, getDiscount } from '@/types/product';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ProductCardProps { product: Product; }

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(product.id);
  const discount = getDiscount(product);
  const inStock = true;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    addToCart(product, 1);
    toast.success(`Added to cart!`, { duration: 1500 });
  };

  return (
    <div
      className="product-card-new card-hover"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* ─── Image Section ─── */}
      <div className="pc-image-wrap">
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="pc-badge">{discount}% OFF</span>
        )}

        {/* Wishlist */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="pc-wishlist"
          style={{ background: wishlisted ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.9)', border: wishlisted ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid rgba(124, 58, 237, 0.08)' }}
        >
          <Heart style={{ width: '14px', height: '14px', color: wishlisted ? '#EF4444' : '#94A3B8', fill: wishlisted ? '#EF4444' : 'none', transition: 'all 0.2s' }} />
        </button>

        {/* Product Image — on white bg */}
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="pc-img"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x160/F5F3FF/7C3AED?text=Product'; }}
        />

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="pc-oos-overlay">
            <span className="pc-oos-label">Out of Stock</span>
          </div>
        )}
      </div>

      {/* ─── Info Section ─── */}
      <div className="pc-info">
        {/* Brand */}
        {product.brand_name && (
          <p className="pc-brand">{product.brand_name}</p>
        )}

        {/* Product Name */}
        <h3 className="pc-name line-clamp-2">{product.name}</h3>

        {/* Rating */}
        <div className="pc-rating">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} style={{ width: '11px', height: '11px', color: i <= 4 ? '#F59E0B' : '#D1D5DB', fill: i <= 4 ? '#F59E0B' : 'none' }} />
          ))}
          <span className="pc-rating-count">(4.0)</span>
        </div>

        {/* Price row */}
        <div className="pc-price-row">
          <span className="pc-price">₹{product.sale_price.toLocaleString('en-IN')}</span>
          {product.mrp > product.sale_price && (
            <span className="pc-mrp">₹{product.mrp.toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Stock status */}
        <p className="pc-stock" style={{ color: inStock ? '#16a34a' : '#ef4444' }}>
          <span className="pc-stock-dot" style={{ background: inStock ? '#16a34a' : '#ef4444', boxShadow: inStock ? '0 0 6px #16a34a88' : '0 0 6px #ef444488' }} />
          {inStock ? 'In Stock' : 'Out of Stock'}
        </p>
      </div>

      {/* ─── CTA Buttons ─── */}
      {inStock ? (
        <div className="pc-cta" onClick={e => e.stopPropagation()}>
          <button
            id={`add-cart-btn-${product.id}`}
            onClick={handleAddToCart}
            className="pc-btn-cart"
          >
            <ShoppingCart style={{ width: '13px', height: '13px' }} />
            Cart
          </button>
          <button
            id={`buy-now-btn-${product.id}`}
            onClick={handleBuyNow}
            className="pc-btn-buy"
          >
            BUY NOW
          </button>
        </div>
      ) : (
        <button disabled className="pc-btn-oos">Out of Stock</button>
      )}
    </div>
  );
};

export default ProductCard;
