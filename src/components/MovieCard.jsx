import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Play, Film } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

export default function MovieCard({ movie, onOpenTrailer }) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const inWatchlist = isInWatchlist(movie?.id);

  if (!movie) return null;

  const handleWatchlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  const handleTrailerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenTrailer) {
      onOpenTrailer(movie);
    }
  };

  const fallbackPoster = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80`;
  const posterSrc = imageError || !movie.poster ? fallbackPoster : movie.poster;

  return (
    <div style={{
      position: 'relative',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}
    className="movie-card"
    >
      <Link to={`/movie/${movie.id}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Poster Wrapper */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2 / 3',
          overflow: 'hidden',
          backgroundColor: '#121218'
        }}>
          {/* Skeleton placeholder while loading */}
          {!imageLoaded && !imageError && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#1a1a24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3f3f50'
            }}>
              <Film size={32} />
            </div>
          )}

          <img
            src={posterSrc}
            alt={movie.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              opacity: imageLoaded ? 1 : 0
            }}
            className="movie-card-img"
          />

          {/* Dark gradient overlay on hover */}
          <div className="card-hover-overlay" style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(11,11,15,0.95) 0%, rgba(11,11,15,0.4) 50%, rgba(0,0,0,0.1) 100%)',
            opacity: 0,
            transition: 'opacity 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '1rem',
            gap: '0.5rem'
          }}>
            {movie.trailerKey && (
              <button
                type="button"
                onClick={handleTrailerClick}
                style={{
                  background: 'rgba(245, 197, 24, 0.9)',
                  color: '#000',
                  padding: '0.45rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}
              >
                <Play size={14} fill="#000" /> Watch Trailer
              </button>
            )}
          </div>

          {/* Watchlist Ribbon / Button in top-left (IMDb style) */}
          <button
            type="button"
            onClick={handleWatchlistClick}
            title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            aria-label={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '38px',
              height: '48px',
              background: inWatchlist ? 'var(--accent-gold)' : 'rgba(15, 15, 22, 0.8)',
              color: inWatchlist ? '#000000' : '#FFFFFF',
              clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '6px',
              cursor: 'pointer',
              zIndex: 3,
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(4px)',
              boxShadow: inWatchlist ? '0 2px 8px rgba(245, 197, 24, 0.4)' : '0 2px 6px rgba(0,0,0,0.5)'
            }}
          >
            <Bookmark
              size={18}
              fill={inWatchlist ? '#000000' : 'none'}
              strokeWidth={inWatchlist ? 2.5 : 2}
            />
          </button>

          {/* Rating Badge top-right */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(11, 11, 15, 0.85)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '3px 7px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#FFFFFF',
            zIndex: 2
          }}>
            <Star size={13} fill="var(--accent-gold)" color="var(--accent-gold)" />
            <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'}</span>
          </div>
        </div>

        {/* Content Info */}
        <div style={{
          padding: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.25rem'
            }}>
              <span>{movie.year || '2024'}</span>
              <span>•</span>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: movie.type === 'tv' ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                {movie.type === 'tv' ? 'TV Series' : 'Movie'}
              </span>
            </div>

            <h3 style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {movie.title}
            </h3>
          </div>

          {movie.genres && movie.genres.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.3rem'
            }}>
              {movie.genres.slice(0, 2).map((genre, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      <style>{`
        .movie-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.7);
          border-color: rgba(245, 197, 24, 0.4);
        }
        .movie-card:hover .movie-card-img {
          transform: scale(1.05);
        }
        .movie-card:hover .card-hover-overlay {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
