const url = process.env.VITE_SUPABASE_URL || 'https://dhcvgrlielrtlmjktuqi.supabase.co';
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoY3ZncmxpZWxydGxtamt0dXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MzU5MjIsImV4cCI6MjA5MTIxMTkyMn0.ceO8iFGz3Jgs4LqwD3qCCjnHaPGLCe-NY6qAzmrkZTI';

async function run() {
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  };

  try {
    console.log('Deleting products...');
    await fetch(`${url}/rest/v1/products?id=not.eq.00000000-0000-0000-0000-000000000000`, { method: 'DELETE', headers });
    
    console.log('Deleting banners...');
    await fetch(`${url}/rest/v1/banners?id=not.eq.00000000-0000-0000-0000-000000000000`, { method: 'DELETE', headers });
    
    console.log('Deleting categories...');
    await fetch(`${url}/rest/v1/categories?id=not.eq.00000000-0000-0000-0000-000000000000`, { method: 'DELETE', headers });
    
    console.log('Deleting brands...');
    await fetch(`${url}/rest/v1/brands?id=not.eq.00000000-0000-0000-0000-000000000000`, { method: 'DELETE', headers });
    
    console.log('Done!');
  } catch (err) {
    console.error(err);
  }
}

run();
