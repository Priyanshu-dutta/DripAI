import { IntelligenceProduct } from '../../types/product';
import { StyleBlueprint } from '../../types/blueprint';

/**
 * Service responsible for creating natural language justifications
 * for selected recommendation items, decoupled from the core algorithm.
 */
export class ExplainabilityService {
  /**
   * Generates a descriptive string justifying the product selection.
   */
  public static generateExplanation(
    product: IntelligenceProduct,
    blueprint: StyleBlueprint,
    categoryScore: number
  ): string {
    const reasons: string[] = [];

    // 1. Color alignment
    if (blueprint.color && product.color === blueprint.color.toLowerCase()) {
      reasons.push(`matches your preferred ${product.color} color`);
    } else if (blueprint.color && blueprint.color.toLowerCase().includes(product.color)) {
      reasons.push(`coordinates with your ${blueprint.color} color palette`);
    }

    // 2. Style vibe
    if (blueprint.style && product.style === blueprint.style.toLowerCase()) {
      reasons.push(`aligns perfectly with the ${product.style} style`);
    } else if (blueprint.style && product.style.includes(blueprint.style.toLowerCase())) {
      reasons.push(`supports your ${blueprint.style} aesthetic`);
    }

    // 3. Occasion matching
    if (blueprint.occasion) {
      const matchOccasion = product.occasionTags.some(tag => 
        tag.includes(blueprint.occasion!.toLowerCase()) || 
        blueprint.occasion!.toLowerCase().includes(tag)
      );
      if (matchOccasion) {
        reasons.push(`is suitable for the ${blueprint.occasion} occasion`);
      }
    }

    // 4. Fit check
    if (blueprint.fit && product.fit === blueprint.fit.toLowerCase()) {
      reasons.push(`offers the requested ${product.fit} fit`);
    }

    // 5. Season compatibility
    if (blueprint.season && product.season === blueprint.season.toLowerCase()) {
      reasons.push(`is optimized for ${product.season} wear`);
    }

    // fallback phrasing if matches are sparse
    if (reasons.length === 0) {
      reasons.push(`fits your profile guidelines with a rating of ${product.rating}/5.0`);
    }

    const joiner = reasons.length > 1 
      ? `${reasons.slice(0, -1).join(', ')}, and ${reasons[reasons.length - 1]}`
      : reasons[0];

    return `Selected the ${product.brand} ${product.title} from ${product.retailer} because it ${joiner} (item suitability: ${Math.round(categoryScore)}%).`;
  }
}
