// Extend Window interface to recognize Commerce Layer global objects
interface Window {
  CommerceLayer?: any;
}

// Extend JSX namespace to support Commerce Layer Web Components
declare namespace JSX {
  interface IntrinsicElements {
    'cl-cart-link': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'data-cart-type'?: string;
      },
      HTMLElement
    >;
    'cl-cart-count': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'data-cart-type'?: string;
      },
      HTMLElement
    >;
    'cl-cart': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'data-cart-type'?: string;
      },
      HTMLElement
    >;
  }
}

export {}; // Ensure this is treated as a module
