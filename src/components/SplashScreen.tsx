/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SplashScreen — Animated Logo Loading Experience
 * Displays an animated brand intro with pulsing rings, bounce-in logo,
 * shimmering title, and loading dots on every app reload, then smoothly fades out.
 */

import React, { useState, useEffect } from "react";

interface SplashScreenProps {
  /** Callback fired when splash finishes */
  onFinished?: () => void;
  /** Minimum duration to show the splash in ms (default 1200ms) */
  duration?: number;
}

export default function SplashScreen({ onFinished, duration = 1200 }: SplashScreenProps) {
  const [fadingOut, setFadingOut] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Start fading out after the designated duration
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, duration);

    // Completely remove from DOM after fade transition (400ms)
    const removeTimer = setTimeout(() => {
      setRemoved(true);
      if (onFinished) onFinished();
    }, duration + 400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onFinished]);

  if (removed) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#1e1b4b] to-[#312e81] text-white transition-opacity duration-500 ease-out ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Centered Animated Logo Section */}
      <div className="relative flex items-center justify-center">
        {/* Outer Glow Ring */}
        <div className="absolute -inset-6 rounded-[38px] border border-indigo-500/20 animate-ping opacity-30 pointer-events-none" />

        {/* Pulsing Gradient Ring */}
        <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-75 blur-sm animate-pulse" />

        {/* Brand App Logo */}
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/50 ring-2 ring-white/20 bg-gray-900 animate-bounce-short">
          <img
            src="/logo.jpg"
            alt="EduSphere AI Logo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Brand Title */}
      <div className="mt-7 text-center space-y-1.5 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
          EduSphere <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">AI</span>
        </h1>
        <p className="text-xs font-semibold text-indigo-200/70 uppercase tracking-[0.2em]">
          School Management System
        </p>
      </div>

      {/* Three Wave Loading Dots */}
      <div className="flex items-center gap-2 mt-8">
        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
        <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
        <div className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-bounce [animation-delay:300ms]" />
      </div>

      {/* Bottom Version Stamp */}
      <div className="absolute bottom-6 text-[10px] font-mono tracking-widest text-indigo-300/40 uppercase">
        v2.0 • Supabase Cloud + AI Intelligence
      </div>
    </div>
  );
}
