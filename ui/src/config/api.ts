// API Configuration
export const API = {
  // Base URL for Netlify Functions
  baseUrl: '/.netlify/functions',
  
  // API endpoints
  endpoints: {
    base: import.meta.env.API_URL || 'http://localhost:3000',
  },

  // WebSocket configuration (if needed in future)
  ws: {
    enabled: false,
    url: ''
  }
} as const;
