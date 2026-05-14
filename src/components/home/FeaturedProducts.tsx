import { useProducts, useProductsCount } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { Grid3X3 } from 'lucide-react';

const FeaturedProducts = () => {
  const { data: products = [], isLoading } = useProducts(10);
  const { data: totalCount = 0 } = useProductsCount();
  const navigate = useNavigate();
  const featured = products.slice(0, 10);

  return (
    <section id="featured-products-section" style={{ background: '#000b1d', paddingTop: '8px' }}>
      {/* Section Header */}
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0,123,255,0.15)', border: '1px solid rgba(0,123,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Grid3X3 style={{ width: '18px', height: '18px', color: '#007bff' }} />
          </div>
          <p className="section-title">Featured Products</p>
        </div>
        <button onClick={() => navigate('/shop')} className="section-view-all bg-transparent border-none cursor-pointer">
          View All
        </button>
      </div>

      {/* Skeleton loading */}
      {isLoading ? (
        <div className="products-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ background: '#0b1629', border: '1px solid rgba(0,123,255,0.15)', borderRadius: '10px', padding: '12px' }}>
              <div className="skeleton rounded-lg mb-3" style={{ height: 'clamp(130px,20vw,180px)' }} />
              <div className="skeleton h-3 w-2/5 mb-2 rounded" />
              <div className="skeleton h-3.5 mb-2 rounded" />
              <div className="skeleton h-3.5 w-4/5 mb-3 rounded" />
              <div className="skeleton h-9 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="products-grid">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* View All Button */}
      {!isLoading && totalCount > 10 && (
        <div style={{ padding: '8px 16px 16px' }} className="md:px-6 lg:px-8 xl:px-16">
          <button
            id="view-all-products-btn"
            onClick={() => navigate('/shop')}
            style={{ width: '100%', height: '48px', background: 'transparent', border: '1px solid rgba(0,123,255,0.4)', color: '#007bff', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s', fontFamily: 'Montserrat, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,123,255,0.1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,123,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            View All {totalCount}+ Products
          </button>
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
