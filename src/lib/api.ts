/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI Web & Unified Data API
 * Priority order:
 *   1. Supabase (live cloud data)
 *   2. Server proxy (/api/db, /api/db/mutate)
 *   3. LocalStorage cache (offline resilience)
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { 
  DatabaseSchema, Organization, User, Student, Teacher, 
  AttendanceRecord, FeeInvoice, ExpenseRecord, PayrollRecord, 
  Homework, HomeworkSubmission, Exam, Result, TimetableEntry, 
  LeaveRequest, Notice, SchoolEvent, LibraryBook, TransportRoute, 
  HostelRoom, AuditLog, UserRole 
} from "../types.js";

// Initialize Supabase Client from environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "https://eusvssjczjlotwedrnpa.supabase.co";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1c3Zzc2pjempsb3R3ZWRybnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjUzNTUsImV4cCI6MjEwMDMwMTM1NX0.6FiOOLFc316TQ6fRqoash-rrUz8DEC9Yb9SKdVKzogI";

export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "edusphere_supabase_session",
      },
    })
  : null;

export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}

export async function pingSupabase(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const timeout = new Promise<boolean>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase ping timeout")), 1500)
    );
    const ping = (async () => {
      const { error } = await supabase.from("organizations").select("id").limit(1);
      return !error;
    })();
    return await Promise.race([ping, timeout]);
  } catch {
    return false;
  }
}

// ─── Session management ───────────────────────────────────────────────────────
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

export function clearSession() {
  localStorage.removeItem("edusphere_session");
  if (supabase) {
    supabase.auth.signOut().catch(() => {});
  }
}

/** Force the app to discard its cached DB and reload fresh data from Supabase on next load */
export function forceRefreshCache() {
  localStorage.removeItem("edusphere_web_cache");
  localStorage.removeItem("edusphere_web_cache_org");
  localStorage.removeItem("edusphere_session");
  console.log("[Cache] All EduSphere caches cleared. Reloading fresh data from Supabase...");
}

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

// ─── Supabase → DatabaseSchema mappers ────────────────────────────────────────
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
    avatar: r.avatar || r.photo_url || "",
    photoUrl: r.photo_url || r.avatar || "",
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
    ipAddress: r.ip_address || "web-client",
  };
}

// ─── Direct Supabase Data Fetcher ─────────────────────────────────────────────
async function fetchFromSupabase(orgId: string | null, role: string, userId?: string): Promise<DatabaseSchema> {
  if (!supabase) throw new Error("Supabase not initialized");

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Supabase query timeout")), 3000)
  );

  const fetchPromise = (async () => {
    const isSuper = role === "SUPER_ADMIN";
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

    // Cache with org-stamp so stale data from different seedings is auto-busted
    const orgStamp = orgId || (db.organizations?.[0]?.id ?? "none");
    localStorage.setItem("edusphere_web_cache", JSON.stringify(db));
    localStorage.setItem("edusphere_web_cache_org", orgStamp);
    return db;
  })();

  return await Promise.race([fetchPromise, timeoutPromise]);
}

// ─── 3-Tier fetchDbState ──────────────────────────────────────────────────────
export async function fetchDbState(orgId: string | null, role: string, userId?: string): Promise<DatabaseSchema> {
  // Tier 1: Supabase Cloud (Live)
  if (isSupabaseAvailable()) {
    try {
      const online = await pingSupabase();
      if (online) {
        return await fetchFromSupabase(orgId, role, userId);
      }
    } catch (err) {
      console.warn("[Web API] Direct Supabase fetch failed, trying backend server:", err);
    }
  }

  // Tier 2: Server API proxy (/api/db)
  try {
    let url = orgId 
      ? `/api/db?orgId=${orgId}&role=${role}` 
      : `/api/db?role=${role}`;
    
    if (userId) {
      url += `&userId=${userId}`;
    }
      
    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    clearTimeout(abortTimeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.organizations && data.organizations.length > 0) {
        const orgStamp = orgId || (data.organizations?.[0]?.id ?? "none");
        localStorage.setItem("edusphere_web_cache", JSON.stringify(data));
        localStorage.setItem("edusphere_web_cache_org", orgStamp);
        return data;
      }
    }
  } catch (serverErr) {
    console.warn("[Web API] Server /api/db unreachable, trying cache:", serverErr);
  }

  // Tier 3: LocalStorage Cache (with stale-org detection)
  const cached = localStorage.getItem("edusphere_web_cache");
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.organizations && parsed.organizations.length > 0) {
        // Check if cached org matches expected org — if not, bust cache
        const cachedOrgId = parsed.organizations?.[0]?.id;
        const expectedOrgId = "01000000-0000-0000-0000-000000000001";
        if (cachedOrgId && cachedOrgId !== expectedOrgId) {
          console.warn("[Cache] Stale organization detected, busting cache:", cachedOrgId);
          localStorage.removeItem("edusphere_web_cache");
          localStorage.removeItem("edusphere_web_cache_org");
        } else {
          return parsed;
        }
      }
    } catch {}
  }

  // Tier 4: Guaranteed Seed Fallback (Ensures the Web App ALWAYS boots immediately)
  return {
    organizations: [
      {
        id: "01000000-0000-0000-0000-000000000001",
        name: "Islamia Model High School Quetta",
        slug: "imhs-quetta",
        logo: "/logo.jpg",
        primaryColor: "#4f46e5",
        academicSession: "2025-2026",
        plan: "Enterprise",
        mrr: 320000,
        status: "Active",
        phone: "+92 81 2824501",
        email: "info@imhs.edu.pk",
        address: "Chaman Phatak, Samungli Road, Quetta, Balochistan, Pakistan",
        createdAt: new Date().toISOString()
      }
    ],
    users: [
      {
        id: "02000000-0000-0000-0000-000000000001",
        username: "haris",
        name: "Haris Khan (Super Admin)",
        email: "haris@edusphere.ai",
        role: UserRole.SUPER_ADMIN,
        organizationId: null,
        avatar: "/logo.jpg",
        status: "Active"
      },
      {
        id: "02000000-0000-0000-0000-000000000002",
        username: "principal_imhs",
        name: "Prof. Dr. Tariq Mahmood Kakar (Principal)",
        email: "principal@imhs.edu.pk",
        role: UserRole.PRINCIPAL,
        organizationId: "01000000-0000-0000-0000-000000000001",
        avatar: "/logo.jpg",
        status: "Active"
      },
      {
        id: "02000000-0000-0000-0000-000000000003",
        username: "admin_imhs",
        name: "Malik Abdul Rehman Tareen (Admin Officer)",
        email: "admin@imhs.edu.pk",
        role: UserRole.SCHOOL_ADMIN,
        organizationId: "01000000-0000-0000-0000-000000000001",
        avatar: "/logo.jpg",
        status: "Active"
      },
      {
        id: "02000000-0000-0000-0000-000000000004",
        username: "accountant_imhs",
        name: "Kamran Akram Durrani (Accountant)",
        email: "accountant@imhs.edu.pk",
        role: UserRole.ACCOUNTANT,
        organizationId: "01000000-0000-0000-0000-000000000001",
        avatar: "/logo.jpg",
        status: "Active"
      },
      {
        id: "02000000-0000-0000-0000-000000000005",
        username: "ayesha_sci",
        name: "Ayesha Malik (Senior Science Teacher)",
        email: "ayesha.malik@imhs.edu.pk",
        role: UserRole.TEACHER,
        organizationId: "01000000-0000-0000-0000-000000000001",
        avatar: "/logo.jpg",
        status: "Active"
      }
    ],
    students: [],
    teachers: [],
    attendance: [],
    feeInvoices: [],
    invoices: [],
    expenses: [],
    payroll: [],
    payrolls: [],
    homework: [],
    homeworkSubmissions: [],
    submissions: [],
    exams: [],
    results: [],
    timetable: [],
    timetables: [],
    leaveRequests: [],
    notices: [],
    schoolEvents: [],
    events: [],
    libraryBooks: [],
    books: [],
    transportRoutes: [],
    routes: [],
    hostelRooms: [],
    rooms: [],
    auditLogs: []
  };
}

// ─── Table Name & Snake Case Helpers ──────────────────────────────────────────
const TABLE_NAME_MAP: Record<string, string> = {
  organizations: "organizations",
  users: "users",
  students: "students",
  teachers: "teachers",
  attendance: "attendance",
  feeInvoices: "fee_invoices",
  invoices: "fee_invoices",
  fee_invoices: "fee_invoices",
  expenses: "expenses",
  payroll: "payrolls",
  payrolls: "payrolls",
  homework: "homework",
  homeworkSubmissions: "homework_submissions",
  submissions: "homework_submissions",
  exams: "exams",
  results: "results",
  timetable: "timetables",
  timetables: "timetables",
  leaveRequests: "leave_requests",
  leave_requests: "leave_requests",
  notices: "notices",
  schoolEvents: "school_events",
  events: "school_events",
  school_events: "school_events",
  libraryBooks: "library_books",
  books: "library_books",
  library_books: "library_books",
  transportRoutes: "transport_routes",
  routes: "transport_routes",
  transport_routes: "transport_routes",
  hostelRooms: "hostel_rooms",
  rooms: "hostel_rooms",
  hostel_rooms: "hostel_rooms",
  auditLogs: "audit_logs",
  audit_logs: "audit_logs",
  examRecords: "examRecords",
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

// ─── mutateDb — Supabase Direct Write + Server Fallback ───────────────────────
export async function mutateDb(
  action: "INSERT" | "UPDATE" | "DELETE",
  table: string,
  data: any,
  userContext: { name: string; role: string; organizationId: string | null }
): Promise<any> {
  const supTable = TABLE_NAME_MAP[table] || table;

  if (action === "INSERT" && !data.id) {
    data.id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // Tier 1: Try Direct Supabase Cloud Mutation
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

      if (table !== "audit_logs" && table !== "auditLogs") {
        await supabase.from("audit_logs").insert({
          organization_id: userContext.organizationId,
          user_name: userContext.name,
          role: userContext.role,
          action: action,
          module: table,
          ip_address: "web-client",
        }).then(() => {});
      }

      // Also trigger async server write-through if backend is alive
      fetch("/api/db/mutate", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, table, data, userContext })
      }).catch(() => {});

      return { success: true, record: result || data };
    } catch (err) {
      console.warn("[Web API] Supabase mutation error, falling back to server /api/db/mutate:", err);
    }
  }

  // Tier 2: Server API proxy
  const res = await fetch("/api/db/mutate", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ action, table, data, userContext })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Failed to save record.");
  }
  return res.json();
}

// ─── Student & Universal User Profile Photo Upload (All Roles) ───────────────
export async function uploadUserProfilePicture(
  userId: string,
  organizationId: string | null,
  photoData: string,
  role?: string,
  userName?: string
): Promise<string> {
  let photoUrl = photoData;

  // Tier 1: Try Supabase Cloud Storage bucket 'avatars'
  if (isSupabaseAvailable() && supabase) {
    try {
      // Check if photoData is a base64 string that can be uploaded as a Blob
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
      console.warn("[Storage API] Supabase storage upload notice (using direct payload):", storageErr);
    }
  }

  // Tier 2: Try Server Proxy Upload
  try {
    const res = await fetch("/api/upload/student-photo", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId: userId, organizationId, photoData: photoUrl })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.photoUrl) photoUrl = data.photoUrl;
    }
  } catch {}

  // Update in Users table
  await mutateDb("UPDATE", "users", { id: userId, avatar: photoUrl }, {
    name: userName || "User",
    role: role || "STUDENT",
    organizationId
  });

  // Update session storage immediately so avatar updates in topbar/sidebar
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

// ─── Groq AI Generation ───────────────────────────────────────────────────────
export async function generateAI(
  featureType: "lesson_planner" | "question_generator" | "report_comments" | "fee_prediction" | "general_chatbot",
  context: any
): Promise<string> {
  const res = await fetch("/api/gemini/generate", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ featureType, context })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "AI service unavailable" }));
    throw new Error(err.error || "Failed to invoke AI Assistant.");
  }
  const data = await res.json();
  return data.text;
}

// ─── User Authentication ──────────────────────────────────────────────────────
export async function loginUser(body: { identifier: string; password?: string; role?: string }): Promise<{ success: boolean; user: User; token?: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({ error: "Network error" }));
  if (!res.ok) {
    throw new Error(data.error || "Login authorization failed.");
  }
  return data;
}

export async function registerUser(body: {
  username: string;
  password?: string;
  email: string;
  role: string;
  name: string;
  organizationId: string | null;
  schoolName?: string;
  additionalInfo?: any;
}): Promise<{ success: boolean; user: User; token?: string }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({ error: "Registration error" }));
  if (!res.ok) {
    throw new Error(data.error || "Registration failed.");
  }
  return data;
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string; code?: string }> {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await res.json().catch(() => ({ error: "Request error" }));
  if (!res.ok) {
    throw new Error(data.error || "Failed to initiate recovery.");
  }
  return data;
}

export async function resetPassword(body: { email: string; code: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({ error: "Reset error" }));
  if (!res.ok) {
    throw new Error(data.error || "Failed to reset password.");
  }
  return data;
}

// ─── Export & Print Helpers ───────────────────────────────────────────────────
export function exportToCsv(filename: string, rows: Record<string, any>[], columnHeaders?: { key: string; label: string }[]) {
  if (!rows || !rows.length) return;

  const headers = columnHeaders 
    ? columnHeaders.map(c => c.label) 
    : Object.keys(rows[0]);
  
  const keys = columnHeaders 
    ? columnHeaders.map(c => c.key) 
    : Object.keys(rows[0]);

  const csvRows: string[] = [];
  csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(","));

  for (const row of rows) {
    const values = keys.map(k => {
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

// printHtmlDocument — delegates to the centralized printService.
// The old implementation set #root to display:none, causing a permanent
// white screen whenever the browser or WebView2 omitted 'afterprint'.
// The new implementation uses an isolated hidden iframe and never touches
// the live app DOM.

/**
 * Render a document inside an isolated hidden iframe and invoke the native
 * browser / WebView2 print dialog.  The host app (#root) is NEVER modified.
 *
 * Previously this function set #root to display:none, causing the entire UI
 * to go permanently white whenever afterprint was not fired (common on
 * WebView2 / Tauri when the dialog is cancelled or closed).
 */
export async function printHtmlDocument(title: string, htmlContent: string): Promise<void> {
  const { printHtmlDocument: _print } = await import("./printService.js");
  return _print(title, htmlContent);
}

