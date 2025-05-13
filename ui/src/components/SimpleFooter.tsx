import React from "react";
import { Link } from "react-router-dom"; // <-- Import Link

export interface Props {
  className?: string;
}

export const SimpleFooter = ({ className = "" }: Props) => {
  return (
    <footer className={`bg-gray-100 py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Seth's Triathlon Haus</h3>
            <p className="text-sm text-muted-foreground">
              Your premier destination for specialized triathlon gear, catering to swimmers, cyclists, and runners alike.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Swim</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Bike</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Run</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Triathlon</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><a href="mailto:hello@seth.haus" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              <li><Link to="/faq-page" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>

            </ul>
          </div>
          

        </div>
        
        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Seth's Triathlon Haus. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
};