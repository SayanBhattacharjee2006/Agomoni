'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingState — Elegant loading overlay shown while the playlist
 * is being fetched. Displays the আগমনী title with a pulsing animation
 * over the Durga Puja background.
 */
export default function LoadingState() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Semi-transparent overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(10, 8, 6, 0.5)' }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-4">
        {/* Pulsing title */}
        <motion.h2
          className="font-bengali text-4xl md:text-5xl font-bold text-glow-gold"
          style={{ color: '#FFF8E7' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          আগমনী
        </motion.h2>

        {/* Subtle loading bar */}
        <div className="w-32 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,248,231,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#D4AF37' }}
            initial={{ x: '-100%', width: '40%' }}
            animate={{ x: '250%' }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <p
          className="font-bengali text-sm"
          style={{ color: 'rgba(255, 248, 231, 0.5)' }}
        >
          গান লোড হচ্ছে...
        </p>
      </div>
    </motion.div>
  );
}
