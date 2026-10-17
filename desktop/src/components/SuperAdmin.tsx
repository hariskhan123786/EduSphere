/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI - Comprehensive Production-Ready Super Admin Portal Pro Max
 * Global Multi-Tenant SaaS Command Headquarters:
 * Platform KPI Dashboards, Multi-School Provisioning & Isolation, Platform-Wide User Security,
 * Cross-Campus Academic Benchmarks, Immutable Platform Audit Stream, and Feature Flagging.
 */

import React, { useState, useMemo } from "react";
import { 
  Building, CreditCard, Users, Award, ShieldAlert, CheckCircle, 
  XCircle, PlusCircle, Calendar, Trash2, Search, ArrowUpRight, 
  Clock, Database, Globe, Shield, Key, Lock, RefreshCw,
  Edit3, Eye, EyeOff, Download, Layers, ToggleLeft, ToggleRight, Sparkles,
  BarChart2, Activity
} from "lucide-react";
import { DatabaseSchema } from "../types.js";
import { Organization, User, UserRole, AuditLog } from "../types.js";
import { exportToCsv } from "../lib/desktop-api.js";
import { formatPKR, formatPKRFull, exportStudentReportPDF, exportFeeReceiptPDF, exportFeeRegisterPDF, exportPayrollPDF, exportAttendancePDF, exportClassResultsPDF, exportNoticeDocx, exportLeaveLetterDocx, exportBackupJSON, exportBackupExcel } from "../lib/reports.js";
import SecurityCenter from "./SecurityCenter.js";

interface SuperAdminProps {
  dbState: DatabaseSchema;
  onMutate: (action: "INSERT" | "UPDATE" | "DELETE", table: string, data: any) => Promise<void>;
  isLoading: boolean;
  currentUser?: any;
}

type SuperAdminTab = 
  | "platform_dashboard"
  | "schools"
  | "platform_users"
  | "platform_analytics"
  | "security_center"
  | "platform_settings"
  | "feature_management";

export default function SuperAdmin({ dbState, onMutate, isLoading, currentUser }: SuperAdminProps) {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>("platform_dashboard");

  // Listen for sidebar tab navigation events dispatched by DashboardLayout
  React.useEffect(() => {
    const handleNav = (e: any) => {
      if (e.detail) setActiveTab(e.detail as SuperAdminTab);
    };
    window.addEventListener("edusphere:navigate-tab", handleNav);
    return () => window.removeEventListener("edusphere:navigate-tab", handleNav);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [schoolStatusFilter, setSchoolStatusFilter] = useState("ALL");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userSchoolFilter, setUserSchoolFilter] = useState("ALL");
  const [userVisibilityFilter, setUserVisibilityFilter] = useState<"ALL" | "VISIBLE" | "HIDDEN">("ALL");

  // Modals
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [editingSchool, setEditingSchool] = useState<Organization | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);

  // Add School Form State
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolSlug, setNewSchoolSlug] = useState("");
  const [newSchoolLogo, setNewSchoolLogo] = useState("");
  const [newSchoolPlan, setNewSchoolPlan] = useState<"Growth" | "Professional" | "Enterprise">("Enterprise");
  const [newSchoolAddress, setNewSchoolAddress] = useState("Lahore, Pakistan");
  const [newSchoolPhone, setNewSchoolPhone] = useState("+92-42-35870001");
  const [newSchoolEmail, setNewSchoolEmail] = useState("admin@school.pk");

  // Add User Form State
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.SCHOOL_ADMIN);
  const [newUserOrgId, setNewUserOrgId] = useState(dbState.organizations[0]?.id || "");

  // -------------------------------------------------------------
  // Global Platform Metrics
  // -------------------------------------------------------------
  const totalSchoolsCount = dbState.organizations.length;
  const activeSchoolsCount = dbState.organizations.filter(o => o.status === "Active").length;
  const suspendedSchoolsCount = totalSchoolsCount - activeSchoolsCount;

  const totalUsersCount = dbState.users.length;
  const totalStudentsCount = dbState.students.length;
  const totalTeachersCount = dbState.teachers.length;

  const totalPlatformMrr = dbState.organizations.reduce((sum, o) => sum + (o.status === "Active" ? (o.mrr || 299) : 0), 0);

  // Feature Flags state per school
  const [featureFlags, setFeatureFlags] = useState<Record<string, { onlinePayments: boolean; aiPlanner: boolean; transport: boolean; library: boolean }>>({
    "org-1": { onlinePayments: true, aiPlanner: true, transport: true, library: true },
    "org-pk-1": { onlinePayments: true, aiPlanner: true, transport: true, library: true }
  });

  // -------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------
  const handleToggleSchoolStatus = async (org: Organization) => {
    const nextStatus = org.status === "Active" ? "Suspended" : "Active";
    await onMutate("UPDATE", "organizations", {
      ...org,
      status: nextStatus
    });
    alert(`School ${org.name} status updated to ${nextStatus}.`);
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim() || !newSchoolSlug.trim()) return;

    let defaultMrr = 149;
    if (newSchoolPlan === "Professional") defaultMrr = 299;
    if (newSchoolPlan === "Enterprise") defaultMrr = 599;

    await onMutate("INSERT", "organizations", {
      name: newSchoolName.trim(),
      slug: newSchoolSlug.toLowerCase().replace(/\s+/g, "-"),
      logo: newSchoolLogo || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=120&auto=format&fit=crop&q=80",
      primaryColor: "indigo",
      academicSession: "2025-2026",
      plan: newSchoolPlan,
      mrr: defaultMrr,
      status: "Active",
      phone: newSchoolPhone,
      email: newSchoolEmail,
      address: newSchoolAddress,
      createdAt: new Date().toISOString()
    });

    setShowAddSchool(false);
    setNewSchoolName("");
    setNewSchoolSlug("");
    alert("New school tenant provisioned on EduSphere Cloud!");
  };

  const handleCreatePlatformUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim() || !newUserEmail.trim()) return;

    await onMutate("INSERT", "users", {
      name: newUserName.trim(),
      username: newUserUsername.toLowerCase().trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      organizationId: newUserRole === UserRole.SUPER_ADMIN ? null : newUserOrgId,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newUserName.trim())}`,
      status: "Active"
    });

    setShowAddUser(false);
    setNewUserName("");
    setNewUserUsername("");
    setNewUserEmail("");
    alert("Platform user credentials provisioned successfully.");
  };

  const handleToggleUserStatus = async (user: User) => {
    const nextStatus = user.status === "Active" ? "Inactive" : "Active";
    await onMutate("UPDATE", "users", {
      id: user.id,
      status: nextStatus
    });
    alert(`User ${user.name} account marked as ${nextStatus}.`);
  };

  const handleToggleUserHide = async (user: User) => {
    const isCurrentlyHidden = user.isHidden || user.status === "Hidden";
    const nextHidden = !isCurrentlyHidden;
    await onMutate("UPDATE", "users", {
      id: user.id,
      isHidden: nextHidden,
      status: nextHidden ? "Hidden" : "Active"
    });
    alert(`User ${user.name} is now ${nextHidden ? "hidden from directory listings" : "unhidden and restored to visible status"}.`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ================= TOP COMMAND BANNER ================= */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white border border-rose-900/40 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Globe className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-300">
              Global Multi-Tenant SaaS Headquarters
            </span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight mt-1">
            EduSphere Cloud Platform Administration
          </h2>
          <p className="text-xs text-rose-200/70">
            Super Administrator: <strong>{currentUser?.name || "Haris"}</strong> • Full tenant isolation and global control.
          </p>
        </div>

        <button
          onClick={() => setShowAddSchool(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Provision New School Tenant
        </button>
      </div>

      {/* ================= TAB NAVIGATION ================= */}
      <div 
        className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 border-b border-gray-200 dark:border-gray-800 text-xs scrollbar-thin scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
      >
        {[
          { id: "platform_dashboard", label: "Platform Overview", icon: Sparkles },
          { id: "schools", label: "School Tenants Master", icon: Building },
          { id: "platform_users", label: "Global Users Directory", icon: Users },
          { id: "platform_analytics", label: "Platform Analytics", icon: BarChart2 },
          { id: "security_center", label: "Security & Audit Stream", icon: ShieldAlert },
          { id: "feature_management", label: "Tenant Feature Toggles", icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SuperAdminTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: PLATFORM DASHBOARD ================= */}
      {activeTab === "platform_dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total School Tenants</p>
                <p className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mt-1">{totalSchoolsCount}</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{activeSchoolsCount} Active • {suspendedSchoolsCount} Suspended</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Platform MRR (SaaS)</p>
                <p className="text-2xl font-display font-extrabold text-emerald-600 mt-1">${totalPlatformMrr}/mo</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Recurring SaaS Subscriptions</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total Provisioned Users</p>
                <p className="text-2xl font-display font-extrabold text-indigo-600 mt-1">{totalUsersCount}</p>
                <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Across all tenant schools</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total Enrolled Scholars</p>
                <p className="text-2xl font-display font-extrabold text-purple-600 mt-1">{totalStudentsCount}</p>
                <p className="text-[10px] text-purple-600 font-semibold mt-0.5">{totalTeachersCount} Faculty Instructors</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SCHOOL TENANTS MASTER ================= */}
      {activeTab === "schools" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbState.organizations.map(org => {
              const studentsInOrg = (dbState.students || []).filter(s => s.organizationId === org.id);
              const teachersInOrg = (dbState.teachers || []).filter(t => t.organizationId === org.id);

              return (
                <div key={org.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        org.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      }`}>
                        {org.status}
                      </span>
                      <h4 className="text-lg font-display font-extrabold text-gray-900 dark:text-white mt-1">{org.name}</h4>
                      <p className="text-xs text-gray-400 font-mono">Slug: {org.slug} • Session: {org.academicSession}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-center text-xs">
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Students</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{studentsInOrg.length}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Teachers</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{teachersInOrg.length}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">MRR</p>
                      <p className="font-bold text-emerald-600">${org.mrr || 149}/mo</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleToggleSchoolStatus(org)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                        org.status === "Active" ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {org.status === "Active" ? "Suspend Tenant" : "Activate Tenant"}
                    </button>
                    <span className="text-[10px] font-bold text-indigo-600">{org.plan} Plan</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal: Provision School */}
          {showAddSchool && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Provision New School Tenant</h3>
                <form onSubmit={handleCreateSchool} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">School Name</label>
                    <input type="text" required value={newSchoolName} onChange={(e) => {
                      setNewSchoolName(e.target.value);
                      setNewSchoolSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                    }} placeholder="e.g. Crescent Model School" className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Tenant Slug</label>
                      <input type="text" required value={newSchoolSlug} onChange={(e) => setNewSchoolSlug(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-mono" />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">SaaS Plan</label>
                      <select value={newSchoolPlan} onChange={(e) => setNewSchoolPlan(e.target.value as any)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-bold">
                        <option value="Growth">Growth (₨ 149/mo)</option>
                        <option value="Professional">Professional (₨ 299/mo)</option>
                        <option value="Enterprise">Enterprise (₨ 599/mo)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Campus City & Address</label>
                    <input type="text" value={newSchoolAddress} onChange={(e) => setNewSchoolAddress(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddSchool(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer">Provision School</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: GLOBAL USERS DIRECTORY ================= */}
      {activeTab === "platform_users" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">
                Platform-Wide User Directory ({totalUsersCount} Accounts)
              </h3>
              <p className="text-xs text-gray-500">Cross-tenant user security, status toggling, and role management.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userVisibilityFilter}
                onChange={(e) => setUserVisibilityFilter(e.target.value as any)}
                className="text-xs px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 font-semibold"
              >
                <option value="ALL">All Visibility</option>
                <option value="VISIBLE">Visible Only</option>
                <option value="HIDDEN">Hidden Only</option>
              </select>

              <button
                onClick={() => setShowAddUser(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-rose-600/20"
              >
                + Create Account
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Assigned Tenant</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {dbState.users
                    .filter(u => {
                      const isUserHidden = u.isHidden || u.status === "Hidden";
                      const matchVisibility = userVisibilityFilter === "ALL" || 
                        (userVisibilityFilter === "HIDDEN" && isUserHidden) || 
                        (userVisibilityFilter === "VISIBLE" && !isUserHidden);
                      const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
                      const matchSchool = userSchoolFilter === "ALL" || u.organizationId === userSchoolFilter;
                      const matchSearch = !searchTerm || 
                        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchVisibility && matchRole && matchSchool && matchSearch;
                    })
                    .map(u => {
                      const org = dbState.organizations.find(o => o.id === u.organizationId);

                      return (
                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{u.name}</td>
                          <td className="py-3 px-4 font-mono text-gray-500">{u.username}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">{org?.name || "Global / Super Admin"}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                              u.isHidden || u.status === "Hidden"
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
                                : u.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            }`}>
                              {(u.isHidden || u.status === "Hidden") && <EyeOff className="w-3 h-3" />}
                              {u.isHidden || u.status === "Hidden" ? "Hidden" : u.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleUserHide(u)}
                                title={u.isHidden || u.status === "Hidden" ? "Unhide user" : "Hide user"}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  u.isHidden || u.status === "Hidden"
                                    ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                              >
                                {u.isHidden || u.status === "Hidden" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                <span>{u.isHidden || u.status === "Hidden" ? "Unhide" : "Hide"}</span>
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer"
                              >
                                {u.status === "Active" ? "Disable" : "Enable"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Create User */}
          {showAddUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Create System User</h3>
                <form onSubmit={handleCreatePlatformUser} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Full Name</label>
                    <input type="text" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Full Name" className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Username</label>
                      <input type="text" required value={newUserUsername} onChange={(e) => setNewUserUsername(e.target.value)} placeholder="username" className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800" />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Role</label>
                      <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as any)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-bold">
                        <option value={UserRole.SCHOOL_ADMIN}>School Admin / Principal</option>
                        <option value={UserRole.ACCOUNTANT}>Accountant</option>
                        <option value={UserRole.TEACHER}>Teacher</option>
                        <option value={UserRole.STUDENT}>Student</option>
                        <option value={UserRole.PARENT}>Parent</option>
                        <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Email</label>
                    <input type="email" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="user@domain.com" className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800" />
                  </div>

                  {newUserRole !== UserRole.SUPER_ADMIN && (
                    <div>
                      <label className="block font-bold mb-1">Assign School Tenant</label>
                      <select value={newUserOrgId} onChange={(e) => setNewUserOrgId(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-bold">
                        {dbState.organizations.map(o => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="pt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddUser(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer">Create User</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: ENTERPRISE SECURITY & PLATFORM CONTROL CENTER ================= */}
      {activeTab === "security_center" && (
        <SecurityCenter
          currentUser={currentUser}
          auditLogs={dbState.auditLogs || []}
          allUsers={dbState.users || []}
          onMutate={onMutate}
          activeSchoolName="Global Multi-Tenant SaaS"
        />
      )}

      {/* ================= TAB 5: TENANT FEATURE TOGGLES ================= */}
      {activeTab === "feature_management" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dbState.organizations.map(org => {
              const flags = featureFlags[org.id] || { onlinePayments: true, aiPlanner: true, transport: true, library: true };

              return (
                <div key={org.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
                  <h4 className="font-bold text-base text-gray-900 dark:text-white">{org.name} — Feature Governance</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Online Fee Gateways (1Link)</p>
                        <p className="text-gray-400 text-[10px]">Enable parents to pay tuition fees online</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-[10px]">Active</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Groq AI Lesson Planner</p>
                        <p className="text-gray-400 text-[10px]">Enable faculty to generate lesson plans</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-[10px]">Active</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Fleet & Transport Tracking</p>
                        <p className="text-gray-400 text-[10px]">Manage buses and routes</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-[10px]">Active</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
