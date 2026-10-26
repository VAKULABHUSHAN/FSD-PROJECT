import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, fallbackUser = null) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data);
      } else {
        const u = fallbackUser || user;
        const fallbackProfile = {
          username: u?.user_metadata?.username || u?.email?.split('@')[0] || 'Movie Enthusiast',
          avatar_url: u?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u?.email || 'cineverse')}`
        };
        setProfile(fallbackProfile);
      }
    } catch (e) {
      console.warn('Profile fetch error:', e);
    }
  };

  useEffect(() => {
    // Check initial session
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session?.user && !error) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user);
            setLoading(false);
            return;
          }
        }

        // Check demo user in localStorage
        const stored = localStorage.getItem('cineverse_demo_user');
        if (stored) {
          try {
            const demoUser = JSON.parse(stored);
            setUser(demoUser);
            setProfile({
              username: demoUser.user_metadata?.username || 'Demo Critic',
              avatar_url: demoUser.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=cineverse_demo'
            });
          } catch (e) {
            localStorage.removeItem('cineverse_demo_user');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user);
        } else {
          // If no active Supabase session, check if demo user exists
          const stored = localStorage.getItem('cineverse_demo_user');
          if (!stored) {
            setUser(null);
            setProfile(null);
          }
        }
        setLoading(false);
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email, password) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(data.user);
      localStorage.removeItem('cineverse_demo_user');
      await fetchProfile(data.user.id, data.user);
      return data;
    } else {
      return signInDemo(email);
    }
  };

  const signInDemo = (customEmail) => {
    const email = customEmail || 'demo.critic@cineverse.io';
    const mockUser = {
      id: 'demo-user-101',
      email,
      user_metadata: {
        username: email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
      }
    };
    localStorage.setItem('cineverse_demo_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setProfile({
      username: mockUser.user_metadata.username,
      avatar_url: mockUser.user_metadata.avatar_url
    });
    return { user: mockUser };
  };

  const signUp = async (email, password, username) => {
    if (isSupabaseConfigured) {
      const avatar_url = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username || email)}`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
            avatar_url
          }
        }
      });
      if (error) throw error;

      if (data?.user) {
        setUser(data.user);
        // Try creating profile record
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: username || email.split('@')[0],
            avatar_url,
            created_at: new Date().toISOString()
          });
        } catch (pe) {
          console.warn('Profile create error (will use metadata):', pe);
        }
        await fetchProfile(data.user.id, data.user);
      }
      return data;
    } else {
      // Demo sign up
      const mockUser = {
        id: 'usr_' + Date.now(),
        email,
        user_metadata: {
          username: username || email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username || email)}`
        }
      };
      localStorage.setItem('cineverse_demo_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setProfile({
        username: mockUser.user_metadata.username,
        avatar_url: mockUser.user_metadata.avatar_url
      });
      return { user: mockUser };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    localStorage.removeItem('cineverse_demo_user');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signInDemo,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
