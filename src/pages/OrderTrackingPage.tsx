import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, FileText } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { AnimatePresence } from 'framer-motion';
import DigitalInvoice from '@/components/DigitalInvoice';

const steps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface TrackOrder {
  id: string;
  order_status: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  payment_method: string;
  payment_status: string;
}

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<TrackOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    const fetch = async () => {
      const { data } = await supabase.from('orders').select('*').eq('id', id).eq('user_id', user.id).single();
      setOrder(data as any);
      setLoading(false);
    };
    fetch();
  }, [id, user]);

  if (loading) return <div className="app-shell flex items-center justify-center min-h-screen"><p className="text-muted-foreground">Loading...</p></div>;
  if (!order) return <div className="app-shell flex items-center justify-center min-h-screen"><p className="text-muted-foreground">Order not found</p></div>;

  const currentStepIndex = steps.findIndex(s => s.key === order.order_status);
  const address = order.shipping_address as unknown as Record<string, string>;
  const items = order.items as Array<{
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;

  return (
    <div className="app-shell">
      <main className="pb-24 lg:pb-10 max-w-2xl mx-auto md:pt-8">
        <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/account')} className="bg-transparent border-none p-0 cursor-pointer"><ArrowLeft className="w-6 h-6 text-foreground" /></button>
            <h1 className="text-base font-bold text-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          </div>
          <button 
            onClick={() => setShowInvoice(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/10 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all border border-blue-600/20"
          >
            <FileText className="w-3.5 h-3.5" /> Invoice
          </button>
        </div>

        {/* Status tracker */}
        <div className="px-6 py-6">
          <div className="relative">
            {steps.map((step, i) => {
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step.key} className="flex items-start gap-4 relative">
                  {i < steps.length - 1 && (
                    <div className={`absolute left-5 top-10 w-0.5 h-10 ${i < currentStepIndex ? 'bg-success' : 'bg-border'}`} />
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-success text-success-foreground' : 'bg-secondary text-muted-foreground'
                  } ${isCurrent ? 'ring-2 ring-success ring-offset-2' : ''}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="pb-8">
                    <p className={`text-sm font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                    {isCurrent && <p className="text-xs text-muted-foreground mt-0.5">Current status</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order details */}
        <div className="px-4 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Items</h3>
            {items.map((item, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-secondary/30 rounded" loading="lazy" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-sale">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>

          {/* Price summary */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">₹{Number(order.subtotal).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="text-foreground">{Number(order.shipping) === 0 ? 'FREE' : `₹${order.shipping}`}</span></div>

            <div className="flex justify-between text-base font-bold border-t border-border pt-2"><span className="text-foreground">Total</span><span className="text-foreground">₹{Number(order.total).toLocaleString('en-IN')}</span></div>
          </div>

          {/* Shipping address */}
          {address && (
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">Shipping Address</h3>
              </div>
              <p className="text-sm text-foreground">{address.fullName}</p>
              <p className="text-xs text-muted-foreground">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
              <p className="text-xs text-muted-foreground">{address.city}, {address.state} - {address.pincode}</p>
              <p className="text-xs text-muted-foreground">{address.phone}</p>
            </div>
          )}

          {/* Payment info */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">Payment</h3>
            <p className="text-sm text-foreground capitalize">{order.payment_method}</p>
            <span className={`text-xs font-semibold ${order.payment_status === 'paid' ? 'text-success' : 'text-yellow-600'}`}>
              {order.payment_status.toUpperCase()}
            </span>
          </div>
        </div>
      </main>
      <BottomNav />

      <AnimatePresence>
        {showInvoice && order && (
          <DigitalInvoice 
            order={order as unknown as Parameters<typeof DigitalInvoice>[0]['order']} 
            onClose={() => setShowInvoice(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderTrackingPage;
