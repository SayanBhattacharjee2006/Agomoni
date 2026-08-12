'use client';

import React from 'react';

/**
 * BackgroundScene — Full-viewport fixed background layer showing the
 * Durga Puja Bonedi Bari scene from generated_dp2.png.
 *
 * Optimizations:
 * - Shifts background focus slightly on mobile (72% center) to keep Maa Durga
 *   and the priest performer in the viewport.
 * - Standard centering (center center) on desktop.
 * - Applied radial vignette and ambient darkness layers to enhance text readability.
 */
export default function BackgroundScene() {
  return (
    <div className="fixed inset-0 z-0 select-none pointer-events-none" aria-hidden="true">
      {/* Primary background image */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-[position:72%_center] md:bg-center transition-all duration-500"
        style={{
          backgroundImage: 'url(/generated_dp2.png)',
        }}
      />

      {/* Ambient overlay: radial gradient to darken edges for UI visibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(10,8,6,0.1) 0%, rgba(10,8,6,0.45) 100%)',
        }}
      />

      {/* Dark tint overlay for overall atmospheric contrast */}
      <div
        className="absolute inset-0 bg-[#0a0806]/15"
      />

      {/* Bottom gradient so the player bar blends naturally */}
      <div
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0a0806]/80 to-transparent"
      />
    </div>
  );
}
