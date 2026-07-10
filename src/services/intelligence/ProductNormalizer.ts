import { RawProviderProduct, IntelligenceProduct } from '../../types/product';

/**
 * Normalization layer that standardizes provider-specific product schemas
 * into a single unified model for the Style Intelligence Engine.
 */
export class ProductNormalizer {
  /**
   * Standardizes a single raw provider product into the canonical IntelligenceProduct format.
   */
  public static normalize(raw: RawProviderProduct): IntelligenceProduct {
    const id = raw.id || raw.sku || `p-${Math.random().toString(36).substring(2, 9)}`;
    const title = raw.title || raw.name || 'Unknown Item';
    const brand = raw.brand || raw.brandName || 'Generic';

    // Normalize category into four canonical types
    const rawCategory = (raw.category || raw.categoryName || 'accessories').toLowerCase().trim();
    let category: 'top' | 'bottom' | 'shoes' | 'accessories' = 'accessories';
    if (rawCategory.includes('top') || rawCategory.includes('shirt') || rawCategory.includes('tshirt') || rawCategory.includes('jacket') || rawCategory.includes('sweater') || rawCategory.includes('outerwear')) {
      category = 'top';
    } else if (rawCategory.includes('bottom') || rawCategory.includes('pant') || rawCategory.includes('jean') || rawCategory.includes('trouser') || rawCategory.includes('short') || rawCategory.includes('skirt')) {
      category = 'bottom';
    } else if (rawCategory.includes('shoe') || rawCategory.includes('boot') || rawCategory.includes('sneaker') || rawCategory.includes('sandal') || rawCategory.includes('footwear')) {
      category = 'shoes';
    }

    // Normalize color names (handling spelling variations and standardizing to lowercase)
    const rawColor = (raw.color || raw.colour || raw.shade || 'unknown').toLowerCase().trim();
    const color = this.canonicalColor(rawColor);

    // Normalize style, fit, and season to canonical lowercase formats
    const style = (raw.style || raw.styleVibe || 'casual').toLowerCase().trim();
    const fit = (raw.fit || raw.fitType || 'regular').toLowerCase().trim();
    const season = (raw.season || raw.seasonName || 'all-season').toLowerCase().trim();

    // Standardize gender target
    const rawGender = (raw.gender || raw.genderTarget || 'unisex').toLowerCase().trim();
    let gender: 'men' | 'women' | 'unisex' = 'unisex';
    if (rawGender.includes('men') || rawGender.includes('male') || rawGender === 'man') {
      gender = 'men';
    } else if (rawGender.includes('women') || rawGender.includes('female') || rawGender === 'woman') {
      gender = 'women';
    }

    // Process and normalize occasion tags
    const rawTags = raw.occasionTags || raw.tags || [];
    const occasionTags = rawTags.map((tag) => tag.toLowerCase().trim());

    // Validate numbers
    const price = typeof raw.price === 'number' ? raw.price : (typeof raw.cost === 'number' ? raw.cost : 0);
    const currency = (raw.currency || raw.currencyCode || 'INR').toUpperCase().trim();
    const image = raw.image || raw.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400';
    const retailer = raw.retailer || raw.retailerName || 'Retailer';
    const retailerUrl = raw.retailerUrl || raw.purchaseUrl || '#';
    
    // Normalize rating range
    const ratingRaw = typeof raw.rating === 'number' ? raw.rating : (typeof raw.ratingScore === 'number' ? raw.ratingScore : 4.0);
    const rating = Math.max(0, Math.min(5.0, ratingRaw));

    return {
      id,
      title,
      brand,
      category,
      color,
      style,
      fit,
      season,
      gender,
      occasionTags,
      price,
      currency,
      image,
      retailer,
      retailerUrl,
      rating,
    };
  }

  /**
   * Standardizes arbitrary shade names into simple, canonical color terms.
   */
  private static canonicalColor(shade: string): string {
    if (shade.includes('jet black') || shade.includes('midnight black') || shade.includes('charcoal')) {
      return 'black';
    }
    if (shade.includes('off-white') || shade.includes('ivory') || shade.includes('cream')) {
      return 'white';
    }
    if (shade.includes('navy') || shade.includes('indigo') || shade.includes('sky')) {
      return 'blue';
    }
    if (shade.includes('olive') || shade.includes('forest') || shade.includes('mint')) {
      return 'green';
    }
    if (shade.includes('maroon') || shade.includes('ruby') || shade.includes('crimson')) {
      return 'red';
    }
    if (shade.includes('khaki') || shade.includes('beige') || shade.includes('camel') || shade.includes('tan')) {
      return 'beige';
    }
    return shade;
  }

  /**
   * Helper to batch normalize an array of raw products.
   */
  public static normalizeBatch(rawList: RawProviderProduct[]): IntelligenceProduct[] {
    return rawList.map((item) => this.normalize(item));
  }
}
