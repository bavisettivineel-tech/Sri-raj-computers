import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const TAG_CAT = {
  processor:'Processor', motherboard:'Motherboard', ram:'RAM', ssd:'SSD',
  hdd:'HDD', 'graphics card':'Graphics Card', monitor:'Monitor',
  keyboard:'Keyboard', mouse:'Mouse', headphone:'Headphones and Earphones',
  cabinet:'Cabinet', 'air cooler':'Air Cooler', 'liquid cooler':'Liquid Cooler',
  'power supply':'Power Supply', ups:'UPS', printer:'Printers', laptop:'Laptops',
  networking:'Networking', 'cctv':'CCTV Products', speaker:'Speakers'
};

async function run() {
  console.log('🛠️ Starting Category Repair...');
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Merge "Monitors" -> "Monitor"
  console.log('📊 Merging "Monitors" into "Monitor"...');
  const { data: catList } = await sb.from('categories').select('id, name');
  const monitorSingular = catList.find(c => c.name === 'Monitor');
  const monitorPlural = catList.find(c => c.name === 'Monitors');

  if (monitorSingular && monitorPlural) {
    await sb.from('products').update({ category_id: monitorSingular.id }).eq('category_id', monitorPlural.id);
    await sb.from('categories').delete().eq('id', monitorPlural.id);
    console.log('✅ Merged Monitors.');
  }

  // 2. Fix uncategorized products by Name keywords
  console.log('🔍 Fixing uncategorized products by name...');
  const { data: prods } = await sb.from('products').select('id, name').is('category_id', null);
  console.log(`📦 Found ${prods?.length || 0} uncategorized products.`);

  const catMap = {};
  catList.forEach(c => catMap[c.name.toLowerCase()] = c.id);

  const keywords = {
    'monitor': 'Monitor',
    'laptop': 'Laptops',
    'motherboard': 'Motherboard',
    'processor': 'Processor',
    'keyboard': 'Keyboard',
    'mouse': 'Mouse',
    'headphone': 'Headphones and Earphones',
    'cabinet': 'Cabinet',
    'ssd': 'SSD',
    'hdd': 'HDD',
    'ram': 'RAM',
    'ups': 'UPS',
    'printer': 'Printers'
  };

  let fixedCount = 0;
  for (const p of prods || []) {
    const name = p.name.toLowerCase();
    let foundCat = null;
    for (const [kw, catName] of Object.entries(keywords)) {
      if (name.includes(kw)) {
        foundCat = catName;
        break;
      }
    }

    if (foundCat && catMap[foundCat.toLowerCase()]) {
      await sb.from('products').update({ category_id: catMap[foundCat.toLowerCase()] }).eq('id', p.id);
      fixedCount++;
    }
  }

  console.log(`✅ Fixed ${fixedCount} products by name keywords.`);

  // 3. Delete categories with 0 products
  console.log('🧹 Cleaning up empty categories...');
  const { data: allCats } = await sb.from('categories').select('id, name');
  for (const cat of allCats || []) {
    const { count } = await sb.from('products').select('id', { count: 'exact', head: true }).eq('category_id', cat.id);
    if (count === 0) {
      console.log(`   🗑️ Deleting empty category: ${cat.name}`);
      await sb.from('categories').delete().eq('id', cat.id);
    }
  }

  console.log('🏁 Repair Complete!');
}

run();
