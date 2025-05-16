export const API = {
    baseUrl: import.meta.env.API_URL || '/api',
    organization: import.meta.env.COMMERCE_LAYER_ORGANIZATION || 'seth-s-triathlon-haus',
    domain: `${import.meta.env.COMMERCE_LAYER_ORGANIZATION || 'seth-s-triathlon-haus'}.commercelayer.io`,
    markets: {
        EU: {
            scopeId: import.meta.env.COMMERCE_LAYER_EU_SCOPE?.replace('market:', '') || 'qjANwhQrJg',
            skuListId: import.meta.env.COMMERCE_LAYER_EU_SKU_LIST_ID || 'JjEpIvwjey'
        },
        UK: {
            scopeId: import.meta.env.COMMERCE_LAYER_UK_SCOPE?.replace('market:', '') || 'vjzmJhvEDo',
            skuListId: 'nVvZIAKxGn'
        }
    }
};
