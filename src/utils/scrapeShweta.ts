import { supabase } from '@/integrations/supabase/client';

const SHOPIFY_BASE = 'https://shwetacomputers.com/products.json';
const PAGE_SIZE = 250;

const TAG_CAT: Record<string, string> = {
  processor:'Processor','intel processor':'Processor','amd processor':'Processor',
  cpu:'Processor',intel:'Processor',
  motherboard:'Motherboard',motherboards:'Motherboard',
  ram:'RAM',memory:'RAM',ddr4:'RAM',ddr5:'RAM',
  ssd:'SSD','solid state drive':'SSD',nvme:'SSD','m.2':'SSD',
  hdd:'HDD','hard disk':'HDD','hard drive':'HDD',
  'graphics card':'Graphics Card','graphic card':'Graphics Card',
  'graphics cards':'Graphics Card',gpu:'Graphics Card',vga:'Graphics Card',
  monitor:'Monitor',monitors:'Monitor',
  keyboard:'Keyboard',keyboards:'Keyboard',
  mouse:'Mouse',mice:'Mouse',
  headphone:'Headphones and Earphones',headphones:'Headphones and Earphones',
  earphone:'Headphones and Earphones',earphones:'Headphones and Earphones',
  headset:'Headphones and Earphones',
  'gaming chair':'Gaming Chair',chair:'Gaming Chair',
  cabinet:'Cabinet','pc case':'Cabinet','tower case':'Cabinet',
  'cabinet fans':'Cabinet Fans','case fan':'Cabinet Fans',fans:'Cabinet Fans',
  'air cooler':'Air Cooler','cpu cooler':'Air Cooler',cooler:'Air Cooler',
  'liquid cooler':'Liquid Cooler',aio:'Liquid Cooler','liquid cooling':'Liquid Cooler',
  'water cooler':'Liquid Cooler',
  'power supply':'Power Supply',psu:'Power Supply',smps:'Power Supply',
  ups:'UPS',
  'mouse pad':'Mouse Pads',mousepad:'Mouse Pads','mouse pads':'Mouse Pads',
  'game controller':'Game Controllers',controller:'Game Controllers',
  gamepad:'Game Controllers',joystick:'Game Controllers',
  microphone:'Microphone',mic:'Microphone',
  cable:'Cables',cables:'Cables',
  converter:'Converters / Adapters',adapter:'Converters / Adapters',
  adapters:'Converters / Adapters',
  speaker:'Speakers',speakers:'Speakers',
  webcam:'Webcam',
  printer:'Printers',printers:'Printers',
  laptop:'Laptops',laptops:'Laptops',notebook:'Laptops',
  'prebuilt pc':'Prebuilt PC','pre-built pc':'Prebuilt PC',
  prebuilt:'Prebuilt PC','gaming pc':'Prebuilt PC','custom pc':'Prebuilt PC',
  powerbank:'Powerbanks','power bank':'Powerbanks',
  'thermal paste':'Thermal Paste','thermal compound':'Thermal Paste',
  accessories:'Accessories',accessory:'Accessories',
};

function resolveCategory(tags: string[]) {
  if (!tags?.length) return null;
  const sorted = [...tags].sort((a,b) => b.length - a.length);
  for (const t of sorted) {
    const v = TAG_CAT[t.trim().toLowerCase()];
    if (v) return v;
  }
  return null;
}

function cleanHtml(s: string) {
  if (!s) return '';
  return s
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi,'')
    .replace(/<[^>]*>/gm,'')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>').replace(/&nbsp;/g,' ')
    .replace(/\s{2,}/g,' ').trim().substring(0,1000);
}

export const runShwetaScrape = async (onProgress: (msg: string) => void) => {
  const catMap: Record<string, string> = {};
  const brandMap: Record<string, string> = {};

  onProgress('Loading existing categories & brands...');
  const { data: cats } = await supabase.from('categories').select('id,name');
  cats?.forEach(c => catMap[c.name.toLowerCase()] = c.id);
  
  const { data: brnds } = await supabase.from('brands').select('id,name');
  brnds?.forEach(b => brandMap[b.name.toLowerCase()] = b.id);

  async function upsertCat(name: string) {
    if (!name) return null;
    const key = name.toLowerCase();
    if (catMap[key]) return catMap[key];
    const { data, error } = await supabase.from('categories')
      .insert({ name, is_active: true }).select('id').single();
    if (error) {
      const { data: ex } = await supabase.from('categories').select('id').ilike('name',name).maybeSingle();
      if (ex) { catMap[key]=ex.id; return ex.id; }
      return null;
    }
    catMap[key] = data.id; return data.id;
  }

  async function upsertBrand(raw: string) {
    if (!raw) return null;
    const name = raw.trim().toUpperCase();
    const key = name.toLowerCase();
    if (brandMap[key]) return brandMap[key];
    const { data, error } = await supabase.from('brands')
      .insert({ name, is_active: true }).select('id').single();
    if (error) {
      const { data: ex } = await supabase.from('brands').select('id').ilike('name',name).maybeSingle();
      if (ex) { brandMap[key]=ex.id; return ex.id; }
      return null;
    }
    brandMap[key] = data.id; return data.id;
  }

  let page=1, totalFetched=0, totalInserted=0, totalSkipped=0;

  while (totalInserted < 4000) { // Goal is to reach 6000 total, so we add 4000 more if possible
    onProgress(`Fetching page ${page}... (Total Inserted: ${totalInserted})`);
    let resp;
    try {
      const r = await fetch(`${SHOPIFY_BASE}?limit=${PAGE_SIZE}&page=${page}`);
      if (!r.ok) break;
      resp = await r.json();
    } catch(e) { 
      console.error(e);
      await new Promise(r=>setTimeout(r,1000));
      page++;
      continue;
    }

    if (!resp.products?.length) break;

    totalFetched += resp.products.length;
    const batch = [];

    for (const p of resp.products) {
      const v = p.variants?.[0];
      if (!v || !v.price || Number(v.price) === 0) { totalSkipped++; continue; }
      
      const sale_price = Number(v.price);
      const mrp = v.compare_at_price ? Number(v.compare_at_price) : Math.round(sale_price*1.15);

      const catName = resolveCategory(p.tags) || p.product_type;
      const catId   = catName ? await upsertCat(catName) : null;

      let brandId = null;
      if (p.vendor && !p.vendor.toLowerCase().includes('shweta')) {
        brandId = await upsertBrand(p.vendor);
      }

      batch.push({
        name:        p.title,
        description: cleanHtml(p.body_html),
        category_id: catId,
        brand_id:    brandId,
        mrp,
        sale_price,
        b2b_price:   Math.round(sale_price * 0.94),
        stock_qty:   v.available ? 100 : 0,
        is_active:   true,
        images:      (p.images||[]).slice(0,5).map((i: { src: string })=>i.src),
        specifications: { Vendor: p.vendor, Tags: p.tags?.join(', ') || '' },
      });
    }

    // Parallel insertion of chunks for speed
    if (batch.length > 0) {
      const chunkSize = 50;
      const chunks = [];
      for (let i=0; i<batch.length; i+=chunkSize) chunks.push(batch.slice(i, i+chunkSize));
      
      await Promise.all(chunks.map(async (chunk) => {
        const { error } = await supabase.from('products').insert(chunk);
        if (!error) {
          totalInserted += chunk.length;
        } else {
          console.error("Insert Error:", error.message);
        }
      }));
      if (page % 2 === 0) onProgress(`Progress: ${totalInserted} newly inserted...`);
    }

    page++;
    // Minimal delay to avoid rate limit but stay fast
    await new Promise(r=>setTimeout(r,200));
  }

  onProgress(`DONE! Fetched: ${totalFetched}, Inserted: ${totalInserted}`);
  return { totalFetched, totalInserted, totalSkipped };
};
