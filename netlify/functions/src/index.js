"use strict";
// This is the entry point for Netlify Functions
// Export all function handlers here
Object.defineProperty(exports, "__esModule", { value: true });
exports.featuredProducts = void 0;
var featured_products_handler_1 = require("./featured-products-handler");
Object.defineProperty(exports, "featuredProducts", { enumerable: true, get: function () { return featured_products_handler_1.handler; } });
// Export other handlers
// export { handler as validateToken } from './validate-token';
// export { handler as commerceLayerAuth } from './commerce-layer-auth';
//# sourceMappingURL=index.js.map