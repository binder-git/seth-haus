// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

// Track initialization state
let isInitialized = false; // Whether the SDK is fully initialized
let initializationInProgress = false; // Whether initialization is currently in progress
let initializationAttempted = false; // Whether initialization has been attempted at least once

// Store the current market ID for reference
let currentMarketId = null;

// Import centralized constants
import { MARKETS, COMMERCE_LAYER_CONFIG } from './constants';

// Re-export MARKETS for backward compatibility
export { MARKETS };

/**
 * Format market IDs with the correct 'market:id:' prefix
 * @param {Object} markets - The markets object to format
 * @returns {Object} Formatted markets object with proper ID format
 */
const formatMarkets = (markets) => {
  return Object.entries(markets).reduce((acc, [key, market]) => {
    acc[key] = {
      ...market,
      id: `market:id:${market.id}`, // Ensure ID has the correct format
      scope: `market:id:${market.id}` // Ensure scope has the correct format
    };
    return acc;
  }, {});
};

// Create a formatted markets object with the correct ID format
const FORMATTED_MARKETS = formatMarkets(MARKETS);

// Export the formatted markets for use in other modules
export const getFormattedMarkets = () => ({ ...FORMATTED_MARKETS });

// Commerce Layer configuration
export const configureCommerceLayer = () => {
  if (typeof window === 'undefined') {
    console.warn('[CommerceLayer] Not running in browser environment');
    return;
  }

  try {
    // Get the current market from the store or use the default
    const currentMarket = getCurrentMarket() || FORMATTED_MARKETS.UK;
    const defaultMarket = FORMATTED_MARKETS.UK;
    
    // Store the current market ID for reference
    currentMarketId = currentMarket.id;

    // Get configuration from centralized constants
    const { clientId, organization, domain } = COMMERCE_LAYER_CONFIG;

    if (!clientId) {
      throw new Error('Missing required configuration: COMMERCE_LAYER_CLIENT_ID');
    }

    console.log('[CommerceLayer] Configuring with organization:', organization);
    
    const config = {
      // Required configuration
      clientId,
      endpoint: `https://${organization}.${domain}`,
      scope: defaultMarket.scope,
      market: defaultMarket.id,
      currency: defaultMarket.currency,
      location: defaultMarket.countryCode,
      
      // UI customization
      primary: '#5850ec',
      favicon: '/favicon.ico',
      
      // URLs
      returnUrl: `${window.location.origin}/checkout`,
      cartUrl: `${window.location.origin}/cart`,
      checkoutUrl: `${window.location.origin}/checkout`,
      
      // Feature flags
      testMode: import.meta.env.DEV,
      debug: import.meta.env.DEV,
      
      // Callbacks
      onReady: () => {
        console.log('[CommerceLayer] SDK initialized successfully');
        isInitialized = true;
        initializationInProgress = false;
        
        // Dispatch a custom event when the SDK is ready
        const event = new CustomEvent('cl:ready', { 
          detail: { 
            config: {
              ...window.commercelayerConfig,
              clientId: '***' // Don't expose the client ID in logs
            },
            sdk: window.commercelayer
          } 
        });
        window.dispatchEvent(event);
      },
      onError: (error) => {
        console.error('[CommerceLayer] SDK initialization error:', error);
        isInitialized = false;
        initializationInProgress = false;
        
        // Dispatch a custom event for the error
        const event = new CustomEvent('cl:error', { 
          detail: { 
            error: 'SDK initialization error',
            details: error,
            type: 'sdk_initialization_error'
          } 
        });
        window.dispatchEvent(event);
      }
    };
    
    // Store the configuration in a global variable
    window.commercelayerConfig = config;
    console.log('[CommerceLayer] Configuration set up successfully');
    
    // Initialize the SDK if it's already loaded
    if (window.commercelayer) {
      console.log('[CommerceLayer] SDK already loaded, initializing...');
      initializeSDK(config);
    } else {
      console.log('[CommerceLayer] SDK not yet loaded, it will be initialized when loaded');
    }
    
    return config;
  } catch (error) {
    console.error('[CommerceLayer] Error in configureCommerceLayer:', error);
    isInitialized = false;
    initializationInProgress = false;
    
    // Dispatch a custom event for the error
    const event = new CustomEvent('cl:error', { 
      detail: { 
        error: 'Failed to configure Commerce Layer',
        details: error.message || error,
        type: 'configuration_error'
      } 
    });
    window.dispatchEvent(event);
    
    throw error; // Re-throw to allow error handling upstream
  }
};

// Track if we've already tried to initialize
// Note: initialization states are now managed at the top of the file

// Initialize Commerce Layer configuration
export const initializeCommerceLayer = () => {
  if (!isBrowser) {
    console.warn('[CommerceLayer] Not running in browser environment');
    return Promise.resolve();
  }

  if (initializationInProgress) {
    console.log('[CommerceLayer] Initialization already in progress, waiting...');
    return new Promise((resolve, reject) => {
      const checkInitialization = () => {
        if (isInitialized) {
          resolve();
        } else if (!initializationInProgress) {
          // If initialization failed, reject the promise
          reject(new Error('Previous initialization attempt failed'));
        } else {
          setTimeout(checkInitialization, 50);
        }
      };
      checkInitialization();
    });
  }

  // If already initialized, resolve immediately
  if (isInitialized) {
    console.log('[CommerceLayer] Already initialized');
    return Promise.resolve();
  }

  // If we've already attempted to initialize and failed, reject
  if (initializationAttempted) {
    const error = new Error('Initialization already attempted, please check for errors');
    console.warn('[CommerceLayer]', error.message);
    return Promise.reject(error);
  }

  console.log('[CommerceLayer] Initializing...');
  
  // Set initialization flags
  initializationInProgress = true;
  initializationAttempted = true;
  
  return new Promise((resolve, reject) => {
    try {
      // Set up a one-time event listener for the ready event
      const onReady = (event) => {
        console.log('[CommerceLayer] SDK initialized successfully');
        isInitialized = true;
        initializationInProgress = false;
        
        // Dispatch a custom event for the successful initialization
        const readyEvent = new CustomEvent('cl:initialized', {
          detail: {
            timestamp: new Date().toISOString(),
            market: currentMarketId,
            config: { ...(window.commercelayerConfig || {}) }
          }
        });
        window.dispatchEvent(readyEvent);
        
        // Clean up event listeners
        window.removeEventListener('cl:ready', onReady);
        window.removeEventListener('cl:error', onError);
        
        resolve();
      };
      
      // Set up a one-time event listener for errors
      const onError = (event) => {
        console.error('[CommerceLayer] Error initializing SDK:', event.detail);
        isInitialized = false;
        initializationInProgress = false;
        
        // Dispatch a custom event for the error
        const errorEvent = new CustomEvent('cl:initialization:error', {
          detail: {
            error: 'Failed to initialize Commerce Layer SDK',
            details: event.detail,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(errorEvent);
        
        // Clean up event listeners
        window.removeEventListener('cl:ready', onReady);
        window.removeEventListener('cl:error', onError);
        
        reject(new Error('Failed to initialize Commerce Layer SDK'));
      };
      
      // Add event listeners
      window.addEventListener('cl:ready', onReady, { once: true });
      window.addEventListener('cl:error', onError, { once: true });
      
      // Configure and initialize the SDK
      console.log('[CommerceLayer] Configuring Commerce Layer...');
      
      // Check if SDK is already loaded
      if (window.commercelayer) {
        console.log('[CommerceLayer] SDK already loaded, reinitializing...');
        initializeSDK(window.commercelayerConfig);
      } else {
        // Load the SDK script
        console.log('[CommerceLayer] Loading SDK script...');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@commercelayer/sdk@latest/dist/commercelayer.umd.production.min.js';
        script.crossOrigin = 'anonymous';
        script.async = true;
        
        script.onload = () => {
          console.log('[CommerceLayer] SDK script loaded successfully');
          if (typeof window.commercelayer === 'undefined') {
            const error = new Error('CommerceLayer object not found after script load');
            console.error('[CommerceLayer]', error.message);
            
            const errorEvent = new CustomEvent('cl:initialization:error', {
              detail: {
                error: 'SDK Load Error',
                details: 'The SDK script loaded but the CommerceLayer object is not available.',
                timestamp: new Date().toISOString()
              }
            });
            window.dispatchEvent(errorEvent);
            
            reject(error);
            return;
          }
          
          // Initialize the SDK with the current configuration
          initializeSDK(window.commercelayerConfig);
        };
        
        script.onerror = (error) => {
          console.error('[CommerceLayer] Error loading SDK script:', error);
          const errorEvent = new CustomEvent('cl:initialization:error', {
            detail: {
              error: 'SDK Load Error',
              details: 'Failed to load the Commerce Layer SDK script',
              timestamp: new Date().toISOString()
            }
          });
          window.dispatchEvent(errorEvent);
          
          reject(new Error('Failed to load Commerce Layer SDK'));
        };
        
        // Add the script to the document
        document.head.appendChild(script);
      }
    } catch (error) {
      console.error('[CommerceLayer] Error in initialization:', error);
      isInitialized = false;
      initializationInProgress = false;
      
      // Dispatch a custom event for the error
      const errorEvent = new CustomEvent('cl:initialization:error', {
        detail: {
          error: 'Unexpected error during initialization',
          details: error.message || error,
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(errorEvent);
      
      reject(error);
    }
    
  });
};

// Helper function to initialize the SDK
const initializeSDK = (config) => {
  if (!isBrowser) {
    console.warn('[CommerceLayer] Cannot initialize SDK: Not in browser environment');
    return;
  }

  try {
    console.log('[CommerceLayer] Initializing SDK with config:', {
      ...config,
      clientId: '***' // Don't log the full client ID
    });
    
    // Initialize the SDK
    window.commercelayer.init({
      clientId: config.clientId,
      endpoint: config.endpoint,
      scope: config.scope,
      market: config.market,
      currency: config.currency,
      location: config.location,
      primary: config.primary,
      favicon: config.favicon,
      returnUrl: config.returnUrl,
      cartUrl: config.cartUrl,
      checkoutUrl: config.checkoutUrl,
      testMode: config.testMode,
      debug: config.debug,
      onReady: () => {
        console.log('[CommerceLayer] SDK ready');
        isInitialized = true;
        initializationInProgress = false;
        
        // Dispatch a custom event when the SDK is ready
        const event = new CustomEvent('cl:ready', { 
          detail: { 
            config: {
              ...config,
              clientId: '***' // Don't expose the client ID in logs
            },
            sdk: window.commercelayer
          } 
        });
        window.dispatchEvent(event);
      },
      onError: (error) => {
        console.error('[CommerceLayer] SDK error:', error);
        isInitialized = false;
        initializationInProgress = false;
        
        // Dispatch a custom event for the error
        const event = new CustomEvent('cl:error', { 
          detail: { 
            error: 'SDK initialization error',
            details: error,
            type: 'sdk_initialization_error'
          } 
        });
        window.dispatchEvent(event);
      }
    });
    
    console.log('[CommerceLayer] SDK initialization started');
  } catch (error) {
    console.error('[CommerceLayer] Error initializing SDK:', error);
    isInitialized = false;
    initializationInProgress = false;
    
    // Dispatch a custom event for the error
    const event = new CustomEvent('cl:error', { 
      detail: { 
        error: 'Failed to initialize SDK',
        details: error.message || error,
        type: 'sdk_initialization_error'
      } 
    });
    window.dispatchEvent(event);
    
    throw error; // Re-throw to allow error handling upstream
  }
};

/**
 * Update the market scope for the Commerce Layer SDK
 * @param {string} marketId - The market ID to switch to (can be in format 'market:id:xxx' or just 'xxx')
 * @returns {Promise} A promise that resolves when the market scope has been updated
 */
export const updateMarketScope = (marketId) => {
  if (!isBrowser) {
    const error = new Error('Not running in browser environment');
    console.warn('[CommerceLayer]', error.message);
    return Promise.reject(error);
  }

  if (!marketId) {
    const error = new Error('No market ID provided');
    console.warn('[CommerceLayer]', error.message);
    return Promise.reject(error);
  }

  // Format the market ID if needed
  const formattedMarketId = marketId.startsWith('market:id:') ? marketId : `market:id:${marketId}`;
  
  // If we're already on this market, no need to do anything
  if (currentMarketId === formattedMarketId) {
    console.log(`[CommerceLayer] Already on market: ${formattedMarketId}`);
    return Promise.resolve(FORMATTED_MARKETS[Object.keys(FORMATTED_MARKETS).find(key => 
      FORMATTED_MARKETS[key].id === formattedMarketId || 
      FORMATTED_MARKETS[key].scope === formattedMarketId
    )]);
  }
  
  console.log(`[CommerceLayer] Updating market scope to: ${formattedMarketId}`);

  // Find the market configuration in FORMATTED_MARKETS
  const marketKey = Object.keys(FORMATTED_MARKETS).find(key => {
    const market = FORMATTED_MARKETS[key];
    return (
      market.id === formattedMarketId || 
      market.scope === formattedMarketId ||
      market.id === marketId ||
      market.scope === marketId ||
      market.id.endsWith(marketId) ||
      market.scope.endsWith(marketId) ||
      key.toLowerCase() === marketId.toLowerCase() ||
      key.toLowerCase() === marketId.replace('market:id:', '').toLowerCase()
    );
  });

  if (!marketKey) {
    const error = new Error(`Market not found: ${formattedMarketId}`);
    console.error('[CommerceLayer]', error.message);
    
    // Log available markets for debugging
    console.log('[CommerceLayer] Available markets:', Object.entries(FORMATTED_MARKETS).map(([key, m]) => ({
      key,
      id: m.id,
      scope: m.scope,
      currency: m.currency,
      countryCode: m.countryCode
    })));
    
    // Dispatch a custom event for the error
    const event = new CustomEvent('cl:error', { 
      detail: { 
        error: 'Market not found',
        details: error.message,
        marketId: formattedMarketId,
        type: 'market_not_found',
        availableMarkets: Object.entries(FORMATTED_MARKETS).reduce((acc, [key, m]) => ({
          ...acc,
          [key]: {
            id: m.id,
            scope: m.scope,
            currency: m.currency,
            countryCode: m.countryCode
          }
        }), {})
      } 
    });
    window.dispatchEvent(event);
    
    return Promise.reject(error);
  }

  const market = FORMATTED_MARKETS[marketKey];
  
  // Update the current market ID
  const previousMarketId = currentMarketId;
  currentMarketId = market.id;
  
  // Update the configuration with the formatted market data
  window.commercelayerConfig = {
    ...(window.commercelayerConfig || {}),
    scope: market.scope,
    market: market.id,
    currency: market.currency,
    location: market.countryCode
  };

  console.log(`[CommerceLayer] Updated config for market: ${marketKey}`, {
    scope: market.scope,
    market: market.id,
    currency: market.currency,
    location: market.countryCode
  });

  // If SDK is already initialized, reinitialize it with the new scope
  if (isInitialized && window.commercelayer) {
    console.log('[CommerceLayer] Reinitializing SDK with new market scope');
    
    // Store the current state
    const wasInitialized = isInitialized;
    
    // Clear any existing SDK state
    try {
      window.commercelayer.destroy();
      console.log('[CommerceLayer] Previous SDK instance destroyed');
    } catch (error) {
      console.warn('[CommerceLayer] Error destroying previous SDK instance:', error);
    } finally {
      // Reset initialization state
      isInitialized = false;
      initializationInProgress = false;
    }
    
    // Initialize with the new configuration
    return new Promise((resolve, reject) => {
      try {
        // Set up a one-time event listener for the ready event
        const onReady = (event) => {
          console.log('[CommerceLayer] SDK reinitialized with new market scope');
          // Dispatch a market changed event
          const changeEvent = new CustomEvent('cl:market:changed', {
            detail: {
              previousMarketId,
              currentMarketId: market.id,
              market
            }
          });
          window.dispatchEvent(changeEvent);
          
          window.removeEventListener('cl:ready', onReady);
          resolve(market);
        };
        
        // Set up a one-time event listener for errors
        const onError = (event) => {
          console.error('[CommerceLayer] Error reinitializing SDK:', event.detail);
          // Revert the market ID if there was an error
          currentMarketId = previousMarketId;
          window.removeEventListener('cl:error', onError);
          reject(new Error(`Failed to reinitialize SDK with new market scope: ${event.detail?.details || 'Unknown error'}`));
        };
        
        window.addEventListener('cl:ready', onReady, { once: true });
        window.addEventListener('cl:error', onError, { once: true });
        
        // Initialize the SDK with the new configuration
        console.log('[CommerceLayer] Initializing SDK with new market scope:', market.scope);
        initializeSDK(window.commercelayerConfig);
      } catch (error) {
        console.error('[CommerceLayer] Error in market scope update:', error);
        // Revert the market ID if there was an error
        currentMarketId = previousMarketId;
        reject(error);
      }
    });
  }
  
  // If SDK is not initialized yet, just resolve with the market
  return Promise.resolve(market);
};

/**
 * Update the currency for the Commerce Layer SDK
 * @param {string} currency - The currency code to switch to (e.g., 'USD', 'EUR', 'GBP')
 * @returns {Promise} A promise that resolves when the currency has been updated
 */
export const updateCurrency = (currency) => {
  if (!isBrowser) {
    const error = new Error('Not running in browser environment');
    console.warn('[CommerceLayer]', error.message);
    return Promise.reject(error);
  }

  if (!currency) {
    const error = new Error('No currency provided');
    console.warn('[CommerceLayer]', error.message);
    return Promise.reject(error);
  }

  console.log(`[CommerceLayer] Updating currency to: ${currency}`);

  try {
    // Ensure we have a config
    if (!window.commercelayerConfig) {
      console.warn('[CommerceLayer] Config not found, initializing...');
      configureCommerceLayer();
    }

    const config = window.commercelayerConfig;
    
    // Only update if the currency has changed
    if (config.currency === currency) {
      console.log('[CommerceLayer] Currency already set to:', currency);
      return Promise.resolve();
    }

    // Store the previous currency
    const previousCurrency = config.currency;
    
    // Update the currency in the config
    console.log(`[CommerceLayer] Updating currency from ${previousCurrency} to ${currency}`);
    
    // Update the configuration
    window.commercelayerConfig = {
      ...config,
      currency: currency.toUpperCase() // Ensure uppercase for consistency
    };

    // If SDK is already initialized, update it
    if (isInitialized && window.commercelayer) {
      console.log('[CommerceLayer] Updating SDK with new currency');
      
      // Update the currency in the DOM for the SDK to pick up
      document.documentElement.setAttribute('data-cl-currency', currency);
      
      return new Promise((resolve, reject) => {
        try {
          // Set up a one-time event listener for the currency change
          const onCurrencyChanged = (event) => {
            console.log(`[CommerceLayer] Currency updated to: ${currency}`);
            // Dispatch a currency changed event
            const changeEvent = new CustomEvent('cl:currency:changed', {
              detail: {
                previousCurrency,
                currentCurrency: currency,
                market: currentMarketId
              }
            });
            window.dispatchEvent(changeEvent);
            
            window.removeEventListener('cl:currency:change', onCurrencyChanged);
            resolve();
          };
          
          // Set up a one-time event listener for errors
          const onError = (event) => {
            console.error('[CommerceLayer] Error updating currency:', event.detail);
            window.removeEventListener('cl:error', onError);
            reject(new Error(`Failed to update currency: ${event.detail?.details || 'Unknown error'}`));
          };
          
          window.addEventListener('cl:currency:change', onCurrencyChanged, { once: true });
          window.addEventListener('cl:error', onError, { once: true });
          
          // Update the SDK
          if (window.commercelayer?.update) {
            window.commercelayer.update({
              currency: currency
            });
          } else {
            // If update is not available, reinitialize the SDK
            console.log('[CommerceLayer] SDK update method not available, reinitializing...');
            initializeSDK(window.commercelayerConfig);
          }
        } catch (error) {
          console.error('[CommerceLayer] Error in currency update:', error);
          reject(error);
        }
      });
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('[CommerceLayer] Error updating currency:', error);
    
    // Dispatch a custom event for the error
    const event = new CustomEvent('cl:error', { 
      detail: { 
        error: 'Failed to update currency',
        details: error.message || error,
        type: 'currency_update_error',
        currency
      } 
    });
    window.dispatchEvent(event);
    
    return Promise.reject(error);
  }
};

/**
 * Get the current market configuration
 * @returns {Promise<Object>} A promise that resolves with the current market configuration
 */
export const getCurrentMarket = () => {
  if (!isBrowser) {
    const error = new Error('Not running in browser environment');
    console.warn('[CommerceLayer]', error.message);
    return Promise.reject(error);
  }

  // If we have a current market ID, use that
  if (currentMarketId) {
    const marketKey = Object.keys(FORMATTED_MARKETS).find(key => 
      FORMATTED_MARKETS[key].id === currentMarketId || 
      FORMATTED_MARKETS[key].scope === currentMarketId
    );
    
    if (marketKey) {
      const market = FORMATTED_MARKETS[marketKey];
      return Promise.resolve({
        ...market,
        key: marketKey,
        label: market.label || market.name || marketKey
      });
    }
  }

  // Fall back to the config if available
  if (window.commercelayerConfig?.market) {
    const marketId = window.commercelayerConfig.market;
    const formattedMarketId = marketId.startsWith('market:id:') ? marketId : `market:id:${marketId}`;
    
    const marketKey = Object.keys(FORMATTED_MARKETS).find(key => {
      const market = FORMATTED_MARKETS[key];
      return market.id === formattedMarketId || market.scope === formattedMarketId;
    });
    
    if (marketKey) {
      const market = FORMATTED_MARKETS[marketKey];
      currentMarketId = market.id; // Update the current market ID
      return Promise.resolve({
        ...market,
        key: marketKey,
        label: market.label || market.name || marketKey
      });
    }
  }
  
  // If no market is found, return the default UK market
  const defaultMarket = FORMATTED_MARKETS.UK;
  if (defaultMarket) {
    currentMarketId = defaultMarket.id;
    return Promise.resolve({
      ...defaultMarket,
      key: 'UK',
      label: defaultMarket.label || defaultMarket.name || 'UK'
    });
  }
  
  // If we still don't have a market, return an error
  const error = new Error('No market configuration found');
  console.error('[CommerceLayer]', error.message);
  
  // Log available markets for debugging
  console.log('[CommerceLayer] Available markets:', Object.entries(FORMATTED_MARKETS).map(([key, m]) => ({
    key,
    id: m.id,
    scope: m.scope,
    currency: m.currency,
    countryCode: m.countryCode
  })));
  
  // Dispatch a custom event for the error
  const event = new CustomEvent('cl:error', { 
    detail: { 
      error: 'No market configuration found',
      details: 'Failed to determine the current market',
      type: 'market_not_found',
      availableMarkets: Object.entries(FORMATTED_MARKETS).reduce((acc, [key, m]) => ({
        ...acc,
        [key]: {
          id: m.id,
          scope: m.scope,
          currency: m.currency,
          countryCode: m.countryCode
        }
      }), {})
    } 
  });
  window.dispatchEvent(event);
  
  return Promise.reject(error);
};
