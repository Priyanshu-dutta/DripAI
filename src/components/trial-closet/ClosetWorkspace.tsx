import React from 'react';
import { ShoppingProduct } from '@/types/stylist';
import { Maximize2, X, Shirt } from 'lucide-react';

export interface ClosetWorkspaceProps {
  items: ShoppingProduct[];
  onRemoveItem: (productId: string) => void;
  onClearCloset: () => void;
  onAddAllToCloset?: () => void;
  budgetTarget?: number; // Added budgetTarget to show budget progress bar
}

/**
 * World-class Trial Closet Workspace panel matching screenshot layout.
 */
export const ClosetWorkspace: React.FC<ClosetWorkspaceProps> = ({
  items,
  onRemoveItem,
  onClearCloset,
  onAddAllToCloset,
  budgetTarget
}) => {
  const totalPrice = items.reduce((acc, curr) => acc + curr.price, 0);
  const budget = budgetTarget || 5000;
  const isOverBudget = totalPrice > budget;
  const percentage = Math.min((totalPrice / budget) * 100, 100);

  // Decide progress bar gradient color based on budget state
  const getProgressBarColor = () => {
    if (totalPrice > budget) return 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)';
    if (totalPrice > budget * 0.8) return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(90deg, #a855f7 0%, #3b82f6 100%)';
  };

  return (
    <div className="closet-workspace-container">
      <div className="closet-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3>Your Trial Closet</h3>
          <span style={{
            fontSize: '0.72rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '2px 8px',
            borderRadius: '100px',
            fontWeight: 600,
            color: 'var(--text-secondary)'
          }}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <button className="closet-clear-btn" style={{ cursor: 'pointer' }} aria-label="Expand closet">
          <Maximize2 size={14} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="closet-empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a855f7',
            margin: '0 auto 16px auto',
            position: 'relative'
          }}>
            {/* Hanger icon vector */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 17h20a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z" />
              <path d="M12 9a3 3 0 1 1 3 3H9" />
              <path d="M12 13V9" />
            </svg>
            <span style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: '8px',
              height: '8px',
              background: '#30d158',
              borderRadius: '50%',
              boxShadow: '0 0 8px #30d158'
            }} />
          </div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Your Closet is Empty</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '220px', margin: '0 auto' }}>
            Click the <strong style={{ color: '#a855f7' }}>"Try"</strong> button on recommended outfits or individual items to test coordinates.
          </p>
        </div>
      ) : (
        <div className="closet-items-list" style={{ flexGrow: 1, overflowY: 'auto', maxHeight: '320px', paddingRight: '4px' }}>
          {items.map((item) => (
            <div key={item.id} className="closet-item-row">
              <div className="closet-item-icon-box" style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.05)', flexShrink: 0 }}>
                <Shirt size={14} />
              </div>
              <div className="closet-item-info">
                <span className="closet-item-title">{item.title}</span>
                <span className="closet-item-meta">{item.brand}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
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

      {/* Closet footer cost indicators */}
      <div className="closet-footer" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '16px', marginTop: 'auto' }}>
        <span className="closet-total-label">Total Estimated Cost</span>
        <span className="closet-total-price" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          ₹{totalPrice.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Budget usage progress bar */}
      <div className="budget-progress-container" style={{ margin: '14px 0', width: '100%' }}>
        <div className="budget-progress-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          <span>Budget Usage</span>
          <span style={{ color: isOverBudget ? '#ef4444' : 'var(--text-primary)', fontWeight: 600 }}>
            {Math.round((totalPrice / budget) * 100)}% (Max ₹{budget.toLocaleString('en-IN')})
          </span>
        </div>
        <div className="budget-progress-bar-bg" style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', overflow: 'hidden' }}>
          <div className="budget-progress-bar-fill" style={{
            width: `${percentage}%`,
            height: '100%',
            background: getProgressBarColor(),
            borderRadius: '10px',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
        </div>
      </div>

      {/* Bottom Action buttons matching screenshot */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {onAddAllToCloset && (
          <button
            onClick={onAddAllToCloset}
            className="prompt-submit-btn drip-submit-gradient"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '10px' }}
          >
            Add All to Closet
          </button>
        )}
        {items.length > 0 && (
          <button
            onClick={onClearCloset}
            className="edit-brief-btn"
            style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }}
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default ClosetWorkspace;
