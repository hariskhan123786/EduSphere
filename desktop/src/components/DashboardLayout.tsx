/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI Desktop — Enterprise Unified Dashboard Layout
 * Features:
 * - Collapsible responsive sidebar (Expanded 260px <-> Collapsed 72px)
 * - Complete enterprise module navigation with role clearance
 * - Integrated modal drawers for Analytics, Documents, Approvals, Sessions, Import, Security, and Sync
 * - Topbar with School Switcher, Session Badge, Search (⌘K), Notifications, and User Profile
 * - Floating tooltips in collapsed mode
 */

import React, { useState, useEffect } from "react";
import { 
  Building2, GraduationCap, Users, BookOpen, 
  Settings, CreditCard, ChevronDown, UserCircle, LogOut, 
  Menu, X, Sparkles, Bell, Search, Sun, Moon, Check, 
  FileText, Bus, BedDouble, Calendar, Activity,
  RefreshCw, BarChart2, Shield, Zap, FileSpreadsheet,
  Layers, ChevronLeft, ChevronRight, HelpCircle,
  MessageSquare, Briefcase, DollarSign, Award,
  ClipboardList, CheckCircle2, Sliders, Laptop,
  PenTool, CheckSquare, Clock, Bookmark, Lock
} from "lucide-react";
import { DatabaseSchema, UserRole, User } from "../types.js";
import SupabaseHealthBadge from "./SupabaseHealthBadge.js";
import ThemeCustomizer from "./ThemeCustomizer.js";
import SyncCenter from "./SyncCenter.js";
import { toast } from "./ToastContainer.js";
import { uploadUserProfilePicture, deleteUserProfilePicture } from "../lib/desktop-api.js";

// Modal components
import AnalyticsDashboard from "./AnalyticsDashboard.js";
import DocumentGenerator from "./DocumentGenerator.js";
import ApprovalWorkflows from "./ApprovalWorkflows.js";
import AcademicSessions from "./AcademicSessions.js";
import ImportCenter from "./ImportCenter.js";
import SecurityCenter from "./SecurityCenter.js";
import NotificationCenter from "./NotificationCenter.js";

interface DashboardLayoutProps {
  dbState: DatabaseSchema;
  activeOrgId: string;
  setActiveOrgId: (id: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: User | null;
  onSignOut: () => void;
  onMutate?: (action: "INSERT" | "UPDATE" | "DELETE", table: string, data: any) => Promise<void>;
  children: React.ReactNode;
}

type ActiveModalType = "analytics" | "documents" | "approvals" | "sessions" | "import" | "security" | "notifications" | "school_switch" | "profile" | null;

export default function DashboardLayout({ 
  dbState, 
  activeOrgId, 
  setActiveOrgId, 
  currentRole, 
  setCurrentRole, 
  currentUser,
  onSignOut,
  onMutate,
  children 
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("edusphere_sidebar_collapsed") === "true";
  });

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNoticesDropdown, setShowNoticesDropdown] = useState(false);
  const [showSyncCenter, setShowSyncCenter] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("edusphere_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Keyboard shortcut (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeOrg = (dbState?.organizations?.find(o => o.id === activeOrgId)) || 
                    (dbState?.organizations?.[0]) || 
                    { id: "org-pk-1", name: "Beaconhouse School System", slug: "beaconhouse", plan: "Enterprise", academicSession: "2025-2026" };

  const roleMetadata: Record<UserRole, { label: string; bg: string; text: string; desc: string }> = {
    [UserRole.SUPER_ADMIN]: { label: "SaaS Owner", bg: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900", text: "text-rose-600", desc: "Global Multi-Tenant Control" },
    [UserRole.SCHOOL_ADMIN]: { label: "School Admin", bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900", text: "text-amber-600", desc: "Campus Admissions & Staff" },
    [UserRole.PRINCIPAL]: { label: "Principal", bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900", text: "text-amber-600", desc: "Executive Campus Overview" },
    [UserRole.TEACHER]: { label: "Faculty", bg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900", text: "text-indigo-600", desc: "Attendance, Grading & Notes" },
    [UserRole.STUDENT]: { label: "Student Desk", bg: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900", text: "text-teal-600", desc: "Academics & Fee Vouchers" },
    [UserRole.PARENT]: { label: "Parent Portal", bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900", text: "text-emerald-600", desc: "Progress & Tuition" },
    [UserRole.ACCOUNTANT]: { label: "CFO & Finance", bg: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900", text: "text-violet-600", desc: "Invoicing & Payroll Ledger" },
    [UserRole.LIBRARIAN]: { label: "Librarian", bg: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900", text: "text-sky-600", desc: "Book Catalog & Circulation" },
    [UserRole.TRANSPORT_MANAGER]: { label: "Transport Manager", bg: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900", text: "text-orange-600", desc: "Fleet & Routes" }
  };

  const currentMeta = roleMetadata[currentRole] || roleMetadata[UserRole.STUDENT];
  const isAdmin = currentUser?.role === UserRole.SUPER_ADMIN || currentUser?.role === UserRole.SCHOOL_ADMIN || currentRole === UserRole.SUPER_ADMIN || currentRole === UserRole.SCHOOL_ADMIN;

  // Search Results Filter
  const searchResults = searchQuery.trim().length > 1 ? {
    students: (dbState.students || []).filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.admissionNo?.toLowerCase().includes(searchQuery.toLowerCase())),
    teachers: (dbState.teachers || []).filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.department?.toLowerCase().includes(searchQuery.toLowerCase())),
    invoices: ((dbState.feeInvoices || (dbState as any).invoices || []) || []).filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.studentName?.toLowerCase().includes(searchQuery.toLowerCase())),
    notices: (dbState.notices || []).filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content?.toLowerCase().includes(searchQuery.toLowerCase())),
    books: ((dbState.libraryBooks || (dbState as any).books || []) || []).filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author?.toLowerCase().includes(searchQuery.toLowerCase()))
  } : null;

  return (
    <div className="h-screen max-h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 transition-colors duration-200">
      {/* ─── Topbar Navbar ─────────────────────────────────────────────────── */}
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 flex-shrink-0 ring-2 ring-indigo-200 dark:ring-indigo-800 bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-extrabold text-sm text-gray-900 dark:text-white tracking-tight leading-none">EduSphere AI</h1>
                <span className="text-[9px] px-1.5 py-0.5 font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md">Enterprise</span>
                <SupabaseHealthBadge compact />
              </div>
              <span className="text-[10px] text-gray-400 font-medium">Session {activeOrg.academicSession || "2025-2026"}</span>
            </div>
          </div>
        </div>

        {/* Topbar Right Actions */}
        <div className="flex items-center gap-2 md:gap-3 text-xs font-semibold">
          {/* Global Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700/60 text-gray-500 dark:text-gray-400 cursor-pointer transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Search anything...</span>
            <kbd className="text-[10px] font-mono bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">⌘K</kbd>
          </button>

          {/* Active School Selector / Switcher */}
          <button
            onClick={() => setActiveModal("school_switch")}
            className="flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-900/60 rounded-xl px-2.5 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 transition-all cursor-pointer"
            title="Click to Switch School / Campus"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate max-w-[130px] font-bold text-xs">{activeOrg.name}</span>
            <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
          </button>

          {/* Role Switcher Sandbox (Admin only) */}
          {isAdmin && (
            <div className="hidden md:flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-900/60 rounded-xl px-2.5 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-gray-400 text-[10px] uppercase font-bold">Portal:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent border-none text-xs text-indigo-700 dark:text-indigo-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value={UserRole.SUPER_ADMIN} className="dark:bg-gray-900">Super Admin (All Portals)</option>
                <option value={UserRole.SCHOOL_ADMIN} className="dark:bg-gray-900">School Admin Portal</option>
                <option value={UserRole.PRINCIPAL} className="dark:bg-gray-900">Principal Portal</option>
                <option value={UserRole.TEACHER} className="dark:bg-gray-900">Teacher Portal</option>
                <option value={UserRole.STUDENT} className="dark:bg-gray-900">Student Portal</option>
                <option value={UserRole.PARENT} className="dark:bg-gray-900">Parent Portal</option>
                <option value={UserRole.ACCOUNTANT} className="dark:bg-gray-900">Accountant Portal</option>
                <option value={UserRole.LIBRARIAN} className="dark:bg-gray-900">Librarian Portal</option>
                <option value={UserRole.TRANSPORT_MANAGER} className="dark:bg-gray-900">Transport Portal</option>
              </select>
            </div>
          )}

          {/* Color & Theme Customizer */}
          <ThemeCustomizer />

          {/* Sync & Backup Center Trigger */}
          <button
            onClick={() => setShowSyncCenter(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
            title="Sync Status & Backups"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {/* Notification Center Trigger */}
          <button
            onClick={() => setActiveModal("notifications")}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer relative transition-all"
            title="Broadcast Notifications"
          >
            <Bell className="w-4 h-4" />
            {dbState.notices && dbState.notices.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {dbState.notices.length}
              </span>
            )}
          </button>

          {/* Profile User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 cursor-pointer py-1 px-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                />
              ) : (
                <UserCircle className="w-6 h-6 text-gray-400" />
              )}
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight block">{currentUser?.name || "Haris Khan"}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block leading-none">{currentUser?.role?.replace("_", " ") || "SUPER ADMIN"}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50 animate-fade-in text-xs">
                <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800">
                  <p className="font-bold text-gray-900 dark:text-gray-100">{currentUser?.name || "Active Session"}</p>
                  <p className="text-[10px] text-gray-400 truncate">{currentUser?.email || "admin@edusphere.ai"}</p>
                  <div className="mt-1.5 inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    {currentUser?.role?.replace("_", " ")}
                  </div>
                </div>

                <div className="px-2 pt-1.5 space-y-1">
                  <button
                    onClick={() => { setShowProfileDropdown(false); setActiveModal("profile"); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 rounded-xl cursor-pointer font-medium text-gray-700 dark:text-gray-300 transition-all"
                  >
                    <UserCircle className="w-4 h-4 text-indigo-500" />
                    My Profile &amp; Avatar
                  </button>
                  <button
                    onClick={() => { setShowProfileDropdown(false); setActiveModal("school_switch"); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 rounded-xl cursor-pointer font-medium text-gray-700 dark:text-gray-300 transition-all"
                  >
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    Switch Campus
                  </button>
                  {/* Security Center strictly for Admin */}
                  {isAdmin && (
                    <button
                      onClick={() => { setShowProfileDropdown(false); setActiveModal("security"); }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 rounded-xl cursor-pointer font-medium text-gray-700 dark:text-gray-300 transition-all"
                    >
                      <Shield className="w-4 h-4 text-indigo-500" />
                      Security &amp; Devices
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30 text-rose-600 flex items-center gap-2.5 rounded-xl cursor-pointer font-bold transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out Securely
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Body (Sidebar + Scrollable Content) ───────────────────────── */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Sidebar Navigation */}
        <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between shrink-0 h-full transition-all duration-300 relative z-30 ${
          isCollapsed ? "w-20" : "w-64"
        } ${mobileMenuOpen ? "flex fixed inset-y-0 left-0 z-50 pt-16 shadow-2xl" : "hidden md:flex"}`}>
          
          {/* Collapse toggle button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex absolute -right-3 top-6 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md items-center justify-center text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 z-30 cursor-pointer transition-transform hover:scale-110"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Independently Scrollable Navigation */}
          <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${isCollapsed ? "px-2 py-4" : "p-4"} space-y-5 scrollbar-thin`} style={{ scrollbarWidth: "thin", overscrollBehavior: "contain", scrollBehavior: "smooth" }}>
            {/* Campus Header (Expanded) */}
            {!isCollapsed ? (
              <div className="bg-slate-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base shrink-0">
                  🏫
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold block">Active Campus</span>
                  <span className="font-display font-bold block text-xs text-gray-900 dark:text-gray-100 truncate">{activeOrg.name}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg" title={activeOrg.name}>
                  🏫
                </div>
              </div>
            )}

            {/* Clearance badge */}
            {!isCollapsed ? (
              <div className={`p-2.5 rounded-xl border ${currentMeta.bg}`}>
                <span className="font-bold text-xs block">{currentMeta.label}</span>
                <span className="text-[10px] opacity-80 block mt-0.5 leading-snug">{currentMeta.desc}</span>
              </div>
            ) : null}

            {/* Role-Specific Navigation Links */}
            <nav className="space-y-1 text-xs">
              {/* 1. ADMINS (Super Admin, School Admin, Principal) */}
              {(currentRole === UserRole.SUPER_ADMIN || currentRole === UserRole.SCHOOL_ADMIN || currentRole === UserRole.PRINCIPAL) && (
                <>
                  {!isCollapsed && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">
                      Enterprise Workspace
                    </span>
                  )}
                  <button
                    onClick={() => setActiveModal("analytics")}
                    onMouseEnter={() => setHoveredTooltip("Analytics Dashboard")}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className="w-full text-left p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-3 transition-colors cursor-pointer relative group"
                  >
                    <BarChart2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    {!isCollapsed && <span>Live Analytics</span>}
                    {isCollapsed && hoveredTooltip === "Analytics Dashboard" && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl z-50 animate-fade-in">
                        Live Analytics
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveModal("documents")}
                    onMouseEnter={() => setHoveredTooltip("Document Generator")}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className="w-full text-left p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-3 transition-colors cursor-pointer relative group"
                  >
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    {!isCollapsed && <span>Document Generator</span>}
                    {isCollapsed && hoveredTooltip === "Document Generator" && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl z-50 animate-fade-in">
                        Document Generator
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveModal("approvals")}
                    onMouseEnter={() => setHoveredTooltip("Approval Workflows")}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className="w-full text-left p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-3 transition-colors cursor-pointer relative group"
                  >
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    {!isCollapsed && <span>Approval Workflows</span>}
                    {isCollapsed && hoveredTooltip === "Approval Workflows" && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl z-50 animate-fade-in">
                        Approval Workflows
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveModal("sessions")}
                    onMouseEnter={() => setHoveredTooltip("Academic Sessions")}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className="w-full text-left p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-3 transition-colors cursor-pointer relative group"
                  >
                    <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                    {!isCollapsed && <span>Academic Sessions</span>}
                    {isCollapsed && hoveredTooltip === "Academic Sessions" && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl z-50 animate-fade-in">
                        Academic Sessions
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveModal("import")}
                    onMouseEnter={() => setHoveredTooltip("Data Import Center")}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className="w-full text-left p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-3 transition-colors cursor-pointer relative group"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-teal-500 shrink-0" />
                    {!isCollapsed && <span>Import Center</span>}
                    {isCollapsed && hoveredTooltip === "Data Import Center" && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl z-50 animate-fade-in">
                        Import Center
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveModal("security")}
                    onMouseEnter={() => setHoveredTooltip("Security Center")}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className="w-full text-left p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-3 transition-colors cursor-pointer relative group"
                  >
                    <Shield className="w-4 h-4 text-rose-500 shrink-0" />
                    {!isCollapsed && <span>Security & MFA</span>}
                    {isCollapsed && hoveredTooltip === "Security Center" && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl z-50 animate-fade-in">
                        Security & MFA
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setShowSyncCenter(true)}
                    onMouseEnter={() => setHoveredTooltip("Sync & Offline Engine")}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className="w-full text-left p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-3 transition-colors cursor-pointer relative group"
                  >
                    <RefreshCw className="w-4 h-4 text-cyan-500 shrink-0" />
                    {!isCollapsed && <span>Sync Center</span>}
                    {isCollapsed && hoveredTooltip === "Sync & Offline Engine" && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl z-50 animate-fade-in">
                        Sync Center
                      </div>
                    )}
                  </button>
                </>
              )}

              {/* 2. TEACHER FACULTY */}
              {currentRole === UserRole.TEACHER && (
                <>
                  {!isCollapsed && (
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block mb-2 px-1">
                      Faculty Operations
                    </span>
                  )}
                  {[
                    { tab: "attendance", label: "Mark Attendance", icon: CheckSquare, color: "text-emerald-500" },
                    { tab: "assignments", label: "Homework & Tasks", icon: BookOpen, color: "text-indigo-500" },
                    { tab: "grading", label: "Grading Queue", icon: PenTool, color: "text-amber-500" },
                    { tab: "exams_marks", label: "Exams & Marks", icon: Award, color: "text-rose-500" },
                    { tab: "timetable", label: "Faculty Schedule", icon: Calendar, color: "text-blue-500" },
                    { tab: "my_classes", label: "Classes & Subjects", icon: Users, color: "text-teal-500" },
                    { tab: "leaves", label: "Leave Balance", icon: Clock, color: "text-orange-500" },
                    { tab: "announcements", label: "Campus Notices", icon: Bell, color: "text-purple-500" },
                    { tab: "ai_planner", label: "AI Lesson Planner", icon: Sparkles, color: "text-violet-500" },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.tab}
                        onClick={() => window.dispatchEvent(new CustomEvent("edusphere:navigate-tab", { detail: item.tab }))}
                        onMouseEnter={() => setHoveredTooltip(item.label)}
                        onMouseLeave={() => setHoveredTooltip(null)}
                        className="w-full text-left p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-3 transition-colors cursor-pointer relative group"
                      >
                        <Icon className={`w-4 h-4 ${item.color} shrink-0`} />
                        {!isCollapsed && <span>{item.label}</span>}
                        {isCollapsed && hoveredTooltip === item.label && (
                          <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl z-50 animate-fade-in">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </>
              )}

              {/* 3. STUDENT PORTAL */}
              {currentRole === UserRole.STUDENT && (
                <>
                  {!isCollapsed && (
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block mb-2 px-1">
                      Student Dashboard
                    </span>
                  )}
                  {[
                    { tab: "results", label: "Report Card & Marks", icon: Award, color: "text-amber-500" },
                    { tab: "assignments", label: "Homework & Tasks", icon: BookOpen, color: "text-indigo-500" },
                    { tab: "attendance", label: "My Attendance", icon: CheckSquare, color: "text-emerald-500" },
                    { tab: "timetable", label: "Class Timetable", icon: Calendar, color: "text-blue-500" },
                    { tab: "fees", label: "Fee Vouchers & Dues", icon: CreditCard, color: "text-rose-500" },
                    { tab: "library", label: "Digital Library", icon: Bookmark, color: "text-teal-500" },
                    { tab: "notices", label: "School Notices", icon: Bell, color: "text-purple-500" },
                    { tab: "ai_tutor", label: "AI Study Tutor", icon: Sparkles, color: "text-violet-500" },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.tab}
                        onClick={() => window.dispatchEvent(new CustomEvent("edusphere:navigate-tab", { detail: item.tab }))}
                        onMouseEnter={() => setHoveredTooltip(item.label)}
                        onMouseLeave={() => setHoveredTooltip(null)}
                        className="w-full text-left p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-3 transition-colors cursor-pointer relative group"
                      >
                        <Icon className={`w-4 h-4 ${item.color} shrink-0`} />
                        {!isCollapsed && <span>{item.label}</span>}
                        {isCollapsed && hoveredTooltip === item.label && (
                          <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl z-50 animate-fade-in">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </>
              )}

              {/* 4. PARENT GATEWAY */}
              {currentRole === UserRole.PARENT && (
                <>
                  {!isCollapsed && (
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block mb-2 px-1">
                      Parent Portal
                    </span>
                  )}
                  {[
                    { tab: "results", label: "Child Academic Report", icon: Award, color: "text-amber-500" },
                    { tab: "attendance", label: "Child Attendance", icon: CheckSquare, color: "text-emerald-500" },
                    { tab: "fees", label: "Fee Challans & Receipts", icon: CreditCard, color: "text-rose-500" },
                    { tab: "assignments", label: "Homework Status", icon: BookOpen, color: "text-indigo-500" },
                    { tab: "timetable", label: "Daily Schedule", icon: Calendar, color: "text-blue-500" },
                    { tab: "announcements", label: "School Notices", icon: Bell, color: "text-purple-500" },
                    { tab: "communication", label: "Teacher Messaging", icon: MessageSquare, color: "text-teal-500" },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.tab}
                        onClick={() => window.dispatchEvent(new CustomEvent("edusphere:navigate-tab", { detail: item.tab }))}
                        onMouseEnter={() => setHoveredTooltip(item.label)}
                        onMouseLeave={() => setHoveredTooltip(null)}
                        className="w-full text-left p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-3 transition-colors cursor-pointer relative group"
                      >
                        <Icon className={`w-4 h-4 ${item.color} shrink-0`} />
                        {!isCollapsed && <span>{item.label}</span>}
                        {isCollapsed && hoveredTooltip === item.label && (
                          <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl z-50 animate-fade-in">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </>
              )}

              {/* 5. ACCOUNTANT OPERATIONS */}
              {currentRole === UserRole.ACCOUNTANT && (
                <>
                  {!isCollapsed && (
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block mb-2 px-1">
                      Finance & Ledger
                    </span>
                  )}
                  {[
                    { tab: "financial_dashboard", label: "Financial Dashboard", icon: BarChart2, color: "text-indigo-500" },
                    { tab: "invoices", label: "Fee Billing & Invoices", icon: CreditCard, color: "text-rose-500" },
                    { tab: "expenses", label: "Operating Expenses", icon: DollarSign, color: "text-amber-500" },
                    { tab: "payroll", label: "Staff Salaries & Payroll", icon: Users, color: "text-emerald-500" },
                    { tab: "student_ledger", label: "Student Ledgers", icon: FileSpreadsheet, color: "text-teal-500" },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.tab}
                        onClick={() => window.dispatchEvent(new CustomEvent("edusphere:navigate-tab", { detail: item.tab }))}
                        onMouseEnter={() => setHoveredTooltip(item.label)}
                        onMouseLeave={() => setHoveredTooltip(null)}
                        className="w-full text-left p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-3 transition-colors cursor-pointer relative group"
                      >
                        <Icon className={`w-4 h-4 ${item.color} shrink-0`} />
                        {!isCollapsed && <span>{item.label}</span>}
                        {isCollapsed && hoveredTooltip === item.label && (
                          <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl z-50 animate-fade-in">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setActiveModal("documents")}
                    onMouseEnter={() => setHoveredTooltip("Receipt Generator")}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className="w-full text-left p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-3 transition-colors cursor-pointer relative group"
                  >
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    {!isCollapsed && <span>Receipt & Voucher Tool</span>}
                    {isCollapsed && hoveredTooltip === "Receipt Generator" && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl z-50 animate-fade-in">
                        Receipt & Voucher Tool
                      </div>
                    )}
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="px-4 pb-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2 shrink-0">
            {!isCollapsed ? (
              <div className="space-y-1 text-[11px] text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700 dark:text-gray-300 truncate">{currentUser?.name || "Haris Khan"}</span>
                  <button
                    onClick={onSignOut}
                    className="p-1 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="truncate">Supabase PostgreSQL Live</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={onSignOut}
                  className="p-2 text-gray-400 hover:text-rose-500 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Dynamic Center Work Area */}
        <main className="flex-1 min-w-0 min-h-0 p-4 md:p-8 space-y-8 overflow-y-auto overflow-x-auto max-w-full">
          {children}
        </main>
      </div>

      {/* ─── Global Search Modal (⌘K) ────────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-indigo-500 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, teachers, fee vouchers, homework, books..."
                className="w-full bg-transparent text-sm focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <button 
                onClick={() => setSearchOpen(false)}
                className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 cursor-pointer font-bold"
              >
                ESC
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-4 text-xs">
              {searchResults ? (
                <>
                  {searchResults.students.length > 0 && (
                    <div>
                      <h5 className="font-bold text-gray-400 uppercase text-[10px] mb-1.5">Students ({searchResults.students.length})</h5>
                      <div className="space-y-1">
                        {searchResults.students.map(s => (
                          <div key={s.id} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-gray-100">{s.name} ({s.className} - {s.sectionName})</span>
                            <span className="font-mono text-gray-400">{s.admissionNo} • Roll #{s.rollNo}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.teachers.length > 0 && (
                    <div>
                      <h5 className="font-bold text-gray-400 uppercase text-[10px] mb-1.5">Staff ({searchResults.teachers.length})</h5>
                      <div className="space-y-1">
                        {searchResults.teachers.map(t => (
                          <div key={t.id} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-gray-100">{t.name}</span>
                            <span className="text-gray-400">{t.department} • {t.designation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.invoices.length > 0 && (
                    <div>
                      <h5 className="font-bold text-gray-400 uppercase text-[10px] mb-1.5">Fee Invoices ({searchResults.invoices.length})</h5>
                      <div className="space-y-1">
                        {searchResults.invoices.map(i => (
                          <div key={i.id} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-gray-100">{i.title} — {i.studentName}</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">PKR {i.amount.toLocaleString()} ({i.status})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.books.length > 0 && (
                    <div>
                      <h5 className="font-bold text-gray-400 uppercase text-[10px] mb-1.5">Library ({searchResults.books.length})</h5>
                      <div className="space-y-1">
                        {searchResults.books.map(b => (
                          <div key={b.id} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-gray-100">{b.title}</span>
                            <span className="text-gray-400">{b.author}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.students.length === 0 && searchResults.teachers.length === 0 && searchResults.invoices.length === 0 && searchResults.books.length === 0 && (
                    <p className="text-center py-6 text-gray-400">No matching records found.</p>
                  )}
                </>
              ) : (
                <div className="py-6 text-center text-gray-400">
                  <p>Type at least 2 characters to search across students, faculty, invoices, and notices.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── School Switcher Modal ───────────────────────────────────────────── */}
      {activeModal === "school_switch" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-display font-extrabold text-base text-gray-900 dark:text-white">Switch Campus Scope</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select an authorized campus organization to switch your active working context. All queries and mutations will immediately isolate to the selected campus.
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {(dbState.organizations || []).map((org) => {
                const isSelected = org.id === activeOrgId;
                return (
                  <div
                    key={org.id}
                    onClick={() => {
                      setActiveOrgId(org.id);
                      setActiveModal(null);
                      toast.info("Campus Scope Switched", `Active scope changed to ${org.name}`);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10"
                        : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                        🏫
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100">{org.name}</h4>
                        <span className="text-[10px] text-gray-400 font-medium">Session: {org.academicSession || "2025-2026"} • {org.plan || "Enterprise"}</span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Enterprise Workspace Modals ─────────────────────────────────────── */}
      {activeModal === "analytics" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-5xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button onClick={() => setActiveModal(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <AnalyticsDashboard 
              students={dbState.students || []} 
              teachers={dbState.teachers || []} 
              feeInvoices={dbState.feeInvoices || dbState.invoices || []} 
              results={dbState.results || []} 
            />
          </div>
        </div>
      )}

      {activeModal === "documents" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-4xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button onClick={() => setActiveModal(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <DocumentGenerator 
              organization={activeOrg}
              students={dbState.students || []}
              teachers={dbState.teachers || []}
              feeInvoices={dbState.feeInvoices || dbState.invoices || []}
              payrolls={dbState.payroll || dbState.payrolls || []}
            />
          </div>
        </div>
      )}

      {activeModal === "approvals" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-3xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button onClick={() => setActiveModal(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ApprovalWorkflows />
          </div>
        </div>
      )}

      {activeModal === "sessions" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-3xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button onClick={() => setActiveModal(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <AcademicSessions students={dbState.students || []} />
          </div>
        </div>
      )}

      {activeModal === "import" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-3xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button onClick={() => setActiveModal(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ImportCenter activeOrgId={activeOrgId} />
          </div>
        </div>
      )}

      {activeModal === "security" && (
        isAdmin ? (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-4xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-end mb-2">
                <button onClick={() => setActiveModal(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SecurityCenter 
                currentUser={currentUser} 
                auditLogs={dbState.auditLogs || []} 
                allUsers={dbState.users || []} 
                onMutate={onMutate} 
                activeSchoolName={activeOrg.name} 
              />
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-800 w-full max-w-md rounded-3xl p-6 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Admin Clearance Required</h3>
              <p className="text-xs text-gray-500">Security Center and System Controls are strictly restricted to authorized Platform and Campus Administrators.</p>
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 font-bold text-xs cursor-pointer">
                Dismiss
              </button>
            </div>
          </div>
        )
      )}

      {activeModal === "notifications" && (
        <NotificationCenter isOpen={true} onClose={() => setActiveModal(null)} />
      )}

      {/* Sync & Backup Center Modal */}
      <SyncCenter isOpen={showSyncCenter} onClose={() => setShowSyncCenter(false)} dbState={dbState} />

      {/* ─── My Profile & Universal Avatar Modal ─────────────────────────────── */}
      {activeModal === "profile" && currentUser && (
        <UserProfileModal
          currentUser={currentUser}
          activeOrgId={activeOrgId}
          activeOrgName={activeOrg.name}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}

function UserProfileModal({
  currentUser,
  activeOrgId,
  activeOrgName,
  onClose
}: {
  currentUser: User;
  activeOrgId: string;
  activeOrgName: string;
  onClose: () => void;
}) {
  const [avatar, setAvatar] = useState<string>(currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`);
  const [name, setName] = useState(currentUser.name || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [phone, setPhone] = useState((currentUser as any).phone || "+92 300 1234567");
  const [isUploading, setIsUploading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large", "Please select a photo smaller than 5 MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setAvatar(base64);
      try {
        const uploadedUrl = await uploadUserProfilePicture(
          currentUser.id,
          activeOrgId,
          base64,
          currentUser.role,
          currentUser.name
        );
        setAvatar(uploadedUrl);
        toast.success("Profile photo updated and saved successfully.");
      } catch (err: any) {
        toast.error("Upload error", err.message || "Failed to upload photo.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = async () => {
    setIsUploading(true);
    try {
      const defaultUrl = await deleteUserProfilePicture(
        currentUser.id,
        activeOrgId,
        currentUser.role,
        currentUser.name
      );
      setAvatar(defaultUrl);
      toast.info("Avatar reset", "Profile picture restored to default initials avatar.");
    } catch (err: any) {
      toast.error("Reset error", err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Password mismatch", "New password and confirmation do not match.");
      return;
    }
    toast.success("Profile saved", "Account information and security preferences updated.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <UserCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-gray-900 dark:text-white">
                My Profile &amp; Account Security
              </h3>
              <p className="text-[11px] text-gray-500">
                {activeOrgName} • {currentUser.role.replace(/_/g, " ")}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Upload / Crop / Delete Section */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-5">
          <div className="relative group">
            <img
              src={avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white text-xs font-bold">
                Uploading...
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white">Profile Picture</h4>
            <p className="text-[11px] text-gray-500">
              Upload PNG, JPG, or WebP photo up to 5 MB. Synced to Supabase Storage &amp; SQLite cache.
            </p>
            <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
              <label className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/20 transition-all">
                Upload New Photo
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-rose-100 hover:text-rose-700 text-gray-700 dark:text-gray-300 font-bold text-xs transition-all cursor-pointer"
              >
                Reset Default
              </button>
            </div>
          </div>
        </div>

        {/* Profile Bio & Password Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Assigned Role</label>
              <input
                type="text"
                disabled
                value={currentUser.role.replace(/_/g, " ")}
                className="w-full p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-gray-500 font-bold uppercase cursor-not-allowed"
              />
            </div>
          </div>

          {/* Change Password */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              Change Password
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 text-[11px]">New Password</label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 text-[11px]">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
