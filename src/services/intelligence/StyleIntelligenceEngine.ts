import { IProductRepository } from './IProductRepository';
import { StyleBlueprint } from '../../types/blueprint';
import { 
  IntelligenceProduct, 
  OutfitDefinition, 
  StyleRecommendations 
} from '../../types/product';
import { ProductNormalizer } from './ProductNormalizer';
import { ScoringEngine } from './ScoringEngine';
import { ExplainabilityService } from './ExplainabilityService';
import { Logger } from '../../utils/logger';

export class StyleIntelligenceEngine {
  private static readonly ENGINE_VERSION = 'v2.0-production';

  /**
   * Main entry point. Coordinates recommendation generation in a completely stateless manner.
   * Completes in under 500ms when querying Local Product Provider.
   */
  public static async generateRecommendations(
    blueprint: StyleBlueprint,
    repository: IProductRepository,
    requestId: string
  ): Promise<StyleRecommendations> {
    const startTime = Date.now();
    Logger.info(`Starting Style Intelligence Engine run using provider: ${repository.name}`, requestId);

    try {
      // 1. RETRIEVE raw products from the abstracted repository boundary
      const rawProducts = await repository.fetchRawProducts({
        gender: blueprint.gender || undefined,
      });
      Logger.info(`Step 1 (Retrieve): Fetched ${rawProducts.length} raw products.`, requestId);

      // 2. NORMALIZE raw provider structures into internal standardized formats
      const standardizedProducts = ProductNormalizer.normalizeBatch(rawProducts);
      Logger.info(`Step 2 (Normalize): Normalized ${standardizedProducts.length} items.`, requestId);

      // 3. FILTER out hard invalid candidates (e.g., gender mismatch check)
      const filteredProducts = this.filterProducts(standardizedProducts, blueprint);
      Logger.info(`Step 3 (Filter): ${filteredProducts.length} items remain after constraints filtering.`, requestId);

      // 4. SCORE products deterministically
      const scoredProducts = filteredProducts.map((product) => ({
        product,
        score: ScoringEngine.calculateProductScore(product, blueprint),
      }));
      Logger.info(`Step 4 (Score): Multi-dimensional scoring complete.`, requestId);

      // 5. RANK products inside each category by score descending
      const rankedCategories = this.rankProductsByCategory(scoredProducts);
      Logger.info(
        `Step 5 (Rank): Categorized ranked items sizes: Tops: ${rankedCategories.top.length}, Bottoms: ${rankedCategories.bottom.length}, Shoes: ${rankedCategories.shoes.length}, Accessories: ${rankedCategories.accessories.length}`,
        requestId
      );

      // 6. BUILD OUTFITS (Best Match, Alternative, Budget-Friendly)
      const totalBudget = blueprint.budget ? ScoringEngine.parseNumericBudget(blueprint.budget) : 0;

      const bestMatch = this.buildBestMatchOutfit(rankedCategories, blueprint, totalBudget);
      const alternative = this.buildAlternativeOutfit(rankedCategories, blueprint, totalBudget);
      const budgetFriendly = this.buildBudgetFriendlyOutfit(rankedCategories, blueprint, totalBudget);

      const processingTimeMs = Date.now() - startTime;
      Logger.info(`Style Intelligence Engine pipeline completed in ${processingTimeMs}ms`, requestId);

      return {
        bestMatch,
        alternative,
        budgetFriendly,
        metadata: {
          generatedAt: new Date().toISOString(),
          provider: repository.name,
          engineVersion: this.ENGINE_VERSION,
          processingTimeMs,
        },
      };
    } catch (error) {
      Logger.error('Execution failure in Style Intelligence Engine pipeline', error, requestId);
      throw error;
    }
  }

  /**
   * Filters out candidates violating strict gender requirements.
   */
  private static filterProducts(
    products: IntelligenceProduct[],
    blueprint: StyleBlueprint
  ): IntelligenceProduct[] {
    if (!blueprint.gender) return products;

    const bpGender = blueprint.gender.toLowerCase();
    const isMaleQuery = bpGender.includes('men') || bpGender.includes('male') || bpGender === 'man';
    const isFemaleQuery = bpGender.includes('women') || bpGender.includes('female') || bpGender === 'woman';

    return products.filter((p) => {
      if (p.gender === 'unisex') return true;
      if (isMaleQuery) return p.gender === 'men';
      if (isFemaleQuery) return p.gender === 'women';
      return true;
    });
  }

  /**
   * Splits and ranks scored products into discrete categories.
   */
  private static rankProductsByCategory(
    scoredItems: { product: IntelligenceProduct; score: number }[]
  ) {
    const categories = {
      top: [] as { product: IntelligenceProduct; score: number }[],
      bottom: [] as { product: IntelligenceProduct; score: number }[],
      shoes: [] as { product: IntelligenceProduct; score: number }[],
      accessories: [] as { product: IntelligenceProduct; score: number }[],
    };

    for (const item of scoredItems) {
      const cat = item.product.category;
      if (cat in categories) {
        categories[cat].push(item);
      }
    }

    // Sort descending
    const sorter = (a: any, b: any) => b.score - a.score || b.product.rating - a.product.rating;
    categories.top.sort(sorter);
    categories.bottom.sort(sorter);
    categories.shoes.sort(sorter);
    categories.accessories.sort(sorter);

    return categories;
  }

  /**
   * Combines top-ranked products in each category.
   */
  private static buildBestMatchOutfit(
    categories: ReturnType<typeof StyleIntelligenceEngine.rankProductsByCategory>,
    blueprint: StyleBlueprint,
    totalBudget: number
  ): OutfitDefinition {
    const top = categories.top[0]?.product || this.getFallbackItem('top');
    const bottom = categories.bottom[0]?.product || this.getFallbackItem('bottom');
    const shoes = categories.shoes[0]?.product || this.getFallbackItem('shoes');
    const accessories = categories.accessories[0]?.product || this.getFallbackItem('accessories');

    const topScore = categories.top[0]?.score ?? 50;
    const bottomScore = categories.bottom[0]?.score ?? 50;
    const shoesScore = categories.shoes[0]?.score ?? 50;
    const accScore = categories.accessories[0]?.score ?? 50;

    const avgScore = (topScore + bottomScore + shoesScore + accScore) / 4;

    return this.createOutfit(top, bottom, shoes, accessories, avgScore, blueprint, totalBudget, {
      top: topScore,
      bottom: bottomScore,
      shoes: shoesScore,
      accessories: accScore,
    });
  }

  /**
   * Combines secondary choices to offer a styled alternative look.
   */
  private static buildAlternativeOutfit(
    categories: ReturnType<typeof StyleIntelligenceEngine.rankProductsByCategory>,
    blueprint: StyleBlueprint,
    totalBudget: number
  ): OutfitDefinition {
    // Attempt to pick second rank, fallback to first if catalog is small
    const topItem = categories.top[1] || categories.top[0];
    const bottomItem = categories.bottom[1] || categories.bottom[0];
    const shoesItem = categories.shoes[1] || categories.shoes[0];
    const accItem = categories.accessories[1] || categories.accessories[0];

    const top = topItem?.product || this.getFallbackItem('top');
    const bottom = bottomItem?.product || this.getFallbackItem('bottom');
    const shoes = shoesItem?.product || this.getFallbackItem('shoes');
    const accessories = accItem?.product || this.getFallbackItem('accessories');

    const topScore = topItem?.score ?? 45;
    const bottomScore = bottomItem?.score ?? 45;
    const shoesScore = shoesItem?.score ?? 45;
    const accScore = accItem?.score ?? 45;

    const avgScore = (topScore + bottomScore + shoesScore + accScore) / 4;

    return this.createOutfit(top, bottom, shoes, accessories, avgScore, blueprint, totalBudget, {
      top: topScore,
      bottom: bottomScore,
      shoes: shoesScore,
      accessories: accScore,
    });
  }

  /**
   * Selects lower cost items that maintain adequate scoring compatibility.
   */
  private static buildBudgetFriendlyOutfit(
    categories: ReturnType<typeof StyleIntelligenceEngine.rankProductsByCategory>,
    blueprint: StyleBlueprint,
    totalBudget: number
  ): OutfitDefinition {
    // Sort catalog by price ascending, keeping only candidates with suitability > 30%
    const sortByPrice = (list: typeof categories.top) => 
      [...list]
        .filter(item => item.score > 30)
        .sort((a, b) => a.product.price - b.product.price);

    const priceSortedTops = sortByPrice(categories.top);
    const priceSortedBottoms = sortByPrice(categories.bottom);
    const priceSortedShoes = sortByPrice(categories.shoes);
    const priceSortedAcc = sortByPrice(categories.accessories);

    const topItem = priceSortedTops[0] || categories.top[0];
    const bottomItem = priceSortedBottoms[0] || categories.bottom[0];
    const shoesItem = priceSortedShoes[0] || categories.shoes[0];
    const accItem = priceSortedAcc[0] || categories.accessories[0];

    const top = topItem?.product || this.getFallbackItem('top');
    const bottom = bottomItem?.product || this.getFallbackItem('bottom');
    const shoes = shoesItem?.product || this.getFallbackItem('shoes');
    const accessories = accItem?.product || this.getFallbackItem('accessories');

    const topScore = topItem?.score ?? 40;
    const bottomScore = bottomItem?.score ?? 40;
    const shoesScore = shoesItem?.score ?? 40;
    const accScore = accItem?.score ?? 40;

    const avgScore = (topScore + bottomScore + shoesScore + accScore) / 4;

    return this.createOutfit(top, bottom, shoes, accessories, avgScore, blueprint, totalBudget, {
      top: topScore,
      bottom: bottomScore,
      shoes: shoesScore,
      accessories: accScore,
    });
  }

  /**
   * Assembles the OutfitDefinition object and generates dynamic explanations.
   */
  private static createOutfit(
    top: IntelligenceProduct,
    bottom: IntelligenceProduct,
    shoes: IntelligenceProduct,
    accessories: IntelligenceProduct,
    matchScore: number,
    blueprint: StyleBlueprint,
    totalBudget: number,
    individualScores: { top: number; bottom: number; shoes: number; accessories: number }
  ): OutfitDefinition {
    const totalCost = top.price + bottom.price + shoes.price + accessories.price;

    let budgetUsage = 'No budget specified';
    if (totalBudget > 0) {
      const percentage = Math.round((totalCost / totalBudget) * 100);
      budgetUsage = `${percentage}% (INR ${totalCost} / INR ${totalBudget})`;
    }

    // Confidence index correlates with overall score and extraction accuracy
    const confidenceScore = Math.max(0.1, Math.min(1.0, (matchScore / 100) * (blueprint.confidence || 0.8)));

    const explanations = {
      top: ExplainabilityService.generateExplanation(top, blueprint, individualScores.top),
      bottom: ExplainabilityService.generateExplanation(bottom, blueprint, individualScores.bottom),
      shoes: ExplainabilityService.generateExplanation(shoes, blueprint, individualScores.shoes),
      accessories: ExplainabilityService.generateExplanation(accessories, blueprint, individualScores.accessories),
    };

    return {
      top,
      bottom,
      shoes,
      accessories,
      matchScore: Math.round(matchScore),
      confidenceScore: parseFloat(confidenceScore.toFixed(2)),
      totalCost,
      budgetUsage,
      explanations,
    };
  }

  /**
   * Fallback object generator in case provider returns empty lists.
   */
  private static getFallbackItem(
    category: 'top' | 'bottom' | 'shoes' | 'accessories'
  ): IntelligenceProduct {
    return {
      id: `fallback-${category}`,
      title: `Classic Basic ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      brand: 'Essentials',
      category,
      color: 'black',
      style: 'casual',
      fit: 'regular',
      season: 'all-season',
      gender: 'unisex',
      occasionTags: ['casual'],
      price: 999,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
      retailer: 'Fallback Store',
      retailerUrl: '#',
      rating: 4.0,
    };
  }
}
