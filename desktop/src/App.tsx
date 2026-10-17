/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, Suspense, lazy } from "react";
import { 
  Loader2, AlertCircle, RefreshCw, Lock, ShieldCheck, 
  User, School, GraduationCap, Users, CreditCard, BookOpen, 
  ArrowRight, ShieldAlert, Mail, ClipboardList, CheckCircle,
  Sun, Moon, Database, HardDrive, Wifi, WifiOff, Shield
} from "lucide-react";
import { DatabaseSchema, UserRole, User as UserType } from "./types.js";
import { 
  fetchDbState, mutateDb, getSavedSession, saveSession, 
  clearSession, loginUser, registerUser, isTauriEnvironment, fetchSyncStatus,
  getConnectionMode, getLastSyncTime, type ConnectionMode
} from "./lib/desktop-api.js";

import DashboardLayout from "./components/DashboardLayout.js";
import ThemeCustomizer, { applyTheme } from "./components/ThemeCustomizer.js";
import SplashScreen from "./components/SplashScreen.js";
import SyncCenter from "./components/SyncCenter.js";
import { ToastProvider, toast } from "./components/ToastContainer.js";

const SuperAdmin      = lazy(() => import("./components/SuperAdmin.js"));
const SchoolAdmin     = lazy(() => import("./components/SchoolAdmin.js"));
const PrincipalPortal = lazy(() => import("./components/PrincipalPortal.js"));
const TeacherPortal   = lazy(() => import("./components/TeacherPortal.js"));
const StudentPortal   = lazy(() => import("./components/StudentPortal.js"));
const ParentPortal    = lazy(() => import("./components/ParentPortal.js"));
const AccountantPortal = lazy(() => import("./components/AccountantPortal.js"));

function PortalLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
        <Loader2 className="w-5 h-5 text-white animate-spin" />
      </div>
      <p className="text-xs font-semibold text-gray-400 tracking-wide">Loading offline module...</p>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showSyncCenter, setShowSyncCenter] = useState(false);

  const [dbState, setDbState] = useState<DatabaseSchema | null>(null);
  const [sessionUser, setSessionUser] = useState<UserType | null>(() => {
    const saved = getSavedSession();
    return saved ? saved.user : null;
  });

  const [activeOrgId, setActiveOrgId] = useState<string>(() => {
    const saved = getSavedSession();
    return saved?.user?.organizationId || "01000000-0000-0000-0000-000000000001";
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = getSavedSession();
    return saved?.user?.role || UserRole.SUPER_ADMIN;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>("offline");

  useEffect(() => {
    const savedMode = (localStorage.getItem("edusphere_theme_mode") as any) || "dark";
    const savedColor = localStorage.getItem("edusphere_theme_color") || "indigo";
    applyTheme(savedMode, savedColor);
  }, []);

  const [loginSection, setLoginSection] = useState<UserRole>(UserRole.SUPER_ADMIN);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("01000000-0000-0000-0000-000000000001");
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedPreloadedUserId, setSelectedPreloadedUserId] = useState<string>("");

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Registration States
  const [isRegistering, setIsRegistering] = useState(false);
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regSelectedSchoolId, setRegSelectedSchoolId] = useState("01000000-0000-0000-0000-000000000001");
  const [regClassName, setRegClassName] = useState("Grade 10");
  const [regSectionName, setRegSectionName] = useState("Section A");
  const [regGuardianName, setRegGuardianName] = useState("");
  const [regGuardianPhone, setRegGuardianPhone] = useState("");
  const [regDesignation, setRegDesignation] = useState("Lecturer");
  const [regQualification, setRegQualification] = useState("Bachelor's Degree");

  useEffect(() => {
    if (sessionUser) {
      setCurrentRole(sessionUser.role);
      if (sessionUser.organizationId) {
        setActiveOrgId(sessionUser.organizationId);
        setSelectedSchoolId(sessionUser.organizationId);
      }
    }
  }, [sessionUser]);

  const loadDatabase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDbState(
        sessionUser?.organizationId || null,
        sessionUser?.role || UserRole.SUPER_ADMIN,
        sessionUser?.id || undefined
      );
      setDbState(data);
      setConnectionMode(getConnectionMode());
      if (data.organizations?.length && !data.organizations.some(o => o.id === selectedSchoolId)) {
        setSelectedSchoolId(data.organizations[0].id);
      }
    } catch (err: any) {
      console.warn("Primary SQLite database load fallback:", err);
      try {
        const fallbackData = await fetchDbState(null, UserRole.SUPER_ADMIN);
        setDbState(fallbackData);
      } catch (fallbackErr: any) {
        console.error("Critical SQLite connection error:", fallbackErr);
        setError(fallbackErr.message || "Failed to establish local SQLite connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, [sessionUser?.id]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    try {
      const result = await loginUser({
        identifier: loginIdentifier.trim(),
        password: loginPassword,
        role: loginSection
      });

      if (result.success && result.user) {
        const school = dbState?.organizations?.find(o => o.id === result.user.organizationId);
        saveSession(result.user, school || null, result.token);
        setSessionUser(result.user);
      } else {
        setAuthError("Could not authorize access in offline database. Check credentials.");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setAuthError(err.message || "Failed to authenticate with local SQLite database.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!regUsername.trim() || !regPassword.trim() || !regEmail.trim() || !regFullName.trim()) {
      setAuthError("All fields (Full Name, Username, Email, Password) are required.");
      return;
    }

    setIsLoading(true);
    try {
      const additionalInfo: any = {};
      if (loginSection === UserRole.STUDENT) {
        additionalInfo.className = regClassName;
        additionalInfo.sectionName = regSectionName;
        additionalInfo.guardianName = regGuardianName || "Guardian";
        additionalInfo.guardianPhone = regGuardianPhone || "+92 000 0000000";
      } else if (loginSection === UserRole.TEACHER) {
        additionalInfo.designation = regDesignation;
        additionalInfo.qualification = regQualification;
      }

      const orgId = loginSection === UserRole.SUPER_ADMIN ? null : regSelectedSchoolId;
      const result = await registerUser({
        username: regUsername.toLowerCase().trim(),
        password: regPassword,
        email: regEmail.trim(),
        role: loginSection,
        name: regFullName.trim(),
        organizationId: orgId,
        additionalInfo,
      });

      if (result.success && result.user) {
        const school = dbState?.organizations?.find(o => o.id === result.user.organizationId);
        saveSession(result.user, school || null, result.token);
        setSessionUser(result.user);
        setIsRegistering(false);
        // Clear registration form
        setRegFullName(""); setRegUsername(""); setRegEmail(""); setRegPassword("");
        setRegGuardianName(""); setRegGuardianPhone("");
      } else {
        setAuthError("Registration failed. Please try a different username or email.");
      }
    } catch (err: any) {
      console.error("Registration failed:", err);
      setAuthError(err.message || "Registration failed. Username or email may already be taken.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreloadedUserLogin = (user: UserType) => {
    // A locally selected profile is not proof of identity. Offline access is
    // available only after a successful authenticated login has cached a valid
    // local session through the Tauri auth command.
    setAuthError("Quick profile sign-in is disabled. Please use your account credentials.");
  };

  const handleLogout = () => {
    clearSession();
    setSessionUser(null);
    setSelectedPreloadedUserId("");
    setLoginIdentifier("");
    setLoginPassword("");
  };

  const handleMutate = async (action: "INSERT" | "UPDATE" | "DELETE", table: string, data: any) => {
    try {
      await mutateDb(action, table, data, {
        name: sessionUser?.name || "Desktop User",
        role: currentRole,
        organizationId: sessionUser?.organizationId || activeOrgId
      });
      const actionLabel = action === "INSERT" ? "created" : action === "UPDATE" ? "updated" : "deleted";
      toast.success(`${table.charAt(0).toUpperCase() + table.slice(1)} record ${actionLabel} successfully.`);
      // Reload state
      await loadDatabase();
    } catch (err: any) {
      console.error("Database mutation error:", err);
      toast.error(`Unable to save ${table} record`, err.message || "Please check connection and retry.");
    }
  };

  if (showSplash) {
    return <SplashScreen onFinished={() => setShowSplash(false)} />;
  }

  if (isLoading && !dbState) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/30 animate-pulse">
          <Database className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-lg font-bold">EduSphere AI Desktop</h2>
        <p className="text-xs text-gray-400 mt-1">Connecting to Supabase and loading your school data...</p>
        <div className="flex items-center gap-1.5 mt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '0ms'}} />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '150ms'}} />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '300ms'}} />
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!sessionUser) {
    const rolesConfig = [
      { role: UserRole.SUPER_ADMIN, label: "Super Admin", icon: ShieldCheck, desc: "Platform master & database management" },
      { role: UserRole.SCHOOL_ADMIN, label: "School Principal / Admin", icon: School, desc: "Campus administration & faculty" },
      { role: UserRole.TEACHER, label: "Teacher Portal", icon: Users, desc: "Classroom registers & grading" },
      { role: UserRole.STUDENT, label: "Student Desk", icon: GraduationCap, desc: "Homework, results & offline AI" },
      { role: UserRole.PARENT, label: "Parent Portal", icon: User, desc: "Student progress & vouchers" },
      { role: UserRole.ACCOUNTANT, label: "Finance & Accounts", icon: CreditCard, desc: "Billing & local fee ledger" }
    ];

    const roleUsers = (dbState?.users || []).filter(u => u.role === loginSection);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between p-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-between max-w-6xl w-full mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
                EduSphere AI <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-mono border border-indigo-500/30">Desktop</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {connectionMode === "supabase" ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <Wifi className="w-3 h-3" /> Supabase Live
                  </span>
                ) : connectionMode === "sqlite" ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                    <HardDrive className="w-3 h-3" /> SQLite Offline
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400">
                    <WifiOff className="w-3 h-3" /> No Connection
                  </span>
                )}
                <span className="text-gray-600 text-[10px]">•</span>
                <span className="text-[10px] text-gray-500">Supabase Cloud Sync</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSyncCenter(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Center
            </button>
            <ThemeCustomizer />
          </div>
        </div>

        {/* LOGIN CONTAINER */}
        <div className="max-w-5xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: Role Selector */}
          <div className="lg:col-span-5 space-y-3">
            <div className="mb-4">
              <h2 className="text-2xl font-display font-extrabold text-white">Select System Role</h2>
              <p className="text-xs text-gray-400 mt-1">Choose an authorized role to access local database:</p>
            </div>

            <div className="space-y-2">
              {rolesConfig.map((item) => {
                const Icon = item.icon;
                const isSelected = loginSection === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      setLoginSection(item.role);
                      setAuthError(null);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center gap-3 cursor-pointer border ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 font-bold"
                        : "bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-gray-300"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-indigo-400"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className={`text-[10px] ${isSelected ? "text-indigo-100" : "text-gray-400"}`}>{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Login Card */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                {connectionMode === "supabase" ? "🟢 Supabase Live Authentication" : connectionMode === "sqlite" ? "🟡 Offline SQLite Authentication" : "🔴 No Connection"}
              </span>
              <h3 className="text-xl font-display font-extrabold text-white mt-1">
                {loginSection} Access
              </h3>
              <p className="text-xs text-gray-400">
                {connectionMode === "supabase"
                  ? "Sign in using your Supabase username/email and password."
                  : "Sign in via preloaded offline profiles or local SQLite credentials."}
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Quick Demo Preloaded Profiles */}
            {roleUsers.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Quick Offline Login (Local Profiles):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roleUsers.slice(0, 4).map(u => (
                    <button
                      key={u.id}
                      onClick={() => handlePreloadedUserLogin(u)}
                      className="p-3 rounded-2xl bg-slate-800 hover:bg-indigo-600 text-left transition-all border border-slate-700 hover:border-indigo-500 text-xs flex items-center gap-2.5 cursor-pointer group"
                    >
                      <img src={u.avatar} className="w-7 h-7 rounded-full bg-slate-700 shrink-0" alt="avatar" />
                      <div className="truncate">
                        <p className="font-bold text-white group-hover:text-white truncate">{u.name}</p>
                        <p className="text-[10px] text-gray-400 group-hover:text-indigo-200 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Credential-based authentication only; there is no master-passcode bypass. */}
            {isRegistering ? (
              /* ========== REGISTRATION FORM ========== */
              <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Create New Account — {loginSection.replace(/_/g, ' ')}</span>
                  <button type="button" onClick={() => { setIsRegistering(false); setAuthError(null); }} className="text-[10px] text-indigo-400 hover:underline cursor-pointer">
                    ← Back to Sign In
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-300 mb-1">Full Name *</label>
                    <input type="text" required placeholder="e.g. Muhammad Ali" value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs" />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-300 mb-1">Username *</label>
                    <input type="text" required placeholder="e.g. ali.teacher" value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Email Address *</label>
                  <input type="email" required placeholder="e.g. ali@school.edu.pk" value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Password *</label>
                  <input type="password" required placeholder="Min 8 characters" value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono" />
                </div>

                {/* School Selector for roles */}
                {(dbState?.organizations?.length || 0) > 0 && (
                  <div>
                    <label className="block font-bold text-gray-300 mb-1">School / Organization *</label>
                    <select value={regSelectedSchoolId} onChange={e => setRegSelectedSchoolId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs">
                      {dbState!.organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Student-specific fields */}
                {loginSection === UserRole.STUDENT && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">Class</label>
                      <input type="text" placeholder="Grade 10" value={regClassName}
                        onChange={e => setRegClassName(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs" />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">Section</label>
                      <input type="text" placeholder="Section A" value={regSectionName}
                        onChange={e => setRegSectionName(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs" />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">Guardian Name</label>
                      <input type="text" placeholder="Father/Guardian" value={regGuardianName}
                        onChange={e => setRegGuardianName(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs" />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">Guardian Phone</label>
                      <input type="tel" placeholder="+92 300 0000000" value={regGuardianPhone}
                        onChange={e => setRegGuardianPhone(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs" />
                    </div>
                  </div>
                )}

                {/* Teacher-specific fields */}
                {loginSection === UserRole.TEACHER && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">Designation</label>
                      <input type="text" placeholder="Lecturer" value={regDesignation}
                        onChange={e => setRegDesignation(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs" />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">Qualification</label>
                      <input type="text" placeholder="Bachelor's Degree" value={regQualification}
                        onChange={e => setRegQualification(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs" />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Username / Email</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. imran.math or teacher@beaconhouse.edu.pk"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {connectionMode === "supabase" ? "Sign In with Supabase" : "Sign In Offline"}
                </button>
                {/* Create Account Toggle */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setIsRegistering(true); setAuthError(null); }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer transition-colors"
                  >
                    Don't have an account? <strong>Create Account →</strong>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-xs text-gray-500">
          EduSphere AI Desktop App • Supabase Cloud + SQLite Offline • Tauri Architecture
          {getLastSyncTime() && (
            <span className="ml-2 text-gray-600">• Last sync: {new Date(getLastSyncTime()!).toLocaleTimeString()}</span>
          )}
        </div>

        <SyncCenter isOpen={showSyncCenter} onClose={() => setShowSyncCenter(false)} />
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD
  return (
    <ToastProvider>
      <DashboardLayout
        activeOrgId={activeOrgId}
        setActiveOrgId={setActiveOrgId}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentUser={sessionUser}
        onSignOut={handleLogout}
        onMutate={handleMutate}
        dbState={dbState || {
          organizations: [], users: [], students: [], teachers: [], attendance: [],
          homework: [], homeworkSubmissions: [], exams: [], results: [], feeInvoices: [],
          notices: [], schoolEvents: [], timetable: [], libraryBooks: [], transportRoutes: [],
          hostelRooms: [], expenses: [], payroll: [], auditLogs: [], leaveRequests: [], examRecords: []
        }}
      >
        <Suspense fallback={<PortalLoader />}>
          {(() => {
            const userRole = sessionUser?.role || currentRole;

            // Strict per-role permission matrix (same as web)
            const ROLE_CAN_VIEW: Record<UserRole, UserRole[]> = {
              [UserRole.SUPER_ADMIN]:       Object.values(UserRole) as UserRole[],
              [UserRole.SCHOOL_ADMIN]:      [UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT, UserRole.ACCOUNTANT, UserRole.LIBRARIAN, UserRole.TRANSPORT_MANAGER],
              [UserRole.PRINCIPAL]:         [UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT],
              [UserRole.ACCOUNTANT]:        [UserRole.ACCOUNTANT],
              [UserRole.TEACHER]:           [UserRole.TEACHER],
              [UserRole.STUDENT]:           [UserRole.STUDENT],
              [UserRole.PARENT]:            [UserRole.PARENT],
              [UserRole.LIBRARIAN]:         [UserRole.LIBRARIAN],
              [UserRole.TRANSPORT_MANAGER]: [UserRole.TRANSPORT_MANAGER],
            };

            const allowedViews = ROLE_CAN_VIEW[userRole] ?? [userRole];
            if (!allowedViews.includes(currentRole)) {
              return (
                <div className="min-h-[60vh] flex items-center justify-center p-6">
                  <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-8 text-center shadow-xl space-y-5">
                    <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                      <Shield className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[9px] font-extrabold tracking-widest text-rose-600 dark:text-rose-400 uppercase bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                        403 — Access Denied
                      </span>
                      <h3 className="text-xl font-display font-black text-gray-900 dark:text-gray-100 mt-2">
                        Unauthorized Access
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Your account role (<strong className="text-gray-800 dark:text-gray-200 capitalize">{userRole.replace(/_/g, " ").toLowerCase()}</strong>) does not have clearance to access the <strong className="text-rose-600 dark:text-rose-400 capitalize">{currentRole.replace(/_/g, " ").toLowerCase()}</strong> module.
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">This attempt has been logged.</p>
                    </div>
                    <button
                      onClick={() => setCurrentRole(userRole)}
                      className="w-full px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      Return to My Workspace
                    </button>
                  </div>
                </div>
              );
            }

            if (currentRole === UserRole.SUPER_ADMIN) {
              return (
                <SuperAdmin
                  dbState={dbState!}
                  onMutate={handleMutate}
                  isLoading={isLoading}
                  currentUser={sessionUser}
                />
              );
            }

            if (currentRole === UserRole.SCHOOL_ADMIN) {
              return (
                <SchoolAdmin
                  dbState={dbState!}
                  onMutate={handleMutate}
                  isLoading={isLoading}
                  currentUser={sessionUser}
                />
              );
            }

            if (currentRole === UserRole.PRINCIPAL) {
              return (
                <PrincipalPortal
                  dbState={dbState!}
                  onMutate={handleMutate}
                  isLoading={isLoading}
                  currentUser={sessionUser}
                />
              );
            }

            if (currentRole === UserRole.TEACHER) {
              return (
                <TeacherPortal
                  dbState={dbState!}
                  onMutate={handleMutate}
                  isLoading={isLoading}
                  currentUser={sessionUser}
                />
              );
            }

            if (currentRole === UserRole.STUDENT) {
              return (
                <StudentPortal
                  dbState={dbState!}
                  onMutate={handleMutate}
                  isLoading={isLoading}
                  currentUser={sessionUser}
                />
              );
            }

            if (currentRole === UserRole.PARENT) {
              return (
                <ParentPortal
                  dbState={dbState!}
                  onMutate={handleMutate}
                  isLoading={isLoading}
                  currentUser={sessionUser}
                />
              );
            }

            if (currentRole === UserRole.ACCOUNTANT) {
              return (
                <AccountantPortal
                  dbState={dbState!}
                  onMutate={handleMutate}
                  isLoading={isLoading}
                  currentUser={sessionUser}
                />
              );
            }

            return null;
          })()}
        </Suspense>
      </DashboardLayout>
    </ToastProvider>
  );
}
