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
import BackgroundGlow from '@/components/shared/BackgroundGlow';
import useTrialCloset from '@/hooks/useTrialCloset';
import { OutfitRecommendation, ShoppingProduct } from '@/types/stylist';
import { MOCK_OUTFITS, MOCK_TABS } from '@/utils/mockOutfits';
import { Sparkles, Compass, Edit2, TrendingUp, BarChart2, Award, BookOpen, Lightbulb } from 'lucide-react';

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
  const [activeOutfitId, setActiveOutfitId] = useState<string | null>(null); // Track selected outfit card

  // Trial Closet hooks
  const { closetItems, addToCloset, removeFromCloset, clearCloset } = useTrialCloset();

  const handlePromptSubmit = (promptText: string, filters: PromptFilters) => {
    if (loading) return;
    setLoading(true);
    setRecommendations([]);
    setBrief(null);
    setActiveOutfitId(null);

    // Simulate AI loading pipeline
    setTimeout(() => {
      setLoading(false);
      setRecommendations(MOCK_OUTFITS);
      setActiveOutfitId(MOCK_OUTFITS[0]?.id || null);
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
    
    // Open mobile closet drawer
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
      {/* Dynamic Background Particle System */}
      <BackgroundGlow />

      <Navbar closetCount={closetItems.length} onOpenCloset={() => setDrawerOpen(true)} />
      
      <main className="workspace-main" style={{ maxWidth: '1440px' }}>
        {/* Compact Dashboard Workspace Header */}
        <section className="hero-section" style={{ padding: '0px 0 8px 0', marginBottom: '8px' }}>
          <div className="hero-badge" style={{ marginBottom: '6px' }}>
            <span className="hero-badge-dot" />
            <span>Drip AI v1.0 Stylist Dashboard</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '4px', lineHeight: '1.15' }}>
            Personal <span className="accent-text-gradient">AI Fashion Stylist</span>
          </h1>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: '0 auto', maxWidth: '500px' }}>
            Curate coordinates, coordinate budgets, and explore visual fits instantly.
          </p>
        </section>

        {/* Two-Column Grid Layout (73% Main content / 27% Sidebar) */}
        <div className="workspace-grid">
          
          {/* Column 1: Main Content Column (73% width on Desktop) */}
          <div className="main-content-column">
            
            {/* Input prompt console at top */}
            <PromptSection onSubmit={handlePromptSubmit} isLoading={loading} />

            {loading && <LoadingSkeleton />}

            {/* Exploration Dashboard Hub (Shown when recommendations are empty) */}
            {!loading && recommendations.length === 0 && (
              <div className="exploration-dashboard">
                {/* Left side: Curated style templates */}
                <div className="dashboard-section">
                  <h3>
                    <Sparkles size={13} style={{ color: '#a855f7' }} />
                    <span>Curated Style Templates</span>
                  </h3>
                  
                  <div className="dashboard-grid-layout style-starters">
                    <button 
                      className="starter-card"
                      onClick={() => handlePromptSubmit(
                        "I want a smart casual date night outfit in classy beige linen tones", 
                        { occasion: 'date', budget: '10000', style: 'classy', fit: 'relaxed', gender: 'men', season: 'summer' }
                      )}
                    >
                      <div className="starter-card-title">
                        <span>Quiet Luxury Minimalist</span>
                        <Sparkles size={11} style={{ color: '#a855f7' }} />
                      </div>
                      <p className="starter-card-desc">
                        A refined, monochromatic beige linen coordinate suited for high-end dining and summer evenings.
                      </p>
                      <div className="starter-card-tags">
                        <span className="outfit-details-tag-pill">Beige</span>
                        <span className="outfit-details-tag-pill">Relaxed</span>
                        <span className="outfit-details-tag-pill">Classy</span>
                      </div>
                    </button>

                    <button 
                      className="starter-card"
                      onClick={() => handlePromptSubmit(
                        "I want an oversized techwear look with black utility cargo pants and a street hoodie", 
                        { occasion: 'casual', budget: '5000', style: 'streetwear', fit: 'oversized', gender: 'unisex', season: 'winter' }
                      )}
                    >
                      <div className="starter-card-title">
                        <span>Cyberpunk Techwear</span>
                        <Sparkles size={11} style={{ color: '#a855f7' }} />
                      </div>
                      <p className="starter-card-desc">
                        An all-black utility coordinate prioritizing pocket depth, modular layers, and relaxed street silhouettes.
                      </p>
                      <div className="starter-card-tags">
                        <span className="outfit-details-tag-pill">All Black</span>
                        <span className="outfit-details-tag-pill">Oversized</span>
                        <span className="outfit-details-tag-pill">Streetwear</span>
                      </div>
                    </button>

                    <button 
                      className="starter-card"
                      onClick={() => handlePromptSubmit(
                        "A clean minimal style beige summer brunch fit for men under 5000", 
                        { occasion: 'brunch', budget: '5000', style: 'classy', fit: 'regular', gender: 'men', season: 'summer' }
                      )}
                    >
                      <div className="starter-card-title">
                        <span>Minimalist Brunch Classic</span>
                        <Sparkles size={11} style={{ color: '#a855f7' }} />
                      </div>
                      <p className="starter-card-desc">
                        Light, breathable cream separates paired with structured smart loaders for warm outdoor brunches.
                      </p>
                      <div className="starter-card-tags">
                        <span className="outfit-details-tag-pill">Cream</span>
                        <span className="outfit-details-tag-pill">Regular</span>
                        <span className="outfit-details-tag-pill">Brunch</span>
                      </div>
                    </button>

                    <button 
                      className="starter-card"
                      onClick={() => handlePromptSubmit(
                        "Street royalty oversized hoodie and baggy pants with sneakers under 5000", 
                        { occasion: 'casual', budget: '5000', style: 'streetwear', fit: 'oversized', gender: 'unisex', season: 'any' }
                      )}
                    >
                      <div className="starter-card-title">
                        <span>Street Royalty Coordinates</span>
                        <Sparkles size={11} style={{ color: '#a855f7' }} />
                      </div>
                      <p className="starter-card-desc">
                        Oversized coordinate combining comfortable heavyweight hoodies with deep black baggy skate cargos.
                      </p>
                      <div className="starter-card-tags">
                        <span className="outfit-details-tag-pill">Urban</span>
                        <span className="outfit-details-tag-pill">Oversized</span>
                        <span className="outfit-details-tag-pill">Streetwear</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Right side: AI Trend Tracker Widget */}
                <div className="dashboard-section">
                  <h3>
                    <TrendingUp size={13} style={{ color: '#a855f7' }} />
                    <span>Active Trend Tracker</span>
                  </h3>
                  
                  <div className="heatmap-card">
                    <div className="trend-item">
                      <div className="trend-meta">
                        <span>Oversized Drapes & Drops</span>
                        <span>94% Trend Velocity</span>
                      </div>
                      <div className="trend-bar-bg">
                        <div className="trend-bar-fill" style={{ width: '94%' }} />
                      </div>
                    </div>

                    <div className="trend-item">
                      <div className="trend-meta">
                        <span>Monochromatic Neutrals</span>
                        <span>82% Trend Velocity</span>
                      </div>
                      <div className="trend-bar-bg">
                        <div className="trend-bar-fill" style={{ width: '82%' }} />
                      </div>
                    </div>

                    <div className="trend-item">
                      <div className="trend-meta">
                        <span>Utility Cargos & Strap Harnesses</span>
                        <span>71% Trend Velocity</span>
                      </div>
                      <div className="trend-bar-bg">
                        <div className="trend-bar-fill" style={{ width: '71%' }} />
                      </div>
                    </div>

                    <div className="trend-item">
                      <div className="trend-meta">
                        <span>Sage Green / Washed Canvas</span>
                        <span>65% Trend Velocity</span>
                      </div>
                      <div className="trend-bar-bg">
                        <div className="trend-bar-fill" style={{ width: '65%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Grid (Split Layout with Brief inside Left Column on load) */}
            {recommendations.length > 0 && !loading && (
              <div className="results-split-container">
                {/* Inline Style Brief Sidebar Box */}
                {brief && (
                  <div className="brief-aside-box">
                    <div className="style-brief-card" style={{ position: 'sticky', top: '92px' }}>
                      <div className="style-brief-title">
                        <Compass size={14} />
                        <span>Style Brief</span>
                      </div>
                      <blockquote className="style-brief-quote">
                        "{brief.promptText}"
                      </blockquote>
                      <div className="style-brief-criteria">
                        <div className="criteria-item">
                          <span className="criteria-label">Occasion</span>
                          <span className="criteria-value" style={{ textTransform: 'capitalize' }}>
                            {brief.filters.occasion || 'Farewell'}
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
                      <button onClick={handleEditPrompt} className="edit-brief-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Edit2 size={12} />
                        <span>Edit Prompt</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Recommendations List and Individual Items Grid Box */}
                <div className="results-main-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>AI Outfit Recommendations</h3>
                    <span style={{ fontSize: '0.78rem', color: '#a855f7', cursor: 'pointer', fontWeight: 500 }}>View All</span>
                  </div>

                  <div className="outfits-grid-layout">
                    {filteredRecommendations.map((rec, idx) => (
                      <OutfitCard
                        key={rec.id}
                        recommendation={rec}
                        onViewDetails={handleViewDetails}
                        isBestMatch={idx === 0}
                        isActive={activeOutfitId === rec.id}
                        onSelect={() => setActiveOutfitId(rec.id)}
                      />
                    ))}
                  </div>

                  {/* Individual Products tabs list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Individual Items</h3>
                    
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
              </div>
            )}
          </div>

          {/* Column 2: Right Panel Dashboard Column (27% width on Desktop) */}
          <div className="right-panel">
            {/* Widget 1: Trial Closet Workspace */}
            <ClosetWorkspace
              items={closetItems}
              onRemoveItem={removeFromCloset}
              onClearCloset={clearCloset}
              onAddAllToCloset={handleAddAllOutfitItems}
              budgetTarget={brief ? parseInt(brief.filters.budget) : 5000}
            />

            {/* Widget 2: Style Analytics Dashboard Card (Before recommendations: Trending stats) */}
            {recommendations.length === 0 && (
              <div className="sidebar-card">
                <span className="sidebar-card-title">
                  <BarChart2 size={13} style={{ color: '#a855f7' }} />
                  <span>Global Style Analytics</span>
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Fit Distribution Stats */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>Oversized Fit popularity</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>88%</span>
                    </div>
                    <div className="trend-bar-bg" style={{ height: '4px' }}>
                      <div className="trend-bar-fill" style={{ width: '88%', background: '#a855f7' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>Regular Fit popularity</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>64%</span>
                    </div>
                    <div className="trend-bar-bg" style={{ height: '4px' }}>
                      <div className="trend-bar-fill" style={{ width: '64%', background: '#3b82f6' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>Slim Fit popularity</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>15%</span>
                    </div>
                    <div className="trend-bar-bg" style={{ height: '4px' }}>
                      <div className="trend-bar-fill" style={{ width: '15%', background: '#10b981' }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.6, fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Daily Style Quote
                  </span>
                  <blockquote className="sidebar-quote" style={{ fontSize: '0.8rem', paddingLeft: '8px' }}>
                    "Style is a way to say who you are without speaking."
                    <span className="sidebar-quote-author" style={{ fontSize: '0.65rem' }}>— R. Zoe</span>
                  </blockquote>
                </div>

                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.6, fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Suggested Palette
                  </span>
                  <div className="sidebar-palette-swatch-group">
                    <span className="sidebar-palette-swatch-circle" style={{ backgroundColor: '#D2B48C' }} title="Tan" />
                    <span className="sidebar-palette-swatch-circle" style={{ backgroundColor: '#F5F5DC' }} title="Beige" />
                    <span className="sidebar-palette-swatch-circle" style={{ backgroundColor: '#2E3033' }} title="Charcoal" />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Warm Earth</span>
                  </div>
                </div>
              </div>
            )}

            {/* Widget 2: Contextual AI Outfit Analytics (After recommendations: Custom metrics) */}
            {recommendations.length > 0 && (() => {
              const activeOutfit = recommendations.find(r => r.id === activeOutfitId) || recommendations[0];
              if (!activeOutfit) return null;

              const topCost = activeOutfit.items.top?.price || 0;
              const bottomCost = activeOutfit.items.bottom?.price || 0;
              const shoesCost = activeOutfit.items.shoes?.price || 0;
              const accCost = activeOutfit.items.accessories?.price || 0;
              const totalCost = (topCost + bottomCost + shoesCost + accCost) || 1;

              const topPct = (topCost / totalCost) * 100;
              const bottomPct = (bottomCost / totalCost) * 100;
              const shoesPct = (shoesCost / totalCost) * 100;
              const accPct = (accCost / totalCost) * 100;

              return (
                <div className="sidebar-card">
                  <span className="sidebar-card-title">
                    <Award size={13} style={{ color: '#a855f7' }} />
                    <span>Stylist Fit Analysis</span>
                  </span>

                  <div className="sidebar-criteria-list">
                    <div className="sidebar-criteria-row">
                      <span className="criteria-label">Active Coordinate</span>
                      <span className="criteria-value" style={{ maxWidth: '145px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activeOutfit.outfitName}
                      </span>
                    </div>
                    <div className="sidebar-criteria-row">
                      <span className="criteria-label">Versatility index</span>
                      <span className="criteria-value" style={{ color: '#30d158', fontWeight: 600 }}>9.2 / 10</span>
                    </div>
                    <div className="sidebar-criteria-row">
                      <span className="criteria-label">Layering Factor</span>
                      <span className="criteria-value" style={{ color: '#a855f7', fontWeight: 600 }}>9.0 / 10</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.6, fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Budget Allocation Breakdown
                    </span>
                    <div className="allocation-bar-container">
                      <div className="allocation-segment" style={{ width: `${topPct}%`, backgroundColor: '#a855f7' }} title={`Top: ₹${topCost}`} />
                      <div className="allocation-segment" style={{ width: `${bottomPct}%`, backgroundColor: '#3b82f6' }} title={`Bottom: ₹${bottomCost}`} />
                      <div className="allocation-segment" style={{ width: `${shoesPct}%`, backgroundColor: '#10b981' }} title={`Shoes: ₹${shoesCost}`} />
                      <div className="allocation-segment" style={{ width: `${accPct}%`, backgroundColor: '#f59e0b' }} title={`Accessories: ₹${accCost}`} />
                    </div>
                    <div className="allocation-legend">
                      <div className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: '#a855f7' }} />
                        <span>Tops ({Math.round(topPct)}%)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }} />
                        <span>Bottoms ({Math.round(bottomPct)}%)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: '#10b981' }} />
                        <span>Shoes ({Math.round(shoesPct)}%)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }} />
                        <span>Accs ({Math.round(accPct)}%)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.6, fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Styling Insights
                    </span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                      {activeOutfit.styleExplanation}
                    </p>
                  </div>

                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.6, fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Color Coordinates
                    </span>
                    <div className="sidebar-palette-swatch-group">
                      {activeOutfit.colorPalette.map((color, i) => (
                        <span key={i} className="sidebar-palette-swatch-circle" style={{ backgroundColor: color }} title={color} />
                      ))}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>Matching look</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Widget 3: Today's Inspiration & Style Stats (Always visible, providing immediate value) */}
            <div className="sidebar-card">
              <span className="sidebar-card-title">
                <Lightbulb size={13} style={{ color: '#eab308' }} />
                <span>Today's Styling Inspiration</span>
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  <strong>Contrast Anchoring:</strong> Pair a full-black loose silhouette with high-contrast, clean off-white sneakers to break up the drape and draw focus.
                </div>
                
                <div style={{ borderTop: '1px dashed var(--border-primary)', paddingTop: '8px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <span>Trending Tones Focus</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span className="sidebar-trend-tag" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Tan Leather</span>
                    <span className="sidebar-trend-tag" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Olive Sage (+22%)</span>
                  </div>
                </div>
              </div>
            </div>
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
          budgetTarget={brief ? parseInt(brief.filters.budget) : 5000}
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
