/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI - Secure Multi-Tenant Database Store
 * Pakistani School Dataset - Academic Year 2025-2026
 *
 * Security: All passwords are bcrypt-hashed (saltRounds=10).
 * Plain-text passwords are NEVER stored or returned.
 */

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import {
  Organization, User, Student, Teacher, AttendanceRecord,
  FeeInvoice, Homework, HomeworkSubmission, Exam, Result, Notice, SchoolEvent,
  LibraryBook, TransportRoute, HostelRoom, AuditLog, ExpenseRecord,
  TimetableEntry, LeaveRequest, PayrollRecord, ExamRecord, UserRole
} from "../src/types.js";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const SALT_ROUNDS = 10;

export interface DatabaseSchema {
  organizations: Organization[];
  users: User[];
  students: Student[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  invoices: FeeInvoice[];
  homework: Homework[];
  submissions: HomeworkSubmission[];
  exams: Exam[];
  results: Result[];
  timetables: TimetableEntry[];
  leaveRequests: LeaveRequest[];
  payrolls: PayrollRecord[];
  notices: Notice[];
  events: SchoolEvent[];
  books: LibraryBook[];
  routes: TransportRoute[];
  rooms: HostelRoom[];
  auditLogs: AuditLog[];
  expenses: ExpenseRecord[];
  examRecords: ExamRecord[];
}

function ensureDirAndFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    console.log("Seeding Pakistani school dataset...");
    const initialDb = generateSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    console.log("Seed complete.");
  }
}

export function readDb(): DatabaseSchema {
  ensureDirAndFile();
  const content = fs.readFileSync(DB_FILE, "utf-8");
  const db = JSON.parse(content) as DatabaseSchema;

  // Auto-migrate missing collections
  let migrated = false;
  if (!db.submissions) { db.submissions = []; migrated = true; }
  if (!db.timetables) { db.timetables = []; migrated = true; }
  if (!db.leaveRequests) { db.leaveRequests = []; migrated = true; }
  if (!db.payrolls) { db.payrolls = []; migrated = true; }
  if (!db.expenses) { db.expenses = []; migrated = true; }
  if (!db.auditLogs) { db.auditLogs = []; migrated = true; }
  if (!db.examRecords) { db.examRecords = []; migrated = true; }

  // SECURITY: Remove any plain-text passwords that may exist from old seed
  // Force-migrate to bcrypt hashes if password doesn't start with $2b$
  db.users = db.users.map(u => {
    if (u.password && !u.password.startsWith("$2b$")) {
      u.password = bcrypt.hashSync(u.password, SALT_ROUNDS);
      migrated = true;
    }
    return u;
  });

  if (migrated) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }

  return db;
}

export function writeDb(db: DatabaseSchema) {
  ensureDirAndFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function logAudit(
  organizationId: string | null,
  userName: string,
  role: string,
  action: string,
  module: string
) {
  const db = readDb();
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    userName,
    role,
    action,
    module,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1"
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) db.auditLogs = db.auditLogs.slice(0, 500);
  writeDb(db);
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function hash(plaintext: string): string {
  return bcrypt.hashSync(plaintext, SALT_ROUNDS);
}

function dateRange(startDate: string, days: number): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  let count = 0;
  while (dates.length < days) {
    const d = new Date(start);
    d.setDate(d.getDate() + count);
    const dow = d.getDay();
    // Pakistani schools: Mon-Sat (0=Sun skip, 6=Sat include)
    if (dow !== 0) {
      dates.push(d.toISOString().split("T")[0]);
    }
    count++;
    if (count > 400) break; // safety
  }
  return dates;
}

function weightedStatus(): "Present" | "Absent" | "Late" | "Excused" {
  const r = Math.random();
  if (r < 0.78) return "Present";
  if (r < 0.90) return "Absent";
  if (r < 0.97) return "Late";
  return "Excused";
}

function pkrTuition(className: string): number {
  if (className === "Nursery" || className === "KG") return 3500;
  const g = parseInt(className.replace("Grade ", ""));
  if (g <= 5) return 5000;
  if (g <= 8) return 7000;
  return 9500;
}

function grade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

// ============================================================
// PAKISTANI SCHOOL SEED DATA
// ============================================================

function generateSeedData(): DatabaseSchema {

  // ----------------------------------------------------------
  // ORGANIZATIONS (5 Pakistani Schools)
  // ----------------------------------------------------------
  const organizations: Organization[] = [
    {
      id: "org-pk-1",
      name: "Al-Noor Model School",
      slug: "al-noor-lahore",
      logo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=120&auto=format&fit=crop&q=80",
      primaryColor: "emerald",
      academicSession: "2025-2026",
      plan: "Professional",
      mrr: 299,
      status: "Active",
      phone: "+92-42-3571-8800",
      email: "info@alnoor.edu.pk",
      address: "23-A Model Town, Lahore, Punjab",
      createdAt: "2025-01-05T08:00:00Z"
    },
    {
      id: "org-pk-2",
      name: "Quaid-e-Azam Public School",
      slug: "quaid-islamabad",
      logo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&auto=format&fit=crop&q=80",
      primaryColor: "indigo",
      academicSession: "2025-2026",
      plan: "Enterprise",
      mrr: 599,
      status: "Active",
      phone: "+92-51-9204-3300",
      email: "admin@qaps.edu.pk",
      address: "F-7/2 Jinnah Avenue, Islamabad, ICT",
      createdAt: "2025-01-10T09:00:00Z"
    },
    {
      id: "org-pk-3",
      name: "Balochistan Scholars Academy",
      slug: "bsa-quetta",
      logo: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=120&auto=format&fit=crop&q=80",
      primaryColor: "amber",
      academicSession: "2025-2026",
      plan: "Growth",
      mrr: 149,
      status: "Active",
      phone: "+92-81-2840-011",
      email: "contact@bsa.edu.pk",
      address: "Samungli Road, Quetta, Balochistan",
      createdAt: "2025-02-01T10:00:00Z"
    },
    {
      id: "org-pk-4",
      name: "The Crescent School",
      slug: "crescent-karachi",
      logo: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80",
      primaryColor: "violet",
      academicSession: "2025-2026",
      plan: "Professional",
      mrr: 299,
      status: "Active",
      phone: "+92-21-3561-2200",
      email: "info@crescentschool.edu.pk",
      address: "Block-14, Gulshan-e-Iqbal, Karachi, Sindh",
      createdAt: "2025-01-15T08:30:00Z"
    },
    {
      id: "org-pk-5",
      name: "Pak Future Grammar School",
      slug: "pfgs-peshawar",
      logo: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80",
      primaryColor: "rose",
      academicSession: "2025-2026",
      plan: "Growth",
      mrr: 149,
      status: "Active",
      phone: "+92-91-2207-448",
      email: "office@pfgs.edu.pk",
      address: "University Road, Peshawar, KPK",
      createdAt: "2025-02-15T09:00:00Z"
    }
  ];

  // ----------------------------------------------------------
  // USERS (Hashed passwords — never plain text)
  // super@123 | admin@123 | teacher@123 | student@123 | parent@123 | account@123
  // ----------------------------------------------------------
  const hSuper    = hash("super@123");
  const hAdmin    = hash("admin@123");
  const hTeacher  = hash("teacher@123");
  const hStudent  = hash("student@123");
  const hParent   = hash("parent@123");
  const hAccount  = hash("account@123");

  const users: User[] = [
    // ── Super Admin ──────────────────────────────────────────
    {
      id: "usr-super",
      organizationId: null,
      email: "haris@edusphere.ai",
      username: "haris",
      password: hSuper,
      role: UserRole.SUPER_ADMIN,
      name: "Haris Khan",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=HK",
      status: "Active"
    },

    // ── Al-Noor Model School (Lahore) ────────────────────────
    { id: "usr-adm-pk1", organizationId: "org-pk-1", email: "arif.mehmood@alnoor.edu.pk",   username: "arif.mehmood",  password: hAdmin,   role: UserRole.SCHOOL_ADMIN, name: "Dr. Arif Mehmood",      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AM", status: "Active" },
    { id: "usr-acc-pk1", organizationId: "org-pk-1", email: "khalid.fin@alnoor.edu.pk",     username: "khalid.fin",   password: hAccount, role: UserRole.ACCOUNTANT,   name: "Khalid Mehmood",        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=KM", status: "Active" },
    { id: "usr-tch-pk1", organizationId: "org-pk-1", email: "m.imran@alnoor.edu.pk",        username: "m.imran",      password: hTeacher, role: UserRole.TEACHER,      name: "Muhammad Imran",        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MI", status: "Active" },
    { id: "usr-tch-pk2", organizationId: "org-pk-1", email: "fatima.bibi@alnoor.edu.pk",    username: "fatima.bibi",  password: hTeacher, role: UserRole.TEACHER,      name: "Fatima Bibi",           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FB", status: "Active" },
    { id: "usr-tch-pk3", organizationId: "org-pk-1", email: "asad.raza@alnoor.edu.pk",      username: "asad.raza",    password: hTeacher, role: UserRole.TEACHER,      name: "Asad Raza Khan",        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AR", status: "Active" },
    { id: "usr-tch-pk4", organizationId: "org-pk-1", email: "saima.javed@alnoor.edu.pk",    username: "saima.javed",  password: hTeacher, role: UserRole.TEACHER,      name: "Saima Javed",           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SJ", status: "Active" },

    // ── Quaid-e-Azam Public School (Islamabad) ───────────────
    { id: "usr-adm-pk2", organizationId: "org-pk-2", email: "zara.ahmed@qaps.edu.pk",       username: "zara.ahmed",   password: hAdmin,   role: UserRole.SCHOOL_ADMIN, name: "Mrs. Zara Ahmed",       avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ZA", status: "Active" },
    { id: "usr-acc-pk2", organizationId: "org-pk-2", email: "sadia.fin@qaps.edu.pk",        username: "sadia.fin",    password: hAccount, role: UserRole.ACCOUNTANT,   name: "Sadia Karimi",          avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SK", status: "Active" },
    { id: "usr-tch-pk5", organizationId: "org-pk-2", email: "tariq.baig@qaps.edu.pk",       username: "tariq.baig",   password: hTeacher, role: UserRole.TEACHER,      name: "Tariq Ullah Baig",      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TB", status: "Active" },
    { id: "usr-tch-pk6", organizationId: "org-pk-2", email: "hina.shah@qaps.edu.pk",        username: "hina.shah",    password: hTeacher, role: UserRole.TEACHER,      name: "Hina Shah",             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=HS", status: "Active" },
    { id: "usr-tch-pk7", organizationId: "org-pk-2", email: "bilal.nawaz@qaps.edu.pk",      username: "bilal.nawaz",  password: hTeacher, role: UserRole.TEACHER,      name: "Bilal Nawaz",           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BN", status: "Active" },
    { id: "usr-tch-pk8", organizationId: "org-pk-2", email: "nadia.islam@qaps.edu.pk",      username: "nadia.islam",  password: hTeacher, role: UserRole.TEACHER,      name: "Nadia Islam",           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=NI", status: "Active" },

    // ── Balochistan Scholars Academy (Quetta) ────────────────
    { id: "usr-adm-pk3", organizationId: "org-pk-3", email: "a.qadir@bsa.edu.pk",           username: "a.qadir",      password: hAdmin,   role: UserRole.SCHOOL_ADMIN, name: "Prof. Abdul Qadir",     avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AQ", status: "Active" },
    { id: "usr-tch-pk9", organizationId: "org-pk-3", email: "saleem.baloch@bsa.edu.pk",     username: "saleem.baloch",password: hTeacher, role: UserRole.TEACHER,      name: "Saleem Baloch",         avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SB", status: "Active" },
    { id: "usr-tch-pk10",organizationId: "org-pk-3", email: "rukhsana@bsa.edu.pk",          username: "rukhsana.akhtar",password:hTeacher,role: UserRole.TEACHER,      name: "Rukhsana Akhtar",       avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RA", status: "Active" },
    { id: "usr-tch-pk11",organizationId: "org-pk-3", email: "sajid.mengal@bsa.edu.pk",      username: "sajid.mengal", password: hTeacher, role: UserRole.TEACHER,      name: "Sajid Ullah Mengal",    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SM", status: "Active" },
    { id: "usr-tch-pk12",organizationId: "org-pk-3", email: "raheem.dashti@bsa.edu.pk",     username: "raheem.dashti",password: hTeacher, role: UserRole.TEACHER,      name: "Raheem Dashti",         avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RD", status: "Active" },

    // ── The Crescent School (Karachi) ────────────────────────
    { id: "usr-adm-pk4", organizationId: "org-pk-4", email: "naila.farooqi@crescentschool.edu.pk", username: "naila.farooqi", password: hAdmin, role: UserRole.SCHOOL_ADMIN, name: "Dr. Naila Farooqi", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=NF", status: "Active" },
    { id: "usr-acc-pk4", organizationId: "org-pk-4", email: "nasir.fin@crescentschool.edu.pk",    username: "nasir.fin",    password: hAccount, role: UserRole.ACCOUNTANT,   name: "Nasir Ullah",           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=NU", status: "Active" },
    { id: "usr-tch-pk13",organizationId: "org-pk-4", email: "mohsin.mirza@crescentschool.edu.pk", username: "mohsin.mirza",  password: hTeacher, role: UserRole.TEACHER,      name: "Mohsin Ali Mirza",      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MM", status: "Active" },
    { id: "usr-tch-pk14",organizationId: "org-pk-4", email: "sadia.anwar@crescentschool.edu.pk",  username: "sadia.anwar",   password: hTeacher, role: UserRole.TEACHER,      name: "Sadia Anwar",           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SA", status: "Active" },
    { id: "usr-tch-pk15",organizationId: "org-pk-4", email: "jawad.hussain@crescentschool.edu.pk",username: "jawad.hussain", password: hTeacher, role: UserRole.TEACHER,      name: "Jawad Hussain",         avatar: "https://api.dicebear.com/7.x/initials/svg?seed=JH", status: "Active" },
    { id: "usr-tch-pk16",organizationId: "org-pk-4", email: "amna.siddiqui@crescentschool.edu.pk",username: "amna.siddiqui",password: hTeacher, role: UserRole.TEACHER,      name: "Amna Siddiqui",         avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AS", status: "Active" },

    // ── Pak Future Grammar School (Peshawar) ─────────────────
    { id: "usr-adm-pk5", organizationId: "org-pk-5", email: "babar.khan@pfgs.edu.pk",       username: "babar.khan",   password: hAdmin,   role: UserRole.SCHOOL_ADMIN, name: "Babar Khan",            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BK", status: "Active" },
    { id: "usr-tch-pk17",organizationId: "org-pk-5", email: "irfan.yousaf@pfgs.edu.pk",     username: "irfan.yousaf", password: hTeacher, role: UserRole.TEACHER,      name: "Irfan Yousaf",          avatar: "https://api.dicebear.com/7.x/initials/svg?seed=IY", status: "Active" },
    { id: "usr-tch-pk18",organizationId: "org-pk-5", email: "rabia.khattak@pfgs.edu.pk",    username: "rabia.khattak",password: hTeacher, role: UserRole.TEACHER,      name: "Rabia Khattak",         avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RK", status: "Active" },
    { id: "usr-tch-pk19",organizationId: "org-pk-5", email: "naeem.khan@pfgs.edu.pk",       username: "naeem.khan",   password: hTeacher, role: UserRole.TEACHER,      name: "Naeem Ullah Khan",      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=NK", status: "Active" },
    { id: "usr-tch-pk20",organizationId: "org-pk-5", email: "bashir.ahmad@pfgs.edu.pk",     username: "bashir.ahmad", password: hTeacher, role: UserRole.TEACHER,      name: "Bashir Ahmad",          avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BA", status: "Active" },
  ];

  // ----------------------------------------------------------
  // STUDENT USER ACCOUNTS (110 students across 5 schools)
  // ----------------------------------------------------------
  type StudentDef = { id: string; orgId: string; name: string; className: string; section: string; gender: "Male"|"Female"; dob: string; addr: string; gName: string; gPhone: string; gEmail: string; admNo: string; roll: string; };

  const studentDefs: StudentDef[] = [
    // ── Al-Noor Model School (org-pk-1) ─ 22 students ──────
    { id:"std-pk-001", orgId:"org-pk-1", name:"Ali Hassan Malik",    className:"Grade 10", section:"Section A", gender:"Male",   dob:"2010-03-14", addr:"23 Gulberg III, Lahore",     gName:"Hassan Malik",      gPhone:"+92-300-4412234", gEmail:"hassan.malik@example.com",    admNo:"ANMS-2025-001", roll:"01" },
    { id:"std-pk-002", orgId:"org-pk-1", name:"Fatima Noor",          className:"Grade 10", section:"Section A", gender:"Female", dob:"2010-07-22", addr:"45 Model Town, Lahore",       gName:"Abdul Noor",        gPhone:"+92-321-5523341", gEmail:"abdul.noor@example.com",      admNo:"ANMS-2025-002", roll:"02" },
    { id:"std-pk-003", orgId:"org-pk-1", name:"Usman Tariq",           className:"Grade 9",  section:"Section A", gender:"Male",   dob:"2011-01-08", addr:"12 Johar Town, Lahore",       gName:"Tariq Ahmed",       gPhone:"+92-333-7712345", gEmail:"tariq.ahmed@example.com",     admNo:"ANMS-2025-003", roll:"03" },
    { id:"std-pk-004", orgId:"org-pk-1", name:"Sana Gulzar",           className:"Grade 9",  section:"Section A", gender:"Female", dob:"2011-04-30", addr:"8 Garden Town, Lahore",        gName:"Gulzar Hussain",    gPhone:"+92-300-9918877", gEmail:"gulzar.hussain@example.com",  admNo:"ANMS-2025-004", roll:"04" },
    { id:"std-pk-005", orgId:"org-pk-1", name:"Ahmed Bilal",            className:"Grade 8",  section:"Section A", gender:"Male",   dob:"2012-06-15", addr:"56 DHA Phase 5, Lahore",      gName:"Bilal Chaudhry",    gPhone:"+92-321-4456789", gEmail:"bilal.chaudhry@example.com",  admNo:"ANMS-2025-005", roll:"05" },
    { id:"std-pk-006", orgId:"org-pk-1", name:"Zainab Riaz",            className:"Grade 8",  section:"Section B", gender:"Female", dob:"2012-09-01", addr:"77 Samanabad, Lahore",         gName:"Riaz Ahmad",        gPhone:"+92-300-5512233", gEmail:"riaz.ahmad@example.com",      admNo:"ANMS-2025-006", roll:"06" },
    { id:"std-pk-007", orgId:"org-pk-1", name:"Hamza Qureshi",          className:"Grade 7",  section:"Section A", gender:"Male",   dob:"2013-02-20", addr:"34 Allama Iqbal Town, Lahore", gName:"Asif Qureshi",     gPhone:"+92-333-8823456", gEmail:"asif.qureshi@example.com",    admNo:"ANMS-2025-007", roll:"07" },
    { id:"std-pk-008", orgId:"org-pk-1", name:"Mariam Hussain",          className:"Grade 7",  section:"Section A", gender:"Female", dob:"2013-05-11", addr:"90 Faisal Town, Lahore",       gName:"Hussain Raza",      gPhone:"+92-300-6623344", gEmail:"hussain.raza@example.com",    admNo:"ANMS-2025-008", roll:"08" },
    { id:"std-pk-009", orgId:"org-pk-1", name:"Shahzaib Khan",           className:"Grade 6",  section:"Section A", gender:"Male",   dob:"2014-08-28", addr:"18 Cantonment, Lahore",        gName:"Sarwar Khan",       gPhone:"+92-321-3312345", gEmail:"sarwar.khan@example.com",     admNo:"ANMS-2025-009", roll:"09" },
    { id:"std-pk-010", orgId:"org-pk-1", name:"Nida Jabbar",             className:"Grade 6",  section:"Section A", gender:"Female", dob:"2014-11-05", addr:"66 Punjab Society, Lahore",     gName:"Jabbar Hussain",    gPhone:"+92-300-7734455", gEmail:"jabbar.hussain@example.com",  admNo:"ANMS-2025-010", roll:"10" },
    { id:"std-pk-011", orgId:"org-pk-1", name:"Faisal Nawaz",            className:"Grade 5",  section:"Section A", gender:"Male",   dob:"2015-03-17", addr:"44 Township, Lahore",          gName:"Nawaz Sharif",      gPhone:"+92-333-9912345", gEmail:"nawaz.sharif.fam@example.com",admNo:"ANMS-2025-011", roll:"11" },
    { id:"std-pk-012", orgId:"org-pk-1", name:"Hira Baig",               className:"Grade 5",  section:"Section B", gender:"Female", dob:"2015-07-23", addr:"55 Ravi Town, Lahore",          gName:"Baig Sahib",        gPhone:"+92-321-6634567", gEmail:"baig.sahib@example.com",      admNo:"ANMS-2025-012", roll:"12" },
    { id:"std-pk-013", orgId:"org-pk-1", name:"Waqas Ahmed",             className:"Grade 4",  section:"Section A", gender:"Male",   dob:"2016-01-09", addr:"23 Gulberg III, Lahore",        gName:"Ahmed Shahid",      gPhone:"+92-300-1123456", gEmail:"ahmed.shahid@example.com",    admNo:"ANMS-2025-013", roll:"13" },
    { id:"std-pk-014", orgId:"org-pk-1", name:"Areeba Khalid",            className:"Grade 4",  section:"Section A", gender:"Female", dob:"2016-06-12", addr:"12 Green Town, Lahore",         gName:"Khalid Mehmood",    gPhone:"+92-333-2234567", gEmail:"khalid.mehmood.fam@example.com",admNo:"ANMS-2025-014", roll:"14" },
    { id:"std-pk-015", orgId:"org-pk-1", name:"Junaid Iqbal",             className:"Grade 3",  section:"Section A", gender:"Male",   dob:"2017-04-20", addr:"89 Bedian Road, Lahore",        gName:"Iqbal Ahmed",       gPhone:"+92-321-7745678", gEmail:"iqbal.ahmed@example.com",     admNo:"ANMS-2025-015", roll:"15" },
    { id:"std-pk-016", orgId:"org-pk-1", name:"Maira Sohail",             className:"Grade 3",  section:"Section B", gender:"Female", dob:"2017-08-31", addr:"33 Wahdat Colony, Lahore",       gName:"Sohail Ahmad",      gPhone:"+92-300-8856789", gEmail:"sohail.ahmad@example.com",    admNo:"ANMS-2025-016", roll:"16" },
    { id:"std-pk-017", orgId:"org-pk-1", name:"Adeel Butt",               className:"Grade 2",  section:"Section A", gender:"Male",   dob:"2018-02-14", addr:"71 Sabzazar, Lahore",           gName:"Naseer Butt",       gPhone:"+92-333-3345678", gEmail:"naseer.butt@example.com",     admNo:"ANMS-2025-017", roll:"17" },
    { id:"std-pk-018", orgId:"org-pk-1", name:"Saira Aslam",              className:"Grade 2",  section:"Section A", gender:"Female", dob:"2018-09-10", addr:"45 Model Town, Lahore",         gName:"Aslam Butt",        gPhone:"+92-321-4456789", gEmail:"aslam.butt@example.com",      admNo:"ANMS-2025-018", roll:"18" },
    { id:"std-pk-019", orgId:"org-pk-1", name:"Osama Sheikh",             className:"Grade 1",  section:"Section A", gender:"Male",   dob:"2019-05-25", addr:"9 Iqbal Park, Lahore",          gName:"Sheikh Anwar",      gPhone:"+92-300-9967890", gEmail:"sheikh.anwar@example.com",    admNo:"ANMS-2025-019", roll:"19" },
    { id:"std-pk-020", orgId:"org-pk-1", name:"Ayesha Zaidi",             className:"Grade 1",  section:"Section A", gender:"Female", dob:"2019-10-03", addr:"14 Walton Road, Lahore",         gName:"Zaidi Sahib",       gPhone:"+92-333-5567890", gEmail:"zaidi.sahib@example.com",     admNo:"ANMS-2025-020", roll:"20" },
    { id:"std-pk-021", orgId:"org-pk-1", name:"Raza Abbas",               className:"KG",       section:"Section A", gender:"Male",   dob:"2020-01-18", addr:"67 Shadbagh, Lahore",           gName:"Abbas Hussain",     gPhone:"+92-321-8878901", gEmail:"abbas.hussain@example.com",   admNo:"ANMS-2025-021", roll:"21" },
    { id:"std-pk-022", orgId:"org-pk-1", name:"Tooba Manzoor",             className:"Nursery",  section:"Section A", gender:"Female", dob:"2021-06-07", addr:"28 Clifton, Lahore",             gName:"Manzoor Ahmad",     gPhone:"+92-300-6689012", gEmail:"manzoor.ahmad@example.com",   admNo:"ANMS-2025-022", roll:"22" },

    // ── Quaid-e-Azam Public School (org-pk-2) ─ 22 students ─
    { id:"std-pk-023", orgId:"org-pk-2", name:"Ibrahim Shah",             className:"Grade 10", section:"Section A", gender:"Male",   dob:"2010-02-10", addr:"F-11/2, Islamabad",            gName:"Shah Jahan",        gPhone:"+92-51-2345678", gEmail:"shah.jahan@example.com",      admNo:"QAPS-2025-001", roll:"01" },
    { id:"std-pk-024", orgId:"org-pk-2", name:"Sadia Chaudhry",           className:"Grade 10", section:"Section A", gender:"Female", dob:"2010-05-19", addr:"G-10/3, Islamabad",             gName:"Chaudhry Bashir",   gPhone:"+92-51-3456789", gEmail:"chaudhry.bashir@example.com", admNo:"QAPS-2025-002", roll:"02" },
    { id:"std-pk-025", orgId:"org-pk-2", name:"Talha Mirza",               className:"Grade 9",  section:"Section A", gender:"Male",   dob:"2011-08-22", addr:"E-7, Islamabad",               gName:"Mirza Tahir",       gPhone:"+92-300-3456789", gEmail:"mirza.tahir@example.com",    admNo:"QAPS-2025-003", roll:"03" },
    { id:"std-pk-026", orgId:"org-pk-2", name:"Noor Fatima",               className:"Grade 9",  section:"Section B", gender:"Female", dob:"2011-12-14", addr:"DHA Phase 2, Islamabad",        gName:"Fatima Malik",      gPhone:"+92-321-2341234", gEmail:"fatima.malik@example.com",    admNo:"QAPS-2025-004", roll:"04" },
    { id:"std-pk-027", orgId:"org-pk-2", name:"Asim Rehman",               className:"Grade 8",  section:"Section A", gender:"Male",   dob:"2012-04-05", addr:"I-8/4, Islamabad",              gName:"Rehman Ali",        gPhone:"+92-333-5671234", gEmail:"rehman.ali@example.com",      admNo:"QAPS-2025-005", roll:"05" },
    { id:"std-pk-028", orgId:"org-pk-2", name:"Maryam Zafar",              className:"Grade 8",  section:"Section A", gender:"Female", dob:"2012-07-28", addr:"F-6/4, Islamabad",              gName:"Zafar Iqbal",       gPhone:"+92-300-1231234", gEmail:"zafar.iqbal@example.com",     admNo:"QAPS-2025-006", roll:"06" },
    { id:"std-pk-029", orgId:"org-pk-2", name:"Hasan Raza",                className:"Grade 7",  section:"Section A", gender:"Male",   dob:"2013-01-30", addr:"G-8/4, Islamabad",              gName:"Raza Hussain",      gPhone:"+92-321-9091234", gEmail:"raza.hussain@example.com",    admNo:"QAPS-2025-007", roll:"07" },
    { id:"std-pk-030", orgId:"org-pk-2", name:"Amna Farooq",               className:"Grade 7",  section:"Section B", gender:"Female", dob:"2013-06-16", addr:"H-9, Islamabad",                gName:"Farooq Ahmad",      gPhone:"+92-333-3451234", gEmail:"farooq.ahmad@example.com",    admNo:"QAPS-2025-008", roll:"08" },
    { id:"std-pk-031", orgId:"org-pk-2", name:"Shahid Iqbal",              className:"Grade 6",  section:"Section A", gender:"Male",   dob:"2014-09-04", addr:"F-10/2, Islamabad",             gName:"Iqbal Nasir",       gPhone:"+92-300-8901234", gEmail:"iqbal.nasir@example.com",     admNo:"QAPS-2025-009", roll:"09" },
    { id:"std-pk-032", orgId:"org-pk-2", name:"Farah Naz",                  className:"Grade 6",  section:"Section A", gender:"Female", dob:"2014-12-21", addr:"G-11/1, Islamabad",             gName:"Naz Mohammad",      gPhone:"+92-321-6781234", gEmail:"naz.mohammad@example.com",    admNo:"QAPS-2025-010", roll:"10" },
    { id:"std-pk-033", orgId:"org-pk-2", name:"Zubair Ul Haq",              className:"Grade 5",  section:"Section A", gender:"Male",   dob:"2015-05-15", addr:"I-9/4, Islamabad",              gName:"Ul Haq Anwar",      gPhone:"+92-333-7891234", gEmail:"ul.haq.anwar@example.com",    admNo:"QAPS-2025-011", roll:"11" },
    { id:"std-pk-034", orgId:"org-pk-2", name:"Anmol Saleem",               className:"Grade 5",  section:"Section B", gender:"Female", dob:"2015-10-08", addr:"F-7/4, Islamabad",              gName:"Saleem Shahzad",    gPhone:"+92-300-4561234", gEmail:"saleem.shahzad@example.com",  admNo:"QAPS-2025-012", roll:"12" },
    { id:"std-pk-035", orgId:"org-pk-2", name:"Danish Shafique",            className:"Grade 4",  section:"Section A", gender:"Male",   dob:"2016-02-25", addr:"G-9/4, Islamabad",              gName:"Shafique Khan",     gPhone:"+92-321-3451234", gEmail:"shafique.khan@example.com",   admNo:"QAPS-2025-013", roll:"13" },
    { id:"std-pk-036", orgId:"org-pk-2", name:"Samra Irfan",                className:"Grade 4",  section:"Section A", gender:"Female", dob:"2016-07-12", addr:"F-8/3, Islamabad",              gName:"Irfan Ahmed",       gPhone:"+92-333-2341234", gEmail:"irfan.ahmed@example.com",     admNo:"QAPS-2025-014", roll:"14" },
    { id:"std-pk-037", orgId:"org-pk-2", name:"Omer Farooq",                className:"Grade 3",  section:"Section A", gender:"Male",   dob:"2017-03-20", addr:"I-8/2, Islamabad",              gName:"Farooq Hassan",     gPhone:"+92-300-1231234", gEmail:"farooq.hassan@example.com",   admNo:"QAPS-2025-015", roll:"15" },
    { id:"std-pk-038", orgId:"org-pk-2", name:"Laiba Mehmood",              className:"Grade 3",  section:"Section B", gender:"Female", dob:"2017-09-05", addr:"E-11, Islamabad",               gName:"Mehmood Tariq",     gPhone:"+92-321-9081234", gEmail:"mehmood.tariq@example.com",   admNo:"QAPS-2025-016", roll:"16" },
    { id:"std-pk-039", orgId:"org-pk-2", name:"Waqar Abbas",               className:"Grade 2",  section:"Section A", gender:"Male",   dob:"2018-04-18", addr:"G-7/4, Islamabad",              gName:"Abbas Malik",       gPhone:"+92-333-5671234", gEmail:"abbas.malik@example.com",     admNo:"QAPS-2025-017", roll:"17" },
    { id:"std-pk-040", orgId:"org-pk-2", name:"Iqra Sultan",                className:"Grade 2",  section:"Section A", gender:"Female", dob:"2018-11-22", addr:"F-6/2, Islamabad",              gName:"Sultan Mehmood",    gPhone:"+92-300-6781234", gEmail:"sultan.mehmood@example.com",  admNo:"QAPS-2025-018", roll:"18" },
    { id:"std-pk-041", orgId:"org-pk-2", name:"Asad Muneer",               className:"Grade 1",  section:"Section A", gender:"Male",   dob:"2019-06-30", addr:"H-8/4, Islamabad",              gName:"Muneer Hussain",    gPhone:"+92-321-4561234", gEmail:"muneer.hussain@example.com",  admNo:"QAPS-2025-019", roll:"19" },
    { id:"std-pk-042", orgId:"org-pk-2", name:"Bisma Tahir",                className:"Grade 1",  section:"Section A", gender:"Female", dob:"2019-12-14", addr:"F-11/4, Islamabad",             gName:"Tahir Ahmad",       gPhone:"+92-333-3451234", gEmail:"tahir.ahmad@example.com",     admNo:"QAPS-2025-020", roll:"20" },
    { id:"std-pk-043", orgId:"org-pk-2", name:"Ahsan Ullah",                className:"KG",       section:"Section A", gender:"Male",   dob:"2020-07-07", addr:"G-6/4, Islamabad",              gName:"Ullah Bakhsh",      gPhone:"+92-300-2341234", gEmail:"ullah.bakhsh@example.com",    admNo:"QAPS-2025-021", roll:"21" },
    { id:"std-pk-044", orgId:"org-pk-2", name:"Sheeza Malik",               className:"Nursery",  section:"Section A", gender:"Female", dob:"2021-03-19", addr:"E-7/2, Islamabad",              gName:"Malik Rashid",      gPhone:"+92-321-8901234", gEmail:"malik.rashid@example.com",    admNo:"QAPS-2025-022", roll:"22" },

    // ── Balochistan Scholars Academy (org-pk-3) ─ 22 students
    { id:"std-pk-045", orgId:"org-pk-3", name:"Rashid Baloch",              className:"Grade 10", section:"Section A", gender:"Male",   dob:"2010-01-12", addr:"Liaquat Bazar, Quetta",         gName:"Baloch Mir",        gPhone:"+92-81-2841001", gEmail:"baloch.mir@example.com",      admNo:"BSA-2025-001", roll:"01" },
    { id:"std-pk-046", orgId:"org-pk-3", name:"Mehrunnisa Mengal",          className:"Grade 10", section:"Section A", gender:"Female", dob:"2010-06-25", addr:"Zarghoon Road, Quetta",          gName:"Mengal Agha",       gPhone:"+92-81-2845678", gEmail:"mengal.agha@example.com",     admNo:"BSA-2025-002", roll:"02" },
    { id:"std-pk-047", orgId:"org-pk-3", name:"Nawabzada Bugti",            className:"Grade 9",  section:"Section A", gender:"Male",   dob:"2011-04-08", addr:"Sariab Road, Quetta",            gName:"Bugti Sardar",      gPhone:"+92-81-2849012", gEmail:"bugti.sardar@example.com",    admNo:"BSA-2025-003", roll:"03" },
    { id:"std-pk-048", orgId:"org-pk-3", name:"Zeba Dashti",                className:"Grade 9",  section:"Section B", gender:"Female", dob:"2011-09-14", addr:"Brewery Road, Quetta",           gName:"Dashti Khan",       gPhone:"+92-81-2843456", gEmail:"dashti.khan@example.com",     admNo:"BSA-2025-004", roll:"04" },
    { id:"std-pk-049", orgId:"org-pk-3", name:"Junaid Marri",               className:"Grade 8",  section:"Section A", gender:"Male",   dob:"2012-02-28", addr:"Mezan Chowk, Quetta",           gName:"Marri Chief",       gPhone:"+92-81-2847890", gEmail:"marri.chief@example.com",     admNo:"BSA-2025-005", roll:"05" },
    { id:"std-pk-050", orgId:"org-pk-3", name:"Haleema Raisani",            className:"Grade 8",  section:"Section A", gender:"Female", dob:"2012-07-03", addr:"Civil Lines, Quetta",            gName:"Raisani Sahib",     gPhone:"+92-81-2841234", gEmail:"raisani.sahib@example.com",   admNo:"BSA-2025-006", roll:"06" },
    { id:"std-pk-051", orgId:"org-pk-3", name:"Sarfraz Kakar",               className:"Grade 7",  section:"Section A", gender:"Male",   dob:"2013-03-20", addr:"Prince Road, Quetta",           gName:"Kakar Jan",         gPhone:"+92-81-2845670", gEmail:"kakar.jan@example.com",       admNo:"BSA-2025-007", roll:"07" },
    { id:"std-pk-052", orgId:"org-pk-3", name:"Rabia Lehri",                 className:"Grade 7",  section:"Section B", gender:"Female", dob:"2013-08-16", addr:"Spinny Road, Quetta",            gName:"Lehri Sahib",       gPhone:"+92-81-2842345", gEmail:"lehri.sahib@example.com",     admNo:"BSA-2025-008", roll:"08" },
    { id:"std-pk-053", orgId:"org-pk-3", name:"Kamran Zehri",                className:"Grade 6",  section:"Section A", gender:"Male",   dob:"2014-05-11", addr:"Nawa Killi, Quetta",             gName:"Zehri Khan",        gPhone:"+92-81-2846789", gEmail:"zehri.khan@example.com",      admNo:"BSA-2025-009", roll:"09" },
    { id:"std-pk-054", orgId:"org-pk-3", name:"Sumbal Bizenjo",              className:"Grade 6",  section:"Section A", gender:"Female", dob:"2014-10-27", addr:"Jinnah Road, Quetta",            gName:"Bizenjo Agha",      gPhone:"+92-81-2843012", gEmail:"bizenjo.agha@example.com",    admNo:"BSA-2025-010", roll:"10" },
    { id:"std-pk-055", orgId:"org-pk-3", name:"Hafeez Notezai",              className:"Grade 5",  section:"Section A", gender:"Male",   dob:"2015-02-14", addr:"Quaid-e-Azam Colony, Quetta",    gName:"Notezai Chief",     gPhone:"+92-81-2847012", gEmail:"notezai.chief@example.com",   admNo:"BSA-2025-011", roll:"11" },
    { id:"std-pk-056", orgId:"org-pk-3", name:"Amina Khidai",                className:"Grade 5",  section:"Section B", gender:"Female", dob:"2015-07-08", addr:"Zarghoon Road, Quetta",          gName:"Khidai Sahib",      gPhone:"+92-81-2844345", gEmail:"khidai.sahib@example.com",    admNo:"BSA-2025-012", roll:"12" },
    { id:"std-pk-057", orgId:"org-pk-3", name:"Adnan Khosa",                 className:"Grade 4",  section:"Section A", gender:"Male",   dob:"2016-01-22", addr:"Samungli Road, Quetta",          gName:"Khosa Mir",         gPhone:"+92-81-2841678", gEmail:"khosa.mir@example.com",       admNo:"BSA-2025-013", roll:"13" },
    { id:"std-pk-058", orgId:"org-pk-3", name:"Gul Zareen Chandio",          className:"Grade 4",  section:"Section A", gender:"Female", dob:"2016-06-15", addr:"Airport Road, Quetta",           gName:"Chandio Hussain",   gPhone:"+92-81-2845012", gEmail:"chandio.hussain@example.com", admNo:"BSA-2025-014", roll:"14" },
    { id:"std-pk-059", orgId:"org-pk-3", name:"Manzoor Lehri",               className:"Grade 3",  section:"Section A", gender:"Male",   dob:"2017-03-05", addr:"Brewery Road, Quetta",           gName:"Lehri Ahmad",       gPhone:"+92-81-2848345", gEmail:"lehri.ahmad@example.com",     admNo:"BSA-2025-015", roll:"15" },
    { id:"std-pk-060", orgId:"org-pk-3", name:"Sobia Shahwani",              className:"Grade 3",  section:"Section B", gender:"Female", dob:"2017-08-29", addr:"Spinny Road, Quetta",            gName:"Shahwani Sardar",   gPhone:"+92-81-2842678", gEmail:"shahwani.sardar@example.com", admNo:"BSA-2025-016", roll:"16" },
    { id:"std-pk-061", orgId:"org-pk-3", name:"Daniyal Mengal",              className:"Grade 2",  section:"Section A", gender:"Male",   dob:"2018-04-17", addr:"Saryab Mills, Quetta",           gName:"Mengal Haji",       gPhone:"+92-81-2846012", gEmail:"mengal.haji@example.com",     admNo:"BSA-2025-017", roll:"17" },
    { id:"std-pk-062", orgId:"org-pk-3", name:"Shabana Baloch",              className:"Grade 2",  section:"Section A", gender:"Female", dob:"2018-10-04", addr:"Liaquat Town, Quetta",           gName:"Baloch Rehmat",     gPhone:"+92-81-2843678", gEmail:"baloch.rehmat@example.com",   admNo:"BSA-2025-018", roll:"18" },
    { id:"std-pk-063", orgId:"org-pk-3", name:"Hassan Zarkoon",              className:"Grade 1",  section:"Section A", gender:"Male",   dob:"2019-07-13", addr:"Nawa Killi, Quetta",             gName:"Zarkoon Khan",      gPhone:"+92-81-2847345", gEmail:"zarkoon.khan@example.com",    admNo:"BSA-2025-019", roll:"19" },
    { id:"std-pk-064", orgId:"org-pk-3", name:"Faiza Kakar",                 className:"Grade 1",  section:"Section A", gender:"Female", dob:"2019-12-01", addr:"Civil Lines, Quetta",            gName:"Kakar Agha",        gPhone:"+92-81-2844678", gEmail:"kakar.agha@example.com",      admNo:"BSA-2025-020", roll:"20" },
    { id:"std-pk-065", orgId:"org-pk-3", name:"Sikandar Raisani",            className:"KG",       section:"Section A", gender:"Male",   dob:"2020-05-20", addr:"Sariab Road, Quetta",            gName:"Raisani Mir",       gPhone:"+92-81-2848012", gEmail:"raisani.mir@example.com",     admNo:"BSA-2025-021", roll:"21" },
    { id:"std-pk-066", orgId:"org-pk-3", name:"Marwa Bugti",                  className:"Nursery",  section:"Section A", gender:"Female", dob:"2021-02-08", addr:"Mezan Chowk, Quetta",           gName:"Bugti Agha",        gPhone:"+92-81-2845345", gEmail:"bugti.agha@example.com",      admNo:"BSA-2025-022", roll:"22" },

    // ── The Crescent School (org-pk-4) ─ 22 students ────────
    { id:"std-pk-067", orgId:"org-pk-4", name:"Mohsin Iqbal",                className:"Grade 10", section:"Section A", gender:"Male",   dob:"2010-01-30", addr:"Gulshan-e-Iqbal, Karachi",      gName:"Iqbal Hussain",     gPhone:"+92-21-3561001", gEmail:"iqbal.hussain@example.com",   admNo:"TCS-2025-001", roll:"01" },
    { id:"std-pk-068", orgId:"org-pk-4", name:"Nimra Siddiqui",              className:"Grade 10", section:"Section A", gender:"Female", dob:"2010-04-15", addr:"Block 13-D, Gulshan, Karachi",   gName:"Siddiqui Sahib",    gPhone:"+92-21-3565678", gEmail:"siddiqui.sahib@example.com",  admNo:"TCS-2025-002", roll:"02" },
    { id:"std-pk-069", orgId:"org-pk-4", name:"Fawad Memon",                  className:"Grade 9",  section:"Section A", gender:"Male",   dob:"2011-07-22", addr:"North Karachi, Karachi",         gName:"Memon Haji",        gPhone:"+92-21-3569012", gEmail:"memon.haji@example.com",      admNo:"TCS-2025-003", roll:"03" },
    { id:"std-pk-070", orgId:"org-pk-4", name:"Iqra Ansari",                  className:"Grade 9",  section:"Section B", gender:"Female", dob:"2011-11-08", addr:"Nazimabad, Karachi",             gName:"Ansari Sheikh",     gPhone:"+92-21-3563456", gEmail:"ansari.sheikh@example.com",   admNo:"TCS-2025-004", roll:"04" },
    { id:"std-pk-071", orgId:"org-pk-4", name:"Shaheer Khan",                 className:"Grade 8",  section:"Section A", gender:"Male",   dob:"2012-03-19", addr:"PECHS, Karachi",                 gName:"Khan Sahib",        gPhone:"+92-21-3567890", gEmail:"khan.sahib.khi@example.com",  admNo:"TCS-2025-005", roll:"05" },
    { id:"std-pk-072", orgId:"org-pk-4", name:"Anum Mirza",                   className:"Grade 8",  section:"Section A", gender:"Female", dob:"2012-08-05", addr:"Clifton, Karachi",               gName:"Mirza Baber",       gPhone:"+92-21-3561234", gEmail:"mirza.baber@example.com",     admNo:"TCS-2025-006", roll:"06" },
    { id:"std-pk-073", orgId:"org-pk-4", name:"Bilal Qureshi",                className:"Grade 7",  section:"Section A", gender:"Male",   dob:"2013-01-25", addr:"FB Area, Karachi",               gName:"Qureshi Haji",      gPhone:"+92-21-3565670", gEmail:"qureshi.haji@example.com",    admNo:"TCS-2025-007", roll:"07" },
    { id:"std-pk-074", orgId:"org-pk-4", name:"Lubna Ahmed",                  className:"Grade 7",  section:"Section B", gender:"Female", dob:"2013-06-11", addr:"Gulistan-e-Jauhar, Karachi",     gName:"Ahmed Bhai",        gPhone:"+92-21-3562345", gEmail:"ahmed.bhai@example.com",      admNo:"TCS-2025-008", roll:"08" },
    { id:"std-pk-075", orgId:"org-pk-4", name:"Tariq Memon",                  className:"Grade 6",  section:"Section A", gender:"Male",   dob:"2014-04-02", addr:"Orangi Town, Karachi",           gName:"Memon Siddiq",      gPhone:"+92-21-3566789", gEmail:"memon.siddiq@example.com",    admNo:"TCS-2025-009", roll:"09" },
    { id:"std-pk-076", orgId:"org-pk-4", name:"Aiman Zahra",                  className:"Grade 6",  section:"Section A", gender:"Female", dob:"2014-09-18", addr:"Landhi, Karachi",                gName:"Zahra Agha",        gPhone:"+92-21-3564012", gEmail:"zahra.agha@example.com",      admNo:"TCS-2025-010", roll:"10" },
    { id:"std-pk-077", orgId:"org-pk-4", name:"Zeeshan Raza",                 className:"Grade 5",  section:"Section A", gender:"Male",   dob:"2015-01-13", addr:"Surjani Town, Karachi",          gName:"Raza Ahmad",        gPhone:"+92-21-3567012", gEmail:"raza.ahmad.khi@example.com",  admNo:"TCS-2025-011", roll:"11" },
    { id:"std-pk-078", orgId:"org-pk-4", name:"Komal Shaikh",                 className:"Grade 5",  section:"Section B", gender:"Female", dob:"2015-06-07", addr:"Liaquatabad, Karachi",           gName:"Shaikh Umer",       gPhone:"+92-21-3564345", gEmail:"shaikh.umer@example.com",     admNo:"TCS-2025-012", roll:"12" },
    { id:"std-pk-079", orgId:"org-pk-4", name:"Kamran Niazi",                 className:"Grade 4",  section:"Section A", gender:"Male",   dob:"2016-02-28", addr:"Korangi, Karachi",               gName:"Niazi Sahib",       gPhone:"+92-21-3561678", gEmail:"niazi.sahib@example.com",     admNo:"TCS-2025-013", roll:"13" },
    { id:"std-pk-080", orgId:"org-pk-4", name:"Saman Fatima",                 className:"Grade 4",  section:"Section A", gender:"Female", dob:"2016-07-14", addr:"Malir, Karachi",                 gName:"Fatima Bano",       gPhone:"+92-21-3565012", gEmail:"fatima.bano@example.com",     admNo:"TCS-2025-014", roll:"14" },
    { id:"std-pk-081", orgId:"org-pk-4", name:"Jawad Butt",                   className:"Grade 3",  section:"Section A", gender:"Male",   dob:"2017-03-21", addr:"DHA Phase 6, Karachi",           gName:"Butt Sahib",        gPhone:"+92-21-3568345", gEmail:"butt.sahib@example.com",      admNo:"TCS-2025-015", roll:"15" },
    { id:"std-pk-082", orgId:"org-pk-4", name:"Hina Khan",                    className:"Grade 3",  section:"Section B", gender:"Female", dob:"2017-09-10", addr:"Gulshan-e-Iqbal, Karachi",      gName:"Khan Akhtar",       gPhone:"+92-21-3562678", gEmail:"khan.akhtar@example.com",     admNo:"TCS-2025-016", roll:"16" },
    { id:"std-pk-083", orgId:"org-pk-4", name:"Zaid Siddiqui",                className:"Grade 2",  section:"Section A", gender:"Male",   dob:"2018-04-25", addr:"Block 16, PECHS, Karachi",       gName:"Siddiqui Zulfiqar", gPhone:"+92-21-3566012", gEmail:"siddiqui.zulfiqar@example.com",admNo:"TCS-2025-017", roll:"17" },
    { id:"std-pk-084", orgId:"org-pk-4", name:"Maria Baig",                   className:"Grade 2",  section:"Section A", gender:"Female", dob:"2018-10-11", addr:"Nazimabad, Karachi",             gName:"Baig Sahib",        gPhone:"+92-21-3563678", gEmail:"baig.sahib.khi@example.com",  admNo:"TCS-2025-018", roll:"18" },
    { id:"std-pk-085", orgId:"org-pk-4", name:"Hamdan Ansari",                className:"Grade 1",  section:"Section A", gender:"Male",   dob:"2019-06-18", addr:"FB Area, Karachi",               gName:"Ansari Bhai",       gPhone:"+92-21-3567345", gEmail:"ansari.bhai@example.com",     admNo:"TCS-2025-019", roll:"19" },
    { id:"std-pk-086", orgId:"org-pk-4", name:"Aliza Memon",                  className:"Grade 1",  section:"Section A", gender:"Female", dob:"2019-12-05", addr:"Surjani Town, Karachi",          gName:"Memon Bhai",        gPhone:"+92-21-3564678", gEmail:"memon.bhai@example.com",      admNo:"TCS-2025-020", roll:"20" },
    { id:"std-pk-087", orgId:"org-pk-4", name:"Saad Hussain",                 className:"KG",       section:"Section A", gender:"Male",   dob:"2020-07-22", addr:"Orangi Town, Karachi",           gName:"Hussain Bhai",      gPhone:"+92-21-3568012", gEmail:"hussain.bhai@example.com",    admNo:"TCS-2025-021", roll:"21" },
    { id:"std-pk-088", orgId:"org-pk-4", name:"Humaira Raza",                 className:"Nursery",  section:"Section A", gender:"Female", dob:"2021-03-08", addr:"Korangi, Karachi",               gName:"Raza Bhai",         gPhone:"+92-21-3565345", gEmail:"raza.bhai@example.com",       admNo:"TCS-2025-022", roll:"22" },

    // ── Pak Future Grammar School (org-pk-5) ─ 22 students ─
    { id:"std-pk-089", orgId:"org-pk-5", name:"Hamid Khattak",                className:"Grade 10", section:"Section A", gender:"Male",   dob:"2010-02-14", addr:"University Town, Peshawar",       gName:"Khattak Khan",      gPhone:"+92-91-5844001", gEmail:"khattak.khan@example.com",    admNo:"PFGS-2025-001", roll:"01" },
    { id:"std-pk-090", orgId:"org-pk-5", name:"Zuhra Afridi",                 className:"Grade 10", section:"Section A", gender:"Female", dob:"2010-05-29", addr:"Hayatabad Phase 3, Peshawar",     gName:"Afridi Jan",        gPhone:"+92-91-5845678", gEmail:"afridi.jan@example.com",      admNo:"PFGS-2025-002", roll:"02" },
    { id:"std-pk-091", orgId:"org-pk-5", name:"Rehman Yousafzai",             className:"Grade 9",  section:"Section A", gender:"Male",   dob:"2011-08-15", addr:"Ring Road, Peshawar",             gName:"Yousafzai Khan",    gPhone:"+92-91-5849012", gEmail:"yousafzai.khan@example.com",  admNo:"PFGS-2025-003", roll:"03" },
    { id:"std-pk-092", orgId:"org-pk-5", name:"Asma Mohmand",                 className:"Grade 9",  section:"Section B", gender:"Female", dob:"2011-11-02", addr:"Dabgari Garden, Peshawar",        gName:"Mohmand Lashkar",   gPhone:"+92-91-5843456", gEmail:"mohmand.lashkar@example.com", admNo:"PFGS-2025-004", roll:"04" },
    { id:"std-pk-093", orgId:"org-pk-5", name:"Tariq Shinwari",               className:"Grade 8",  section:"Section A", gender:"Male",   dob:"2012-04-21", addr:"Cantonment, Peshawar",            gName:"Shinwari Chief",    gPhone:"+92-91-5847890", gEmail:"shinwari.chief@example.com",  admNo:"PFGS-2025-005", roll:"05" },
    { id:"std-pk-094", orgId:"org-pk-5", name:"Maliha Khan",                  className:"Grade 8",  section:"Section A", gender:"Female", dob:"2012-09-07", addr:"Gulbahar Colony, Peshawar",       gName:"Khan Agha",         gPhone:"+92-91-5841234", gEmail:"khan.agha.psh@example.com",   admNo:"PFGS-2025-006", roll:"06" },
    { id:"std-pk-095", orgId:"org-pk-5", name:"Idrees Swati",                 className:"Grade 7",  section:"Section A", gender:"Male",   dob:"2013-02-18", addr:"Warsak Road, Peshawar",           gName:"Swati Khan",        gPhone:"+92-91-5845670", gEmail:"swati.khan@example.com",      admNo:"PFGS-2025-007", roll:"07" },
    { id:"std-pk-096", orgId:"org-pk-5", name:"Naila Durrani",                className:"Grade 7",  section:"Section B", gender:"Female", dob:"2013-07-04", addr:"Shami Road, Peshawar",            gName:"Durrani Agha",      gPhone:"+92-91-5842345", gEmail:"durrani.agha@example.com",    admNo:"PFGS-2025-008", roll:"08" },
    { id:"std-pk-097", orgId:"org-pk-5", name:"Faisal Bangash",               className:"Grade 6",  section:"Section A", gender:"Male",   dob:"2014-05-30", addr:"Saddar, Peshawar",               gName:"Bangash Khan",      gPhone:"+92-91-5846789", gEmail:"bangash.khan@example.com",    admNo:"PFGS-2025-009", roll:"09" },
    { id:"std-pk-098", orgId:"org-pk-5", name:"Sameena Akhund",               className:"Grade 6",  section:"Section A", gender:"Female", dob:"2014-10-16", addr:"Hayatabad Phase 1, Peshawar",     gName:"Akhund Mian",       gPhone:"+92-91-5844012", gEmail:"akhund.mian@example.com",     admNo:"PFGS-2025-010", roll:"10" },
    { id:"std-pk-099", orgId:"org-pk-5", name:"Arshad Orakzai",               className:"Grade 5",  section:"Section A", gender:"Male",   dob:"2015-03-09", addr:"Phase 5, Hayatabad, Peshawar",    gName:"Orakzai Khan",      gPhone:"+92-91-5847012", gEmail:"orakzai.khan@example.com",    admNo:"PFGS-2025-011", roll:"11" },
    { id:"std-pk-100", orgId:"org-pk-5", name:"Tahira Khattak",               className:"Grade 5",  section:"Section B", gender:"Female", dob:"2015-08-24", addr:"University Road, Peshawar",       gName:"Khattak Agha",      gPhone:"+92-91-5844345", gEmail:"khattak.agha@example.com",    admNo:"PFGS-2025-012", roll:"12" },
    { id:"std-pk-101", orgId:"org-pk-5", name:"Mazhar Mardan",                className:"Grade 4",  section:"Section A", gender:"Male",   dob:"2016-01-15", addr:"Pishtakhara, Peshawar",           gName:"Mardan Khan",       gPhone:"+92-91-5841678", gEmail:"mardan.khan@example.com",     admNo:"PFGS-2025-013", roll:"13" },
    { id:"std-pk-102", orgId:"org-pk-5", name:"Aroha Barakzai",               className:"Grade 4",  section:"Section A", gender:"Female", dob:"2016-06-28", addr:"Circular Road, Peshawar",         gName:"Barakzai Sahib",    gPhone:"+92-91-5845012", gEmail:"barakzai.sahib@example.com",  admNo:"PFGS-2025-014", roll:"14" },
    { id:"std-pk-103", orgId:"org-pk-5", name:"Imad Ul Islam",                className:"Grade 3",  section:"Section A", gender:"Male",   dob:"2017-04-09", addr:"Khyber Bazar, Peshawar",          gName:"Islam Khan",        gPhone:"+92-91-5848345", gEmail:"islam.khan@example.com",      admNo:"PFGS-2025-015", roll:"15" },
    { id:"std-pk-104", orgId:"org-pk-5", name:"Shaista Afridi",               className:"Grade 3",  section:"Section B", gender:"Female", dob:"2017-09-22", addr:"Warsak Road, Peshawar",           gName:"Afridi Khanan",     gPhone:"+92-91-5842678", gEmail:"afridi.khanan@example.com",   admNo:"PFGS-2025-016", roll:"16" },
    { id:"std-pk-105", orgId:"org-pk-5", name:"Abubakar Swati",               className:"Grade 2",  section:"Section A", gender:"Male",   dob:"2018-05-13", addr:"Gulberg, Peshawar",               gName:"Swati Agha",        gPhone:"+92-91-5846012", gEmail:"swati.agha@example.com",      admNo:"PFGS-2025-017", roll:"17" },
    { id:"std-pk-106", orgId:"org-pk-5", name:"Binish Yousafzai",             className:"Grade 2",  section:"Section A", gender:"Female", dob:"2018-11-01", addr:"Hayatabad, Peshawar",             gName:"Yousafzai Agha",    gPhone:"+92-91-5843678", gEmail:"yousafzai.agha@example.com",  admNo:"PFGS-2025-018", roll:"18" },
    { id:"std-pk-107", orgId:"org-pk-5", name:"Waleed Khan",                  className:"Grade 1",  section:"Section A", gender:"Male",   dob:"2019-06-25", addr:"Cantonment, Peshawar",            gName:"Khan Lashkar",      gPhone:"+92-91-5847345", gEmail:"khan.lashkar@example.com",    admNo:"PFGS-2025-019", roll:"19" },
    { id:"std-pk-108", orgId:"org-pk-5", name:"Rida Mohmand",                 className:"Grade 1",  section:"Section A", gender:"Female", dob:"2019-12-18", addr:"Pishtakhara, Peshawar",           gName:"Mohmand Khan",      gPhone:"+92-91-5844678", gEmail:"mohmand.khan@example.com",    admNo:"PFGS-2025-020", roll:"20" },
    { id:"std-pk-109", orgId:"org-pk-5", name:"Hamza Shinwari",               className:"KG",       section:"Section A", gender:"Male",   dob:"2020-07-30", addr:"Saddar, Peshawar",               gName:"Shinwari Lashkar",  gPhone:"+92-91-5848012", gEmail:"shinwari.lashkar@example.com",admNo:"PFGS-2025-021", roll:"21" },
    { id:"std-pk-110", orgId:"org-pk-5", name:"Sabahat Khattak",              className:"Nursery",  section:"Section A", gender:"Female", dob:"2021-03-14", addr:"Ring Road, Peshawar",             gName:"Khattak Lashkar",   gPhone:"+92-91-5845345", gEmail:"khattak.lashkar@example.com", admNo:"PFGS-2025-022", roll:"22" },
  ];

  // Build student records and their parent user accounts
  const students: Student[] = [];
  const parentUsers: User[] = [];
  const parentUserIds = new Set<string>();

  studentDefs.forEach(def => {
    students.push({
      id: def.id,
      organizationId: def.orgId,
      userId: `usr-std-${def.id}`,
      name: def.name,
      admissionNo: def.admNo,
      rollNo: def.roll,
      className: def.className,
      sectionName: def.section,
      guardianName: def.gName,
      guardianPhone: def.gPhone,
      guardianEmail: def.gEmail,
      medicalRecords: "No known conditions.",
      behaviorScore: 75 + Math.floor(Math.random() * 25),
      attendanceRate: 75 + Math.random() * 23,
      status: "Active",
      admissionDate: "2025-04-01",
      dob: def.dob,
      gender: def.gender,
      address: def.addr
    });

    // Student login account
    users.push({
      id: `usr-std-${def.id}`,
      organizationId: def.orgId,
      email: `${def.name.toLowerCase().replace(/ /g, ".")}@student.example.com`,
      username: def.name.toLowerCase().replace(/ /g, "."),
      password: hStudent,
      role: UserRole.STUDENT,
      name: def.name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(def.name)}`,
      status: "Active"
    } as User);

    // Parent account (one per guardian email, avoid duplicates)
    const parentId = `usr-par-${def.id}`;
    if (!parentUserIds.has(def.gEmail)) {
      parentUserIds.add(def.gEmail);
      parentUsers.push({
        id: parentId,
        organizationId: def.orgId,
        email: def.gEmail,
        username: def.gEmail.split("@")[0],
        password: hParent,
        role: UserRole.PARENT,
        name: def.gName,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(def.gName)}`,
        status: "Active"
      } as User);
    }
  });

  users.push(...parentUsers);

  // ----------------------------------------------------------
  // TEACHERS
  // ----------------------------------------------------------
  const teachers: Teacher[] = [
    // org-pk-1
    { id:"tch-pk-1", organizationId:"org-pk-1", userId:"usr-tch-pk1", name:"Muhammad Imran",     employeeId:"ANMS-TCH-001", department:"Mathematics",         qualification:"M.Sc. Mathematics",           designation:"Senior Maths Teacher",     phone:"+92-300-4412234", email:"m.imran@alnoor.edu.pk",        salary:55000,  classesAssigned:["Grade 5","Grade 6","Grade 7"],       subjectsAssigned:["Mathematics"] },
    { id:"tch-pk-2", organizationId:"org-pk-1", userId:"usr-tch-pk2", name:"Fatima Bibi",          employeeId:"ANMS-TCH-002", department:"Languages",           qualification:"M.A. Urdu Literature",        designation:"Head of Urdu",             phone:"+92-321-5523341", email:"fatima.bibi@alnoor.edu.pk",    salary:50000,  classesAssigned:["Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"], subjectsAssigned:["Urdu","Islamiat"] },
    { id:"tch-pk-3", organizationId:"org-pk-1", userId:"usr-tch-pk3", name:"Asad Raza Khan",       employeeId:"ANMS-TCH-003", department:"Science",             qualification:"M.Sc. Chemistry",             designation:"Science Department Head",  phone:"+92-333-7712345", email:"asad.raza@alnoor.edu.pk",      salary:60000,  classesAssigned:["Grade 6","Grade 7","Grade 8","Grade 9"], subjectsAssigned:["General Science","Chemistry"] },
    { id:"tch-pk-4", organizationId:"org-pk-1", userId:"usr-tch-pk4", name:"Saima Javed",           employeeId:"ANMS-TCH-004", department:"English",             qualification:"M.A. English",                designation:"Senior English Teacher",   phone:"+92-300-9918877", email:"saima.javed@alnoor.edu.pk",    salary:52000,  classesAssigned:["Grade 9","Grade 10"],                subjectsAssigned:["English","Pakistan Studies"] },
    // org-pk-2
    { id:"tch-pk-5", organizationId:"org-pk-2", userId:"usr-tch-pk5", name:"Tariq Ullah Baig",     employeeId:"QAPS-TCH-001", department:"Mathematics",         qualification:"M.Phil Mathematics",          designation:"Head of Mathematics",      phone:"+92-51-2345678",  email:"tariq.baig@qaps.edu.pk",       salary:75000,  classesAssigned:["Grade 8","Grade 9","Grade 10"],      subjectsAssigned:["Mathematics","Statistics"] },
    { id:"tch-pk-6", organizationId:"org-pk-2", userId:"usr-tch-pk6", name:"Hina Shah",             employeeId:"QAPS-TCH-002", department:"English",             qualification:"B.Ed. English",               designation:"English Teacher",          phone:"+92-51-3456789",  email:"hina.shah@qaps.edu.pk",        salary:60000,  classesAssigned:["Grade 5","Grade 6","Grade 7"],       subjectsAssigned:["English"] },
    { id:"tch-pk-7", organizationId:"org-pk-2", userId:"usr-tch-pk7", name:"Bilal Nawaz",           employeeId:"QAPS-TCH-003", department:"Computer Science",    qualification:"B.Sc. CS",                    designation:"Computer Science Teacher", phone:"+92-300-3456789", email:"bilal.nawaz@qaps.edu.pk",      salary:65000,  classesAssigned:["Grade 7","Grade 8","Grade 9","Grade 10"], subjectsAssigned:["Computer Science"] },
    { id:"tch-pk-8", organizationId:"org-pk-2", userId:"usr-tch-pk8", name:"Nadia Islam",           employeeId:"QAPS-TCH-004", department:"Biology",             qualification:"M.Sc. Biology",               designation:"Biology & Science Teacher",phone:"+92-321-2341234", email:"nadia.islam@qaps.edu.pk",      salary:68000,  classesAssigned:["Grade 8","Grade 9","Grade 10"],      subjectsAssigned:["Biology","General Science"] },
    // org-pk-3
    { id:"tch-pk-9", organizationId:"org-pk-3", userId:"usr-tch-pk9", name:"Saleem Baloch",         employeeId:"BSA-TCH-001",  department:"Languages",           qualification:"M.A. Urdu",                   designation:"Urdu Teacher",             phone:"+92-81-2841001",  email:"saleem.baloch@bsa.edu.pk",     salary:40000,  classesAssigned:["Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"], subjectsAssigned:["Urdu","Islamiat"] },
    { id:"tch-pk-10",organizationId:"org-pk-3", userId:"usr-tch-pk10",name:"Rukhsana Akhtar",       employeeId:"BSA-TCH-002",  department:"English",             qualification:"B.Ed.",                       designation:"English Teacher",          phone:"+92-81-2845678",  email:"rukhsana@bsa.edu.pk",          salary:38000,  classesAssigned:["Grade 5","Grade 6","Grade 7","Grade 8"],  subjectsAssigned:["English"] },
    { id:"tch-pk-11",organizationId:"org-pk-3", userId:"usr-tch-pk11",name:"Sajid Ullah Mengal",    employeeId:"BSA-TCH-003",  department:"Science",             qualification:"B.Sc.",                       designation:"Science Teacher",          phone:"+92-81-2849012",  email:"sajid.mengal@bsa.edu.pk",      salary:42000,  classesAssigned:["Grade 7","Grade 8","Grade 9"],       subjectsAssigned:["General Science","Physics"] },
    { id:"tch-pk-12",organizationId:"org-pk-3", userId:"usr-tch-pk12",name:"Raheem Dashti",          employeeId:"BSA-TCH-004",  department:"Mathematics",         qualification:"M.Sc. Mathematics",           designation:"Mathematics Teacher",      phone:"+92-81-2843456",  email:"raheem.dashti@bsa.edu.pk",     salary:41000,  classesAssigned:["Grade 6","Grade 7","Grade 8","Grade 9"], subjectsAssigned:["Mathematics"] },
    // org-pk-4
    { id:"tch-pk-13",organizationId:"org-pk-4", userId:"usr-tch-pk13",name:"Mohsin Ali Mirza",      employeeId:"TCS-TCH-001",  department:"Languages",           qualification:"M.A. Urdu",                   designation:"Urdu Department Head",     phone:"+92-21-3561001",  email:"mohsin.mirza@crescentschool.edu.pk", salary:62000, classesAssigned:["Grade 5","Grade 6","Grade 7","Grade 8"], subjectsAssigned:["Urdu","Pakistan Studies"] },
    { id:"tch-pk-14",organizationId:"org-pk-4", userId:"usr-tch-pk14",name:"Sadia Anwar",           employeeId:"TCS-TCH-002",  department:"Mathematics",         qualification:"M.Sc. Mathematics",           designation:"Head of Mathematics",      phone:"+92-21-3565678",  email:"sadia.anwar@crescentschool.edu.pk",  salary:70000, classesAssigned:["Grade 9","Grade 10"],                subjectsAssigned:["Mathematics"] },
    { id:"tch-pk-15",organizationId:"org-pk-4", userId:"usr-tch-pk15",name:"Jawad Hussain",          employeeId:"TCS-TCH-003",  department:"Physics",             qualification:"M.Sc. Physics",               designation:"Physics Teacher",          phone:"+92-21-3569012",  email:"jawad.hussain@crescentschool.edu.pk",salary:68000, classesAssigned:["Grade 9","Grade 10"],                subjectsAssigned:["Physics"] },
    { id:"tch-pk-16",organizationId:"org-pk-4", userId:"usr-tch-pk16",name:"Amna Siddiqui",          employeeId:"TCS-TCH-004",  department:"Chemistry",           qualification:"M.Sc. Chemistry",             designation:"Chemistry Teacher",        phone:"+92-21-3563456",  email:"amna.siddiqui@crescentschool.edu.pk",salary:67000,classesAssigned:["Grade 9","Grade 10"],                subjectsAssigned:["Chemistry","Biology"] },
    // org-pk-5
    { id:"tch-pk-17",organizationId:"org-pk-5", userId:"usr-tch-pk17",name:"Irfan Yousaf",           employeeId:"PFGS-TCH-001", department:"Science",             qualification:"B.Sc. Biology",               designation:"Science Teacher",          phone:"+92-91-5844001",  email:"irfan.yousaf@pfgs.edu.pk",     salary:43000,  classesAssigned:["Grade 5","Grade 6","Grade 7","Grade 8"], subjectsAssigned:["General Science","Biology"] },
    { id:"tch-pk-18",organizationId:"org-pk-5", userId:"usr-tch-pk18",name:"Rabia Khattak",          employeeId:"PFGS-TCH-002", department:"English",             qualification:"M.A. English",                designation:"English Teacher",          phone:"+92-91-5845678",  email:"rabia.khattak@pfgs.edu.pk",    salary:45000,  classesAssigned:["Grade 5","Grade 6","Grade 7"],       subjectsAssigned:["English"] },
    { id:"tch-pk-19",organizationId:"org-pk-5", userId:"usr-tch-pk19",name:"Naeem Ullah Khan",       employeeId:"PFGS-TCH-003", department:"Islamic Studies",      qualification:"M.A. Islamiat",               designation:"Islamiat & Pak Studies",   phone:"+92-91-5849012",  email:"naeem.khan@pfgs.edu.pk",       salary:40000,  classesAssigned:["Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"], subjectsAssigned:["Islamiat","Pakistan Studies"] },
    { id:"tch-pk-20",organizationId:"org-pk-5", userId:"usr-tch-pk20",name:"Bashir Ahmad",            employeeId:"PFGS-TCH-004", department:"Mathematics",         qualification:"M.Sc. Mathematics",           designation:"Senior Maths Teacher",     phone:"+92-91-5843456",  email:"bashir.ahmad@pfgs.edu.pk",     salary:48000,  classesAssigned:["Grade 8","Grade 9","Grade 10"],      subjectsAssigned:["Mathematics"] },
  ];

  // ----------------------------------------------------------
  // ATTENDANCE (30 school days × 110 students = 3,300 records)
  // Academic year starts April 1, 2025
  // ----------------------------------------------------------
  const schoolDays = dateRange("2025-04-01", 30);
  const attendance: AttendanceRecord[] = [];

  studentDefs.forEach(def => {
    schoolDays.forEach((date, i) => {
      attendance.push({
        id: `att-${def.id}-${i}`,
        organizationId: def.orgId,
        studentId: def.id,
        studentName: def.name,
        className: def.className,
        sectionName: def.section,
        date,
        status: weightedStatus()
      });
    });
  });

  // ----------------------------------------------------------
  // EXAMS (3 periods × subjects × classes = multi-school)
  // ----------------------------------------------------------
  type ExamDef = { id: string; orgId: string; className: string; subject: string; title: string; maxMarks: number; date: string; };
  const examDefs: ExamDef[] = [];

  // Generate exams for each school's main classes
  const schoolExamConfig: Array<{orgId: string; classes: string[]; subjects: string[]}> = [
    { orgId:"org-pk-1", classes:["Grade 9","Grade 10"], subjects:["English","Urdu","Mathematics","General Science","Islamiat"] },
    { orgId:"org-pk-2", classes:["Grade 9","Grade 10"], subjects:["English","Mathematics","Computer Science","Biology","Islamiat"] },
    { orgId:"org-pk-3", classes:["Grade 8","Grade 9"],  subjects:["English","Urdu","Mathematics","General Science","Islamiat"] },
    { orgId:"org-pk-4", classes:["Grade 9","Grade 10"], subjects:["English","Mathematics","Physics","Chemistry","Islamiat"] },
    { orgId:"org-pk-5", classes:["Grade 8","Grade 9"],  subjects:["English","Mathematics","General Science","Islamiat","Pakistan Studies"] },
  ];

  const examPeriods = [
    { name:"Monthly Test", date:"2025-05-15", maxMarks:30 },
    { name:"Mid-Term Examination", date:"2025-07-20", maxMarks:50 },
    { name:"Final Examination", date:"2025-10-15", maxMarks:100 }
  ];

  let examIdx = 0;
  schoolExamConfig.forEach(cfg => {
    cfg.classes.forEach(cls => {
      cfg.subjects.forEach(subj => {
        examPeriods.forEach(period => {
          examDefs.push({
            id: `ex-pk-${++examIdx}`,
            orgId: cfg.orgId,
            className: cls,
            subject: subj,
            title: `${period.name} - ${subj}`,
            maxMarks: period.maxMarks,
            date: period.date
          });
        });
      });
    });
  });

  const exams: Exam[] = examDefs.map(e => ({
    id: e.id,
    organizationId: e.orgId,
    className: e.className,
    subject: e.subject,
    title: e.title,
    maxMarks: e.maxMarks,
    date: e.date,
    status: new Date(e.date) < new Date() ? "Graded" : "Scheduled"
  }));

  // ----------------------------------------------------------
  // RESULTS (for graded exams)
  // ----------------------------------------------------------
  const results: Result[] = [];
  let resIdx = 0;

  examDefs.forEach(examDef => {
    if (new Date(examDef.date) >= new Date()) return; // skip future
    const classStudents = studentDefs.filter(s => s.orgId === examDef.orgId && s.className === examDef.className);
    classStudents.forEach(def => {
      // Realistic marks between 35-95% of maxMarks
      const pct = 35 + Math.floor(Math.random() * 60);
      const marks = Math.round((pct / 100) * examDef.maxMarks);
      results.push({
        id: `res-pk-${++resIdx}`,
        organizationId: examDef.orgId,
        examId: examDef.id,
        examTitle: examDef.title,
        subject: examDef.subject,
        studentId: def.id,
        studentName: def.name,
        marksObtained: marks,
        maxMarks: examDef.maxMarks,
        grade: grade(pct),
        comments: pct >= 80 ? "Excellent performance!" : pct >= 60 ? "Good effort, continue practicing." : "Needs improvement. Extra sessions recommended."
      });
    });
  });

  // ----------------------------------------------------------
  // FEE INVOICES (PKR)
  // ----------------------------------------------------------
  const invoices: FeeInvoice[] = [];
  let invIdx = 0;

  studentDefs.forEach(def => {
    const monthly = pkrTuition(def.className);
    // April + May 2025 tuition
    ["2025-04-30","2025-05-31"].forEach((due, mi) => {
      const paid = Math.random() > 0.25; // 75% paid
      const partial = !paid && Math.random() > 0.5;
      invIdx++;
      invoices.push({
        id: `inv-pk-${invIdx}`,
        organizationId: def.orgId,
        studentId: def.id,
        studentName: def.name,
        className: def.className,
        title: `Monthly Tuition Fee - ${mi === 0 ? "April" : "May"} 2025`,
        amount: monthly,
        fine: 0,
        discount: 0,
        paidAmount: paid ? monthly : partial ? Math.round(monthly * 0.5) : 0,
        dueDate: due,
        status: paid ? "Paid" : partial ? "Partially Paid" : new Date(due) < new Date() ? "Overdue" : "Unpaid",
        paymentMethod: paid ? "Bank Transfer" : undefined,
        payDate: paid ? due : undefined
      });
    });

    // Exam fee
    invIdx++;
    const examPaid = Math.random() > 0.2;
    invoices.push({
      id: `inv-pk-${invIdx}`,
      organizationId: def.orgId,
      studentId: def.id,
      studentName: def.name,
      className: def.className,
      title: "Mid-Term Examination Fee",
      amount: 2500,
      fine: 0,
      discount: 0,
      paidAmount: examPaid ? 2500 : 0,
      dueDate: "2025-07-10",
      status: examPaid ? "Paid" : "Overdue",
      paymentMethod: examPaid ? "Cash" : undefined,
      payDate: examPaid ? "2025-07-08" : undefined
    });
  });

  // ----------------------------------------------------------
  // HOMEWORK
  // ----------------------------------------------------------
  const homework: Homework[] = [
    { id:"hw-pk-1", organizationId:"org-pk-1", className:"Grade 10", subject:"Mathematics", title:"Algebra: Quadratic Equations Practice", description:"Solve exercises 5.1 to 5.10 from Chapter 5 of Punjab Textbook Board Mathematics Grade 10. Show all working.", dueDate:"2025-05-20", createdByName:"Muhammad Imran" },
    { id:"hw-pk-2", organizationId:"org-pk-1", className:"Grade 10", subject:"Urdu", title:"مضمون: محنت کی اہمیت", description:"تین سو الفاظ میں محنت کی اہمیت پر مضمون لکھیں اور خطاطی کا خیال رکھیں۔", dueDate:"2025-05-22", createdByName:"Fatima Bibi" },
    { id:"hw-pk-3", organizationId:"org-pk-1", className:"Grade 9",  subject:"General Science", title:"Living Things: Cell Structure Diagram", description:"Draw and label a plant cell and an animal cell. Include all major organelles from Chapter 2.", dueDate:"2025-05-21", createdByName:"Asad Raza Khan" },
    { id:"hw-pk-4", organizationId:"org-pk-2", className:"Grade 10", subject:"Computer Science", title:"HTML & CSS: Build a Personal Profile Page", description:"Create a simple webpage with your name, photo, hobbies, and achievements using HTML5 and CSS3. Upload to classroom portal.", dueDate:"2025-05-23", createdByName:"Bilal Nawaz" },
    { id:"hw-pk-5", organizationId:"org-pk-2", className:"Grade 9",  subject:"Biology", title:"Photosynthesis Experiment Report", description:"Write a one-page lab report for the leaf chromatography experiment. Include materials, method, observations, and conclusion.", dueDate:"2025-05-24", createdByName:"Nadia Islam" },
    { id:"hw-pk-6", organizationId:"org-pk-3", className:"Grade 9",  subject:"Mathematics", title:"Mensuration: Areas and Volumes", description:"Solve all questions from Exercise 12.3 (Areas of Irregular Shapes) and 12.4 (Surface Areas of Cylinders) from the BSE Maths textbook.", dueDate:"2025-05-25", createdByName:"Raheem Dashti" },
    { id:"hw-pk-7", organizationId:"org-pk-4", className:"Grade 10", subject:"Physics", title:"Laws of Motion: Numericals", description:"Solve the 20 numerical problems from Chapter 3 Laws of Motion (Sindh Textbook Board, Grade 10). Show all formulae and unit analysis.", dueDate:"2025-05-26", createdByName:"Jawad Hussain" },
    { id:"hw-pk-8", organizationId:"org-pk-4", className:"Grade 10", subject:"Chemistry", title:"Organic Compounds: Functional Groups Chart", description:"Prepare a detailed chart of all organic functional groups from Chapter 11. Include structure, example compound and use.", dueDate:"2025-05-27", createdByName:"Amna Siddiqui" },
    { id:"hw-pk-9", organizationId:"org-pk-5", className:"Grade 9",  subject:"Islamiat", title:"سیرت النبی ﷺ: اخلاق حسنہ", description:"حضور اکرم ﷺ کے اخلاق و کردار پر پانچ مثالیں قرآن و حدیث کے حوالے کے ساتھ لکھیں۔", dueDate:"2025-05-28", createdByName:"Naeem Ullah Khan" },
    { id:"hw-pk-10",organizationId:"org-pk-5", className:"Grade 8",  subject:"English", title:"Comprehension Passage & Summary Writing", description:"Read the given passage 'The Indus River' and answer all comprehension questions. Write a 150-word summary in your own words.", dueDate:"2025-05-29", createdByName:"Rabia Khattak" },
  ];

  // ----------------------------------------------------------
  // NOTICES
  // ----------------------------------------------------------
  const notices: Notice[] = [
    { id:"not-pk-1", organizationId:"org-pk-1", title:"Annual Prize Distribution Ceremony – 2025", content:"Al-Noor Model School is pleased to announce the Annual Prize Distribution Ceremony on June 15, 2025 at 10:00 AM. All parents are cordially invited. Students are requested to wear their official school uniform.", targetRole:"All",      date:"2025-05-10", author:"Dr. Arif Mehmood" },
    { id:"not-pk-2", organizationId:"org-pk-1", title:"Mid-Term Examination Schedule Released",    content:"The Mid-Term Examination schedule for classes Grade 5 to Grade 10 has been posted on the noticeboard and EduSphere portal. Examinations begin July 20, 2025. Students are advised to begin preparation immediately.", targetRole:"All",      date:"2025-05-12", author:"Dr. Arif Mehmood" },
    { id:"not-pk-3", organizationId:"org-pk-1", title:"Fee Submission Deadline – May 2025",        content:"All outstanding monthly tuition and examination fees must be submitted by May 31, 2025. Late payments will incur a PKR 500 fine per month. Kindly contact the accounts office for any payment issues.", targetRole:"Parents",  date:"2025-05-15", author:"Khalid Mehmood" },
    { id:"not-pk-4", organizationId:"org-pk-2", title:"Pakistan Day Celebration – March 23",       content:"Quaid-e-Azam Public School will hold a special Pakistan Day celebration on March 23. Students of Grade 8 and above will participate in a speech competition on the topic 'Quaid's Vision for Pakistan'. Entries due March 20.", targetRole:"All",      date:"2025-05-11", author:"Mrs. Zara Ahmed" },
    { id:"not-pk-5", organizationId:"org-pk-2", title:"Computer Lab Upgrade – Student Notice",     content:"The Computer Science Lab is being upgraded with 30 new workstations. The lab will remain closed from May 20–25, 2025. Computer Science classes will be held in the Audio Visual Room during this period.", targetRole:"Students", date:"2025-05-14", author:"Bilal Nawaz" },
    { id:"not-pk-6", organizationId:"org-pk-3", title:"Result Cards – April Monthly Test",         content:"Result cards for the April Monthly Test have been prepared. Parents are requested to collect them from the school office between May 12–20, 2025 on any working day (9 AM – 1 PM). Please bring your CNIC.", targetRole:"Parents",  date:"2025-05-12", author:"Prof. Abdul Qadir" },
    { id:"not-pk-7", organizationId:"org-pk-4", title:"Inter-School Science Olympiad",             content:"The Crescent School is proud to represent Karachi in the National Science Olympiad 2025. Students of Grade 9-10 interested in Physics, Chemistry and Biology competitions should register by May 25. Selection test on May 27.", targetRole:"All",      date:"2025-05-13", author:"Dr. Naila Farooqi" },
    { id:"not-pk-8", organizationId:"org-pk-5", title:"Eid Holidays & School Reopening",           content:"The school will remain closed for Eid-ul-Adha from June 15–19, 2025. Classes will resume on June 20, 2025 (Thursday). All students are required to bring their holiday homework completed on the first day back.", targetRole:"All",      date:"2025-05-13", author:"Babar Khan" },
  ];

  // ----------------------------------------------------------
  // EVENTS
  // ----------------------------------------------------------
  const events: SchoolEvent[] = [
    { id:"ev-pk-1", organizationId:"org-pk-1", title:"Science Fair 2025",              description:"Annual Science Fair at Al-Noor Model School. Projects on AI, environment, and renewable energy. Open to Grade 6-10.", date:"2025-06-10", type:"academic" },
    { id:"ev-pk-2", organizationId:"org-pk-1", title:"Urdu Calligraphy Competition",   description:"Inter-class Urdu Khushnavisi competition for all students. Prizes in 3 categories.", date:"2025-05-28", type:"cultural" },
    { id:"ev-pk-3", organizationId:"org-pk-2", title:"Quaid's Birthday Celebration",   description:"Tribute event honoring the Quaid-e-Azam on his birth anniversary. Poetry and speeches.", date:"2025-12-25", type:"cultural" },
    { id:"ev-pk-4", organizationId:"org-pk-2", title:"Inter-School Cricket Tournament", description:"QAPS hosts the annual cricket gala. 8 schools participating. Finals on June 7.", date:"2025-06-01", type:"sports" },
    { id:"ev-pk-5", organizationId:"org-pk-3", title:"National Day Assembly",           description:"Balochistan Scholars Academy celebrates Pakistan Resolution Day with tableaux and recitations.", date:"2025-03-23", type:"cultural" },
    { id:"ev-pk-6", organizationId:"org-pk-4", title:"Parents & Teachers Meeting",      description:"PTM for all classes. Parents are invited to discuss academic progress with teachers.", date:"2025-06-05", type:"academic" },
    { id:"ev-pk-7", organizationId:"org-pk-5", title:"KPK Junior Olympiad",             description:"Pak Future Grammar School sends 5 student teams to the KPK Mathematics Olympiad.", date:"2025-06-12", type:"academic" },
  ];

  // ----------------------------------------------------------
  // LIBRARY BOOKS (Pakistani curriculum)
  // ----------------------------------------------------------
  const books: LibraryBook[] = [
    { id:"bk-pk-1",  organizationId:"org-pk-1", title:"PTB Mathematics Grade 10",                  author:"Punjab Textbook Board",         isbn:"978-969-00-0100-1", category:"Mathematics",        totalCopies:15, availableCopies:9  },
    { id:"bk-pk-2",  organizationId:"org-pk-1", title:"PTB Biology Grade 10",                      author:"Punjab Textbook Board",         isbn:"978-969-00-0102-5", category:"Biology",            totalCopies:12, availableCopies:7  },
    { id:"bk-pk-3",  organizationId:"org-pk-1", title:"Urdu Lazmi Grade 9",                        author:"Punjab Textbook Board",         isbn:"978-969-00-0104-9", category:"Urdu / Languages",   totalCopies:20, availableCopies:14 },
    { id:"bk-pk-4",  organizationId:"org-pk-1", title:"Taleem ul Islam (Islamiat)",                author:"Mufti Abdur Rahman",             isbn:"978-969-35-1234-5", category:"Islamiat",           totalCopies:10, availableCopies:6  },
    { id:"bk-pk-5",  organizationId:"org-pk-1", title:"Pakistan Affairs – Comprehensive Notes",   author:"Ikram Rabbani",                  isbn:"978-969-35-4562-1", category:"Pakistan Studies",   totalCopies:8,  availableCopies:5  },
    { id:"bk-pk-6",  organizationId:"org-pk-2", title:"Federal Board Chemistry Grade 10",          author:"FBISE",                          isbn:"978-969-00-0202-2", category:"Chemistry",          totalCopies:12, availableCopies:8  },
    { id:"bk-pk-7",  organizationId:"org-pk-2", title:"Computer Science Textbook Grade 9",        author:"FBISE",                          isbn:"978-969-00-0204-6", category:"Computer Science",   totalCopies:20, availableCopies:15 },
    { id:"bk-pk-8",  organizationId:"org-pk-2", title:"English Grammar in Use (Intermediate)",    author:"Raymond Murphy",                  isbn:"978-052-176-580-0", category:"English",            totalCopies:6,  availableCopies:3  },
    { id:"bk-pk-9",  organizationId:"org-pk-3", title:"BSE Science Grade 8",                       author:"Balochistan SE Board",          isbn:"978-969-00-0302-9", category:"General Science",    totalCopies:15, availableCopies:11 },
    { id:"bk-pk-10", organizationId:"org-pk-3", title:"Muashra aur Islam",                         author:"BECS",                          isbn:"978-969-00-0304-3", category:"Islamiat",           totalCopies:8,  availableCopies:5  },
    { id:"bk-pk-11", organizationId:"org-pk-4", title:"Sindh Textbook Physics Grade 10",           author:"Sindh Textbook Board",          isbn:"978-969-00-0402-6", category:"Physics",            totalCopies:14, availableCopies:9  },
    { id:"bk-pk-12", organizationId:"org-pk-4", title:"Sindh Textbook Chemistry Grade 10",         author:"Sindh Textbook Board",          isbn:"978-969-00-0404-0", category:"Chemistry",          totalCopies:14, availableCopies:7  },
    { id:"bk-pk-13", organizationId:"org-pk-5", title:"KPK Mathematics Grade 9",                   author:"KPK Textbook Board",            isbn:"978-969-00-0502-3", category:"Mathematics",        totalCopies:12, availableCopies:8  },
    { id:"bk-pk-14", organizationId:"org-pk-5", title:"Pakistan Studies – KPK Board",              author:"KPK Textbook Board",            isbn:"978-969-00-0504-7", category:"Pakistan Studies",   totalCopies:10, availableCopies:6  },
  ];

  // ----------------------------------------------------------
  // TRANSPORT ROUTES
  // ----------------------------------------------------------
  const routes: TransportRoute[] = [
    { id:"rt-pk-1", organizationId:"org-pk-1", routeName:"Route 1 – Model Town / Gulberg",  vehicleNo:"LEA-1234", driverName:"Muhammad Hanif",  driverPhone:"+92-300-4450000", fee:2500 },
    { id:"rt-pk-2", organizationId:"org-pk-1", routeName:"Route 2 – Johar Town / DHA",      vehicleNo:"LEA-5678", driverName:"Rana Tariq",      driverPhone:"+92-321-4460000", fee:2800 },
    { id:"rt-pk-3", organizationId:"org-pk-2", routeName:"Route A – F-7 / F-8 / G-10",      vehicleNo:"ISD-2345", driverName:"Shahzad Ahmad",   driverPhone:"+92-51-2342345",  fee:3000 },
    { id:"rt-pk-4", organizationId:"org-pk-2", routeName:"Route B – E-11 / I-8 / H-9",      vehicleNo:"ISD-6789", driverName:"Javed Iqbal",     driverPhone:"+92-51-2346789",  fee:2800 },
    { id:"rt-pk-5", organizationId:"org-pk-3", routeName:"Route Q1 – Zarghoon / Sariab",    vehicleNo:"QTT-3456", driverName:"Gul Muhammad",    driverPhone:"+92-81-2843456",  fee:2000 },
    { id:"rt-pk-6", organizationId:"org-pk-4", routeName:"Route K1 – Gulshan / PECHS",      vehicleNo:"KHI-4567", driverName:"Anwar Hussain",   driverPhone:"+92-21-3565670",  fee:2500 },
    { id:"rt-pk-7", organizationId:"org-pk-4", routeName:"Route K2 – Nazimabad / FB Area",  vehicleNo:"KHI-8901", driverName:"Saleem Khan",     driverPhone:"+92-21-3569870",  fee:2200 },
    { id:"rt-pk-8", organizationId:"org-pk-5", routeName:"Route P1 – Hayatabad / Saddar",   vehicleNo:"PSW-5678", driverName:"Bashir Pasha",    driverPhone:"+92-91-5847890",  fee:2200 },
  ];

  // ----------------------------------------------------------
  // HOSTEL ROOMS
  // ----------------------------------------------------------
  const rooms: HostelRoom[] = [
    { id:"rm-pk-1", organizationId:"org-pk-1", roomNo:"G-101", type:"Double",    totalBeds:2, availableBeds:1, fee:8000 },
    { id:"rm-pk-2", organizationId:"org-pk-1", roomNo:"G-102", type:"Single",    totalBeds:1, availableBeds:0, fee:12000 },
    { id:"rm-pk-3", organizationId:"org-pk-2", roomNo:"H-201", type:"Single",    totalBeds:1, availableBeds:1, fee:15000 },
    { id:"rm-pk-4", organizationId:"org-pk-2", roomNo:"H-202", type:"Dormitory", totalBeds:6, availableBeds:2, fee:6000 },
    { id:"rm-pk-5", organizationId:"org-pk-3", roomNo:"B-101", type:"Double",    totalBeds:2, availableBeds:2, fee:6000 },
    { id:"rm-pk-6", organizationId:"org-pk-4", roomNo:"C-301", type:"Single",    totalBeds:1, availableBeds:0, fee:14000 },
    { id:"rm-pk-7", organizationId:"org-pk-5", roomNo:"P-101", type:"Double",    totalBeds:2, availableBeds:1, fee:7000 },
  ];

  // ----------------------------------------------------------
  // EXPENSES (PKR)
  // ----------------------------------------------------------
  const expenses: ExpenseRecord[] = [
    { id:"exp-pk-1", organizationId:"org-pk-1", title:"Janitorial Staff Salaries – April 2025",     category:"Salary",      amount:45000,  date:"2025-04-30", status:"Approved" },
    { id:"exp-pk-2", organizationId:"org-pk-1", title:"Science Lab Chemical Re-stock",              category:"Maintenance", amount:18000,  date:"2025-05-05", status:"Approved" },
    { id:"exp-pk-3", organizationId:"org-pk-1", title:"Electricity Bill – April 2025",              category:"Utilities",   amount:32000,  date:"2025-05-08", status:"Approved" },
    { id:"exp-pk-4", organizationId:"org-pk-1", title:"Annual Day Decoration & Sound System",       category:"Events",      amount:65000,  date:"2025-06-01", status:"Pending"  },
    { id:"exp-pk-5", organizationId:"org-pk-2", title:"Staff Salaries – April 2025",                category:"Salary",      amount:320000, date:"2025-04-30", status:"Approved" },
    { id:"exp-pk-6", organizationId:"org-pk-2", title:"30 New Dell Workstations for CS Lab",        category:"Maintenance", amount:450000, date:"2025-05-20", status:"Approved" },
    { id:"exp-pk-7", organizationId:"org-pk-2", title:"Internet Broadband – May 2025",              category:"Utilities",   amount:25000,  date:"2025-05-10", status:"Approved" },
    { id:"exp-pk-8", organizationId:"org-pk-3", title:"Teacher Salaries – April 2025",              category:"Salary",      amount:165000, date:"2025-04-30", status:"Approved" },
    { id:"exp-pk-9", organizationId:"org-pk-3", title:"Generator Fuel Purchase",                    category:"Utilities",   amount:15000,  date:"2025-05-15", status:"Approved" },
    { id:"exp-pk-10",organizationId:"org-pk-4", title:"Staff Salaries – April 2025",                category:"Salary",      amount:285000, date:"2025-04-30", status:"Approved" },
    { id:"exp-pk-11",organizationId:"org-pk-4", title:"Physics Lab Equipment Repair",               category:"Maintenance", amount:28000,  date:"2025-05-12", status:"Pending"  },
    { id:"exp-pk-12",organizationId:"org-pk-5", title:"Teacher Salaries – April 2025",              category:"Salary",      amount:176000, date:"2025-04-30", status:"Approved" },
    { id:"exp-pk-13",organizationId:"org-pk-5", title:"Water Supply Monthly Charges",               category:"Utilities",   amount:8000,   date:"2025-05-05", status:"Approved" },
  ];

  // ----------------------------------------------------------
  // TIMETABLES (org-pk-1, Grade 9 & 10)
  // ----------------------------------------------------------
  const timetables: TimetableEntry[] = [
    { id:"tt-pk-1",  organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Monday",    periodNumber:1, startTime:"08:00", endTime:"08:45", subject:"Mathematics",   teacherName:"Muhammad Imran",  roomNumber:"Room 301" },
    { id:"tt-pk-2",  organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Monday",    periodNumber:2, startTime:"08:50", endTime:"09:35", subject:"English",        teacherName:"Saima Javed",     roomNumber:"Room 301" },
    { id:"tt-pk-3",  organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Monday",    periodNumber:3, startTime:"09:40", endTime:"10:25", subject:"Urdu",           teacherName:"Fatima Bibi",     roomNumber:"Room 301" },
    { id:"tt-pk-4",  organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Monday",    periodNumber:4, startTime:"10:40", endTime:"11:25", subject:"Islamiat",       teacherName:"Fatima Bibi",     roomNumber:"Room 301" },
    { id:"tt-pk-5",  organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Monday",    periodNumber:5, startTime:"11:30", endTime:"12:15", subject:"General Science", teacherName:"Asad Raza Khan",  roomNumber:"Lab A" },
    { id:"tt-pk-6",  organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Tuesday",   periodNumber:1, startTime:"08:00", endTime:"08:45", subject:"Urdu",           teacherName:"Fatima Bibi",     roomNumber:"Room 301" },
    { id:"tt-pk-7",  organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Tuesday",   periodNumber:2, startTime:"08:50", endTime:"09:35", subject:"Mathematics",   teacherName:"Muhammad Imran",  roomNumber:"Room 301" },
    { id:"tt-pk-8",  organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Tuesday",   periodNumber:3, startTime:"09:40", endTime:"10:25", subject:"General Science", teacherName:"Asad Raza Khan",  roomNumber:"Lab A" },
    { id:"tt-pk-9",  organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Wednesday", periodNumber:1, startTime:"08:00", endTime:"08:45", subject:"English",        teacherName:"Saima Javed",     roomNumber:"Room 301" },
    { id:"tt-pk-10", organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Wednesday", periodNumber:2, startTime:"08:50", endTime:"09:35", subject:"Mathematics",   teacherName:"Muhammad Imran",  roomNumber:"Room 301" },
    { id:"tt-pk-11", organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Thursday",  periodNumber:1, startTime:"08:00", endTime:"08:45", subject:"Islamiat",       teacherName:"Fatima Bibi",     roomNumber:"Room 301" },
    { id:"tt-pk-12", organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Thursday",  periodNumber:2, startTime:"08:50", endTime:"09:35", subject:"General Science", teacherName:"Asad Raza Khan",  roomNumber:"Lab A" },
    { id:"tt-pk-13", organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Friday",    periodNumber:1, startTime:"08:00", endTime:"08:45", subject:"Urdu",           teacherName:"Fatima Bibi",     roomNumber:"Room 301" },
    { id:"tt-pk-14", organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Friday",    periodNumber:2, startTime:"08:50", endTime:"09:35", subject:"English",        teacherName:"Saima Javed",     roomNumber:"Room 301" },
    { id:"tt-pk-15", organizationId:"org-pk-1", className:"Grade 10", dayOfWeek:"Saturday",  periodNumber:1, startTime:"08:00", endTime:"08:45", subject:"Mathematics",   teacherName:"Muhammad Imran",  roomNumber:"Room 301" },

    // Grade 9
    { id:"tt-pk-16", organizationId:"org-pk-1", className:"Grade 9", dayOfWeek:"Monday",    periodNumber:1, startTime:"08:00", endTime:"08:45", subject:"Mathematics",   teacherName:"Muhammad Imran",  roomNumber:"Room 201" },
    { id:"tt-pk-17", organizationId:"org-pk-1", className:"Grade 9", dayOfWeek:"Monday",    periodNumber:2, startTime:"08:50", endTime:"09:35", subject:"General Science", teacherName:"Asad Raza Khan",  roomNumber:"Room 201" },
    { id:"tt-pk-18", organizationId:"org-pk-1", className:"Grade 9", dayOfWeek:"Tuesday",   periodNumber:1, startTime:"08:00", endTime:"08:45", subject:"Urdu",           teacherName:"Fatima Bibi",     roomNumber:"Room 201" },
    { id:"tt-pk-19", organizationId:"org-pk-1", className:"Grade 9", dayOfWeek:"Wednesday", periodNumber:1, startTime:"08:00", endTime:"08:45", subject:"English",        teacherName:"Saima Javed",     roomNumber:"Room 201" },
  ];

  // ----------------------------------------------------------
  // PAYROLLS (April 2025)
  // ----------------------------------------------------------
  const payrolls: PayrollRecord[] = [
    { id:"pr-pk-1", organizationId:"org-pk-1", teacherId:"tch-pk-1", employeeName:"Muhammad Imran",     monthYear:"April 2025", basicSalary:55000, allowances:5000, deductions:3000, netSalary:57000, paymentStatus:"Paid", payoutDate:"2025-04-30" },
    { id:"pr-pk-2", organizationId:"org-pk-1", teacherId:"tch-pk-2", employeeName:"Fatima Bibi",          monthYear:"April 2025", basicSalary:50000, allowances:4000, deductions:2500, netSalary:51500, paymentStatus:"Paid", payoutDate:"2025-04-30" },
    { id:"pr-pk-3", organizationId:"org-pk-1", teacherId:"tch-pk-3", employeeName:"Asad Raza Khan",       monthYear:"April 2025", basicSalary:60000, allowances:6000, deductions:3500, netSalary:62500, paymentStatus:"Paid", payoutDate:"2025-04-30" },
    { id:"pr-pk-4", organizationId:"org-pk-1", teacherId:"tch-pk-4", employeeName:"Saima Javed",           monthYear:"April 2025", basicSalary:52000, allowances:4500, deductions:3000, netSalary:53500, paymentStatus:"Paid", payoutDate:"2025-04-30" },
    { id:"pr-pk-5", organizationId:"org-pk-2", teacherId:"tch-pk-5", employeeName:"Tariq Ullah Baig",     monthYear:"April 2025", basicSalary:75000, allowances:8000, deductions:5000, netSalary:78000, paymentStatus:"Paid", payoutDate:"2025-04-30" },
    { id:"pr-pk-6", organizationId:"org-pk-4", teacherId:"tch-pk-14",employeeName:"Sadia Anwar",           monthYear:"April 2025", basicSalary:70000, allowances:7000, deductions:4500, netSalary:72500, paymentStatus:"Paid", payoutDate:"2025-04-30" },
    { id:"pr-pk-7", organizationId:"org-pk-4", teacherId:"tch-pk-15",employeeName:"Jawad Hussain",         monthYear:"April 2025", basicSalary:68000, allowances:6500, deductions:4000, netSalary:70500, paymentStatus:"Paid", payoutDate:"2025-04-30" },
  ];

  // ----------------------------------------------------------
  // LEAVE REQUESTS
  // ----------------------------------------------------------
  const leaveRequests: LeaveRequest[] = [
    { id:"lv-pk-1", organizationId:"org-pk-1", applicantName:"Asad Raza Khan",   role:UserRole.TEACHER, leaveType:"Sick",      startDate:"2025-05-12", endDate:"2025-05-14", reason:"Viral fever, doctor prescribed 3-day rest.",                   status:"Approved" },
    { id:"lv-pk-2", organizationId:"org-pk-2", applicantName:"Hina Shah",         role:UserRole.TEACHER, leaveType:"Casual",    startDate:"2025-05-20", endDate:"2025-05-20", reason:"Family function.",                                             status:"Pending"  },
    { id:"lv-pk-3", organizationId:"org-pk-4", applicantName:"Amna Siddiqui",     role:UserRole.TEACHER, leaveType:"Annual",    startDate:"2025-06-20", endDate:"2025-06-30", reason:"Annual leave for family vacation during summer break.",         status:"Pending"  },
    { id:"lv-pk-4", organizationId:"org-pk-5", applicantName:"Naeem Ullah Khan",  role:UserRole.TEACHER, leaveType:"Emergency", startDate:"2025-05-08", endDate:"2025-05-09", reason:"Family emergency – hospitalization of parent.",                status:"Approved" },
  ];

  // ----------------------------------------------------------
  // SUBMISSIONS
  // ----------------------------------------------------------
  const submissions: HomeworkSubmission[] = [
    { id:"sub-pk-1", organizationId:"org-pk-1", homeworkId:"hw-pk-1", studentId:"std-pk-001", studentName:"Ali Hassan Malik",  submissionContent:"Solved all 10 equations. Attached working sheet with factoring and quadratic formula methods.",   grade:"A",  feedback:"Excellent working shown. Correct answers throughout.",  submittedAt:"2025-05-19T10:00:00Z", gradedAt:"2025-05-20T09:00:00Z" },
    { id:"sub-pk-2", organizationId:"org-pk-1", homeworkId:"hw-pk-1", studentId:"std-pk-002", studentName:"Fatima Noor",        submissionContent:"Completed exercises 5.1–5.8 with full working. Exercises 5.9 and 5.10 partially done.",        grade:"B",  feedback:"Good effort. Complete remaining 2 exercises for full credit.", submittedAt:"2025-05-19T14:00:00Z", gradedAt:"2025-05-20T09:30:00Z" },
    { id:"sub-pk-3", organizationId:"org-pk-4", homeworkId:"hw-pk-7", studentId:"std-pk-067", studentName:"Mohsin Iqbal",       submissionContent:"Solved all 20 numericals using Newton's laws. Used correct SI units and proper formula application.", grade:"A+", feedback:"Outstanding! Perfect use of Newton's 2nd and 3rd Laws.", submittedAt:"2025-05-25T11:00:00Z", gradedAt:"2025-05-26T08:00:00Z" },
  ];

  // ----------------------------------------------------------
  // AUDIT LOGS
  // ----------------------------------------------------------
  const auditLogs: AuditLog[] = [
    { id:"log-pk-0", organizationId:null,       userName:"EduSphere System",  role:"System",       action:"Pakistani school dataset seeded with 5 organizations, 110 students, and 20 teachers", module:"Infrastructure", timestamp:"2025-04-01T00:00:00Z", ipAddress:"127.0.0.1" },
    { id:"log-pk-1", organizationId:"org-pk-1", userName:"Dr. Arif Mehmood",  role:"School Admin", action:"Academic year 2025-2026 configured and classes assigned",                               module:"Settings",       timestamp:"2025-04-01T08:00:00Z", ipAddress:"192.168.1.10" },
    { id:"log-pk-2", organizationId:"org-pk-2", userName:"Mrs. Zara Ahmed",   role:"School Admin", action:"Timetable finalized and teacher assignments confirmed for Q1",                           module:"Timetable",      timestamp:"2025-04-02T09:00:00Z", ipAddress:"192.168.2.5"  },
    { id:"log-pk-3", organizationId:"org-pk-4", userName:"Dr. Naila Farooqi", role:"School Admin", action:"Mid-term examination schedule published to all portals",                                 module:"Exams",          timestamp:"2025-05-10T10:00:00Z", ipAddress:"192.168.4.1"  },
  ];

  return {
    organizations,
    users,
    students,
    teachers,
    attendance,
    invoices,
    homework,
    submissions,
    exams,
    results,
    timetables,
    leaveRequests,
    payrolls,
    notices,
    events,
    books,
    routes,
    rooms,
    auditLogs,
    expenses,
    examRecords: []
  };
}
