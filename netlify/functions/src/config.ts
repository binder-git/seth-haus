// netlify/functions/src/config.ts
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // This function runs on the server (via Netlify Functions).
  // It can securely access process.env variables.
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Adjust for production security if needed
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    },
    body: JSON.stringify({
      // Only expose non-sensitive, public configuration needed by the frontend
      organization: process.env.COMMERCE_LAYER_ORGANIZATION,
      domain: process.env.COMMERCE_LAYER_DOMAIN,
      appTitle: process.env.APP_TITLE,
      // DO NOT expose CLIENT_ID, CLIENT_SECRET, SCOPES, SKU_LIST_IDs here!
    })
  };
};