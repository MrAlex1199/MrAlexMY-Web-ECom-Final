// Central API configuration for SongTor Hub
// In production (Railway), REACT_APP_API_URL is empty so API calls go to same origin
// In local dev, falls back to http://localhost:3001
const envUrl = process.env.REACT_APP_API_URL;
export const API_BASE_URL = envUrl !== undefined ? envUrl : "http://localhost:3001";
