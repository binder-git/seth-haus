import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from the root .env file
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), '');
  
  // Load environment variables from the UI directory (if any)
  const uiEnv = loadEnv(mode, process.cwd(), '');
  
  // Merge environment variables with root .env taking precedence
  const env = {
    // Default values
    PORT: '5173',
    NETLIFY_DEV_PORT: '9999',
    
    // Load from UI env first (lower priority)
    ...uiEnv,
    
    // Then load from root .env (higher priority)
    ...rootEnv,
    
    // Then set any process.env overrides (highest priority)
    ...(process.env.PORT && { PORT: process.env.PORT }),
    ...(process.env.NETLIFY_DEV_PORT && { NETLIFY_DEV_PORT: process.env.NETLIFY_DEV_PORT }),
    
    // Set default values if not provided
    COMMERCE_LAYER_ORGANIZATION: rootEnv.COMMERCE_LAYER_ORGANIZATION || uiEnv.COMMERCE_LAYER_ORGANIZATION || 'seth-s-triathlon-haus',
    COMMERCE_LAYER_DOMAIN: rootEnv.COMMERCE_LAYER_DOMAIN || uiEnv.COMMERCE_LAYER_DOMAIN || 'commercelayer.io',
    COMMERCE_LAYER_CLIENT_ID: rootEnv.COMMERCE_LAYER_CLIENT_ID || uiEnv.COMMERCE_LAYER_CLIENT_ID || '',
    COMMERCE_LAYER_CLIENT_SECRET: rootEnv.COMMERCE_LAYER_CLIENT_SECRET || uiEnv.COMMERCE_LAYER_CLIENT_SECRET || '',
    
    // Market Configurations with defaults
    COMMERCE_LAYER_EU_SCOPE: rootEnv.COMMERCE_LAYER_EU_SCOPE || uiEnv.COMMERCE_LAYER_EU_SCOPE || 'market:id:qjANwhQrJg',
    COMMERCE_LAYER_UK_SCOPE: rootEnv.COMMERCE_LAYER_UK_SCOPE || uiEnv.COMMERCE_LAYER_UK_SCOPE || 'market:id:vjzmJhvEDo',
    COMMERCE_LAYER_EU_SKU_LIST_ID: rootEnv.COMMERCE_LAYER_EU_SKU_LIST_ID || uiEnv.COMMERCE_LAYER_EU_SKU_LIST_ID || 'JjEpIvwjey',
    COMMERCE_LAYER_UK_SKU_LIST_ID: rootEnv.COMMERCE_LAYER_UK_SKU_LIST_ID || uiEnv.COMMERCE_LAYER_UK_SKU_LIST_ID || 'nVvZIAKxGn',
    
    // App Configuration
    APP_TITLE: rootEnv.APP_TITLE || uiEnv.APP_TITLE || "Seth's Triathlon Haus",
    API_URL: rootEnv.API_URL || uiEnv.API_URL || '/.netlify/functions'
  };
  
  // Extract ports
  const port = parseInt(env.PORT, 10);
  const netlifyDevPort = parseInt(env.NETLIFY_DEV_PORT, 10);
  
  // Create a simplified environment object with only the variables we need
  const envVars = {
    // Development environment
    'import.meta.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    
    // Commerce Layer Configuration
    'import.meta.env.COMMERCE_LAYER_ORGANIZATION': JSON.stringify(env.COMMERCE_LAYER_ORGANIZATION || 'seth-s-triathlon-haus'),
    'import.meta.env.COMMERCE_LAYER_DOMAIN': JSON.stringify(env.COMMERCE_LAYER_DOMAIN || 'commercelayer.io'),
    'import.meta.env.COMMERCE_LAYER_CLIENT_ID': JSON.stringify(env.COMMERCE_LAYER_CLIENT_ID || ''),
    'import.meta.env.COMMERCE_LAYER_CLIENT_SECRET': JSON.stringify(env.COMMERCE_LAYER_CLIENT_SECRET || ''),
    
    // Market configurations
    'import.meta.env.COMMERCE_LAYER_EU_SCOPE': JSON.stringify(env.COMMERCE_LAYER_EU_SCOPE || 'market:id:qjANwhQrJg'),
    'import.meta.env.COMMERCE_LAYER_UK_SCOPE': JSON.stringify(env.COMMERCE_LAYER_UK_SCOPE || 'market:id:vjzmJhvEDo'),
    'import.meta.env.COMMERCE_LAYER_EU_SKU_LIST_ID': JSON.stringify(env.COMMERCE_LAYER_EU_SKU_LIST_ID || 'JjEpIvwjey'),
    'import.meta.env.COMMERCE_LAYER_UK_SKU_LIST_ID': JSON.stringify(env.COMMERCE_LAYER_UK_SKU_LIST_ID || 'nVvZIAKxGn'),
    
    // App Configuration
    'import.meta.env.APP_TITLE': JSON.stringify(env.APP_TITLE || "Seth's Triathlon Haus"),
    'import.meta.env.API_URL': JSON.stringify(env.API_URL || '/.netlify/functions'),
    
    // Server configuration
    'import.meta.env.PORT': JSON.stringify(port),
    'import.meta.env.NETLIFY_DEV_PORT': JSON.stringify(netlifyDevPort),
  };
  
  // Log the environment variables for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('Environment variables being set:', 
      Object.entries(envVars)
        .filter(([key]) => key.startsWith('import.meta.env.'))
        .map(([key, value]) => ({
          key: key.replace('import.meta.env.', ''),
          value: JSON.parse(value as string)
        }))
    );
  }
  
  // Define environment variables for the client
  const define: Record<string, any> = {
    // Expose all environment variables to the client
    ...Object.entries(envVars).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>)
  };

  return {
    plugins: [
      react({
        // This ensures the JSX is properly transformed
        jsxImportSource: 'react',
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', {
              runtime: 'automatic',
              importSource: 'react'
            }]
          ]
        }
      }),
      tsconfigPaths({
        ignoreConfigErrors: true,
      }),
    ],
    server: {
      port: port,
      strictPort: true, // Exit if port is in use
      proxy: {
        // Proxy API requests to the Netlify Functions server
        '^/api/.*': {
          target: `http://localhost:${netlifyDevPort}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/.netlify/functions'),
        },
        // Direct proxy for Netlify functions
        '^/\\.netlify/functions/.*': {
          target: `http://localhost:${netlifyDevPort}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/\.netlify\/functions/, '')
        }
      },
      cors: true,
    },
    // Add base URL for production
    base: process.env.NODE_ENV === 'production' ? '/.netlify/functions' : '/',
    define: define,
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      alias: [
        {
          find: /^@\/(.*)/,
          replacement: path.resolve(__dirname, './src/$1'),
        },
        {
          find: /^utils\/(.*)/,
          replacement: path.resolve(__dirname, './src/utils/$1'),
        },
        {
          find: /^components\/(.*)/,
          replacement: path.resolve(__dirname, './src/components/$1'),
        },
        {
          find: /^pages\/(.*)/,
          replacement: path.resolve(__dirname, './src/pages/$1'),
        },
        {
          find: /^hooks\/(.*)/,
          replacement: path.resolve(__dirname, './src/hooks/$1'),
        },
        {
          find: /^services\/(.*)/,
          replacement: path.resolve(__dirname, './src/services/$1'),
        },
        {
          find: /^contexts\/(.*)/,
          replacement: path.resolve(__dirname, './src/contexts/$1'),
        },
      ]
    },
    esbuild: {
      loader: 'tsx',
      include: /src\/.*\.[tj]sx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.ts': 'tsx',
        },
      },
    }
  };
});