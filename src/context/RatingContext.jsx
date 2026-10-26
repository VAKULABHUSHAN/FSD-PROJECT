import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

const RatingContext = createContext(null);
const LOCAL_RATINGS_KEY = 'cineverse_user_ratings';

export const RatingProvider = ({ children }) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);

  // Load user ratings from Supabase or localStorage
  const loadRatings = useCallback(async () => {
    try {
      if (user && isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('ratings')
          .select('movie_id, rating')
          .eq('user_id', user.id);

        if (!error && data) {
          const map = {};
          data.forEach(r => {
            map[r.movie_id] = r.rating;
          });
          setRatings(map);
          return;
        }
      }

      // Guest / local fallback
      const stored = localStorage.getItem(LOCAL_RATINGS_KEY);
      if (stored) {
        setRatings(JSON.parse(stored));
      } else {
        setRatings({});
      }
    } catch (e) {
      console.warn('Ratings load error:', e);
    }
  }, [user]);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  const getUserRating = (movieId) => {
    return ratings[movieId] || null;
  };

  const rateMovie = async (movieId, score) => {
    // Validate score is an integer between 1 and 10
    const validScore = Math.max(1, Math.min(10, Math.round(Number(score))));
    if (isNaN(validScore)) {
      return { success: false, error: 'Rating must be a number between 1 and 10.' };
    }

    const updated = { ...ratings, [movieId]: validScore };
    setRatings(updated);
    localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(updated));

    if (user && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('ratings').upsert(
          {
            user_id: user.id,
            movie_id: movieId,
            rating: validScore,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,movie_id' }
        );

        if (error) {
          console.error('Supabase rating upsert error:', error);
          return { success: false, error: error.message };
        }
      } catch (err) {
        console.error('Supabase rating upsert error:', err);
        return { success: false, error: err.message };
      }
    }

    return {
      success: true,
      requiresAuth: !user
    };
  };

  return (
    <RatingContext.Provider
      value={{
        ratings,
        loading,
        getUserRating,
        rateMovie,
        refreshRatings: loadRatings
      }}
    >
      {children}
    </RatingContext.Provider>
  );
};

export const useRating = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
};
