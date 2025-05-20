import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Proxy configuration
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:9999',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/.netlify/functions' // Rewrite /api to /.netlify/functions
  },
  onProxyRes: function(proxyRes, req, res) {
    // Add CORS headers to the response
    proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
});

// Use the proxy for all API requests
app.use('/api', apiProxy);

// Start the server
app.listen(PORT, () => {
  console.log(`CORS Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to: http://localhost:9999/.netlify/functions`);
});
