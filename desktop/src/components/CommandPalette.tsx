/**
 * EduSphere AI — Desktop Global Command Palette (Ctrl+K)
 * RBAC-filtered search + quick actions for SQLite / Offline Mode
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Search, X, GraduationCap, Users, CreditCard, BookOpen,
  ClipboardList, UserCheck, Zap, BarChart2, FileText, Bell,
  Settings, Shield, Calendar, ChevronRight
} from "lucide-react";
import { UserRole, DatabaseSchema } from "../types.js";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  dbState: DatabaseSchema | null;
  currentRole: UserRole;
  activeOrgId: string;
  onNavigate?: (section: string) => void;
}

interface SearchResult {
  id: string;
  type: "student" | "teacher" | "fee" | "result" | "action" | "page";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  action?: () => void;
}

const ALL_ACTIONS = [
  { label: "Students", icon: <GraduationCap className="w-4 h-4" />, section: "students", roles: ["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL","TEACHER","ACCOUNTANT"] },
  { label: "Teachers", icon: <Users className="w-4 h-4" />, section: "teachers", roles: ["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL"] },
  { label: "Attendance", icon: <UserCheck className="w-4 h-4" />, section: "attendance", roles: ["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL","TEACHER"] },
  { label: "Fee Management", icon: <CreditCard className="w-4 h-4" />, section: "fees", roles: ["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL","ACCOUNTANT"] },
  { label: "Exam Results", icon: <ClipboardList className="w-4 h-4" />, section: "results", roles: ["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL","TEACHER"] },
  { label: "Homework", icon: <BookOpen className="w-4 h-4" />, section: "homework", roles: ["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL","TEACHER"] },
  { label: "Analytics", icon: <BarChart2 className="w-4 h-4" />, section: "analytics", roles: ["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL"] },
  { label: "Documents", icon: <FileText className="w-4 h-4" />, section: "documents", roles: ["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL","ACCOUNTANT"] },
  { label: "Timetable", icon: <Calendar className="w-4 h-4" />, section: "timetable", roles: ["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL","TEACHER"] },
  { label: "Security Center", icon: <Shield className="w-4 h-4" />, section: "security", roles: ["SUPER_ADMIN","SCHOOL_ADMIN"] },
  { label: "Import Center", icon: <Zap className="w-4 h-4" />, section: "import", roles: ["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL"] },
  { label: "Notifications", icon: <Bell className="w-4 h-4" />, section: "notifications", roles: ["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL","TEACHER","STUDENT","PARENT","ACCOUNTANT"] },
  { label: "Library", icon: <BookOpen className="w-4 h-4" />, section: "library", roles: ["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL","LIBRARIAN"] },
  { label: "School Settings", icon: <Settings className="w-4 h-4" />, section: "settings", roles: ["SUPER_ADMIN","SCHOOL_ADMIN"] },
];

const BADGE_COLORS: Record<string, string> = {
  green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  red: "bg-red-500/10 text-red-400 border border-red-500/20",
  yellow: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  gray: "bg-white/5 text-gray-400 border border-white/10",
};

const TYPE_COLORS: Record<string, string> = {
  student: "text-indigo-400", teacher: "text-violet-400",
  fee: "text-emerald-400", result: "text-amber-400",
  action: "text-sky-400", page: "text-rose-400",
};

const GROUP_LABELS: Record<string, string> = {
  action: "Quick Actions", student: "Students",
  teacher: "Teachers", fee: "Fee Records", result: "Results",
};

export default function CommandPalette({ isOpen, onClose, dbState, currentRole, activeOrgId, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const buildResults = useCallback((q: string): SearchResult[] => {
    if (!dbState) return [];
    const lq = q.toLowerCase().trim();
    const out: SearchResult[] = [];

    const filteredActions = ALL_ACTIONS.filter(a => a.roles.includes(currentRole as string));

    if (!lq) {
      filteredActions.slice(0, 8).forEach(a => {
        out.push({ id: `action-${a.section}`, type: "action", title: a.label, icon: a.icon, action: () => onNavigate?.(a.section) });
      });
      return out;
    }

    filteredActions
      .filter(a => a.label.toLowerCase().includes(lq) || a.section.includes(lq))
      .slice(0, 3)
      .forEach(a => {
        out.push({ id: `action-${a.section}`, type: "action", title: a.label, icon: a.icon, action: () => onNavigate?.(a.section) });
      });

    if (["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL","TEACHER","ACCOUNTANT"].includes(currentRole as string)) {
      dbState.students
        .filter(s => s.organizationId === activeOrgId)
        .filter(s => s.name.toLowerCase().includes(lq) || (s.admissionNo||"").toLowerCase().includes(lq) || (s.className||"").toLowerCase().includes(lq))
        .slice(0, 5)
        .forEach(s => {
          out.push({ id: `student-${s.id}`, type: "student", title: s.name, subtitle: `${s.className} • ${s.admissionNo}`, icon: <GraduationCap className="w-4 h-4" />, badge: s.status, badgeColor: s.status === "Active" ? "green" : "gray" });
        });
    }

    if (["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL"].includes(currentRole as string)) {
      dbState.teachers
        .filter(t => t.organizationId === activeOrgId)
        .filter(t => t.name.toLowerCase().includes(lq) || (t.department||"").toLowerCase().includes(lq) || (t.designation||"").toLowerCase().includes(lq))
        .slice(0, 4)
        .forEach(t => {
          out.push({ id: `teacher-${t.id}`, type: "teacher", title: t.name, subtitle: `${t.designation} • ${t.department}`, icon: <Users className="w-4 h-4" />, badge: t.employeeId });
        });
    }

    if (["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL","ACCOUNTANT"].includes(currentRole as string)) {
      dbState.feeInvoices
        .filter(f => f.organizationId === activeOrgId)
        .filter(f => (f.studentName||"").toLowerCase().includes(lq) || (f.title||"").toLowerCase().includes(lq))
        .slice(0, 3)
        .forEach(f => {
          const bc = f.status === "Paid" ? "green" : f.status === "Overdue" ? "red" : "yellow";
          out.push({ id: `fee-${f.id}`, type: "fee", title: `${f.studentName} — ${f.title}`, subtitle: `₨ ${(f.amount||0).toLocaleString()} • ${f.status}`, icon: <CreditCard className="w-4 h-4" />, badge: f.status, badgeColor: bc });
        });
    }

    if (["SUPER_ADMIN","SCHOOL_ADMIN","PRINCIPAL","TEACHER"].includes(currentRole as string)) {
      dbState.results
        .filter(r => r.organizationId === activeOrgId)
        .filter(r => (r.studentName||"").toLowerCase().includes(lq) || (r.subject||"").toLowerCase().includes(lq))
        .slice(0, 3)
        .forEach(r => {
          out.push({ id: `result-${r.id}`, type: "result", title: `${r.studentName} — ${r.subject}`, subtitle: `${r.examTitle} • ${r.marksObtained}/${r.maxMarks} (${r.grade})`, icon: <ClipboardList className="w-4 h-4" />, badge: r.grade, badgeColor: (r.grade||"").startsWith("A") ? "green" : "blue" });
        });
    }

    return out.slice(0, 14);
  }, [dbState, currentRole, activeOrgId, onNavigate]);

  useEffect(() => { if (isOpen) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(""); setSelectedIndex(0); } }, [isOpen]);
  useEffect(() => { setResults(buildResults(query)); setSelectedIndex(0); }, [query, buildResults]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && results[selectedIndex]) {
        const r = results[selectedIndex];
        if (r.action) r.action();
        else if (r.type === "student") onNavigate?.("students");
        else if (r.type === "teacher") onNavigate?.("teachers");
        else if (r.type === "fee") onNavigate?.("fees");
        else if (r.type === "result") onNavigate?.("results");
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, results, selectedIndex, onClose, onNavigate]);

  if (!isOpen) return null;

  const groups: Record<string, SearchResult[]> = {};
  results.forEach(r => { if (!groups[r.type]) groups[r.type] = []; groups[r.type].push(r); });
  let globalIdx = 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden" onClick={e => e.stopPropagation()} style={{animation:"slideDown 0.15s ease-out"}}>
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search students, teachers, fees, results..." className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none" />
          <div className="flex items-center gap-2">
            {query && <button onClick={() => setQuery("")} className="p-1 rounded hover:bg-white/5 text-gray-500"><X className="w-4 h-4" /></button>}
            <kbd className="hidden sm:flex items-center px-1.5 py-0.5 rounded text-xs border border-white/10 text-gray-500 bg-white/5">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 && query && (
            <div className="px-4 py-10 text-center">
              <Search className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No results for "{query}"</p>
              <p className="text-xs text-gray-600 mt-1">Try searching student names, admission numbers, or subjects</p>
            </div>
          )}
          {Object.entries(groups).map(([type, items]) => (
            <div key={type}>
              <div className="px-4 py-1.5"><span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{GROUP_LABELS[type] || type}</span></div>
              {items.map(result => {
                const idx = globalIdx++;
                const isSelected = idx === selectedIndex;
                return (
                  <button key={result.id}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-white/8 text-white" : "text-gray-300 hover:bg-white/5"}`}
                    onClick={() => { if (result.action) { result.action(); onClose(); } else { onNavigate?.(result.type === "student" ? "students" : result.type === "teacher" ? "teachers" : result.type === "fee" ? "fees" : "results"); onClose(); } }}
                    onMouseEnter={() => setSelectedIndex(idx)}>
                    <span className={`flex-shrink-0 ${TYPE_COLORS[result.type] || "text-gray-400"}`}>{result.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{result.title}</span>
                        {result.badge && <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${BADGE_COLORS[result.badgeColor || "gray"]}`}>{result.badge}</span>}
                      </div>
                      {result.subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{result.subtitle}</p>}
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 border border-white/10 rounded bg-white/5">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 border border-white/10 rounded bg-white/5">↵</kbd> Select</span>
          </div>
          <span className="text-xs text-gray-600 flex items-center gap-1"><Zap className="w-3 h-3" /> Offline Search</span>
        </div>
      </div>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-12px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}
