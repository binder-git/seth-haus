# Netlify Functions for Commerce Layer Authentication

## Overview
These Netlify Functions provide secure authentication and API interaction for the Commerce Layer integration.

## Authentication Function

### `commerce_layer_auth.py`

#### Purpose
Provides comprehensive authentication and token validation for Commerce Layer integration.

#### Key Features
- Token validation against Commerce Layer
- Secure handling of authentication credentials
- Flexible user information extraction
- Market-based access control

#### Environment Variables
Required environment variables:
- `COMMERCE_LAYER_TOKEN_VALIDATION_URL`: Commerce Layer token validation endpoint
- Other Commerce Layer authentication credentials

#### Dependencies
- `requests`: For making HTTP requests
- `PyJWT`: For JWT token handling
- `python-dotenv`: For environment variable management

### Usage

1. Ensure all required environment variables are set
2. Include the function in your Netlify configuration
3. Call the function with a Bearer token in the Authorization header

### Error Handling
- Returns appropriate HTTP status codes for different authentication scenarios
- Provides detailed error messages for debugging

### Next Steps
- Integrate with frontend authentication flow
- Implement comprehensive test cases
- Add additional logging and monitoring

## Functions

### `commerce-layer-auth.ts`
- **Purpose**: Obtain an access token from Commerce Layer using client credentials
- **Endpoint**: `/.netlify/functions/commerce-layer-auth`
- **Method**: POST
- **Authentication**: Uses environment variables for secure credential management

## Environment Variables
Required environment variables:
- `COMMERCE_LAYER_CLIENT_ID`
- `COMMERCE_LAYER_CLIENT_SECRET`
- `COMMERCE_LAYER_ORGANIZATION`
- `COMMERCE_LAYER_DOMAIN`

## Local Development
1. Install dependencies:
   ```bash
   npm install
   ```

2. Build TypeScript:
   ```bash
   npm run build
   ```

## Deployment
Functions are automatically deployed with Netlify when pushed to the main branch.

## Security Notes
- Never commit sensitive credentials to the repository
- Use Netlify's environment variable management for sensitive information
- Tokens are handled securely and not exposed to the client
