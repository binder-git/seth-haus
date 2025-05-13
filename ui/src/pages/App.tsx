import React from "react";
import { useMarketStore } from "utils/market-store"; // Import the global store
import SimpleHeader from "components/SimpleHeader";
import { TriHero } from "components/TriHero";
import { Categories } from "components/Categories";
import { FeaturedProducts } from "components/FeaturedProducts";
import { ShippingInfo } from "components/ShippingInfo";
import { SimpleFooter } from "components/SimpleFooter";
import { Market } from "utils/types";

export default function App() {
  // Use the global market store
  const { market, setMarket } = useMarketStore();

  return (
    <>
      {/* <SimpleHeader /> No longer needed, AppProvider handles Header */}
      <main className="flex-grow">
        {/* Previous comment: Pass selectedMarket from global store, remove onMarketChange */}
        <TriHero />
        <Categories />
        <FeaturedProducts selectedMarket={market} />
        <ShippingInfo selectedMarket={market} />
      </main>
      {/* <SimpleFooter /> No longer needed, AppProvider handles Footer */}
    </>
  );
}
