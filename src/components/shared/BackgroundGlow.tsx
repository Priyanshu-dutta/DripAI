'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Premium background component rendering a slow-drifting particle canvas
 * with rich, radial glows overlaying the dark mesh background.
 */
export const BackgroundGlow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      alphaSpeed: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize drift particles
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.2 + 0.4,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        alpha: Math.random() * 0.4 + 0.1,
        alphaSpeed: (Math.random() - 0.5) * 0.002,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw faint, dynamic ambient radial glow spheres in the background
      // 1. Indigo light beam center top
      const glow1 = ctx.createRadialGradient(
        canvas.width * 0.5,
        -canvas.height * 0.15,
        0,
        canvas.width * 0.5,
        -canvas.height * 0.15,
        canvas.width * 0.65
      );
      glow1.addColorStop(0, 'rgba(99, 102, 241, 0.075)');
      glow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Violet ambient glow bottom right
      const glow2 = ctx.createRadialGradient(
        canvas.width * 0.85,
        canvas.height * 0.8,
        0,
        canvas.width * 0.85,
        canvas.height * 0.8,
        canvas.width * 0.5
      );
      glow2.addColorStop(0, 'rgba(168, 85, 247, 0.05)');
      glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Faint white highlight center left
      const glow3 = ctx.createRadialGradient(
        canvas.width * 0.1,
        canvas.height * 0.4,
        0,
        canvas.width * 0.1,
        canvas.height * 0.4,
        canvas.width * 0.45
      );
      glow3.addColorStop(0, 'rgba(255, 255, 255, 0.004)');
      glow3.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render and update drift particles
      particles.forEach((p) => {
        // Apply velocity
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around canvas screen limits
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Gently pulse alpha opacity
        p.alpha += p.alphaSpeed;
        if (p.alpha > 0.55 || p.alpha < 0.05) {
          p.alphaSpeed = -p.alphaSpeed;
        }
        p.alpha = Math.max(0.05, Math.min(0.55, p.alpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.3)';
        ctx.shadowBlur = 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: -1,
        backgroundColor: '#030303',
      }}
    />
  );
};

export default BackgroundGlow;
