import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, any>>({});
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Collect all Commerce Layer related environment variables
    const envs = {
      COMMERCE_LAYER_CLIENT_ID: import.meta.env.COMMERCE_LAYER_CLIENT_ID,
      COMMERCE_LAYER_CLIENT_SECRET: '***REDACTED***',
      COMMERCE_LAYER_DOMAIN: import.meta.env.COMMERCE_LAYER_DOMAIN,
      COMMERCE_LAYER_ORGANIZATION: import.meta.env.COMMERCE_LAYER_ORGANIZATION,
      COMMERCE_LAYER_EU_SCOPE: import.meta.env.COMMERCE_LAYER_EU_SCOPE,
      COMMERCE_LAYER_UK_SCOPE: import.meta.env.COMMERCE_LAYER_UK_SCOPE,
      COMMERCE_LAYER_EU_SKU_LIST_ID: import.meta.env.COMMERCE_LAYER_EU_SKU_LIST_ID,
      COMMERCE_LAYER_UK_SKU_LIST_ID: import.meta.env.COMMERCE_LAYER_UK_SKU_LIST_ID,
      API_URL: import.meta.env.API_URL
    };
    
    setEnvVars(envs);
  }, []);

  const testToken = async () => {
    setLoading(true);
    setError('');
    try {
      const clientId = import.meta.env.COMMERCE_LAYER_CLIENT_ID;
      const clientSecret = import.meta.env.COMMERCE_LAYER_CLIENT_SECRET;
      const scope = import.meta.env.COMMERCE_LAYER_EU_SCOPE;

      if (!clientId || !clientSecret || !scope) {
        throw new Error('Missing required environment variables');
      }

      console.log('Making token request with:', {
        clientId: clientId ? '***REDACTED***' : 'MISSING',
        scope,
        endpoint: 'https://auth.commercelayer.io/oauth/token'
      });

      const response = await fetch('https://auth.commercelayer.io/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SethHaus-Debug/1.0'
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: scope
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error_description || 'Failed to get token');
      }
      
      setToken(data.access_token || 'Token received (not shown)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Token test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Commerce Layer Authentication Test</h2>
        <div className="space-y-4">
          <button
            onClick={testToken}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Token Endpoint'}
          </button>
          
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          {token && (
            <div className="p-4 bg-green-100 text-green-700 rounded-md">
              <p className="font-semibold">Success!</p>
              <p>Token: {token}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
