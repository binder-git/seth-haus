// /Users/seth/seth-haus/ui/src/constants.ts

export enum Mode {
  DEV = "development", // Vite's development mode
  PROD = "production",   // Vite's production mode
}

// Vite provides import.meta.env.MODE which is 'development' or 'production'
export const mode = import.meta.env.MODE as Mode;

// API_URL:
// In Netlify, this will point to your site's root, and /api will be proxied.
// In local Vite dev, it will point to your Netlify dev server's /api proxy.
// Default to "/api" if not set.
export const API_URL = import.meta.env.VITE_API_URL || "/api";

// WS_API_URL:
// This is more complex with Netlify functions.
// For now, let's make it configurable. If you are actively using WebSockets,
// we will need a specific strategy for deploying them with Netlify.
// If not used, this can be an empty string or a placeholder.
// We'll construct a basic one, assuming it might be served relative to the API path or host.
const wsScheme = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsHost = window.location.host;
const defaultWsPath = "/ws-api"; // A placeholder path
export const WS_API_URL = import.meta.env.VITE_WS_API_URL || `${wsScheme}//${wsHost}${defaultWsPath}`;

// APP_BASE_PATH: Vite provides import.meta.env.BASE_URL for the base public path.
export const APP_BASE_PATH = import.meta.env.BASE_URL;

// --- Constants that were previously injected by Databutton ---
// We'll make these configurable via Vite environment variables (VITE_ prefix).
// Provide sensible defaults if the environment variable is not set.

// APP_ID: You can set this in your .env files or Netlify build environment.
export const APP_ID = import.meta.env.VITE_APP_ID || "seths-triathlon-haus";

// API_PATH: This seems Databutton specific for the API route structure.
// With our Netlify proxy, API_URL is the full base, so API_PATH might be less relevant
// or could be considered part of the endpoint string itself.
// If you use it to construct full URLs, you might need to adjust.
// For now, let's default it to "/api" if not set by VITE_API_PATH.
export const API_PATH = import.meta.env.VITE_API_PATH || "/api";


// --- These constants below were likely for Databutton's UI/metadata. ---
// You can choose to set them via VITE_ variables if your app uses them,
// or hardcode them if they are static for your app, or remove them if unused.

// App Title (used in HTML head, etc.)
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Seth's Triathlon Haus";

// Favicons - these paths would need to point to actual files in your `ui/public` directory.
// Example: if you have `ui/public/favicon-light.ico`, then VITE_APP_FAVICON_LIGHT could be "/favicon-light.ico"
export const APP_FAVICON_LIGHT = import.meta.env.VITE_APP_FAVICON_LIGHT || "/favicon.ico"; // Provide a default
export const APP_FAVICON_DARK = import.meta.env.VITE_APP_FAVICON_DARK || "/favicon.ico";    // Provide a default

// --- Deployment specific info - these are less likely to be needed directly ---
// --- in client-side code for a Netlify setup, but can be set if used.   ---
export const APP_DEPLOY_USERNAME = import.meta.env.VITE_APP_DEPLOY_USERNAME || "";
export const APP_DEPLOY_APPNAME = import.meta.env.VITE_APP_DEPLOY_APPNAME || "";
export const APP_DEPLOY_CUSTOM_DOMAIN = import.meta.env.VITE_APP_DEPLOY_CUSTOM_DOMAIN || "";
