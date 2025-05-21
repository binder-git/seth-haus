import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppWrapper } from './AppWrapper';
import { CommerceLayerConfigProvider } from './utils/commerceLayerConfig';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CommerceLayerConfigProvider>
      <AppWrapper>
        {/* Your main application components */}
      </AppWrapper>
    </CommerceLayerConfigProvider>
  </React.StrictMode>,
);
