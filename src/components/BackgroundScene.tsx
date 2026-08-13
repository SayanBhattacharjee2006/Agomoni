'use client';

import React from 'react';

/**
 * BackgroundScene — Full-viewport fixed background layer showing the
 * cinematic Durga Puja Bonedi Bari video from /agomoni_bg.mp4.
 *
 * Requirements:
 * - Autoplay, loop, muted, playsInline, object-cover.
 * - Layered behind all UI components (z-0, pointer-events-none).
 * - Preserves dark ambient vignette and gradient overlays for optimal UI contrast.
 * - Does NOT interfere with audio or user interactions.
 */
export default function BackgroundScene() {
  return (
    <div className="fixed inset-0 z-0 select-none pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Cinematic background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-[72%_center] md:object-center transition-all duration-500"
      >
        <source src="/agomoni_bg.mp4" type="video/mp4" />
      </video>

      {/* Ambient overlay: radial gradient to darken edges for UI visibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(10,8,6,0.1) 0%, rgba(10,8,6,0.45) 100%)',
        }}
      />

      {/* Dark tint overlay for overall atmospheric contrast */}
      <div
        className="absolute inset-0 bg-[#0a0806]/15 pointer-events-none"
      />

      {/* Bottom gradient so the floating player bar blends naturally */}
      <div
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0a0806]/80 to-transparent pointer-events-none"
      />
    </div>
  );
}
