import React, { useState } from 'react';
import { SlidersHorizontal, ArrowRight, Sparkles } from 'lucide-react';

export interface PromptFilters {
  occasion: string;
  budget: string;
  style: string;
  fit: string;
  gender: string;
  season: string;
}

export interface PromptSectionProps {
  onSubmit: (prompt: string, filters: PromptFilters) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  "College farewell classy all-black oversized outfit",
  "Premium smart casual date night look",
  "Minimalist beige summer brunch fit for men",
  "Street royalty oversized hoodie and baggy pants"
];

export const PromptSection: React.FC<PromptSectionProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<PromptFilters>({
    occasion: '',
    budget: '5000',
    style: 'classy',
    fit: 'oversized',
    gender: 'unisex',
    season: 'summer'
  });

  const handleFilterChange = (key: keyof PromptFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSuggestionClick = (text: string) => {
    setPrompt(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isLoading) {
        onSubmit(prompt, filters);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt, filters);
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="prompt-section-wrapper">
        <form onSubmit={handleSubmit} className="prompt-form">
          <div className="prompt-textarea-wrapper">
            <textarea
              className="prompt-textarea"
              placeholder="Describe your desired outfit (occasion, budget, preferences...)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>

          <div className="prompt-controls">
            <button
              type="button"
              className={`prompt-tool-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </button>

            <button
              type="submit"
              className="prompt-submit-btn drip-submit-gradient"
              disabled={!prompt.trim() || isLoading}
            >
              <span>{isLoading ? 'Styling...' : 'Drip Me'}</span>
              {!isLoading && <ArrowRight size={14} />}
            </button>
          </div>
        </form>

        {showFilters && (
          <div className="prompt-options-panel">
            <div className="option-field">
              <label>Occasion</label>
              <select
                className="option-select"
                value={filters.occasion}
                onChange={(e) => handleFilterChange('occasion', e.target.value)}
              >
                <option value="">Auto Extract</option>
                <option value="farewell">College Farewell</option>
                <option value="brunch">Brunch</option>
                <option value="date">Date Night</option>
                <option value="casual">Casual Hangout</option>
              </select>
            </div>

            <div className="option-field">
              <label>Budget (INR)</label>
              <select
                className="option-select"
                value={filters.budget}
                onChange={(e) => handleFilterChange('budget', e.target.value)}
              >
                <option value="2000">Under ₹2000</option>
                <option value="5000">Under ₹5000</option>
                <option value="10000">Under ₹10000</option>
                <option value="15000">Under ₹15000</option>
              </select>
            </div>

            <div className="option-field">
              <label>Fit</label>
              <select
                className="option-select"
                value={filters.fit}
                onChange={(e) => handleFilterChange('fit', e.target.value)}
              >
                <option value="slim">Slim Fit</option>
                <option value="regular">Regular Fit</option>
                <option value="oversized">Oversized</option>
                <option value="relaxed">Relaxed Fit</option>
              </select>
            </div>

            <div className="option-field">
              <label>Gender</label>
              <select
                className="option-select"
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              >
                <option value="men">Male</option>
                <option value="women">Female</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="prompt-suggestions">
        {SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            className="suggestion-tag"
            onClick={() => handleSuggestionClick(suggestion)}
            disabled={isLoading}
          >
            <Sparkles size={11} style={{ marginRight: '6px', color: '#a855f7' }} />
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
export default PromptSection;
