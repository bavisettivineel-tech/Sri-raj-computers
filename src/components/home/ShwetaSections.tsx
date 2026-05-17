import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryCard = ({ name, img, link }: { name: string, img: string, link: string }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(link)}
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #DDD6FE',
        borderRadius: '8px',
        padding: '24px 12px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textAlign: 'center',
        aspectRatio: '1/1',
        width: '100%',
      }}
      className="hover:border-[#7C3AED] hover:shadow-[0_0_20px_rgba(124, 58, 237, 0.3)] hover:-translate-y-1"
    >
      <div style={{ width: '100%', height: '75%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img
          src={img}
          alt={name}
          style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/0b121e/white?text=Image+Coming+Soon';
          }}
        />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 900, color: '#1E1B4B', textTransform: 'capitalize', fontFamily: 'Space Grotesk, sans-serif' }}>{name}</span>
    </button>
  );
};

// so ShopPage's ?q= resolver can match it via ilike search
const shopLink = (categoryName: string) => `/shop?q=${encodeURIComponent(categoryName)}`;

export const PCComponents = () => {
  const categories = [
    { name: 'Monitor', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=80' },
    { name: 'Cabinet', img: 'https://shwetacomputers.com/cdn/shop/collections/1_6d89113d-f730-4ffd-b767-48838256f623.webp?v=1722173204' },
    { name: 'Motherboard', img: 'https://shwetacomputers.com/cdn/shop/collections/2_4af50eda-28c4-469b-8e80-f96909a44d5a.webp?v=1722171397' },
    { name: 'Processor', img: 'https://shwetacomputers.com/cdn/shop/collections/61oDBiX7OWL.webp?v=1722173573' },
    { name: 'RAM', img: 'https://shwetacomputers.com/cdn/shop/collections/2_18ff46f1-2250-460f-8ce4-7108ec3edd21.webp?v=1722173997' },
    { name: 'SSD', img: 'https://shwetacomputers.com/cdn/shop/collections/3_ce1c85d6-4f0c-44be-bc3f-8d13fe76989f.webp?v=1722173743' },
    { name: 'HDD', img: 'https://shwetacomputers.com/cdn/shop/collections/3_64221bc5-4608-438b-af02-ced7357e4b18.webp?v=1722172044' },
    { name: 'Graphics Card', img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&auto=format&fit=crop&q=80' },
    { name: 'Air Cooler', img: 'https://shwetacomputers.com/cdn/shop/collections/3_940x_f33020bb-4a20-4808-92e4-0be7c5f4a177.webp?v=1721731078' },
    { name: 'Cabinet Fans', img: 'https://shwetacomputers.com/cdn/shop/collections/2_37446bef-eb05-4afc-8b14-29e26a9abc60.webp?v=1722173683' },
    { name: 'Liquid Cooler', img: 'https://shwetacomputers.com/cdn/shop/collections/2_0c35221d-b8b7-42bc-bb42-78ded2d58b5b.webp?v=1722173832' },
    { name: 'Power Supply', img: 'https://shwetacomputers.com/cdn/shop/collections/1_95b4af1a-0ace-4c47-9755-99456c239e6e.webp?v=1722172518' },
  ];

  return (
    <section className="px-4 py-8 bg-[#F5F3FF]">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.map(cat => (
          <CategoryCard key={cat.name} {...cat} link={shopLink(cat.name)} />
        ))}
      </div>
    </section>
  );
};

export const GamingLaptops = () => {
  const categories = [
    { name: 'Acer', img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop&q=80' },
    { name: 'ASUS', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&auto=format&fit=crop&q=80' },
    { name: 'DELL', img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=80' },
    { name: 'HP', img: 'https://images.unsplash.com/photo-1580522154071-c6ca47a859ad?w=400&auto=format&fit=crop&q=80' },
    { name: 'Lenovo', img: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=400&auto=format&fit=crop&q=80' },
    { name: 'MSI', img: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&auto=format&fit=crop&q=80' },
  ];

  return (
    <section className="px-4 py-8 bg-[#FFFFFF]">
      <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6 px-2 font-heading">Gaming Laptops</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.map(cat => (
          // Clicking a brand card → /shop?q=Laptop&brandq=BrandName
          <CategoryCard key={cat.name} {...cat} link={`${shopLink('Laptop')}&brandq=${encodeURIComponent(cat.name)}`} />
        ))}
      </div>
    </section>
  );
};

export const GamingAccessories = () => {
  const categories = [
    { name: 'Keyboard', img: 'https://shwetacomputers.com/cdn/shop/collections/1_533x_bb485f83-162c-4efd-b8cd-aae9d78a3211.webp?v=1722171638' },
    { name: 'Mouse', img: 'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=400&auto=format&fit=crop&q=80' },
    { name: 'Mouse Pads', img: 'https://shwetacomputers.com/cdn/shop/collections/3_adaa8281-9720-4979-a988-3132c7ebad95.webp?v=1722171480' },
    { name: 'Gaming Chair', img: 'https://shwetacomputers.com/cdn/shop/collections/1_aa99e037-d7f1-4058-a6cc-df60b2ec6c4e.webp?v=1722171945' },
    { name: 'Headphones', img: 'https://shwetacomputers.com/cdn/shop/collections/4_f2ba3871-73e6-4b63-bcb9-a3054247deab.webp?v=1722173273' },
    { name: 'Microphone', img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&auto=format&fit=crop&q=80' },
  ];

  return (
    <section className="px-4 py-8 bg-[#F5F3FF]">
      <h2 className="text-2xl font-bold text-[#1E1B4B] mb-6 px-2 font-heading">Gaming Accessories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.map(cat => (
          <CategoryCard key={cat.name} {...cat} link={shopLink(cat.name)} />
        ))}
      </div>
    </section>
  );
};

export const StaticBanner = ({ img }: { img: string }) => (
  <div className="w-full px-4 mb-8">
    <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '1920 / 600' }}>
      <img
        src={img}
        alt="Promo"
        className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
      />
    </div>
  </div>
);
