/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SupabaseHealthBadge — Real-time Supabase connection status indicator.
 * Tests a lightweight ping to the Supabase REST API on every mount.
 * Shows a live green/red badge in the app header/sidebar.
 */

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/api.js";

type HealthStatus = "checking" | "connected" | "disconnected" | "no_config";

interface SupabaseHealthBadgeProps {
  /** If true, shows a compact dot-only indicator (for headers) */
  compact?: boolean;
}

export default function SupabaseHealthBadge({ compact = false }: SupabaseHealthBadgeProps) {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = useCallback(async () => {
    if (!supabase) {
      setStatus("no_config");
      return;
    }

    setStatus("checking");

    try {
      const start = performance.now();

      // Lightweight ping: fetch a single row from any table
      // We use .from("organizations").select("id").limit(1) which is O(1) and fast
      const { error } = await supabase
        .from("organizations")
        .select("id")
        .limit(1);

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setLastChecked(new Date());

      if (error) {
        // RLS "no rows" errors are OK — it means connection is healthy
        // Only treat network/auth errors as disconnected
        const isConnectionError =
          error.message?.includes("NetworkError") ||
          error.message?.includes("Failed to fetch") ||
          error.code === "PGRST000" ||
          error.code === "PGRST301";

        setStatus(isConnectionError ? "disconnected" : "connected");
      } else {
        setStatus("connected");
      }
    } catch (err) {
      setStatus("disconnected");
      setLatencyMs(null);
    }
  }, []);

  useEffect(() => {
    // Defer initial ping by 5s so it doesn't compete with the app startup DB fetch
    const initDelay = setTimeout(() => {
      checkConnection();
    }, 5000);

    // Re-check every 60 seconds after the first ping
    const interval = setInterval(checkConnection, 60000);
    return () => {
      clearTimeout(initDelay);
      clearInterval(interval);
    };
  }, [checkConnection]);

  // -------------------------
  // Compact mode (dot badge)
  // -------------------------
  if (compact) {
    const dotColor =
      status === "connected" ? "bg-emerald-400" :
      status === "checking" ? "bg-amber-400" :
      status === "no_config" ? "bg-gray-400" :
      "bg-rose-500";

    const tooltip =
      status === "connected" ? `Supabase: Connected (${latencyMs}ms)` :
      status === "checking" ? "Supabase: Checking..." :
      status === "no_config" ? "Supabase: Not configured" :
      "Supabase: Disconnected — using local DB";

    return (
      <span
        title={tooltip}
        className={`inline-block w-2 h-2 rounded-full ${dotColor} ${status === "checking" ? "animate-pulse" : ""} ${status === "connected" ? "shadow-sm shadow-emerald-400/50" : ""}`}
      />
    );
  }

  // -------------------------
  // Full status card
  // -------------------------
  const cardStyles = {
    connected: {
      border: "border-emerald-200 dark:border-emerald-800",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      dot: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-300",
      label: "Connected",
      icon: "✓"
    },
    disconnected: {
      border: "border-rose-200 dark:border-rose-800",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      dot: "bg-rose-500",
      text: "text-rose-700 dark:text-rose-300",
      label: "Offline — Local DB Active",
      icon: "✕"
    },
    checking: {
      border: "border-amber-200 dark:border-amber-800",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      dot: "bg-amber-500 animate-pulse",
      text: "text-amber-700 dark:text-amber-300",
      label: "Checking connection...",
      icon: "⋯"
    },
    no_config: {
      border: "border-gray-200 dark:border-gray-700",
      bg: "bg-gray-50 dark:bg-gray-800/40",
      dot: "bg-gray-400",
      text: "text-gray-600 dark:text-gray-400",
      label: "Not Configured",
      icon: "?"
    }
  }[status];

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${cardStyles.border} ${cardStyles.bg}`}>
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cardStyles.dot}`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${cardStyles.text}`}>Supabase Cloud</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cardStyles.bg} ${cardStyles.text} border ${cardStyles.border}`}>
            {cardStyles.label}
          </span>
          {status === "connected" && latencyMs !== null && (
            <span className="text-[10px] text-gray-400 font-mono">{latencyMs}ms</span>
          )}
        </div>
        {lastChecked && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>

      <button
        onClick={checkConnection}
        disabled={status === "checking"}
        title="Re-check connection"
        className="text-[10px] px-2 py-1 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 cursor-pointer disabled:opacity-40 font-medium transition-colors"
      >
        {status === "checking" ? "..." : "↻ Ping"}
      </button>
    </div>
  );
}
