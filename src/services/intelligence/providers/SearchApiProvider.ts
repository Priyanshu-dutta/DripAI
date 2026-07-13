import { IProductRepository } from '../IProductRepository';
import { RawProviderProduct, IntelligenceProduct } from '../../../types/product';
import { StyleBlueprint } from '../../../types/blueprint';
import { SearchAdapterFactory } from '../adapters/SearchAdapterFactory';
import { SearchQueryBuilder } from './SearchQueryBuilder';
import { CacheFactory } from '../cache/CacheFactory';
import { ProductNormalizer } from '../ProductNormalizer';
import { ProductConsolidator } from './ProductConsolidator';
import { LocalProductProvider } from './LocalProductProvider';
import { ScoringEngine } from '../ScoringEngine';

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

  /**
   * Helper to perform product validation before entries reach the Recommendation Engine (Phase 7).
   */
  private static validateProduct(p: IntelligenceProduct): boolean {
    if (!p.title || p.title === 'Unknown Item' || p.title.trim() === '') return false;
    if (!p.brand || p.brand.trim() === '') return false;
    if (!p.category) return false;

    // Stock check
    if (p.availability === false) return false;

    // Price check
    if (typeof p.price !== 'number' || isNaN(p.price) || p.price <= 0) return false;

    // Retailer URL check
    if (!p.retailerUrl || p.retailerUrl === '#' || p.retailerUrl.trim() === '') return false;
    if (!p.retailerUrl.startsWith('http://') && !p.retailerUrl.startsWith('https://')) return false;

    // Image URL check
    if (!p.image || p.image.trim() === '') return false;
    if (!p.image.startsWith('http://') && !p.image.startsWith('https://')) return false;
    if (p.image.includes('placeholder') || p.image.includes('example.com')) return false;

    return true;
  }

  /**
   * Helper to leniently filter out incompatible products (Phase 9).
   */
  private filterProducts(
    products: IntelligenceProduct[],
    blueprint: StyleBlueprint,
    totalBudget: number
  ): IntelligenceProduct[] {
    const accessoryBlacklist = [
      'cable', 'connector', 'adapter', 'rs232', 'db9', 'usb', 'charger', 'vga', 
      'hdmi', 'ethernet', 'router', 'switch', 'electronic', 'hard drive', 'ram', 
      'memory card', 'screw', 'tools', 'automotive', 'car accessory', 'phone case',
      'protective case', 'screen protector', 'tempered glass', 'cables', 'adapters',
      'plug', 'socket', 'wire', 'converters', 'converter', 'solder', 'serial'
    ];

    const bpGender = blueprint.gender ? blueprint.gender.toLowerCase().trim() : '';
    const isFemaleQuery = bpGender === 'women' || bpGender === 'female' || bpGender === 'woman';
    const isMaleQuery = bpGender === 'men' || bpGender === 'male' || bpGender === 'man';

    return products.filter((p) => {
      // 1. Gender target filter (lenient)
      if (bpGender && p.gender && p.gender !== 'unisex') {
        const prodGender = p.gender.toLowerCase();
        if (isMaleQuery && prodGender === 'women') return false;
        if (isFemaleQuery && prodGender === 'men') return false;
      }

      // 2. Accessories non-fashion electronics safeguard
      if (p.category === 'accessories') {
        const titleLower = p.title.toLowerCase();
        const brandLower = p.brand.toLowerCase();
        const hasBlacklistedWord = accessoryBlacklist.some(word => 
          titleLower.includes(word) || brandLower.includes(word)
        );
        if (hasBlacklistedWord) return false;
      }

      // 3. Strict item price budget filter: if a single item's price exceeds the total outfit budget,
      // it is impossible to fit in a coordinate under budget, so remove it as genuinely incompatible.
      if (totalBudget > 0 && p.price > totalBudget) {
        return false;
      }

      return true;
    });
  }

  public async fetchRawProducts(filters?: {
    category?: 'top' | 'bottom' | 'shoes' | 'accessories';
    gender?: string;
  }): Promise<RawProviderProduct[]> {
    const startTime = Date.now();

    const serperKey = process.env.SERPER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Safety pagination limits from configuration env
    const maxPagesPrimary = Math.max(1, parseInt(process.env.SEARCH_MAX_PAGES || '3', 10));
    const maxPagesVariation = Math.max(1, maxPagesPrimary - 1);

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

    let totalApiRequests = 0;
    let totalRawRetrieved = 0;
    const allRawProducts: RawProviderProduct[] = [];

    // Track detailed diagnostic metrics for logs
    const diagnosticQueriesGenerated: string[] = [];
    let diagnosticPagesRequestedCount = 0;

    try {
      // Set up parallel categories fetches (Phase 5)
      const searchPromises = categories.map(async (cat) => {
        // Phase 3: Intelligent Query Expansion
        const queries = SearchQueryBuilder.buildQueries(this.blueprint!, cat);
        queries.forEach(q => diagnosticQueriesGenerated.push(`(${cat}): "${q}"`));

        // Formulate pagination page tasks concurrently (Phase 4 & 5)
        const pageTasks: { query: string; page: number }[] = [];
        queries.forEach((query, queryIdx) => {
          const depth = queryIdx === 0 ? maxPagesPrimary : maxPagesVariation;
          for (let p = 1; p <= depth; p++) {
            pageTasks.push({ query, page: p });
          }
        });

        diagnosticPagesRequestedCount += pageTasks.length;

        let categoryRequestsCount = 0;
        const taskPromises = pageTasks.map(async (task) => {
          const cacheKey = `searchapi_${adapter.name}_${task.query.replace(/\s+/g, '_')}_p${task.page}`;

          // Caching layer lookups
          const cachedResults = await cache.get<RawProviderProduct[]>(cacheKey);
          if (cachedResults) {
            return cachedResults;
          }

          categoryRequestsCount++;
          // Fetch page results concurrently from adapter
          const rawResults = await adapter.searchShopping(task.query, task.page);

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

          // Cache parsed results for 5 minutes
          await cache.set(cacheKey, parsedProducts, 300);
          return parsedProducts;
        });

        const pagesResults = await Promise.all(taskPromises);
        const catProducts = pagesResults.flat();

        return {
          category: cat,
          products: catProducts,
          requestsCount: categoryRequestsCount
        };
      });

      // Run parallel category queries concurrently
      const aggregatedResults = await Promise.all(searchPromises);

      for (const res of aggregatedResults) {
        totalApiRequests += res.requestsCount;
        totalRawRetrieved += res.products.length;
        allRawProducts.push(...res.products);
      }

      if (allRawProducts.length === 0) {
        console.warn('[SearchApiProvider] Live search yielded zero results. Falling back to local data.');
        return this.localFallback.fetchRawProducts(filters);
      }

      // Phase 6: Product Normalization
      const normalizedProducts = ProductNormalizer.normalizeBatch(allRawProducts);
      const normalizedCount = normalizedProducts.length;

      // Phase 7: Product Validation
      const validatedProducts = normalizedProducts.filter(p => SearchApiProvider.validateProduct(p));
      const validatedCount = validatedProducts.length;

      // Phase 8: Product Consolidation & Deduplication
      const consolidatedProducts = ProductConsolidator.consolidate(validatedProducts);
      const consolidatedCount = consolidatedProducts.length;
      const duplicatesRemoved = validatedCount - consolidatedCount;

      // Phase 9: Filtering
      const totalBudget = this.blueprint.budget ? ScoringEngine.parseNumericBudget(this.blueprint.budget) : 0;
      const filteredProducts = this.filterProducts(consolidatedProducts, this.blueprint!, totalBudget);
      const filteredCount = filteredProducts.length;

      // Step 10 Diagnostics: Gender Counts
      const maleProductsCount = consolidatedProducts.filter(p => p.gender === 'male').length;
      const femaleProductsCount = consolidatedProducts.filter(p => p.gender === 'female').length;
      const unisexProductsCount = consolidatedProducts.filter(p => p.gender === 'unisex').length;

      const bpGender = this.blueprint.gender ? this.blueprint.gender.toLowerCase().trim() : '';
      const isFemaleQuery = bpGender === 'female' || bpGender === 'women' || bpGender === 'woman';
      const isMaleQuery = bpGender === 'male' || bpGender === 'men' || bpGender === 'man';

      const genderRemovedCount = consolidatedProducts.filter(p => {
        if (p.gender && p.gender !== 'unisex') {
          if (isMaleQuery && p.gender === 'female') return true;
          if (isFemaleQuery && p.gender === 'male') return true;
        }
        return false;
      }).length;

      const parsePromptGender = (promptText: string): 'male' | 'female' | null => {
        const promptLower = promptText.toLowerCase();
        if (promptLower.includes('women') || promptLower.includes('woman') || promptLower.includes('female') || promptLower.includes('ladies') || promptLower.includes('girl') || promptLower.includes('lady')) {
          return 'female';
        }
        if (promptLower.includes('men') || promptLower.includes('man') || promptLower.includes('male') || promptLower.includes('boy')) {
          return 'male';
        }
        return null;
      };
      const promptGenderVal = this.blueprint.promptText ? (parsePromptGender(this.blueprint.promptText) || 'unisex') : 'unisex';

      const totalTimeMs = Date.now() - startTime;

      // Phase 11: Structured Logging & Diagnostics (Including Step 10 requirements)
      console.log(`
=========================================
🔍 [SearchApiProvider] DIAGNOSTIC RETRIEVAL METRICS
=========================================
• Provider name:                  ${this.name}
• UI Selected Gender:             "${this.blueprint.uiGender || 'none'}"
• Prompt Gender Inferred:         "${promptGenderVal}"
• Gemini Extracted Gender:        "${this.blueprint.geminiGender || 'none'}"
• Final Resolved Gender:          "${this.blueprint.gender}"
• Search queries generated:       \n  - ${diagnosticQueriesGenerated.join('\n  - ')}
• Pages requested count:          ${diagnosticPagesRequestedCount}
• API requests executed (misses): ${totalApiRequests} (cache hits: ${diagnosticPagesRequestedCount - totalApiRequests})
• Raw products retrieved:         ${totalRawRetrieved}
• Products after normalization:   ${normalizedCount}
• Products after validation:      ${validatedCount} (filtered out ${normalizedCount - validatedCount} invalid products)
• Duplicates removed:             ${duplicatesRemoved} (consolidated to ${consolidatedCount})
• Male Products Retrieved:        ${maleProductsCount}
• Female Products Retrieved:      ${femaleProductsCount}
• Unisex Products Retrieved:      ${unisexProductsCount}
• Removed During Gender Filter:   ${genderRemovedCount}
• Products after filtering:       ${filteredCount} (filtered out ${consolidatedCount - filteredCount} incompatible items)
• Final products to Rec Engine:    ${filteredCount}
• Total execution time:           ${totalTimeMs}ms
=========================================
      `);

      // Map back to RawProviderProducts to match the stateless repository interface boundary
      const finalRawProducts: RawProviderProduct[] = filteredProducts.map(p => ({
        id: p.id,
        sku: p.id,
        title: p.title,
        brand: p.brand,
        category: p.category,
        color: p.color,
        style: p.style,
        fit: p.fit,
        season: p.season,
        gender: p.gender || undefined,
        occasionTags: p.occasionTags,
        price: p.price,
        currency: p.currency,
        image: p.image,
        retailer: p.retailer,
        retailerUrl: p.retailerUrl,
        rating: p.rating,
        availability: p.availability,
        alternateOffers: p.alternateOffers as any
      }));

      return finalRawProducts;

    } catch (err: any) {
      console.warn(`[SearchApiProvider] Query execution failed: "${err.message || err}". Falling back to LocalProductProvider.`);
      return this.localFallback.fetchRawProducts(filters);
    }
  }
}
