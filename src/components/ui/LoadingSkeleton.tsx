import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';

const LOADING_STEPS = [
  'Understanding your style...',
  'Detecting occasion...',
  'Detecting budget...',
  'Building outfit blueprint...',
  'Searching products...',
  'Finalizing recommendations...'
];

export const LoadingSkeleton: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    // Cycle through steps sequentially to simulate AI processing pipeline
    const intervalTime = 2200 / LOADING_STEPS.length; // Complete all steps within 2.2s
    
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="skeleton-card" style={{
      animation: 'fadeIn 0.5s ease-out',
      padding: 'var(--spacing-xl)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Loader2 size={16} className="animate-spin" style={{ color: '#a855f7', animation: 'spin 1.5s linear infinite' }} />
        <h3 style={{ fontSize: '1rem', letterSpacing: '-0.01em' }}>Styling in Progress</h3>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        margin: '10px 0'
      }}>
        {LOADING_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIdx;
          const isActive = idx === currentStepIdx;
          
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.85rem',
                color: isCompleted ? 'var(--text-primary)' : isActive ? '#a855f7' : 'var(--text-muted)',
                transition: 'color 0.3s ease',
                opacity: isCompleted || isActive ? 1 : 0.6
              }}
            >
              {isCompleted ? (
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(48, 209, 88, 0.1)',
                  border: '1.5px solid var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--success)'
                }}>
                  <Check size={10} strokeWidth={3} />
                </div>
              ) : isActive ? (
                <Loader2 size={16} style={{ animation: 'spin 1.5s linear infinite', color: '#a855f7' }} />
              ) : (
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1.5px solid var(--border-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                </div>
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>

      {/* Shimmer bar bottom */}
      <div className="skeleton" style={{
        height: '4px',
        width: '100%',
        borderRadius: '2px',
        marginTop: '10px'
      }} />

      {/* Inline Spin CSS to guarantee spin works */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSkeleton;
