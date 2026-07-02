/**
 * Shared Type Definitions for Drip AI Fashion Stylist
 */

export interface ShoppingProduct {
  id: string;             // Unique identifier from provider
  title: string;          // Product display title
  price: number;          // Product cost
  currency: string;       // Currency label, e.g., "INR" or "USD"
  imageUrl: string;       // Direct URL link to product thumbnail
  shoppingUrl: string;    // Retail merchant purchase URL
  brand: string;          // Clothing line / Brand label (e.g. Zara)
  providerName: string;   // Provider source tag (e.g. "zara", "myntra")
  matchScore: number;     // Evaluation confidence score (0 - 100)
}

export interface BlueprintItem {
  category: 'top' | 'bottom' | 'shoes' | 'accessories';
  styleDescription: string; // The styling guidance query, e.g. "oversized linen shirt"
  estimatedCostINR: number; // Approximate budget target
}

export interface OutfitBlueprint {
  outfitName: string;       // Dynamic design name, e.g., "Midnight Elegance"
  styleExplanation: string; // Short styling tone justification
  colorPalette: string[];   // Collection of HEX color values matching look
  items: BlueprintItem[];   // Required components
}

export interface OutfitRecommendation {
  id: string;               // Generated UUID for local references
  outfitName: string;       // e.g. "Midnight Elegance"
  styleExplanation: string; // Styling tips
  colorPalette: string[];
  items: {
    top?: ShoppingProduct;
    bottom?: ShoppingProduct;
    shoes?: ShoppingProduct;
    accessories?: ShoppingProduct;
  };
  totalCost: number;
}

export interface TrialClosetState {
  items: ShoppingProduct[]; // Collection of clothes currently coordinate-checked
}
