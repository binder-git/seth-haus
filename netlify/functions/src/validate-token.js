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
        const validationResponse = await axios_1.default.get(`https://${organization}.${domain}/oauth/introspect`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json'
            }
        });
        // Process validation response
        const validationData = validationResponse.data;
        const tokenValidation = {
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
    }
    catch (error) {
        console.error('Token validation error:', error);
        // Handle Axios specific errors
        if (error instanceof axios_1.AxiosError) {
            return createErrorResponse(error.response?.status || 500, 'Token Validation Failed', error.response?.data);
        }
        // Generic error handling
        return createErrorResponse(500, 'Token validation failed', error instanceof Error ? error.message : 'Unknown error');
    }
};
exports.handler = handler;
//# sourceMappingURL=validate-token.js.map