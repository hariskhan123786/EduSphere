import React, { useState, useEffect } from "react";
import { 
  Cloud, CloudOff, RefreshCw, Database, ShieldCheck, 
  AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownLeft, 
  HardDrive, History, X, Check, FileDown, Layers, FileSpreadsheet, 
  FileText, Download
} from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus.js";
import { triggerManualSync, fetchSyncStatus, isTauriEnvironment, fetchDbState } from "../lib/desktop-api.js";
import { exportBackupJSON, exportBackupExcel, exportFeeRegisterPDF } from "../lib/reports.js";
import { DatabaseSchema } from "../types.js";

interface SyncCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbState?: DatabaseSchema;
}

export default function SyncCenter({ isOpen, onClose, dbState: propDbState }: SyncCenterModalProps) {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<"sync" | "backup">("sync");
  const [stats, setStats] = useState({
    pending: 0,
    uploaded: 0,
    downloaded: 0,
    failed: 0,
    conflicts: 0,
    lastSync: "Today",
  });
  const [syncError, setSyncError] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [localDb, setLocalDb] = useState<DatabaseSchema | null>(propDbState || null);

  useEffect(() => {
    if (isOpen) {
      loadStats();
      if (!localDb) {
        fetchDbState(null, "SUPER_ADMIN").then(data => setLocalDb(data)).catch(() => {});
      }
    }
  }, [isOpen]);

  const loadStats = async () => {
    try {
      const res = await fetchSyncStatus();
      if (res) {
        setStats(prev => ({
          ...prev,
          pending: res.pending_count || 0,
          failed: res.failed_count || 0,
          conflicts: res.conflict_count || 0,
          lastSync: res.last_sync_time ? new Date(res.last_sync_time).toLocaleString() : prev.lastSync,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await triggerManualSync();
      if (res) {
        setStats(prev => ({
          ...prev,
          pending: res.pending_count || 0,
          failed: res.failed_count || 0,
          uploaded: prev.uploaded + (res.resolved_count || 0),
          lastSync: "Just now",
        }));
      }
    } catch (error: any) {
      setSyncError(error?.message || "Synchronization failed. Your local changes remain queued.");
    } finally {
      setTimeout(() => setIsSyncing(false), 900);
    }
  };

  const getActiveDb = (): DatabaseSchema => {
    return propDbState || localDb || {
      organizations: [], users: [], students: [], teachers: [],
      attendance: [], feeInvoices: [], expenses: [], payroll: [],
      homework: [], homeworkSubmissions: [], exams: [], results: [],
      timetable: [], leaveRequests: [], notices: [], schoolEvents: [],
      libraryBooks: [], transportRoutes: [], hostelRooms: [], auditLogs: [],
    };
  };

  const schoolName = getActiveDb().organizations?.[0]?.name || "EduSphere_AI_School";

  const handleDownloadJSONBackup = () => {
    const db = getActiveDb();
    exportBackupJSON(db, schoolName);
    setBackupStatus("✅ Full JSON database backup downloaded to your computer.");
  };

  const handleDownloadExcelBackup = async () => {
    const db = getActiveDb();
    setBackupStatus("⏳ Generating Excel multi-sheet backup...");
    try {
      await exportBackupExcel(db, schoolName);
      setBackupStatus("✅ Complete Excel workbook (.xlsx) backup downloaded.");
    } catch (e: any) {
      setBackupStatus(`❌ Excel export failed: ${e.message}`);
    }
  };

  const handleDownloadFeeRegisterPDF = async () => {
    const db = getActiveDb();
    setBackupStatus("⏳ Rendering PDF Fee Register...");
    try {
      await exportFeeRegisterPDF(db.feeInvoices || [], schoolName);
      setBackupStatus("✅ PDF Fee Register downloaded successfully.");
    } catch (e: any) {
      setBackupStatus(`❌ PDF export failed: ${e.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Desktop Sync & Backup Center</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Offline SQLite Storage • Cloud Synchronization • Document Exports</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("sync")}
            className={`pb-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "sync"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Cloud Synchronization
          </button>
          <button
            onClick={() => setActiveTab("backup")}
            className={`pb-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "backup"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Backup & Document Exports
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {activeTab === "sync" && (
            <>
              {syncError && (
                <div role="alert" className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  Sync failed: {syncError}
                </div>
              )}
              {/* Connection Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isOnline 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-300"
              }`}>
                <div className="flex items-center gap-3">
                  {isOnline ? (
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  ) : (
                    <CloudOff className="w-5 h-5 text-rose-500" />
                  )}
                  <div>
                    <p className="text-sm font-bold">
                      {isOnline ? "🟢 Supabase Cloud Live" : "🟡 Offline Mode — Local SQLite Active"}
                    </p>
                    <p className="text-xs opacity-80">
                      {isOnline ? `Last successful cloud sync: ${stats.lastSync}` : "All mutations are stored securely in local SQLite and queued for automatic cloud sync."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing || !isOnline}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition shadow-md cursor-pointer ${
                    !isOnline ? "bg-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </button>
              </div>

              {/* Sync Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Offline Queue</span>
                  <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</p>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Synced Records</span>
                  <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.uploaded}</p>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Cached Items</span>
                  <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{stats.downloaded}</p>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Conflicts</span>
                  <p className="text-xl font-extrabold text-slate-500 dark:text-slate-400 mt-1">{stats.conflicts}</p>
                </div>
              </div>
            </>
          )}

          {activeTab === "backup" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-5 rounded-2xl text-white space-y-2">
                <h3 className="font-bold text-sm">Download Institutional Data Backups</h3>
                <p className="text-xs text-indigo-200/80">
                  Export complete records of students, teachers, fees, attendance, payroll, and exams in standard portable formats.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleDownloadJSONBackup}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-500 text-left transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Database className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Full JSON Backup</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Raw structured data snapshot with all 20 modules.</p>
                </button>

                <button
                  onClick={handleDownloadExcelBackup}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-emerald-500 text-left transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Excel Workbook (.xlsx)</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Multi-tab spreadsheet ready for Excel / Google Sheets.</p>
                </button>

                <button
                  onClick={handleDownloadFeeRegisterPDF}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-purple-500 text-left transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Fee Ledger (PDF)</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Landscape audit-ready PDF printable fee register.</p>
                </button>
              </div>

              {backupStatus && (
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 animate-fade-in">
                  {backupStatus}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">EduSphere AI Desktop • Pakistan Edition</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
