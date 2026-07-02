import React from 'react';
import { OutfitRecommendation } from '@/types/stylist';

export interface OutfitCardProps {
  recommendation: OutfitRecommendation;
  onAddToCloset: (item: any) => void;
}

/**
 * OutfitCard displays complete outfit suggestions under premium design names.
 */
export const OutfitCard: React.FC<OutfitCardProps> = ({ recommendation, onAddToCloset }) => {
  return (
    <div className="outfit-card-wrapper">
      <div className="outfit-header">
        <h2>{recommendation.outfitName}</h2>
        <span className="outfit-price">{recommendation.totalCost}</span>
      </div>
      <p className="outfit-explanation">{recommendation.styleExplanation}</p>
      
      <div className="outfit-items-grid">
        {/* Render product card blocks inside here */}
      </div>
    </div>
  );
};
export default OutfitCard;
