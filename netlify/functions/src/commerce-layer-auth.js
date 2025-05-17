"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const axios_1 = __importStar(require("axios"));
// Secure retrieval of environment variables
const getEnvVar = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};
// Centralized error response function
const createErrorResponse = (statusCode, message, details) => ({
    statusCode,
    body: JSON.stringify({
        message,
        details: details instanceof Error ? details.message : details
    }),
    headers: {
        'Content-Type': 'application/json'
    }
});
const handler = async (event, context) => {
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
        const tokenResponse = await axios_1.default.post('https://auth.commercelayer.io/oauth/token', {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }, {
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
    }
    catch (error) {
        console.error('Authentication error:', error);
        // Handle Axios specific errors
        if (error instanceof axios_1.AxiosError) {
            return createErrorResponse(error.response?.status || 500, 'Commerce Layer Authentication Failed', error.response?.data);
        }
        // Generic error handling
        return createErrorResponse(500, 'Authentication failed', error instanceof Error ? error.message : 'Unknown error');
    }
};
exports.handler = handler;
//# sourceMappingURL=commerce-layer-auth.js.map