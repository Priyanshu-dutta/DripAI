# Product Provider & Search Adapter Architecture

This document details the decoupled Provider and Adapter structures implementing Sprint 3 and 3.5.

---

## 📐 Structural Hierarchy Blueprint

```
IProductRepository (Boundary)
   └── ProductProviderFactory (Instantiates Active Provider)
         ├── LocalProductProvider (Stateless local dataset)
         ├── SearchApiProvider (Queries Shopping Search Adapters)
         │     └── ISearchAdapter (Search Engine Interface)
         │           ├── SerperSearchAdapter (Google Shopping API client)
         │           ├── ValueSerpSearchAdapter (Placeholder)
         │           └── SerpApiSearchAdapter (Placeholder)
         ├── AffiliateProvider (Placeholder for Admitad/Cuelinks feeds)
         └── RetailProvider (Placeholder for Myntra/AJIO/Zara direct APIs)
```

---

## ⚡ Abstraction Protocols

### 1. Repository Contract (`IProductRepository`)
Defines the boundary between the Style Recommendations handler and the product catalogs. Any provider must implement:
- `readonly name: string`
- `fetchRawProducts(filters): Promise<RawProviderProduct[]>`

### 2. Caching Interface (`ICache`)
Decouples providers from caching storage strategies. Any caching provider implements get/set methods:
- `InMemoryCache`: Key-value cache Map with expiration checks.
- `RedisCache`: Production wrapper allowing Redis clustering, defaulting to local cache in development.
- Resolved via `CacheFactory.getCache()`.

### 3. Search Engine Adapter (`ISearchAdapter`)
Isolates query execution from specific search providers, protecting the app from vendor pricing adjustments:
- `searchShopping(query: string): Promise<any[]>`
- **Active Adapter**: Resolved via `SearchAdapterFactory.getAdapter()` based on environment configurations.

---

## 🔀 Consolidation & Normalization

1. **Category Queries Builder**: The [SearchQueryBuilder](file:///Users/priyanshudutta/Desktop/DripAi/src/services/intelligence/providers/SearchQueryBuilder.ts) synthesizes target query strings for `top`, `bottom`, `shoes`, and `accessories` in parallel.
2. **Normalizer parsing**: Raw records are standardized through the [ProductNormalizer](file:///Users/priyanshudutta/Desktop/DripAi/src/services/intelligence/ProductNormalizer.ts) to canonical objects (color matching, price-to-currency translation, and availability checks).
3. **Price Consolidation**: The [ProductConsolidator](file:///Users/priyanshudutta/Desktop/DripAi/src/services/intelligence/providers/ProductConsolidator.ts) groups matching items by brand, title, and category. It selects the retailer offering the lowest price as primary and appends others to `alternateOffers`.

---

## 🛡️ Failure Fallback & Resiliency

All external providers are wrapped inside catch-blocks in [SearchApiProvider](file:///Users/priyanshudutta/Desktop/DripAi/src/services/intelligence/providers/SearchApiProvider.ts). If an API credentials check fails, rate limit throws, network abort controller signals timeout, or search engines return zero results, the provider catch-block handles the exception gracefully, logs a warning, and returns raw products from `LocalProductProvider`.
