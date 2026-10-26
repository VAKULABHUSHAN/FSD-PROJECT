import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { formatPosterUrl } from '../lib/tmdb';

const WatchlistContext = createContext(null);
const LOCAL_STORAGE_KEY = 'cineverse_guest_watchlist';

export const WatchlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage or Supabase
  const loadWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      if (user && isSupabaseConfigured) {
        // Fetch from Supabase for this authenticated user only
        const { data, error } = await supabase
          .from('watchlist')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map(item => ({
            id: item.movie_id,
            title: item.movie_title || 'Saved Title',
            poster: formatPosterUrl(item.poster_path, item.movie_title, item.movie_id),
            rating: 8.5,
            year: 2024,
            genres: ['Cinema'],
            type: 'movie'
          }));
          setWatchlist(formatted);
          setLoading(false);
          return;
        }
      }

      // Guest mode or Supabase fallback -> localStorage
      const guestKey = user ? `cineverse_user_${user.id}_watchlist` : LOCAL_STORAGE_KEY;
      const stored = localStorage.getItem(guestKey);
      if (stored) {
        try {
          setWatchlist(JSON.parse(stored));
        } catch {
          setWatchlist([]);
        }
      } else {
        setWatchlist([]);
      }
    } catch (e) {
      console.warn('Watchlist load error:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  // Sync guest watchlist when user logs in
  useEffect(() => {
    const syncGuestWatchlist = async () => {
      if (user && isSupabaseConfigured) {
        const guestItems = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (guestItems) {
          try {
            const items = JSON.parse(guestItems);
            if (Array.isArray(items) && items.length > 0) {
              const records = items.map(m => ({
                user_id: user.id,
                movie_id: m.id,
                movie_title: m.title,
                poster_path: m.poster || null,
                created_at: new Date().toISOString()
              }));
              await supabase.from('watchlist').upsert(records, { onConflict: 'user_id,movie_id' });
              // Clear guest items after successful migration
              localStorage.removeItem(LOCAL_STORAGE_KEY);
              // Refresh watchlist
              loadWatchlist();
            }
          } catch (e) {
            console.warn('Sync watchlist error:', e);
          }
        }
      }
    };

    syncGuestWatchlist();
  }, [user, loadWatchlist]);

  const isInWatchlist = useCallback((movieId) => {
    return watchlist.some(m => m.id === movieId);
  }, [watchlist]);

  const addToWatchlist = async (movie) => {
    if (!movie || isInWatchlist(movie.id)) return;

    const updated = [movie, ...watchlist];
    setWatchlist(updated);

    // Save locally
    const storageKey = user ? `cineverse_user_${user.id}_watchlist` : LOCAL_STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Save to Supabase for authenticated user with unique constraint handling
    if (user && isSupabaseConfigured) {
      try {
        await supabase.from('watchlist').upsert({
          user_id: user.id,
          movie_id: movie.id,
          movie_title: movie.title,
          poster_path: movie.poster || null,
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id,movie_id' });
      } catch (err) {
        console.error('Supabase watchlist upsert error:', err);
      }
    }
  };

  const removeFromWatchlist = async (movieId) => {
    const updated = watchlist.filter(m => m.id !== movieId);
    setWatchlist(updated);

    const storageKey = user ? `cineverse_user_${user.id}_watchlist` : LOCAL_STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(updated));

    if (user && isSupabaseConfigured) {
      try {
        await supabase
          .from('watchlist')
          .delete()
          .match({ user_id: user.id, movie_id: movieId });
      } catch (err) {
        console.error('Supabase watchlist delete error:', err);
      }
    }
  };

  const toggleWatchlist = async (movie) => {
    if (isInWatchlist(movie.id)) {
      await removeFromWatchlist(movie.id);
      return false;
    } else {
      await addToWatchlist(movie);
      return true;
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        loading,
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        refreshWatchlist: loadWatchlist
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
