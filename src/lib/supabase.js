import { createClient } from '@supabase/supabase-js';

// Read environment variables - works in both Vite (browser) and Node.js (scripts)
const supabaseUrl = (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : '') || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_SUPABASE_ANON_KEY : '') || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-supabase-url')
);

// Fallback in-memory/localStorage mock client if Supabase is not configured
class MockSupabaseClient {
  constructor() {
    this.auth = {
      getSession: async () => {
        const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('cineverse_demo_user') : null;
        if (stored) {
          try {
            const user = JSON.parse(stored);
            return { data: { session: { user } }, error: null };
          } catch {
            return { data: { session: null }, error: null };
          }
        }
        return { data: { session: null }, error: null };
      },
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } }
      }),
      signUp: async ({ email, password, options }) => {
        const user = {
          id: 'demo-user-' + Date.now(),
          email,
          user_metadata: {
            username: options?.data?.username || email.split('@')[0],
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
          }
        };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('cineverse_demo_user', JSON.stringify(user));
        }
        return { data: { user, session: { user } }, error: null };
      },
      signInWithPassword: async ({ email }) => {
        const user = {
          id: 'demo-user-' + (email.replace(/[^a-zA-Z0-9]/g, '') || 'guest'),
          email,
          user_metadata: {
            username: email.split('@')[0],
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
          }
        };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('cineverse_demo_user', JSON.stringify(user));
        }
        return { data: { user, session: { user } }, error: null };
      },
      signOut: async () => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('cineverse_demo_user');
        }
        return { error: null };
      }
    };
  }

  from(table) {
    return {
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
          then: (resolve) => resolve({ data: [], error: null })
        }),
        order: () => Promise.resolve({ data: [], error: null }),
        then: (resolve) => resolve({ data: [], error: null })
      }),
      insert: (payload) => ({
        select: () => Promise.resolve({ data: [payload], error: null }),
        then: (resolve) => resolve({ data: [payload], error: null })
      }),
      upsert: (payload) => ({
        select: () => Promise.resolve({ data: [payload], error: null }),
        then: (resolve) => resolve({ data: [payload], error: null })
      }),
      delete: () => ({
        match: () => Promise.resolve({ error: null }),
        eq: () => Promise.resolve({ error: null }),
        then: (resolve) => resolve({ error: null })
      })
    };
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : new MockSupabaseClient();
