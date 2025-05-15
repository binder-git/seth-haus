// React type declarations
import React from 'react';

// Type aliases for React types
type ReactNode = React.ReactNode;
type ReactElement = React.ReactElement;
type Lazy<T extends React.ComponentType<any>> = React.LazyExoticComponent<T>;
type Suspense = React.ComponentType<{
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}>;

// Extended JSX Intrinsic Elements
declare namespace JSX {
  interface IntrinsicElements {
    'h1': React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    'h2': React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    'h3': React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    'a': React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    'aside': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'img': React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
    'cl-add-to-cart': any; // Placeholder for Commerce Layer custom element
  }
}

// Extend button props to include custom variants
declare module 'react' {
  interface ButtonHTMLAttributes<T> {
    variant?: string;
    size?: string;
  }
}
