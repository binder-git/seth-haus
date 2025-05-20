// Global type declarations for the application

declare global {
  interface Window {
    // Commerce Layer client credentials
    __COMMERCE_LAYER_CLIENT_ID__?: string;
    __COMMERCE_LAYER_CLIENT_SECRET__?: string;
    
    // Add other global window properties here as needed
  }
}

export {}; // This file needs to be a module
