import { create } from 'zustand';
import { Market } from '@/types';

// Market configurations
const MARKETS = {
  UK: {
    name: 'UK' as const,
    region: 'uk' as const,
    id: 'market:id:vjzmJhvEDo', // UK market ID
    countryCode: 'GB',
    currencyCode: 'GBP',
    scope: 'market:id:vjzmJhvEDo',
    skuListId: 'nVvZIAKxGn' // UK SKU list ID
  },
  EU: {
    name: 'EU' as const,
    region: 'eu' as const,
    id: 'market:id:qjANwhQrJg', // EU market ID
    countryCode: 'EU',
    currencyCode: 'EUR',
    scope: 'market:id:qjANwhQrJg',
    skuListId: 'JjEpIvwjey' // EU SKU list ID
  }
} as const;

// Define the store state and actions
interface MarketState {
  market: Market;
  markets: typeof MARKETS;
  setMarket: (market: Market) => void;
  switchMarket: (marketName: keyof typeof MARKETS) => void;
}

// Create the Zustand store
export const useMarketStore = create<MarketState>((set, get) => ({
  market: MARKETS.UK, // Default to UK market
  markets: MARKETS,
  setMarket: (market) => {
    // Update the market in the store
    set({ market });
  },
  switchMarket: (marketName) => {
    const market = MARKETS[marketName];
    if (market) {
      // Update the market in the store
      set({ market });
    }
  },
}));
