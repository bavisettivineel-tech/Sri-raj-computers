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

/** Fetch a limited slice of products for a specific category ID */
export const useProductsByCategoryId = (categoryId: string, limit = 6) => {
  return useQuery({
    queryKey: ['products-by-cat', categoryId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, brands(name), categories(name)')
        .eq('is_active', true)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []).map(mapProduct);
    },
    enabled: !!categoryId,
  });
};

/** Resolve a category UUID by matching its name (case-insensitive) */
export const useCategoryIdByName = (name: string) => {
  return useQuery({
    queryKey: ['category-by-name', name],
    queryFn: async () => {
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
