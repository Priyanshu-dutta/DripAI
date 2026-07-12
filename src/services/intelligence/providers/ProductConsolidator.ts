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
    const groups: { primary: IntelligenceProduct; candidates: IntelligenceProduct[] }[] = [];
    const urlMap = new Map<string, number>();
    const idMap = new Map<string, number>();
    const titleMap = new Map<string, number>();

    for (const item of products) {
      const canonicalTitle = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
      const titleKey = `${item.brand.toLowerCase()}_${canonicalTitle}_${item.category}`;
      const urlKey = item.retailerUrl;
      const idKey = item.id;

      // Check if this item matches any existing group by ID, URL, or Title key
      let matchedGroupIdx = -1;

      if (idKey && idMap.has(idKey)) {
        matchedGroupIdx = idMap.get(idKey)!;
      } else if (urlKey && urlKey !== '#' && urlMap.has(urlKey)) {
        matchedGroupIdx = urlMap.get(urlKey)!;
      } else if (titleMap.has(titleKey)) {
        matchedGroupIdx = titleMap.get(titleKey)!;
      }

      if (matchedGroupIdx !== -1) {
        // Group match: append candidate to existing group
        groups[matchedGroupIdx].candidates.push(item);
      } else {
        // No match: create a new consolidation group
        const newGroupIdx = groups.length;
        groups.push({ primary: item, candidates: [item] });
        
        if (idKey) idMap.set(idKey, newGroupIdx);
        if (urlKey && urlKey !== '#') urlMap.set(urlKey, newGroupIdx);
        titleMap.set(titleKey, newGroupIdx);
      }
    }

    const consolidatedList: IntelligenceProduct[] = [];

    for (const group of groups) {
      if (group.candidates.length === 1) {
        consolidatedList.push(group.primary);
      } else {
        // Sort candidates by price ascending
        group.candidates.sort((a, b) => a.price - b.price);

        const cheapestItem = group.candidates[0];
        
        // Collate alternative offers from secondary candidates, avoiding redundant entries
        const alternateOffersMap = new Map<string, { retailer: string; price: number; currency: string; retailerUrl: string }>();
        
        for (const c of group.candidates.slice(1)) {
          const key = `${c.retailer.toLowerCase()}_${c.price}`;
          if (!alternateOffersMap.has(key)) {
            alternateOffersMap.set(key, {
              retailer: c.retailer,
              price: c.price,
              currency: c.currency,
              retailerUrl: c.retailerUrl
            });
          }
        }

        const alternateOffers = Array.from(alternateOffersMap.values());

        consolidatedList.push({
          ...cheapestItem,
          alternateOffers
        });
      }
    }

    return consolidatedList;
  }
}
