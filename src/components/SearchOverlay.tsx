import { X, Search, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useProducts } from '@/hooks/useProducts';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';

const popularSearches = ['HP Toner', 'CCTV Camera', 'Epson Ink', 'Laptop', 'Printer Spares', 'Keyboard', 'Mouse', 'Networking'];
const recentSearches = ['Canon Cartridge', 'HP 85A', 'Foxin'];

const SearchOverlay = () => {
  const { searchOpen, setSearchOpen } = useStore();
  const { data: products = [] } = useProducts();
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState(recentSearches);

  const results = query.length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.brand_name || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.category_name || '').toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const clearRecent = (term: string) => setRecents(r => r.filter(x => x !== term));

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          id="search-overlay"
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            maxWidth: '480px', margin: '0 auto',
            overflowY: 'auto', scrollbarWidth: 'none',
            borderLeft: '1px solid rgba(124, 58, 237, 0.1)',
            borderRight: '1px solid rgba(124, 58, 237, 0.1)',
          }}
        >
          {/* Search Header */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '16px',
            borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1B4B', textShadow: '0 0 10px rgba(124, 58, 237, 0.1)', fontFamily: 'Space Grotesk, sans-serif' }}>
                What are you looking for?
              </h2>
              <button
                id="search-close-btn"
                onClick={() => { setSearchOpen(false); setQuery(''); }}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(124, 58, 237, 0.08)',
                  border: '1px solid rgba(124, 58, 237, 0.1)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X style={{ width: '18px', height: '18px', color: '#6B7280' }} />
              </button>
            </div>

            {/* Search Input */}
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'rgba(124, 58, 237, 0.04)',
              borderRadius: '16px',
              height: '54px', overflow: 'hidden',
              border: query ? '1.5px solid #7C3AED' : '1.5px solid rgba(124, 58, 237, 0.1)',
              boxShadow: query ? '0 0 10px rgba(124, 58, 237, 0.1)' : 'none',
              transition: 'all 0.2s',
            }}>
              <Search style={{ width: '20px', height: '20px', color: '#64748b', marginLeft: '16px', flexShrink: 0 }} />
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Toner Cartridges, CCTV, Laptops..."
                autoFocus
                style={{
                  flex: 1, padding: '0 14px',
                  background: 'transparent', border: 'none', outline: 'none',
                  fontSize: '16px', color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif',
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{
                    padding: '0 14px', background: 'transparent', border: 'none',
                    cursor: 'pointer', color: '#94a3b8', fontSize: '18px',
                  }}
                >×</button>
              )}
            </div>
          </div>

          <div style={{ padding: '16px' }}>
            {/* Recent Searches */}
            {!query && recents.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{
                  fontSize: '11px', fontWeight: 700, color: '#7C3AED',
                  textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px',
                  fontFamily: 'Space Grotesk, sans-serif'
                }}>
                  Recent Searches
                </p>
                {recents.map(term => (
                  <div
                    key={term}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <button
                      onClick={() => setQuery(term)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280',
                      }}
                    >
                      <Clock style={{ width: '16px', height: '16px', color: '#6B7280' }} />
                      <span style={{ fontSize: '14px', color: '#1E1B4B' }}>{term}</span>
                    </button>
                    <button
                      onClick={() => clearRecent(term)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {!query && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  fontSize: '11px', fontWeight: 700, color: '#7C3AED',
                  textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px',
                  fontFamily: 'Space Grotesk, sans-serif'
                }}>
                  Popular Searches
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {popularSearches.map(term => (
                    <button
                      key={term}
                      id={`popular-search-${term.toLowerCase().replace(/\s/g, '-')}`}
                      onClick={() => setQuery(term)}
                      style={{
                        background: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED',
                        borderRadius: '20px', padding: '8px 16px',
                        fontSize: '13px', fontWeight: 600,
                        border: '1px solid rgba(124, 58, 237, 0.2)', cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: 'none',
                        fontFamily: 'Space Grotesk, sans-serif'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)';
                        e.currentTarget.style.boxShadow = '0 0 10px rgba(124, 58, 237, 0.3)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {query.length > 1 && results.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                  <Search style={{ width: '48px', height: '48px', color: '#334155' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E1B4B', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  No results for "{query}"
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>
                  Try different keywords or check spelling
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
                  {popularSearches.slice(0, 4).map(term => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      style={{
                        background: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED',
                        borderRadius: '20px', padding: '7px 14px',
                        fontSize: '13px', fontWeight: 600,
                        border: '1px solid rgba(124, 58, 237, 0.2)', cursor: 'pointer',
                        fontFamily: 'Space Grotesk, sans-serif'
                      }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif' }}>
                    Results for "{query}"
                  </p>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>{results.length} found</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {results.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
