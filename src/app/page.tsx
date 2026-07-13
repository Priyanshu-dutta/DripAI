'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import PromptSection, { PromptFilters } from '@/components/stylist/PromptSection';
import OutfitCard from '@/components/stylist/OutfitCard';
import ProductCard from '@/components/stylist/ProductCard';
import ClosetWorkspace from '@/components/trial-closet/ClosetWorkspace';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Drawer from '@/components/ui/Drawer';
import BackgroundGlow from '@/components/shared/BackgroundGlow';
import AuthModal from '@/components/shared/AuthModal';
import useTrialCloset from '@/hooks/useTrialCloset';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { OutfitRecommendation, ShoppingProduct } from '@/types/stylist';
import { StyleBlueprint } from '@/types/blueprint';
import { MOCK_OUTFITS, MOCK_TABS } from '@/utils/mockOutfits';
import { 
  Sparkles, 
  Compass, 
  Edit2, 
  TrendingUp, 
  BarChart2, 
  Award, 
  Lightbulb, 
  History as HistoryIcon, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';

interface BriefData {
  promptText: string;
  filters: PromptFilters;
  blueprint?: StyleBlueprint;
}

// -----------------------------------------------------------------------------
// Mapping Helpers (Backend API Types to UI/Stylist Types)
// -----------------------------------------------------------------------------
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    beige: '#D2B48C',
    cream: '#FFFDD0',
    grey: '#808080',
    gray: '#808080',
    blue: '#0000FF',
    navy: '#000080',
    green: '#008000',
    olive: '#808000',
    brown: '#A52A2A',
    tan: '#D2B48C',
    red: '#FF0000',
    burgundy: '#800020',
  };
  return colorMap[colorName.toLowerCase()] || '#808080';
}

function mapIntelligenceToShoppingProduct(ip: any, matchScore: number): ShoppingProduct {
  return {
    id: ip.id,
    title: ip.title,
    price: ip.price,
    currency: ip.currency === 'INR' ? '₹' : ip.currency,
    imageUrl: ip.image || '',
    shoppingUrl: ip.retailerUrl || '#',
    brand: ip.brand,
    providerName: ip.retailer,
    matchScore: matchScore
  };
}

function mapRecommendationsToUI(recs: any, blueprint: any): OutfitRecommendation[] {
  const result: OutfitRecommendation[] = [];

  const addOutfit = (def: any, id: string, name: string) => {
    if (!def) return;
    result.push({
      id,
      outfitName: name,
      styleExplanation: Object.values(def.explanations || {}).join(' ') || 'Tailored look curated for the occasion.',
      colorPalette: [
        getColorHex(def.top.color),
        getColorHex(def.bottom.color),
        getColorHex(def.shoes.color),
        getColorHex(def.accessories.color)
      ].filter(Boolean),
      items: {
        top: mapIntelligenceToShoppingProduct(def.top, Math.round(def.matchScore || 90)),
        bottom: mapIntelligenceToShoppingProduct(def.bottom, Math.round(def.matchScore || 90)),
        shoes: mapIntelligenceToShoppingProduct(def.shoes, Math.round(def.matchScore || 90)),
        accessories: mapIntelligenceToShoppingProduct(def.accessories, Math.round(def.matchScore || 90))
      },
      totalCost: def.totalCost
    });
  };

  const styleName = blueprint.style && blueprint.style !== 'null' && blueprint.style !== 'UNKNOWN' && blueprint.style.trim() !== ''
    ? blueprint.style.charAt(0).toUpperCase() + blueprint.style.slice(1)
    : 'Coordinated';
  const fitName = blueprint.fit && blueprint.fit !== 'null' && blueprint.fit !== 'UNKNOWN' && blueprint.fit.trim() !== ''
    ? blueprint.fit.charAt(0).toUpperCase() + blueprint.fit.slice(1)
    : 'Standard';

  addOutfit(recs.bestMatch, 'best-match', `${styleName} Premium ${fitName} Fit`);
  addOutfit(recs.alternative, 'alternative', `${styleName} Styled Alternative`);
  addOutfit(recs.budgetFriendly, 'budget-friendly', `${styleName} Budget-Friendly Coordinate`);

  return result;
}

// -----------------------------------------------------------------------------
// Root Component Wrapping Page in Provider
// -----------------------------------------------------------------------------
export default function WorkspacePage() {
  return (
    <AuthProvider>
      <WorkspacePageContent />
    </AuthProvider>
  );
}

// -----------------------------------------------------------------------------
// Inner Content Component (Consumes useAuth Context)
// -----------------------------------------------------------------------------
function WorkspacePageContent() {
  const { user, isOfflineMode } = useAuth();

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'classy' | 'streetwear'>('all');
  const [activeTab, setActiveTab] = useState<'tops' | 'bottoms' | 'shoes' | 'accessories'>('tops');
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeOutfitId, setActiveOutfitId] = useState<string | null>(null);

  // Authentication Dialog overlay state
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Save history state
  const [history, setHistory] = useState<any[]>([]);

  // Offline or setup status notifications
  const [apiAlert, setApiAlert] = useState<string | null>(null);

  // Trial Closet state
  const { closetItems, addToCloset, removeFromCloset, clearCloset } = useTrialCloset();

  // Load Saved Outfits History
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setHistory([]);
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        // Offline Mock mode
        const mockHist = localStorage.getItem(`drip_mock_history_${user.id}`);
        if (mockHist) {
          try {
            setHistory(JSON.parse(mockHist));
          } catch (e) {
            console.error(e);
          }
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('outfit_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error('Failed to load styling history:', err);
      }
    };

    loadHistory();
  }, [user]);

  // Handle live styling API query submission
  const handlePromptSubmit = async (promptText: string, filters: PromptFilters) => {
    if (loading) return;
    setLoading(true);
    setRecommendations([]);
    setBrief(null);
    setActiveOutfitId(null);
    setApiAlert(null);

    try {
      const response = await fetch('/api/v1/style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: promptText,
          filters: filters
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned code ${response.status}`);
      }

      const data = await response.json();
      const { blueprint, recommendations: recs } = data;

      if (!recs || !recs.bestMatch) {
        throw new Error('Malformed styling response payload.');
      }

      const mapped = mapRecommendationsToUI(recs, blueprint);
      setRecommendations(mapped);
      setActiveOutfitId(mapped[0]?.id || null);
      setBrief({ promptText, filters, blueprint });
    } catch (err: any) {
      console.warn('API execution failed, falling back to local simulation:', err.message || err);
      setApiAlert('Active Gemini API Key not configured. Simulated coordinates loaded.');
      
      // Graceful offline fallback simulation
      setTimeout(() => {
        setRecommendations(MOCK_OUTFITS);
        setActiveOutfitId(MOCK_OUTFITS[0]?.id || null);
        setBrief({ promptText, filters });
        setLoading(false);
      }, 2000);
      return;
    }

    setLoading(false);
  };

  // Add Outfit recommendation to public Postgres history
  const handleSaveOutfit = async (rec: OutfitRecommendation) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Verify if already saved in current dashboard view
    const isAlreadySaved = history.some(
      (h) => h.outfit_name === rec.outfitName && Number(h.total_cost) === rec.totalCost
    );
    if (isAlreadySaved) {
      alert('This outfit coordinate is already saved in your history!');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // Local Mock DB Sync
      const newHistoryItem = {
        id: `mock-hist-${Date.now()}`,
        user_id: user.id,
        prompt_text: brief?.promptText || 'Preset styling catalog',
        outfit_name: rec.outfitName,
        style_explanation: rec.styleExplanation,
        color_palette: rec.colorPalette,
        items: rec.items,
        total_cost: rec.totalCost,
        created_at: new Date().toISOString()
      };
      const updatedHist = [newHistoryItem, ...history];
      localStorage.setItem(`drip_mock_history_${user.id}`, JSON.stringify(updatedHist));
      setHistory(updatedHist);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('outfit_history')
        .insert({
          user_id: user.id,
          prompt_text: brief?.promptText || 'Preset styling catalog',
          outfit_name: rec.outfitName,
          style_explanation: rec.styleExplanation,
          color_palette: rec.colorPalette,
          items: rec.items,
          total_cost: rec.totalCost
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setHistory((prev) => [data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to save outfit to Supabase Postgres history:', err);
    }
  };

  // Delete saved outfits
  const handleDeleteHistory = async (id: string) => {
    if (!user) return;

    if (!isSupabaseConfigured || !supabase) {
      const updatedHist = history.filter((h) => h.id !== id);
      localStorage.setItem(`drip_mock_history_${user.id}`, JSON.stringify(updatedHist));
      setHistory(updatedHist);
      return;
    }

    try {
      const { error } = await supabase
        .from('outfit_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Failed to delete history record from Supabase:', err);
    }
  };

  const handleEditPrompt = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const textfield = document.querySelector('textarea');
    if (textfield) textfield.focus();
  };

  const handleViewDetails = (rec: OutfitRecommendation) => {
    if (rec.items.top) addToCloset(rec.items.top);
    if (rec.items.bottom) addToCloset(rec.items.bottom);
    if (rec.items.shoes) addToCloset(rec.items.shoes);
    if (rec.items.accessories) addToCloset(rec.items.accessories);
    setDrawerOpen(true);
  };

  const handleAddAllOutfitItems = () => {
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

  const isOutfitSaved = (rec: OutfitRecommendation) => {
    return history.some(
      (h) => h.outfit_name === rec.outfitName && Number(h.total_cost) === rec.totalCost
    );
  };

  // Dynamically resolve products inside active category tabs
  const getTabProducts = () => {
    if (recommendations.length === 0) {
      return MOCK_TABS[activeTab] || [];
    }

    const itemsMap: Record<string, ShoppingProduct[]> = {
      tops: [],
      bottoms: [],
      shoes: [],
      accessories: []
    };

    recommendations.forEach((rec) => {
      if (rec.items.top) itemsMap.tops.push(rec.items.top);
      if (rec.items.bottom) itemsMap.bottoms.push(rec.items.bottom);
      if (rec.items.shoes) itemsMap.shoes.push(rec.items.shoes);
      if (rec.items.accessories) itemsMap.accessories.push(rec.items.accessories);
    });

    const getDeduplicated = (arr: ShoppingProduct[]) => {
      const seen = new Set<string>();
      return arr.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    };

    return getDeduplicated(itemsMap[activeTab === 'bottoms' ? 'bottoms' : activeTab]);
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'classy') return rec.outfitName.toLowerCase().includes('classy') || rec.outfitName.toLowerCase().includes('elegance');
    if (activeCategory === 'streetwear') return rec.outfitName.toLowerCase().includes('street') || rec.outfitName.toLowerCase().includes('urban');
    return true;
  });

  return (
    <>
      <BackgroundGlow />

      <Navbar 
        closetCount={closetItems.length} 
        onOpenCloset={() => setDrawerOpen(true)} 
        onOpenAuth={() => setAuthModalOpen(true)}
      />
      
      <main className="workspace-main" style={{ maxWidth: '1440px', paddingTop: '80px' }}>
        
        {/* Offline / Warning Notice Banner */}
        {(isOfflineMode || apiAlert) && (
          <div style={{
            background: 'rgba(234,179,8,0.06)',
            border: '1px solid rgba(234,179,8,0.12)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <AlertTriangle size={16} style={{ color: '#eab308', flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: '#f59e0b', lineHeight: '1.4' }}>
              {apiAlert ? (
                <span><strong>API Key Alert:</strong> {apiAlert}</span>
              ) : (
                <span><strong>Offline Mode Enabled:</strong> Supabase API keys not detected in environment variables. Auth sessions, saved history, and closets are stored locally in the browser cache.</span>
              )}
            </div>
          </div>
        )}

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
                            {brief.blueprint?.occasion || brief.filters.occasion || 'General'}
                          </span>
                        </div>
                        <div className="criteria-item">
                          <span className="criteria-label">Budget</span>
                          <span className="criteria-value">
                            {brief.blueprint ? (brief.blueprint.budget ? (brief.blueprint.budget.startsWith('₹') ? brief.blueprint.budget : `₹${brief.blueprint.budget}`) : 'No budget specified') : `₹${brief.filters.budget}`}
                          </span>
                        </div>
                        <div className="criteria-item">
                          <span className="criteria-label">Style</span>
                          <span className="criteria-value" style={{ textTransform: 'capitalize' }}>
                            {brief.blueprint?.style || brief.filters.style || 'Casual'}
                          </span>
                        </div>
                        <div className="criteria-item">
                          <span className="criteria-label">Fit</span>
                          <span className="criteria-value" style={{ textTransform: 'capitalize' }}>
                            {brief.blueprint?.fit || brief.filters.fit}
                          </span>
                        </div>
                        <div className="criteria-item">
                          <span className="criteria-label">Gender</span>
                          <span className="criteria-value" style={{ textTransform: 'capitalize' }}>
                            {brief.blueprint?.gender || brief.filters.gender}
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
                        onSave={handleSaveOutfit}
                        isSaved={isOutfitSaved(rec)}
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
                      {getTabProducts()?.map((prod) => (
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

            {/* Widget 2: Saved Outfit History DB Widget */}
            <div className="sidebar-card" style={{ marginTop: '16px' }}>
              <span className="sidebar-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HistoryIcon size={13} style={{ color: '#a855f7' }} />
                <span>Saved Coordinates ({history.length})</span>
              </span>

              {user ? (
                history.length > 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px', 
                    maxHeight: '220px', 
                    overflowY: 'auto', 
                    paddingRight: '4px',
                    marginTop: '8px'
                  }}>
                    {history.map((h) => (
                      <div 
                        key={h.id} 
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <div 
                          onClick={() => {
                            // Reload into layout recommendations state
                            setRecommendations([
                              {
                                id: h.id,
                                outfitName: h.outfit_name,
                                styleExplanation: h.style_explanation,
                                colorPalette: h.color_palette,
                                totalCost: Number(h.total_cost),
                                items: h.items
                              }
                            ]);
                            setActiveOutfitId(h.id);
                            setBrief({
                              promptText: h.prompt_text,
                              filters: { occasion: '', budget: String(h.total_cost), style: '', fit: '', gender: '', season: '' }
                            });
                          }}
                          style={{ cursor: 'pointer', flex: 1, overflow: 'hidden' }}
                        >
                          <div style={{ 
                            fontSize: '0.78rem', 
                            fontWeight: 600, 
                            color: 'var(--text-primary)', 
                            textOverflow: 'ellipsis', 
                            overflow: 'hidden', 
                            whiteSpace: 'nowrap' 
                          }}>
                            {h.outfit_name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                            ₹{Number(h.total_cost).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteHistory(h.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.7,
                            transition: 'opacity 0.2s'
                          }}
                          title="Delete saved coordinate"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                    No saved outfit coordinates yet. Click the heart icon on recommended outfit cards.
                  </span>
                )
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0', marginTop: '6px' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>
                    Log in to save outfit coordinates to your wardrobe history.
                  </p>
                  <button 
                    onClick={() => setAuthModalOpen(true)}
                    className="nav-btn"
                    style={{ fontSize: '0.72rem', padding: '4px 10px', height: 'auto', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Widget 3: Style Analytics Dashboard Card (Before recommendations: Trending stats) */}
            {recommendations.length === 0 && (
              <div className="sidebar-card" style={{ marginTop: '16px' }}>
                <span className="sidebar-card-title">
                  <BarChart2 size={13} style={{ color: '#a855f7' }} />
                  <span>Global Style Analytics</span>
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
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

                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.6, fontWeight: 700, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Daily Style Quote
                  </span>
                  <blockquote className="sidebar-quote" style={{ fontSize: '0.8rem', paddingLeft: '8px' }}>
                    "Style is a way to say who you are without speaking."
                    <span className="sidebar-quote-author" style={{ fontSize: '0.65rem' }}>— R. Zoe</span>
                  </blockquote>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.6, fontWeight: 700, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Suggested Palette
                  </span>
                  <div className="sidebar-palette-swatch-group" style={{ marginTop: '4px' }}>
                    <span className="sidebar-palette-swatch-circle" style={{ backgroundColor: '#D2B48C' }} title="Tan" />
                    <span className="sidebar-palette-swatch-circle" style={{ backgroundColor: '#F5F5DC' }} title="Beige" />
                    <span className="sidebar-palette-swatch-circle" style={{ backgroundColor: '#2E3033' }} title="Charcoal" />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>Warm Earth</span>
                  </div>
                </div>
              </div>
            )}

            {/* Widget 4: Contextual AI Outfit Analytics (After recommendations: Custom metrics) */}
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
                <div className="sidebar-card" style={{ marginTop: '16px' }}>
                  <span className="sidebar-card-title">
                    <Award size={13} style={{ color: '#a855f7' }} />
                    <span>Stylist Fit Analysis</span>
                  </span>

                  <div className="sidebar-criteria-list" style={{ marginTop: '8px' }}>
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

                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.6, fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Budget Allocation Breakdown
                    </span>
                    <div className="allocation-bar-container" style={{ marginTop: '4px' }}>
                      <div className="allocation-segment" style={{ width: `${topPct}%`, backgroundColor: '#a855f7' }} title={`Top: ₹${topCost}`} />
                      <div className="allocation-segment" style={{ width: `${bottomPct}%`, backgroundColor: '#3b82f6' }} title={`Bottom: ₹${bottomCost}`} />
                      <div className="allocation-segment" style={{ width: `${shoesPct}%`, backgroundColor: '#10b981' }} title={`Shoes: ₹${shoesCost}`} />
                      <div className="allocation-segment" style={{ width: `${accPct}%`, backgroundColor: '#f59e0b' }} title={`Accessories: ₹${accCost}`} />
                    </div>
                    <div className="allocation-legend" style={{ marginTop: '6px' }}>
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

                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.6, fontWeight: 700, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Styling Insights
                    </span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                      {activeOutfit.styleExplanation}
                    </p>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.6, fontWeight: 700, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Color Coordinates
                    </span>
                    <div className="sidebar-palette-swatch-group" style={{ marginTop: '4px' }}>
                      {activeOutfit.colorPalette.map((color, i) => (
                        <span key={i} className="sidebar-palette-swatch-circle" style={{ backgroundColor: color }} title={color} />
                      ))}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>Matching look</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Widget 5: Today's Inspiration & Style Stats (Always visible, providing immediate value) */}
            <div className="sidebar-card" style={{ marginTop: '16px' }}>
              <span className="sidebar-card-title">
                <Lightbulb size={13} style={{ color: '#eab308' }} />
                <span>Today's Styling Inspiration</span>
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
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

      {/* Glassmorphic Auth Modal overlay */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
