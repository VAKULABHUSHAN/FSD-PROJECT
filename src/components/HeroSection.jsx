import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

export default function HeroSection({ featuredMovies = [], onOpenTrailer }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Auto rotate hero slide every 7 seconds
  useEffect(() => {
    if (!featuredMovies.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (!featuredMovies || featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentIndex] || featuredMovies[0];
  const inWatchlist = isInWatchlist(currentMovie?.id);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '620px',
      maxHeight: '740px',
      display: 'flex',
      alignItems: 'flex-end',
      overflow: 'hidden',
      marginBottom: '3rem'
    }}>
      {/* Background Backdrops */}
      {featuredMovies.map((movie, idx) => (
        <div
          key={movie.id}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${movie.backdrop})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            opacity: idx === currentIndex ? 1 : 0,
            transition: 'opacity 1s ease-in-out, transform 8s ease-out',
            transform: idx === currentIndex ? 'scale(1.04)' : 'scale(1)',
            zIndex: 1
          }}
        />
      ))}

      {/* Cinematic Gradient Overlays */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, #0B0B0F 0%, rgba(11, 11, 15, 0.85) 45%, rgba(11, 11, 15, 0.2) 100%), linear-gradient(to top, #0B0B0F 0%, rgba(11, 11, 15, 0.7) 40%, transparent 100%)',
        zIndex: 2
      }} />

      {/* Hero Content */}
      <div className="container" style={{
        position: 'relative',
        zIndex: 3,
        paddingBottom: '3.5rem',
        width: '100%'
      }}>
        <div style={{ maxWidth: '680px' }}>
          {/* Badge & Year */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <span style={{
              background: 'var(--accent-gold)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              FEATURED SPOTLIGHT
            </span>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              <Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
              <span>{currentMovie.rating?.toFixed(1) || '8.8'}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>
                ({currentMovie.voteCount || '500K'} votes)
              </span>
            </div>

            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
              {currentMovie.year}
            </span>

            {currentMovie.runtime && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {currentMovie.runtime}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            color: '#FFFFFF',
            marginBottom: '1rem',
            letterSpacing: '-0.03em',
            textShadow: '0 4px 20px rgba(0,0,0,0.8)'
          }}>
            {currentMovie.title}
          </h1>

          {/* Genres */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
            marginBottom: '1rem'
          }}>
            {currentMovie.genres?.map((genre, i) => (
              <span
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(4px)',
                  color: '#E5E7EB',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: '1.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)'
          }}>
            {currentMovie.overview}
          </p>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            flexWrap: 'wrap'
          }}>
            {currentMovie.trailerKey && (
              <button
                type="button"
                onClick={() => onOpenTrailer(currentMovie)}
                className="btn-gold"
              >
                <Play size={18} fill="#000" />
                <span>Watch Trailer</span>
              </button>
            )}

            <Link to={`/movie/${currentMovie.id}`} className="btn-secondary">
              <Info size={18} />
              <span>More Info</span>
            </Link>

            <button
              type="button"
              onClick={() => toggleWatchlist(currentMovie)}
              className="btn-secondary"
              style={{
                borderColor: inWatchlist ? 'var(--accent-gold)' : 'var(--border-subtle)',
                color: inWatchlist ? 'var(--accent-gold)' : 'var(--text-primary)'
              }}
            >
              <Bookmark size={18} fill={inWatchlist ? 'var(--accent-gold)' : 'none'} />
              <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots / Controls */}
      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        right: '2rem',
        zIndex: 4,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <button
          onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1))}
          className="btn-icon"
          aria-label="Previous Slide"
          style={{ width: '36px', height: '36px' }}
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {featuredMovies.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: i === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: i === currentIndex ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.25)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredMovies.length)}
          className="btn-icon"
          aria-label="Next Slide"
          style={{ width: '36px', height: '36px' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
