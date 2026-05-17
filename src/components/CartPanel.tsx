import { useEffect, useState } from 'react';
import { X, Trash2, ShoppingBag, Tag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getProductImage } from '@/types/product';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

import { toast } from 'sonner';

const CartPanel = () => {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateCartQty, getCartTotal, appliedCoupon, setAppliedCoupon, useGst, setUseGst, gstDetails, setGstDetails } = useStore();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [categoryDiscounts, setCategoryDiscounts] = useState<Record<string, number>>({});
  const [quantityDiscounts, setQuantityDiscounts] = useState<any[]>([]);
  const [couponInput, setCouponInput] = useState('');

  useEffect(() => {
    if (cartOpen) {
      supabase.from('app_settings').select('key, value').then(({ data }) => {
        const map: Record<string, string> = {};
        (data || []).forEach(s => { map[s.key] = s.value || ''; });
        setSettings(map);
      });
      // Fetch B2B category discounts
      supabase.from('b2b_category_discounts' as any).select('category_id, category_name, discount_percent').then(({ data }: { data: any[] }) => {
        const discMap: Record<string, number> = {};
        (data || []).forEach(d => { 
          discMap[d.category_id] = Number(d.discount_percent) || 0; 
          if (d.category_name) discMap[d.category_name] = Number(d.discount_percent) || 0;
        });
        setCategoryDiscounts(discMap);
      });
      // Fetch B2B multi-tier quantity discounts
      supabase.from('b2b_quantity_discounts').select('*').order('min_quantity', { ascending: true }).then(({ data }) => {
        setQuantityDiscounts(data || []);
      });
    }
  }, [cartOpen]);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const bulkQtyThreshold = Number(settings.bulk_qty_threshold || 5);
  const bulkDiscountPercent = Number(settings.bulk_discount_percent || 5);
  const subtotal = getCartTotal();
  // Calculate category discount total when GST is used
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  const hasGstDiscount = useGst && gstRegex.test(gstDetails.number);
  const categoryDiscountTotal = hasGstDiscount
    ? cart.reduce((sum, item) => {
        const disc = categoryDiscounts[item.product.category_id || ''] || categoryDiscounts[item.product.category_name || ''] || 0;
        if (disc > 0) {
          return sum + Math.round((item.product.sale_price * item.quantity * disc) / 100);
        }
        return sum;
      }, 0)
    : 0;

  // Multi-tier quantity discount calculation
  const quantityDiscountTotal = cart.reduce((sum, item) => {
    // Find the highest applicable discount tier for this item's quantity
    const applicableTier = [...quantityDiscounts]
      .reverse() // Check from highest min_quantity downwards
      .find(tier => item.quantity >= tier.min_quantity);
    
    if (applicableTier && applicableTier.discount_percent > 0) {
      return sum + Math.round((item.product.sale_price * item.quantity * applicableTier.discount_percent) / 100);
    }
    return sum;
  }, 0);

  const totalDiscount = quantityDiscountTotal + categoryDiscountTotal;
  
  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponInput.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Invalid coupon code');
        return;
      }

      if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
        toast.error('Coupon has expired');
        return;
      }

      if (data.max_uses && data.used_count >= data.max_uses) {
        toast.error('Coupon usage limit reached');
        return;
      }

      if (data.min_order && subtotal < data.min_order) {
        toast.error(`Minimum order of ₹${data.min_order} required`);
        return;
      }

      setAppliedCoupon(data);
      toast.success('Coupon applied successfully!');
    } catch (err) {
      toast.error('Error applying coupon');
    }
  };

  const couponDiscountValue = appliedCoupon ? (
    appliedCoupon.discount_type === 'percent' 
      ? Math.round((subtotal * Number(appliedCoupon.discount_value)) / 100)
      : Number(appliedCoupon.discount_value)
  ) : 0;

  const afterDiscount = subtotal - totalDiscount - couponDiscountValue;

  useEffect(() => {
    if (appliedCoupon && appliedCoupon.min_order && subtotal < appliedCoupon.min_order) {
      setAppliedCoupon(null);
      toast.error(`Coupon removed: Minimum order of ₹${appliedCoupon.min_order} required`);
    }
  }, [subtotal, appliedCoupon, setAppliedCoupon]);

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
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="slide-up-overlay" onClick={() => setCartOpen(false)} />

          {/* Side Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            id="cart-panel"
            style={panelStyle}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid #DDD6FE', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif' }}>Shopping Cart</h2>
                  {cart.length > 0 && <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</p>}
                </div>
              </div>
              <button id="cart-close-btn" onClick={() => setCartOpen(false)}
                style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.05)')}>
                <X style={{ width: '18px', height: '18px', color: '#1E1B4B' }} />
              </button>
            </div>

            {cart.length === 0 ? (
              /* Empty State */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.05)', border: '2px dashed rgba(124, 58, 237, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <ShoppingBag style={{ width: '40px', height: '40px', color: '#7C3AED', opacity: 0.7 }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1B4B', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>Your cart is empty</h3>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px', fontWeight: 500 }}>Explore products and add them here</p>
                <button id="cart-start-shopping-btn" onClick={() => { setCartOpen(false); navigate('/shop'); }}
                  style={{ background: 'linear-gradient(90deg, #F59E0B, #FBBF24)', color: '#1E1B4B', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)'; }}>
                  Start Shopping <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Cart Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', scrollbarWidth: 'thin' }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0', borderBottom: '1px solid #F3F4F6' }}>
                      {/* Image */}
                      <div style={{ width: '75px', height: '75px', flexShrink: 0, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={getProductImage(item.product)} alt={item.product.name}
                          style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/60x60/F9FAFB/7C3AED?text=Img'; }} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="line-clamp-2" style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B', lineHeight: 1.4, fontFamily: 'Space Grotesk, sans-serif' }}>{item.product.name}</p>
                        {item.product.brand_name && <p style={{ fontSize: '10px', color: '#7C3AED', marginTop: '2px', fontWeight: 800, textTransform: 'uppercase' }}>{item.product.brand_name}</p>}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif' }}>
                            ₹{item.product.sale_price.toLocaleString('en-IN')}
                          </span>

                          {/* Qty controls + delete */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
                              <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                                style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#4B5563', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                              <span style={{ fontSize: '13px', fontWeight: 700, width: '24px', textAlign: 'center', color: '#1E1B4B' }}>{item.quantity}</span>
                              <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                                style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#4B5563', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.product.id)}
                              style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                              onMouseLeave={e => (e.currentTarget.style.background = '#FEF2F2')}>
                              <Trash2 style={{ width: '14px', height: '14px', color: '#EF4444' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer: summary + checkout */}
                <div style={{ padding: '20px', borderTop: '1px solid #E5E7EB', flexShrink: 0, background: '#F9FAFB' }}>
                  {/* Coupon */}
                  <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <Tag style={{ width: '16px', height: '16px', color: '#7C3AED', margin: 'auto 12px', flexShrink: 0 }} />
                    <input type="text" value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Enter coupon code"
                      style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }} />
                    <button id="apply-coupon-btn" onClick={handleApplyCoupon}
                      style={{ padding: '0 16px', background: '#7C3AED', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}>
                      APPLY
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px' }} /> Coupon "{appliedCoupon.code}" applied!
                      </p>
                      <button onClick={() => setAppliedCoupon(null)} style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '10px', fontWeight: 800, cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}>REMOVE</button>
                    </div>
                  )}

                  {/* GST Input */}
                  <div style={{ marginBottom: '16px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#1E1B4B', cursor: 'pointer', marginBottom: useGst ? '12px' : '0' }}>
                      <input type="checkbox" checked={useGst} onChange={e => setUseGst(e.target.checked)} style={{ accentColor: '#7C3AED', width: '16px', height: '16px' }} />
                      Apply B2B GST Category Discount
                    </label>
                    {useGst && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" value={gstDetails.number} onChange={e => setGstDetails({...gstDetails, number: e.target.value.toUpperCase()})} placeholder="Enter 15-digit GSTIN" maxLength={15}
                          style={{ width: '100%', padding: '12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', outline: 'none', fontSize: '13px', color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }} />
                        <input type="text" value={gstDetails.businessName} onChange={e => setGstDetails({...gstDetails, businessName: e.target.value})} placeholder="Enter Business Name"
                          style={{ width: '100%', padding: '12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', outline: 'none', fontSize: '13px', color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }} />
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '14px', color: '#4B5563', fontWeight: 500 }}>Subtotal</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E1B4B' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: quantityDiscountTotal > 0 ? '10px' : '0' }}>
                      <span style={{ fontSize: '14px', color: '#4B5563', fontWeight: 500 }}>Shipping</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>FREE</span>
                    </div>
                    {quantityDiscountTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '14px', color: '#059669', fontWeight: 600 }}>Quantity Discount</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>-₹{quantityDiscountTotal.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {hasGstDiscount && categoryDiscountTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '14px', color: '#059669', fontWeight: 600 }}>GST Category Discount</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>-₹{categoryDiscountTotal.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0' }}>
                        <span style={{ fontSize: '14px', color: '#059669', fontWeight: 600 }}>Coupon: {appliedCoupon.code}</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>-₹{couponDiscountValue.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div style={{ height: '1px', background: '#E5E7EB', margin: '14px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#1E1B4B' }}>Total</span>
                      <span style={{ fontSize: '22px', fontWeight: 900, color: '#7C3AED', fontFamily: 'Space Grotesk, sans-serif' }}>₹{afterDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <p style={{ textAlign: 'center', fontSize: '11px', color: '#6B7280', marginBottom: '14px', fontWeight: 600 }}>🔒 100% Secure & Encrypted Checkout</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button id="checkout-btn" onClick={() => { setCartOpen(false); navigate('/checkout'); }}
                      style={{ width: '100%', height: '52px', background: 'linear-gradient(90deg, #F59E0B, #FBBF24)', color: '#1E1B4B', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 900, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)'; }}>
                      Proceed to Checkout <ArrowRight style={{ width: '18px', height: '18px' }} />
                    </button>
                    <button id="continue-shopping-btn" onClick={() => { setCartOpen(false); navigate('/shop'); }}
                      style={{ width: '100%', height: '46px', background: '#FFFFFF', color: '#4B5563', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.3s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.color = '#7C3AED'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#4B5563'; }}>
                      ← Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartPanel;
