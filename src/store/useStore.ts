import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';


interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order?: number;
  max_uses?: number;
  used_count: number;
  expiry_date?: string;
  is_active: boolean;
}

interface AppStore {
  cart: CartItem[];
  cartOpen: boolean;
  addToCart: (product: Product, qty?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQty: (productId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: (userId: string) => Promise<void>;
  setCartOpen: (open: boolean) => void;
  getCartCount: () => number;
  getCartTotal: () => number;

  wishlist: Product[];
  wishlistOpen: boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  setWishlistOpen: (open: boolean) => void;
  syncWishlist: (userId: string) => Promise<void>;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;

  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;

  supportOpen: boolean;
  setSupportOpen: (open: boolean) => void;

  appliedCoupon: Coupon | null;
  setAppliedCoupon: (coupon: Coupon | null) => void;

  useGst: boolean;
  setUseGst: (useGst: boolean) => void;
  
  gstDetails: { number: string; businessName: string };
  setGstDetails: (details: { number: string; businessName: string }) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      cart: [],
      cartOpen: false,
      addToCart: async (product, qty = 1) => {
        const { cart } = get();
        const existing = cart.find(item => item.product.id === product.id);
        let newCart;
        if (existing) {
          newCart = cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
        } else {
          newCart = [...cart, { product, quantity: qty }];
        }
        set({ cart: newCart });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('cart').upsert({
            user_id: user.id,
            product_id: product.id,
            quantity: existing ? existing.quantity + qty : qty
          }, { onConflict: 'user_id,product_id' });
        }
      },
      removeFromCart: async (productId) => {
        set({ cart: get().cart.filter(item => item.product.id !== productId) });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('cart').delete().eq('user_id', user.id).eq('product_id', productId);
        }
      },
      updateCartQty: async (productId, qty) => {
        if (qty < 1) return;
        set({ cart: get().cart.map(item => item.product.id === productId ? { ...item, quantity: qty } : item) });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('cart').update({ quantity: qty }).eq('user_id', user.id).eq('product_id', productId);
        }
      },
      clearCart: async () => {
        set({ cart: [] });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('cart').delete().eq('user_id', user.id);
        }
      },
      syncCart: async (userId) => {
        const { data } = await supabase.from('cart').select('*, product:products(*)').eq('user_id', userId);
        if (data) {
          const syncedCart = data.map(item => ({
            product: item.product as unknown as Product,
            quantity: item.quantity
          }));
          set({ cart: syncedCart });
        }
      },
      setCartOpen: (open) => set({ cartOpen: open }),
      getCartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
      getCartTotal: () => get().cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0),

      wishlist: [],
      wishlistOpen: false,
      toggleWishlist: async (product) => {
        const { wishlist } = get();
        const exists = wishlist.find(p => p.id === product.id);
        let newWishlist;
        const { data: { user } } = await supabase.auth.getUser();
        if (exists) {
          newWishlist = wishlist.filter(p => p.id !== product.id);
          if (user) await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', product.id);
        } else {
          newWishlist = [...wishlist, product];
          if (user) await supabase.from('wishlist').insert({ user_id: user.id, product_id: product.id });
        }
        set({ wishlist: newWishlist });
      },
      syncWishlist: async (userId) => {
        const { data } = await supabase.from('wishlist').select('product:products(*)').eq('user_id', userId);
        if (data) {
          set({ wishlist: data.map(item => item.product as unknown as Product) });
        }
      },

      isWishlisted: (productId) => get().wishlist.some(p => p.id === productId),
      setWishlistOpen: (open) => set({ wishlistOpen: open }),

      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      menuOpen: false,
      setMenuOpen: (open) => set({ menuOpen: open }),

      authOpen: false,
      setAuthOpen: (open) => set({ authOpen: open }),

      supportOpen: false,
      setSupportOpen: (open) => set({ supportOpen: open }),

      appliedCoupon: null,
      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),

      useGst: false,
      setUseGst: (useGst) => set({ useGst }),

      gstDetails: { number: '', businessName: '' },
      setGstDetails: (details) => set({ gstDetails: details }),
    }),
    {
      name: 'raj-computers-storage',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        appliedCoupon: state.appliedCoupon,
        useGst: state.useGst,
        gstDetails: state.gstDetails,
      }),
    }
  )
);
