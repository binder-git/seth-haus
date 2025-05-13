import { create } from 'zustand';
import { Market } from './types';

interface MarketState {
  market: Market; // Renamed from selectedMarket
  setMarket: (market: Market) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  market: 'UK', // Renamed from selectedMarket, Default to UK market
  setMarket: (market) => set({ market: market }), // Update market
}));
