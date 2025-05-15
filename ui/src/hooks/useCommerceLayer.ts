import { useContext, useState, useCallback } from 'react';
import { CommerceLayerContext } from '../contexts/CommerceLayerContext';
import CommerceLayerAuthService from '../services/commerce-layer-auth-service';

export function useCommerceLayer() {
  const context = useContext(CommerceLayerContext);
  if (!context) {
    throw new Error('useCommerceLayer must be used within a CommerceLayerProvider');
  }

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async () => {
    try {
      const token = await CommerceLayerAuthService.getValidToken();
      if (token) {
        setIsAuthenticated(true);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Authentication failed', error);
      setIsAuthenticated(false);
      return null;
    }
  }, []);

  return {
    ...context,
    isAuthenticated,
    login,
  };
}
