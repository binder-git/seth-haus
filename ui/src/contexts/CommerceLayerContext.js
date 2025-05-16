import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useCallback } from 'react';
import CommerceLayerAuthService from '../services/commerce-layer-auth-service';
import CommerceLayer from '@commercelayer/sdk';
import { z } from 'zod';
// Environment Variable Validation Schema
const CommerceLayerEnvSchema = z.object({
    COMMERCE_LAYER_CLIENT_ID: z.string().min(1, 'Commerce Layer Client ID is required'),
    COMMERCE_LAYER_ORGANIZATION: z.string().min(1, 'Commerce Layer Organization is required'),
    COMMERCE_LAYER_MARKET_ID_EU: z.string().min(1, 'EU Market ID is required'),
    COMMERCE_LAYER_MARKET_ID_UK: z.string().min(1, 'UK Market ID is required')
});
// Validate environment variables
const validateEnvVariables = (env) => {
    const requiredKeys = [
        'COMMERCE_LAYER_CLIENT_ID',
        'COMMERCE_LAYER_ORGANIZATION',
        'COMMERCE_LAYER_MARKET_ID_EU',
        'COMMERCE_LAYER_MARKET_ID_UK'
    ];
    const isValidEnv = (vars) => {
        if (typeof vars !== 'object' || vars === null)
            return false;
        const envObj = vars;
        return requiredKeys.every(key => Object.prototype.hasOwnProperty.call(envObj, key) &&
            typeof envObj[key] === 'string');
    };
    let envToValidate;
    if (env && typeof env === 'object' && env !== null) {
        const potentialEnv = env;
        if (isValidEnv(potentialEnv)) {
            envToValidate = potentialEnv;
        }
        else {
            throw new Error('Invalid environment variables');
        }
    }
    else {
        // Attempt to get environment from import.meta or process
        let importMetaEnv;
        let processEnv;
        // Safely check import.meta
        if (typeof globalThis !== 'undefined' && 'import' in globalThis) {
            const importMeta = globalThis.import.meta;
            if (importMeta && 'env' in importMeta) {
                importMetaEnv = importMeta.env;
            }
        }
        // Use Vite's import.meta.env
        processEnv = import.meta.env;
        const candidateEnv = importMetaEnv || processEnv;
        if (!candidateEnv || !isValidEnv(candidateEnv)) {
            throw new Error('No valid environment variables found');
        }
        envToValidate = candidateEnv;
    }
    const envSchema = CommerceLayerEnvSchema;
    const result = envSchema.safeParse(envToValidate);
    if (!result.success) {
        throw new Error(`Invalid environment variables: ${result.error.message}`);
    }
    return result.data;
};
// Environment configuration
const ENV = {
    COMMERCE_LAYER_CLIENT_ID: import.meta.env.COMMERCE_LAYER_CLIENT_ID || '',
    COMMERCE_LAYER_CLIENT_SECRET: import.meta.env.COMMERCE_LAYER_CLIENT_SECRET || '',
    COMMERCE_LAYER_ORGANIZATION: import.meta.env.COMMERCE_LAYER_ORGANIZATION || '',
    COMMERCE_LAYER_DOMAIN: import.meta.env.COMMERCE_LAYER_DOMAIN || 'commercelayer.io',
    COMMERCE_LAYER_EU_SCOPE: import.meta.env.COMMERCE_LAYER_EU_SCOPE || 'market:qjANwhQrJg',
    COMMERCE_LAYER_UK_SCOPE: import.meta.env.COMMERCE_LAYER_UK_SCOPE || 'market:vjzmJhvEDo',
    COMMERCE_LAYER_EU_SKU_LIST_ID: import.meta.env.COMMERCE_LAYER_EU_SKU_LIST_ID || 'JjEpIvwjey',
    COMMERCE_LAYER_UK_SKU_LIST_ID: import.meta.env.COMMERCE_LAYER_UK_SKU_LIST_ID || 'nVvZIAKxGn',
};
// Validate environment variables
const requiredVars = [
    'COMMERCE_LAYER_CLIENT_ID',
    'COMMERCE_LAYER_CLIENT_SECRET',
    'COMMERCE_LAYER_ORGANIZATION',
    'COMMERCE_LAYER_EU_SCOPE',
    'COMMERCE_LAYER_UK_SCOPE'
];
requiredVars.forEach(varName => {
    if (!ENV[varName]) {
        console.error(`Missing required environment variable: ${varName}`);
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});
// Helper function to get environment variables
const getEnvVar = (key) => {
    // Directly use the key as we're using non-prefixed environment variables
    const fullKey = `COMMERCE_LAYER_${key}`;
    return import.meta.env[key] || ENV[fullKey] || '';
};
export const CommerceLayerContext = createContext({
    client: CommerceLayer({
        organization: ENV.COMMERCE_LAYER_ORGANIZATION,
        accessToken: 'test_token'
    }),
    currentMarket: { id: ENV.COMMERCE_LAYER_EU_SCOPE, name: 'EU Market', region: 'eu' },
    markets: {
        eu: { id: ENV.COMMERCE_LAYER_EU_SCOPE, name: 'EU Market', region: 'eu' },
        uk: { id: ENV.COMMERCE_LAYER_UK_SCOPE, name: 'UK Market', region: 'uk' }
    },
    switchMarket: () => { }
});
export const CommerceLayerProvider = ({ children }) => {
    // Validate and extract environment variables
    const envVars = validateEnvVariables(import.meta.env);
    // Configure markets
    const markets = {
        eu: {
            id: envVars.COMMERCE_LAYER_MARKET_ID_EU,
            name: 'European Market',
            region: 'eu'
        },
        uk: {
            id: envVars.COMMERCE_LAYER_MARKET_ID_UK,
            name: 'UK Market',
            region: 'uk'
        }
    };
    const [currentMarket, setCurrentMarket] = useState(markets.eu);
    const client = CommerceLayer({
        organization: ENV.COMMERCE_LAYER_ORGANIZATION,
        accessToken: CommerceLayerAuthService.getStoredToken()?.access_token || 'test_token'
    });
    const switchMarket = useCallback((market) => {
        setCurrentMarket(market);
    }, []);
    return (_jsx(CommerceLayerContext.Provider, { value: {
            client,
            currentMarket,
            markets,
            switchMarket
        }, children: children }));
};
export { useCommerceLayer } from '../hooks/useCommerceLayer';
