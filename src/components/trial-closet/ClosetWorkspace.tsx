import React from 'react';
import { ShoppingProduct } from '@/types/stylist';
import { Maximize2, Trash2, X, Shirt } from 'lucide-react';

export interface ClosetWorkspaceProps {
  items: ShoppingProduct[];
  onRemoveItem: (productId: string) => void;
  onClearCloset: () => void;
}

/**
 * World-class Closet Workspace panel matching screenshot layout.
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {items.length > 0 && (
            <button onClick={onClearCloset} className="closet-clear-btn" aria-label="Clear closet">
              <Trash2 size={14} />
            </button>
          )}
          <button className="closet-clear-btn" style={{ cursor: 'pointer' }} aria-label="Expand closet">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="closet-empty-state">
          {/* Glowing hanger wrapper circle */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            background: 'rgba(168, 85, 247, 0.05)',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a855f7',
            marginBottom: '10px'
          }}>
            <Shirt size={22} />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Your closet is empty.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Click "Try" on recommended outfit items to mix and match.
          </p>
        </div>
      ) : (
        <div className="closet-items-list">
          {items.map((item) => (
            <div key={item.id} className="closet-item-row">
              <div className="closet-item-icon-box" style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.05)' }}>
                <Shirt size={14} />
              </div>
              <div className="closet-item-info">
                <span className="closet-item-title">{item.title}</span>
                <span className="closet-item-meta">{item.brand}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="closet-item-price">₹{item.price.toLocaleString('en-IN')}</span>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="closet-item-remove-btn"
                  aria-label="Remove item"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="closet-footer">
        <span className="closet-total-label">Total Outfit Cost</span>
        <span className="closet-total-price" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          ₹{totalPrice.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
};

export default ClosetWorkspace;
