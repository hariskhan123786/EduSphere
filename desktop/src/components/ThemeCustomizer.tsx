/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Palette, Sun, Moon, Laptop, Check, X, ChevronDown 
} from "lucide-react";

export type ThemeMode = "light" | "dark" | "system";

export type ColorPreset = {
  id: string;
  name: string;
  primary: string;
  ring: string;
  bgGradient: string;
  badgeBg: string;
  badgeText: string;
};

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "indigo",
    name: "Royal Indigo",
    primary: "#4f46e5",
    ring: "ring-indigo-500",
    bgGradient: "from-indigo-600 to-violet-600",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/60",
    badgeText: "text-indigo-600 dark:text-indigo-400"
  },
  {
    id: "emerald",
    name: "Emerald Jade",
    primary: "#059669",
    ring: "ring-emerald-500",
    bgGradient: "from-emerald-600 to-teal-600",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
    badgeText: "text-emerald-600 dark:text-emerald-400"
  },
  {
    id: "sapphire",
    name: "Ocean Sapphire",
    primary: "#0284c7",
    ring: "ring-sky-500",
    bgGradient: "from-sky-600 to-blue-600",
    badgeBg: "bg-sky-50 dark:bg-sky-950/60",
    badgeText: "text-sky-600 dark:text-sky-400"
  },
  {
    id: "ruby",
    name: "Crimson Ruby",
    primary: "#e11d48",
    ring: "ring-rose-500",
    bgGradient: "from-rose-600 to-pink-600",
    badgeBg: "bg-rose-50 dark:bg-rose-950/60",
    badgeText: "text-rose-600 dark:text-rose-400"
  },
  {
    id: "amber",
    name: "Sunset Amber",
    primary: "#d97706",
    ring: "ring-amber-500",
    bgGradient: "from-amber-600 to-orange-600",
    badgeBg: "bg-amber-50 dark:bg-amber-950/60",
    badgeText: "text-amber-600 dark:text-amber-400"
  },
  {
    id: "amethyst",
    name: "Amethyst Purple",
    primary: "#7c3aed",
    ring: "ring-purple-500",
    bgGradient: "from-purple-600 to-fuchsia-600",
    badgeBg: "bg-purple-50 dark:bg-purple-950/60",
    badgeText: "text-purple-600 dark:text-purple-400"
  }
];

export const COLOR_SHADES: Record<string, Record<string, string>> = {
  emerald: {
    "--color-indigo-50": "#ecfdf5",
    "--color-indigo-100": "#d1fae5",
    "--color-indigo-200": "#a7f3d0",
    "--color-indigo-300": "#6ee7b7",
    "--color-indigo-400": "#34d399",
    "--color-indigo-500": "#10b981",
    "--color-indigo-600": "#059669",
    "--color-indigo-700": "#047857",
    "--color-indigo-800": "#065f46",
    "--color-indigo-900": "#064e3b",
    "--color-indigo-950": "#022c22",
  },
  sapphire: {
    "--color-indigo-50": "#f0f9ff",
    "--color-indigo-100": "#e0f2fe",
    "--color-indigo-200": "#bae6fd",
    "--color-indigo-300": "#7dd3fc",
    "--color-indigo-400": "#38bdf8",
    "--color-indigo-500": "#0ea5e9",
    "--color-indigo-600": "#0284c7",
    "--color-indigo-700": "#0369a1",
    "--color-indigo-800": "#075985",
    "--color-indigo-900": "#0c4a6e",
    "--color-indigo-950": "#082f49",
  },
  ruby: {
    "--color-indigo-50": "#fff1f2",
    "--color-indigo-100": "#ffe4e6",
    "--color-indigo-200": "#fecdd3",
    "--color-indigo-300": "#fda4af",
    "--color-indigo-400": "#fb7185",
    "--color-indigo-500": "#f43f5e",
    "--color-indigo-600": "#e11d48",
    "--color-indigo-700": "#be123c",
    "--color-indigo-800": "#9f1239",
    "--color-indigo-900": "#881337",
    "--color-indigo-950": "#4c0519",
  },
  amber: {
    "--color-indigo-50": "#fffbeb",
    "--color-indigo-100": "#fef3c7",
    "--color-indigo-200": "#fde68a",
    "--color-indigo-300": "#fcd34d",
    "--color-indigo-400": "#fbbf24",
    "--color-indigo-500": "#f59e0b",
    "--color-indigo-600": "#d97706",
    "--color-indigo-700": "#b45309",
    "--color-indigo-800": "#92400e",
    "--color-indigo-900": "#78350f",
    "--color-indigo-950": "#451a03",
  },
  amethyst: {
    "--color-indigo-50": "#faf5ff",
    "--color-indigo-100": "#f3e8ff",
    "--color-indigo-200": "#e9d5ff",
    "--color-indigo-300": "#d8b4fe",
    "--color-indigo-400": "#c084fc",
    "--color-indigo-500": "#a855f7",
    "--color-indigo-600": "#7c3aed",
    "--color-indigo-700": "#6d28d9",
    "--color-indigo-800": "#581c87",
    "--color-indigo-900": "#3b0764",
    "--color-indigo-950": "#2e1065",
  },
  indigo: {
    "--color-indigo-50": "#eef2ff",
    "--color-indigo-100": "#e0e7ff",
    "--color-indigo-200": "#c7d2fe",
    "--color-indigo-300": "#a5b4fc",
    "--color-indigo-400": "#818cf8",
    "--color-indigo-500": "#6366f1",
    "--color-indigo-600": "#4f46e5",
    "--color-indigo-700": "#4338ca",
    "--color-indigo-800": "#3730a3",
    "--color-indigo-900": "#312e81",
    "--color-indigo-950": "#1e1b4b",
  }
};

export function applyTheme(mode: ThemeMode, colorId: string) {
  const root = document.documentElement;
  const body = document.body;

  let isDark = false;
  if (mode === "dark") {
    isDark = true;
  } else if (mode === "light") {
    isDark = false;
  } else if (mode === "system") {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  if (isDark) {
    root.classList.add("dark");
    body?.classList.add("dark");
  } else {
    root.classList.remove("dark");
    body?.classList.remove("dark");
  }

  root.setAttribute("data-theme-color", colorId);
  body?.setAttribute("data-theme-color", colorId);

  const shades = COLOR_SHADES[colorId] || COLOR_SHADES.indigo;
  for (const [key, val] of Object.entries(shades)) {
    root.style.setProperty(key, val);
    if (body) body.style.setProperty(key, val);
  }

  localStorage.setItem("edusphere_theme_mode", mode);
  localStorage.setItem("edusphere_theme_color", colorId);
  localStorage.setItem("theme", isDark ? "dark" : "light");

  window.dispatchEvent(new CustomEvent("edusphere-theme-updated", { detail: { mode, colorId, isDark } }));
}

interface ThemeCustomizerProps {
  compact?: boolean;
}

export default function ThemeCustomizer({ compact = false }: ThemeCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem("edusphere_theme_mode") as ThemeMode) || "dark";
  });
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    return localStorage.getItem("edusphere_theme_color") || "indigo";
  });

  useEffect(() => {
    applyTheme(selectedMode, selectedColor);
  }, [selectedMode, selectedColor]);

  const activeColorObj = COLOR_PRESETS.find(c => c.id === selectedColor) || COLOR_PRESETS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Customize Theme & Colors"
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-gray-700 dark:text-gray-200 text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
      >
        <span
          className="w-3.5 h-3.5 rounded-full shadow-inner ring-1 ring-black/10"
          style={{ backgroundColor: activeColorObj.primary }}
        />
        {!compact && <span className="hidden sm:inline">Theme</span>}
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-4 z-50 animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Palette className="w-4 h-4" />
                </span>
                <span className="font-bold text-xs text-gray-900 dark:text-white">Theme & Color Options</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Appearance Mode</p>
              <div className="grid grid-cols-3 gap-1.5 bg-gray-50 dark:bg-gray-800/40 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "Auto", icon: Laptop },
                ].map(mode => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id as ThemeMode)}
                      className={`flex flex-col items-center gap-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-gray-700"
                          : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px]">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Accent Color</p>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.map(color => {
                  const isSelected = selectedColor === color.id;
                  return (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`flex items-center gap-2 p-2 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800 scale-[1.03] shadow-sm"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-400"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: color.primary }}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                      <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">
                        {color.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 text-center">
              Preferences persisted locally in desktop configuration.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
