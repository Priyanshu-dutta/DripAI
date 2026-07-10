import { IntelligenceProduct } from '../../types/product';
import { StyleBlueprint } from '../../types/blueprint';

/**
 * Weights configuration for the Style Intelligence Engine scoring.
 */
export interface ScoringWeights {
  occasionMatch: number;
  styleMatch: number;
  colorHarmony: number;
  fitCompatibility: number;
  seasonMatch: number;
  budgetCompatibility: number;
  genderMatch: number;
  productPopularity: number;
  brandPreference: number;
}

export class ScoringEngine {
  // Balanced default weights configuration
  private static readonly DEFAULT_WEIGHTS: ScoringWeights = {
    occasionMatch: 0.20,
    styleMatch: 0.20,
    colorHarmony: 0.15,
    fitCompatibility: 0.15,
    seasonMatch: 0.10,
    budgetCompatibility: 0.10,
    genderMatch: 0.10,
    productPopularity: 0.00,
    brandPreference: 0.00,
  };

  /**
   * Evaluates compatibility score for a single standardized product against a Style Blueprint.
   * Returns a rating between 0 and 100.
   */
  public static calculateProductScore(
    product: IntelligenceProduct,
    blueprint: StyleBlueprint,
    weights: ScoringWeights = this.DEFAULT_WEIGHTS
  ): number {
    let scoreSum = 0;
    let weightSum = 0;

    // 1. Gender Match (Hard constraint represented as score dimension)
    if (weights.genderMatch > 0) {
      let genderScore = 0.0;
      if (!blueprint.gender || product.gender === 'unisex') {
        genderScore = 1.0;
      } else {
        const bpGender = blueprint.gender.toLowerCase();
        if (bpGender.includes('men') || bpGender.includes('male')) {
          genderScore = product.gender === 'men' ? 1.0 : 0.0;
        } else if (bpGender.includes('women') || bpGender.includes('female')) {
          genderScore = product.gender === 'women' ? 1.0 : 0.0;
        } else {
          genderScore = 1.0;
        }
      }
      scoreSum += genderScore * weights.genderMatch;
      weightSum += weights.genderMatch;

      // If hard gender mismatch is found, fail early by returning 0
      if (genderScore === 0.0) {
        return 0;
      }
    }

    // 2. Occasion Match
    if (weights.occasionMatch > 0) {
      let occasionScore = 0.0;
      if (!blueprint.occasion) {
        occasionScore = 1.0; // No preference expressed
      } else {
        const targetOccasion = blueprint.occasion.toLowerCase();
        const hasDirectTag = product.occasionTags.some((tag) => 
          tag === targetOccasion || targetOccasion.includes(tag) || tag.includes(targetOccasion)
        );
        occasionScore = hasDirectTag ? 1.0 : 0.0;
      }
      scoreSum += occasionScore * weights.occasionMatch;
      weightSum += weights.occasionMatch;
    }

    // 3. Style Match
    if (weights.styleMatch > 0) {
      let styleScore = 0.0;
      if (!blueprint.style) {
        styleScore = 1.0;
      } else {
        const targetStyle = blueprint.style.toLowerCase();
        if (product.style === targetStyle) {
          styleScore = 1.0;
        } else if (product.style.includes(targetStyle) || targetStyle.includes(product.style)) {
          styleScore = 0.5;
        }
      }
      scoreSum += styleScore * weights.styleMatch;
      weightSum += weights.styleMatch;
    }

    // 4. Color Harmony
    if (weights.colorHarmony > 0) {
      let colorScore = 0.0;
      if (!blueprint.color) {
        colorScore = 1.0;
      } else {
        const targetColor = blueprint.color.toLowerCase();
        if (product.color === targetColor) {
          colorScore = 1.0;
        } else if (targetColor.includes(product.color) || product.color.includes(targetColor)) {
          colorScore = 0.5;
        }
      }
      scoreSum += colorScore * weights.colorHarmony;
      weightSum += weights.colorHarmony;
    }

    // 5. Fit Compatibility
    if (weights.fitCompatibility > 0) {
      let fitScore = 0.0;
      if (!blueprint.fit) {
        fitScore = 1.0;
      } else {
        const targetFit = blueprint.fit.toLowerCase();
        fitScore = product.fit === targetFit ? 1.0 : 0.2; // slight penalty for mismatched fit
      }
      scoreSum += fitScore * weights.fitCompatibility;
      weightSum += weights.fitCompatibility;
    }

    // 6. Season Match
    if (weights.seasonMatch > 0) {
      let seasonScore = 0.0;
      if (!blueprint.season) {
        seasonScore = 1.0;
      } else {
        const targetSeason = blueprint.season.toLowerCase();
        if (product.season === 'all-season' || product.season === targetSeason) {
          seasonScore = 1.0;
        } else {
          seasonScore = 0.3; // seasonal penalty
        }
      }
      scoreSum += seasonScore * weights.seasonMatch;
      weightSum += weights.seasonMatch;
    }

    // 7. Budget Compatibility (Item-level assessment)
    if (weights.budgetCompatibility > 0) {
      let budgetScore = 1.0;
      if (blueprint.budget) {
        const numericBudget = this.parseNumericBudget(blueprint.budget);
        if (numericBudget > 0) {
          // Categorical division of budget:
          // Top: 35%, Bottom: 35%, Shoes: 20%, Accessories: 10%
          let ratio = 0.10;
          if (product.category === 'top') ratio = 0.35;
          else if (product.category === 'bottom') ratio = 0.35;
          else if (product.category === 'shoes') ratio = 0.20;

          const targetItemLimit = numericBudget * ratio;
          if (product.price <= targetItemLimit) {
            budgetScore = 1.0;
          } else {
            // Linear decay from target item limit up to double the limit
            const penaltyLimit = targetItemLimit * 2;
            if (product.price >= penaltyLimit) {
              budgetScore = 0.0;
            } else {
              budgetScore = 1.0 - (product.price - targetItemLimit) / (penaltyLimit - targetItemLimit);
            }
          }
        }
      }
      scoreSum += budgetScore * weights.budgetCompatibility;
      weightSum += weights.budgetCompatibility;
    }

    // 8. Rating / Product Popularity (Future-ready)
    if (weights.productPopularity > 0) {
      // Map ratings (0-5) to score (0-1)
      const popScore = product.rating / 5.0;
      scoreSum += popScore * weights.productPopularity;
      weightSum += weights.productPopularity;
    }

    if (weightSum === 0) return 0;
    return (scoreSum / weightSum) * 100;
  }

  /**
   * Utility helper to extract a single currency target number from raw strings.
   * Extracts e.g. "under 5000 INR" -> 5000, "$150" -> 150.
   */
  public static parseNumericBudget(budgetString: string): number {
    const cleaned = budgetString.replace(/[,]/g, '');
    const match = cleaned.match(/\b\d+\b/);
    if (match) {
      return parseInt(match[0], 10);
    }
    return 0;
  }
}
