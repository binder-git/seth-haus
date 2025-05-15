import React from "react";
import { shippingOptions } from "utils/shipping-options";
import { Market } from "utils/types";

interface ShippingInfoProps {
  selectedMarket: Market;
}

export const ShippingInfo = ({ selectedMarket }: ShippingInfoProps) => {
  const marketOptions = shippingOptions.filter(option => 
    option.markets.includes(selectedMarket)
  );
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Shipping Options</h2>
        <p className="text-muted-foreground mb-8">
          Available shipping methods for {selectedMarket === "UK" ? "United Kingdom" : "European Union"}
        </p>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden divide-y">
          {marketOptions.map((option) => (
            <div key={option.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h3 className="font-semibold text-lg">{option.name}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                  <p className="text-sm mt-1">Estimated delivery: <span className="font-medium">{option.estimatedDelivery}</span></p>
                </div>
                <div className="mt-3 sm:mt-0 sm:text-right">
                  <p className="text-lg font-bold">
                    {selectedMarket === "UK" ? "£" : "€"}{option.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Shipping Policy</h4>
          {selectedMarket === "UK" ? (
            <p className="text-sm text-blue-700">
              All orders are processed within 1-2 business days. Delivery times are estimated and not guaranteed. 
              Free shipping is available on orders over £85 for U.K. customers.
            </p>
          ) : (
            <p className="text-sm text-blue-700">
              All orders are processed within 1-2 business days. Delivery times are estimated and not guaranteed. 
              Free shipping is available on orders over €85 for EU customers.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};