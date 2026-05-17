import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { getProductImage } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Check, CreditCard, Smartphone, Banknote, ChevronRight, ShoppingBag, MapPin, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import DigitalInvoice from '@/components/DigitalInvoice';
import './checkout-theme.css';

// Razorpay Live Key (Using Environment Variable)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SeqaZpOnnE1Yu5';

const StepIndicator = ({ step }: { step: number }) => (
  <div className="px-4 py-8">
    <div className="flex items-center justify-between max-w-sm mx-auto">
      {['Cart', 'Shipping', 'Payment'].map((label, i) => (
        <div key={label} className="flex flex-col items-center relative flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${
            step > i + 1 ? 'step-completed' :
            step === i + 1 ? 'step-active' 
                           : 'step-pending'
          }`}>
            {step > i + 1 ? <Check className="w-5 h-5" /> : <span className="text-sm font-bold">{i + 1}</span>}
          </div>
          <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${step === i + 1 ? 'step-label-active' : (step > i + 1 ? 'step-label-completed' : 'step-label-pending')}`}>{label}</span>
          {i < 2 && (
            <div className="absolute top-5 left-[calc(50%+25px)] w-[calc(100%-50px)] h-[2px] step-connector-track">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: step > i + 1 ? '100%' : '0%' }}
                className={`h-full ${step > i + 1 ? 'step-connector-completed' : 'step-connector-pending'}`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart, setAuthOpen, appliedCoupon, setAppliedCoupon, useGst, setUseGst, gstDetails, setGstDetails } = useStore();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [address, setAddress] = useState({
    fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [categoryDiscounts, setCategoryDiscounts] = useState<Record<string, number>>({});
  const [quantityDiscounts, setQuantityDiscounts] = useState<any[]>([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [finalOrder, setFinalOrder] = useState<Database['public']['Tables']['orders']['Row'] | null>(null);

  useEffect(() => {
    supabase.from('app_settings').select('key, value').then(({data}) => {
       const map: Record<string, string> = {};
       (data || []).forEach(s => { map[s.key] = s.value || ''; });
       setSettings(map);
    });
    supabase.from('b2b_category_discounts' as any).select('category_id, category_name, discount_percent').then(({ data }: { data: any[] }) => {
      const discMap: Record<string, number> = {};
      (data || []).forEach(d => { 
        discMap[d.category_id] = Number(d.discount_percent) || 0; 
        if (d.category_name) discMap[d.category_name] = Number(d.discount_percent) || 0;
      });
      setCategoryDiscounts(discMap);
    });
    supabase.from('b2b_quantity_discounts').select('*').order('min_quantity', { ascending: true }).then(({ data }) => {
      setQuantityDiscounts(data || []);
    });
  }, []);

  useEffect(() => {
    if (user && step === 2) {
      const fetchDefaultAddress = async () => {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .maybeSingle();
        
        if (data && !error) {
          setAddress({
            fullName: data.full_name,
            phone: data.phone,
            line1: data.address_line1,
            line2: data.address_line2 || '',
            city: data.city,
            state: data.state,
            pincode: data.pincode,
          });
        }
      };
      fetchDefaultAddress();
    }
  }, [user, step]);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const bulkQtyThreshold = Number(settings.bulk_qty_threshold || 5);
  const bulkDiscountPercent = Number(settings.bulk_discount_percent || 5);
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  const hasGstDiscount = useGst && gstRegex.test(gstDetails.number);

  const subtotal = getCartTotal();
  
  const categoryDiscountTotal = hasGstDiscount
    ? cart.reduce((sum, item) => {
        const disc = categoryDiscounts[item.product.category_id || ''] || categoryDiscounts[item.product.category_name || ''] || 0;
        if (disc > 0) {
          return sum + Math.round((item.product.sale_price * item.quantity * disc) / 100);
        }
        return sum;
      }, 0)
    : 0;

  const quantityDiscountTotal = cart.reduce((sum, item) => {
    const applicableTier = [...quantityDiscounts]
      .reverse()
      .find(tier => item.quantity >= tier.min_quantity);
    
    if (applicableTier && applicableTier.discount_percent > 0) {
      return sum + Math.round((item.product.sale_price * item.quantity * applicableTier.discount_percent) / 100);
    }
    return sum;
  }, 0);
  
  const couponDiscountValue = appliedCoupon ? (
    appliedCoupon.discount_type === 'percent' 
      ? Math.round((subtotal * Number(appliedCoupon.discount_value)) / 100)
      : Number(appliedCoupon.discount_value)
  ) : 0;

  const totalDiscount = quantityDiscountTotal + categoryDiscountTotal + couponDiscountValue;
  const afterDiscount = subtotal - totalDiscount;

  const shipping = afterDiscount > 999 ? 0 : 99;
  const tax = 0;
  const total = afterDiscount + shipping;

  const handleRazorpayPayment = async () => {
    return new Promise((resolve, reject) => {
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: total * 100, // Amount in paise
        currency: 'INR',
        name: 'Sri Raj Computers',
        description: 'Secure Order Payment',
        image: 'https://storage.googleapis.com/gpt-engineer-file-uploads/LD07L9leZhMnzHfzUYivhEcGzNv2/social-images/social-1775787404480-1000058758.webp',
        handler: function (response: { razorpay_payment_id: string }) {
          resolve(response.razorpay_payment_id);
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
          email: user?.email,
        },
        theme: {
          color: '#2563eb', // Primary Blue
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.error('Payment cancelled');
            reject(new Error('Payment cancelled'));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      setAuthOpen(true);
      toast.error('Please login to place an order');
      return;
    }

    if (step === 2) {
      if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
        toast.error('Please fill all required fields');
        return;
      }
      if (useGst) {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
        if (!gstRegex.test(gstDetails.number)) {
          toast.error('Please enter a valid 15-digit GST Number');
          return;
        }
        if (!gstDetails.businessName || gstDetails.businessName.trim() === '') {
          toast.error('Please enter the Business Name');
          return;
        }
      }
      setStep(3);
      return;
    }

    setLoading(true);
    let paymentId = 'cod';

    try {
      if (paymentMethod !== 'cod') {
        paymentId = await handleRazorpayPayment() as string;
      }

      const { data, error } = await supabase.from('orders').insert({
        user_id: user.id,
        items: cart.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          price: item.product.sale_price,
          quantity: item.quantity,
          image: getProductImage(item.product)
        })),
        subtotal,
        shipping,
        tax,
        total,
        coupon_id: appliedCoupon?.id || null,
        shipping_address: {
          ...address,
          gstNumber: useGst ? gstDetails.number : null,
          businessName: useGst ? gstDetails.businessName : null,
          discountAmount: totalDiscount,
          discountLabel: appliedCoupon ? `Coupon ${appliedCoupon.code}` : (hasGstDiscount ? 'GST Partner' : (quantityDiscountTotal > 0 ? 'Quantity Discount' : 'No Discount'))
        },
        payment_method: paymentMethod,
        order_status: 'pending',
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        payment_id: paymentId
      }).select('*').single();

      if (error) throw error;

      if (appliedCoupon) {
        await supabase.from('coupons').update({ 
          used_count: (appliedCoupon.used_count || 0) + 1 
        }).eq('id', appliedCoupon.id);
        setAppliedCoupon(null);
      }

      setFinalOrder(data);
      setOrderId(data.id.slice(0, 8).toUpperCase());
      clearCart();
      setStep(4);
      setShowInvoice(true);
      toast.success('Order placed successfully!');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : typeof err === 'object' && err !== null && 'message' in err ? String((err as { message: unknown }).message) : String(err);
      if (errorMsg !== 'Payment cancelled') {
        toast.error(errorMsg || 'Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };


  if (cart.length === 0 && step !== 4) {
    return (
      <div className="checkout-page app-shell bg-[#0b121e] min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
          <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-[#3B82F6]" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Your cart is empty</h2>
          <p className="text-slate-400 mb-8 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
          <button onClick={() => navigate('/shop')} className="btn-primary min-w-[200px] h-12">
            EXPLORE PRODUCTS
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="checkout-page app-shell bg-[#0b121e] min-h-screen pb-24">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 mt-6">
        {step < 4 && (
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/shop')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group w-auto bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Back</span>
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-12">
            {step < 4 && <StepIndicator step={step} />}
          </div>

          {/* LEFT COLUMN: Steps Form */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="glass-panel rounded-3xl p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                       <ShoppingBag className="w-5 h-5 text-[#3B82F6]" />
                       Order Summary
                    </h2>
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex gap-4 items-center p-3 rounded-2xl cart-item-card transition-colors">
                          <div className="w-20 h-20 product-image-area rounded-xl overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
                            <img src={getProductImage(item.product)} alt={item.product.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate product-name">{item.product.name}</p>
                            <p className="text-xs quantity-label mt-1">Quantity: {item.quantity}</p>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-sm font-bold current-price">₹{item.product.sale_price.toLocaleString('en-IN')}</span>
                               {item.product.mrp > item.product.sale_price && (
                                 <span className="text-xs original-price">₹{item.product.mrp}</span>
                               )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => { if (!user) { setAuthOpen(true); toast.error('Please login first'); return; } setStep(2); }}
                    className="w-full btn-primary btn-shipping h-14 flex items-center justify-center gap-2 text-[15px] tracking-wide">
                    CONTINUE TO SHIPPING <ChevronRight className="w-5 h-5 pointer-events-none" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="glass-panel rounded-3xl p-6">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                       <MapPin className="w-5 h-5 text-[#3B82F6]" />
                       Shipping Address
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-extrabold text-slate-400 ml-1 uppercase tracking-wider">Full Name</label>
                        <input placeholder="Enter full name" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 transition-all outline-none placeholder:text-slate-500" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-extrabold text-slate-400 ml-1 uppercase tracking-wider">Phone Number</label>
                        <input placeholder="10-digit mobile number" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 transition-all outline-none placeholder:text-slate-500" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-extrabold text-slate-400 ml-1 uppercase tracking-wider">Address Line 1</label>
                        <input placeholder="House No, Building, Street" value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 transition-all outline-none placeholder:text-slate-500" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                         <label className="text-[10px] font-extrabold text-slate-400 ml-1 uppercase tracking-wider">Address Line 2 (Optional)</label>
                        <input placeholder="Area, Landmark" value={address.line2} onChange={e => setAddress({...address, line2: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 transition-all outline-none placeholder:text-slate-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 ml-1 uppercase tracking-wider">City</label>
                        <input placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 transition-all outline-none placeholder:text-slate-500" />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-extrabold text-slate-400 ml-1 uppercase tracking-wider">State</label>
                        <input placeholder="State" value={address.state} onChange={e => setAddress({...address, state: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 transition-all outline-none placeholder:text-slate-500" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                        <label className="text-[10px] font-extrabold text-slate-400 ml-1 uppercase tracking-wider">Pincode</label>
                        <input placeholder="6-digit pincode" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 transition-all outline-none placeholder:text-slate-500" />
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center gst-icon-wrapper">
                          <CreditCard className="w-4 h-4 text-[#3B82F6]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black gst-heading">GST Details (Optional)</h3>
                          <p className="text-[10px] font-bold uppercase tracking-wider gst-subtext">Get extra {bulkDiscountPercent}% discount with GST</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 mt-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${useGst ? 'bg-[#3B82F6] border-[#3B82F6]' : 'border-slate-300 bg-white group-hover:border-[#3B82F6]'}`}>
                          {useGst && <Check className="w-3.5 h-3.5 text-white font-black" />}
                        </div>
                        <input type="checkbox" checked={useGst} onChange={e => setUseGst(e.target.checked)} className="hidden" />
                        <span className="text-sm font-bold text-slate-700 select-none group-hover:text-[#3B82F6] transition-colors">Apply B2B GST Category Discount</span>
                      </label>

                      <AnimatePresence>
                        {useGst && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden"
                          >
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-extrabold text-slate-500 ml-1 uppercase tracking-wider">GST Number</label>
                              <input placeholder="Enter 15-digit GSTIN" value={gstDetails.number} onChange={e => setGstDetails({...gstDetails, number: e.target.value.toUpperCase()})}
                                maxLength={15}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 transition-all outline-none placeholder:text-slate-400 shadow-sm" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-extrabold text-slate-500 ml-1 uppercase tracking-wider">Business Name</label>
                              <input placeholder="Enter registered business name" value={gstDetails.businessName} onChange={e => setGstDetails({...gstDetails, businessName: e.target.value})}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 transition-all outline-none placeholder:text-slate-400 shadow-sm" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <button onClick={handlePlaceOrder}
                    className="w-full btn-primary btn-shipping h-14 flex items-center justify-center gap-2 text-[15px] tracking-wide mt-6">
                    CONTINUE TO PAYMENT <ChevronRight className="w-5 h-5 pointer-events-none" />
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="glass-panel rounded-3xl p-6">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                       <ShieldCheck className="w-5 h-5 text-[#3B82F6]" />
                       Select Payment Method
                    </h2>
                    <div className="space-y-3">
                      {[
                        { key: 'upi', icon: <Smartphone className="w-6 h-6" />, label: 'UPI / Google Pay / PhonePe' },
                        { key: 'card', icon: <CreditCard className="w-6 h-6" />, label: 'Credit / Debit Card' },
                        { key: 'cod', icon: <Banknote className="w-6 h-6" />, label: 'Cash on Delivery' },
                      ].map(pm => (
                        <button key={pm.key} onClick={() => setPaymentMethod(pm.key)}
                          className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all cursor-pointer payment-option-card ${
                            paymentMethod === pm.key ? 'selected' : ''
                          }`}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center payment-icon-wrapper`}>
                            {pm.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-sm font-bold block payment-label">{pm.label}</span>
                            <span className="text-xs payment-sublabel">{pm.key === 'cod' ? 'Pay when you receive the order' : 'Secure payment via Razorpay'}</span>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all radio-btn`}>
                            {paymentMethod === pm.key && <Check className="w-4 h-4 text-white font-black" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handlePlaceOrder} disabled={loading}
                    className={`w-full btn-primary btn-secure-pay h-14 flex items-center justify-center gap-2 text-[15px] tracking-wide mt-6 ${loading ? 'opacity-70 pointer-events-none' : ''}`}>
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        {paymentMethod === 'cod' ? 'PLACE ORDER' : 'SECURELY PAY NOW'} 
                        <ShieldCheck className="w-5 h-5 ml-1" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel rounded-[40px] p-8 md:p-12 text-center flex flex-col items-center justify-center order-confirmation-card"
                >
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 relative order-success-icon-wrapper">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-10 h-10" />
                    </motion.div>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-black mb-4 order-success-heading">Awesome! Order Placed.</h2>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl inline-block mb-4">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 shadow-sm">Order ID</p>
                    <p className="text-xl font-black order-number-text">#SRC{orderId}</p>
                  </div>
                  
                  <p className="text-slate-400 mb-10 max-w-xs mx-auto text-sm leading-relaxed">
                    Thank you for choosing Sri Raj Computers. We'll send you a confirmation message shortly.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 w-full max-w-[280px]">
                    <button onClick={() => setShowInvoice(true)} className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-blue-600/10 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all mb-2">
                       View Digital Invoice
                    </button>
                    <button onClick={() => navigate('/account')} className="btn-primary btn-continue-shopping w-full h-14 tracking-wide">
                      TRACK MY ORDER
                    </button>
                    <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white font-bold py-4 transition-colors w-full bg-transparent border-none cursor-pointer">
                      Back to Home
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Price Breakup (Sticky) */}
          {step < 4 && (
            <div className="lg:col-span-5 lg:sticky lg:top-24 mt-6 lg:mt-0">
              <div className="glass-panel rounded-3xl p-6 price-details-card">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest mb-6 price-details-heading">Price Details</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="bag-total-label">Bag Total</span>
                    <span className="bag-total-value">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  
                  {totalDiscount > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-2"
                    >
                      {quantityDiscountTotal > 0 && (
                        <div className="flex justify-between items-center text-sm text-[#22C55E]">
                          <span className="font-bold">Quantity Discount</span>
                          <span className="font-bold">-₹{quantityDiscountTotal.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {categoryDiscountTotal > 0 && hasGstDiscount && (
                        <div className="flex justify-between items-center text-sm text-[#22C55E]">
                          <span className="font-bold">GST Category Discount</span>
                          <span className="font-bold">-₹{categoryDiscountTotal.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {couponDiscountValue > 0 && appliedCoupon && (
                        <div className="flex justify-between items-center text-sm text-[#22C55E]">
                          <span className="font-bold">Coupon ({appliedCoupon.code})</span>
                          <span className="font-bold">-₹{couponDiscountValue.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="shipping-fee-label">Shipping Fee</span>
                    <span className={`font-bold ${shipping === 0 ? 'shipping-fee-value-free' : 'bag-total-value'}`}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  

                  
                  <div className="total-amount-divider my-4" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-base font-black bag-total-value">Total Amount</span>
                    <span className="text-2xl font-black total-amount-value">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-2xl flex gap-4 items-center secure-checkout-badge">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shield-icon-wrapper">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1">Secure Checkout</p>
                    <p className="text-[11px] font-medium">100% Genuine Products & Secure Payments</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />

      <AnimatePresence>
        {showInvoice && finalOrder && (
          <DigitalInvoice 
            order={finalOrder as any} 
            onClose={() => setShowInvoice(false)} 
            autoDownload={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutPage;
