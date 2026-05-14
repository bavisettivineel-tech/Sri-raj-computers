import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // The anon key is fine if RLS allows anon insert, but usually admin needs service_role. 
// Wait, in this application, does ANON key have insert rights for products? 
// The user removed RLS or has RLS policies for admin. 
// Let's test the script and output errors if they happen.
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function cleanHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '').trim().substring(0, 500); // 500 chars limit for description just in case
}

async function run() {
  console.log("Starting Scraper...");
  
  // 1. Fetch existing categories and brands
  let categoriesMap = {};
  let brandsMap = {};
  
  const { data: catData } = await supabase.from('categories').select('id, name');
  catData?.forEach(c => categoriesMap[c.name.toLowerCase()] = c.id);
  
  const { data: brandData } = await supabase.from('brands').select('id, name');
  brandData?.forEach(b => brandsMap[b.name.toLowerCase()] = b.id);
  
  let page = 1;
  let totalAdded = 0;
  
  while (true) {
    console.log(`Fetching page ${page}...`);
    const res = await fetch(`https://www.vishalperipherals.com/products.json?limit=250&page=${page}`);
    if (!res.ok) {
       console.log("Failed to fetch from vishal peripherals, status:", res.status);
       break;
    }
    const data = await res.json();
    
    if (!data.products || data.products.length === 0) {
      console.log("No more products found. Finished.");
      break;
    }
    
    const productsToInsert = [];
    
    for (const p of data.products) {
      // Upsert category
      let catId = null;
      if (p.product_type) {
        const typeName = p.product_type.trim();
        const typeKey = typeName.toLowerCase();
        if (categoriesMap[typeKey]) {
          catId = categoriesMap[typeKey];
        } else {
          const { data: newCat, error } = await supabase.from('categories').insert({ name: typeName }).select('id').single();
          if (!error && newCat) {
            categoriesMap[typeKey] = newCat.id;
            catId = newCat.id;
          }
        }
      }
      
      // Upsert brand
      let brandId = null;
      if (p.vendor) {
        const vendorName = p.vendor.trim();
        const vendorKey = vendorName.toLowerCase();
        if (brandsMap[vendorKey]) {
          brandId = brandsMap[vendorKey];
        } else {
          const { data: newBrand, error } = await supabase.from('brands').insert({ name: vendorName }).select('id').single();
          if (!error && newBrand) {
            brandsMap[vendorKey] = newBrand.id;
            brandId = newBrand.id;
          }
        }
      }
      
      const variant = p.variants[0];
      const mrp = variant?.compare_at_price ? Number(variant.compare_at_price) : Number(variant?.price || 0);
      const sale_price = Number(variant?.price || 0);
      
      productsToInsert.push({
        name: p.title,
        description: cleanHtml(p.body_html),
        category_id: catId,
        brand_id: brandId,
        mrp: mrp,
        sale_price: sale_price,
        stock_qty: variant?.available ? 100 : 0,
        b2b_price: Math.round(sale_price * 0.95), // 5% less for b2b as estimate
        images: p.images ? p.images.map(img => img.src) : [],
        is_active: true,
        is_featured: p.tags && p.tags.includes("Featured") ? true : false,
      });
    }
    
    if (productsToInsert.length > 0) {
      const { data, error } = await supabase.from('products').insert(productsToInsert);
      if (error) {
        console.error("Error inserting products:", error.message);
      } else {
        totalAdded += productsToInsert.length;
        console.log(`Inserted ${productsToInsert.length} products successfully.`);
      }
    }
    
    page++;
    // break early to prevent spamming too much on one run and timing out
    if (page > 3) {
      console.log("Stopping after 3 pages (750 products) to avoid timeout. Run again for more.");
      break;
    }
  }
  
  console.log(`Scraping complete. Total products added: ${totalAdded}`);
}

run();
