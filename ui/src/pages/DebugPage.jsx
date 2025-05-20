import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function DebugPage() {
  const location = useLocation();
  
  useEffect(() => {
    console.log('[DebugPage] Mounted at path:', location.pathname);
    return () => {
      console.log('[DebugPage] Unmounted');
    };
  }, [location.pathname]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f9ff', margin: '20px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
      <h1>Debug Page</h1>
      <p>This is a debug page at path: <code>{location.pathname}</code></p>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '4px' }}>
        <h3>Debug Information:</h3>
        <pre style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
          {JSON.stringify({
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            state: location.state,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Test Navigation:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '5px 0' }}><a href="/">Home</a></li>
          <li style={{ margin: '5px 0' }}><a href="/test">Test Page</a></li>
          <li style={{ margin: '5px 0' }}><a href="/debug?test=123">Debug Page with Query</a></li>
          <li style={{ margin: '5px 0' }}><a href="/nonexistent">Non-existent Page</a></li>
        </ul>
      </div>
    </div>
  );
}
