import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bookmark, User, LogOut, Menu, X, Film, Star, ChevronDown, Clapperboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { searchTitles } from '../lib/tmdb';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchBoxRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setShowDropdown(false);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Live search suggestion debouncer
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchTitles(searchQuery);
        setSuggestions(results.slice(0, 5));
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinkStyle = ({ isActive }) => ({
    fontSize: '0.95rem',
    fontWeight: 600,
    color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
    transition: 'color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    position: 'relative',
    padding: '0.4rem 0'
  });

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(11, 11, 15, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        gap: '1.5rem'
      }}>
        {/* Left: Brand Logo & Main Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'var(--accent-gold)',
              color: '#000000',
              padding: '0.3rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 0 14px rgba(245, 197, 24, 0.4)'
            }}>
              <Clapperboard size={18} strokeWidth={2.5} />
              <span style={{ fontSize: '1rem', letterSpacing: '0.04em', fontFamily: 'var(--font-heading)' }}>CINE</span>
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#FFFFFF'
            }}>
              VERSE
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <NavLink to="/" style={navLinkStyle}>
              Home
            </NavLink>
            <NavLink to="/movies" style={navLinkStyle}>
              Movies
            </NavLink>
            <NavLink to="/tv" style={navLinkStyle}>
              TV Shows
            </NavLink>
            <NavLink to="/top-rated" style={navLinkStyle}>
              Top Rated
            </NavLink>
          </div>
        </div>

        {/* Center: Search Bar with Autocomplete Dropdown */}
        <div
          ref={searchBoxRef}
          style={{
            position: 'relative',
            flex: '1',
            maxWidth: '480px'
          }}
          className="search-box-wrap"
        >
          <form onSubmit={handleSearchSubmit}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                placeholder="Search movies, TV shows, actors..."
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.6rem 2.5rem 0.6rem 2.4rem',
                  fontSize: '0.875rem',
                  color: '#FFFFFF',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocusCapture={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-gold)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 197, 24, 0.15)';
                }}
                onBlurCapture={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowDropdown(false);
                  }}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>

          {/* Autocomplete Dropdown Preview */}
          {showDropdown && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              backgroundColor: '#17171F',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
              overflow: 'hidden',
              zIndex: 1010
            }}>
              <div style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-gold)',
                textTransform: 'uppercase',
                borderBottom: '1px solid var(--border-subtle)',
                letterSpacing: '0.05em'
              }}>
                Instant Matches
              </div>

              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/movie/${item.id}`}
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1F1F2B')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    style={{
                      width: '36px',
                      height: '52px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100';
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginTop: '2px'
                    }}>
                      <span>{item.year}</span>
                      <span>•</span>
                      <span style={{ textTransform: 'capitalize' }}>{item.type === 'tv' ? 'TV' : 'Movie'}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                        <Star size={11} fill="var(--accent-gold)" />
                        {item.rating?.toFixed(1) || '8.0'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              <div
                onClick={handleSearchSubmit}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--accent-gold)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(245, 197, 24, 0.05)',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(245, 197, 24, 0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(245, 197, 24, 0.05)')}
              >
                See all results for "{searchQuery}" →
              </div>
            </div>
          )}
        </div>

        {/* Right: Watchlist & Profile / Sign In */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Watchlist Button with Count */}
          <Link
            to="/watchlist"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-gold)';
              e.currentTarget.style.color = 'var(--accent-gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <Bookmark size={17} />
            <span className="watchlist-label">Watchlist</span>
            {watchlist.length > 0 && (
              <span style={{
                background: 'var(--accent-gold)',
                color: '#000000',
                fontSize: '0.7rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-full)',
                padding: '1px 6px',
                marginLeft: '2px'
              }}>
                {watchlist.length}
              </span>
            )}
          </Link>

          {/* User Profile / Sign In Button */}
          {user ? (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '4px 8px 4px 4px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                  alt="Avatar"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#252538' }}
                />
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {profile?.username || user.email?.split('@')[0]}
                </span>
                <ChevronDown size={14} color="var(--text-secondary)" />
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '210px',
                  backgroundColor: '#17171F',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8)',
                  overflow: 'hidden',
                  zIndex: 1010
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {profile?.username || 'Cineverse Member'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                  </div>

                  <Link
                    to="/watchlist"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.75rem 1rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1F1F2B')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Bookmark size={16} /> My Watchlist ({watchlist.length})
                  </Link>

                  <button
                    onClick={() => {
                      signOut();
                      setUserMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.75rem 1rem',
                      fontSize: '0.85rem',
                      color: '#EF4444',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1F1F2B')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <User size={16} />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            aria-label="Toggle navigation menu"
            style={{
              display: 'none',
              background: 'none',
              color: '#FFFFFF',
              border: 'none',
              padding: '6px'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#12121A',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
            Home
          </NavLink>
          <NavLink to="/movies" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
            Movies
          </NavLink>
          <NavLink to="/tv" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
            TV Shows
          </NavLink>
          <NavLink to="/top-rated" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
            Top Rated
          </NavLink>
          <NavLink to="/watchlist" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
            Watchlist ({watchlist.length})
          </NavLink>
          {!user && (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-gold"
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              Sign In / Sign Up
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-links {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
        @media (max-width: 600px) {
          .watchlist-label {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
