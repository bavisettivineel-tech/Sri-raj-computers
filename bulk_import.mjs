import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SHOPIFY_BASE = 'https://shwetacomputers.com/products.json';
const PAGE_SIZE = 250;
const GOAL = 6000;

const TAG_CAT = {
  processor:'Processor', motherboard:'Motherboard', ram:'RAM', ssd:'SSD',
  hdd:'HDD', 'graphics card':'Graphics Card', monitor:'Monitor',
  keyboard:'Keyboard', mouse:'Mouse', headphone:'Headphones and Earphones',
  cabinet:'Cabinet', 'air cooler':'Air Cooler', 'liquid cooler':'Liquid Cooler',
  'power supply':'Power Supply', ups:'UPS', printer:'Printers', laptop:'Laptops'
};

function resolveCategory(tags) {
  if (!tags?.length) return null;
  for (const t of tags) {
    const v = TAG_CAT[t.toLowerCase()];
    if (v) return v;
  }
  return null;
}

async function run() {
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log('🔑 Authenticating...');
  const { data: auth, error: authErr } = await sb.auth.signInWithPassword({
    email: 'srcomputers@gmail.com',
    password: 'srcomputers@2025'
  });

  if (authErr) {
    console.error('❌ Auth Failed:', authErr.message);
    return;
  }
  console.log('✅ Authenticated.');

  const { count: currentCount } = await sb.from('products').select('id', { count: 'exact', head: true });
  console.log(`🚀 Starting bulk import. Current count: ${currentCount}. Goal: ${GOAL}`);

  const { data: cats } = await sb.from('categories').select('id, name');
  const catMap = {};
  cats.forEach(c => catMap[c.name.toLowerCase()] = c.id);

  const { data: brands } = await sb.from('brands').select('id, name');
  const brandMap = {};
  brands.forEach(b => brandMap[b.name.toLowerCase()] = b.id);

  let page = 1;
  let totalInserted = 0;
  let productsNeeded = GOAL - currentCount;

  while (productsNeeded > 0) {
    console.log(`📦 Fetching page ${page} from Shweta Computers...`);
    const resp = await fetch(`${SHOPIFY_BASE}?limit=${PAGE_SIZE}&page=${page}`).then(r => r.json());
    
    if (!resp.products?.length) {
      console.log('⚠️ No more products available on Shweta Computers.');
      break;
    }

    const batch = [];
    for (const p of resp.products) {
      if (productsNeeded <= 0) break;

      const v = p.variants?.[0];
      if (!v || !v.price || Number(v.price) === 0) continue;

      const catName = resolveCategory(p.tags) || p.product_type;
      let catId = catMap[catName?.toLowerCase()] || null;
      
      // Basic name keywords if catId still null
      if (!catId) {
          const n = p.title.toLowerCase();
          if (n.includes('monitor')) catId = catMap['monitor'];
          else if (n.includes('laptop')) catId = catMap['laptops'];
          else if (n.includes('processor')) catId = catMap['processor'];
      }

      batch.push({
        name: p.title,
        description: p.body_html?.substring(0, 1000) || '',
        category_id: catId,
        mrp: Math.round(Number(v.price) * 1.15),
        sale_price: Number(v.price),
        stock_qty: v.available ? 50 : 0,
        images: (p.images || []).slice(0, 5).map(i => i.src),
        is_active: true,
        specifications: { Vendor: p.vendor, Tags: p.tags?.join(', ') }
      });
      productsNeeded--;
    }

    if (batch.length > 0) {
      const { error } = await sb.from('products').insert(batch);
      if (!error) {
        totalInserted += batch.length;
        console.log(`✅ Inserted ${batch.length} products. (Total this session: ${totalInserted})`);
      } else {
        console.error('❌ Insert Error:', error.message);
      }
    }

    page++;
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`🏁 Done! Inserted ${totalInserted} products. New total should be close to ${GOAL}.`);
}

run();
