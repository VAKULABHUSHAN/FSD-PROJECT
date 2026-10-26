import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import { Bookmark, Film, Trash2, Cloud, HardDrive, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist, loading } = useWatchlist();
  const { user, isConfigured } = useAuth();
  const [filterType, setFilterType] = useState('all');
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);

  const filteredItems = watchlist.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <div className="gold-bar" style={{ height: '28px' }} />
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em'
            }}>
              Your Watchlist
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Movies and TV shows you want to watch. Curated by you.
          </p>
        </div>

        {/* Sync Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.6rem 1rem',
          fontSize: '0.85rem'
        }}>
          {user ? (
            <>
              <Cloud size={18} color="var(--accent-gold)" />
              <div>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Supabase Cloud Synced</span>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Account: {user.email}</div>
              </div>
            </>
          ) : (
            <>
              <HardDrive size={18} color="var(--text-muted)" />
              <div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Local Guest Session</span>
                <div style={{ fontSize: '0.75rem' }}>
                  <Link to="/login" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>
                    Sign in to sync to cloud
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {[
            { id: 'all', label: `All Titles (${watchlist.length})` },
            { id: 'movie', label: `Movies (${watchlist.filter(m => m.type === 'movie').length})` },
            { id: 'tv', label: `TV Shows (${watchlist.filter(m => m.type === 'tv').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: filterType === tab.id ? '#000000' : 'var(--text-secondary)',
                backgroundColor: filterType === tab.id ? 'var(--accent-gold)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Showing <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{filteredItems.length}</span> saved titles
        </div>
      </div>

      {/* Watchlist Grid or Empty State */}
      {filteredItems.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredItems.map((movie) => (
            <div key={movie.id} style={{ position: 'relative' }}>
              <MovieCard
                movie={movie}
                onOpenTrailer={(m) => setSelectedTrailerMovie(m)}
              />
              {/* Quick Remove Button underneath card */}
              <button
                type="button"
                onClick={() => removeFromWatchlist(movie.id)}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '4.5rem 2rem',
          textAlign: 'center',
          maxWidth: '520px',
          margin: '3rem auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(245, 197, 24, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: 'var(--accent-gold)'
          }}>
            <Bookmark size={32} />
          </div>

          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '0.6rem'
          }}>
            Your Watchlist is Empty
          </h3>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Explore trending movies and television series on CINEVERSE and click the bookmark ribbon to save them to your list.
          </p>

          <Link to="/" className="btn-gold" style={{ padding: '0.75rem 1.75rem' }}>
            <span>Explore Movies</span>
            <ArrowRight size={16} />
          </Link>
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
