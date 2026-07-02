import React from 'react';
import { ShoppingProduct } from '@/types/stylist';

export interface ClosetWorkspaceProps {
  items: ShoppingProduct[];
  onRemoveItem: (productId: string) => void;
  onClearCloset: () => void;
}

/**
 * ClosetWorkspace acts as a client-side sandbox allowing users to mix items together
 * and instantly review price aggregation in real time.
 */
export const ClosetWorkspace: React.FC<ClosetWorkspaceProps> = ({
  items,
  onRemoveItem,
  onClearCloset
}) => {
  const totalPrice = items.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="closet-workspace-container">
      <div className="closet-header">
        <h3>Trial Closet</h3>
        <button onClick={onClearCloset}>Clear All</button>
      </div>

      <div className="closet-items-list">
        {items.map((item) => (
          <div key={item.id} className="closet-item-row">
            <span>{item.title}</span>
            <span>{item.currency} {item.price}</span>
            <button onClick={() => onRemoveItem(item.id)}>&times;</button>
          </div>
        ))}
      </div>

      <div className="closet-footer">
        <span>Total Cost:</span>
        <span>INR {totalPrice}</span>
      </div>
    </div>
  );
};
export default ClosetWorkspace;
