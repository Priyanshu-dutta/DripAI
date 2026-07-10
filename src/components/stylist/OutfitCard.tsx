import React from 'react';
import { OutfitRecommendation } from '@/types/stylist';
import { Heart, Sparkles, Shirt } from 'lucide-react';

export interface OutfitCardProps {
  recommendation: OutfitRecommendation;
  onViewDetails: (recommendation: OutfitRecommendation) => void;
  isBestMatch?: boolean;
  isActive?: boolean; // Track if the card is highlighted/active
  onSelect?: () => void; // Trigger callback on card selection
  onSave?: (recommendation: OutfitRecommendation) => void;
  isSaved?: boolean;
}

/**
 * Compact, premium Outfit Card matching the user's screenshot structure.
 */
export const OutfitCard: React.FC<OutfitCardProps> = ({
  recommendation,
  onViewDetails,
  isBestMatch = false,
  isActive = false,
  onSelect,
  onSave,
  isSaved = false
}) => {
  // Extract tags from explanation or name dynamically
  const getTags = () => {
    if (recommendation.outfitName.toLowerCase().includes('classy')) return ['Classy', 'Oversized', 'All Black'];
    if (recommendation.outfitName.toLowerCase().includes('street')) return ['Streetwear', 'Oversized', 'All Black'];
    if (recommendation.outfitName.toLowerCase().includes('minimal')) return ['Minimal', 'Elegant', 'All Black'];
    return ['Urban', 'Oversized', 'All Black'];
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only select if they didn't click the primary action button
    const target = e.target as HTMLElement;
    if (target.closest('.outfit-details-action') || target.closest('.favorite-btn')) {
      return;
    }
    if (onSelect) onSelect();
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) onSave(recommendation);
  };

  return (
    <div 
      className={`compact-outfit-card ${isActive ? 'active' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: onSelect ? 'pointer' : 'default', border: isActive ? '1px solid #a855f7' : '1px solid var(--glass-border)' }}
    >
      {/* Visual Image/Composite Container */}
      <div className="outfit-image-preview">
        <div className="outfit-preview-overlay" />
        
        {/* Match rating badge */}
        <div style={{ display: 'flex', gap: '6px', position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
          {isBestMatch && (
            <span className="best-match-badge">Best Match</span>
          )}
          <span className="match-percent-badge">
            {isBestMatch ? '96%' : recommendation.items.top?.matchScore || '92'}% Match
          </span>
        </div>

        {/* Favorite outline icon */}
        <button 
          className="favorite-btn" 
          onClick={handleFavoriteClick}
          aria-label="Favorite outfit"
          style={{
            color: isSaved ? '#ff4f79' : 'rgba(255, 255, 255, 0.6)',
            background: isSaved ? 'rgba(255, 79, 121, 0.15)' : 'rgba(0, 0, 0, 0.4)',
            border: isSaved ? '1px solid rgba(255, 79, 121, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
            transform: isSaved ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          <Heart size={14} fill={isSaved ? '#ff4f79' : 'none'} />
        </button>

        {/* Abstract Category Stack Graphic representation */}
        <div className="preview-graphic-stack">
          <Shirt size={42} style={{ opacity: 0.15, transform: 'scale(1.1)' }} />
        </div>
      </div>

      {/* Outfit Information */}
      <div className="outfit-details-body">
        <h4 className="outfit-details-title" title={recommendation.outfitName}>
          {recommendation.outfitName}
        </h4>
        <div className="outfit-details-price">
          ₹{recommendation.totalCost.toLocaleString('en-IN')}
        </div>

        {/* Tags */}
        <div className="outfit-details-tags">
          {getTags().map((tag, i) => (
            <span key={i} className="outfit-details-tag-pill">{tag}</span>
          ))}
        </div>

        {/* View Details action button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(recommendation);
          }}
          className="outfit-details-action"
        >
          <span>View Details</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

const ArrowRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default OutfitCard;
