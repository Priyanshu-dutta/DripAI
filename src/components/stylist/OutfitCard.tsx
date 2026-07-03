import React from 'react';
import ProductCard from './ProductCard';
import { OutfitRecommendation, ShoppingProduct } from '@/types/stylist';
import { Info } from 'lucide-react';

export interface OutfitCardProps {
  recommendation: OutfitRecommendation;
  closetItems: ShoppingProduct[];
  onAddToCloset: (item: ShoppingProduct) => void;
}

/**
 * OutfitCard displays complete styling sets along with color palettes and curated items.
 */
export const OutfitCard: React.FC<OutfitCardProps> = ({
  recommendation,
  closetItems,
  onAddToCloset
}) => {
  // Helper to check if a specific product is placed in the closet drawer
  const isItemInCloset = (product?: ShoppingProduct) => {
    if (!product) return false;
    return closetItems.some((item) => item.id === product.id);
  };

  return (
    <article className="outfit-card-wrapper">
      <header className="outfit-header">
        <div className="outfit-title-group">
          <h2 className="outfit-title">{recommendation.outfitName}</h2>
          <div className="outfit-meta">
            <span>Style Recommendations</span>
            <span style={{ color: 'var(--text-muted)' }}>&bull;</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Info size={12} /> Curated AI Outfitting
            </span>
          </div>
        </div>
        <div className="outfit-price-badge">
          Est. Cost: ₹{recommendation.totalCost.toLocaleString('en-IN')}
        </div>
      </header>

      <p className="outfit-explanation">{recommendation.styleExplanation}</p>

      {/* Color Palette visualization */}
      {recommendation.colorPalette && recommendation.colorPalette.length > 0 && (
        <div className="outfit-color-palette">
          <span className="outfit-color-palette-label">Palette Colorway</span>
          {recommendation.colorPalette.map((color, idx) => (
            <span
              key={idx}
              className="color-swatch"
              style={{ backgroundColor: color }}
              title={`HEX: ${color}`}
            />
          ))}
        </div>
      )}

      {/* Items layout grid */}
      <div className="outfit-items-grid">
        {recommendation.items.top && (
          <ProductCard
            product={recommendation.items.top}
            category="top"
            onAddToCloset={onAddToCloset}
            isInCloset={isItemInCloset(recommendation.items.top)}
          />
        )}
        {recommendation.items.bottom && (
          <ProductCard
            product={recommendation.items.bottom}
            category="bottom"
            onAddToCloset={onAddToCloset}
            isInCloset={isItemInCloset(recommendation.items.bottom)}
          />
        )}
        {recommendation.items.shoes && (
          <ProductCard
            product={recommendation.items.shoes}
            category="shoes"
            onAddToCloset={onAddToCloset}
            isInCloset={isItemInCloset(recommendation.items.shoes)}
          />
        )}
        {recommendation.items.accessories && (
          <ProductCard
            product={recommendation.items.accessories}
            category="accessories"
            onAddToCloset={onAddToCloset}
            isInCloset={isItemInCloset(recommendation.items.accessories)}
          />
        )}
      </div>
    </article>
  );
};

export default OutfitCard;
