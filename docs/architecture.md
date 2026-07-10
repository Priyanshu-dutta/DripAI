# Drip AI System Architecture

This document provides a comprehensive overview of the design patterns, layer divisions, and module layouts that build **Drip AI**.

---

## 🏗️ Directory Blueprint Map

```
drip-ai/
├── docs/                      # Architecture & Engine Specifications
│   ├── architecture.md        # [This File] General layout overview
│   ├── api-flow.md            # Sequential trace map of a style request
│   ├── provider-architecture.md # Provider factory & adapter boundaries
│   └── recommendation-engine.md # Scoring metrics, weights & constraints
├── src/
│   ├── app/                   # Next.js App Router (Pages, Layouts & Endpoints)
│   │   ├── api/v1/style/      # Ingestion API route for prompt styling
│   │   ├── layout.tsx         # Root document shell
│   │   └── page.tsx           # Dashboard workspace client view
│   ├── components/            # Shared components (shared, stylist, trial-closet, ui)
│   ├── config/                # Environment variables loaders
│   ├── hooks/                 # Custom React hooks (useAuth, useTrialCloset)
│   ├── services/              # Decoupled business logic layers
│   │   └── intelligence/      # Style Recommendation Engine & Providers
│   │       ├── cache/         # Cache abstraction (Memory / Redis)
│   │       ├── adapters/      # Search engine wrappers (Serper / ValueSerp)
│   │       └── providers/     # Product catalog providers & Factories
│   ├── styles/                # Global and workspace-level stylesheets
│   ├── types/                 # Unified TypeScript interfaces
│   └── utils/                 # Utilities (errors, loggers, sanitizers)
```

---

## 🛠️ Key Architectural Constraints

1. **Strict Statelessness**:
   All core calculation pipelines—including preference extraction, product retrieval, normalization, consolidation, scoring, and coordinate generation—remain completely stateless. No thread-level variables are cached, ensuring scale-out readiness.

2. **Decoupled Repositories**:
   The recommendation calculation engines speak only with the generic repository boundary (`IProductRepository`). They are completely isolated from external Scrapers, Google Shopping APIs, Affiliate registries, or Databases.

3. **Fallback Resiliency**:
   If an external search, scraper, or database query throws a connection exception, timeout limit, or rate limit threshold, the repository layer automatically registers the failure, catches the exception, and falls back to the static `LocalProductProvider` dataset to preserve availability.
