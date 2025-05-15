import React from "react";
import { useMarketStore } from "utils/market-store"; // Import the global store
import { TriHero } from "components/TriHero";
import { Categories } from "components/Categories";
import { Market } from '@/utils/types';
import FeaturedProducts from "components/FeaturedProducts";
import { ShippingInfo } from "components/ShippingInfo";
import { CommerceLayerProvider } from "@/contexts/CommerceLayerContext";

export default function App() {
  // Use the global market store
  const { market, setMarket } = useMarketStore();

  // Ensure market is always defined
  const selectedMarket = market || {
    name: 'UK',
    id: 'uk-market',
    countryCode: 'GB',
    currencyCode: 'GBP'
  };

  return (
    <CommerceLayerProvider>
      {/* <SimpleHeader /> No longer needed, AppProvider handles Header */}
      <main className="flex-grow">
        {/* Previous comment: Pass selectedMarket from global store, remove onMarketChange */}
        <section>
          <TriHero />
          <Categories />
          <FeaturedProducts selectedMarket={selectedMarket} />
          <ShippingInfo selectedMarket={selectedMarket} />
        </section>
      </main>
      {/* <SimpleFooter /> No longer needed, AppProvider handles Footer */}
    </CommerceLayerProvider>
  );
}
