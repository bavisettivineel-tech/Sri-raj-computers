export interface Product {
  id: string;
  name: string;
  mrp: number;
  sale_price: number;
  stock_qty: number;
  is_featured: boolean;
  is_active: boolean;
  description: string | null;
  specifications: Record<string, string> | null;
  images: string[] | null;
  brand_id: string | null;
  category_id: string | null;
  brand_name?: string;
  category_name?: string;
  created_at: string;
}

export const getProductImage = (product: Product): string => {
  return product.images?.[0] || '/placeholder.svg';
};

export const getDiscount = (product: Product): number => {
  if (product.mrp <= 0) return 0;
  return Math.round(((product.mrp - product.sale_price) / product.mrp) * 100);
};
