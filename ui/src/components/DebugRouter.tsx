import { useEffect } from 'react';
import { useLocation, useNavigationType, useMatches } from 'react-router-dom';

// Helper to safely get component name
function getComponentName(element: any): string {
  if (!element) return 'null';
  if (typeof element === 'string' || typeof element === 'number' || typeof element === 'boolean') {
    return String(element);
  }
  if (typeof element === 'object' && 'type' in element) {
    return (element as any).type?.name || 'Anonymous';
  }
  return 'Unknown';
}

export function DebugRouter() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const matches = useMatches();

  useEffect(() => {
    console.log('[Router] Navigation:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      key: location.key,
      navigationType
    });

    console.log('[Router] Current route matches:', matches.map(match => ({
      id: match.id,
      pathname: match.pathname,
      params: match.params,
      data: match.data,
      handle: match.handle
    })));
  }, [location, matches, navigationType]);

  return null;
}
