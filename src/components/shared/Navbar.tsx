import React from 'react';
import { Sparkles, Shirt, Sun } from 'lucide-react';

export interface NavbarProps {
  closetCount: number;
  onOpenCloset: () => void;
}

/**
 * World-class pill-shaped floating header matching user's design.
 */
export const Navbar: React.FC<NavbarProps> = ({ closetCount, onOpenCloset }) => {
  return (
    <header className="main-header">
      <div className="nav-container">
        <div className="logo">
          <Sparkles size={16} style={{ color: '#fff' }} />
          <span>DRIP AI</span>
        </div>

        <nav className="nav-links">
          <a href="#" className="nav-link active-pill">Stylist</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="#pricing" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span>Pricing</span>
            <span style={{
              fontSize: '0.625rem',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '4px',
              padding: '1px 5px',
              color: 'var(--text-secondary)',
              marginLeft: '6px',
              fontWeight: 500
            }}>Soon</span>
          </a>
          <a href="#docs" className="nav-link">API Docs</a>
        </nav>

        <div className="nav-actions">
          <button className="theme-toggle-btn" aria-label="Toggle theme" style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s'
          }}>
            <Sun size={16} />
          </button>
          
          <button className="nav-btn closet-btn" onClick={onOpenCloset}>
            <Shirt size={14} />
            <span>Closet</span>
            {closetCount > 0 && (
              <span className="closet-badge">
                {closetCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
