import React from "react";
import { Link } from "react-router-dom";
import { Mail, ExternalLink } from "lucide-react";

export interface Props {
  className?: string;
}

export const SimpleFooter = ({ className = "" }: Props) => {
  return (
    <footer className={`bg-muted/30 border-t border-border py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-foreground">Seth's Triathlon Haus</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Your premier destination for specialized triathlon gear that doesn't exist. 
              We've been not delivering excellence since never.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Shop (Theoretically)</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products?category=swim" className="text-base text-muted-foreground hover:text-primary transition-colors">
                  Swim Gear
                </Link>
              </li>
              <li>
                <Link to="/products?category=bike" className="text-base text-muted-foreground hover:text-primary transition-colors">
                  Bike Equipment
                </Link>
              </li>
              <li>
                <Link to="/products?category=run" className="text-base text-muted-foreground hover:text-primary transition-colors">
                  Running Gear
                </Link>
              </li>
              <li>
                <Link to="/products?category=triathlon" className="text-base text-muted-foreground hover:text-primary transition-colors">
                  Triathlon Suits
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">More information</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:hello@seth.haus" 
                  className="text-base text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send me an email
                </a>
              </li>
              <li>
                <Link 
                  to="/faq-page" 
                  className="text-base text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <span className="text-base text-muted-foreground">
                  Shipping Info (Spoiler: It's not happening)
                </span>
              </li>
              <li>
                <a 
                  href="https://www.linkedin.com/in/sethbindernagel/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  More of Seth's work
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-base text-muted-foreground">
            &copy; {new Date().getFullYear()} Seth's Triathlon Haus. All rights reserved (to nothing).
          </p>
          <p className="text-base text-muted-foreground italic">
            "Where dreams come to shop and leave empty-handed."
          </p>
        </div>
      </div>
    </footer>
  );
};
