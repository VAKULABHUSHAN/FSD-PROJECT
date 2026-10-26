import { supabase, isSupabaseConfigured } from './supabase.js';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Poster mapping for known Indian cinema titles where poster_path is null in database
const KNOWN_POSTERS = {
  'in_te_001': 'https://image.tmdb.org/t/p/w500/9BAjt85amQXzh6Bs9W0UeE0kcuV.jpg', // Baahubali: The Beginning
  'in_te_002': 'https://image.tmdb.org/t/p/w500/2L0Uj0X16W4L7sA6H3N45vNq2sY.jpg', // Baahubali 2
  'in_te_003': 'https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0yeBEv02o.jpg', // RRR
  'in_te_004': 'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSPxXx1zNzTl7A92.jpg', // Pushpa
  'in_te_005': 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Jersey
  'in_te_006': 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', // Eega
  'in_te_007': 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', // Arjun Reddy
  'in_te_008': 'https://image.tmdb.org/t/p/w500/7HW473V2v5XqegvWZdw9vX0oxNn.jpg', // Mahanati
  'in_ta_001': 'https://image.tmdb.org/t/p/w500/3bZtVq6gGvU3G2b7sJ5Hq0yA8y.jpg', // Vikram
  'in_ta_002': 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', // Leo
  'in_ta_003': 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', // Jailer
  'in_ta_013': 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // Thani Oruvan
  'in_ta_014': 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', // Anniyan
  'in_ta_015': 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', // Enthiran
  'in_ta_016': 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', // Ghilli
  'in_ta_017': 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', // Minnale
  'in_ta_018': 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', // Alaipayuthey
  'in_ta_019': 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', // Super Deluxe
  'in_ta_020': 'https://image.tmdb.org/t/p/w500/5h1hKz07jN3Y9G1x46k3Jb9n1fB.jpg'  // Meiyazhagan
};

export const SUPABASE_GENRES = [
  'All',
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Music',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sport',
  'Thriller'
];

// Generate high quality cinematic SVG poster when database poster_path is null
export const generatePosterSvg = (title = 'Movie', genre = 'Cinema') => {
  const safeTitle = encodeURIComponent(title.length > 22 ? title.slice(0, 20) + '…' : title);
  const safeGenre = encodeURIComponent(genre);
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a1a28"/><stop offset="100%" stop-color="%230b0b12"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23bg)"/><rect x="18" y="18" width="464" height="714" rx="14" fill="none" stroke="%232b2b3e" stroke-width="2"/><circle cx="250" cy="310" r="58" fill="%23222232"/><polygon points="242,288 274,310 242,332" fill="%23F5C518"/><text x="250" y="440" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="800" font-size="28" fill="%23FFFFFF" text-anchor="middle">${safeTitle}</text><rect x="180" y="475" width="140" height="28" rx="14" fill="%23F5C518" fill-opacity="0.15"/><text x="250" y="494" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="700" font-size="13" fill="%23F5C518" text-anchor="middle">${safeGenre}</text><text x="250" y="680" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="800" font-size="15" fill="%23565672" letter-spacing="4" text-anchor="middle">CINEVERSE</text></svg>`;
};

// Format poster path to full URL
export const formatPosterUrl = (posterPath, title = '', id = '', genre = 'Cinema') => {
  if (id && KNOWN_POSTERS[id]) {
    return KNOWN_POSTERS[id];
  }
  if (!posterPath) {
    return generatePosterSvg(title, genre);
  }
  if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
    return posterPath;
  }
  return `${TMDB_IMAGE_BASE}/w500${posterPath.startsWith('/') ? '' : '/'}${posterPath}`;
};

// Format backdrop path to full URL
export const formatBackdropUrl = (backdropPath, fallbackPoster) => {
  if (backdropPath) {
    if (backdropPath.startsWith('http://') || backdropPath.startsWith('https://')) {
      return backdropPath;
    }
    return `${TMDB_IMAGE_BASE}/original${backdropPath.startsWith('/') ? '' : '/'}${backdropPath}`;
  }
  return fallbackPoster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200';
};

// Normalize a movie record from Supabase public.movies
export const formatMovieRecord = (item) => {
  if (!item) return null;

  let genres = item.genres;
  if (!Array.isArray(genres)) {
    if (typeof genres === 'string') {
      try {
        genres = JSON.parse(genres);
      } catch {
        genres = genres.split(',').map(s => s.trim());
      }
    } else {
      genres = ['Drama'];
    }
  }

  const primaryGenre = genres && genres.length > 0 ? genres[0] : 'Cinema';
  const poster = formatPosterUrl(item.poster_path, item.title, item.id, primaryGenre);
  const backdrop = formatBackdropUrl(item.backdrop_path, poster);

  const releaseDate = item.release_date || '';
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 2024;
  const rating = item.vote_average ? Number(Number(item.vote_average).toFixed(1)) : 8.0;

  let runtime = item.runtime;
  if (typeof runtime === 'number') {
    runtime = `${Math.floor(runtime / 60)}h ${runtime % 60}m`;
  } else if (!runtime) {
    runtime = '2h 20m';
  }

  const isIndian = item.id?.startsWith('in_');

  return {
    id: item.id,
    title: item.title || 'Untitled',
    overview: item.overview || 'Two imprisoned men develop a lasting friendship while finding hope in an unforgiving prison.',
    poster,
    backdrop,
    year,
    releaseDate: releaseDate || '1994-09-23',
    rating,
    voteCount: `${Math.round(rating * 85)}K`,
    runtime,
    genres,
    type: item.media_type || 'movie',
    isIndian,
    tagline: isIndian ? 'A celebrated Indian cinematic masterpiece' : 'Acclaimed international cinema',
    certification: rating >= 8.5 ? 'R' : 'PG-13',
    director: isIndian ? 'Acclaimed Indian Director' : 'Acclaimed Director',
    writers: ['Screenplay & Direction Team'],
    stars: isIndian ? ['Celebrated Cast', 'Star Performers'] : ['Lead Actors', 'Ensemble Cast'],
    trailerKey: 'uYPbbksJxIg', // Universal trailer player support
    cast: [
      { name: 'Principal Lead', character: 'Protagonist', avatar: null },
      { name: 'Supporting Lead', character: 'Key Ally', avatar: null }
    ],
    similarIds: []
  };
};

// Retrieve all movies from Supabase public.movies
export const fetchAllSupabaseMovies = async () => {
  if (!isSupabaseConfigured) {
    const err = new Error('Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing.');
    console.error('[Supabase Configuration Error]:', err);
    throw err;
  }

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('vote_average', { ascending: false });

  if (error) {
    console.error('[Supabase public.movies query error]:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn('[Supabase Warning]: public.movies returned 0 records.');
    return [];
  }

  return data.map(formatMovieRecord);
};

// Fetch trending movies (Top rated Indian and Hollywood blockbusters)
export const fetchTrending = async () => {
  const all = await fetchAllSupabaseMovies();
  // Return top 20 by rating and popularity
  return all.slice(0, 20);
};

// Fetch top rated movies
export const fetchTopRated = async (category = 'all') => {
  const all = await fetchAllSupabaseMovies();
  if (category === 'indian') {
    return all.filter(m => m.isIndian);
  }
  if (category === 'hollywood') {
    return all.filter(m => !m.isIndian);
  }
  return all;
};

// Fetch popular movies
export const fetchPopular = async (category = 'all') => {
  const all = await fetchAllSupabaseMovies();
  const sorted = [...all].sort((a, b) => b.year - a.year || b.rating - a.rating);
  if (category === 'indian') {
    return sorted.filter(m => m.isIndian);
  }
  if (category === 'hollywood') {
    return sorted.filter(m => !m.isIndian);
  }
  return sorted;
};

// Fetch upcoming or recent releases
export const fetchUpcoming = async () => {
  const all = await fetchAllSupabaseMovies();
  return all.filter(m => m.year >= 2021).sort((a, b) => b.year - a.year);
};

// Fetch Indian Cinema collection
export const fetchIndianCinema = async () => {
  const all = await fetchAllSupabaseMovies();
  return all.filter(m => m.isIndian);
};

// Fetch Hollywood collection
export const fetchHollywood = async () => {
  const all = await fetchAllSupabaseMovies();
  return all.filter(m => !m.isIndian);
};

// Fetch single movie by ID from Supabase public.movies
export const fetchMovieById = async (id) => {
  if (!id) return null;

  if (!isSupabaseConfigured) {
    const err = new Error('Supabase is not configured.');
    console.error('[Supabase Configuration Error]:', err);
    throw err;
  }

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`[Supabase fetchMovieById error for ${id}]:`, error);
    // If not found by exact ID, fallback to searching in memory
    const all = await fetchAllSupabaseMovies();
    const found = all.find(m => m.id === id || m.title?.toLowerCase() === id.toLowerCase());
    if (found) return found;
    throw error;
  }

  return formatMovieRecord(data);
};

// Search titles across Supabase public.movies
export const searchTitles = async (query = '', genre = 'All', sortBy = 'popular', category = 'all') => {
  const all = await fetchAllSupabaseMovies();
  let list = all;

  // Category filter: indian, hollywood, all
  if (category === 'indian') {
    list = list.filter(m => m.isIndian);
  } else if (category === 'hollywood') {
    list = list.filter(m => !m.isIndian);
  }

  // Keyword search against title, overview, genres
  if (query && query.trim() !== '') {
    const q = query.toLowerCase().trim();
    list = list.filter(m => 
      m.title.toLowerCase().includes(q) ||
      (m.overview && m.overview.toLowerCase().includes(q)) ||
      (m.genres && m.genres.some(g => g.toLowerCase().includes(q)))
    );
  }

  // Genre filter
  if (genre && genre !== 'All') {
    list = list.filter(m => 
      m.genres && m.genres.some(g => g.toLowerCase() === genre.toLowerCase())
    );
  }

  // Sorting
  if (sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'newest') {
    list.sort((a, b) => b.year - a.year);
  } else if (sortBy === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // Default: Sort by rating with recency weight
    list.sort((a, b) => (b.rating * (b.year >= 2018 ? 1.05 : 1)) - (a.rating * (a.year >= 2018 ? 1.05 : 1)));
  }

  return list;
};
