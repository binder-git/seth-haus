import React from "react";
import { ShippingOption } from '@/types';
import { shippingOptions } from "utils/shipping-options";
import { Market } from '@/types';
import { Truck, Clock, Info } from "lucide-react";

interface ShippingInfoProps {
  selectedMarket: Market;
}

export const ShippingInfo = ({ selectedMarket }: ShippingInfoProps) => {
  const marketOptions = shippingOptions.filter(option => 
    option.markets.includes(selectedMarket.name)
  );

  // Debug: Log the actual option IDs
  console.log('[ShippingInfo] Available options:', marketOptions.map(opt => ({ id: opt.id, name: opt.name })));

  // Add some dry humor to the shipping options
  const addHumorToOption = (option: any) => {
    // More flexible matching - check both ID and name patterns
    const getHumorKey = (option: any) => {
      const id = option.id?.toLowerCase();
      const name = option.name?.toLowerCase();
      
      if (id?.includes('standard') || name?.includes('standard')) return 'standard';
      if (id?.includes('express') || name?.includes('express')) return 'express';
      if (id?.includes('overnight') || name?.includes('overnight') || name?.includes('next day')) return 'overnight';
      if (id?.includes('free') || name?.includes('free') || option.price === 0) return 'free';
      
      return 'default';
    };

    const humorMap: { [key: string]: { description: string; delivery: string } } = {
      'standard': {
        description: 'Our most popular option. Delivery should be within 5-7 working days, but we make no promises.',
        delivery: "It's never going to arrive"
      },
      'express': {
        description: 'For when you need your imaginary gear slightly faster than never.',
        delivery: "Still not arriving, but with urgency"
      },
      'overnight': {
        description: 'Premium service for those who enjoy paying extra for the same level of disappointment.',
        delivery: "Definitely not tomorrow"
      },
      'free': {
        description: 'Free shipping! Because why charge for something that will never happen?',
        delivery: "Eventually, maybe, probably not"
      },
      'default': {
        description: 'A shipping option that exists in theory, much like everything else here.',
        delivery: "Sometime between now and never"
      }
    };

    const humorKey = getHumorKey(option);
    const humor = humorMap[humorKey];

    console.log('[ShippingInfo] Option:', option.name, 'Key:', humorKey, 'Humor found:', !!humor);

    return {
      ...option,
      description: humor.description,
      estimatedDelivery: humor.delivery
    };
  };
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Shipping Options</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Theoretical delivery methods for {selectedMarket.name === "UK" ? "United Kingdom" : "European Union"}
        </p>
        
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          {marketOptions.map((option, index) => {
            const humorOption = addHumorToOption(option);
            return (
              <div 
                key={option.id} 
                className={`p-6 hover:bg-accent/50 transition-colors ${
                  index !== marketOptions.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-xl text-foreground mb-2">{humorOption.name}</h3>
                      <p className="text-base text-muted-foreground mb-3 leading-relaxed">{humorOption.description}</p>
                      <div className="flex items-center gap-2 text-base">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Estimated delivery:</span>
                        <span className="font-medium text-foreground italic">{humorOption.estimatedDelivery}</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:text-right flex-shrink-0">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                      <p className="text-2xl font-bold text-foreground">
                        {selectedMarket.name === "UK" ? "£" : "€"}{option.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">for nothing</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 text-lg">Shipping Policy</h4>
              {selectedMarket.name === "UK" ? (
                <p className="text-base text-blue-700 dark:text-blue-300 leading-relaxed">
                  All orders are processed with the utmost care and then immediately forgotten. Delivery times are purely theoretical. 
                  Free shipping is available on orders over £85, which is quite generous considering you&apos;re getting absolutely nothing.
                </p>
              ) : (
                <p className="text-base text-blue-700 dark:text-blue-300 leading-relaxed">
                  All orders are processed with the utmost care and then immediately forgotten. Delivery times are purely theoretical. 
                  Free shipping is available on orders over €85, which is quite generous considering you&apos;re getting absolutely nothing.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
