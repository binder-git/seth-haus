/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Environment (Vite's default)
  readonly NODE_ENV: 'development' | 'production' | 'test';
  readonly MODE: 'development' | 'production' | 'test';
  readonly DEV: boolean;
  readonly PROD: boolean;
  
  // Custom Environment Variables (MUST match VITE_ prefix in .env and usage)
  readonly VITE_API_BASE_PATH: string;
  readonly VITE_COMMERCE_LAYER_PUBLIC_CLIENT_ID: string;
  readonly VITE_COMMERCE_LAYER_ORGANIZATION_SLUG: string;

  // If you are still using these directly, you might need to add their VITE_ counterparts,
  // but prioritize the ones we've explicitly added to .env and commerceLayerApi.ts
  // readonly VITE_COMMERCE_LAYER_CLIENT_ID: string; // If you plan to use this directly
  // readonly VITE_COMMERCE_LAYER_CLIENT_SECRET?: string; // Should NOT be on frontend!
  // readonly VITE_COMMERCE_LAYER_ORGANIZATION: string; // Use VITE_COMMERCE_LAYER_ORGANIZATION_SLUG
  // readonly VITE_COMMERCE_LAYER_DOMAIN: string;
  // readonly VITE_COMMERCE_LAYER_EU_SCOPE: string;
  // readonly VITE_COMMERCE_LAYER_UK_SCOPE: string;
  // readonly VITE_COMMERCE_LAYER_EU_SKU_LIST_ID: string;
  // readonly VITE_COMMERCE_LAYER_UK_SKU_LIST_ID: string;
  
  // App Configuration
  readonly VITE_APP_TITLE: string; // Assuming you'd prefix this
  readonly VITE_APP_ID?: string;
  readonly VITE_APP_FAVICON_LIGHT?: string;
  readonly VITE_APP_FAVICON_DARK?: string;
  
  // API Configuration
  // If API_URL was meant to be VITE_API_BASE_PATH, consolidate it.
  // readonly VITE_API_URL: string; // Or remove if VITE_API_BASE_PATH is the only one
  // readonly VITE_WS_API_URL?: string;
}

declare global {
  namespace NodeJS {
    // This part is typically for Node.js environments (like Netlify Functions or backend)
    // and might not be strictly necessary for your frontend only, but doesn't hurt.
    interface ProcessEnv extends ImportMetaEnv {} 
  }
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}