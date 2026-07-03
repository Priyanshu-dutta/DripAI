import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Minimalist modern Footer.
 */
export const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
            <Sparkles size={14} />
            <span>DRIP AI</span>
          </div>
          <p>AI-Powered Personal Fashion Stylist</p>
        </div>

        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Security</a>
          <a href="https://github.com/Priyanshu-dutta/DripAI" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>

        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} Drip AI. Designed for portfolios.
        </div>
      </div>
    </footer>
  );
};
export default Footer;
