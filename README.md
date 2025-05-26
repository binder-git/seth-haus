```markdown
# Seth's Triathlon Haus

A prototype e-commerce platform for triathlon gear, built to explore Commerce Layer's capabilities and micro frontend architecture.

## About This Project

This is a **proof-of-concept** e-commerce site that I built to challenge myself and demonstrate Commerce Layer's powerful headless commerce capabilities. While I'm not a professional developer, my role at Commerce Layer inspired me to create a real-world example of how our platform can transform any website into a fully functional online store.

> **Note: This is a demonstration site - no actual products are for sale!**

## Table of Contents

- [Commerce Layer Integration](#commerce-layer-integration)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Development](#development)
- [Project Structure](#project-structure)
- [Commerce Layer Configuration](#commerce-layer-configuration)
- [Learning Outcomes](#learning-outcomes)
- [Live Demo](#live-demo)

## Commerce Layer Integration

This project showcases several key Commerce Layer features:

### Drop-in Library & Micro Frontends

This site uses Commerce Layer's **Drop-in JavaScript library** to embed commerce functionality with minimal coding:

- **`cl-price` components** - Dynamic pricing that updates based on market selection
- **`cl-cart` functionality** - Shopping cart with real-time updates  
- **`cl-add-to-cart` buttons** - Seamless product addition
- **Hosted checkout** - Secure, PCI-compliant checkout flow

### Multi-Market Commerce

- **UK Market** - GBP pricing and UK-specific shipping
- **EU Market** - EUR pricing and European shipping options
- **Dynamic market switching** with automatic price/currency updates

### Micro Frontend Architecture

This demonstrates how micro frontends extend the composable nature of microservices to the user interface - each commerce component operates independently while integrating seamlessly with the React application.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Commerce**: Commerce Layer Drop-in Library + API
- **Functions**: Netlify Functions (TypeScript)
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Hosting**: Netlify with Cloudflare DNS
- **Deployment**: Automatic via GitHub integration

## Key Features

- ✅ **Responsive design** - Works seamlessly on desktop and mobile
- ✅ **Market switching** - Dynamic currency and pricing updates
- ✅ **Product catalog** - Real Commerce Layer SKUs and inventory
- ✅ **Shopping cart** - Persistent cart with Commerce Layer state management
- ✅ **Secure checkout** - Hosted checkout flow (though no actual purchases)

## Development

This project uses **Netlify Dev** for local development:

```

# Install dependencies

npm install
cd ui \&\& npm install

# Start local development (includes functions)

netlify dev

# The site will be available at http://localhost:8888

```

## Project Structure

```

.
├── netlify/
│   └── functions/           \# API endpoints for Commerce Layer integration
│       ├── product-listing.ts    \# Product catalog API
│       └── commerce-layer-auth.ts \# Authentication handler
├── ui/                     \# React frontend application
│   ├── src/
│   │   ├── components/     \# React components
│   │   ├── pages/         \# Route components
│   │   └── utils/         \# Commerce Layer utilities
│   └── public/            \# Static assets
├── _redirects             \# Netlify routing configuration
└── netlify.toml          \# Build configuration

```

## Commerce Layer Configuration

The site connects to Commerce Layer using the Drop-in library configuration:

```

window.commercelayerConfig = {
clientId: "your-client-id",
scope: "market:id:your-market-id",
domain: "commercelayer.io"
};

```

This enables the transformation of any plain HTML page into an enterprise-grade static commerce website, with almost no coding required.

## Learning Outcomes

Building this prototype taught me:

- **Headless commerce architecture** and its benefits
- **Micro frontend patterns** and component composition  
- **API integration** and data transformation
- **Modern React development** with TypeScript
- **Deployment automation** with Netlify

## Live Demo

Visit the live site: **[seth.haus](https://seth.haus)**

*Remember: This is a demonstration site. You can add items to cart and explore the checkout flow, but no actual transactions will be processed.*

## Acknowledgments

Built with [Commerce Layer](https://commercelayer.io) - the composable commerce platform that makes any website shoppable.

---

*This project demonstrates the power of Commerce Layer's micro frontend approach, showing how developers can add enterprise-grade commerce functionality to any website with minimal code.*
```