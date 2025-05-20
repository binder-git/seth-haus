import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppWrapper } from './AppWrapper';
import { COMMERCE_LAYER_CONFIG } from '@/config/constants';
import './index.css';

// Set Commerce Layer credentials on the window object
if (typeof window !== 'undefined') {
  window.__COMMERCE_LAYER_CLIENT_ID__ = COMMERCE_LAYER_CONFIG.clientId;
  window.__COMMERCE_LAYER_CLIENT_SECRET__ = COMMERCE_LAYER_CONFIG.clientSecret;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
);
