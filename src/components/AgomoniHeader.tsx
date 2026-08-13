'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Info, X, Users, Volume2, VolumeX, Bell } from 'lucide-react';
import { usePlayer } from '@/features/player/PlayerContext';

/**
 * AgomoniHeader — Top-fixed header with Bengali branding, dynamic online listener
 * count (real active session heartbeat), and interactive status controls:
 * - Dedicated Mahalaya Button (🔔 মহালয়া)
 * - Mute/Volume Icon Button (🔊)
 * - Cultural Info Button (ⓘ)
 */
export default function AgomoniHeader() {
  const { state, dispatch, playMahalaya } = usePlayer();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [listenerCount, setListenerCount] = useState(1);

  // Toggle Mute from the centralized player state
  const handleToggleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
  };

  // Register session & heartbeat for active user presence tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Retrieve or create a unique session ID
    let sessionId = localStorage.getItem('agomoni_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('agomoni_session_id', sessionId);
    }

    // Safely increment/decrement active tab counter in localStorage
    const updateTabCount = (val: number) => {
      try {
        const count = parseInt(localStorage.getItem('agomoni_active_tabs') || '0', 10);
        const newCount = Math.max(0, count + val);
        localStorage.setItem('agomoni_active_tabs', String(newCount));
        return newCount;
      } catch {
        return 1;
      }
    };

    updateTabCount(1);

    // Heartbeat fetch request to the server presence API
    const sendHeartbeat = async (action?: 'connect' | 'disconnect') => {
      try {
        const res = await fetch('/api/presence', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId, action }),
          keepalive: action === 'disconnect', // keeps request alive after tab close
        });

        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.online === 'number') {
            setListenerCount(data.online);
          }
        }
      } catch (err) {
        console.error('Failed to update active user count:', err);
      }
    };

    // Send initial session connection
    sendHeartbeat('connect');

    // Send heartbeat every 15 seconds to stay active in sorted set
    const heartbeatInterval = setInterval(() => {
      if (navigator.onLine !== false) {
        sendHeartbeat();
      }
    }, 15000);

    // Handle tab unloading
    const handleUnload = () => {
      const remainingTabs = updateTabCount(-1);
      if (remainingTabs === 0) {
        // Last tab closed, send synchronous/beacon style disconnect to drop count immediately
        sendHeartbeat('disconnect');
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    // Reconnect immediately when browser comes back online
    const handleOnline = () => {
      sendHeartbeat('connect');
    };
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('online', handleOnline);
      updateTabCount(-1);
    };
  }, []);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-30 select-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Transparent gradient background overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(20,12,8,0.75) 0%, rgba(20,12,8,0.3) 60%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col md:flex-row md:items-start justify-between px-6 sm:px-8 lg:px-10 pt-5 pb-6 md:pt-6 md:pb-12 gap-4">
          {/* Left — Branding */}
          <div className="flex flex-col">
            <h1
              className="font-bengali text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide text-glow-gold transition-all duration-300"
              style={{ color: '#FFF8E7' }}
            >
              আগমনী
            </h1>
            <p
              className="font-bengali text-xs sm:text-sm md:text-base mt-1.5 opacity-80"
              style={{ color: '#FFF8E7' }}
            >
              মা আসছেন, মন জেগেছে
            </p>
          </div>

          {/* Right — Radio Status, Listener count & Controls */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:mt-2.5 self-start md:self-auto">
            {/* Dedicated Mahalaya Button (🔔 মহালয়া) */}
            <button
              onClick={playMahalaya}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold font-bengali border transition-all duration-300 focus:outline-none ${
                state.isMahalaya
                  ? 'bg-[#D4AF37] text-[rgba(20,12,8,1)] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                  : 'bg-[rgba(20,12,8,0.65)] text-[#D4AF37] border-[rgba(212,175,55,0.25)] hover:border-[#D4AF37] hover:bg-[rgba(20,12,8,0.85)]'
              }`}
              title="মহিষাসুরমর্দিনী শুনতে ক্লিক করুন"
            >
              <Bell size={14} className={state.isMahalaya ? 'animate-bounce' : ''} />
              <span>মহালয়া</span>
            </button>

            {/* Radio status pill (🔴 LIVE Agomoni Radio • 👥 46 listening) */}
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[rgba(20,12,8,0.65)] border border-[rgba(212,175,55,0.18)] backdrop-blur-md text-xs md:text-sm text-[#FFF8E7]/90 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C0392B]"></span>
                </span>
                <span className="font-bengali text-xs md:text-sm tracking-wide">
                  Agomoni Radio • LIVE
                </span>
              </div>

              <div className="h-3 w-[1px] bg-[rgba(212,175,55,0.2)]" />

              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-[#D4AF37]/80" />
                <span className="font-mono text-xs">{listenerCount}</span>
                <span className="font-bengali text-xs opacity-75">listening</span>
              </div>
            </div>

            {/* 🔊 (Mute Toggle) */}
            <button
              onClick={handleToggleMute}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(20,12,8,0.65)] hover:bg-[rgba(20,12,8,0.85)] border border-[rgba(212,175,55,0.18)] hover:border-[rgba(212,175,55,0.35)] transition-all duration-200 focus:outline-none"
              aria-label={state.isMuted ? 'Unmute' : 'Mute'}
              title="মিউট/আনমিউট"
            >
              {state.isMuted ? (
                <VolumeX size={18} className="text-[#C0392B]" />
              ) : (
                <Volume2 size={18} className="text-[#FFF8E7]" />
              )}
            </button>

            {/* ⓘ (Info Button) */}
            <button
              onClick={() => setIsInfoOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(20,12,8,0.65)] hover:bg-[rgba(20,12,8,0.85)] border border-[rgba(212,175,55,0.18)] hover:border-[rgba(212,175,55,0.35)] transition-all duration-200 focus:outline-none"
              aria-label="About Agomoni"
              title="তথ্য ও বিবরণ"
            >
              <Info size={18} className="text-[#FFF8E7]" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Cultural Info Modal */}
      <AnimatePresence>
        {isInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInfoOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg bg-[rgba(25,17,12,0.95)] backdrop-blur-xl border border-[rgba(212,175,55,0.25)] rounded-lg p-6 shadow-2xl z-10 select-none"
              role="dialog"
              aria-modal="true"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsInfoOpen(false)}
                className="absolute top-4 right-4 text-[#FFF8E7]/70 hover:text-[#FFF8E7] transition-colors p-1 rounded-md hover:bg-white/5"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-6">
                <h3 className="font-bengali text-3xl font-bold text-glow-gold text-[#D4AF37]">
                  আগমনী
                </h3>
                <p className="text-[11px] uppercase tracking-widest text-[#FFF8E7]/50 mt-1 font-mono">
                  The Sound of Durga Puja
                </p>
                <div className="w-24 h-[1px] bg-[rgba(212,175,55,0.2)] mx-auto mt-3" />
              </div>

              <div className="space-y-4 text-sm text-[#FFF8E7]/80 leading-relaxed font-bengali text-justify max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                <p>
                  <strong className="text-[#D4AF37]">আগমনী (Agomoni)</strong> কথাটির উৎপত্তি হয়েছে দেবী দুর্গার হিমালয় থেকে পিতৃগৃহে আগমনকে কেন্দ্র করে। শরত্কালের নীল আকাশ, শিউলি ফুলের গন্ধ আর কাশের দোলার সাথে সাথে বেজে ওঠে বীরেন্দ্রকৃষ্ণ ভদ্রের চণ্ডীপাঠ ও মহিষাসুরমর্দিনীর সুর।
                </p>
                <p>
                  এই ওয়েবসাইটটি একটি ঐতিহ্যবাহী <strong className="text-[#D4AF37]">বনেদি বাড়ির পূজোমণ্ডপের</strong> আবহকে তুলে ধরে। মায়ের প্রতিমার সামনে পুরোহিতের আরতি, ঢাকের আওয়াজ আর দর্শকের ভক্তিপূর্ণ উপস্থিতির মাঝে এক অবিরাম বাঙালি ভক্তিগীতি ও পুজোর নস্টালজিক সুরের অভিজ্ঞতা প্রদান করাই আমাদের লক্ষ্য।
                </p>
                <p className="text-xs text-[#FFF8E7]/60 italic">
                  * Features a continuously playing traditional and nostalgic selection of Pujor gaan, Agomoni, and Devotional melodies powered securely by YouTube.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(212,175,55,0.15)] flex justify-between items-center text-xs text-[#FFF8E7]/40 font-mono">
                <span>© {new Date().getFullYear()} Agomoni Radio</span>
                <span className="font-bengali font-semibold text-[#D4AF37]/75">মা আসছেন, মন জেগেছে</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
