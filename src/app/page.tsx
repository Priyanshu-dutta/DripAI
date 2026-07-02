'use client';

import React, { useState } from 'react';
import PromptSection from '@/components/stylist/PromptSection';
import OutfitCard from '@/components/stylist/OutfitCard';
import ClosetWorkspace from '@/components/trial-closet/ClosetWorkspace';
import useTrialCloset from '@/hooks/useTrialCloset';
import { OutfitRecommendation } from '@/types/stylist';

/**
 * Main workspace containing prompt elements, result cards, and the trial closet layout.
 */
export default function WorkspacePage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const { closetItems, addToCloset, removeFromCloset, clearCloset } = useTrialCloset();

  const handlePromptSubmit = async (prompt: string, options: any) => {
    // Phase 1: API hookup and generation are deferred to later phases.
    setLoading(true);
    try {
      console.log('Prompt execution requested:', prompt, options);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="workspace-main">
      <div className="hero-section">
        <h1>Find Your Perfect Drip</h1>
        <p>Describe your style, budget, and occasion, and let our AI curate complete outfits.</p>
      </div>

      <div className="workspace-grid">
        <div className="left-panel">
          <PromptSection onSubmit={handlePromptSubmit} isLoading={loading} />
          
          <div className="recommendations-deck">
            {recommendations.map((rec) => (
              <OutfitCard
                key={rec.id}
                recommendation={rec}
                onAddToCloset={addToCloset}
              />
            ))}
          </div>
        </div>

        <div className="right-panel">
          <ClosetWorkspace
            items={closetItems}
            onRemoveItem={removeFromCloset}
            onClearCloset={clearCloset}
          />
        </div>
      </div>
    </main>
  );
}
