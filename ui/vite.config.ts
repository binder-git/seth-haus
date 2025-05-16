import react from "@vitejs/plugin-react";
import "dotenv/config";
import path from "node:path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import injectHTML from "vite-plugin-html-inject";
import tsConfigPaths from "vite-tsconfig-paths";
import { createHtmlPlugin } from 'vite-plugin-html';

const buildVariables = () => {
	const defines: Record<string, string> = {
		__API_URL__: JSON.stringify("/.netlify/functions"),
		__WS_API_URL__: JSON.stringify(""),
		__COMMERCE_LAYER_CLIENT_ID__: JSON.stringify(process.env.COMMERCE_LAYER_CLIENT_ID),
		__COMMERCE_LAYER_CLIENT_SECRET__: JSON.stringify(process.env.COMMERCE_LAYER_CLIENT_SECRET),
		__COMMERCE_LAYER_ORGANIZATION__: JSON.stringify(process.env.COMMERCE_LAYER_ORGANIZATION),
		__COMMERCE_LAYER_DOMAIN__: JSON.stringify(process.env.COMMERCE_LAYER_DOMAIN),
		__COMMERCE_LAYER_EU_SCOPE__: JSON.stringify(process.env.COMMERCE_LAYER_EU_SCOPE || 'market:qjANwhQrJg'),
		__COMMERCE_LAYER_UK_SCOPE__: JSON.stringify(process.env.COMMERCE_LAYER_UK_SCOPE || 'market:vjzmJhvEDo'),
		__COMMERCE_LAYER_EU_SKU_LIST_ID__: JSON.stringify(process.env.COMMERCE_LAYER_EU_SKU_LIST_ID || 'JjEpIvwjey'),
		__COMMERCE_LAYER_UK_SKU_LIST_ID__: JSON.stringify(process.env.COMMERCE_LAYER_UK_SKU_LIST_ID || 'nVvZIAKxGn'),
		__APP_BASE_PATH__: JSON.stringify("/"),
		__APP_TITLE__: JSON.stringify("Seth's Triathlon Haus"),
		__APP_FAVICON_LIGHT__: JSON.stringify("/favicon-light.svg"),
		__APP_FAVICON_DARK__: JSON.stringify("/favicon-dark.svg")
	};

	return defines;
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    tsConfigPaths({
      loose: true,
      parseNative: false,
    }),
    injectHTML(),
    createHtmlPlugin()
  ],
  css: {
    postcss: './postcss.config.cjs',
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
  },
  // Expose environment variables to the client
  envDir: '../', // Look for .env files in the root directory
  envPrefix: ['COMMERCE_LAYER_', 'APP_', 'API_'], // Allow these prefixes
  // Define global constants
  define: {
    ...buildVariables(),
    // Explicitly expose environment variables to the client
    'import.meta.env': {
      ...Object.fromEntries(
        [
          // Commerce Layer
          'COMMERCE_LAYER_CLIENT_ID',
          'COMMERCE_LAYER_ORGANIZATION',
          'COMMERCE_LAYER_DOMAIN',
          'COMMERCE_LAYER_EU_SCOPE',
          'COMMERCE_LAYER_UK_SCOPE',
          'COMMERCE_LAYER_EU_SKU_LIST_ID',
          'COMMERCE_LAYER_UK_SKU_LIST_ID',
          // App
          'APP_TITLE',
          'APP_ID',
          'APP_FAVICON_LIGHT',
          'APP_FAVICON_DARK',
          // API
          'API_URL',
          'WS_API_URL'
        ].map(key => [key, JSON.stringify(process.env[key])])
      ),
      // Default values
      COMMERCE_LAYER_DOMAIN: '"commercelayer.io"',
      COMMERCE_LAYER_EU_SCOPE: '"market:qjANwhQrJg"',
      COMMERCE_LAYER_UK_SCOPE: '"market:vjzmJhvEDo"',
      COMMERCE_LAYER_EU_SKU_LIST_ID: '"JjEpIvwjey"',
      COMMERCE_LAYER_UK_SKU_LIST_ID: '"nVvZIAKxGn"',
      APP_TITLE: '"Seth\'s Triathlon Haus"',
      APP_ID: '"seths-triathlon-haus"',
      API_URL: '"http://localhost:3000"',
      WS_API_URL: '"ws://localhost:3000"',
      MODE: JSON.stringify(process.env.NODE_ENV || 'development'),
      DEV: JSON.stringify(process.env.NODE_ENV !== 'production'),
      PROD: JSON.stringify(process.env.NODE_ENV === 'production')
    }
  },
	server: {
		proxy: {
			"/routes": {
				target: "http://127.0.0.1:8000",
				changeOrigin: true,
			},
			"/.netlify/functions": {
				target: "http://localhost:5177",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/\.netlify\/functions/, '')
			}
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'components': path.resolve(__dirname, './src/components'),
			'utils': path.resolve(__dirname, './src/utils'),
			'pages': path.resolve(__dirname, './src/pages'),
		},
	},
});
