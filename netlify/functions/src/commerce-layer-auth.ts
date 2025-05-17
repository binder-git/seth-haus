// Import shared types
import type {
  HandlerResponse,
  HandlerEvent,
  HandlerContext,
  TokenResponse
} from './types';

// Import dependencies
import axios from 'axios';

// Initialize axios instance for Commerce Layer API
const commerceLayerAxios = axios.create({
  baseURL: `https://${process.env.COMMERCE_LAYER_ORGANIZATION}.commercelayer.io/api`
});

// Secure retrieval of environment variables
// Helper function to get environment variables
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

// Centralized error response function
// Create an error response
const createErrorResponse = (
  statusCode: number, 
  message: string, 
  details?: unknown
): { statusCode: number; body: string; headers: Record<string, string> } => ({
  statusCode,
  body: JSON.stringify({ 
    message, 
    details: details instanceof Error ? details.message : details 
  }),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Main handler function
const commerceLayerAuthHandler = async (
  event: HandlerEvent,
  context: HandlerContext
): Promise<HandlerResponse> => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method Not Allowed');
  }

  try {
    // Extract credentials from environment variables
    const clientId = getEnvVar('COMMERCE_LAYER_CLIENT_ID');
    const clientSecret = getEnvVar('COMMERCE_LAYER_CLIENT_SECRET');
    const organization = getEnvVar('COMMERCE_LAYER_ORGANIZATION');
    const domain = getEnvVar('COMMERCE_LAYER_DOMAIN');

    // Request access token from Commerce Layer using centralized auth endpoint
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://auth.commercelayer.io/oauth/token',
      data: {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Return the token securely
    return {
      statusCode: 200,
      body: JSON.stringify({
        access_token: tokenResponse.data.access_token,
        expires_in: tokenResponse.data.expires_in,
        token_type: tokenResponse.data.token_type,
        scope: tokenResponse.data.scope
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error: any) {
    console.error('Authentication error:', error);
    
    // Handle Axios specific errors
    if (axios.isAxiosError(error)) {
      return createErrorResponse(
        error.response?.status || 500, 
        'Commerce Layer Authentication Failed', 
        error.response?.data
      );
    }

    // Generic error handling
    return createErrorResponse(
      500, 
      'Authentication failed', 
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

// Export the handler
export { commerceLayerAuthHandler as handler };
