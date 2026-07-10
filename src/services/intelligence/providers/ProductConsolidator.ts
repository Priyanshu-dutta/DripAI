import { IntelligenceProduct } from '../../../types/product';

/**
 * Utility service to consolidate standard products retrieved from various retail channels.
 * Groups identical products, selects the cheapest offer, and logs alternatives.
 */
export class ProductConsolidator {
  /**
   * Merges duplicate products across retailers, resolving the lowest-price item
   * and populating the alternateOffers collection.
   */
  public static consolidate(products: IntelligenceProduct[]): IntelligenceProduct[] {
    const groupMap = new Map<string, { primary: IntelligenceProduct; candidates: IntelligenceProduct[] }>();

    for (const item of products) {
      // Generate a canonical signature using normalized brand and alpha-numeric title
      const canonicalTitle = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
      const signatureKey = `${item.brand.toLowerCase()}_${canonicalTitle}_${item.category}`;

      const existing = groupMap.get(signatureKey);
      if (existing) {
        existing.candidates.push(item);
      } else {
        groupMap.set(signatureKey, { primary: item, candidates: [item] });
      }
    }

    const consolidatedList: IntelligenceProduct[] = [];

    // Use forEach to iterate over Map values to avoid ES5 downlevelIteration compilation issues
    groupMap.forEach((group) => {
      if (group.candidates.length === 1) {
        consolidatedList.push(group.primary);
      } else {
        // Sort candidates by price ascending
        group.candidates.sort((a, b) => a.price - b.price);

        const cheapestItem = group.candidates[0];
        
        // Collate alternative offers from secondary candidates
        const alternateOffers = group.candidates.slice(1).map(c => ({
          retailer: c.retailer,
          price: c.price,
          currency: c.currency,
          retailerUrl: c.retailerUrl
        }));

        consolidatedList.push({
          ...cheapestItem,
          alternateOffers
        });
      }
    });

    return consolidatedList;
  }
}
