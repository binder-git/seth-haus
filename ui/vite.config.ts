import react from "@vitejs/plugin-react";
import "dotenv/config";
import path from "node:path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import injectHTML from "vite-plugin-html-inject";
import tsConfigPaths from "vite-tsconfig-paths";
import { createHtmlPlugin } from 'vite-plugin-html';

const buildVariables = () => {
	const defines: Record<string, string> = {
		__API_URL__: JSON.stringify("http://localhost:8000"),
		__WS_API_URL__: JSON.stringify("ws://localhost:8000"),
		__COMMERCE_LAYER_CLIENT_ID__: JSON.stringify(process.env.VITE_COMMERCE_LAYER_CLIENT_ID),
		__COMMERCE_LAYER_CLIENT_SECRET__: JSON.stringify(process.env.VITE_COMMERCE_LAYER_CLIENT_SECRET),
		__COMMERCE_LAYER_ORGANIZATION__: JSON.stringify(process.env.VITE_COMMERCE_LAYER_ORGANIZATION),
		__COMMERCE_LAYER_DOMAIN__: JSON.stringify(process.env.VITE_COMMERCE_LAYER_DOMAIN),
		__COMMERCE_LAYER_SCOPE__: JSON.stringify(process.env.VITE_COMMERCE_LAYER_SCOPE),
		__APP_BASE_PATH__: JSON.stringify("/"),
		__APP_TITLE__: JSON.stringify("Seth's Triathlon Haus"),
		__APP_FAVICON_LIGHT__: JSON.stringify("/favicon-light.svg"),
		__APP_FAVICON_DARK__: JSON.stringify("/favicon-dark.svg")
	};

	return defines;
};

// https://vite.dev/config/
export default defineConfig({
  envFile: '.env.development',
	define: buildVariables(),
	plugins: [react(), splitVendorChunkPlugin(), tsConfigPaths(), injectHTML(), createHtmlPlugin()],
	css: {
		postcss: {
			config: './postcss.config.cjs',
		},
		devSourcemap: true,
		modules: {
			localsConvention: 'camelCase',
		},
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
