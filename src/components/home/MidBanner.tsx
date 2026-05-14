import React from 'react';

const MidBanner = () => {
  return (
    <div className="w-full px-4 md:px-6 lg:px-8 xl:px-16 mb-12">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-[0_10px_40px_rgba(124, 58, 237, 0.15)] transition-transform duration-500 hover:scale-[1.01] lg:h-[350px]">
        <img 
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80" 
          alt="Built to Conquer - Ready to Play" 
          className="w-full h-auto lg:h-full object-cover object-center"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('placehold.co')) {
              target.src = 'https://placehold.co/1600x600/7C3AED/white?text=Built+to+Conquer';
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default MidBanner;
