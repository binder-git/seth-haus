/// <reference types="react" />

/**
 * Type declarations for Commerce Layer drop-in.js components
 * @see https://commercelayer.github.io/drop-in.js/
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Cart component
      'cl-cart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      
      // Add to cart component
      'cl-add-to-cart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        code?: string;
        'data-cart'?: boolean;
      };

      // Price component (v2)
      'cl-price': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        code?: string;
        class?: string;
      };

      // Price amount component (v2)
      'cl-price-amount': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: 'price' | 'compare-at';
        class?: string;
      };
    }
  }

  // Commerce Layer global configuration
  interface Window {
    commercelayerConfig?: {
      clientId: string;
      organization: string;
      domain?: string;
      scope: string;
      debug?: string;
    };
  }
}

export {};
