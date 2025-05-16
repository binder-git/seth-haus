"use strict";
// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});
// Mock the brain module
jest.mock('brain', () => ({
    __esModule: true,
    default: {
        get_commerce_layer_products: jest.fn(),
        get_product_details: jest.fn(),
    },
}));
// Mock the sonner toast
jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
    },
}));
