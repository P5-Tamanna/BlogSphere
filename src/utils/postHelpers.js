import { format } from 'date-fns';

// Base address of the backend for static files (uploads).
// REACT_APP_API_URL = http://localhost:5001/api  ->  http://localhost:5001
const API_URL = process.env.REACT_APP_API_URL || '';
const FILE_BASE = API_URL.replace(/\/api\/?$/, '');

// Turns whatever is saved in the database into a URL the browser can load.
export const getImageUrl = (path) => {
  if (!path || typeof path !== 'string') return null;
  const clean = path.replace(/\\/g, '/');

  // Address saved with an old localhost port: keep the path, use the current server
  const local = clean.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/.*)$/i);
  if (local) return `${FILE_BASE}${local[1]}`;

  if (/^(https?:|data:|blob:)/i.test(clean)) return clean; // other full URLs
  return `${FILE_BASE}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

// Works for 1, "1", "5 min read"
export const formatReadTime = (readTime) => {
  if (!readTime) return '5 min read';
  if (typeof readTime === 'string' && /[a-z]/i.test(readTime)) return readTime;
  return `${readTime} min read`;
};

// Case-insensitive ("Travel" and "travel" both work)
export const getCategoryColor = (category) => {
  const colors = {
    technology: 'bg-blue-100 text-blue-800',
    lifestyle: 'bg-green-100 text-green-800',
    travel: 'bg-purple-100 text-purple-800',
    food: 'bg-orange-100 text-orange-800',
    business: 'bg-gray-100 text-gray-800',
    health: 'bg-red-100 text-red-800',
  };
  return colors[String(category || '').toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Does not crash on missing or invalid dates
export const formatPostDate = (dateString, pattern = 'MMM dd, yyyy') => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : format(date, pattern);
};