import React from "react";

export interface Props {
  className?: string;
}

export const TriHero = ({ className = "" }: Props) => {
  // Handle image loading errors with fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (!target.src.includes('no-image.jpg')) {
      target.src = '/migrated-assets/no-image.jpg';
    }
  };

  return (
    <section className={`relative w-full overflow-hidden ${className}`}>
      {/* Background image */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 to-gray-800/60 z-0">
        <img 
          src="/migrated-assets/hero-triathlon.jpg"
          alt="Triathlon hero background"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          onError={handleImageError}
          loading="eager"
        />
      </div>
      
      {/* Content - Standardized padding */}
      <div className="container mx-auto px-4 md:px-6 py-20 md:py-32 relative z-10">
        <div className="max-w-3xl">
          {/* Updated Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Where Nothing&apos;s For Sale
          </h1>
          {/* Updated Subtitle - split into two paragraphs */}
          <p className="text-xl text-white/90 mb-4">
            Welcome to the world&apos;s most exclusive triathlon shop. So exclusive, you can&apos;t buy a thing. This is a proof-of-concept I built with AI.{" "}
            <a 
              href="mailto:hello@seth.haus" 
              className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Ask me anything.
            </a>
          </p>
          <p className="text-xl text-white/90 mb-8">
            Browse the finest imaginary gear for swim, bike, and run. Fill your cart with dreams. Payment options accepted: applause, disbelief.
          </p>
        </div>
      </div>
    </section>
  );
};
