// Common type definitions for Netlify Functions

// Type definitions
type HandlerResponse = {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
};

type HandlerEvent = {
  httpMethod: string;
  path: string;
  queryStringParameters?: Record<string, string | undefined>;
  headers: Record<string, string | undefined>;
  // Add other properties as needed
};

type HandlerContext = {
  // Add context properties as needed
};

// Type definitions for Commerce Layer
type Price = {
  formatted_amount?: string | null;
  currency_code?: string | null;
  [key: string]: unknown;
};

type Image = {
  url?: string | null;
  [key: string]: unknown;
};

type CLSKU = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  prices?: Array<Price | null> | null;
  images?: Array<Image | null> | null;
  [key: string]: unknown;
};

type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  [key: string]: unknown;
};

export type {
  HandlerResponse,
  HandlerEvent,
  HandlerContext,
  Price,
  Image,
  CLSKU,
  TokenResponse
};
