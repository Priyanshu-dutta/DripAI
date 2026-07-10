import { IProductRepository } from '../IProductRepository';
import { RawProviderProduct } from '../../../types/product';
import { StyleBlueprint } from '../../../types/blueprint';
import { SearchAdapterFactory } from '../adapters/SearchAdapterFactory';
import { SearchQueryBuilder } from './SearchQueryBuilder';
import { CacheFactory } from '../cache/CacheFactory';
import { ProductNormalizer } from '../ProductNormalizer';
import { ProductConsolidator } from './ProductConsolidator';
import { LocalProductProvider } from './LocalProductProvider';

/**
 * Live Google Shopping Search API Provider.
 * Integrates ISearchAdapter and resolves queries dynamically with caching, retries,
 * parallel execution, and automatic local fallback mechanisms.
 */
export class SearchApiProvider implements IProductRepository {
  public readonly name = 'SearchApiProvider';
  private blueprint?: StyleBlueprint;
  private localFallback = new LocalProductProvider();

  constructor(blueprint?: StyleBlueprint) {
    this.blueprint = blueprint;
  }

  public async fetchRawProducts(filters?: {
    category?: 'top' | 'bottom' | 'shoes' | 'accessories';
    gender?: string;
  }): Promise<RawProviderProduct[]> {
    // 1. Log Environment Loaded Stage
    const serperKey = process.env.SERPER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    console.log(`[SearchApiProvider] Environment loaded check - Serper Key present: ${!!serperKey}, Gemini Key present: ${!!geminiKey}, Supabase URL present: ${!!supabaseUrl}`);

    // 2. Log Active Provider Stage
    console.log(`[SearchApiProvider] Active provider selected: "${this.name}"`);

    if (!this.blueprint) {
      console.warn('[SearchApiProvider] No blueprint provided in constructor. Falling back to local catalog.');
      return this.localFallback.fetchRawProducts(filters);
    }

    const adapter = SearchAdapterFactory.getAdapter();
    const cache = CacheFactory.getCache();

    // Query only requested category, or run all categories in parallel if blank
    const categories: ('top' | 'bottom' | 'shoes' | 'accessories')[] = filters?.category
      ? [filters.category]
      : ['top', 'bottom', 'shoes', 'accessories'];

    try {
      const searchPromises = categories.map(async (cat) => {
        // 3. Log Search Query Generated Stage
        const query = SearchQueryBuilder.buildQuery(this.blueprint!, cat);
        console.log(`[SearchApiProvider] Search query generated for category "${cat}": "${query}"`);

        const cacheKey = `searchapi_${adapter.name}_${query.replace(/\s+/g, '_')}`;

        // Caching layer check
        const cachedResults = await cache.get<RawProviderProduct[]>(cacheKey);
        if (cachedResults) {
          console.log(`[SearchApiProvider] Cache hit for query: "${query}"`);
          return cachedResults;
        }

        // Fetch from Search Engine Adapter
        console.log(`[SearchApiProvider] Cache miss. Invoking search adapter: "${adapter.name}"`);
        const rawResults = await adapter.searchShopping(query);

        // Convert the search adapter's raw results to RawProviderProduct formats
        const parsedProducts: RawProviderProduct[] = rawResults.map((item: any) => {
          const { price, currency } = typeof item.price === 'string'
            ? ProductNormalizer.parsePriceAndCurrency(item.price)
            : { price: Number(item.price) || 0, currency: 'INR' };

          return {
            sku: item.id || `serper-${Math.random().toString(36).substring(2, 9)}`,
            title: item.title,
            brand: item.source || 'Generic',
            category: cat,
            price,
            currency,
            image: item.imageUrl || '',
            retailer: item.source || 'Merchant',
            retailerUrl: item.link || '#',
            rating: typeof item.rating === 'number' ? item.rating : 4.2,
            availability: item.inStock !== undefined ? !!item.inStock : true
          };
        });

        // Cache parsed results for 5 minutes (300 seconds)
        await cache.set(cacheKey, parsedProducts, 300);
        return parsedProducts;
      });

      // Run parallel category queries
      const aggregatedResults = await Promise.all(searchPromises);
      const allRawProducts = aggregatedResults.flat();

      if (allRawProducts.length === 0) {
        console.warn('[SearchApiProvider] Live search yielded zero results. Falling back to local data.');
        return this.localFallback.fetchRawProducts(filters);
      }

      // 4. Log Products Normalized Stage
      const normalizedProducts = ProductNormalizer.normalizeBatch(allRawProducts);
      console.log(`[SearchApiProvider] Products normalized. Count: ${normalizedProducts.length}`);

      // Consolidate products to find lowest prices across retailers
      const consolidatedProducts = ProductConsolidator.consolidate(normalizedProducts);
      console.log(`[SearchApiProvider] Products consolidated. Count: ${consolidatedProducts.length} (deduplicated from ${normalizedProducts.length})`);

      // Map back to RawProviderProducts to preserve Stateless API routes interfaces
      const finalRawProducts: RawProviderProduct[] = consolidatedProducts.map(p => ({
        id: p.id,
        sku: p.id,
        title: p.title,
        brand: p.brand,
        category: p.category,
        color: p.color,
        style: p.style,
        fit: p.fit,
        season: p.season,
        gender: p.gender,
        occasionTags: p.occasionTags,
        price: p.price,
        currency: p.currency,
        image: p.image,
        retailer: p.retailer,
        retailerUrl: p.retailerUrl,
        rating: p.rating,
        availability: p.availability,
        alternateOffers: p.alternateOffers as any // passes alternateOffers to normalized objects
      }));

      return finalRawProducts;

    } catch (err: any) {
      console.warn(`[SearchApiProvider] Query execution failed: "${err.message || err}". Falling back to LocalProductProvider.`);
      return this.localFallback.fetchRawProducts(filters);
    }
  }
}
