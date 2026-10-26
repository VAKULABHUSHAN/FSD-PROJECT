import { Link } from 'react-router-dom';
import { Clapperboard, Film, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#07070A',
      borderTop: '1px solid var(--border-subtle)',
      padding: '4rem 0 2rem',
      marginTop: '5rem',
      color: 'var(--text-secondary)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Col 1: Brand */}
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                background: 'var(--accent-gold)',
                color: '#000000',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Clapperboard size={18} strokeWidth={2.5} />
                <span style={{ fontSize: '0.95rem', fontFamily: 'var(--font-heading)' }}>CINE</span>
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#FFFFFF'
              }}>
                VERSE
              </span>
            </Link>

            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              The definitive movie and TV show discovery platform. Find trending blockbusters, curate your watchlist, explore ratings, and stream trailers seamlessly.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem', letterSpacing: '0.02em' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target.style.color = '#F5C518')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Featured Spotlight
                </Link>
              </li>
              <li>
                <Link to="/movies" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target.style.color = '#F5C518')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Popular Movies
                </Link>
              </li>
              <li>
                <Link to="/tv" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target.style.color = '#F5C518')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  TV Series & Shows
                </Link>
              </li>
              <li>
                <Link to="/top-rated" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target.style.color = '#F5C518')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Top 250 Ranked
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Features */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem', letterSpacing: '0.02em' }}>
              Features
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/watchlist" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target.style.color = '#F5C518')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Personal Watchlist
                </Link>
              </li>
              <li>
                <Link to="/search" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target.style.color = '#F5C518')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Advanced Search
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target.style.color = '#F5C518')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  User Ratings & Reviews
                </Link>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>Supabase Sync Enabled</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Data & Attribution */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem', letterSpacing: '0.02em' }}>
              Data & Tech
            </h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Powered by TMDB API and Supabase Auth & Database. Designed with React and modern CSS.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: 'var(--accent-gold)'
            }}>
              <Film size={13} />
              <span>CINEVERSE Engine v1.0</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} CINEVERSE. Inspired by IMDb & Letterboxd. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built for movie lovers worldwide with <Heart size={14} fill="#EF4444" color="#EF4444" />
          </div>
        </div>
      </div>
    </footer>
  );
}
