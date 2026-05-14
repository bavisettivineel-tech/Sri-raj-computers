const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL="?([^"\n]+)"?/);
const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="?([^"\n]+)"?/);
if (urlMatch && keyMatch) {
  const url = urlMatch[1] + '/rest/v1/products?select=name,specifications,categories(name)&categories.name=eq.RAM';
  const key = keyMatch[1];
  fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } })
    .then(r => r.json())
    .then(d => {
       const ramProducts = d.filter(x => x.categories !== null).slice(0, 5);
       console.log('RAM Products specs:', JSON.stringify(ramProducts, null, 2));
    });
}
