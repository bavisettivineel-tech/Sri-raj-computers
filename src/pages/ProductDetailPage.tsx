import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { getProductImage, getDiscount } from '@/types/product';
import { useStore } from '@/store/useStore';
import {
  ArrowLeft, Heart, ShoppingCart, Check, Minus, Plus,
  Truck, RotateCcw, Shield, Zap, Star, Award, MessageCircle,
  Package, Tag
} from 'lucide-react';
import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductCard from '@/components/ProductCard';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ProductReviews from '@/components/ProductReviews';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const WHATSAPP_NUMBER = '919949915177';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [qty, setQty] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { data: product, isLoading } = useProduct(id || '');
  const { data: relatedProducts = [] } = useProducts(5, product?.category_id);
  const related = relatedProducts.filter(p => p.id !== id);

  useEffect(() => {
    setActiveImageIdx(0);
  }, [id]);

  const [avgRating, setAvgRating] = useState(4.0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (product?.id) {
      const fetchRating = async () => {
        const { data } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', product.id);
        
        if (data && data.length > 0) {
          const avg = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
          setAvgRating(Number(avg.toFixed(1)));
          setTotalReviews(data.length);
        }
      };
      fetchRating();
    }
  }, [product?.id]);

  if (isLoading) {
    return (
      <div className="app-shell bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-[#0F172A] min-h-screen pb-36">
        <div style={{ padding: '16px' }}>
          <div className="skeleton" style={{ height: '320px', borderRadius: '16px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '10px' }} />
          <div className="skeleton" style={{ height: '16px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '8px' }} />
          <div className="skeleton" style={{ height: '52px', borderRadius: '12px', marginTop: '16px' }} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="app-shell bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-[#0F172A]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ padding: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Package style={{ width: '48px', height: '48px', color: '#64748b' }} />
        </div>
        <p style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>Product not found</p>
        <button onClick={() => navigate('/shop')} className="btn-primary" style={{ width: '180px', height: '46px' }}>
          Browse Shop
        </button>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const discount = getDiscount(product);
  const inStock = true; // product.stock_qty > 0;
  const descWords = (product.description || '').split(' ');
  const shortDesc = descWords.slice(0, 60).join(' ');
  const isLongDesc = descWords.length > 60;

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast.success('Added to cart!', { duration: 1500 });
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/checkout');
  };

  const whatsappMsg = encodeURIComponent(
    `Hi! I'm interested in *${product.name}* priced at ₹${product.sale_price.toLocaleString('en-IN')}. Is it available?`
  );

  return (
    <div className="app-shell bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-[#0F172A] min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 h-14"
        style={{
          background: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <button
          id="product-back-btn"
          onClick={() => navigate(-1)}
          style={{
            width: '36px', height: '36px', minHeight: '36px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <ArrowLeft style={{ width: '17px', height: '17px', color: 'white' }} />
        </button>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }} className="hidden md:block">Product Details</span>
        <button
          id="product-wishlist-header-btn"
          onClick={() => toggleWishlist(product)}
          style={{
            width: '36px', height: '36px', minHeight: '36px',
            borderRadius: '50%',
            background: wishlisted ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.08)',
            border: wishlisted ? '1px solid rgba(220,38,38,0.4)' : '1px solid rgba(255,255,255,0.12)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <Heart style={{ width: '17px', height: '17px', color: wishlisted ? '#ef4444' : 'white', fill: wishlisted ? '#ef4444' : 'none' }} />
        </button>
      </div>

      <main className="pb-40 lg:pb-12">
        {/* 2-column layout */}
        <div className="flex flex-col md:flex-row md:gap-8 md:px-6 lg:px-12 xl:px-20 md:py-8">

          {/* Image area */}
          <div className="md:w-[45%] md:sticky md:top-[56px] md:self-start">
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                minHeight: 'clamp(260px, 35vw, 420px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
              className="md:rounded-2xl md:border md:border-white/10"
            >
              {discount > 0 && (
                <div className="discount-badge" style={{ top: '12px', left: '12px', fontSize: '12px', padding: '4px 10px' }}>
                  -{discount}% OFF
                </div>
              )}

              {/* Low stock urgency */}
              {inStock && product.stock_qty <= 10 && product.stock_qty > 0 && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '10px', fontWeight: 700, color: '#ef4444',
                }}>
                  Only {product.stock_qty} left!
                </div>
              )}

              <img
                src={product.images?.[activeImageIdx] || getProductImage(product)}
                alt={product.name}
                style={{ objectFit: 'contain', width: 'clamp(180px, 30vw, 300px)', height: 'clamp(180px, 30vw, 300px)', padding: '16px' }}
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/280x280/0F172A/3B82F6?text=Product'; }}
              />
            </div>

            {/* Multiple Images Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide px-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: '60px', height: '60px', flexShrink: 0,
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.04)',
                      border: `2px solid ${activeImageIdx === idx ? '#3B82F6' : 'rgba(255,255,255,0.1)'}`,
                      overflow: 'hidden',
                      padding: '4px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Trust signals under image */}
            <div className="hidden md:flex gap-3 mt-4 flex-wrap">
              {[
                { icon: Shield, text: '100% Genuine', color: '#22C55E' },
                { icon: Truck, text: 'Free over ₹999', color: '#3B82F6' },
                { icon: RotateCcw, text: '7-Day Returns', color: '#f59e0b' },
                { icon: Award, text: '18+ Yrs Exp', color: '#10B981' },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', padding: '6px 10px',
                }}>
                  <Icon style={{ width: '13px', height: '13px', color }} />
                  <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 600 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info area */}
          <div className="md:w-[55%]">
            <div style={{
              background: 'rgba(15,23,42,0.7)',
              backdropFilter: 'blur(16px)',
              borderRadius: '20px 20px 0 0',
              marginTop: '-20px',
              padding: '20px 16px 0',
              position: 'relative',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
              borderRight: '1px solid rgba(255,255,255,0.05)',
            }} className="md:rounded-2xl md:border md:border-white/10 md:mt-0 md:backdrop-blur-none">

              {/* Brand Chip */}
              <span style={{
                display: 'inline-block',
                background: 'rgba(59,130,246,0.1)',
                color: '#3B82F6',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 700,
                marginBottom: '10px',
                border: '1px solid rgba(59,130,246,0.25)',
                letterSpacing: '0.5px',
              }}>
                {product.brand_name || 'Brand'}
              </span>

              {/* Product Name */}
              <h1 style={{ fontSize: 'clamp(17px, 3vw, 24px)', fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: '12px' }}>
                {product.name}
              </h1>

              {/* Rating row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} style={{ width: '13px', height: '13px', fill: i <= Math.round(avgRating) ? '#f59e0b' : 'none', color: i <= Math.round(avgRating) ? '#f59e0b' : '#334155' }} />
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{avgRating} · {totalReviews} reviews · 120+ sold</span>
                {inStock && (
                  <span style={{
                    background: 'rgba(34,197,94,0.1)', color: '#22C55E',
                    border: '1px solid rgba(34,197,94,0.25)',
                    borderRadius: '6px', padding: '2px 8px',
                    fontSize: '11px', fontWeight: 700,
                  }}>
                    ✓ In Stock
                  </span>
                )}
              </div>

              {/* Price Row */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 'clamp(22px, 4vw, 32px)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  ₹{product.sale_price.toLocaleString('en-IN')}
                </span>
                {product.mrp > product.sale_price && (
                  <span style={{ fontSize: '15px', color: '#475569', textDecoration: 'line-through' }}>
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {discount > 0 && (
                  <span style={{
                    background: 'rgba(16,185,129,0.2)',
                    color: '#a78bfa',
                    border: '1px solid rgba(16,185,129,0.35)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '12px', fontWeight: 700,
                  }}>
                    <Tag style={{ width: '12px', height: '12px' }} /> {discount}% OFF
                  </span>
                )}
              </div>

              {/* Savings callout */}
              {product.mrp > product.sale_price && (
                <div style={{
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Award style={{ width: '18px', height: '18px', color: '#22c55e' }} />
                  <p style={{ fontSize: '13px', color: '#22C55E', fontWeight: 700 }}>
                    You save ₹{(product.mrp - product.sale_price).toLocaleString('en-IN')} on this order!
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Qty:</span>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  border: '1px solid rgba(59,130,246,0.25)',
                  borderRadius: '10px', height: '40px',
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.25)',
                }}>
                  <button
                    id="product-qty-minus"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    style={{ width: '40px', height: '40px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#3B82F6', fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Minus style={{ width: '14px', height: '14px' }} />
                  </button>
                  <span style={{ width: '36px', textAlign: 'center', fontSize: '15px', fontWeight: 700, color: 'white' }}>{qty}</span>
                  <button
                    id="product-qty-plus"
                    onClick={() => setQty(qty + 1)}
                    style={{ width: '40px', height: '40px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#3B82F6', fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
                {product.stock_qty <= 10 && product.stock_qty > 0 && (
                  <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
                    <Zap style={{ width: '10px', height: '10px' }} /> Only {product.stock_qty} left
                  </span>
                )}
              </div>

              {/* PRIMARY CTAs */}
              {inStock ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {/* Buy Now — PRIMARY action */}
                  <motion.button
                    id="product-buy-now-btn"
                    onClick={handleBuyNow}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%',
                      height: '52px',
                      minHeight: '52px',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      fontSize: '16px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
                      letterSpacing: '0.3px',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(59,130,246,0.55)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.35)'; }}
                  >
                    <Zap style={{ width: '18px', height: '18px' }} />
                    Buy Now — ₹{product.sale_price.toLocaleString('en-IN')}
                  </motion.button>

                  {/* Add to Cart — SECONDARY action */}
                  <button
                    id="product-add-cart-btn"
                    onClick={handleAddToCart}
                    style={{
                      width: '100%',
                      height: '46px',
                      minHeight: '46px',
                      background: 'rgba(59,130,246,0.08)',
                      color: '#3B82F6',
                      border: '1.5px solid rgba(59,130,246,0.35)',
                      borderRadius: '14px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
                  >
                    <ShoppingCart style={{ width: '16px', height: '16px' }} />
                    Add to Cart
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <button disabled style={{
                    width: '100%', height: '52px', minHeight: '52px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#475569', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'not-allowed',
                  }}>
                    Out of Stock
                  </button>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I want to know when *${product.name}* will be back in stock.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '100%', height: '46px', minHeight: '46px',
                      background: 'rgba(34,197,94,0.1)',
                      color: '#22C55E',
                      border: '1.5px solid rgba(34,197,94,0.3)',
                      borderRadius: '14px',
                      fontSize: '14px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <MessageCircle style={{ width: '16px', height: '16px' }} />
                    Notify Me via WhatsApp
                  </a>
                </div>
              )}

              {/* WhatsApp assist */}
              <a
                id="product-whatsapp-assist"
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'rgba(37,211,102,0.08)',
                  border: '1px solid rgba(37,211,102,0.2)',
                  borderRadius: '12px',
                  padding: '10px',
                  fontSize: '13px', fontWeight: 600, color: '#22C55E',
                  textDecoration: 'none',
                  marginBottom: '16px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.08)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#22C55E">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Ask us on WhatsApp for best price
              </a>

              {/* Wishlist button */}
              <button
                id="product-wishlist-btn"
                onClick={() => toggleWishlist(product)}
                style={{
                  width: '100%',
                  height: '42px', minHeight: '42px',
                  borderRadius: '12px',
                  border: `1.5px solid ${wishlisted ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.12)'}`,
                  background: wishlisted ? 'rgba(220,38,38,0.08)' : 'rgba(255,255,255,0.04)',
                  color: wishlisted ? '#ef4444' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  marginBottom: '20px',
                }}
              >
                <Heart style={{ width: '15px', height: '15px', fill: wishlisted ? '#ef4444' : 'none' }} />
                {wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
              </button>

              {/* Delivery / Trust Info Card */}
              <div style={{
                background: 'rgba(59,130,246,0.04)',
                border: '1px solid rgba(59,130,246,0.12)',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Truck style={{ width: '17px', height: '17px', color: '#3B82F6', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#3B82F6' }}>Free Delivery on orders ₹999+</p>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>Ships in 1–2 business days</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield style={{ width: '17px', height: '17px', color: '#22C55E', flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>100% Genuine · Easy Returns within 7 days</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Award style={{ width: '17px', height: '17px', color: '#f59e0b', flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>18+ years in IT business · Peddapuram, AP</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <RotateCcw style={{ width: '17px', height: '17px', color: '#10B981', flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>Secured payment via Razorpay</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Description Card */}
        {product.description && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            margin: '10px 12px',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '10px' }}>Description</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.75 }}>
              {isLongDesc && !showFullDesc ? `${shortDesc}...` : product.description}
            </p>
            {isLongDesc && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 600, fontSize: '13px', cursor: 'pointer', marginTop: '8px', padding: 0 }}
              >
                {showFullDesc ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            margin: '10px 12px',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '14px' }}>Specifications</h3>
            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
              {Object.entries(product.specifications).map(([key, value], idx) => (
                <div
                  key={key}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '11px 14px',
                    background: idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', flex: 1 }}>{key}</span>
                  <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 500, textAlign: 'right', flex: 1 }}>
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Proof */}
        <div style={{
          background: 'rgba(59,130,246,0.04)',
          border: '1px solid rgba(59,130,246,0.1)',
          margin: '10px 12px',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex', gap: '16px', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {[
            { icon: <Star style={{ width: '18px', height: '18px', color: '#f59e0b' }} />, value: `${avgRating}/5`, label: 'Rating' },
            { icon: <ShoppingCart style={{ width: '18px', height: '18px', color: '#3B82F6' }} />, value: '120+', label: 'Orders' },
            { icon: <Award style={{ width: '18px', height: '18px', color: '#10B981' }} />, value: '18+ Yrs', label: 'Experience' },
            { icon: <Shield style={{ width: '18px', height: '18px', color: '#f59e0b' }} />, value: 'Razorpay', label: 'Secure Pay' },
          ].map(({ icon, value, label }) => (
            <div key={label} style={{ textAlign: 'center', minWidth: '60px' }}>
              <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>{value}</div>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Customer Reviews Section */}
        <div style={{ margin: '10px 12px', paddingBottom: '20px' }}>
          <ProductReviews productId={product.id} />
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div style={{ margin: '10px 0', padding: '20px 12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'white', marginBottom: '14px' }}>Related Products</h3>
            <div className="products-grid" style={{ padding: 0 }}>
              {related.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </main>


      <WhatsAppButton />
      <BottomNav />
    </div>
  );
};

export default ProductDetailPage;
