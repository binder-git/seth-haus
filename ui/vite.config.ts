import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Needed for path.resolve for aliases
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  // Only load VITE_ prefixed environment variables for the client.
  // This ensures only safe, public variables are exposed.
  const clientEnv = loadEnv(mode, process.cwd(), 'VITE_');

  // Server configuration for Vite's dev server.
  // Netlify CLI will proxy to this.
  const serverConfig = {
    port: parseInt(process.env.PORT || '5173', 10),
    strictPort: true,
    proxy: {
      // This rule tells Vite to forward requests to /.netlify/functions
      // to the Netlify Functions development server.
      // It's crucial for your frontend to talk to your functions.
      '/.netlify/functions': {
        target: `http://localhost:${process.env.NETLIFY_DEV_PORT || '9999'}`,
        changeOrigin: true,
        secure: false, // Allow for local development
      }
      // Removed the '/api' proxy as you indicated you don't need it.
    }
  };

  return {
    plugins: [
      react({
        jsxImportSource: 'react',
      }),
      tsconfigPaths()
    ],
    server: serverConfig,
    preview: serverConfig, // Preview server config (often same as dev server)

    // Define global constant replacements for client-side code.
    define: {
      // Expose VITE_ prefixed variables correctly via import.meta.env
      'import.meta.env': JSON.stringify(clientEnv),
      // Expose NODE_ENV for compatibility, if needed by some libraries
      'process.env.NODE_ENV': JSON.stringify(mode),
      // IMPORTANT: DO NOT ADD ANY COMMERCE LAYER CREDENTIALS HERE (CLIENT_ID, SECRET, etc.)
      // They must NOT be in the client-side bundle.
    },

    // Ensure Vite only considers .env files in the 'ui/' directory
    // and only exposes variables with the VITE_ prefix to the client.
    envDir: '.', // This means Vite looks for .env files in the current (ui) directory
    envPrefix: 'VITE_', // Only allows VITE_ prefixed variables to be client-side

    // Path aliases (as you had them, ensure they are correct)
    resolve: {
      alias: [
        { find: /^@\/(.*)/, replacement: path.resolve(__dirname, './src/$1') },
        { find: /^utils\/(.*)/, replacement: path.resolve(__dirname, './src/utils/$1') },
        { find: /^components\/(.*)/, replacement: path.resolve(__dirname, './src/components/$1') },
        { find: /^pages\/(.*)/, replacement: path.resolve(__dirname, './src/pages/$1') },
        { find: /^hooks\/(.*)/, replacement: path.resolve(__dirname, './src/hooks/$1') },
        { find: /^services\/(.*)/, replacement: path.resolve(__dirname, './src/services/$1') },
        { find: /^contexts\/(.*)/, replacement: path.resolve(__dirname, './src/contexts/$1') },
      ]
    },

    // Esbuild options for your source code (NOT for dependency pre-bundling)
    esbuild: {
      jsx: 'automatic',
      jsxDev: mode === 'development',
      jsxImportSource: 'react',
      logLevel: 'info',
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode)
      }
    },

    // Esbuild options specifically for pre-bundling node_modules dependencies
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx', // Example: Treat .js files in dependencies as JSX if needed
        },
        define: {
          'process.env.NODE_ENV': JSON.stringify(mode)
        },
        jsx: 'automatic',
        jsxDev: mode === 'development',
        jsxImportSource: 'react',
        logLevel: 'info'
      }
    }
  };
});