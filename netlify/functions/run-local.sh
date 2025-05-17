#!/bin/bash

# Set environment variables
export NODE_OPTIONS='--experimental-modules --es-module-specifier-resolution=node'

export COMMERCE_LAYER_CLIENT_ID="3uRXduKWJ8qr4G7lUBdrC1GFormL5Qa-RbFy-eCIGtA"
export COMMERCE_LAYER_CLIENT_SECRET="REMOVED"
export COMMERCE_LAYER_ORGANIZATION="seth-s-triathlon-haus"
export COMMERCE_LAYER_DOMAIN="commercelayer.io"

# Market configurations
export EU_MARKET_SCOPE="qjANwhQrJg"
export UK_MARKET_SCOPE="vjzmJhvEDo"
export EU_SKU_LIST_ID="JjEpIvwjey"
export UK_SKU_LIST_ID="nVvZIAKxGn"

# Build the TypeScript code first
npm run build

# Run the function with a test event using ES Modules
node --loader ts-node/esm --experimental-specifier-resolution=node -e "
import { featuredProducts } from './dist/featured-products.js';

const event = {
  httpMethod: 'GET',
  queryStringParameters: {
    market: 'eu'  // Test with EU market
  },
  headers: {}
};

// Call the handler
featuredProducts(event)
  .then(result => {
    console.log('Success:');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('Error:');
    console.error(error);
  });
"

echo "\nTo test the UK market, run:"
echo "node --loader ts-node/esm --experimental-specifier-resolution=node -e \"
import { featuredProducts } from './dist/featured-products.js';

const event = {
  httpMethod: 'GET',
  queryStringParameters: { market: 'uk' },
  headers: {}
};

featuredProducts(event)
  .then(console.log)
  .catch(console.error);
"
