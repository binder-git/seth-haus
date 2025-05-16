import { create } from 'zustand';
;
// Create the Zustand store
export const useMarketStore = create((set) => ({
    market: { name: 'UK', region: 'uk', id: 'uk-market', countryCode: 'GB', currencyCode: 'GBP' },
    setMarket: (market) => set({ market }),
}));
