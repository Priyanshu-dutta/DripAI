import React from 'react';
import '@/styles/globals.css';

export const metadata = {
  title: 'Drip AI — Personal Fashion Stylist',
  description: 'AI-powered fashion stylist recommending complete outfit plans based on natural language prompts.',
};

/**
 * Root Layout wrapper for the App router.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="main-header">
          <nav className="nav-container">
            <span className="logo">DRIP AI</span>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
