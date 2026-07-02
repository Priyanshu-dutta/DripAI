import React from 'react';
import { ShoppingProduct } from '@/types/stylist';

export interface ProductCardProps {
  product: ShoppingProduct;
  onAddToCloset: () => void;
  isInCloset: boolean;
}

/**
 * ProductCard displays specific details for isolated products along with store redirect links.
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCloset,
  isInCloset
}) => {
  return (
    <div className="product-card-wrapper">
      <div className="product-image-container">
        {/* Placeholder image tag */}
        <span className="product-match-badge">{product.matchScore}% Match</span>
      </div>
      <div className="product-info">
        <span className="product-brand">{product.brand}</span>
        <h4 className="product-title">{product.title}</h4>
        <div className="product-footer">
          <span className="product-price">{product.currency} {product.price}</span>
          <button onClick={onAddToCloset}>
            {isInCloset ? 'In Closet' : 'Try in Closet'}
          </button>
        </div>
        <a href={product.shoppingUrl} target="_blank" rel="noopener noreferrer" className="shop-link">
          Buy on {product.providerName} &rarr;
        </a>
      </div>
    </div>
  );
};
export default ProductCard;
