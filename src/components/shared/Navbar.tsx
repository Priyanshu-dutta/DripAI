import React, { useState } from 'react';
import { Sparkles, Shirt, Sun, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export interface NavbarProps {
  closetCount: number;
  onOpenCloset: () => void;
  onOpenAuth: () => void;
}

/**
 * World-class pill-shaped floating header matching user's design.
 */
export const Navbar: React.FC<NavbarProps> = ({ closetCount, onOpenCloset, onOpenAuth }) => {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
  };

  return (
    <header className="main-header" style={{ zIndex: 100 }}>
      <div className="nav-container">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => window.location.reload()}>
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

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

          {user ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="nav-btn profile-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 500
                }}
              >
                <UserIcon size={12} style={{ color: '#a855f7' }} />
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email?.split('@')[0]}
                </span>
                <ChevronDown size={11} style={{ opacity: 0.6 }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '180px',
                  background: 'rgba(15, 15, 15, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '6px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(12px)',
                  zIndex: 10
                }}>
                  <div style={{
                    padding: '8px 10px',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    Logged in as:<br/>
                    <strong style={{ color: 'var(--text-primary)' }}>{user.email}</strong>
                  </div>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left',
                      transition: 'background 0.2s'
                    }}
                    className="dropdown-item-hover"
                  >
                    <LogOut size={12} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="prompt-submit-btn drip-submit-gradient"
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                height: 'auto'
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
