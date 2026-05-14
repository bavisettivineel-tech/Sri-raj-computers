import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/product';

interface SupabaseProductRow {
  id: string;
  name: string;
  mrp: string | number;
  sale_price: string | number;
  stock_qty: number;
  is_featured?: boolean;
  is_active?: boolean;
  description?: string;
  specifications: unknown;
  images: string[];
  brand_id?: string;
  category_id?: string;
  brands?: { name: string };
  categories?: { name: string };
  created_at: string;
}

const mapProduct = (row: SupabaseProductRow): Product => ({
  id: row.id,
  name: row.name,
  mrp: Number(row.mrp),
  sale_price: Number(row.sale_price),
  stock_qty: row.stock_qty,
  is_featured: row.is_featured ?? false,
  is_active: row.is_active ?? true,
  description: row.description,
  specifications: row.specifications as Record<string, string> | null,
  images: row.images,
  brand_id: row.brand_id,
  category_id: row.category_id,
  brand_name: row.brands?.name,
  category_name: row.categories?.name,
  created_at: row.created_at,
});

export const useProducts = (limit?: number, categoryId?: string, brandId?: string) => {
  return useQuery({
    queryKey: ['products', limit, categoryId, brandId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, brands(name), categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (brandId) {
        query = query.eq('brand_id', brandId);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapProduct);
    },
  });
};

export const useProductsCount = (categoryId?: string, brandId?: string) => {
  return useQuery({
    queryKey: ['products-count', categoryId, brandId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (brandId) {
        query = query.eq('brand_id', brandId);
      }
      
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });
};

/** Resolve a brand UUID by matching its name (case-insensitive) — supports ?brandq= param */
export const useBrandByName = (name: string) => {
  return useQuery({
    queryKey: ['brand-by-name', name],
    queryFn: async () => {
      if (!name) return null;
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .ilike('name', `%${name}%`)
        .eq('is_active', true)
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!name,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, brands(name), categories(name)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return mapProduct(data);
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data || [];
    },
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });
};

/** Resolve category IDs by matching category name, then fetch products — supports ?q= param */
export const useCategoryByName = (name: string) => {
  return useQuery({
    queryKey: ['category-by-name', name],
    queryFn: async () => {
      if (!name) return null;
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${name}%`)
        .eq('is_active', true)
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!name,
  });
};
