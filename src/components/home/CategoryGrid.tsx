import { useCategories } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';

/* Real product images for each category (from Unsplash) */
const swetaCategories = [
  { name: 'Gaming Laptop', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop&q=80' },
  { name: 'Monitor', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop&q=80' },
  { name: 'Cabinet', img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=400&fit=crop&q=80' },
  { name: 'Motherboard', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop&q=80' },
  { name: 'Processor', img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop&q=80' },
  { name: 'RAM', img: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop&q=80' },
  { name: 'SSD', img: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400&h=400&fit=crop&q=80' },
  { name: 'HDD', img: 'https://images.unsplash.com/photo-1531492746377-26be2477d703?w=400&h=400&fit=crop&q=80' },
  { name: 'Graphics Card', img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop&q=80' },
  { name: 'Air Cooler', img: 'https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=400&h=400&fit=crop&q=80' },
  { name: 'Liquid Cooler', img: 'https://images.unsplash.com/photo-1631482901191-037302484f93?w=400&h=400&fit=crop&q=80' },
  { name: 'Power Supply', img: 'https://images.unsplash.com/photo-1591489383454-dd120412693b?w=400&h=400&fit=crop&q=80' },
];


const CategoryGrid = () => {
  const navigate = useNavigate();
  const { data: realCategories = [] } = useCategories();

  return (
    <section id="category-grid-section" style={{ background: '#000b1d', padding: '8px 0' }}>
      {/* Section Header */}
      <div className="section-header">
        <p className="section-title">Shop by Category</p>
        <button
          onClick={() => navigate('/shop')}
          className="section-view-all bg-transparent border-none cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Responsive Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 lg:px-12 pb-12"
      >
        {swetaCategories.map((cat) => {
          // Find the actual database ID for this category name
          const realCat = realCategories.find(rc => 
            rc.name.toLowerCase() === cat.name.toLowerCase() || 
            rc.name.toLowerCase().includes(cat.name.toLowerCase())
          );
          
          const categoryLink = realCat ? `/shop?category=${realCat.id}` : `/shop?q=${cat.name.toLowerCase()}`;

          return (
            <button
              key={cat.name}
              onClick={() => navigate(categoryLink)}
              style={{
                background: '#0b121e',
                border: `1.5px solid #1a2536`,
                borderRadius: '8px',
                padding: '24px 12px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'center',
                aspectRatio: '1/1',
                width: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.boxShadow = `0 0 20px rgba(0,123,255,0.3)`;
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#1a2536';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '75%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  style={{
                    maxWidth: '85%',
                    maxHeight: '85%',
                    objectFit: 'contain',
                    transition: 'transform 0.5s ease',
                  }}
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('placehold.co')) {
                      target.src = `https://placehold.co/400x400/0b121e/white?text=${cat.name}`;
                    }
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: 'clamp(11px, 1.2vw, 13px)',
                  fontWeight: 900,
                  color: 'white',
                  textAlign: 'center',
                  textTransform: 'capitalize',
                  letterSpacing: '0.2px',
                }}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;
