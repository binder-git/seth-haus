import React from "react";
import { useOutletContext } from "react-router-dom";
import { TriHero } from "components/TriHero";
import { Categories } from "components/Categories";
import FeaturedProducts from "components/FeaturedProducts";
import { ShippingInfo } from "components/ShippingInfo";
import { AppContextType } from "./App";

const HomePage: React.FC = () => {
  const { selectedMarket } = useOutletContext<AppContextType>();
  
  return (
    <main className="flex-grow">
      <section>
        <TriHero />
        <Categories />
        <FeaturedProducts />
        <ShippingInfo selectedMarket={selectedMarket} />
      </section>
    </main>
  );
};

export default HomePage;
