import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dhcvgrlielrtlmjktuqi.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoY3ZncmxpZWxydGxtamt0dXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MzU5MjIsImV4cCI6MjA5MTIxMTkyMn0.ceO8iFGz3Jgs4LqwD3qCCjnHaPGLCe-NY6qAzmrkZTI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('Deleting products...');
  const { error: errProducts } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errProducts) console.error('Error deleting products:', errProducts.message);

  console.log('Deleting banners...');
  const { error: errBanners } = await supabase.from('banners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errBanners) console.error('Error deleting banners:', errBanners.message);

  console.log('Deleting categories...');
  const { error: errCategories } = await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errCategories) console.error('Error deleting categories:', errCategories.message);

  console.log('Deleting brands...');
  const { error: errBrands } = await supabase.from('brands').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errBrands) console.error('Error deleting brands:', errBrands.message);

  console.log('Done!');
}

run();
