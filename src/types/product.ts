/**
 * Raw product response model that external provider APIs might return.
 * This represents unnormalized, provider-specific data shapes.
 */
export interface RawProviderProduct {
  sku?: string;
  id?: string;
  name?: string;
  title?: string;
  brandName?: string;
  brand?: string;
  categoryName?: string;
  category?: string;
  colour?: string;
  shade?: string;
  color?: string;
  styleVibe?: string;
  style?: string;
  fitType?: string;
  fit?: string;
  seasonName?: string;
  season?: string;
  genderTarget?: string;
  gender?: string;
  tags?: string[];
  occasionTags?: string[];
  price?: number;
  cost?: number;
  currencyCode?: string;
  currency?: string;
  imageUrl?: string;
  image?: string;
  retailerName?: string;
  retailer?: string;
  purchaseUrl?: string;
  retailerUrl?: string;
  ratingScore?: number;
  rating?: number;
}

/**
 * Standardized, normalized product definition used internally by the Style Intelligence Engine.
 */
export interface IntelligenceProduct {
  id: string;
  title: string;
  brand: string;
  category: 'top' | 'bottom' | 'shoes' | 'accessories';
  color: string; // Lowercase, canonical color
  style: string; // Lowercase, canonical style
  fit: string;   // Lowercase, canonical fit
  season: string; // Lowercase, canonical season
  gender: 'men' | 'women' | 'unisex';
  occasionTags: string[]; // Standardized occasion tags (lowercase)
  price: number;
  currency: string;
  image: string;
  retailer: string;
  retailerUrl: string;
  rating: number; // 0.0 - 5.0
}

/**
 * Single outfit coordination recommendation containing four distinct matching items.
 */
export interface OutfitDefinition {
  top: IntelligenceProduct;
  bottom: IntelligenceProduct;
  shoes: IntelligenceProduct;
  accessories: IntelligenceProduct;
  matchScore: number;       // 0 to 100
  confidenceScore: number;  // 0.0 to 1.0
  totalCost: number;
  budgetUsage: string;      // E.g., "85% ($170 / $200)" or "No budget specified"
  explanations: {
    top: string;
    bottom: string;
    shoes: string;
    accessories: string;
  };
}

/**
 * Execution metadata for trace logging, tracking, and analytics.
 */
export interface RecommendationMetadata {
  generatedAt: string;
  provider: string;
  engineVersion: string;
  processingTimeMs: number;
}

/**
 * The final output structure returned by the recommendation endpoint.
 */
export interface StyleRecommendations {
  bestMatch: OutfitDefinition;
  alternative: OutfitDefinition;
  budgetFriendly: OutfitDefinition;
  metadata: RecommendationMetadata;
}
