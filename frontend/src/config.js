const ENV_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export function getApiUrl() {
  return localStorage.getItem("interiorai_api_url") || ENV_URL;
}

// Headers required for every request — ngrok intercepts browser fetches unless
// this header is present, so we always include it (harmless for non-ngrok URLs).
export function apiHeaders(extra = {}) {
  return {
    "ngrok-skip-browser-warning": "true",
    ...extra,
  };
}

export const API_URL = ENV_URL;
