# Netlify Functions for Commerce Layer

## Overview
These Netlify Functions provide secure authentication and API interaction for the Commerce Layer integration, built with TypeScript and ES Modules.

## Available Functions

### `commerce-layer-auth`

#### Purpose
Handles authentication with Commerce Layer's OAuth server and provides access tokens.

#### Key Features
- Secure token generation
- Environment variable validation
- Error handling
- CORS support

#### Environment Variables
Required environment variables:
- `COMMERCE_LAYER_CLIENT_ID`: Your Commerce Layer client ID
- `COMMERCE_LAYER_CLIENT_SECRET`: Your Commerce Layer client secret
- `COMMERCE_LAYER_ORGANIZATION`: Your Commerce Layer organization slug
- `COMMERCE_LAYER_DOMAIN`: Your Commerce Layer domain (e.g., `commercelayer.io`)

### `featured-products`

#### Purpose
Fetches featured products from Commerce Layer based on the specified market.

#### Key Features
- Market-based product filtering
- Product data transformation
- Error handling
- CORS support

#### Query Parameters
- `market`: The market code (e.g., `eu` or `uk`)

## Development

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Environment Setup
Create a `.env` file in the root of the functions directory with the required environment variables.

## Deployment

This project is configured to be deployed to Netlify. The build script will automatically compile the TypeScript code to JavaScript in the `dist` directory.

## TypeScript

This project uses TypeScript with strict type checking. The configuration is in `tsconfig.json`.

## ES Modules

All code is written using ES Modules syntax. The `package.json` has `"type": "module"` set to enable this.

## Linting and Formatting

This project includes TypeScript and ESLint for code quality. Run the following commands:

```bash
# Check for TypeScript errors
npm run typecheck

# Lint the code
npm run lint
```
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
