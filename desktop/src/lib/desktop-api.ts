/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI Desktop â€” Unified Data API
 *
 * Priority order:
 *   1. Supabase (live cloud data, when online)
 *   2. Tauri SQLite (offline cache, when in Tauri environment)
 *   3. LocalStorage cache (last resort fallback)
 */

import { DatabaseSchema, Organization, User, Student, Teacher, AttendanceRecord, FeeInvoice, ExpenseRecord, PayrollRecord, Homework, HomeworkSubmission, Exam, Result, TimetableEntry, LeaveRequest, Notice, SchoolEvent, LibraryBook, TransportRoute, HostelRoom, AuditLog } from "../types.js";
import { supabase, isSupabaseAvailable, pingSupabase } from "./supabase.js";

// â”€â”€â”€ Tauri bridge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function invokeTauri<T>(cmd: string, args?: Record<string, any>): Promise<T> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(cmd, args);
  } catch (err) {
    console.warn(`[Desktop API] Tauri invoke '${cmd}' fallback:`, err);
    throw err;
  }
}

export function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
}

// â”€â”€â”€ Connection state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type ConnectionMode = "supabase" | "sqlite" | "offline";

let _connectionMode: ConnectionMode = "offline";
let _lastSyncTime: string | null = null;

export function getConnectionMode(): ConnectionMode {
  return _connectionMode;
}
export function getLastSyncTime(): string | null {
  return _lastSyncTime;
}

// â”€â”€â”€ Session management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getSavedSession(): { user: User; organization: Organization | null; token?: string } | null {
  const data = localStorage.getItem("edusphere_session");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveSession(user: User, organization: Organization | null, token?: string) {
  localStorage.setItem("edusphere_session", JSON.stringify({ user, organization, token }));
}

export const apiUrl = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

function getAuthHeaders(): Record<string, string> {
  const session = getSavedSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (session?.token) {
    headers["X-Session-Token"] = session.token;
  }
  return headers;
}

export function clearSession() {
  localStorage.removeItem("edusphere_session");
  if (supabase) {
    supabase.auth.signOut().catch(() => {});
  }
}

// â”€â”€â”€ Supabase â†’ DatabaseSchema mapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function mapOrg(r: any): Organization {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    logo: r.logo || "",
    primaryColor: r.primary_color || "#4f46e5",
    academicSession: r.academic_session || "2025-2026",
    plan: r.plan || "Professional",
    mrr: Number(r.mrr) || 0,
    status: r.status || "Active",
    phone: r.phone,
    email: r.email,
    address: r.address,
    createdAt: r.created_at,
  };
}

function mapUser(r: any): User {
  return {
    id: r.id,
    organizationId: r.organization_id || null,
    email: r.email || "",
    username: r.username || "",
    role: r.role,
    name: r.name || "",
    avatar: r.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name || "U")}`,
    phone: r.phone,
    status: r.status || "Active",
  };
}

function mapStudent(r: any): Student {
  return {
    id: r.id,
    organizationId: r.organization_id,
    userId: r.user_id || "",
    name: r.name,
    admissionNo: r.admission_no,
    rollNo: r.roll_no,
    className: r.class_name,
    sectionName: r.section_name,
    guardianName: r.guardian_name,
    guardianPhone: r.guardian_phone,
    guardianEmail: r.guardian_email || "",
    medicalRecords: r.medical_records || "None declared.",
    behaviorScore: r.behavior_score ?? 100,
    attendanceRate: Number(r.attendance_rate) || 100,
    status: r.status || "Active",
    admissionDate: r.admission_date || new Date().toISOString().split("T")[0],
    dob: r.dob,
    gender: r.gender,
    address: r.address,
  };
}

function mapTeacher(r: any): Teacher {
  return {
    id: r.id,
    organizationId: r.organization_id,
    userId: r.user_id || "",
    name: r.name,
    employeeId: r.employee_id,
    department: r.department,
    qualification: r.qualification,
    designation: r.designation,
    phone: r.phone || "",
    email: r.email,
    salary: Number(r.salary) || 0,
    classesAssigned: r.classes_assigned || [],
    subjectsAssigned: r.subjects_assigned || [],
  };
}

function mapAttendance(r: any): AttendanceRecord {
  return {
    id: r.id,
    organizationId: r.organization_id,
    studentId: r.student_id,
    studentName: r.student_name,
    className: r.class_name,
    sectionName: r.section_name,
    date: r.date,
    status: r.status,
    remarks: r.remarks,
  };
}

function mapFeeInvoice(r: any): FeeInvoice {
  return {
    id: r.id,
    organizationId: r.organization_id,
    studentId: r.student_id,
    studentName: r.student_name,
    className: r.class_name,
    title: r.title,
    amount: Number(r.amount) || 0,
    fine: Number(r.fine) || 0,
    discount: Number(r.discount) || 0,
    paidAmount: Number(r.paid_amount) || 0,
    dueDate: r.due_date,
    status: r.status,
    paymentMethod: r.payment_method,
    payDate: r.pay_date,
  };
}

function mapExpense(r: any): ExpenseRecord {
  return {
    id: r.id,
    organizationId: r.organization_id,
    title: r.title,
    category: r.category,
    amount: Number(r.amount) || 0,
    date: r.date,
    status: r.status || "Approved",
  };
}

function mapPayroll(r: any): PayrollRecord {
  return {
    id: r.id,
    organizationId: r.organization_id,
    teacherId: r.teacher_id || "",
    employeeName: r.employee_name,
    monthYear: r.month_year,
    basicSalary: Number(r.basic_salary) || 0,
    allowances: Number(r.allowances) || 0,
    deductions: Number(r.deductions) || 0,
    netSalary: Number(r.net_salary) || 0,
    paymentStatus: r.payment_status || "Paid",
    payoutDate: r.payout_date || new Date().toISOString().split("T")[0],
  };
}

function mapHomework(r: any): Homework {
  return {
    id: r.id,
    organizationId: r.organization_id,
    className: r.class_name,
    subject: r.subject,
    title: r.title,
    description: r.description,
    dueDate: r.due_date,
    createdByName: r.created_by_name,
    attachmentUrl: r.attachment_url,
  };
}

function mapSubmission(r: any): HomeworkSubmission {
  return {
    id: r.id,
    organizationId: r.organization_id,
    homeworkId: r.homework_id,
    studentId: r.student_id,
    studentName: r.student_name,
    submissionContent: r.submission_content || "",
    fileUrl: r.file_url,
    grade: r.grade,
    feedback: r.feedback,
    submittedAt: r.submitted_at,
    gradedAt: r.graded_at,
  };
}

function mapExam(r: any): Exam {
  return {
    id: r.id,
    organizationId: r.organization_id,
    className: r.class_name,
    subject: r.subject,
    title: r.title,
    maxMarks: r.max_marks || 100,
    date: r.date,
    status: r.status || "Scheduled",
  };
}

function mapResult(r: any): Result {
  return {
    id: r.id,
    organizationId: r.organization_id,
    examId: r.exam_id,
    examTitle: r.exam_title,
    subject: r.subject,
    studentId: r.student_id,
    studentName: r.student_name,
    marksObtained: Number(r.marks_obtained) || 0,
    maxMarks: Number(r.max_marks) || 100,
    grade: r.grade,
    comments: r.comments || "",
  };
}

function mapTimetable(r: any): TimetableEntry {
  return {
    id: r.id,
    organizationId: r.organization_id,
    className: r.class_name,
    dayOfWeek: r.day_of_week,
    periodNumber: r.period_number,
    startTime: r.start_time,
    endTime: r.end_time,
    subject: r.subject,
    teacherName: r.teacher_name,
    roomNumber: r.room_number || "",
  };
}

function mapLeaveRequest(r: any): LeaveRequest {
  return {
    id: r.id,
    organizationId: r.organization_id,
    applicantName: r.applicant_name,
    role: r.role,
    leaveType: r.leave_type,
    startDate: r.start_date,
    endDate: r.end_date,
    reason: r.reason,
    status: r.status || "Pending",
  };
}

function mapNotice(r: any): Notice {
  return {
    id: r.id,
    organizationId: r.organization_id,
    title: r.title,
    content: r.content,
    targetRole: r.target_role || "All",
    priority: r.priority,
    date: r.date,
    author: r.author,
  };
}

function mapSchoolEvent(r: any): SchoolEvent {
  return {
    id: r.id,
    organizationId: r.organization_id,
    title: r.title,
    description: r.description || "",
    date: r.date,
    type: r.type || "academic",
  };
}

function mapLibraryBook(r: any): LibraryBook {
  return {
    id: r.id,
    organizationId: r.organization_id,
    title: r.title,
    author: r.author,
    isbn: r.isbn,
    category: r.category,
    totalCopies: r.total_copies || 1,
    availableCopies: r.available_copies || 1,
  };
}

function mapTransportRoute(r: any): TransportRoute {
  return {
    id: r.id,
    organizationId: r.organization_id,
    routeName: r.route_name,
    vehicleNo: r.vehicle_no,
    driverName: r.driver_name,
    driverPhone: r.driver_phone,
    fee: Number(r.fee) || 0,
  };
}

function mapHostelRoom(r: any): HostelRoom {
  return {
    id: r.id,
    organizationId: r.organization_id,
    roomNo: r.room_no,
    type: r.type || "Dormitory",
    totalBeds: r.total_beds || 4,
    availableBeds: r.available_beds || 4,
    fee: Number(r.fee) || 0,
  };
}

function mapAuditLog(r: any): AuditLog {
  return {
    id: r.id,
    organizationId: r.organization_id || null,
    userName: r.user_name,
    role: r.role,
    action: r.action,
    module: r.module,
    timestamp: r.timestamp,
    ipAddress: r.ip_address || "desktop",
  };
}

// â”€â”€â”€ Supabase data fetcher â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function fetchFromSupabase(orgId: string | null, role: string, userId?: string): Promise<DatabaseSchema> {
  if (!supabase) throw new Error("Supabase not configured");

  const isSuper = role === "SUPER_ADMIN";

  // Run all queries in parallel for speed
  const [
    orgsRes, usersRes, studentsRes, teachersRes, attendanceRes,
    feeRes, expensesRes, payrollRes, hwRes, submissionsRes,
    examsRes, resultsRes, timetableRes, leaveRes, noticesRes,
    eventsRes, libraryRes, transportRes, hostelRes, auditRes,
  ] = await Promise.all([
    supabase.from("organizations").select("*").order("name"),
    isSuper
      ? supabase.from("users").select("*").order("name")
      : supabase.from("users").select("*").eq("organization_id", orgId).order("name"),
    orgId
      ? supabase.from("students").select("*").eq("organization_id", orgId).order("name")
      : supabase.from("students").select("*").order("name"),
    orgId
      ? supabase.from("teachers").select("*").eq("organization_id", orgId).order("name")
      : supabase.from("teachers").select("*").order("name"),
    orgId
      ? supabase.from("attendance").select("*").eq("organization_id", orgId).order("date", { ascending: false }).limit(500)
      : Promise.resolve({ data: [], error: null }),
    orgId
      ? supabase.from("fee_invoices").select("*").eq("organization_id", orgId).order("created_at", { ascending: false })
      : supabase.from("fee_invoices").select("*").order("created_at", { ascending: false }),
    orgId
      ? supabase.from("expenses").select("*").eq("organization_id", orgId).order("date", { ascending: false })
      : supabase.from("expenses").select("*").order("date", { ascending: false }),
    orgId
      ? supabase.from("payrolls").select("*").eq("organization_id", orgId).order("created_at", { ascending: false })
      : supabase.from("payrolls").select("*").order("created_at", { ascending: false }),
    orgId
      ? supabase.from("homework").select("*").eq("organization_id", orgId).order("due_date", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    orgId
      ? supabase.from("homework_submissions").select("*").eq("organization_id", orgId).order("submitted_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    orgId
      ? supabase.from("exams").select("*").eq("organization_id", orgId).order("date", { ascending: false })
      : supabase.from("exams").select("*").order("date", { ascending: false }),
    orgId
      ? supabase.from("results").select("*").eq("organization_id", orgId).order("created_at", { ascending: false })
      : supabase.from("results").select("*").order("created_at", { ascending: false }),
    orgId
      ? supabase.from("timetables").select("*").eq("organization_id", orgId)
      : Promise.resolve({ data: [], error: null }),
    orgId
      ? supabase.from("leave_requests").select("*").eq("organization_id", orgId).order("created_at", { ascending: false })
      : supabase.from("leave_requests").select("*").order("created_at", { ascending: false }),
    orgId
      ? supabase.from("notices").select("*").eq("organization_id", orgId).order("date", { ascending: false })
      : supabase.from("notices").select("*").order("date", { ascending: false }),
    orgId
      ? supabase.from("school_events").select("*").eq("organization_id", orgId).order("date", { ascending: false })
      : supabase.from("school_events").select("*").order("date", { ascending: false }),
    orgId
      ? supabase.from("library_books").select("*").eq("organization_id", orgId).order("title")
      : supabase.from("library_books").select("*").order("title"),
    orgId
      ? supabase.from("transport_routes").select("*").eq("organization_id", orgId)
      : supabase.from("transport_routes").select("*"),
    orgId
      ? supabase.from("hostel_rooms").select("*").eq("organization_id", orgId)
      : supabase.from("hostel_rooms").select("*"),
    isSuper
      ? supabase.from("audit_logs").select("*").order("timestamp", { ascending: false }).limit(200)
      : orgId
        ? supabase.from("audit_logs").select("*").eq("organization_id", orgId).order("timestamp", { ascending: false }).limit(200)
        : Promise.resolve({ data: [], error: null }),
  ]);

  const db: DatabaseSchema = {
    organizations: (orgsRes.data || []).map(mapOrg),
    users: (usersRes.data || []).map(mapUser),
    students: (studentsRes.data || []).map(mapStudent),
    teachers: (teachersRes.data || []).map(mapTeacher),
    attendance: (attendanceRes.data || []).map(mapAttendance),
    feeInvoices: (feeRes.data || []).map(mapFeeInvoice),
    invoices: (feeRes.data || []).map(mapFeeInvoice),
    expenses: (expensesRes.data || []).map(mapExpense),
    payroll: (payrollRes.data || []).map(mapPayroll),
    payrolls: (payrollRes.data || []).map(mapPayroll),
    homework: (hwRes.data || []).map(mapHomework),
    homeworkSubmissions: (submissionsRes.data || []).map(mapSubmission),
    submissions: (submissionsRes.data || []).map(mapSubmission),
    exams: (examsRes.data || []).map(mapExam),
    results: (resultsRes.data || []).map(mapResult),
    timetable: (timetableRes.data || []).map(mapTimetable),
    timetables: (timetableRes.data || []).map(mapTimetable),
    leaveRequests: (leaveRes.data || []).map(mapLeaveRequest),
    notices: (noticesRes.data || []).map(mapNotice),
    schoolEvents: (eventsRes.data || []).map(mapSchoolEvent),
    events: (eventsRes.data || []).map(mapSchoolEvent),
    libraryBooks: (libraryRes.data || []).map(mapLibraryBook),
    books: (libraryRes.data || []).map(mapLibraryBook),
    transportRoutes: (transportRes.data || []).map(mapTransportRoute),
    routes: (transportRes.data || []).map(mapTransportRoute),
    hostelRooms: (hostelRes.data || []).map(mapHostelRoom),
    rooms: (hostelRes.data || []).map(mapHostelRoom),
    auditLogs: (auditRes.data || []).map(mapAuditLog),
  };

  // Cache to localStorage for offline fallback
  localStorage.setItem("edusphere_desktop_supabase_cache", JSON.stringify(db));
  localStorage.setItem("edusphere_desktop_supabase_cache_time", new Date().toISOString());

  return db;
}

// â”€â”€â”€ Main fetchDbState â€” 3-tier priority â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function fetchDbState(orgId: string | null, role: string, userId?: string): Promise<DatabaseSchema> {
  // TIER 1: Supabase (live)
  if (isSupabaseAvailable()) {
    try {
      const online = await pingSupabase();
      if (online) {
        const data = await fetchFromSupabase(orgId, role, userId);
        _connectionMode = "supabase";
        _lastSyncTime = new Date().toISOString();
        console.info("[Desktop API] âœ… Loaded from Supabase");
        return data;
      }
    } catch (err) {
      console.warn("[Desktop API] Supabase fetch failed, falling back:", err);
    }
  }

    // TIER 2: Live Backend Server Sync (/api/db) — keeps Desktop & Web 100% in sync
  try {
    let url = orgId 
      ? `${apiUrl}/api/db?orgId=${orgId}&role=${role}` 
      : `${apiUrl}/api/db?role=${role}`;
    
    if (userId) {
      url += `&userId=${userId}`;
    }
      
    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    clearTimeout(abortTimeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.organizations && data.organizations.length > 0) {
        _connectionMode = "server" as any;
        _lastSyncTime = new Date().toISOString();
        localStorage.setItem("edusphere_desktop_supabase_cache", JSON.stringify(data));
        console.info("[Desktop API] 🌐 Synchronized live data from EduSphere Backend Server");
        return data;
      }
    }
  } catch (serverErr) {
    console.warn("[Desktop API] Backend server unreachable, trying local SQLite:", serverErr);
  }

  // TIER 3: Tauri SQLite (offline cache)
  if (isTauriEnvironment()) {
    try {
      const state = await invokeTauri<DatabaseSchema>("fetch_db_state", {
        orgId: orgId || null,
        role: role || null,
        userId: userId || null,
      });
      _connectionMode = "sqlite";
      console.info("[Desktop API] ðŸ—„ï¸ Loaded from local SQLite");
      return state;
    } catch (err) {
      console.error("[Desktop API] SQLite fetch failed:", err);
    }
  }

  // TIER 3: LocalStorage Supabase cache
  const cached = localStorage.getItem("edusphere_desktop_supabase_cache");
  if (cached) {
    try {
      _connectionMode = "offline";
      console.info("[Desktop API] ðŸ’¾ Loaded from localStorage cache");
      return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
  }

  // TIER 4: Empty state
  _connectionMode = "offline";
  return {
    organizations: [], users: [], students: [], teachers: [],
    attendance: [], feeInvoices: [], expenses: [], payroll: [],
    homework: [], homeworkSubmissions: [], exams: [], results: [],
    timetable: [], leaveRequests: [], notices: [], schoolEvents: [],
    libraryBooks: [], transportRoutes: [], hostelRooms: [], auditLogs: [],
  };
}

// â”€â”€â”€ mutateDb â€” write to Supabase first, then SQLite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TABLE_NAME_MAP: Record<string, string> = {
  organizations: "organizations",
  users: "users",
  students: "students",
  teachers: "teachers",
  attendance: "attendance",
  feeInvoices: "fee_invoices",
  fee_invoices: "fee_invoices",
  expenses: "expenses",
  payroll: "payrolls",
  payrolls: "payrolls",
  homework: "homework",
  homeworkSubmissions: "homework_submissions",
  exams: "exams",
  results: "results",
  timetable: "timetables",
  timetables: "timetables",
  leaveRequests: "leave_requests",
  leave_requests: "leave_requests",
  notices: "notices",
  schoolEvents: "school_events",
  school_events: "school_events",
  libraryBooks: "library_books",
  library_books: "library_books",
  transportRoutes: "transport_routes",
  transport_routes: "transport_routes",
  hostelRooms: "hostel_rooms",
  hostel_rooms: "hostel_rooms",
  auditLogs: "audit_logs",
  audit_logs: "audit_logs",
};

function toSnake(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toSnake);
  if (obj !== null && typeof obj === "object") {
    const out: any = {};
    for (const k of Object.keys(obj)) {
      const snakeKey = k.replace(/([A-Z])/g, "_$1").toLowerCase();
      out[snakeKey] = obj[k];
    }
    return out;
  }
  return obj;
}

const SCHEMA_KEY_MAP: Record<string, keyof DatabaseSchema> = {
  organizations: "organizations",
  users: "users",
  students: "students",
  teachers: "teachers",
  attendance: "attendance",
  fee_invoices: "feeInvoices",
  feeInvoices: "feeInvoices",
  expenses: "expenses",
  payrolls: "payroll",
  payroll: "payroll",
  homework: "homework",
  homework_submissions: "homeworkSubmissions",
  homeworkSubmissions: "homeworkSubmissions",
  exams: "exams",
  results: "results",
  timetables: "timetable",
  timetable: "timetable",
  leave_requests: "leaveRequests",
  leaveRequests: "leaveRequests",
  notices: "notices",
  school_events: "schoolEvents",
  schoolEvents: "schoolEvents",
  library_books: "libraryBooks",
  libraryBooks: "libraryBooks",
  transport_routes: "transportRoutes",
  transportRoutes: "transportRoutes",
  hostel_rooms: "hostelRooms",
  hostelRooms: "hostelRooms",
  audit_logs: "auditLogs",
  auditLogs: "auditLogs",
};

export async function mutateDb(
  action: "INSERT" | "UPDATE" | "DELETE",
  table: string,
  data: any,
  userContext: { name: string; role: string; organizationId: string | null }
): Promise<any> {
  const supTable = TABLE_NAME_MAP[table] || table;
  const schemaKey = SCHEMA_KEY_MAP[table] || (table as keyof DatabaseSchema);

  // Ensure record has an ID on INSERT
  if (action === "INSERT" && !data.id) {
    data.id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // Update local in-memory/localStorage cache immediately for instant UI reaction
  try {
    const rawCache = localStorage.getItem("edusphere_desktop_supabase_cache");
    if (rawCache) {
      const cache: DatabaseSchema = JSON.parse(rawCache);
      const arr = (cache[schemaKey] as any[]) || [];
      if (action === "INSERT") {
        cache[schemaKey] = [data, ...arr] as any;
      } else if (action === "UPDATE") {
        cache[schemaKey] = arr.map((item: any) => (item.id === data.id ? { ...item, ...data } : item)) as any;
      } else if (action === "DELETE") {
        cache[schemaKey] = arr.filter((item: any) => item.id !== data.id) as any;
      }
      localStorage.setItem("edusphere_desktop_supabase_cache", JSON.stringify(cache));
    }
  } catch (cacheErr) {
    console.warn("[Desktop API] Local cache sync warning:", cacheErr);
  }

  // TIER 1: Supabase (live write with snake_case data)
  if (isSupabaseAvailable() && supabase) {
    try {
      const snakeData = toSnake(data);
      let result;
      if (action === "INSERT") {
        const { data: inserted, error } = await supabase.from(supTable).insert(snakeData).select().single();
        if (error) throw error;
        result = inserted;
      } else if (action === "UPDATE") {
        const { id, ...rest } = snakeData;
        const { data: updated, error } = await supabase.from(supTable).update(rest).eq("id", id).select().single();
        if (error) throw error;
        result = updated;
      } else if (action === "DELETE") {
        const { error } = await supabase.from(supTable).delete().eq("id", data.id);
        if (error) throw error;
        result = { deleted: true, id: data.id };
      }

      // Log audit
      if (supabase && table !== "audit_logs" && table !== "auditLogs") {
        await supabase.from("audit_logs").insert({
          organization_id: userContext.organizationId,
          user_name: userContext.name,
          role: userContext.role,
          action: action,
          module: table,
          ip_address: "desktop-app",
        }).then(() => {});
      }

      console.info(`[Desktop API] âœ… Supabase ${action} on ${supTable}`);
      return { success: true, record: result || data };
    } catch (err) {
      console.error(`[Desktop API] Supabase ${action} failed (will fallback to local):`, err);
    }
  }

    // TIER 2: Live Backend Server Mutation (/api/db/mutate)
  try {
    const res = await fetch(`${apiUrl}/api/db/mutate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, table, data, userContext })
    });
    if (res.ok) {
      const serverRes = await res.json();
      console.info(`[Desktop API] 🌐 Server ${action} synced on ${table}`);
      return serverRes;
    }
  } catch (serverErr) {
    console.warn("[Desktop API] Server mutate unreachable:", serverErr);
  }

  // TIER 3: Tauri SQLite (offline write)
  if (isTauriEnvironment()) {
    try {
      return await invokeTauri("mutate_db", {
        payload: { action, table, data, userContext },
      });
    } catch (err) {
      console.error("[Desktop API] SQLite mutate error:", err);
    }
  }

  // When offline, the in-memory/localStorage cache was already updated at the top of mutateDb
  return { success: true, record: data, offline: true };
}

// â”€â”€â”€ AI Assistant Integration (Server-Proxied + Offline Fallback) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function generateAI(
  featureType: "lesson_planner" | "question_generator" | "report_comments" | "fee_prediction" | "general_chatbot",
  context: any
): Promise<string> {
  const apiUrl = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";
  
  // TIER 1: Try server-side secure Groq proxy
  // Note: We don't check navigator.onLine â€” Tauri WebView may misreport offline.
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const session = getSavedSession();
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (session?.token) {
      headers["X-Session-Token"] = session.token;
    }

    const res = await fetch(`${apiUrl}/api/gemini/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ featureType, context }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return data.text;
      }
    }
  } catch (err: any) {
    console.warn("[Desktop AI] Server proxy unreachable or timed out, activating local intelligence:", err.message);
  }

  // TIER 2: Offline intelligent contextual fallback responses
  if (featureType === "lesson_planner") {
    return `### ðŸ“˜ Lesson Plan: ${context.topic || "Core Curriculum Topic"}\n**Target Grade:** ${context.className || context.grade || "Grade 10"} | **Subject:** ${context.subject || "General Science"}\n\n**1. Learning Objectives:**\n- Understand core conceptual foundations of ${context.topic || "the syllabus topic"}.\n- Apply mathematical & analytical formulas to solve real-world problem sets.\n- Evaluate Pakistani educational and scientific applications.\n\n**2. 45-Minute Lesson Timeline:**\n- **00-05 mins:** Recap previous lesson & roll call.\n- **05-20 mins:** Core concepts, lecture notes, & chalkboard derivations.\n- **20-35 mins:** Interactive group work & guided problem solving.\n- **35-45 mins:** Formative quiz, Q&A, & homework assignment.`;
  }
  if (featureType === "question_generator") {
    return `### ðŸ“ Assessment Questions: ${context.topic || "Core Module"}\n\n**Q1 (Short - 3 marks):** Define the fundamental principle of ${context.topic || "this topic"} and state its SI unit.\n**Q2 (Analytical - 5 marks):** Explain why this phenomenon occurs with real-world examples from Pakistani environment.\n**Q3 (Numerical - 7 marks):** Calculate the net output when standard baseline parameters are given.\n\n*Marking Scheme:* Full marks for step-by-step working and labeled diagram.`;
  }
  if (featureType === "report_comments") {
    return `**Academic Evaluation:** ${context.studentName || "The student"} has exhibited consistent dedication and analytical rigor in ${context.className || "Class"} throughout the term. Active participation in class discussions and punctual submission of assignments are commendable. To achieve top tier results, recommend dedicated practice on timed problem sets.`;
  }
  if (featureType === "fee_prediction") {
    return `### ðŸ’¡ Tuition Recovery Analysis\n- **Student:** ${context.studentName || "Student"}\n- **Invoice:** ${context.invoiceTitle || "Tuition Fee"} (PKR ${context.amount || "5,000"})\n- **Status:** Overdue since ${context.dueDate || "Recent"}\n- **Risk Level:** Low to Medium\n- **Action:** Send a friendly reminder SMS/WhatsApp notification with bank transfer details.`;
  }
  return `Hello! As your EduSphere AI academic advisor, I am ready to assist with curriculum management, timetable planning, and institutional workflows.`;
}

// â”€â”€â”€ Student & Universal User Profile Photo Upload (All Roles) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function uploadUserProfilePicture(
  userId: string,
  organizationId: string | null,
  photoData: string,
  role?: string,
  userName?: string
): Promise<string> {
  const apiUrl = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";
  let photoUrl = photoData;

  // Tier 1: Try Supabase Storage if configured & online
  if (isSupabaseAvailable() && supabase) {
    try {
      if (photoData.startsWith("data:")) {
        const matches = photoData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const contentType = matches[1];
          const byteCharacters = atob(matches[2]);
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            byteArrays.push(new Uint8Array(byteNumbers));
          }
          const blob = new Blob(byteArrays, { type: contentType });
          const fileExt = contentType.split("/")[1] || "jpg";
          const filePath = `${organizationId || "global"}/${userId}_${Date.now()}.${fileExt}`;

          const { error: uploadErr } = await supabase.storage
            .from("avatars")
            .upload(filePath, blob, { upsert: true, contentType });

          if (!uploadErr) {
            const { data: publicUrlData } = supabase.storage
              .from("avatars")
              .getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              photoUrl = publicUrlData.publicUrl;
            }
          }
        }
      }
    } catch (storageErr) {
      console.warn("[Desktop Storage] Supabase storage notice:", storageErr);
    }
  }

  // Tier 2: Try Server Proxy Upload
  try {
    const session = getSavedSession();
    const res = await fetch(`${apiUrl}/api/upload/student-photo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.token ? { "X-Session-Token": session.token } : {})
      },
      body: JSON.stringify({ studentId: userId, organizationId, photoData: photoUrl })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.photoUrl) photoUrl = data.photoUrl;
    }
  } catch (err) {
    console.warn("[Desktop Photo Upload] Server upload fallback to local SQLite/cache:", err);
  }

  // Update in local users table
  await mutateDb("UPDATE", "users", { id: userId, avatar: photoUrl }, {
    name: userName || "Admin User",
    role: role || "SCHOOL_ADMIN",
    organizationId
  });

  // Update session storage immediately
  const saved = getSavedSession();
  if (saved && saved.user && saved.user.id === userId) {
    saved.user.avatar = photoUrl;
    saveSession(saved.user, saved.organization, saved.token);
  }

  return photoUrl;
}

export async function deleteUserProfilePicture(
  userId: string,
  organizationId: string | null,
  role?: string,
  userName?: string
): Promise<string> {
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName || "U")}`;
  
  await mutateDb("UPDATE", "users", { id: userId, avatar: defaultAvatar }, {
    name: userName || "User",
    role: role || "STUDENT",
    organizationId
  });

  const saved = getSavedSession();
  if (saved && saved.user && saved.user.id === userId) {
    saved.user.avatar = defaultAvatar;
    saveSession(saved.user, saved.organization, saved.token);
  }

  return defaultAvatar;
}

export async function uploadStudentPhoto(studentId: string, organizationId: string, photoData: string): Promise<string> {
  return uploadUserProfilePicture(studentId, organizationId, photoData, "STUDENT");
}

// â”€â”€â”€ Authentication â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function loginUser(body: {
  identifier: string;
  password?: string;
  role?: string;
}): Promise<{ success: boolean; user: User; token?: string }> {

  const apiUrl = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

  // TIER 1: Try server backend login (Bcrypt verification + Session creation)
  // NOTE: Do NOT gate on navigator.onLine â€” Tauri WebView2 misreports offline status
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        console.info("[Desktop Auth] âœ… Server backend login succeeded");
        return data;
      }
    }
  } catch (err) {
    console.warn("[Desktop Auth] Server auth unreachable, trying Supabase:", err);
  }

  // TIER 2a: Supabase Auth signIn with email + password (proper password check)
  if (isSupabaseAvailable() && supabase && body.password) {
    try {
      // Try Supabase Auth sign in first (handles hashed passwords)
      const identifierLower = body.identifier.toLowerCase().trim();
      // Determine if identifier is an email
      const isEmail = identifierLower.includes("@");
      if (isEmail) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: identifierLower,
          password: body.password,
        });
        if (!authError && authData?.user) {
          // Look up the user in our users table
          const { data: userRow } = await supabase
            .from("users")
            .select("*")
            .eq("email", identifierLower)
            .single();
          if (userRow) {
            console.info("[Desktop Auth] âœ… Supabase Auth login succeeded");
            return { success: true, user: mapUser(userRow), token: authData.session?.access_token || `supa_tok_${userRow.id}` };
          }
        }
      }
    } catch (err) {
      console.warn("[Desktop Auth] Supabase Auth signIn failed:", err);
    }
  }

  // TIER 3: Tauri SQLite local auth (offline, bcrypt-verified cached account)
  if (isTauriEnvironment()) {
    try {
      const res = await invokeTauri<any>("login_user", {
        payload: {
          identifier: body.identifier,
          password: body.password || null,
          role: body.role || null,
        },
      });
      console.info("[Desktop Auth] âœ… SQLite local auth succeeded");
      return res;
    } catch (err: any) {
      throw new Error(err || "Login failed against local database.");
    }
  }

  throw new Error("Invalid username or password. Please check your credentials and try again.");
}

export async function registerUser(body: any): Promise<{ success: boolean; user: User; token?: string }> {
  if (isSupabaseAvailable() && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from("users")
        .insert({
          organization_id: body.organizationId || null,
          email: body.email,
          username: body.username,
          role: body.role,
          name: body.name,
          avatar: body.avatar || "",
          phone: body.phone || null,
          status: "Active",
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, user: mapUser(inserted), token: `supa_tok_${inserted.id}` };
    } catch (err: any) {
      throw new Error(err.message || "Registration failed.");
    }
  }

  return {
    success: true,
    user: {
      id: `usr_${Date.now()}`,
      organizationId: body.organizationId,
      email: body.email,
      username: body.username,
      role: body.role,
      name: body.name,
      avatar: "",
      status: "Active",
    },
    token: `tok_${Date.now()}`,
  };
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string; code?: string }> {
  return { success: true, message: "Recovery code generated.", code: "123456" };
}

// â”€â”€â”€ Sync & Status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function triggerManualSync(orgId?: string, sessionToken?: string): Promise<any> {
  // Sync with live server API if available
  try {
    const res = await fetch(`${apiUrl}/api/db${orgId ? `?orgId=${orgId}` : ""}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const freshDb = await res.json();
      if (freshDb && freshDb.organizations && freshDb.organizations.length > 0) {
        localStorage.setItem("edusphere_desktop_supabase_cache", JSON.stringify(freshDb));
        _lastSyncTime = new Date().toISOString();
        console.info("[Desktop Sync] 🌐 Cache updated from Backend Server");
      }
    }
  } catch (err) {
    console.warn("[Desktop Sync] Server sync check completed");
  }

  // Flush offline queue to Supabase
  if (isSupabaseAvailable() && supabase) {
    const queue = JSON.parse(localStorage.getItem("edusphere_offline_queue") || "[]");
    let flushed = 0;
    const failed: any[] = [];

    for (const item of queue) {
      try {
        await mutateDb(item.action, item.table, item.data, item.userContext);
        flushed++;
      } catch (err) {
        failed.push(item);
      }
    }

    localStorage.setItem("edusphere_offline_queue", JSON.stringify(failed));
    _lastSyncTime = new Date().toISOString();

    return {
      is_online: true,
      last_sync_time: _lastSyncTime,
      pending_count: failed.length,
      failed_count: failed.length,
      resolved_count: flushed,
      conflict_count: 0,
      message: flushed > 0 ? `Synced ${flushed} offline changes to Supabase.` : "All data up to date.",
    };
  }

  // Tauri SQLite sync
  if (isTauriEnvironment()) {
    try {
      return await invokeTauri("trigger_sync", {
        orgId: orgId || null,
        sessionToken: sessionToken || null,
      });
    } catch (err) {
      console.error("[Sync] Trigger failed:", err);
    }
  }

  return {
    is_online: navigator.onLine,
    last_sync_time: new Date().toISOString(),
    pending_count: 0,
    failed_count: 0,
    resolved_count: 0,
    conflict_count: 0,
    message: "Offline â€” no sync available.",
  };
}

export async function fetchSyncStatus(): Promise<any> {
  const pendingQueue = JSON.parse(localStorage.getItem("edusphere_offline_queue") || "[]");
  const cacheTime = localStorage.getItem("edusphere_desktop_supabase_cache_time");

  if (isTauriEnvironment()) {
    try {
      const status: any = await invokeTauri("get_sync_status");
      return {
        ...(typeof status === "object" && status !== null ? status : {}),
        connection_mode: _connectionMode,
        last_supabase_sync: cacheTime,
        pending_offline_count: pendingQueue.length,
      };
    } catch (err) {
      console.error("[Sync] Status failed:", err);
    }
  }

  return {
    is_online: navigator.onLine,
    last_sync_time: _lastSyncTime || cacheTime || new Date().toISOString(),
    pending_count: pendingQueue.length,
    failed_count: 0,
    resolved_count: 0,
    conflict_count: 0,
    connection_mode: _connectionMode,
    last_supabase_sync: cacheTime,
    pending_offline_count: pendingQueue.length,
    message: _connectionMode === "supabase" ? "Connected to Supabase" : _connectionMode === "sqlite" ? "Using local SQLite" : "Offline",
  };
}

// â”€â”€â”€ Export helpers (unchanged) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function exportToCsv(filename: string, rows: Record<string, any>[], columnHeaders?: { key: string; label: string }[]) {
  if (!rows || !rows.length) return;

  if (isTauriEnvironment()) {
    try {
      const savedPath = await invokeTauri<string>("export_csv_file", {
        payload: {
          filename,
          rows,
          columns: columnHeaders || Object.keys(rows[0]).map((k) => ({ key: k, label: k })),
        },
      });
      alert(`CSV File successfully exported to:\n${savedPath}`);
      return;
    } catch (e) {
      console.warn("[Export] Tauri CSV export error, falling back to browser download:", e);
    }
  }

  const headers = columnHeaders ? columnHeaders.map((c) => c.label) : Object.keys(rows[0]);
  const keys = columnHeaders ? columnHeaders.map((c) => c.key) : Object.keys(rows[0]);
  const csvRows: string[] = [];
  csvRows.push(headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(","));
  for (const row of rows) {
    const values = keys.map((k) => {
      const val = row[k] !== undefined && row[k] !== null ? row[k] : "";
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }
  const csvString = csvRows.join("\r\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename.replace(/\.csv$/, "")}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Isolated A4 print adapter for Tauri/WebView2 and browser environments.
 *
 * Delegates to the centralized printService which uses a hidden iframe so the
 * host application (#root) is NEVER touched or hidden. This fixes the permanent
 * white-screen issue caused by WebView2 not always firing the 'afterprint' event
 * when the print dialog is cancelled.
 */
export async function printHtmlDocument(title: string, htmlContent: string): Promise<void> {
  const { printHtmlDocument: _print } = await import("./printService.js");
  return _print(title, htmlContent);
}

