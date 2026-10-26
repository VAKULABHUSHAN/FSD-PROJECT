import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';

export default function MovieCarousel({ title, subtitle, movies = [], seeAllLink, onOpenTrailer }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div style={{ marginBottom: '3.5rem' }}>
      {/* Header */}
      <div className="section-header">
        <div className="section-title-wrap">
          <div className="gold-bar" />
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {seeAllLink && (
            <Link
              to={seeAllLink}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                transition: 'opacity 0.2s'
              }}
            >
              <span>Explore All</span>
              <ArrowRight size={16} />
            </Link>
          )}

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => scroll('left')}
              className="btn-icon"
              aria-label="Scroll Left"
              style={{ width: '34px', height: '34px' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="btn-icon"
              aria-label="Scroll Right"
              style={{ width: '34px', height: '34px' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '1.25rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: '0.75rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="hide-scrollbar"
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            style={{
              flex: '0 0 calc(50% - 0.75rem)',
              minWidth: '160px',
              maxWidth: '220px',
              scrollSnapAlign: 'start'
            }}
            className="carousel-item"
          >
            <MovieCard movie={movie} onOpenTrailer={onOpenTrailer} />
          </div>
        ))}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 640px) {
          .carousel-item {
            flex: 0 0 calc(33.333% - 0.85rem) !important;
          }
        }
        @media (min-width: 900px) {
          .carousel-item {
            flex: 0 0 calc(25% - 1rem) !important;
          }
        }
        @media (min-width: 1200px) {
          .carousel-item {
            flex: 0 0 calc(16.666% - 1.05rem) !important;
          }
        }
      `}</style>
    </div>
  );
}
