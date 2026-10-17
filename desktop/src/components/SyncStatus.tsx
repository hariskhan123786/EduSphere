import React, { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus.js";
import { fetchSyncStatus, triggerManualSync } from "../lib/desktop-api.js";

interface SyncStatusProps {
  onOpenSyncCenter?: () => void;
}

export default function SyncStatus({ onOpenSyncCenter }: SyncStatusProps) {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>("Just now");

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const report = await fetchSyncStatus();
        if (mounted && report) {
          setPendingCount(report.pending_count || 0);
          if (report.last_sync_time) {
            setLastSyncTime(new Date(report.last_sync_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await triggerManualSync();
      if (res) {
        setPendingCount(res.pending_count || 0);
        setLastSyncTime("Just now");
      }
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  return (
    <div 
      onClick={onOpenSyncCenter}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
        !isOnline 
          ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
          : isSyncing 
            ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
            : pendingCount > 0
              ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
      }`}
      title="Click to open Desktop Sync Center"
    >
      {!isOnline ? (
        <>
          <CloudOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>Offline (SQLite)</span>
        </>
      ) : isSyncing ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          <span>Syncing...</span>
        </>
      ) : pendingCount > 0 ? (
        <>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>{pendingCount} Pending</span>
          <button 
            onClick={handleManualSync}
            className="ml-1 p-0.5 hover:bg-amber-500/20 rounded"
            title="Sync Now"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Synced</span>
          <button 
            onClick={handleManualSync}
            className="ml-0.5 p-0.5 hover:bg-emerald-500/20 rounded"
            title="Sync Now"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </>
      )}
    </div>
  );
}
