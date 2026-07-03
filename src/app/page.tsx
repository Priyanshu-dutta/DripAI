'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import PromptSection, { PromptFilters } from '@/components/stylist/PromptSection';
import OutfitCard from '@/components/stylist/OutfitCard';
import ClosetWorkspace from '@/components/trial-closet/ClosetWorkspace';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Drawer from '@/components/ui/Drawer';
import useTrialCloset from '@/hooks/useTrialCloset';
import { OutfitRecommendation } from '@/types/stylist';
import { MOCK_OUTFITS } from '@/utils/mockOutfits';
import { Sparkles } from 'lucide-react';

export default function WorkspacePage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'classy' | 'streetwear'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Initialize client-side state for Closet items
  const { closetItems, addToCloset, removeFromCloset, clearCloset } = useTrialCloset();

  const handlePromptSubmit = (promptText: string, filters: PromptFilters) => {
    if (loading) return;
    setLoading(true);
    setRecommendations([]);
    setActiveCategory('all'); // Reset filter tab for new queries

    // Simulate AI loading steps sequence (2.5 seconds total)
    setTimeout(() => {
      setLoading(false);
      setRecommendations(MOCK_OUTFITS);
    }, 2500);
  };

  // Category filter toggling based on curated styling tags
  const filteredRecommendations = recommendations.filter((rec) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'classy') return rec.outfitName.toLowerCase().includes('elegance');
    if (activeCategory === 'streetwear') return rec.outfitName.toLowerCase().includes('urban') || rec.outfitName.toLowerCase().includes('street');
    return true;
  });

  return (
    <>
      <Navbar closetCount={closetItems.length} onOpenCloset={() => setDrawerOpen(true)} />
      
      <main className="workspace-main">
        {/* Apple/Linear Hero section */}
        <section className="hero-section">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>Introducing Drip AI v1.0 MVP</span>
          </div>
          <h1>
            Your Personal <br />
            <span className="accent-text-gradient">AI Fashion Stylist</span>
          </h1>
          <p>
            Describe your vibe, budget, and occasion in natural language <br /> and get complete, coordinated outfits instantly.
          </p>
        </section>

        {/* Console Workspace Grid */}
        <div className="workspace-grid">
          
          {/* Left panel: Prompt Console & Outfit Results */}
          <div className="left-panel">
            <PromptSection onSubmit={handlePromptSubmit} isLoading={loading} />

            {/* Category Filter Chips */}
            {recommendations.length > 0 && !loading && (
              <div className="category-filters-container">
                <h4 className="category-filters-label">Refine Recommendations</h4>
                <div className="category-filters">
                  <button
                    className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                  >
                    All Outfits
                  </button>
                  <button
                    className={`filter-btn ${activeCategory === 'classy' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('classy')}
                  >
                    Classy
                  </button>
                  <button
                    className={`filter-btn ${activeCategory === 'streetwear' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('streetwear')}
                  >
                    Streetwear
                  </button>
                </div>
              </div>
            )}

            {/* Recommendations Deck */}
            <div className="recommendations-deck">
              {loading && <LoadingSkeleton />}

              {!loading && filteredRecommendations.length === 0 && (
                <div className="empty-results">
                  <div className="empty-icon-wrapper">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3>No outfits curated yet</h3>
                    <p>Enter a prompt above or click one of the quick suggestions to let the stylist build your outfits.</p>
                  </div>
                </div>
              )}

              {!loading && filteredRecommendations.map((rec) => (
                <OutfitCard
                  key={rec.id}
                  recommendation={rec}
                  closetItems={closetItems}
                  onAddToCloset={addToCloset}
                />
              ))}
            </div>
          </div>

          {/* Right panel: Sticky Trial Closet Drawer for desktop screens */}
          <div className="right-panel">
            <div className="desktop-closet-container" style={{ display: 'block' }}>
              <ClosetWorkspace
                items={closetItems}
                onRemoveItem={removeFromCloset}
                onClearCloset={clearCloset}
              />
            </div>
          </div>

        </div>
      </main>

      <Footer />

      {/* Drawer Overlay for Mobile / Alternative Closet Access */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Your Trial Closet"
      >
        <ClosetWorkspace
          items={closetItems}
          onRemoveItem={removeFromCloset}
          onClearCloset={clearCloset}
        />
      </Drawer>

      {/* Floating feedback widget matching bottom-left screenshot circle */}
      <div className="floating-feedback-widget" title="Feedback">
        <span>N</span>
        <span className="feedback-dot" />
      </div>
    </>
  );
}
