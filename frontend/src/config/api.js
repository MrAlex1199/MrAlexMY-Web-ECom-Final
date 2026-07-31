// Central API configuration for SongTor Hub
const envUrl = process.env.REACT_APP_API_URL;

// Check if running in local browser environment (localhost or 127.0.0.1)
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Production backend default URL (Railway)
const DEFAULT_PROD_BACKEND_URL = "https://mralexmy-web-ecom-final-production.up.railway.app";

// 1. If REACT_APP_API_URL is set and non-empty, use it.
// 2. If running locally, default to http://localhost:3001.
// 3. Otherwise in production, default to the separate production backend URL.
export const API_BASE_URL = (envUrl && envUrl.trim() !== '')
  ? envUrl
  : (isLocal ? "http://localhost:3001" : DEFAULT_PROD_BACKEND_URL);

