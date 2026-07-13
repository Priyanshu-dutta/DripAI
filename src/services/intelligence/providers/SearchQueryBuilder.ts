import { StyleBlueprint } from '../../../types/blueprint';

/**
 * Service to dynamically build and optimize search query strings
 * from structured Style Blueprints.
 */
export class SearchQueryBuilder {
  /**
   * Generates a broad, search-friendly Google Shopping query term.
   * Keeps queries simple to maximize candidate retrieval and avoid empty search results,
   * relying on the Style Intelligence scoring engine to filter and select the best fit.
   */
  public static buildQuery(
    blueprint: StyleBlueprint,
    category: 'top' | 'bottom' | 'shoes' | 'accessories'
  ): string {
    const terms: string[] = [];

    // 1. Target Gender
    if (blueprint.gender) {
      const g = blueprint.gender.toLowerCase();
      if (g.includes('men') || g === 'man' || g === 'male') {
        terms.push('men');
      } else if (g.includes('women') || g === 'woman' || g === 'female') {
        terms.push('women');
      }
    }

    // 2. Color Preference (highly effective for search indexing)
    if (blueprint.color) {
      terms.push(blueprint.color.toLowerCase());
    }

    // 3. Category Target Term
    if (category === 'top') {
      terms.push('shirt');
    } else if (category === 'bottom') {
      terms.push('pants');
    } else if (category === 'shoes') {
      terms.push('shoes');
    } else {
      terms.push('fashion accessories');
    }

    return terms.join(' ').trim();
  }

  /**
   * Generates multiple diverse, optimized search queries to retrieve a rich candidate catalog.
   * Exploits style, fit, color, occasion, and requested items.
   */
  public static buildQueries(
    blueprint: StyleBlueprint,
    category: 'top' | 'bottom' | 'shoes' | 'accessories'
  ): string[] {
    // 1. Resolve canonical base category item keyword, prioritizing explicitly requested items if found
    let categoryTerm = '';
    if (category === 'top') {
      const topKeywords = ['shirt', 'tshirt', 't-shirt', 'jacket', 'sweater', 'outerwear', 'hoodie', 'top'];
      const matched = blueprint.requestedItems.find(item => 
        topKeywords.some(keyword => item.toLowerCase().includes(keyword))
      );
      categoryTerm = matched ? matched.toLowerCase() : 'shirt';
    } else if (category === 'bottom') {
      const bottomKeywords = ['pant', 'trouser', 'jean', 'short', 'skirt', 'cargo', 'chinos'];
      const matched = blueprint.requestedItems.find(item => 
        bottomKeywords.some(keyword => item.toLowerCase().includes(keyword))
      );
      categoryTerm = matched ? matched.toLowerCase() : 'pants';
    } else if (category === 'shoes') {
      const shoesKeywords = ['shoe', 'boot', 'sneaker', 'loafer', 'footwear', 'sandal'];
      const matched = blueprint.requestedItems.find(item => 
        shoesKeywords.some(keyword => item.toLowerCase().includes(keyword))
      );
      categoryTerm = matched ? matched.toLowerCase() : 'shoes';
    } else {
      const accKeywords = ['bag', 'sunglasses', 'watch', 'belt', 'necklace', 'cap', 'wallet', 'accessory', 'accessories'];
      const matched = blueprint.requestedItems.find(item => 
        accKeywords.some(keyword => item.toLowerCase().includes(keyword))
      );
      categoryTerm = matched ? matched.toLowerCase() : 'fashion accessories';
    }

    const queries: string[] = [];

    const gender = blueprint.gender ? blueprint.gender.toLowerCase().trim() : '';
    let genderTerm = '';
    if (gender === 'male' || gender === 'men') {
      genderTerm = 'men';
    } else if (gender === 'female' || gender === 'women') {
      genderTerm = 'women';
    } else if (gender === 'unisex') {
      genderTerm = 'unisex';
    }
    const color = blueprint.color ? blueprint.color.toLowerCase() : '';
    const style = blueprint.style ? blueprint.style.toLowerCase() : '';
    const fit = blueprint.fit ? blueprint.fit.toLowerCase() : '';
    const season = blueprint.season ? blueprint.season.toLowerCase() : '';
    const occasion = blueprint.occasion ? blueprint.occasion.toLowerCase() : '';

    const buildWithTerms = (...parts: (string | undefined)[]) => {
      // Split parts into words, normalize case, and deduplicate to avoid redundancy (e.g. 'black black shirt' -> 'black shirt')
      const words = parts.filter(Boolean).map(p => p!.trim().toLowerCase()).flatMap(p => p.split(/\s+/));
      return Array.from(new Set(words)).join(' ');
    };

    // Variation 1: Base query (gender + color + item)
    queries.push(buildWithTerms(genderTerm, color, categoryTerm));

    // Variation 2: Fit-focused query variation (gender + color + fit + item)
    if (fit && fit !== 'regular') {
      queries.push(buildWithTerms(genderTerm, color, fit, categoryTerm));
    } else {
      queries.push(buildWithTerms(genderTerm, color, 'relaxed', categoryTerm));
    }

    // Variation 3: Style-focused query variation (gender + color + style + item)
    if (style && style !== 'casual') {
      queries.push(buildWithTerms(genderTerm, color, style, categoryTerm));
    } else {
      queries.push(buildWithTerms(genderTerm, color, 'minimalist', categoryTerm));
    }

    // Variation 4: Occasion-focused query variation (gender + occasion + color + item)
    if (occasion) {
      queries.push(buildWithTerms(genderTerm, occasion, color, categoryTerm));
    } else {
      queries.push(buildWithTerms(genderTerm, 'casual', color, categoryTerm));
    }

    // Variation 5: Season-focused query variation (gender + season + color + item)
    if (season) {
      queries.push(buildWithTerms(genderTerm, season, color, categoryTerm));
    }

    // Return unique queries, removing empty strings
    return Array.from(new Set(queries.map(q => q.trim()).filter(Boolean)));
  }
}
