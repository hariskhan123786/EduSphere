/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ToastNotification System — Centralized Floating Alerts
 * Supports success, error, warning, and info messages with smooth animations,
 * auto-dismissal, manual close, and action feedback.
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { ToastMessage } from "../types.js";

interface ToastContextType {
  showToast: (type: "success" | "error" | "warning" | "info", title: string, description?: string, durationMs?: number) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global toast trigger helper for non-component calls
let globalToastHandler: ((type: "success" | "error" | "warning" | "info", title: string, description?: string) => void) | null = null;

export const toast = {
  success: (title: string, description?: string) => globalToastHandler?.("success", title, description),
  error: (title: string, description?: string) => globalToastHandler?.("error", title, description),
  warning: (title: string, description?: string) => globalToastHandler?.("warning", title, description),
  info: (title: string, description?: string) => globalToastHandler?.("info", title, description),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((
    type: "success" | "error" | "warning" | "info",
    title: string,
    description?: string,
    durationMs = 4000
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { id, type, title, description, durationMs };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep max 5 toasts

    setTimeout(() => {
      removeToast(id);
    }, durationMs);
  }, [removeToast]);

  // Connect global handler
  globalToastHandler = (type, title, description) => {
    showToast(type, title, description);
  };

  const success = useCallback((title: string, description?: string) => showToast("success", title, description), [showToast]);
  const error = useCallback((title: string, description?: string) => showToast("error", title, description, 6000), [showToast]);
  const warning = useCallback((title: string, description?: string) => showToast("warning", title, description, 5000), [showToast]);
  const info = useCallback((title: string, description?: string) => showToast("info", title, description), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const isWarning = t.type === "warning";

          const bgClass = isSuccess 
            ? "bg-emerald-950/95 border-emerald-500/30 text-emerald-100 shadow-emerald-950/40" 
            : isError 
            ? "bg-rose-950/95 border-rose-500/30 text-rose-100 shadow-rose-950/40" 
            : isWarning 
            ? "bg-amber-950/95 border-amber-500/30 text-amber-100 shadow-amber-950/40" 
            : "bg-indigo-950/95 border-indigo-500/30 text-indigo-100 shadow-indigo-950/40";

          const iconColor = isSuccess 
            ? "text-emerald-400" 
            : isError 
            ? "text-rose-400" 
            : isWarning 
            ? "text-amber-400" 
            : "text-indigo-400";

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100 animate-slide-in ${bgClass}`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className={`w-5 h-5 ${iconColor}`} />}
                {isError && <AlertCircle className={`w-5 h-5 ${iconColor}`} />}
                {isWarning && <AlertTriangle className={`w-5 h-5 ${iconColor}`} />}
                {!isSuccess && !isError && !isWarning && <Info className={`w-5 h-5 ${iconColor}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-xs tracking-tight leading-snug">{t.title}</h5>
                {t.description && (
                  <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed break-words">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      showToast: (type: any, title: string, desc?: string) => console.log(`[Toast ${type}]`, title, desc),
      success: (title: string, desc?: string) => console.log("[Toast success]", title, desc),
      error: (title: string, desc?: string) => console.error("[Toast error]", title, desc),
      warning: (title: string, desc?: string) => console.warn("[Toast warning]", title, desc),
      info: (title: string, desc?: string) => console.info("[Toast info]", title, desc),
    };
  }
  return context;
}
