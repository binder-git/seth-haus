import { create } from 'zustand';
import { Market } from '@/types';

// Define the store state and actions
interface MarketState {
  market: Market | undefined;
  setMarket: (market: Market) => void;
};

// Create the Zustand store
export const useMarketStore = create<MarketState>((set) => ({
  market: { name: 'UK' as const, region: 'uk' as const, id: 'uk-market', countryCode: 'GB', currencyCode: 'GBP' },
  setMarket: (market) => set({ market }),
}));
