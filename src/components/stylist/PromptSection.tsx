import React from 'react';

export interface PromptSectionProps {
  onSubmit: (prompt: string, options: any) => void;
  isLoading: boolean;
}

/**
 * Prompt input panel mimicking a command palette interface.
 */
export const PromptSection: React.FC<PromptSectionProps> = ({ onSubmit, isLoading }) => {
  return (
    <section className="prompt-section-wrapper">
      <form onSubmit={(e) => { e.preventDefault(); }}>
        <textarea
          placeholder="I am going to a college farewell. Budget ₹5000. I want a classy all-black oversized outfit..."
          disabled={isLoading}
        />
        <div className="prompt-controls">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Styling...' : 'Drip Me'}
          </button>
        </div>
      </form>
    </section>
  );
};
export default PromptSection;
