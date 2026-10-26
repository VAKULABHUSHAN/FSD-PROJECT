import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchTitles, SUPABASE_GENRES } from '../lib/tmdb';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import TrailerModal from '../components/TrailerModal';
import { Search as SearchIcon, Filter, Film, ArrowUpDown, X, AlertCircle, RefreshCw } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const genreParam = searchParams.get('genre') || 'All';
  const categoryParam = searchParams.get('category') || 'all';

  const [query, setQuery] = useState(queryParam);
  const [selectedGenre, setSelectedGenre] = useState(genreParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam); // all, indian, hollywood
  const [sortBy, setSortBy] = useState('popular');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);

  // Sync state with URL params
  useEffect(() => {
    setQuery(queryParam);
    setSelectedGenre(genreParam);
    setSelectedCategory(categoryParam);
  }, [queryParam, genreParam, categoryParam]);

  // Execute search whenever filters change
  const performSearch = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const list = await searchTitles(query, selectedGenre, sortBy, selectedCategory);
      setResults(list);
    } catch (err) {
      console.error('[Search Supabase Error]:', err);
      setDbError(err.message || 'Database search failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [query, selectedGenre, selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedGenre !== 'All') params.set('genre', selectedGenre);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    setSearchParams(params);
  };

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    const params = new URLSearchParams(searchParams);
    if (genre === 'All') {
      params.delete('genre');
    } else {
      params.set('genre', genre);
    }
    setSearchParams(params);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams(searchParams);
    if (cat === 'all') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setQuery('');
    setSelectedGenre('All');
    setSelectedCategory('all');
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2rem',
          fontWeight: 800,
          color: '#FFFFFF',
          marginBottom: '0.5rem'
        }}>
          Search & Discover
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Search across all 70 films in the Supabase database including Indian & Hollywood masterpieces.
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
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={22} color="#EF4444" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#FFFFFF', display: 'block', fontSize: '0.95rem' }}>
                Supabase Search Alert
              </strong>
              <span style={{ fontSize: '0.85rem' }}>{dbError}</span>
            </div>
          </div>
          <button
            onClick={performSearch}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', gap: '4px' }}
          >
            <RefreshCw size={14} /> Retry Search
          </button>
        </div>
      )}

      {/* Main Search Input */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.75rem' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          maxWidth: '720px'
        }}>
          <SearchIcon
            size={20}
            style={{ position: 'absolute', left: '16px', color: 'var(--accent-gold)' }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles (e.g. Vikram, Dune, Shawshank, Dangal, RRR, Batman)..."
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 3rem 0.85rem 3rem',
              fontSize: '1rem',
              color: '#FFFFFF',
              outline: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                const params = new URLSearchParams(searchParams);
                params.delete('q');
                setSearchParams(params);
              }}
              style={{
                position: 'absolute',
                right: '16px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      {/* Filter Controls Row */}
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
        {/* Category toggle: All, Indian Cinema, Hollywood */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {[
            { id: 'all', label: 'All Cinema' },
            { id: 'indian', label: 'Indian Cinema' },
            { id: 'hollywood', label: 'Hollywood' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleCategoryClick(t.id)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: selectedCategory === t.id ? '#000000' : 'var(--text-secondary)',
                backgroundColor: selectedCategory === t.id ? 'var(--accent-gold)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-card)',
              color: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest Release</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Genre Filter Chips */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '1rem',
        marginBottom: '2rem'
      }}>
        {SUPABASE_GENRES.map((genre) => {
          const isActive = selectedGenre.toLowerCase() === genre.toLowerCase();
          return (
            <button
              key={genre}
              type="button"
              onClick={() => handleGenreClick(genre)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                color: isActive ? '#000000' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--accent-gold)' : 'var(--bg-card)',
                border: `1px solid ${isActive ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                transition: 'all 0.2s'
              }}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Results Meta Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        <div>
          Showing <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{results.length}</span> Supabase movies
          {query && <span> for "<span style={{ color: 'var(--accent-gold)' }}>{query}</span>"</span>}
          {selectedGenre !== 'All' && <span> in <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{selectedGenre}</span></span>}
          {selectedCategory !== 'all' && <span> ({selectedCategory === 'indian' ? 'Indian Cinema' : 'Hollywood'})</span>}
        </div>

        {(query || selectedGenre !== 'All' || selectedCategory !== 'all') && (
          <button
            type="button"
            onClick={clearAllFilters}
            style={{
              color: 'var(--accent-gold)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'underline'
            }}
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results Content / Loading / Empty State */}
      {loading ? (
        <LoadingSpinner text="Searching Supabase public.movies..." />
      ) : results.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1.25rem'
        }}>
          {results.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onOpenTrailer={(m) => setSelectedTrailerMovie(m)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '4rem 2rem',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '2rem auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(245, 197, 24, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: 'var(--accent-gold)'
          }}>
            <Film size={32} />
          </div>

          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '0.5rem'
          }}>
            No matching titles found in Supabase
          </h3>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            We couldn't find anything matching your search in the database. Try searching for "Vikram", "Baahubali", "Shawshank", "Dune", or clear genre filters.
          </p>

          <button
            type="button"
            onClick={clearAllFilters}
            className="btn-gold"
          >
            Reset All Filters
          </button>
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
