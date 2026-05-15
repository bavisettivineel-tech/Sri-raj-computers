import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductCard from '@/components/ProductCard';
import { useProducts, useCategories, useProductsCount, useCategoryByName, useBrandByName, useBrands } from '@/hooks/useProducts';
import { getDiscount } from '@/types/product';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ArrowRight, Check, Tag, Laptop, Cpu, HardDrive, Monitor, MousePointer, Keyboard, Printer, Box, Zap, Speaker, Headphones, Database, CircuitBoard } from 'lucide-react';
import type { Product } from '@/types/product';

const categoryIcons: Record<string, any> = {
  'laptops': Laptop,
  'gaming laptops': Laptop,
  'laptop': Laptop,
  'cpu': Cpu,
  'processor': Cpu,
  'ram': Database,
  'memory': Database,
  'hard disk': HardDrive,
  'hdd': HardDrive,
  'ssd': HardDrive,
  'monitor': Monitor,
  'monitors': Monitor,
  'keyboard': Keyboard,
  'mouse': MousePointer,
  'headphone': Headphones,
  'headset': Headphones,
  'speaker': Speaker,
  'printer': Printer,
  'cabinet': Box,
  'psu': Zap,
  'gpu': CircuitBoard,
  'graphics card': CircuitBoard,
  'accessories': Tag,
};

const sortOptions = [
  { key: 'relevance',  label: 'Relevance' },
  { key: 'price-low',  label: 'Price: Low → High' },
  { key: 'price-high', label: 'Price: High → Low' },
  { key: 'discount',   label: 'Best Discount' },
];

// ── Multi-spec filter groups per category ──────────────────────────────────────
type SpecGroup = { label: string; keys: string[] };
const CATEGORY_SPEC_GROUPS: Record<string, SpecGroup[]> = {
  laptop:          [ { label: 'Processor', keys: ['Processor', 'CPU', 'Processor Model', 'Processor Series'] }, { label: 'RAM', keys: ['RAM', 'RAM Size', 'Memory', 'Installed RAM'] }, { label: 'Storage', keys: ['Storage', 'SSD', 'HDD', 'Storage Capacity', 'Hard Disk'] }, { label: 'Display', keys: ['Display Size', 'Screen Size', 'Screen'] } ],
  laptops:         [ { label: 'Processor', keys: ['Processor', 'CPU', 'Processor Model', 'Processor Series'] }, { label: 'RAM', keys: ['RAM', 'RAM Size', 'Memory', 'Installed RAM'] }, { label: 'Storage', keys: ['Storage', 'SSD', 'HDD', 'Storage Capacity', 'Hard Disk'] }, { label: 'Display', keys: ['Display Size', 'Screen Size', 'Screen'] } ],
  'gaming laptop': [ { label: 'Processor', keys: ['Processor', 'CPU', 'Processor Model', 'Processor Series'] }, { label: 'RAM', keys: ['RAM', 'RAM Size', 'Memory', 'Installed RAM'] }, { label: 'Storage', keys: ['Storage', 'SSD', 'HDD', 'Storage Capacity'] }, { label: 'GPU', keys: ['GPU', 'Graphics', 'Graphics Card', 'Video Card'] } ],
  ram:             [ { label: 'Capacity', keys: ['Capacity', 'RAM Size', 'Size', 'Memory'] }, { label: 'Type', keys: ['Type', 'RAM Type', 'Memory Type'] }, { label: 'Speed', keys: ['Speed', 'Frequency', 'Clock Speed'] } ],
  memory:          [ { label: 'Capacity', keys: ['Capacity', 'RAM Size', 'Size', 'Memory'] }, { label: 'Type', keys: ['Type', 'RAM Type', 'Memory Type'] } ],
  'hard disk':     [ { label: 'Storage', keys: ['Storage Capacity', 'Capacity', 'Storage', 'HDD Size'] }, { label: 'Type', keys: ['Type', 'HDD Type'] }, { label: 'RPM', keys: ['RPM', 'Rotation Speed'] } ],
  hdd:             [ { label: 'Storage', keys: ['Storage Capacity', 'Capacity', 'Storage', 'HDD Size'] }, { label: 'RPM', keys: ['RPM', 'Rotation Speed'] } ],
  ssd:             [ { label: 'Storage', keys: ['Storage Capacity', 'Capacity', 'Storage', 'SSD Size'] }, { label: 'Interface', keys: ['Interface', 'Form Factor', 'Type'] } ],
  storage:         [ { label: 'Storage', keys: ['Storage Capacity', 'Capacity', 'Storage'] }, { label: 'Type', keys: ['Type', 'Interface'] } ],
  processor:       [ { label: 'Series', keys: ['Processor Series', 'Series', 'Processor Model'] }, { label: 'Generation', keys: ['Generation', 'Gen'] }, { label: 'Cores', keys: ['Cores', 'Core Count', 'Number of Cores'] } ],
  cpu:             [ { label: 'Series', keys: ['Processor Series', 'Series', 'Processor Model'] }, { label: 'Generation', keys: ['Generation', 'Gen'] }, { label: 'Cores', keys: ['Cores', 'Core Count'] } ],
  monitor:         [ { label: 'Size', keys: ['Screen Size', 'Display Size', 'Size', 'Panel Size'] }, { label: 'Resolution', keys: ['Resolution', 'Display Resolution'] }, { label: 'Refresh Rate', keys: ['Refresh Rate', 'Hz'] } ],
  monitors:        [ { label: 'Size', keys: ['Screen Size', 'Display Size', 'Size', 'Panel Size'] }, { label: 'Resolution', keys: ['Resolution', 'Display Resolution'] }, { label: 'Refresh Rate', keys: ['Refresh Rate', 'Hz'] } ],
  keyboard:        [ { label: 'Type', keys: ['Type', 'Switch Type'] }, { label: 'Connectivity', keys: ['Connectivity', 'Interface'] } ],
  mouse:           [ { label: 'Connectivity', keys: ['Connectivity', 'Interface'] }, { label: 'DPI', keys: ['DPI', 'Max DPI'] } ],
  headphone:       [ { label: 'Type', keys: ['Type'] }, { label: 'Connectivity', keys: ['Connectivity', 'Interface'] } ],
  headset:         [ { label: 'Type', keys: ['Type'] }, { label: 'Connectivity', keys: ['Connectivity', 'Interface'] } ],
  printer:         [ { label: 'Type', keys: ['Type', 'Print Technology'] }, { label: 'Connectivity', keys: ['Connectivity', 'Interface'] } ],
  cabinet:         [ { label: 'Form Factor', keys: ['Form Factor', 'Type', 'Size'] } ],
  'power supply':  [ { label: 'Wattage', keys: ['Wattage', 'Power Output', 'Rating'] } ],
  psu:             [ { label: 'Wattage', keys: ['Wattage', 'Power Output', 'Rating'] } ],
  gpu:             [ { label: 'VRAM', keys: ['VRAM', 'Memory', 'Video Memory'] }, { label: 'Chipset', keys: ['Chipset', 'GPU Model', 'Model'] } ],
  'graphics card': [ { label: 'VRAM', keys: ['VRAM', 'Memory', 'Video Memory'] }, { label: 'Chipset', keys: ['Chipset', 'GPU Model', 'Model'] } ],
  motherboard:     [ { label: 'Socket', keys: ['Socket', 'CPU Socket'] }, { label: 'Chipset', keys: ['Chipset'] }, { label: 'Form Factor', keys: ['Form Factor'] } ],
  accessories:     [ { label: 'Type', keys: ['Type', 'Connectivity', 'Interface'] } ],
};

const getCategorySpecGroups = (catName: string): SpecGroup[] => {
  if (!catName) return [];
  const lower = catName.toLowerCase();
  if (CATEGORY_SPEC_GROUPS[lower]) return CATEGORY_SPEC_GROUPS[lower];
  const key = Object.keys(CATEGORY_SPEC_GROUPS).find(k => lower.includes(k) || k.includes(lower));
  return key ? CATEGORY_SPEC_GROUPS[key] : [];
};

const extractSizeFromName = (name: string, keys: string[]): string | null => {
  const upperName = name.toUpperCase();
  const isGPU = keys.some(k => ['VRAM', 'Video Memory'].includes(k));
  const isRAM = keys.some(k => ['RAM', 'RAM Size', 'Installed RAM'].includes(k)) || (keys.includes('Memory') && !isGPU);
  const isStorage = keys.some(k => ['Storage', 'Storage Capacity', 'SSD', 'HDD', 'Hard Disk'].includes(k));
  const isGenericCapacity = keys.some(k => ['Capacity', 'Size'].includes(k));

  if (isGPU) {
    const match = upperName.match(/(\d+(?:\.\d+)?\s*GB)\s*(?:VRAM|GRAPHICS|VIDEO)/) || upperName.match(/\b((?:2|4|6|8|10|12|16|20|24)\s*GB)\b/);
    if (match) return match[1].replace(/\s/g, '');
  }

  if (isRAM) {
    const match = upperName.match(/(\d+(?:\.\d+)?\s*GB)\s*(?:RAM|MEMORY)/) || upperName.match(/\b((?:2|4|8|16|32|64|128)\s*GB)\b/);
    if (match) return match[1].replace(/\s/g, '');
  }
  
  if (isStorage) {
    const match = upperName.match(/(\d+(?:\.\d+)?\s*(?:GB|TB))\s*(?:SSD|HDD|NVME)/) || upperName.match(/\b((?:120|128|240|256|480|500|512)\s*GB)\b/) || upperName.match(/\b((?:1|2|4|8)\s*TB)\b/);
    if (match) return match[1].replace(/\s/g, '');
  }
  
  if (isGenericCapacity) {
    const match = upperName.match(/(\d+(?:\.\d+)?\s*(?:GB|TB))/);
    if (match) return match[1].replace(/\s/g, '');
  }

  return null;
};

const extractVariants = (products: Product[], keys: string[]): string[] => {
  const seen = new Set<string>();
  products.forEach(p => {
    let extracted = false;
    if (p.specifications) {
      for (const key of keys) {
        const val = p.specifications[key];
        if (val && typeof val === 'string' && val.trim()) { 
          seen.add(val.trim()); 
          extracted = true;
          break; 
        }
      }
    }
    
    // Fallback: extract from name for common variants if missing in specs
    if (!extracted) {
      const extractedVal = extractSizeFromName(p.name, keys);
      if (extractedVal) seen.add(extractedVal);
    }
  });
  return Array.from(seen).sort((a, b) => {
    const nA = parseFloat(a), nB = parseFloat(b);
    return (!isNaN(nA) && !isNaN(nB)) ? nA - nB : a.localeCompare(b);
  });
};

// ── Ordered category groups for the "All Products" view ──────────────────────
// Products are shown section-by-section: Laptops first, then Gaming Accessories,
// then remaining categories in sort_order.
const PRIORITY_CATEGORY_NAMES = [
  'gaming laptops',
  'laptops',
  'laptop',
  'gaming accessories',
  'gaming accessory',
];

// ── Sub-component: one category section row on the "All" page ────────────────
interface CategoryRowProps {
  categoryId: string;
  categoryName: string;
  allProducts: ReturnType<typeof useProducts>['data'];
  sortBy: string;
  navigate: ReturnType<typeof useNavigate>;
}

const CategoryRow = ({ categoryId, categoryName, allProducts = [], sortBy, navigate }: CategoryRowProps) => {
  const categoryProducts = allProducts.filter(p => p.category_id === categoryId);

  const sorted = [...categoryProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':  return a.sale_price - b.sale_price;
      case 'price-high': return b.sale_price - a.sale_price;
      case 'discount':   return getDiscount(b) - getDiscount(a);
      default:           return 0;
    }
  });

  const preview = sorted.slice(0, 6);
  if (preview.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full shadow-[0_0_12px_rgba(124,58,237,0.3)]" />
          <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight font-heading">
            {categoryName}
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            ({categoryProducts.length} products)
          </span>
        </div>
        {categoryProducts.length > 6 && (
          <button
            onClick={() => navigate(`/shop?category=${categoryId}`)}
            className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider hover:text-slate-900 transition-colors"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Products Grid */}
      <div className="products-grid px-4 md:px-6">
        {preview.map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      {/* Divider */}
      <div className="mx-4 md:mx-6 mt-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </section>
  );
};

// ── Main ShopPage ─────────────────────────────────────────────────────────────
const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ?category=<uuid>  (from MegaMenu / SideMenu)
  const categoryUUID = searchParams.get('category') || '';
  // ?q=<name>  (from ShwetaSections home category cards)
  const categoryNameParam = searchParams.get('q') || '';
  // ?brandq=<name> (from ShwetaSections brand cards)
  const brandNameParam = searchParams.get('brandq') || '';

  // Resolve category name → UUID when ?q= is used
  const { data: resolvedCategory, isLoading: resolvingName } = useCategoryByName(categoryNameParam);
  // Resolve brand name → UUID when ?brandq= is used
  const { data: resolvedBrand, isLoading: resolvingBrand } = useBrandByName(brandNameParam);

  // After resolution, determine the effective category ID and brand ID
  const [selectedCategory, setSelectedCategory] = useState(categoryUUID);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(300000);
  const [specFilters, setSpecFilters] = useState<Record<string, string>>({});

  const setSpecFilter = (label: string, value: string) =>
    setSpecFilters(prev => ({ ...prev, [label]: prev[label] === value ? '' : value }));
  const clearSpecFilters = () => setSpecFilters({});

  useEffect(() => {
    if (categoryUUID) {
      setSelectedCategory(categoryUUID);
    } else if (categoryNameParam && resolvedCategory) {
      setSelectedCategory(resolvedCategory.id);
    } else if (!categoryUUID && !categoryNameParam) {
      setSelectedCategory('');
    }
    clearSpecFilters();
  }, [categoryUUID, categoryNameParam, resolvedCategory]);

  useEffect(() => {
    if (brandNameParam && resolvedBrand) {
      setSelectedBrand(resolvedBrand.id);
    } else if (!brandNameParam) {
      setSelectedBrand('');
    }
  }, [brandNameParam, resolvedBrand]);

  const [sortBy, setSortBy] = useState('relevance');
  const [showSort, setShowSort] = useState(false);

  // Fetch products — when filtering, fetch all in category; when "All", fetch 200
  const { data: products = [], isLoading: productsLoading } = useProducts(200, selectedCategory || undefined, selectedBrand || undefined);
  const { data: totalCount = 0 } = useProductsCount(selectedCategory || undefined, selectedBrand || undefined);
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const isLoading = productsLoading || (!!categoryNameParam && resolvingName) || (!!brandNameParam && resolvingBrand);

  // ── Resolve active category + spec groups FIRST (needed by filter logic) ──
  const activeCategory = categories.find(c => c.id === selectedCategory);
  const activeCategoryName = activeCategory?.name
    || (categoryNameParam ? (resolvedCategory?.name || categoryNameParam) : '');
  const specGroups = getCategorySpecGroups(activeCategoryName);

  // ── Filter by Price ──
  const priceFiltered = products.filter(p => p.sale_price <= maxPrice);

  // ── Filter by active spec filters (AND logic across groups) ──
  const activeSpecEntries = Object.entries(specFilters).filter(([, v]) => v !== '');
  const filteredProducts = activeSpecEntries.length === 0
    ? priceFiltered
    : priceFiltered.filter(p => {
        return activeSpecEntries.every(([label, value]) => {
          const group = specGroups.find(g => g.label === label);
          if (!group) return true;
          
          // 1. Check if the value exists in structured specifications
          if (p.specifications) {
            const matchInSpecs = group.keys.some(k => {
              const specVal = p.specifications![k];
              return specVal && typeof specVal === 'string' && specVal.trim() === value;
            });
            if (matchInSpecs) return true;
          }
          
          // 2. Fallback: check if the value was extracted from the product name
          const extractedVal = extractSizeFromName(p.name, group.keys);
          if (extractedVal && extractedVal === value) {
            return true;
          }
          
          return false;
        });
      });

  // ── Sorted ──
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':  return a.sale_price - b.sale_price;
      case 'price-high': return b.sale_price - a.sale_price;
      case 'discount':   return getDiscount(b) - getDiscount(a);
      default:           return 0;
    }
  });


  // ── Grouped category order for "All" view ────────────────────────────────
  const orderedCategories = (() => {
    // Separate priority categories (laptops first, then gaming accessories)
    const priority: typeof categories = [];
    const rest: typeof categories = [];

    categories.forEach(cat => {
      if (PRIORITY_CATEGORY_NAMES.includes(cat.name.toLowerCase())) {
        priority.push(cat);
      } else {
        rest.push(cat);
      }
    });

    // Sort priority by the PRIORITY_CATEGORY_NAMES order
    priority.sort((a, b) => {
      const ai = PRIORITY_CATEGORY_NAMES.indexOf(a.name.toLowerCase());
      const bi = PRIORITY_CATEGORY_NAMES.indexOf(b.name.toLowerCase());
      return ai - bi;
    });

    return [...priority, ...rest];
  })();

  const activeSortLabel = sortOptions.find(o => o.key === sortBy)?.label || 'Relevance';

  return (
    <div className="app-shell bg-slate-50 min-h-screen">
      <Header />
      <main className="pb-20 lg:pb-6">
        {/* Page Hero Banner */}
        <div
          className="px-5 py-12 md:py-16 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)' }}
        >
          <div className="absolute right-[-20px] top-[-20px] w-64 h-64 rounded-full opacity-10 bg-primary blur-[100px]" />
          <div className="absolute left-[-30px] bottom-[-30px] w-48 h-48 rounded-full opacity-10 bg-secondary blur-[80px]" />
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">Explore Collection</p>
          <h1 className="font-black text-slate-900 uppercase tracking-tighter font-heading" style={{ fontSize: 'clamp(28px, 6vw, 48px)' }}>
            {activeCategory?.name || (categoryNameParam ? (resolvedCategory?.name || categoryNameParam) : 'All Products')}
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full shadow-lg shadow-primary/20" />
        </div>

        {/* Layout: sidebar (hidden mobile) + content */}
        <div className="flex">
          <aside className="hidden md:block w-72 shrink-0 p-6 self-start sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto border-r border-slate-200 bg-white">
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6 font-heading">Filters</h2>

              {/* Categories Accordion */}
              <details open className="group border-b border-slate-100 pb-4">
                <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 font-heading">
                    <span className="w-1.5 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(124,58,237,0.3)]" />
                    Categories
                  </h3>
                  <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="flex flex-col gap-1 mt-3">
                  <label onClick={(e) => {
                    e.preventDefault();
                    setSelectedCategory(''); navigate('/shop');
                  }} className="flex items-center gap-3 group cursor-pointer py-1.5">
                    <div className={`w-4 h-4 rounded-[3px] border transition-all flex items-center justify-center ${!selectedCategory ? 'bg-primary border-primary' : 'border-slate-200 bg-transparent group-hover:border-primary'}`}>
                      {!selectedCategory && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                    <span className={`text-[13px] font-medium transition-colors ${!selectedCategory ? 'text-slate-900 font-bold' : 'text-slate-500 group-hover:text-slate-900'}`}>
                      All Categories
                    </span>
                  </label>
                  {categories.map(cat => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <label key={cat.id} onClick={(e) => {
                        e.preventDefault();
                        if (isActive) {
                          setSelectedCategory(''); navigate('/shop');
                        } else {
                          setSelectedCategory(cat.id); navigate(`/shop?category=${cat.id}`);
                        }
                      }} className="flex items-center gap-3 group cursor-pointer py-2 px-3 hover:bg-slate-50 rounded-xl transition-all">
                        <div className={`w-4 h-4 rounded-[6px] border transition-all flex items-center justify-center ${isActive ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'border-slate-300 bg-white group-hover:border-primary'}`}>
                          {isActive && <Check className="w-3 h-3 text-white stroke-[4]" />}
                        </div>
                        <span className={`text-[13px] font-bold transition-colors ${isActive ? 'text-primary' : 'text-slate-600 group-hover:text-primary'}`}>
                          {cat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </details>

              {/* ── Multi-Spec Filters (desktop sidebar) ── */}
              {specGroups.length > 0 && selectedCategory && specGroups.map(group => {
                const variants = extractVariants(products, group.keys);
                if (variants.length === 0) return null;
                const active = specFilters[group.label] || '';
                return (
                  <details key={group.label} open className="group border-b border-slate-100 pb-4">
                    <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                      <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 font-heading">
                        <span className="w-1 h-3 bg-secondary rounded-full" />
                        {group.label}
                      </h3>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="flex flex-col gap-1 mt-3">
                      <label onClick={e => { e.preventDefault(); setSpecFilters(p => ({ ...p, [group.label]: '' })); }} className="flex items-center gap-3 group cursor-pointer py-2 px-3 hover:bg-slate-50 rounded-xl transition-all">
                        <div className={`w-4 h-4 rounded-[6px] border transition-all flex items-center justify-center ${!active ? 'bg-secondary border-secondary shadow-lg shadow-secondary/20' : 'border-slate-300 bg-white group-hover:border-secondary'}`}>
                          {!active && <Check className="w-3 h-3 text-white stroke-[4]" />}
                        </div>
                        <span className={`text-[13px] font-bold ${!active ? 'text-secondary' : 'text-slate-600 group-hover:text-secondary'}`}>All</span>
                      </label>
                      {variants.map(v => (
                        <label key={v} onClick={e => { e.preventDefault(); setSpecFilter(group.label, v); }} className="flex items-center gap-3 group cursor-pointer py-2 px-3 hover:bg-slate-50 rounded-xl transition-all">
                          <div className={`w-4 h-4 rounded-[6px] border transition-all flex items-center justify-center ${active === v ? 'bg-secondary border-secondary shadow-lg shadow-secondary/20' : 'border-slate-300 bg-white group-hover:border-secondary'}`}>
                            {active === v && <Check className="w-3 h-3 text-white stroke-[4]" />}
                          </div>
                          <span className={`text-[13px] font-bold ${active === v ? 'text-secondary' : 'text-slate-600 group-hover:text-secondary'}`}>{v}</span>
                        </label>
                      ))}
                    </div>
                  </details>
                );
              })}


              {/* Price Range Accordion */}
              <details open className="group border-b border-slate-100 pb-4">
                <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 font-heading">
                    <span className="w-1 h-3 bg-secondary rounded-full" />
                    Price Range
                  </h3>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-1 mt-4">
                  <div className="text-center mb-3">
                    <span className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                      Up to ₹{maxPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-secondary" 
                    min="1000" 
                    max="300000" 
                    step="1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                  />
                  <div className="flex justify-between mt-3">
                    <span className="text-[10px] text-slate-400 font-bold">₹1K</span>
                    <span className="text-[10px] text-slate-400 font-bold">₹300K+</span>
                  </div>
                </div>
              </details>

              {/* Brands Accordion */}
              <details open className="group border-b border-slate-100 pb-6">
                <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 font-heading">
                    <span className="w-1.5 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(124,58,237,0.3)]" />
                    Brands
                  </h3>
                  <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="flex flex-col gap-1 mt-3">
                  <label onClick={(e) => {
                    e.preventDefault();
                    setSelectedBrand(''); navigate(selectedCategory ? `/shop?category=${selectedCategory}` : '/shop');
                  }} className="flex items-center gap-3 group cursor-pointer py-1.5">
                    <div className={`w-4 h-4 rounded-[3px] border transition-all flex items-center justify-center ${!selectedBrand ? 'bg-primary border-primary' : 'border-slate-200 bg-transparent group-hover:border-primary'}`}>
                      {!selectedBrand && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                    <span className={`text-[13px] font-medium transition-colors ${!selectedBrand ? 'text-slate-900 font-bold' : 'text-slate-500 group-hover:text-slate-900'}`}>
                      All Brands
                    </span>
                  </label>
                  {brands.map(brand => {
                    const isActive = selectedBrand === brand.id;
                    return (
                      <label key={brand.id} onClick={(e) => {
                        e.preventDefault();
                        if (isActive) {
                          setSelectedBrand('');
                          navigate(selectedCategory ? `/shop?category=${selectedCategory}` : '/shop');
                        } else {
                          setSelectedBrand(brand.id);
                          navigate(selectedCategory ? `/shop?category=${selectedCategory}&brandq=${encodeURIComponent(brand.name)}` : `/shop?brandq=${encodeURIComponent(brand.name)}`);
                        }
                      }} className="flex items-center gap-3 group cursor-pointer py-2 px-3 hover:bg-slate-50 rounded-xl transition-all">
                        <div className={`w-4 h-4 rounded-[6px] border transition-all flex items-center justify-center ${isActive ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'border-slate-300 bg-white group-hover:border-primary'}`}>
                          {isActive && <Check className="w-3 h-3 text-white stroke-[4]" />}
                        </div>
                        <span className={`text-[13px] font-bold transition-colors ${isActive ? 'text-primary' : 'text-slate-600 group-hover:text-primary'}`}>
                          {brand.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </details>
            </div>
          </aside>

          {/* ── CONTENT AREA ── */}
          <div className="flex-1 min-w-0">
            {/* Category Chips Strip — mobile only */}
            <div className="md:hidden bg-white py-4 px-4 flex gap-3 overflow-x-auto scrollbar-hide border-b border-slate-100 shadow-sm sticky top-[60px] z-[30]">
              <button
                id="chip-all-products"
                onClick={() => { setSelectedCategory(''); clearSpecFilters(); navigate('/shop'); }}
                className={`shrink-0 flex flex-col items-center gap-2 min-w-[60px] transition-all ${!selectedCategory ? 'scale-110' : 'opacity-70'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${!selectedCategory ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
                  <Box className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tight ${!selectedCategory ? 'text-primary' : 'text-slate-500'}`}>All</span>
              </button>
              {categories.map(cat => {
                const Icon = categoryIcons[cat.name.toLowerCase()] || Box;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`chip-cat-${cat.id}`}
                    onClick={() => { setSelectedCategory(cat.id); clearSpecFilters(); navigate(`/shop?category=${cat.id}`); }}
                    className={`shrink-0 flex flex-col items-center gap-2 min-w-[60px] transition-all ${isActive ? 'scale-110' : 'opacity-70'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30 border-primary' : 'bg-white text-slate-500 border border-slate-200'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tight whitespace-nowrap ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                      {cat.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Multi-Spec Filter Chip Rows — mobile only */}
            {specGroups.length > 0 && selectedCategory && specGroups.map(group => {
              const variants = extractVariants(products, group.keys);
              if (variants.length === 0) return null;
              const active = specFilters[group.label] || '';
              return (
                <div key={group.label} className="md:hidden py-2 px-4 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-slate-100" style={{ background: '#FDFCF2' }}>
                  <span className="text-[10px] font-black text-secondary uppercase tracking-wider shrink-0 font-heading">{group.label}:</span>
                  <button onClick={() => setSpecFilters(p => ({ ...p, [group.label]: '' }))} className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${!active ? 'bg-secondary border-secondary text-white' : 'bg-white border-slate-200 text-slate-500'}`}>All</button>
                  {variants.map(v => (
                    <button key={v} onClick={() => setSpecFilter(group.label, v)} className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${active === v ? 'bg-secondary border-secondary text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-secondary'}`}>{v}</button>
                  ))}
                </div>
              );
            })}

            {/* Filter & Sort Sticky Bar */}
            <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-slate-200 sticky top-[60px] md:top-[70px] z-20 shadow-sm">
              <span className="text-sm text-slate-500 font-medium">{filteredProducts.length} products</span>

              <div className="flex items-center gap-2">
                {selectedCategory && (
                  <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                    <span className="text-xs text-primary font-bold">{activeCategory?.name}</span>
                    <button onClick={() => { setSelectedCategory(''); clearSpecFilters(); navigate(selectedBrand ? `/shop?brandq=${encodeURIComponent(brands.find(b => b.id === selectedBrand)?.name || '')}` : '/shop'); }} className="bg-transparent border-none cursor-pointer flex items-center p-0">
                      <X className="w-3 h-3 text-primary" />
                    </button>
                  </div>
                )}
                {/* Active spec filter pills */}
                {activeSpecEntries.map(([label, value]) => (
                  <div key={label} className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 rounded-full px-3 py-1">
                    <Tag className="w-3 h-3 text-secondary" />
                    <span className="text-xs text-secondary font-bold">{label}: {value}</span>
                    <button onClick={() => setSpecFilters(p => ({ ...p, [label]: '' }))} className="bg-transparent border-none cursor-pointer flex items-center p-0">
                      <X className="w-3 h-3 text-secondary" />
                    </button>
                  </div>
                ))}
                
                {selectedBrand && (
                  <div className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 rounded-full px-3 py-1">
                    <span className="text-xs text-secondary font-bold">
                      {brands.find(b => b.id === selectedBrand)?.name}
                    </span>
                    <button
                      onClick={() => { setSelectedBrand(''); navigate(selectedCategory ? `/shop?category=${selectedCategory}` : '/shop'); }}
                      className="bg-transparent border-none cursor-pointer flex items-center p-0"
                    >
                      <X className="w-3 h-3 text-secondary" />
                    </button>
                  </div>
                )}

                {/* Sort button — mobile/tablet */}
                <button
                  id="sort-btn"
                  onClick={() => setShowSort(!showSort)}
                  className="md:hidden flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 cursor-pointer hover:bg-slate-100"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                  {activeSortLabel.split(':')[0] || 'Sort'}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Mobile Sort Dropdown */}
            {showSort && (
              <div className="md:hidden bg-white px-4 py-3 border-b border-slate-200 flex flex-wrap gap-2 shadow-inner">
                {sortOptions.map(opt => (
                  <button
                    key={opt.key}
                    id={`sort-${opt.key}`}
                    onClick={() => { setSortBy(opt.key); setShowSort(false); }}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-all ${
                      sortBy === opt.key
                        ? 'bg-primary text-white border-0'
                        : 'border border-slate-200 text-slate-500 bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── PRODUCT DISPLAY ── */}
            {isLoading ? (
              /* Loading skeletons */
              <div className="products-grid p-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <div className="skeleton rounded-xl mb-2" style={{ height: 'clamp(130px,20vw,200px)' }} />
                    <div className="skeleton h-3 w-3/5 mb-1.5 rounded" />
                    <div className="skeleton h-3.5 mb-1.5 rounded" />
                    <div className="skeleton h-8 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (selectedCategory || selectedBrand) ? (
              /* ── FILTERED VIEW ── */
              sortedProducts.length === 0 ? (
                <div className="text-center py-16 px-5">
                  <div className="text-6xl mb-3">📦</div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 font-heading">No products found</h3>
                  <p className="text-sm text-slate-400">Try a different category or clear filters</p>
                  <button
                    onClick={() => { setSelectedCategory(''); setSelectedBrand(''); navigate('/shop'); }}
                    className="mt-4 bg-primary text-white border-none rounded-xl px-6 py-2.5 text-sm font-black cursor-pointer shadow-lg shadow-primary/20"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="products-grid p-4 md:p-6">
                  {sortedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )
            ) : (
              /* ── "ALL PRODUCTS" GROUPED VIEW — category by category ── */
              <div className="pt-4">
                {orderedCategories.map(cat => (
                  <CategoryRow
                    key={cat.id}
                    categoryId={cat.id}
                    categoryName={cat.name}
                    allProducts={filteredProducts}
                    sortBy={sortBy}
                    navigate={navigate}
                  />
                ))}

                {/* Catch-all: products with no/unknown category */}
                {(() => {
                  const knownCatIds = new Set(categories.map(c => c.id));
                  const uncategorised = filteredProducts.filter(p => !p.category_id || !knownCatIds.has(p.category_id));
                  if (uncategorised.length === 0) return null;
                  return (
                    <section className="mb-8">
                      <div className="flex items-center gap-3 px-4 md:px-6 py-4">
                        <div className="w-1 h-6 bg-secondary rounded-full shadow-lg shadow-secondary/20" />
                        <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight font-heading">Other Products</h2>
                      </div>
                      <div className="products-grid px-4 md:px-6">
                        {uncategorised.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
                      </div>
                    </section>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </main>
      <WhatsAppButton />
      <BottomNav />
    </div>
  );
};

export default ShopPage;
