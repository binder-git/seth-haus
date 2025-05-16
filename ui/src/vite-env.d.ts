/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Environment
  readonly NODE_ENV: 'development' | 'production' | 'test';
  readonly MODE: 'development' | 'production' | 'test';
  readonly DEV: boolean;
  readonly PROD: boolean;
  
  // Commerce Layer
  readonly COMMERCE_LAYER_CLIENT_ID: string;
  readonly COMMERCE_LAYER_CLIENT_SECRET: string;
  readonly COMMERCE_LAYER_ORGANIZATION: string;
  readonly COMMERCE_LAYER_DOMAIN: string;
  readonly COMMERCE_LAYER_EU_SCOPE: string;
  readonly COMMERCE_LAYER_UK_SCOPE: string;
  readonly COMMERCE_LAYER_EU_SKU_LIST_ID: string;
  readonly COMMERCE_LAYER_UK_SKU_LIST_ID: string;
  
  // App Configuration
  readonly APP_TITLE: string;
  readonly APP_ID: string;
  readonly APP_FAVICON_LIGHT: string;
  readonly APP_FAVICON_DARK: string;
  
  // API Configuration
  readonly API_URL: string;
  readonly WS_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
