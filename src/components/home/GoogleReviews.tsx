import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useState } from 'react';

const reviews = [
  {
    name: 'Ramesh Kumar', initials: 'RK',
    gradient: 'linear-gradient(135deg, #007bff 0%, #10B981 100%)',
    rating: 5, date: '2 weeks ago',
    text: 'Excellent service and quality products. Got my HP toner cartridge at the best price. Highly recommended for anyone in Peddapuram!',
  },
  {
    name: 'Srinivas Rao', initials: 'SR',
    gradient: 'linear-gradient(135deg, #10B981 0%, #007bff 100%)',
    rating: 5, date: '1 month ago',
    text: 'Best IT store in Peddapuram. Raja garu is very helpful and knowledgeable. CCTV installation was perfect and professional.',
  },
  {
    name: 'Lakshmi Devi', initials: 'LD',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #007bff 100%)',
    rating: 5, date: '3 weeks ago',
    text: 'Purchased a Foxin keyboard and mouse combo. Great quality at affordable prices. Customer support is excellent. Will buy again!',
  },
  {
    name: 'Venkat Reddy', initials: 'VR',
    gradient: 'linear-gradient(135deg, #007bff 0%, #22C55E 100%)',
    rating: 5, date: '5 days ago',
    text: 'Fast delivery and genuine products. The HP ink cartridges are original and work perfectly. Prices are better than Amazon!',
  },
];

const GoogleReviews = () => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(c => (c - 1 + reviews.length) % reviews.length);
  const next = () => setCurrent(c => (c + 1) % reviews.length);

  return (
    <section id="reviews-section" style={{ padding: '8px 16px 0' }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid rgba(0,123,255,0.1)',
        boxShadow: '0 0 20px rgba(0,123,255,0.05)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>Sri Raj Computers</p>
            <p style={{ fontSize: '13px', color: '#64748b' }}>& IT Solutions</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{
                fontSize: '22px', fontWeight: 900, color: 'white',
                textShadow: '0 0 10px rgba(245,158,11,0.5)',
              }}>4.9</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} style={{ width: '15px', height: '15px', fill: '#f59e0b', color: '#f59e0b', filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.5))' }} />
                ))}
              </div>
              {/* Google logo */}
              <div style={{ display: 'flex', gap: '1px', marginLeft: '4px' }}>
                <span style={{ color: '#4285F4', fontSize: '12px', fontWeight: 700 }}>G</span>
                <span style={{ color: '#EA4335', fontSize: '12px', fontWeight: 700 }}>o</span>
                <span style={{ color: '#FBBC05', fontSize: '12px', fontWeight: 700 }}>o</span>
                <span style={{ color: '#4285F4', fontSize: '12px', fontWeight: 700 }}>g</span>
                <span style={{ color: '#34A853', fontSize: '12px', fontWeight: 700 }}>l</span>
                <span style={{ color: '#EA4335', fontSize: '12px', fontWeight: 700 }}>e</span>
              </div>
            </div>
          </div>
          <a
            href="https://g.page/r/review"
            target="_blank"
            rel="noopener noreferrer"
            id="leave-review-btn"
            style={{
              border: '1px solid rgba(0,123,255,0.4)',
              color: '#007bff',
              borderRadius: '20px',
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              background: 'rgba(0,123,255,0.08)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 10px rgba(0,123,255,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            Leave a Review
          </a>
        </div>

        {/* Review card */}
        <div style={{
          background: 'rgba(0,0,0,0.25)',
          borderRadius: '16px',
          padding: '16px',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.06)',
          minHeight: '130px',
        }}>
          {/* Quote icon */}
          <Quote style={{ position: 'absolute', top: '12px', right: '12px', width: '24px', height: '24px', color: 'rgba(0,123,255,0.15)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            {/* Avatar */}
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: reviews[current].gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '15px', fontWeight: 800, flexShrink: 0,
              boxShadow: '0 0 10px rgba(0,123,255,0.3)',
            }}>
              {reviews[current].initials}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{reviews[current].name}</p>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{reviews[current].date}</p>
            </div>
          </div>
          {/* Stars */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
            {[...Array(reviews[current].rating)].map((_, j) => (
              <Star key={j} style={{ width: '13px', height: '13px', fill: '#f59e0b', color: '#f59e0b' }} />
            ))}
          </div>
          {/* Text */}
          <p className="line-clamp-3" style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
            {reviews[current].text}
          </p>
        </div>

        {/* Navigation arrows + dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '14px' }}>
          <button
            id="review-prev-btn"
            onClick={prev}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,123,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            <ChevronLeft style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
          </button>
          <div style={{ display: 'flex', gap: '6px' }}>
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? '20px' : '7px',
                  height: '7px',
                  borderRadius: '4px',
                  background: i === current ? '#007bff' : 'rgba(255,255,255,0.15)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.3s ease',
                  boxShadow: i === current ? '0 0 8px rgba(0,123,255,0.6)' : 'none',
                }}
              />
            ))}
          </div>
          <button
            id="review-next-btn"
            onClick={next}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,123,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255,255,0.08)')}
          >
            <ChevronRight style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
