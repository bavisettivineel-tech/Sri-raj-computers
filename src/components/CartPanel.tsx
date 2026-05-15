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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(0,123,255,0.12)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0,123,255,0.15)', border: '1px solid rgba(0,123,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag style={{ width: '18px', height: '18px', color: '#007bff' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'white', fontFamily: 'Montserrat, sans-serif' }}>Shopping Cart</h2>
                  {cart.length > 0 && <p style={{ fontSize: '11px', color: '#64748b' }}>{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</p>}
                </div>
              </div>
              <button id="cart-close-btn" onClick={() => setCartOpen(false)}
                style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                <X style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
              </button>
            </div>

            {cart.length === 0 ? (
              /* Empty State */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(0,123,255,0.08)', border: '2px dashed rgba(0,123,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <ShoppingBag style={{ width: '40px', height: '40px', color: '#007bff', opacity: 0.7 }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '8px', fontFamily: 'Montserrat, sans-serif' }}>Your cart is empty</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>Explore products and add them here</p>
                <button id="cart-start-shopping-btn" onClick={() => { setCartOpen(false); navigate('/shop'); }}
                  style={{ background: '#ffc107', color: '#000', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e0a800')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#ffc107')}>
                  Start Shopping <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Cart Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', scrollbarWidth: 'thin' }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid rgba(0,123,255,0.08)' }}>
                      {/* Image */}
                      <div style={{ width: '70px', height: '70px', flexShrink: 0, background: '#0b1629', border: '1px solid rgba(0,123,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={getProductImage(item.product)} alt={item.product.name}
                          style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/60x60/0b1629/007bff?text=Img'; }} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="line-clamp-2" style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4 }}>{item.product.name}</p>
                        {item.product.brand_name && <p style={{ fontSize: '10px', color: '#007bff', marginTop: '2px' }}>{item.product.brand_name}</p>}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#007bff' }}>
                            ₹{item.product.sale_price.toLocaleString('en-IN')}
                          </span>

                          {/* Qty controls + delete */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#0b1629', border: '1px solid rgba(0,123,255,0.25)', borderRadius: '6px', overflow: 'hidden' }}>
                              <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                                style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#007bff', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                              <span style={{ fontSize: '13px', fontWeight: 700, width: '24px', textAlign: 'center', color: 'white' }}>{item.quantity}</span>
                              <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                                style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#007bff', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.product.id)}
                              style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.25)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}>
                              <Trash2 style={{ width: '12px', height: '12px', color: '#ef4444' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer: summary + checkout */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0,123,255,0.12)', flexShrink: 0 }}>
                  {/* Coupon */}
                  <div style={{ display: 'flex', background: '#0b1629', border: '1px solid rgba(0,123,255,0.2)', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px' }}>
                    <Tag style={{ width: '16px', height: '16px', color: '#007bff', margin: 'auto 12px', flexShrink: 0 }} />
                    <input type="text" value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Enter coupon code"
                      style={{ flex: 1, padding: '11px 0', background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#e2e8f0', fontFamily: 'Montserrat, sans-serif' }} />
                    <button id="apply-coupon-btn" onClick={handleApplyCoupon}
                      style={{ padding: '0 14px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#0056b3')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#007bff')}>
                      APPLY
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <p style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px' }} /> Coupon "{appliedCoupon.code}" applied!
                      </p>
                      <button onClick={() => setAppliedCoupon(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '10px', fontWeight: 700, cursor: 'pointer', padding: '2px 8px' }}>REMOVE</button>
                    </div>
                  )}

                  {/* GST Input */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#e2e8f0', cursor: 'pointer', marginBottom: useGst ? '8px' : '0' }}>
                      <input type="checkbox" checked={useGst} onChange={e => setUseGst(e.target.checked)} style={{ accentColor: '#007bff' }} />
                      Apply B2B GST Category Discount
                    </label>
                    {useGst && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input type="text" value={gstDetails.number} onChange={e => setGstDetails({...gstDetails, number: e.target.value.toUpperCase()})} placeholder="Enter 15-digit GSTIN" maxLength={15}
                          style={{ width: '100%', padding: '10px 12px', background: '#0b1629', border: '1px solid rgba(0,123,255,0.2)', borderRadius: '6px', outline: 'none', fontSize: '12px', color: '#e2e8f0', fontFamily: 'Montserrat, sans-serif' }} />
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div style={{ background: '#0b1629', border: '1px solid rgba(0,123,255,0.12)', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Subtotal</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: quantityDiscountTotal > 0 ? '8px' : '0' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Shipping</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>FREE</span>
                    </div>
                    {quantityDiscountTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#22c55e' }}>Quantity Discount</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>-₹{quantityDiscountTotal.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {hasGstDiscount && categoryDiscountTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#22c55e' }}>GST Category Discount</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>-₹{categoryDiscountTotal.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0' }}>
                        <span style={{ fontSize: '13px', color: '#22c55e' }}>Coupon: {appliedCoupon.code}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>-₹{couponDiscountValue.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div style={{ height: '1px', background: 'rgba(0,123,255,0.12)', margin: '12px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>Total</span>
                      <span style={{ fontSize: '20px', fontWeight: 900, color: '#007bff', textShadow: '0 0 12px rgba(0,123,255,0.4)' }}>₹{afterDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <p style={{ textAlign: 'center', fontSize: '11px', color: '#475569', marginBottom: '12px' }}>🔒 100% Secure & Encrypted Checkout</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button id="checkout-btn" onClick={() => { setCartOpen(false); navigate('/checkout'); }}
                      style={{ width: '100%', height: '48px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#e0a800'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,193,7,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#ffc107'; e.currentTarget.style.boxShadow = 'none'; }}>
                      Proceed to Checkout <ArrowRight style={{ width: '16px', height: '16px' }} />
                    </button>
                    <button id="continue-shopping-btn" onClick={() => { setCartOpen(false); navigate('/shop'); }}
                      style={{ width: '100%', height: '42px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', transition: 'all 0.3s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,123,255,0.4)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}>
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
