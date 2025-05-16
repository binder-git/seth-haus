import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import axios, { AxiosError } from 'axios';

// Define interface for token validation response
interface TokenValidationResponse {
  valid: boolean;
  user?: {
    id: string;
    email?: string;
    scope?: string;
  };
  error?: string;
}

// Secure retrieval of environment variables
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

// Centralized error response function
const createErrorResponse = (statusCode: number, message: string, details?: any) => ({
  statusCode,
  body: JSON.stringify({ 
    message, 
    details: details instanceof Error ? details.message : details 
  }),
  headers: {
    'Content-Type': 'application/json'
  }
});

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method Not Allowed');
  }

  try {
    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};
    const { access_token } = body;

    if (!access_token) {
      return createErrorResponse(400, 'Missing access token');
    }

    // Extract credentials from environment variables
    const organization = getEnvVar('COMMERCE_LAYER_ORGANIZATION');
    const domain = getEnvVar('COMMERCE_LAYER_DOMAIN');

    // Validate token with Commerce Layer
    const validationResponse = await axios.get(
      `https://${organization}.${domain}/oauth/introspect`, 
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json'
        }
      }
    );

    // Process validation response
    const validationData = validationResponse.data;
    const tokenValidation: TokenValidationResponse = {
      valid: validationData.active === true,
      user: validationData.active ? {
        id: validationData.sub || 'unknown',
        email: validationData.email,
        scope: validationData.scope
      } : undefined
    };

    return {
      statusCode: 200,
      body: JSON.stringify(tokenValidation),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.error('Token validation error:', error);
    
    // Handle Axios specific errors
    if (error instanceof AxiosError) {
      return createErrorResponse(
        error.response?.status || 500, 
        'Token Validation Failed', 
        error.response?.data
      );
    }

    // Generic error handling
    return createErrorResponse(
      500, 
      'Token validation failed', 
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
