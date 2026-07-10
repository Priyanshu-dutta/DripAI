import React from 'react';
import { Shirt, Footprints, Sparkles, ShoppingBag, Plus, Check } from 'lucide-react';
import { ShoppingProduct } from '@/types/stylist';

export interface ProductCardProps {
  product: ShoppingProduct;
  category: 'top' | 'bottom' | 'shoes' | 'accessories';
  onAddToCloset: (item: ShoppingProduct) => void;
  isInCloset: boolean;
}

/**
 * High-fidelity Product Card presenting brand, price, shopping URL and mix-match closet selectors.
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  category,
  onAddToCloset,
  isInCloset
}) => {
  // Render category icons dynamically
  const getCategoryIcon = () => {
    switch (category) {
      case 'top':
        return <Shirt size={26} className="product-category-icon" />;
      case 'shoes':
        return <Footprints size={26} className="product-category-icon" />;
      case 'accessories':
        return <Sparkles size={26} className="product-category-icon" />;
      default:
        return <ShoppingBag size={26} className="product-category-icon" />; // fallback for bottoms
    }
  };

  return (
    <div className="product-card-wrapper">
      <div className="product-image-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : null}
        <div className="product-mock-image-glow" style={{ zIndex: 1 }} />
        {!product.imageUrl && getCategoryIcon()}
        <span className="product-match-badge" style={{ zIndex: 2 }}>{product.matchScore}% match</span>
      </div>

      <div className="product-info">
        <span className="product-brand">{product.brand}</span>
        <h4 className="product-title" title={product.title}>
          {product.title}
        </h4>

        <div className="product-footer">
          <span className="product-price">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <button
            onClick={() => onAddToCloset(product)}
            className={`product-action-btn ${isInCloset ? 'added' : ''}`}
            aria-label={isInCloset ? 'Remove from closet' : 'Add to closet'}
          >
            {isInCloset ? <Check size={14} /> : <Plus size={14} />}
            <span>{isInCloset ? 'In Closet' : 'Try'}</span>
          </button>
        </div>

        <a
          href={product.shoppingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shop-link"
        >
          <span>Shop Link</span>
          <ArrowUpRight size={12} />
        </a>
      </div>
    </div>
  );
};

// Quick arrow icon helper
const ArrowUpRight = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

export default ProductCard;
