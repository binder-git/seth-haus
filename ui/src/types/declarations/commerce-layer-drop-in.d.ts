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
    }
  }
}

export {};
