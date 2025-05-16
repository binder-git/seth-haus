/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMMERCE_LAYER_CLIENT_ID: string;
  readonly VITE_COMMERCE_LAYER_CLIENT_SECRET: string;
  readonly VITE_COMMERCE_LAYER_ORGANIZATION: string;
  readonly VITE_COMMERCE_LAYER_DOMAIN: string;
  readonly VITE_COMMERCE_LAYER_EU_SCOPE: string;
  readonly VITE_COMMERCE_LAYER_UK_SCOPE: string;
  readonly VITE_COMMERCE_LAYER_EU_SKU_LIST_ID: string;
  readonly VITE_COMMERCE_LAYER_UK_SKU_LIST_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
