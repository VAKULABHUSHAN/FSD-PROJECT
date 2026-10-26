import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMovieById, searchTitles } from '../lib/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import { useRating } from '../context/RatingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TrailerModal from '../components/TrailerModal';
import RatingModal from '../components/RatingModal';
import MovieCard from '../components/MovieCard';
import { Star, Bookmark, Play, Share2, Film, Clock, Calendar, Check, ArrowLeft, User, AlertCircle } from 'lucide-react';

export default function MovieDetails() {
  const { id } = useParams();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { getUserRating } = useRating();

  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inWatchlist = movie ? isInWatchlist(movie.id) : false;
  const userRating = movie ? getUserRating(movie.id) : null;

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      setErrorMsg(null);
      window.scrollTo(0, 0);
      try {
        const data = await fetchMovieById(id);
        setMovie(data);

        if (data) {
          // Find similar movies from Supabase database matching the primary genre
          const mainGenre = data.genres?.[0] || 'All';
          const candidates = await searchTitles('', mainGenre);
          const filtered = candidates.filter(m => m.id !== data.id).slice(0, 6);
          setSimilarMovies(filtered);
        }
      } catch (err) {
        console.error('[MovieDetails Supabase Load Error]:', err);
        setErrorMsg(err.message || 'Failed to fetch title details from Supabase public.movies.');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading cinematic details..." />;
  }

  if (!movie) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Title Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          We could not find the movie or TV show you were looking for.
        </p>
        <Link to="/" className="btn-gold">
          Return to Cineverse
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Backdrop Header Banner */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '440px',
        maxHeight: '560px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end'
      }}>
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 25%',
            filter: 'brightness(0.55)'
          }}
        />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, #0B0B0F 0%, rgba(11, 11, 15, 0.7) 50%, rgba(11, 11, 15, 0.3) 100%), linear-gradient(to right, #0B0B0F 0%, rgba(11, 11, 15, 0.4) 100%)'
        }} />

        {/* Back Button */}
        <div className="container" style={{
          position: 'absolute',
          top: '1.5rem',
          left: 0,
          right: 0,
          zIndex: 4
        }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(15, 15, 22, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(245, 197, 24, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(15, 15, 22, 0.75)')}
          >
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </div>

        {/* Quick Title on Backdrop for mobile */}
        <div className="container" style={{ position: 'relative', zIndex: 3, paddingBottom: '1.5rem' }}>
          {movie.tagline && (
            <p style={{
              color: 'var(--accent-gold)',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '0.4rem'
            }}>
              "{movie.tagline}"
            </p>
          )}
        </div>
      </div>

      {/* Main Details Section */}
      <div className="container" style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '2.5rem',
          alignItems: 'start'
        }}
        className="details-layout"
        >
          {/* Left Column: Poster & Quick Action Buttons */}
          <div style={{ width: '280px', flexShrink: 0 }} className="poster-col">
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'var(--bg-card)',
              aspectRatio: '2 / 3',
              position: 'relative'
            }}>
              <img
                src={movie.poster}
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500';
                }}
              />

              {movie.certification && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.85)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  {movie.certification}
                </div>
              )}
            </div>

            {/* Poster Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => toggleWatchlist(movie)}
                className="btn-gold"
                style={{
                  width: '100%',
                  backgroundColor: inWatchlist ? '#2A2A3A' : 'var(--accent-gold)',
                  color: inWatchlist ? '#FFFFFF' : '#000000',
                  border: inWatchlist ? '1px solid var(--accent-gold)' : 'none'
                }}
              >
                <Bookmark size={18} fill={inWatchlist ? 'var(--accent-gold)' : 'none'} color={inWatchlist ? 'var(--accent-gold)' : '#000000'} />
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRatingModal(true)}
                className="btn-secondary"
                style={{
                  width: '100%',
                  borderColor: userRating ? 'var(--accent-gold)' : 'var(--border-subtle)',
                  color: userRating ? 'var(--accent-gold)' : '#FFFFFF'
                }}
              >
                <Star size={18} fill={userRating ? 'var(--accent-gold)' : 'none'} />
                <span>{userRating ? `Your Rating: ${userRating}/10` : 'Rate This Title'}</span>
              </button>

              {movie.trailerKey && (
                <button
                  type="button"
                  onClick={() => setShowTrailerModal(true)}
                  className="btn-secondary"
                  style={{ width: '100%' }}
                >
                  <Play size={18} />
                  <span>Play Trailer</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                {copiedLink ? <Check size={16} color="#10B981" /> : <Share2 size={16} />}
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Overview, Cast */}
          <div>
            {/* Title & Ratings Header */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '1.5rem',
              flexWrap: 'wrap',
              marginBottom: '1rem'
            }}>
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  marginBottom: '0.6rem'
                }}>
                  {movie.title}
                </h1>

                {/* Subtitle meta */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  flexWrap: 'wrap'
                }}>
                  <span>{movie.year}</span>
                  <span>•</span>
                  <span style={{ textTransform: 'capitalize' }}>
                    {movie.type === 'tv' ? 'TV Series' : 'Movie'}
                  </span>
                  {movie.runtime && (
                    <>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={15} /> {movie.runtime}
                      </span>
                    </>
                  )}
                  {movie.releaseDate && (
                    <>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={15} /> {movie.releaseDate}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Score Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* IMDb Rating */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 1rem',
                  textAlign: 'center',
                  minWidth: '100px'
                }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    IMDb RATING
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '2px' }}>
                    <Star size={20} fill="var(--accent-gold)" color="var(--accent-gold)" />
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {movie.rating ? movie.rating.toFixed(1) : '8.0'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/10</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {movie.voteCount || '200K'} votes
                  </span>
                </div>

                {/* User's Rating */}
                <button
                  type="button"
                  onClick={() => setShowRatingModal(true)}
                  style={{
                    background: userRating ? 'rgba(245, 197, 24, 0.12)' : 'var(--bg-card)',
                    border: userRating ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.6rem 1rem',
                    textAlign: 'center',
                    minWidth: '100px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold)')}
                  onMouseLeave={(e) => {
                    if (!userRating) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: userRating ? 'var(--accent-gold)' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    YOUR RATING
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '2px' }}>
                    <Star size={20} fill={userRating ? 'var(--accent-gold)' : 'none'} color={userRating ? 'var(--accent-gold)' : '#6B7280'} />
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: userRating ? 'var(--accent-gold)' : '#FFFFFF' }}>
                      {userRating ? `${userRating}/10` : 'Rate'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {userRating ? 'Click to edit' : 'Tap to rate'}
                  </span>
                </button>
              </div>
            </div>

            {/* Genres */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
              {movie.genres?.map((genre, i) => (
                <Link
                  key={i}
                  to={`/search?genre=${genre}`}
                  style={{
                    background: 'var(--bg-surface)',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                    e.currentTarget.style.color = 'var(--accent-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                >
                  {genre}
                </Link>
              ))}
            </div>

            {/* Overview Section */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '0.75rem'
              }}>
                Synopsis
              </h3>
              <p style={{
                fontSize: '1.05rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                maxWidth: '850px'
              }}>
                {movie.overview}
              </p>
            </div>

            {/* Production / Credits info */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              {movie.director && (
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600, minWidth: '85px' }}>Director</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{movie.director}</span>
                </div>
              )}
              {movie.writers && movie.writers.length > 0 && (
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600, minWidth: '85px' }}>Writers</span>
                  <span style={{ color: '#E5E7EB' }}>{movie.writers.join(', ')}</span>
                </div>
              )}
              {movie.stars && movie.stars.length > 0 && (
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600, minWidth: '85px' }}>Stars</span>
                  <span style={{ color: '#E5E7EB' }}>{movie.stars.join(' • ')}</span>
                </div>
              )}
            </div>

            {/* Cast Section */}
            {movie.cast && movie.cast.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <div className="section-header">
                  <div className="section-title-wrap">
                    <div className="gold-bar" />
                    <h3 className="section-title">Top Billed Cast</h3>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '1rem'
                }}>
                  {movie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: '1px solid var(--border-subtle)',
                        textAlign: 'center',
                        paddingBottom: '0.65rem'
                      }}
                    >
                      <div style={{
                        width: '100%',
                        aspectRatio: '1 / 1.1',
                        backgroundColor: '#1E1E2A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {actor.avatar ? (
                          <img
                            src={actor.avatar}
                            alt={actor.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <User size={32} color="#6B7280" />
                        )}
                      </div>
                      <div style={{ padding: '0.5rem 0.5rem 0' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                          {actor.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {actor.character}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Embedded Trailer Section if available */}
            {movie.trailerKey && (
              <div style={{ marginBottom: '3.5rem' }}>
                <div className="section-header">
                  <div className="section-title-wrap">
                    <div className="gold-bar" />
                    <h3 className="section-title">Official Video & Trailer</h3>
                  </div>
                </div>

                <div style={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: '56.25%',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                  backgroundColor: '#000000'
                }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${movie.trailerKey}?rel=0`}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 0
                    }}
                  />
                </div>
              </div>
            )}

            {/* Similar / More Like This */}
            {similarMovies && similarMovies.length > 0 && (
              <div>
                <div className="section-header">
                  <div className="section-title-wrap">
                    <div className="gold-bar" />
                    <h3 className="section-title">More Like This</h3>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '1.25rem'
                }}>
                  {similarMovies.slice(0, 4).map((m) => (
                    <MovieCard
                      key={m.id}
                      movie={m}
                      onOpenTrailer={() => {
                        setMovie(m);
                        setShowTrailerModal(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && (
        <TrailerModal
          movie={movie}
          onClose={() => setShowTrailerModal(false)}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          movie={movie}
          onClose={() => setShowRatingModal(false)}
        />
      )}

      <style>{`
        @media (max-width: 860px) {
          .details-layout {
            grid-template-columns: 1fr !important;
          }
          .poster-col {
            width: 100% !important;
            max-width: 280px;
            margin: 0 auto 2rem;
          }
        }
      `}</style>
    </div>
  );
}
