import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function run() {
  console.log('🧹 Starting duplicate removal...');
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Auth for RLS
  await sb.auth.signInWithPassword({
    email: 'srcomputers@gmail.com',
    password: 'srcomputers@2025'
  });

  console.log('📊 Fetching all product names (paginated)...');
  let prods = [];
  let from = 0;
  const step = 1000;
  
  while (true) {
    const { data, error } = await sb.from('products')
      .select('id, name')
      .order('created_at', { ascending: false })
      .range(from, from + step - 1);
    
    if (error) {
      console.error('❌ Fetch Error:', error.message);
      break;
    }
    if (!data || data.length === 0) break;
    
    prods = prods.concat(data);
    console.log(`   Fetched ${prods.length} products...`);
    from += step;
  }

  const seen = new Set();
  const toDelete = [];

  for (const p of prods) {
    const key = p.name.trim().toLowerCase();
    if (seen.has(key)) {
      toDelete.push(p.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`📦 Found ${toDelete.length} duplicates.`);

  if (toDelete.length > 0) {
    // Delete in chunks of 100
    for (let i = 0; i < toDelete.length; i += 100) {
      const chunk = toDelete.slice(i, i + 100);
      const { error } = await sb.from('products').delete().in('id', chunk);
      if (error) {
        console.error('❌ Delete Error:', error.message);
      } else {
        console.log(`✅ Deleted ${chunk.length} items...`);
      }
    }
  }

  console.log('🏁 Duplicate removal complete!');
}

run();
