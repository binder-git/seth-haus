# Seth's Triathlon Haus

A modern e-commerce platform for triathlon gear, built with React and Commerce Layer.

## Features

- Multi-market support (UK/EU)
- Commerce Layer integration
- Responsive design
- Modern UI with shadcn components
- Secure authentication

## Tech Stack

- Frontend: React/Vite
- Backend: Netlify Functions (TypeScript/ES Modules)
- E-commerce: Commerce Layer
- UI: shadcn/ui
- Hosting: Netlify

## Project Structure

```
.
├── netlify/
│   └── functions/           # Netlify Functions (TypeScript/ES Modules)
│       ├── src/            # Source code
│       │   ├── commerce-layer-auth.ts  # Authentication handler
│       │   ├── featured-products.ts    # Products API
│       │   ├── types.ts                # Shared types
│       │   └── index.ts                # Function exports
│       ├── package.json     # Dependencies and scripts
│       └── tsconfig.json   # TypeScript config
└── ui/                     # Frontend React application
    └── ...
```

## Netlify Functions

The Netlify Functions are written in TypeScript and use ES Modules for better compatibility with modern JavaScript. The functions handle:

1. **Authentication** with Commerce Layer
2. **Product data** fetching and transformation
3. **Market-specific** content delivery

### Development

To work with the Netlify Functions locally:

```bash
# Install dependencies
npm install

# Build the functions
npm run build:functions

# Run in development mode
npm run dev:functions
```

### Environment Variables

Copy `netlify/functions/env.example` to `netlify/functions/.env` and update with your Commerce Layer credentials.

## Development

1. Install dependencies:
```bash
cd ui && npm install
```

2. Start development server:
```bash
npm run dev
```

## Deployment

The site is automatically deployed to Netlify when changes are pushed to the main branch.

## License

Private repository. All rights reserved.
