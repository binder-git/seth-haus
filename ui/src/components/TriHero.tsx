import React from "react";

export interface Props {
  className?: string;
}

export const TriHero = ({ className = "" }: Props) => {
  return (
    <section className={`relative w-full overflow-hidden ${className}`}>
      {/* Background image */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 to-gray-800/60 z-0"> {/* Reduced opacity from /90 to /70 */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center mix-blend-overlay"></div>
      </div>
      
      {/* Content - Standardized padding */}
      <div className="container mx-auto px-4 md:px-6 py-20 md:py-32 relative z-10">
        <div className="max-w-3xl">
          {/* Updated Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Where Nothing’s For Sale</h1>
          {/* Updated Subtitle - split into two paragraphs */}
          <p className="text-xl text-white/90 mb-4"> {/* Added mb-4 for spacing between paragraphs */}
            Welcome to the world’s most exclusive triathlon shop. So exclusive, you can’t buy a thing. This is a proof-of-concept I built with AI. <a href="mailto:hello@seth.haus" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Ask me anything.</a>
          </p>
          <p className="text-xl text-white/90 mb-8">
            Browse the finest imaginary gear for swim, bike, and run. Fill your cart with dreams. Payment options accepted: applause, disbelief.
          </p>
          {/* Buttons removed */}
          {/* Market selector removed from here */}
        </div>
      </div>
    </section>
  );
};