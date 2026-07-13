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

    // Title context parsing if fields are default or unknown to ensure high match fidelity
    const titleLower = title.toLowerCase();

    // 1. Color Extraction
    let rawColor = (raw.color || raw.colour || raw.shade || '').toLowerCase().trim();
    if (!rawColor || rawColor === 'unknown') {
      const colors = [
        'black', 'white', 'grey', 'gray', 'beige', 'cream', 'blue', 'navy', 
        'green', 'olive', 'brown', 'tan', 'red', 'burgundy', 'pink', 
        'yellow', 'orange', 'purple', 'silver', 'gold'
      ];
      const foundColor = colors.find(c => titleLower.includes(c));
      rawColor = foundColor ? foundColor : 'unknown';
    }
    const color = this.canonicalColor(rawColor);

    // 2. Fit Extraction
    let fit = (raw.fit || raw.fitType || '').toLowerCase().trim();
    if (!fit || fit === 'regular') {
      if (titleLower.includes('oversized') || titleLower.includes('baggy') || titleLower.includes('loose') || titleLower.includes('relaxed')) {
        fit = 'oversized';
      } else if (titleLower.includes('slim') || titleLower.includes('tight') || titleLower.includes('skinny') || titleLower.includes('tapered')) {
        fit = 'slim';
      } else {
        fit = 'regular';
      }
    }

    // 3. Style Extraction
    let style = (raw.style || raw.styleVibe || '').toLowerCase().trim();
    if (!style || style === 'casual') {
      if (titleLower.includes('formal') || titleLower.includes('suit') || titleLower.includes('office') || titleLower.includes('classic') || titleLower.includes('classy') || titleLower.includes('trousers') || titleLower.includes('blazer')) {
        style = 'formal';
      } else if (titleLower.includes('streetwear') || titleLower.includes('street') || titleLower.includes('hoodie') || titleLower.includes('sport') || titleLower.includes('cargo') || titleLower.includes('sneaker')) {
        style = 'casual';
      } else {
        style = 'casual';
      }
    }

    // 4. Season Extraction
    const season = (raw.season || raw.seasonName || 'all-season').toLowerCase().trim();

    // 5. Gender Target Extraction
    let rawGender = (raw.gender || raw.genderTarget || '').toLowerCase().trim();
    if (!rawGender || rawGender === 'unisex') {
      if (titleLower.includes('women') || titleLower.includes('woman') || titleLower.includes('female') || titleLower.includes('girl') || titleLower.includes('lady') || titleLower.includes('ladies') || titleLower.includes("women's")) {
        rawGender = 'female';
      } else if (titleLower.includes('men') || titleLower.includes('man') || titleLower.includes('male') || titleLower.includes('boy') || titleLower.includes("men's")) {
        rawGender = 'male';
      } else {
        rawGender = 'unisex';
      }
    }
    let gender: 'male' | 'female' | 'unisex' | null = null;
    const gVal = rawGender.toLowerCase().trim();
    if (gVal === 'women' || gVal === 'female' || gVal === 'ladies' || gVal === 'women\'s' || gVal === 'woman' || gVal === 'girl' || gVal === 'lady') {
      gender = 'female';
    } else if (gVal === 'men' || gVal === 'male' || gVal === 'mens' || gVal === 'men\'s' || gVal === 'man' || gVal === 'boy') {
      gender = 'male';
    } else if (gVal === 'unisex') {
      gender = 'unisex';
    }

    // 6. Occasion Tags Extraction
    const rawTags = raw.occasionTags || raw.tags || [];
    const occasionTags = rawTags.map((tag) => tag.toLowerCase().trim());
    if (occasionTags.length === 0) {
      if (titleLower.includes('formal') || titleLower.includes('office') || titleLower.includes('interview')) {
        occasionTags.push('formal');
      }
      if (titleLower.includes('casual') || titleLower.includes('daily') || titleLower.includes('weekend')) {
        occasionTags.push('casual');
      }
      if (titleLower.includes('party') || titleLower.includes('night') || titleLower.includes('club')) {
        occasionTags.push('party');
      }
      if (titleLower.includes('date') || titleLower.includes('romantic')) {
        occasionTags.push('date');
      }
      if (titleLower.includes('sport') || titleLower.includes('gym') || titleLower.includes('running') || titleLower.includes('active')) {
        occasionTags.push('sports');
      }
      if (titleLower.includes('summer') || titleLower.includes('beach') || titleLower.includes('sun')) {
        occasionTags.push('summer');
      }
      if (titleLower.includes('winter') || titleLower.includes('snow') || titleLower.includes('cold')) {
        occasionTags.push('winter');
      }
    }

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
