import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import MovieCarousel from '../components/MovieCarousel';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchTrending, fetchTopRated, fetchPopular, fetchUpcoming, fetchIndianCinema, fetchHollywood } from '../lib/tmdb';
import { Star, Flame, Award, Calendar, Film, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [indianCinema, setIndianCinema] = useState([]);
  const [hollywood, setHollywood] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);

  // Top rated filter tab: all, indian, hollywood
  const [topRatedTab, setTopRatedTab] = useState('all');

  const loadAllContent = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const [trendData, topData, indianData, hollywoodData, upData] = await Promise.all([
        fetchTrending(),
        fetchTopRated('all'),
        fetchIndianCinema(),
        fetchHollywood(),
        fetchUpcoming()
      ]);

      setTrending(trendData);
      setTopRated(topData);
      setIndianCinema(indianData);
      setHollywood(hollywoodData);
      setUpcoming(upData);
    } catch (err) {
      console.error('[Home Page Supabase Load Error]:', err);
      setDbError(err.message || 'Failed to fetch movies from Supabase public.movies table.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllContent();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading Supabase Cineverse catalog..." />;
  }

  // Filter top rated based on selected category tab
  const filteredTopRated = topRatedTab === 'all'
    ? topRated.slice(0, 10)
    : topRatedTab === 'indian'
      ? topRated.filter(m => m.isIndian).slice(0, 10)
      : topRated.filter(m => !m.isIndian).slice(0, 10);

  // Top 5 trending for Hero spotlight
  const featuredList = trending.slice(0, 5);

  return (
    <div className="animate-fade-in">
      {/* Database Error Banner if Supabase connection fails */}
      {dbError && (
        <div className="container" style={{ paddingTop: '1.5rem' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            color: '#FCA5A5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={22} color="#EF4444" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#FFFFFF', display: 'block', fontSize: '0.95rem' }}>
                  Supabase Database Alert
                </strong>
                <span style={{ fontSize: '0.85rem' }}>{dbError}</span>
              </div>
            </div>
            <button
              onClick={loadAllContent}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', gap: '4px' }}
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* A. HERO SECTION - Live Supabase Spotlight */}
      <HeroSection
        featuredMovies={featuredList}
        onOpenTrailer={(m) => setSelectedTrailerMovie(m)}
      />

      <div className="container">
        {/* Database Status Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(245, 197, 24, 0.08)',
          border: '1px solid rgba(245, 197, 24, 0.25)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 14px',
          fontSize: '0.8rem',
          color: 'var(--accent-gold)',
          fontWeight: 600,
          marginBottom: '2rem'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
          <span>Connected to Supabase public.movies • {topRated.length} Titles Loaded</span>
        </div>

        {/* B. TRENDING NOW */}
        <MovieCarousel
          title="Trending Now"
          subtitle="Top rated blockbusters and sensations from our database"
          movies={trending}
          seeAllLink="/movies"
          onOpenTrailer={(m) => setSelectedTrailerMovie(m)}
        />

        {/* C. TOP RATED MOVIES (Responsive Grid with Tabs) */}
        <div style={{ marginBottom: '4rem' }}>
          <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div className="section-title-wrap">
              <div className="gold-bar" />
              <div>
                <h2 className="section-title">Top Rated of All Time</h2>
                <p className="section-subtitle">IMDb community highest rated masterpieces from Supabase</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-card)',
              padding: '4px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)'
            }}>
              {[
                { id: 'all', label: `All Titles (${topRated.length})` },
                { id: 'indian', label: `Indian Cinema (${indianCinema.length})` },
                { id: 'hollywood', label: `Hollywood (${hollywood.length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTopRatedTab(tab.id)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: topRatedTab === tab.id ? '#000000' : 'var(--text-secondary)',
                    backgroundColor: topRatedTab === tab.id ? 'var(--accent-gold)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
            gap: '1.25rem'
          }}>
            {filteredTopRated.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onOpenTrailer={(m) => setSelectedTrailerMovie(m)}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link
              to="/top-rated"
              className="btn-secondary"
              style={{ padding: '0.75rem 2rem' }}
            >
              Explore All {topRated.length} Titles in Top Ranked →
            </Link>
          </div>
        </div>

        {/* D. INDIAN CINEMA SPOTLIGHT (Tamil, Telugu, Hindi, Malayalam) */}
        <MovieCarousel
          title="Indian & Regional Cinema"
          subtitle="Celebrated Tamil, Telugu, Hindi, and Malayalam cinema from the database"
          movies={indianCinema}
          seeAllLink="/movies"
          onOpenTrailer={(m) => setSelectedTrailerMovie(m)}
        />

        {/* E. HOLLYWOOD & GLOBAL BLOCKBUSTERS */}
        <MovieCarousel
          title="Hollywood & International Hits"
          subtitle="Box office sensations and timeless Oscar-winning masterworks"
          movies={hollywood}
          seeAllLink="/movies"
          onOpenTrailer={(m) => setSelectedTrailerMovie(m)}
        />

        {/* F. RECENT RELEASES (2021-2024) */}
        <MovieCarousel
          title="Recent Releases (2021 - 2024)"
          subtitle="Modern blockbusters in the Supabase catalog"
          movies={upcoming}
          seeAllLink="/movies"
          onOpenTrailer={(m) => setSelectedTrailerMovie(m)}
        />
      </div>

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
