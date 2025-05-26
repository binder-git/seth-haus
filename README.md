```markdown
# Seth's Triathlon Haus

A prototype ecommerce platform for triathlon gear, built entirely with AI coding tools using React, the Commerce Layer API and micro frontends, and Netlify.

## About This Project

This is a **proof-of-concept** ecommerce site that I built to challenge myself to see if I could build a robust ecommerce web application using AI coding tools and never consulting a real developer. While I'm not a developermy role at Commerce Layer inspired me to create a real-world example of how our platform can transform any website into a fully-functional online store.

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
- [Acknowledgments](#acknowledgments)

## Commerce Layer Integration

This project showcases several key Commerce Layer features:

### Drop-in Library & Micro Frontends

This site uses Commerce Layer's **Drop-in JavaScript library** to embed commerce functionality with minimal coding:

- **`cl-price` components** - Dynamic pricing that updates based on market selection
- **`cl-cart` functionality** - Commerce Layer's hosted (mini) cart and checkout with real-time updates  
- **`cl-add-to-cart` buttons** - Seamless product addition

### Multi-Market Commerce

- **UK Market** - GBP pricing and UK-specific placeholder shipping messaging and pricing 
- **EU Market** - EUR pricing and European placeholder shipping messaging and pricing
- **Dynamic market switching** with automatic price/currency updates

### Commerce Layer's Micro Frontend Architecture

This demonstrates how micro frontends extend the composable nature of microservices to the user interface. Each commerce component operates independently while seamlessly integrating with the React application.

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
- ✅ **Secure checkout** - PCI-compliant hosted checkout flow (though no actual purchases)

## Development

This project uses **Netlify Dev** for local development:

### Install dependencies

```bash
npm install
cd ui \&\& npm install
```

### Start local development (includes functions)

```bash
netlify dev
```

### The site will be available at http://localhost:8888

## Project Structure

```bash
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

```javascript

window.commercelayerConfig = {
clientId: "your-client-id",
scope: "market:id:your-market-id",
domain: "commercelayer.io"
};
```

## Learning Outcomes

Building this prototype taught me:

- **Prompt engineering** for AI coding tools, see the list of tools I used in the acknowledgments section
- **Headless commerce architecture** and its benefits
- **Micro frontend patterns** and component composition  
- **API integration** and data transformation
- **Modern React development** with TypeScript
- **Deployment automation** with Netlify

## Live Demo

Visit the live site: **[seth.haus](https://seth.haus)**

*Remember: This is a demo site. You can add items to cart and explore the checkout flow, but no actual transactions will be processed.*

## Acknowledgments

I would not have been able to build this site with the following AI-coding tools:

- **Databutton** - for the initial code generation
- **Windsurf** - for code refactoring and AI coding assistance
- **Claude** - for guiding me through Commerce Layer CLI commands, code refactoring, debugging build processes, and final AI coding assistance
- **Peplexity** - Prompt management and interface, plus access to Claude 4.0, and image generation
- **Netlify** - Deployment and hosting and AI build debugging tools

Built with [Commerce Layer](https://commercelayer.io) and [Netlify](https://www.netlify.com).

---

*This project demonstrates the power of Commerce Layer's micro frontend approach, Netlify Functions and build deployement processes and hosting, showing how developers can add enterprise-grade commerce functionality to any website with minimal code.*
```