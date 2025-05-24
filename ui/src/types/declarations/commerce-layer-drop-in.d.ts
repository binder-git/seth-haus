/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'cl-cart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: 'mini' | 'full';
        class?: string;
      };
      
      'cl-cart-link': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        class?: string;
        target?: string;
      };

      'cl-cart-count': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        class?: string;
      };

      'cl-cart-total': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        class?: string;
      };
      
      'cl-add-to-cart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        code?: string;
        class?: string;
        'data-cart'?: boolean;
      };

      'cl-price': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        code?: string;
        class?: string;
      };

      'cl-price-amount': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: 'price' | 'compare-at';
        class?: string;
      };
    }
  }
}

export {};
