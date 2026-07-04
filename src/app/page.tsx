'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import PromptSection, { PromptFilters } from '@/components/stylist/PromptSection';
import OutfitCard from '@/components/stylist/OutfitCard';
import ProductCard from '@/components/stylist/ProductCard';
import ClosetWorkspace from '@/components/trial-closet/ClosetWorkspace';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Drawer from '@/components/ui/Drawer';
import useTrialCloset from '@/hooks/useTrialCloset';
import { OutfitRecommendation, ShoppingProduct } from '@/types/stylist';
import { MOCK_OUTFITS, MOCK_TABS } from '@/utils/mockOutfits';
import { Sparkles, Compass, Edit2 } from 'lucide-react';

interface BriefData {
  promptText: string;
  filters: PromptFilters;
}

export default function WorkspacePage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'classy' | 'streetwear'>('all');
  const [activeTab, setActiveTab] = useState<'tops' | 'bottoms' | 'shoes' | 'accessories'>('tops');
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Trial Closet local storage controller hooks
  const { closetItems, addToCloset, removeFromCloset, clearCloset } = useTrialCloset();

  const handlePromptSubmit = (promptText: string, filters: PromptFilters) => {
    if (loading) return;
    setLoading(true);
    setRecommendations([]);
    setBrief(null);

    // Simulate AI loading pipeline
    setTimeout(() => {
      setLoading(false);
      setRecommendations(MOCK_OUTFITS);
      setBrief({ promptText, filters });
    }, 2500);
  };

  const handleEditPrompt = () => {
    // Scroll prompt area into focus
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const textfield = document.querySelector('textarea');
    if (textfield) textfield.focus();
  };

  const handleViewDetails = (rec: OutfitRecommendation) => {
    // Add all items in this outfit to the trial closet dynamically
    if (rec.items.top) addToCloset(rec.items.top);
    if (rec.items.bottom) addToCloset(rec.items.bottom);
    if (rec.items.shoes) addToCloset(rec.items.shoes);
    if (rec.items.accessories) addToCloset(rec.items.accessories);
    
    // Open closet panel to show feedback
    setDrawerOpen(true);
  };

  const handleAddAllOutfitItems = () => {
    // Gather all items across all recommended outfits and add to closet
    recommendations.forEach(rec => {
      if (rec.items.top) addToCloset(rec.items.top);
      if (rec.items.bottom) addToCloset(rec.items.bottom);
      if (rec.items.shoes) addToCloset(rec.items.shoes);
      if (rec.items.accessories) addToCloset(rec.items.accessories);
    });
  };

  const isProductInCloset = (product: ShoppingProduct) => {
    return closetItems.some(item => item.id === product.id);
  };

  // Filter outfits by styling tone tag category
  const filteredRecommendations = recommendations.filter((rec) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'classy') return rec.outfitName.toLowerCase().includes('classy') || rec.outfitName.toLowerCase().includes('elegance');
    if (activeCategory === 'streetwear') return rec.outfitName.toLowerCase().includes('street') || rec.outfitName.toLowerCase().includes('urban');
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
          
          {/* 1. Left Panel: Style Brief (Visible after prompt submission) */}
          <div className="brief-panel">
            {brief && (
              <div className="style-brief-card">
                <div className="style-brief-title">
                  <Compass size={14} />
                  <span>Your Style Brief</span>
                </div>
                <blockquote className="style-brief-quote">
                  "{brief.promptText}"
                </blockquote>
                <div className="style-brief-criteria">
                  <div className="criteria-item">
                    <span className="criteria-label">Occasion</span>
                    <span className="criteria-value" style={{ textTransform: 'capitalize' }}>
                      {brief.filters.occasion || 'College Farewell'}
                    </span>
                  </div>
                  <div className="criteria-item">
                    <span className="criteria-label">Budget</span>
                    <span className="criteria-value">₹{brief.filters.budget}</span>
                  </div>
                  <div className="criteria-item">
                    <span className="criteria-label">Style</span>
                    <span className="criteria-value" style={{ textTransform: 'capitalize' }}>
                      {brief.filters.style || 'Classy'}
                    </span>
                  </div>
                  <div className="criteria-item">
                    <span className="criteria-label">Color Preference</span>
                    <span className="criteria-value">All Black</span>
                  </div>
                  <div className="criteria-item">
                    <span className="criteria-label">Fit</span>
                    <span className="criteria-value" style={{ textTransform: 'capitalize' }}>
                      {brief.filters.fit}
                    </span>
                  </div>
                  <div className="criteria-item">
                    <span className="criteria-label">Gender</span>
                    <span className="criteria-value" style={{ textTransform: 'capitalize' }}>
                      {brief.filters.gender}
                    </span>
                  </div>
                </div>
                <button onClick={handleEditPrompt} className="edit-brief-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Edit2 size={12} />
                  <span>Edit Prompt</span>
                </button>
              </div>
            )}
          </div>
          
          {/* 2. Middle Panel: Outfit Recommendations and Individual Items */}
          <div className="middle-panel">
            {/* Input prompt console at top center */}
            <PromptSection onSubmit={handlePromptSubmit} isLoading={loading} />

            {loading && <LoadingSkeleton />}

            {/* Empty State placeholder */}
            {!loading && recommendations.length === 0 && (
              <div className="empty-results">
                <div className="empty-icon-wrapper">
                  <Sparkles size={22} style={{ color: '#a855f7' }} />
                </div>
                <div>
                  <h3>No outfits curated yet</h3>
                  <p>Enter a prompt above or click one of the quick suggestions to let the stylist build your outfits.</p>
                </div>
              </div>
            )}

            {/* Recommendations Grid (Visible when recommendations loaded) */}
            {recommendations.length > 0 && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.05rem', letterSpacing: '-0.02em' }}>AI Outfit Recommendations</h3>
                  <span style={{ fontSize: '0.78rem', color: '#a855f7', cursor: 'pointer', fontWeight: 500 }}>View All</span>
                </div>

                <div className="outfits-grid-layout">
                  {filteredRecommendations.map((rec, idx) => (
                    <OutfitCard
                      key={rec.id}
                      recommendation={rec}
                      onViewDetails={handleViewDetails}
                      isBestMatch={idx === 0}
                    />
                  ))}
                </div>

                {/* Individual Products tabs list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <h3 style={{ fontSize: '1.05rem', letterSpacing: '-0.02em' }}>Individual Items</h3>
                  
                  <div className="items-tab-triggers">
                    {(['tops', 'bottoms', 'shoes', 'accessories'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`items-tab-trigger-btn ${activeTab === tab ? 'active' : ''}`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="items-tab-grid">
                    {MOCK_TABS[activeTab]?.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        category={activeTab === 'tops' ? 'top' : activeTab === 'bottoms' ? 'bottom' : activeTab}
                        onAddToCloset={addToCloset}
                        isInCloset={isProductInCloset(prod)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Right Panel: Pinned Trial Closet Workspace for desktop sizes */}
          <div className="right-panel">
            <ClosetWorkspace
              items={closetItems}
              onRemoveItem={removeFromCloset}
              onClearCloset={clearCloset}
              onAddAllToCloset={handleAddAllOutfitItems}
            />
          </div>

        </div>
      </main>

      <Footer />

      {/* Drawer Overlay for Mobile closet drawer operations */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Your Trial Closet"
      >
        <ClosetWorkspace
          items={closetItems}
          onRemoveItem={removeFromCloset}
          onClearCloset={clearCloset}
          onAddAllToCloset={handleAddAllOutfitItems}
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
