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
    // Define non-fashion blacklisted keywords for accessories
    const accessoryBlacklist = [
      'cable', 'connector', 'adapter', 'rs232', 'db9', 'usb', 'charger', 'vga', 
      'hdmi', 'ethernet', 'router', 'switch', 'electronic', 'hard drive', 'ram', 
      'memory card', 'screw', 'tools', 'automotive', 'car accessory', 'phone case',
      'protective case', 'screen protector', 'tempered glass', 'cables', 'adapters',
      'plug', 'socket', 'wire', 'converters', 'converter', 'solder', 'serial'
    ];

    const bpGender = blueprint.gender ? blueprint.gender.toLowerCase() : '';
    const isMaleQuery = bpGender.includes('men') || bpGender.includes('male') || bpGender === 'man';
    const isFemaleQuery = bpGender.includes('women') || bpGender.includes('female') || bpGender === 'woman';

    return products.filter((p) => {
      // 1. Must be available in stock
      if (p.availability === false) return false;

      // 2. Accessories non-fashion electronics safeguard
      if (p.category === 'accessories') {
        const titleLower = p.title.toLowerCase();
        const brandLower = p.brand.toLowerCase();
        const hasBlacklistedWord = accessoryBlacklist.some(word => 
          titleLower.includes(word) || brandLower.includes(word)
        );
        if (hasBlacklistedWord) return false;
      }

      // 3. Gender target filter
      if (!bpGender) return true;
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
  /**
   * Explores the candidate space to resolve a combination of items matching budget constraints.
   * mode: 'score' (maximize match score compatibility) or 'price' (minimize total price)
   */
  private static findCombination(
    categories: ReturnType<typeof StyleIntelligenceEngine.rankProductsByCategory>,
    totalBudget: number,
    mode: 'score' | 'price',
    excludeIds: Set<string> = new Set()
  ): {
    top: IntelligenceProduct;
    bottom: IntelligenceProduct;
    shoes: IntelligenceProduct;
    accessories: IntelligenceProduct;
    topScore: number;
    bottomScore: number;
    shoesScore: number;
    accessoriesScore: number;
    totalCost: number;
    avgScore: number;
  } {
    // Limit to top 25 candidates per category for combinatorial search (25^4 is ~390k iterations max, ~10ms execution time)
    const tops = categories.top.slice(0, 25);
    const bottoms = categories.bottom.slice(0, 25);
    const shoess = categories.shoes.slice(0, 25);
    const accs = categories.accessories.slice(0, 25);

    // Apply exclusion filter, falling back to full category lists if empty
    const tListFiltered = tops.filter(item => !excludeIds.has(item.product.id));
    const bListFiltered = bottoms.filter(item => !excludeIds.has(item.product.id));
    const sListFiltered = shoess.filter(item => !excludeIds.has(item.product.id));
    const aListFiltered = accs.filter(item => !excludeIds.has(item.product.id));

    const tList = tListFiltered.length > 0 ? tListFiltered : tops;
    const bList = bListFiltered.length > 0 ? bListFiltered : bottoms;
    const sList = sListFiltered.length > 0 ? sListFiltered : shoess;
    const aList = aListFiltered.length > 0 ? aListFiltered : accs;

    // Direct fallbacks if lists are empty
    const defaultTop = tops[0]?.product || this.getFallbackItem('top');
    const defaultBottom = bottoms[0]?.product || this.getFallbackItem('bottom');
    const defaultShoes = shoess[0]?.product || this.getFallbackItem('shoes');
    const defaultAcc = accs[0]?.product || this.getFallbackItem('accessories');

    const defaultTopScore = tops[0]?.score ?? 50;
    const defaultBottomScore = bottoms[0]?.score ?? 50;
    const defaultShoesScore = shoess[0]?.score ?? 50;
    const defaultAccScore = accs[0]?.score ?? 50;

    const baseResult = {
      top: defaultTop,
      bottom: defaultBottom,
      shoes: defaultShoes,
      accessories: defaultAcc,
      topScore: defaultTopScore,
      bottomScore: defaultBottomScore,
      shoesScore: defaultShoesScore,
      accessoriesScore: defaultAccScore,
      totalCost: defaultTop.price + defaultBottom.price + defaultShoes.price + defaultAcc.price,
      avgScore: (defaultTopScore + defaultBottomScore + defaultShoesScore + defaultAccScore) / 4
    };

    const finalTList = tList.length > 0 ? tList : [{ product: defaultTop, score: defaultTopScore }];
    const finalBList = bList.length > 0 ? bList : [{ product: defaultBottom, score: defaultBottomScore }];
    const finalSList = sList.length > 0 ? sList : [{ product: defaultShoes, score: defaultShoesScore }];
    const finalAList = aList.length > 0 ? aList : [{ product: defaultAcc, score: defaultAccScore }];

    let bestMatch: typeof baseResult | null = null;
    let maxScore = -1;
    let minPrice = Infinity;

    // Track absolute cheapest option overall as the ultimate fallback
    let absoluteCheapest: typeof baseResult | null = null;
    let absoluteMinPrice = Infinity;

    for (const t of finalTList) {
      for (const b of finalBList) {
        for (const s of finalSList) {
          for (const a of finalAList) {
            const cost = t.product.price + b.product.price + s.product.price + a.product.price;
            const avgScore = (t.score + b.score + s.score + a.score) / 4;

            const current = {
              top: t.product,
              bottom: b.product,
              shoes: s.product,
              accessories: a.product,
              topScore: t.score,
              bottomScore: b.score,
              shoesScore: s.score,
              accessoriesScore: a.score,
              totalCost: cost,
              avgScore
            };

            if (cost < absoluteMinPrice) {
              absoluteMinPrice = cost;
              absoluteCheapest = current;
            }

            if (totalBudget <= 0) {
              // No budget constraint: maximize compatibility score
              if (avgScore > maxScore) {
                maxScore = avgScore;
                bestMatch = current;
              }
            } else if (cost <= totalBudget) {
              if (mode === 'score') {
                // Maximize average score within budget
                if (avgScore > maxScore) {
                  maxScore = avgScore;
                  bestMatch = current;
                }
              } else {
                // Minimize price within budget
                if (cost < minPrice) {
                  minPrice = cost;
                  bestMatch = current;
                }
              }
            }
          }
        }
      }
    }

    if (bestMatch) {
      return bestMatch;
    }

    // Fallback: If no combination is within budget, return the cheapest option overall
    return absoluteCheapest || baseResult;
  }

  /**
   * Combines top-ranked products in each category.
   */
  private static buildBestMatchOutfit(
    categories: ReturnType<typeof StyleIntelligenceEngine.rankProductsByCategory>,
    blueprint: StyleBlueprint,
    totalBudget: number
  ): OutfitDefinition {
    const comb = this.findCombination(categories, totalBudget, 'score');

    return this.createOutfit(
      comb.top,
      comb.bottom,
      comb.shoes,
      comb.accessories,
      comb.avgScore,
      blueprint,
      totalBudget,
      {
        top: comb.topScore,
        bottom: comb.bottomScore,
        shoes: comb.shoesScore,
        accessories: comb.accessoriesScore,
      }
    );
  }

  /**
   * Combines secondary choices to offer a styled alternative look.
   */
  private static buildAlternativeOutfit(
    categories: ReturnType<typeof StyleIntelligenceEngine.rankProductsByCategory>,
    blueprint: StyleBlueprint,
    totalBudget: number
  ): OutfitDefinition {
    // Exclude the Best Match items to recommend a distinct coordinate
    const bestMatchComb = this.findCombination(categories, totalBudget, 'score');
    const excludeIds = new Set<string>([
      bestMatchComb.top.id,
      bestMatchComb.bottom.id,
      bestMatchComb.shoes.id,
      bestMatchComb.accessories.id,
    ]);

    const comb = this.findCombination(categories, totalBudget, 'score', excludeIds);

    return this.createOutfit(
      comb.top,
      comb.bottom,
      comb.shoes,
      comb.accessories,
      comb.avgScore,
      blueprint,
      totalBudget,
      {
        top: comb.topScore,
        bottom: comb.bottomScore,
        shoes: comb.shoesScore,
        accessories: comb.accessoriesScore,
      }
    );
  }

  /**
   * Selects lower cost items that maintain adequate scoring compatibility.
   */
  private static buildBudgetFriendlyOutfit(
    categories: ReturnType<typeof StyleIntelligenceEngine.rankProductsByCategory>,
    blueprint: StyleBlueprint,
    totalBudget: number
  ): OutfitDefinition {
    // Find the cheapest combination within budget
    const comb = this.findCombination(categories, totalBudget, 'price');

    return this.createOutfit(
      comb.top,
      comb.bottom,
      comb.shoes,
      comb.accessories,
      comb.avgScore,
      blueprint,
      totalBudget,
      {
        top: comb.topScore,
        bottom: comb.bottomScore,
        shoes: comb.shoesScore,
        accessories: comb.accessoriesScore,
      }
    );
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
      availability: true,
    };
  }
}
