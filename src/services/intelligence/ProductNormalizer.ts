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
    } else if (rawCategory.includes('bottom') || rawCategory.includes('pant') || rawCategory.includes('jean') || rawCategory.includes('trouser') || rawCategory.includes('short') || rawCategory.includes('skirt') || rawCategory.includes('cargo')) {
      category = 'bottom';
    } else if (rawCategory.includes('shoe') || rawCategory.includes('boot') || rawCategory.includes('sneaker') || rawCategory.includes('sandal') || rawCategory.includes('footwear') || rawCategory.includes('loafer')) {
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

    // Normalize availability flag
    let availability = true;
    if (raw.availability !== undefined) {
      if (typeof raw.availability === 'boolean') {
        availability = raw.availability;
      } else if (typeof raw.availability === 'string') {
        const lowerAvail = raw.availability.toLowerCase().trim();
        availability = lowerAvail === 'in stock' || lowerAvail === 'instock' || lowerAvail === 'true' || lowerAvail === 'available';
      }
    } else if ((raw as any).inStock !== undefined) {
      availability = !!(raw as any).inStock;
    } else if ((raw as any).stock !== undefined) {
      if (typeof (raw as any).stock === 'number') {
        availability = (raw as any).stock > 0;
      }
    }

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
      availability
    };
  }

  /**
   * Helper parsing numerical value and currency tag from raw price string values.
   */
  public static parsePriceAndCurrency(rawPriceString: string): { price: number; currency: string } {
    if (!rawPriceString) return { price: 0, currency: 'INR' };
    
    let currency = 'INR';
    if (rawPriceString.includes('$')) {
      currency = 'USD';
    } else if (rawPriceString.includes('₹') || rawPriceString.toUpperCase().includes('INR')) {
      currency = 'INR';
    } else if (rawPriceString.includes('£')) {
      currency = 'GBP';
    } else if (rawPriceString.includes('€')) {
      currency = 'EUR';
    }

    const cleaned = rawPriceString.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleaned) || 0;

    return { price, currency };
  }

  /**
   * Standardizes arbitrary shade names into simple, canonical color terms.
   */
  private static canonicalColor(shade: string): string {
    const s = shade.toLowerCase();
    if (s.includes('jet black') || s.includes('midnight black') || s.includes('charcoal') || s === 'black') {
      return 'black';
    }
    if (s.includes('off-white') || s.includes('ivory') || s.includes('cream') || s === 'white') {
      return 'white';
    }
    if (s.includes('navy') || s.includes('indigo') || s.includes('sky') || s === 'blue') {
      return 'blue';
    }
    if (s.includes('olive') || s.includes('forest') || s.includes('mint') || s === 'green') {
      return 'green';
    }
    if (s.includes('maroon') || s.includes('ruby') || s.includes('crimson') || s === 'red') {
      return 'red';
    }
    if (s.includes('khaki') || s.includes('beige') || s.includes('camel') || s.includes('tan')) {
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
