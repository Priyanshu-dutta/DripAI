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
      terms.push('accessories');
    }

    return terms.join(' ').trim();
  }
}
