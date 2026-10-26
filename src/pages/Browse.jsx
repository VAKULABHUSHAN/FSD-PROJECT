import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchPopular, fetchTopRated, fetchAllSupabaseMovies, fetchIndianCinema, SUPABASE_GENRES } from '../lib/tmdb';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import TrailerModal from '../components/TrailerModal';
import { Film, Tv, Award, ArrowUpDown, AlertCircle, RefreshCw } from 'lucide-react';

export default function Browse() {
  const location = useLocation();
  const path = location.pathname;

  let pageType = 'movies';
  let title = 'All Supabase Movies';
  let subtitle = 'Explore all 70 films from the Supabase public.movies database';

  if (path.includes('/tv')) {
    pageType = 'tv';
    title = 'TV Series & Regional Cinema';
    subtitle = 'Discover television and regional cinema collections from the database';
  } else if (path.includes('/top-rated')) {
    pageType = 'top-rated';
    title = 'Top Rated of All Time';
    subtitle = 'The highest rated films in the Supabase database sorted by vote average';
  }

  const [items, setItems] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('all'); // all, indian, hollywood
  const [sortBy, setSortBy] = useState(pageType === 'top-rated' ? 'rating' : 'popular');
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);

  const loadContent = async () => {
    setLoading(true);
    setDbError(null);
    window.scrollTo(0, 0);
    try {
      let data = [];
      if (pageType === 'top-rated') {
        data = await fetchTopRated('all');
      } else {
        data = await fetchAllSupabaseMovies();
      }
      setItems(data);
    } catch (e) {
      console.error('[Browse Page Load Error]:', e);
      setDbError(e.message || 'Failed to load movies from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [path, pageType]);

  // Filter by category (Indian / Hollywood) and Genre
  let displayed = items.filter(m => {
    if (selectedCategory === 'indian' && !m.isIndian) return false;
    if (selectedCategory === 'hollywood' && m.isIndian) return false;
    if (selectedGenre === 'All') return true;
    return m.genres?.some(g => g.toLowerCase() === selectedGenre.toLowerCase());
  });

  if (sortBy === 'rating') {
    displayed.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'newest') {
    displayed.sort((a, b) => b.year - a.year);
  } else if (sortBy === 'title') {
    displayed.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    displayed.sort((a, b) => (b.rating * (b.year >= 2018 ? 1.05 : 1)) - (a.rating * (a.year >= 2018 ? 1.05 : 1)));
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
          <div className="gold-bar" style={{ height: '30px' }} />
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.2rem',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.02em'
          }}>
            {title}
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {subtitle}
        </p>
      </div>

      {/* Database Error Banner */}
      {dbError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          color: '#FCA5A5',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={22} color="#EF4444" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#FFFFFF', display: 'block', fontSize: '0.95rem' }}>
                Supabase Query Alert
              </strong>
              <span style={{ fontSize: '0.85rem' }}>{dbError}</span>
            </div>
          </div>
          <button
            onClick={loadContent}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', gap: '4px' }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {/* Category Filter Pills: All, Indian Cinema, Hollywood */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {[
            { id: 'all', label: `All Cinema (${items.length})` },
            { id: 'indian', label: `Indian (${items.filter(m => m.isIndian).length})` },
            { id: 'hollywood', label: `Hollywood (${items.filter(m => !m.isIndian).length})` }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: selectedCategory === cat.id ? '#000000' : 'var(--text-secondary)',
                backgroundColor: selectedCategory === cat.id ? 'var(--accent-gold)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-card)',
              color: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="popular">Popularity</option>
            <option value="rating">Rating</option>
            <option value="newest">Release Year</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        overflowX: 'auto',
        maxWidth: '100%',
        paddingBottom: '1rem',
        marginBottom: '1.5rem'
      }}>
        {SUPABASE_GENRES.map(genre => (
          <button
            key={genre}
            type="button"
            onClick={() => setSelectedGenre(genre)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              color: selectedGenre === genre ? '#000000' : 'var(--text-secondary)',
              backgroundColor: selectedGenre === genre ? 'var(--accent-gold)' : 'var(--bg-card)',
              border: `1px solid ${selectedGenre === genre ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
              transition: 'all 0.2s'
            }}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Results Info */}
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Showing <strong style={{ color: '#FFFFFF' }}>{displayed.length}</strong> movies from Supabase public.movies
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner text={`Loading Supabase ${title}...`} />
      ) : displayed.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '1.5rem'
        }}>
          {displayed.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onOpenTrailer={(m) => setSelectedTrailerMovie(m)}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          No titles found matching this filter criteria.
        </div>
      )}

      {/* Trailer Modal */}
      {selectedTrailerMovie && (
        <TrailerModal
          movie={selectedTrailerMovie}
          onClose={() => setSelectedTrailerMovie(null)}
        />
      )}
    </div>
  );
}
