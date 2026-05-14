import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import WhatsAppButton from '@/components/WhatsAppButton';
import { User, Package, MapPin, LogOut, ChevronRight, Plus, Trash2, ShoppingBag, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import DigitalInvoice from '@/components/DigitalInvoice';

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'delivered':  return { background: '#d1fae5', color: '#16a34a' };
    case 'shipped':    return { background: '#dbeafe', color: '#1a3fcb' };
    case 'confirmed':  return { background: '#e0f2fe', color: '#0369a1' };
    case 'cancelled':  return { background: '#fee2e2', color: '#dc2626' };
    default:           return { background: '#fef9c3', color: '#d97706' };
  }
};

interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  order_status: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  created_at: string;
  payment_method: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
}
interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}
interface Profile {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

const inputStyle = {
  width: '100%',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '14px',
  color: '#0f172a',
  outline: 'none',
};

const MyAccountPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [tab, setTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', pincode: '', is_default: false,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Profile>({
    first_name: '', last_name: '', phone: ''
  });
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate('/');
      else if (isAdmin) navigate('/admin/dashboard');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const [ordersRes, addressesRes, profileRes] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }),
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      ]);
      setOrders((ordersRes.data as unknown as Order[]) || []);
      setAddresses(addressesRes.data || []);
      setProfile(profileRes.data);
      if (profileRes.data) {
        setEditForm({
          first_name: profileRes.data.first_name || '',
          last_name: profileRes.data.last_name || '',
          phone: profileRes.data.phone || '',
        });
      }
      setLoading(false);

    };
    fetchData();
  }, [user]);

  const handleAddAddress = async () => {
    if (!user) return;
    
    if (addressForm.is_default) {
      // Unset existing default addresses
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    }

    const { error } = await supabase.from('addresses').insert({ ...addressForm, user_id: user.id });
    if (error) { toast.error(error.message); return; }
    toast.success('Address added!');
    setShowAddressForm(false);
    setAddressForm({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false });
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
    setAddresses(data || []);
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
    setAddresses(data || []);
    toast.success('Default address updated');
  };

  const handleDeleteAddress = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(addresses.filter(a => a.id !== id));
    toast.success('Address removed');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleCancelOrder = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error('Cancellation reason is required.');
      return;
    }
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const diff = Date.now() - new Date(order.created_at).getTime();
    if (diff > 24 * 60 * 60 * 1000) {
      toast.error('Orders can only be cancelled within 24 hours of placing them.');
      return;
    }

    const { error } = await supabase.from('orders').update({ order_status: 'cancelled' }).eq('id', orderId);
    if (error) {
      toast.error('Failed to cancel order.');
      return;
    }
    toast.success('Order cancelled successfully.');
    setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: 'cancelled' } : o));
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone: editForm.phone,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated successfully!');
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
    }
  };


  if (authLoading || loading) {
    return (
      <div className="app-shell" style={{ background: '#f8fafc' }}>
        <div style={{ padding: '0 16px 16px' }}>
          <div className="skeleton" style={{ height: '200px', borderRadius: '0 0 20px 20px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '52px', borderRadius: '12px', marginBottom: '12px' }} />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px', marginBottom: '12px' }} />
          ))}
        </div>
      </div>
    );
  }

  const displayName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user?.email?.split('@')[0] || 'Customer';
  const initials = displayName.slice(0, 2).toUpperCase();

  const tabs = [
    { key: 'orders' as const,    label: 'Orders',    icon: Package, count: orders.length },
    { key: 'addresses' as const, label: 'Addresses', icon: MapPin,   count: addresses.length },
    { key: 'profile' as const,   label: 'Profile',   icon: User,    count: null },
  ];

  const inputStyle = {
    width: '100%', background: '#f1f5f9', border: '1.5px solid transparent',
    borderRadius: '10px', padding: '12px 14px', fontSize: '14px',
    color: '#0f172a', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' as const,
  };

  return (
    <div className="app-shell bg-slate-50 min-h-screen">
      <main className="pb-24 lg:pb-10 max-w-3xl mx-auto pt-0 lg:pt-8">
        {/* Blue gradient profile header */}
        <div style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
          padding: '60px 20px 28px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', left: '-20px', bottom: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            {/* Avatar */}
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 800, color: 'white',
              border: '3px solid #F59E0B', flexShrink: 0,
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '20px', fontWeight: 800, color: 'white', fontFamily: 'Space Grotesk, sans-serif' }}>{displayName}</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', marginTop: '2px' }}>{user?.email}</p>
              {profile?.phone && (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>{profile.phone}</p>
              )}
            </div>
            <button
              id="edit-profile-btn"
              onClick={() => { setTab('profile'); setIsEditing(true); }}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: '8px', padding: '7px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
              }}
            >
              <Edit2 style={{ width: '13px', height: '13px', color: 'white' }} />
              <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{isEditing ? 'Editing...' : 'Edit'}</span>
            </button>

          </div>

          {/* Stats Row */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', position: 'relative' }}>
            {[
              { label: 'Orders', value: orders.length },
              { label: 'Addresses', value: addresses.length },
              { label: 'Reviews', value: 0 },
            ].map(stat => (
              <div key={stat.label} style={{
                flex: 1, background: 'rgba(255,255,255,0.12)',
                borderRadius: '12px', padding: '12px 8px', textAlign: 'center',
              }}>
                <p style={{ fontSize: '22px', fontWeight: 800, color: 'white', fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', marginTop: '2px', fontWeight: 600 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{
          background: 'white', display: 'flex',
          borderBottom: '1px solid #f1f5f9',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          {tabs.map(t => (
            <button
              key={t.key}
              id={`account-tab-${t.key}`}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '14px 8px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: tab === t.key ? '3px solid #7C3AED' : '3px solid transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              }}
            >
              <t.icon style={{ width: '18px', height: '18px', color: tab === t.key ? '#7C3AED' : '#94A3B8' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: tab === t.key ? '#7C3AED' : '#94A3B8', fontFamily: 'Space Grotesk, sans-serif' }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        <div style={{ padding: '16px' }}>
          {/* ORDERS TAB */}
          {tab === 'orders' && (
            orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 0' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <ShoppingBag style={{ width: '36px', height: '36px', color: '#6B7280' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E1B4B', marginBottom: '8px' }}>No orders yet</h3>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>Start shopping to see your orders here</p>
                <button
                  id="start-shopping-orders-btn"
                  onClick={() => navigate('/shop')}
                  className="btn-primary"
                  style={{ width: '180px', margin: '0 auto', height: '46px', fontSize: '14px' }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {orders.map(order => (
                  <button
                    key={order.id}
                    id={`order-card-${order.id}`}
                    onClick={() => navigate(`/order/${order.id}`)}
                    style={{
                      width: '100%', background: 'white', border: '1px solid #f1f5f9',
                      borderRadius: '14px', padding: '14px', textAlign: 'left',
                      cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#1E1B4B', fontFamily: 'Space Grotesk, sans-serif' }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <ChevronRight style={{ width: '16px', height: '16px', color: '#94A3B8' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        ...getStatusStyle(order.order_status),
                        borderRadius: '20px', padding: '4px 10px',
                        fontSize: '11px', fontWeight: 700,
                      }}>
                        {order.order_status.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#1E1B4B' }}>
                        ₹{Number(order.total).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      · {(order.items as unknown[]).length} item(s)
                    </p>
                    <div style={{ marginTop: '12px', borderTop: '1px solid #f8fafc', paddingTop: '10px', display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                          style={{ 
                            background: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED', border: 'none', 
                            padding: '6px 12px', borderRadius: '8px', fontSize: '11px', 
                            fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif'
                          }}
                        >
                          View Digital Invoice
                        </button>
                       {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (Date.now() - new Date(order.created_at).getTime() <= 24 * 60 * 60 * 1000) && (
                         <button 
                           onClick={(e) => handleCancelOrder(order.id, e)}
                           style={{ 
                             background: '#fee2e2', color: '#dc2626', border: 'none', 
                             padding: '6px 12px', borderRadius: '8px', fontSize: '11px', 
                             fontWeight: 700, cursor: 'pointer' 
                           }}
                         >
                           Cancel Order
                         </button>
                       )}
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {/* ADDRESSES TAB */}
          {tab === 'addresses' && (
            <div>
              <button
                id="add-address-btn"
                onClick={() => setShowAddressForm(true)}
                style={{
                  width: '100%', border: '2px dashed #e2e8f0', borderRadius: '14px',
                  padding: '16px', background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginBottom: '14px',
                }}
              >
                <Plus style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#7C3AED', fontFamily: 'Space Grotesk, sans-serif' }}>Add New Address</span>
              </button>

              {showAddressForm && (
                <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '14px', padding: '16px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input placeholder="Full Name *" value={addressForm.full_name}
                    onChange={e => setAddressForm({ ...addressForm, full_name: e.target.value })} style={inputStyle} />
                  <input placeholder="Phone *" value={addressForm.phone}
                    onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} style={inputStyle} />
                  <input placeholder="Address Line 1 *" value={addressForm.address_line1}
                    onChange={e => setAddressForm({ ...addressForm, address_line1: e.target.value })} style={inputStyle} />
                  <input placeholder="Address Line 2" value={addressForm.address_line2}
                    onChange={e => setAddressForm({ ...addressForm, address_line2: e.target.value })} style={inputStyle} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <input placeholder="City *" value={addressForm.city}
                      onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} style={{ ...inputStyle, fontSize: '13px' }} />
                    <input placeholder="State *" value={addressForm.state}
                      onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} style={{ ...inputStyle, fontSize: '13px' }} />
                    <input placeholder="PIN *" value={addressForm.pincode}
                      onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} style={{ ...inputStyle, fontSize: '13px' }} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 0' }}>
                    <input 
                      type="checkbox" 
                      checked={addressForm.is_default}
                      onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Set as default address</span>
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleAddAddress} className="btn-primary" style={{ flex: 1, height: '42px', fontSize: '14px' }}>Save Address</button>
                    <button onClick={() => setShowAddressForm(false)} style={{
                      flex: 1, height: '42px', borderRadius: '12px',
                      border: '1.5px solid #e2e8f0', background: 'transparent',
                      fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#475569',
                    }}>Cancel</button>
                  </div>
                </div>
              )}

              {addresses.length === 0 && !showAddressForm ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <MapPin style={{ width: '40px', height: '40px', color: '#6B7280', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>No addresses saved yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {addresses.map(addr => (
                    <div key={addr.id} style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '14px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1E1B4B' }}>{addr.full_name}</p>
                          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{addr.phone}</p>
                          <p style={{ fontSize: '13px', color: '#475569', marginTop: '6px', lineHeight: 1.5 }}>
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                            <br />{addr.city}, {addr.state} — {addr.pincode}
                          </p>
                          {addr.is_default ? (
                            <span style={{
                              display: 'inline-block', marginTop: '6px',
                              background: '#F5F3FF', color: '#7C3AED',
                              borderRadius: '4px', padding: '2px 8px',
                              fontSize: '11px', fontWeight: 700,
                              fontFamily: 'Space Grotesk, sans-serif'
                            }}>DEFAULT</span>
                          ) : (
                            <button 
                              onClick={() => handleSetDefault(addr.id)}
                              style={{ 
                                background: 'transparent', border: 'none', color: '#7C3AED', 
                                fontSize: '11px', fontWeight: 700, cursor: 'pointer', 
                                marginTop: '6px', padding: '0', fontFamily: 'Space Grotesk, sans-serif'
                              }}
                            >
                              SET AS DEFAULT
                            </button>
                          )}
                        </div>
                        <button
                          id={`delete-address-${addr.id}`}
                          onClick={() => handleDeleteAddress(addr.id)}
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: '#fee2e2', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}
                        >
                          <Trash2 style={{ width: '14px', height: '14px', color: '#dc2626' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!isEditing ? (
                <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  {[
                    { label: 'Email', value: user?.email },
                    { label: 'Name', value: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Not set' },
                    { label: 'Phone', value: profile?.phone || 'Not set' },
                  ].map(field => (
                    <div key={field.label} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                      <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '2px' }}>{field.label}</p>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#1E1B4B' }}>{field.value}</p>
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="btn-primary" 
                    style={{ marginTop: '20px', height: '44px', fontSize: '14px' }}
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E1B4B', marginBottom: '4px' }}>Edit Profile</h3>
                  
                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '6px', display: 'block' }}>First Name</label>
                    <input 
                      type="text" 
                      value={editForm.first_name} 
                      onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                      style={inputStyle}
                      placeholder="First Name"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Last Name</label>
                    <input 
                      type="text" 
                      value={editForm.last_name} 
                      onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                      style={inputStyle}
                      placeholder="Last Name"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Phone Number</label>
                    <input 
                      type="tel" 
                      value={editForm.phone} 
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      style={inputStyle}
                      placeholder="Phone Number"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button 
                      onClick={handleUpdateProfile} 
                      disabled={saving}
                      className="btn-primary" 
                      style={{ flex: 1, height: '46px' }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      style={{ 
                        flex: 1, height: '46px', background: 'transparent', border: '1.5px solid #e2e8f0', 
                        borderRadius: '12px', color: '#64748b', fontWeight: 700, fontSize: '14px', cursor: 'pointer' 
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <button
                id="logout-btn"
                onClick={handleLogout}
                style={{
                  width: '100%', height: '52px',
                  background: 'white', border: '1.5px solid #dc2626',
                  borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontSize: '15px', fontWeight: 700, color: '#dc2626',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
              >
                <LogOut style={{ width: '18px', height: '18px' }} />
                Logout
              </button>
            </div>
          )}
        </div>
      </main>
      <WhatsAppButton />
      <BottomNav />

      <AnimatePresence>
        {selectedOrder && (
          <DigitalInvoice 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyAccountPage;
