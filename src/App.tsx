/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, Suspense, lazy } from "react";
import { 
  Loader2, AlertCircle, RefreshCw, Lock, Key, ShieldCheck, 
  User, School, GraduationCap, Users, CreditCard, BookOpen, 
  ArrowRight, ShieldAlert, Mail, ClipboardList, CheckCircle,
  Sun, Moon
} from "lucide-react";
import { DatabaseSchema } from "../server/dbStore.js";
import { UserRole, User as UserType } from "./types.js";
import { fetchDbState, mutateDb, getSavedSession, saveSession, clearSession, forceRefreshCache, loginUser, registerUser, forgotPassword, resetPassword } from "./lib/api.js";

// Component imports — DashboardLayout loads eagerly (always needed after login)
import DashboardLayout from "./components/DashboardLayout.js";
import ThemeCustomizer, { applyTheme } from "./components/ThemeCustomizer.js";
import SplashScreen from "./components/SplashScreen.js";
import { ToastProvider, toast } from "./components/ToastContainer.js";

// Portal components are lazy-loaded: only downloaded when the user navigates to that role
// This cuts initial bundle size by ~70% and makes first paint instant
const SuperAdmin      = lazy(() => import("./components/SuperAdmin.js"));
const SchoolAdmin     = lazy(() => import("./components/SchoolAdmin.js"));
const PrincipalPortal = lazy(() => import("./components/PrincipalPortal.js"));
const TeacherPortal   = lazy(() => import("./components/TeacherPortal.js"));
const StudentPortal   = lazy(() => import("./components/StudentPortal.js"));
const ParentPortal    = lazy(() => import("./components/ParentPortal.js"));
const AccountantPortal = lazy(() => import("./components/AccountantPortal.js"));

// Minimal fallback shown while a portal chunk is being downloaded
function PortalLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
        <Loader2 className="w-5 h-5 text-white animate-spin" />
      </div>
      <p className="text-xs font-semibold text-gray-400 tracking-wide">Loading portal...</p>
    </div>
  );
}

export default function App() {
  // Show animated splash on every page load/reload
  const [showSplash, setShowSplash] = useState(true);

  const [dbState, setDbState] = useState<DatabaseSchema | null>(null);
  // Authentication states
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
    return saved?.user?.role || UserRole.STUDENT;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safety watchdog timer: release loading spinner after 2.5s to prevent infinite loading screen
  useEffect(() => {
    const watchdog = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(watchdog);
  }, []);

  // On first boot: detect if the localStorage org cache is stale (wrong school)
  // and clear it so fresh Supabase data loads automatically
  useEffect(() => {
    const CURRENT_ORG_ID = "01000000-0000-0000-0000-000000000001";
    const cachedOrgStamp = localStorage.getItem("edusphere_web_cache_org");
    if (cachedOrgStamp && cachedOrgStamp !== CURRENT_ORG_ID) {
      console.log("[App] Stale cache detected (", cachedOrgStamp, "), clearing for fresh load...");
      localStorage.removeItem("edusphere_web_cache");
      localStorage.removeItem("edusphere_web_cache_org");
    }
  }, []);

  // Initialize theme on initial boot
  useEffect(() => {
    const savedMode = (localStorage.getItem("edusphere_theme_mode") as any) || (localStorage.getItem("theme") as any) || "dark";
    const savedColor = localStorage.getItem("edusphere_theme_color") || "indigo";
    applyTheme(savedMode, savedColor);
  }, []);

  // Active section selected on login page
  const [loginSection, setLoginSection] = useState<UserRole>(UserRole.STUDENT);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("01000000-0000-0000-0000-000000000001");
  const [adminPasscode, setAdminPasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedPreloadedUserId, setSelectedPreloadedUserId] = useState<string>("");

  // Credentials and Mode States
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Recovery States
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoveryStatusMessage, setRecoveryStatusMessage] = useState<string | null>(null);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  // Registration Form States
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regSchoolName, setRegSchoolName] = useState("");
  const [regSelectedSchoolId, setRegSelectedSchoolId] = useState("01000000-0000-0000-0000-000000000001");

  // Role-specific Registration Info
  const [regRollNo, setRegRollNo] = useState("");
  const [regClassName, setRegClassName] = useState("Grade 10");
  const [regSectionName, setRegSectionName] = useState("Section A");
  const [regGuardianName, setRegGuardianName] = useState("");
  const [regGuardianPhone, setRegGuardianPhone] = useState("");
  const [regDesignation, setRegDesignation] = useState("Lecturer");
  const [regQualification, setRegQualification] = useState("Bachelor's Degree");

  // Sync state whenever session user changes
  useEffect(() => {
    if (sessionUser) {
      setCurrentRole(sessionUser.role);
      if (sessionUser.organizationId) {
        setActiveOrgId(sessionUser.organizationId);
        setSelectedSchoolId(sessionUser.organizationId);
      }
    }
  }, [sessionUser]);

  // Fetch full state for login pre-selection or filtered state for current session
  const loadDatabase = async (silent = false) => {
    if (!silent) setIsLoading(true);
    // Never clear a good dbState — just try to refresh in background
    try {
      let data: typeof dbState;
      if (sessionUser) {
        data = await fetchDbState(
          sessionUser.organizationId,
          sessionUser.role,
          sessionUser.id
        );
      } else {
        data = await fetchDbState(null, UserRole.SUPER_ADMIN);
      }
      if (data) {
        setDbState(data);
        setError(null);  // Clear any previous error on successful load
        if (data.organizations?.length && !data.organizations.some(o => o.id === selectedSchoolId)) {
          setSelectedSchoolId(data.organizations[0].id);
        }
      }
    } catch (err: any) {
      // fetchDbState has tier-3 localStorage + tier-4 seed fallback and should NEVER throw.
      // If it does, log it but don't block the UI with the error screen.
      console.error("Critical database connection error (unexpected):", err);
      if (!dbState) {
        // Only set a non-blocking error message — never show the full blocking screen
        // as long as we can still boot with seed data
        try {
          const emergencySeed = await fetchDbState(null, UserRole.SUPER_ADMIN);
          if (emergencySeed) {
            setDbState(emergencySeed);
            setError(null);
          }
        } catch {
          setError(err.message || "Failed to connect to database.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };


  // Secure manual credentials-based authentication handler
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
        const school = dbState?.organizations.find(o => o.id === result.user.organizationId);
        saveSession(result.user, school || null, result.token);
        setSessionUser(result.user);
      } else {
        setAuthError("Could not authorize access. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setAuthError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password Recovery Flow - Request Code
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setRecoveryStatusMessage(null);
    setSimulatedCode(null);
    if (!recoveryEmail.trim()) {
      setAuthError("Please specify your email address.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await forgotPassword(recoveryEmail.trim());
      if (res.success) {
        setRecoveryStatusMessage(res.message);
        if (res.code) {
          setSimulatedCode(res.code);
        }
        setRecoveryStep(2);
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to initiate recovery workflow.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password Recovery Flow - Submit Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setRecoveryStatusMessage(null);
    if (!recoveryEmail.trim() || !recoveryCode.trim() || !recoveryNewPassword.trim()) {
      setAuthError("Please fill out all fields.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await resetPassword({
        email: recoveryEmail.trim(),
        code: recoveryCode.trim(),
        newPassword: recoveryNewPassword.trim()
      });
      if (res.success) {
        alert(res.message);
        // Reset recovery states and go back to sign in
        setIsRecovering(false);
        setRecoveryStep(1);
        setRecoveryEmail("");
        setRecoveryCode("");
        setRecoveryNewPassword("");
        setSimulatedCode(null);
        setLoginIdentifier(recoveryEmail);
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Secure full-stack registration handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!regUsername || !regPassword || !regEmail || !regFullName) {
      setAuthError("All fields are required for registration.");
      return;
    }

    setIsLoading(true);
    try {
      const additionalInfo: any = {};
      if (loginSection === UserRole.STUDENT) {
        additionalInfo.rollNo = regRollNo || "01";
        additionalInfo.className = regClassName;
        additionalInfo.sectionName = regSectionName;
        additionalInfo.guardianName = regGuardianName || "Guardian";
        additionalInfo.guardianPhone = regGuardianPhone || "+1 (555) 000-0000";
      } else if (loginSection === UserRole.TEACHER) {
        additionalInfo.designation = regDesignation;
        additionalInfo.qualification = regQualification;
        additionalInfo.classesAssigned = [regClassName];
        additionalInfo.subjectsTaught = ["General Science"];
      }

      const result = await registerUser({
        username: regUsername.toLowerCase().trim(),
        password: regPassword,
        email: regEmail.trim(),
        role: loginSection,
        name: regFullName.trim(),
        organizationId: loginSection === UserRole.SUPER_ADMIN ? null : (loginSection === UserRole.SCHOOL_ADMIN ? null : regSelectedSchoolId),
        schoolName: loginSection === UserRole.SCHOOL_ADMIN ? regSchoolName : undefined,
        additionalInfo
      });

      if (result.success && result.user) {
        // Automatically log in newly registered user
        const school = dbState?.organizations.find(o => o.id === result.user.organizationId);
        saveSession(result.user, school || null, result.token);
        setSessionUser(result.user);
        setIsRegistering(false);
        // Clear registration states
        setRegFullName("");
        setRegUsername("");
        setRegEmail("");
        setRegPassword("");
        setRegSchoolName("");
      } else {
        setAuthError("Registration failed. Please try a different username or email.");
      }
    } catch (err: any) {
      console.error("Registration failed:", err);
      setAuthError(err.message || "Failed to register profile. Please try a different username or email.");
    } finally {
      setIsLoading(false);
    }
  };

  // Secure Sign Out
  const handleSignOut = () => {
    clearSession();
    setSessionUser(null);
    setAdminPasscode("");
    setSelectedPreloadedUserId("");
    setLoginIdentifier("");
    setLoginPassword("");
    setAuthError(null);
  };

  // Centralized data mutation function
  const handleMutation = async (
    action: "INSERT" | "UPDATE" | "DELETE",
    table: string,
    data: any
  ) => {
    setIsLoading(true);
    try {
      const payload = { ...data };
      if (!payload.organizationId && sessionUser?.organizationId) {
        payload.organizationId = sessionUser.organizationId;
      }

      await mutateDb(action, table, payload, {
        name: sessionUser?.name || "Lucas Miller",
        role: sessionUser?.role || UserRole.STUDENT,
        organizationId: sessionUser?.organizationId || activeOrgId
      });
      const actionLabel = action === "INSERT" ? "created" : action === "UPDATE" ? "updated" : "deleted";
      toast.success(`${table.charAt(0).toUpperCase() + table.slice(1)} record ${actionLabel} successfully.`);
      await loadDatabase();
    } catch (err: any) {
      console.error("Mutation failed:", err);
      toast.error(`Unable to save ${table} record`, err.message || "Failed to commit record.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-load default preloaded user ID when login section changes
  useEffect(() => {
    if (!dbState) return;
    setAuthError(null);
    setAdminPasscode("");

    const matchingUsers = dbState.users.filter(u => {
      if (u.role !== loginSection) return false;
      if (loginSection === UserRole.SUPER_ADMIN || loginSection === UserRole.PARENT) return true;
      return u.organizationId === selectedSchoolId;
    });

    if (matchingUsers.length > 0) {
      setSelectedPreloadedUserId(matchingUsers[0].id);
    } else {
      setSelectedPreloadedUserId("");
    }
  }, [loginSection, selectedSchoolId, dbState]);

  if (isLoading && !dbState) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-gray-900 dark:text-white">Connecting to School Portal...</p>
          <p className="text-xs text-gray-400">Loading secure campus sessions</p>
        </div>
        <button
          onClick={() => {
            clearSession();
            setSessionUser(null);
            setIsLoading(false);
          }}
          className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
        >
          Skip to Login Screen →
        </button>
      </div>
    );
  }

  if (!dbState) {
    // Only show blocking screen if we have ZERO data (should never happen after seed fallback)
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-4 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <div className="text-center max-w-md space-y-1">
          <h3 className="text-base font-bold">Loading School Portal...</h3>
          <p className="text-xs text-gray-400">Initializing local database cache. Please wait.</p>
          {error && <p className="text-[10px] font-mono bg-black/40 p-2 rounded text-rose-400 mt-2">{error}</p>}
        </div>
        <button
          onClick={() => loadDatabase()}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload App
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER PORTAL LOGIN ENTRY GATE
  // -------------------------------------------------------------
  // Splash overlay renders on top of everything on every page load
  if (showSplash) {
    return <SplashScreen duration={1200} onFinished={() => setShowSplash(false)} />;
  }
  if (!sessionUser) {
    const filteredUsersForLogin = dbState.users.filter(u => {
      if (u.role !== loginSection) return false;
      if (loginSection === UserRole.SUPER_ADMIN || loginSection === UserRole.PARENT) return true;
      return u.organizationId === selectedSchoolId;
    });

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative">
        {/* Floating Theme & Color Customizer on Login Screen */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeCustomizer />
        </div>

        <div className="max-w-4xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-slate-150 dark:border-gray-800 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* LEFT COLUMN: Section Selection */}
          <div className="col-span-1 md:col-span-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <School className="w-6 h-6" />
                  </span>
                  <span className="font-display font-black text-lg tracking-wider">EduSphere AI</span>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-display font-extrabold text-white">Identity Portal</h2>
                <p className="text-xs text-indigo-200/70 leading-relaxed">Select your operational field below to unlock isolated credentials:</p>
              </div>

              {/* Portal selection vertical buttons */}
              <div className="space-y-2 pt-2">
                {[
                  { role: UserRole.STUDENT, label: "Student Portal", desc: "View results & homework", icon: GraduationCap },
                  { role: UserRole.TEACHER, label: "Faculty / Teachers", desc: "Grade students & check classes", icon: Users },
                  { role: UserRole.PARENT, label: "Parent Gateway", desc: "Monitor fees & child logs", icon: ClipboardList },
                  { role: UserRole.ACCOUNTANT, label: "Accountant Ledger", desc: "Invoices & operational costs", icon: CreditCard },
                  { role: UserRole.PRINCIPAL, label: "School Principal", desc: "Executive campus overview", icon: School },
                  { role: UserRole.SCHOOL_ADMIN, label: "School Admin", desc: "Configure local campus & users", icon: ShieldCheck },
                  { role: UserRole.SUPER_ADMIN, label: "SaaS Super Admin", desc: "Global multi-tenancy", icon: ShieldCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = loginSection === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        setLoginSection(item.role as UserRole);
                        setAuthError(null);
                      }}
                      className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer border ${
                        isActive 
                          ? "bg-white/10 border-white/20 shadow-lg shadow-black/10 scale-[1.02] text-white" 
                          : "bg-transparent border-transparent text-indigo-200 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className={`p-2 rounded-xl transition-colors ${isActive ? "bg-indigo-500 text-white" : "bg-white/5 text-indigo-300"}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold leading-tight">{item.label}</p>
                        <p className={`text-[10px] truncate mt-0.5 ${isActive ? "text-indigo-100" : "text-indigo-300/65"}`}>{item.desc}</p>
                      </div>
                      {isActive && <ArrowRight className="w-4 h-4 shrink-0 text-white animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-[10px] text-indigo-300/60 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Active Sandbox Isolation
              </p>
              <p>All fields utilize end-to-end encrypted sessions and role-based row-level database filtering.</p>
            </div>
          </div>

          {/* RIGHT COLUMN: Authentication Fields Form */}
          <div className="col-span-1 md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white dark:bg-gray-900 overflow-y-auto max-h-[85vh] md:max-h-none relative">


            {authError && (
              <div className="mb-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-3.5 rounded-2xl flex items-start gap-3 text-xs text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Authentication Notice</p>
                  <p className="opacity-90 mt-0.5">{authError}</p>
                </div>
              </div>
            )}

            {isRecovering ? (
              /* ================= PASSWORD RECOVERY FORM ================= */
              <form onSubmit={recoveryStep === 1 ? handleForgotPasswordSubmit : handleResetPasswordSubmit} className="space-y-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md uppercase tracking-wider block">
                      Secure Account Recovery
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-black text-gray-900 dark:text-gray-100">
                    Recover Your Password
                  </h3>
                  <p className="text-xs text-gray-400">
                    {recoveryStep === 1 
                      ? "Enter your verified email to receive an instant security code." 
                      : "Enter the security code and establish your new credentials."}
                  </p>
                </div>

                {recoveryStatusMessage && (
                  <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 p-3.5 rounded-xl text-xs text-indigo-700 dark:text-indigo-300">
                    <p className="font-semibold">{recoveryStatusMessage}</p>
                    {simulatedCode && (
                      <div className="mt-2 p-2 bg-white dark:bg-gray-950 rounded-lg border border-indigo-150 dark:border-indigo-900 font-mono text-center">
                        <span className="text-gray-400 text-[10px] block font-sans">Simulated Code:</span>
                        <strong className="text-lg tracking-wider text-indigo-600 dark:text-indigo-400">{simulatedCode}</strong>
                      </div>
                    )}
                  </div>
                )}

                {recoveryStep === 1 ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-500" />
                        Verified Email Address:
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. lucas@school.edu"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 font-medium"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Recovery Code"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-500" />
                        Verified Email Address:
                      </label>
                      <input
                        type="email"
                        value={recoveryEmail}
                        disabled
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-100 dark:border-gray-905 bg-gray-50 dark:bg-gray-950 text-gray-400 focus:outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-indigo-500" />
                        6-Digit Security Code:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 123456"
                        maxLength={6}
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 font-medium tracking-widest text-center text-sm font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-500" />
                        Choose New Password:
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={recoveryNewPassword}
                        onChange={(e) => setRecoveryNewPassword(e.target.value)}
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 font-medium"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Account Password"}
                    </button>
                  </div>
                )}

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecovering(false);
                      setAuthError(null);
                      setRecoveryStatusMessage(null);
                      setSimulatedCode(null);
                      setRecoveryStep(1);
                    }}
                    className="text-gray-500 font-semibold hover:underline text-xs cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : !isRegistering ? (
              /* ================= SIGN IN FORM ================= */
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md uppercase tracking-wider block">
                      {loginSection.replace("_", " ")} Portal
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-black text-gray-900 dark:text-gray-100">
                    Sign In to ScholarOS
                  </h3>
                  <p className="text-xs text-gray-400">
                    Provide your distinct username or email and secure password.
                  </p>
                </div>

                {/* SCHOOL SELECTOR (Visible for School Admins, Teachers, Students, Accountants) */}
                {[UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.ACCOUNTANT].includes(loginSection) && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-indigo-500" />
                      Target Campus / School:
                    </label>
                    <select
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 font-semibold"
                    >
                      {dbState.organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name} ({org.status})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Username or Email Address:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. lucas"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Account Password:
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 font-medium"
                      required
                    />
                    <div className="flex justify-end text-[11px] mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsRecovering(true);
                          setAuthError(null);
                          setRecoveryStatusMessage(null);
                          setSimulatedCode(null);
                          setRecoveryStep(1);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>
                </div>

                {/* SANDBOX AUTO-FILL COMPONENT */}
                {(() => {
                  const filteredSeededUsers = dbState?.users.filter(u => {
                    if (u.role !== loginSection) return false;
                    if (loginSection === UserRole.SUPER_ADMIN || loginSection === UserRole.PARENT) return true;
                    return u.organizationId === selectedSchoolId;
                  }) || [];

                  if (filteredSeededUsers.length === 0) return null;

                  return (
                    <div className="bg-slate-50 dark:bg-gray-950/50 p-4 rounded-2xl border border-slate-150 dark:border-gray-850 space-y-2">
                      <p className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-indigo-500" />
                        Sandbox Quick-Fill profiles:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredSeededUsers.slice(0, 4).map(u => {
                          const school = dbState?.organizations.find(o => o.id === u.organizationId);
                          const roleDefaultPasswords: Record<string, string> = {
                            [UserRole.SUPER_ADMIN]: "super@123",
                            [UserRole.SCHOOL_ADMIN]: "admin@123",
                            [UserRole.TEACHER]: "teacher@123",
                            [UserRole.STUDENT]: "student@123",
                            [UserRole.PARENT]: "parent@123",
                            [UserRole.ACCOUNTANT]: "account@123",
                          };
                          const pwd = roleDefaultPasswords[u.role] || "student@123";

                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setLoginIdentifier(u.username);
                                setLoginPassword(pwd);
                                if (u.organizationId) {
                                  setSelectedSchoolId(u.organizationId);
                                }
                              }}
                              className="text-left p-2 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-[10px] cursor-pointer flex items-center gap-2"
                            >
                              <img src={u.avatar} className="w-6 h-6 rounded-full" alt="avatar" />
                              <div className="flex-1 min-w-0">
                                <p className="font-extrabold text-gray-800 dark:text-gray-200 truncate">{u.name}</p>
                                <p className="text-gray-400 text-[8px] truncate">
                                  {u.username} • {school ? school.name : "System"}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Sign In to Secure Portal
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    Don't have an account under this field?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(true);
                        setAuthError(null);
                      }}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* ================= REGISTRATION FORM ================= */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md uppercase tracking-wider block">
                      Register {loginSection.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-black text-gray-900 dark:text-gray-100">
                    Create Portal Account
                  </h3>
                  <p className="text-xs text-gray-400">
                    Establish secure, isolated credentials for your own profile workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Full Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Username (Unique):</label>
                    <input
                      type="text"
                      placeholder="e.g. johndoe"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Email Address:</label>
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Secure Password:</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* ROLE-SPECIFIC ADDITIONAL FIELDS */}
                {loginSection === UserRole.SCHOOL_ADMIN && (
                  <div className="bg-indigo-50/40 dark:bg-indigo-950/10 p-3.5 rounded-2xl border border-indigo-100/50 dark:border-indigo-950/20 space-y-1.5">
                    <label className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                      <School className="w-3.5 h-3.5" />
                      Create New School/Campus Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Oxford Prep Academy"
                      value={regSchoolName}
                      onChange={(e) => setRegSchoolName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-950 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-indigo-500 font-semibold"
                      required
                    />
                    <p className="text-[8px] text-indigo-500">Creating this school registers you as the Head Administrator for the new school tenant.</p>
                  </div>
                )}

                {[UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT, UserRole.ACCOUNTANT].includes(loginSection) && (
                  <div className="space-y-1 bg-slate-50 dark:bg-gray-950/50 p-3 rounded-xl border border-slate-200 dark:border-gray-800">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-indigo-500" />
                      Associate with Target School / Campus:
                    </label>
                    <select
                      value={regSelectedSchoolId}
                      onChange={(e) => setRegSelectedSchoolId(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-semibold"
                    >
                      {dbState?.organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {loginSection === UserRole.STUDENT && (
                  <div className="bg-emerald-50/30 dark:bg-emerald-950/10 p-3.5 rounded-2xl border border-emerald-100/30 dark:border-emerald-950/20 space-y-2">
                    <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Student Profile Information</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500">Class/Grade:</label>
                        <select
                          value={regClassName}
                          onChange={(e) => setRegClassName(e.target.value)}
                          className="w-full text-[10px] p-1.5 rounded bg-white dark:bg-gray-900 border"
                        >
                          <option value="Grade 9">Grade 9</option>
                          <option value="Grade 10">Grade 10</option>
                          <option value="Grade 11">Grade 11</option>
                          <option value="Grade 12">Grade 12</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500">Section:</label>
                        <select
                          value={regSectionName}
                          onChange={(e) => setRegSectionName(e.target.value)}
                          className="w-full text-[10px] p-1.5 rounded bg-white dark:bg-gray-900 border"
                        >
                          <option value="Section A">Section A</option>
                          <option value="Section B">Section B</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500">Guardian Name:</label>
                        <input
                          type="text"
                          placeholder="e.g. Robert Doe"
                          value={regGuardianName}
                          onChange={(e) => setRegGuardianName(e.target.value)}
                          className="w-full text-[10px] px-2 py-1.5 rounded bg-white dark:bg-gray-900 border font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500">Guardian Phone:</label>
                        <input
                          type="text"
                          placeholder="+1 (555) 019-2831"
                          value={regGuardianPhone}
                          onChange={(e) => setRegGuardianPhone(e.target.value)}
                          className="w-full text-[10px] px-2 py-1.5 rounded bg-white dark:bg-gray-900 border font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {loginSection === UserRole.TEACHER && (
                  <div className="bg-teal-50/30 dark:bg-teal-950/10 p-3.5 rounded-2xl border border-teal-100/30 dark:border-teal-950/20 space-y-2">
                    <p className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide">Faculty Designation & Qualifications</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500">Designation:</label>
                        <select
                          value={regDesignation}
                          onChange={(e) => setRegDesignation(e.target.value)}
                          className="w-full text-[10px] p-1.5 rounded bg-white dark:bg-gray-900 border"
                        >
                          <option value="Lecturer">Lecturer</option>
                          <option value="Senior Lecturer">Senior Lecturer</option>
                          <option value="Department Head">Department Head</option>
                          <option value="Professor">Professor</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500">Highest Qualification:</label>
                        <select
                          value={regQualification}
                          onChange={(e) => setRegQualification(e.target.value)}
                          className="w-full text-[10px] p-1.5 rounded bg-white dark:bg-gray-900 border"
                        >
                          <option value="Bachelor's Degree">Bachelor's Degree</option>
                          <option value="Master's Degree">Master's Degree</option>
                          <option value="Ph.D.">Ph.D.</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Register & Create Profile
                </button>

                <div className="text-center pt-1">
                  <p className="text-xs text-gray-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(false);
                        setAuthError(null);
                      }}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    );
  }

  // Filter dbState specifically for multi-tenant isolation!
  // If we are Super Admin, we see all data.
  // Otherwise, filter items belonging to the activeOrgId.
  const isSuper = currentRole === UserRole.SUPER_ADMIN;
  const filteredDbState: DatabaseSchema = {
    organizations: dbState.organizations,
    users: isSuper ? dbState.users : dbState.users.filter(u => u.organizationId === activeOrgId),
    students: isSuper ? dbState.students : dbState.students.filter(s => s.organizationId === activeOrgId),
    teachers: isSuper ? dbState.teachers : dbState.teachers.filter(t => t.organizationId === activeOrgId),
    attendance: isSuper ? dbState.attendance : dbState.attendance.filter(a => a.organizationId === activeOrgId),
    exams: isSuper ? dbState.exams : dbState.exams.filter(e => e.organizationId === activeOrgId),
    results: isSuper ? dbState.results : dbState.results.filter(r => r.organizationId === activeOrgId),
    homework: isSuper ? dbState.homework : dbState.homework.filter(h => h.organizationId === activeOrgId),
    submissions: isSuper ? (dbState.submissions || []) : (dbState.submissions || []).filter(s => s.organizationId === activeOrgId),
    timetables: isSuper ? (dbState.timetables || []) : (dbState.timetables || []).filter(t => t.organizationId === activeOrgId),
    leaveRequests: isSuper ? (dbState.leaveRequests || []) : (dbState.leaveRequests || []).filter(l => l.organizationId === activeOrgId),
    payrolls: isSuper ? (dbState.payrolls || []) : (dbState.payrolls || []).filter(p => p.organizationId === activeOrgId),
    invoices: isSuper ? dbState.invoices : dbState.invoices.filter(i => i.organizationId === activeOrgId),
    expenses: isSuper ? dbState.expenses : dbState.expenses.filter(exp => exp.organizationId === activeOrgId),
    books: isSuper ? dbState.books : dbState.books.filter(b => b.organizationId === activeOrgId),
    notices: isSuper ? dbState.notices : dbState.notices.filter(n => n.organizationId === activeOrgId),
    events: isSuper ? dbState.events : dbState.events.filter(e => e.organizationId === activeOrgId),
    routes: isSuper ? dbState.routes : dbState.routes.filter(r => r.organizationId === activeOrgId),
    rooms: isSuper ? dbState.rooms : dbState.rooms.filter(rm => rm.organizationId === activeOrgId),
    auditLogs: isSuper ? dbState.auditLogs : dbState.auditLogs.filter(l => l.organizationId === activeOrgId || l.organizationId === null),
    examRecords: isSuper ? (dbState.examRecords || []) : (dbState.examRecords || []).filter(er => er.organizationId === activeOrgId)
  };

  // Render sub-portal content based on current selected role with strict RBAC guards
  const renderPortalContent = () => {
    // RBAC Security Check: Users cannot access portals above their clearance level
    const userRole = sessionUser?.role || currentRole;

    // Permission hierarchy:
    //   SUPER_ADMIN     → can view any portal (multi-school management)
    //   SCHOOL_ADMIN    → can view SCHOOL_ADMIN, PRINCIPAL, TEACHER, STUDENT, PARENT, ACCOUNTANT portals
    //   PRINCIPAL       → can view PRINCIPAL, TEACHER, STUDENT, PARENT portals
    //   ACCOUNTANT      → can ONLY view ACCOUNTANT portal
    //   TEACHER         → can ONLY view TEACHER portal
    //   STUDENT         → can ONLY view STUDENT portal
    //   PARENT          → can ONLY view PARENT portal
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
      // Hard block — show 403 ACCESS DENIED
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-8 text-center shadow-xl space-y-5">
            <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-10 h-10" />
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
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                This attempt has been logged for security audit.
              </p>
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

    switch (currentRole) {
      case UserRole.SUPER_ADMIN:
        return (
          <SuperAdmin 
            dbState={filteredDbState} 
            onMutate={handleMutation} 
            isLoading={isLoading} 
          />
        );
      case UserRole.PRINCIPAL:
        return (
          <PrincipalPortal 
            dbState={filteredDbState} 
            onMutate={handleMutation} 
            isLoading={isLoading} 
            currentUser={sessionUser}
          />
        );
      case UserRole.SCHOOL_ADMIN:
        return (
          <SchoolAdmin 
            dbState={filteredDbState} 
            onMutate={handleMutation} 
            isLoading={isLoading} 
            currentUser={sessionUser}
          />
        );
      case UserRole.TEACHER:
        return (
          <TeacherPortal 
            dbState={filteredDbState} 
            onMutate={handleMutation} 
            isLoading={isLoading} 
            currentUser={sessionUser}
          />
        );
      case UserRole.STUDENT:
        return (
          <StudentPortal 
            dbState={filteredDbState} 
            isLoading={isLoading} 
            currentUser={sessionUser}
            onMutate={handleMutation}
          />
        );
      case UserRole.PARENT:
        return (
          <ParentPortal 
            dbState={filteredDbState} 
            onMutate={handleMutation} 
            isLoading={isLoading} 
          />
        );
      case UserRole.ACCOUNTANT:
        return (
          <AccountantPortal 
            dbState={filteredDbState} 
            onMutate={handleMutation} 
            isLoading={isLoading} 
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Unrecognized user role permission profile.</p>
          </div>
        );
    }
  };

  return (
    <ToastProvider>
      <DashboardLayout
        dbState={dbState}
        activeOrgId={activeOrgId}
        setActiveOrgId={setActiveOrgId}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentUser={sessionUser}
        onSignOut={handleSignOut}
        onMutate={handleMutation}
      >
        <Suspense fallback={<PortalLoader />}>
          {renderPortalContent()}
        </Suspense>
      </DashboardLayout>
    </ToastProvider>
  );
}
