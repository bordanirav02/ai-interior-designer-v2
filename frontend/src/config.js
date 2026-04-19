// Central API configuration — set REACT_APP_API_URL in Vercel environment variables
// to point to your deployed Render backend URL.
// Falls back to localhost for local development.
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
