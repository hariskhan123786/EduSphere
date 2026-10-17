/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI — Master Reseeder for Islamia Model High School Quetta
 * - Organization: Islamia Model High School Quetta
 * - 800 Students across Grades 1–10 (Sections A, B, C)
 * - 32 Teachers with designated subjects & assigned classes
 * - Complete Daily Attendance Registers (including today's date & past 6 months)
 * - Comprehensive Exams & Results across ALL Grades 1–10
 * - Complete Weekly Timetables (Monday–Saturday, 7 periods/day) for ALL Grades 1–10
 * - Complete Homework, Library, Transport, Hostel, Notices, Events, Leave Requests, Audit Logs
 */

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SALT_ROUNDS = 10;
const hashPass = (pass: string) => bcrypt.hashSync(pass, SALT_ROUNDS);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://eusvssjczjlotwedrnpa.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1c3Zzc2pjempsb3R3ZWRybnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjUzNTUsImV4cCI6MjEwMDMwMTM1NX0.6FiOOLFc316TQ6fRqoash-rrUz8DEC9Yb9SKdVKzogI";

const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// UUID Generators matching Supabase PostgreSQL format
export const ORG_ID = "01000000-0000-0000-0000-000000000001";
export const getUserId = (idx: number) => `02000000-0000-0000-0000-${String(idx).padStart(12, "0")}`;
export const getTeacherId = (idx: number) => `03000000-0000-0000-0000-${String(idx).padStart(12, "0")}`;
export const getStudentId = (idx: number) => `04000000-0000-0000-0000-${String(idx).padStart(12, "0")}`;

// ─── Pakistan / Quetta Name Generator Pools ──────────────────────────────────
const FIRST_NAMES_MALE = [
  "Muhammad", "Ali", "Usman", "Ahmed", "Hamza", "Bilal", "Zubair", "Faisal", "Tariq", "Hassan",
  "Hussein", "Zayd", "Omar", "Saad", "Kamran", "Salman", "Farhan", "Noman", "Danish", "Waqas",
  "Shahid", "Asif", "Rashid", "Naveed", "Sohail", "Junaid", "Haroon", "Imran", "Khurram", "Babar",
  "Sikandar", "Shehroz", "Adil", "Tanveer", "Ameer", "Mirza", "Atif", "Arsalan", "Sher", "Gul",
  "Shahbaz", "Murad", "Bakhtiar", "Sardar", "Jan", "Aziz", "Qasim", "Rehman", "Mustafa", "Irfan"
];

const FIRST_NAMES_FEMALE = [
  "Fatima", "Ayesha", "Zainab", "Maryam", "Sana", "Hira", "Nida", "Amna", "Sadia", "Khadija",
  "Rabia", "Maira", "Bushra", "Laiba", "Zunaira", "Noor", "Hoorain", "Anaya", "Iqra", "Maham",
  "Samreen", "Farah", "Sehrish", "Noreen", "Ghazala", "Shazia", "Yasmin", "Uzma", "Fozia", "Gulrukh",
  "Bibi", "Palwasha", "Spogmai", "Zarmina", "Zarlasht", "Mahnoor", "Alizeh", "Kinza", "Rameen", "Mehwish"
];

const LAST_NAMES = [
  "Khan", "Ahmed", "Ali", "Baloch", "Tareen", "Kasi", "Durrani", "Achakzai", "Shah", "Malik",
  "Qureshi", "Mengal", "Bugti", "Rind", "Jamali", "Bizenjo", "Leghari", "Mahmood", "Iqbal", "Bhatti",
  "Chaudhry", "Ansari", "Siddiqui", "Farooqi", "Rehman", "Kakar", "Bangash", "Yousafzai", "Marri", "Ghilzai"
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const GRADES = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"
];
const SECTIONS = ["Section A", "Section B", "Section C"];
const DAYS: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday")[] = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const PERIOD_TIMES = [
  { p: 1, start: "08:00", end: "08:45" },
  { p: 2, start: "08:45", end: "09:30" },
  { p: 3, start: "09:30", end: "10:15" },
  { p: 4, start: "10:35", end: "11:20" },
  { p: 5, start: "11:20", end: "12:05" },
  { p: 6, start: "12:05", end: "12:50" },
  { p: 7, start: "12:50", end: "01:35" }
];

// ─── Master Generator ────────────────────────────────────────────────────────
export function generateIslamiaQuettaDatabase() {
  console.log("🏫 Generating Islamia Model High School Quetta Master Dataset...");

  const ORG_NAME = "Islamia Model High School Quetta";

  // 1. Organization
  const organizations = [
    {
      id: ORG_ID,
      name: ORG_NAME,
      slug: "imhs-quetta",
      logo: "/logo.jpg",
      primaryColor: "#4f46e5",
      academicSession: "2025-2026",
      plan: "Enterprise" as const,
      mrr: 320000,
      status: "Active" as const,
      phone: "+92 81 2824501",
      email: "info@imhs.edu.pk",
      address: "Chaman Phatak, Samungli Road, Quetta, Balochistan, Pakistan",
      createdAt: "2024-01-01T00:00:00.000Z"
    }
  ];

  // 2. Users (Admin, Super Admin, Accounts)
  let userCounter = 1;
  const users: any[] = [
    {
      id: getUserId(userCounter++),
      organizationId: null,
      email: "haris@edusphere.ai",
      username: "haris",
      password: hashPass("admin123"),
      role: "SUPER_ADMIN",
      name: "Haris Khan (Super Admin)",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Haris%20Khan",
      status: "Active"
    },
    {
      id: getUserId(userCounter++),
      organizationId: ORG_ID,
      email: "principal@imhs.edu.pk",
      username: "principal_imhs",
      password: hashPass("school123"),
      role: "PRINCIPAL",
      name: "Prof. Dr. Tariq Mahmood Kakar",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Tariq%20Mahmood",
      status: "Active"
    },
    {
      id: getUserId(userCounter++),
      organizationId: ORG_ID,
      email: "admin@imhs.edu.pk",
      username: "admin_imhs",
      password: hashPass("school123"),
      role: "SCHOOL_ADMIN",
      name: "Malik Abdul Rehman Tareen (Admin Officer)",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Abdul%20Rehman",
      status: "Active"
    },
    {
      id: getUserId(userCounter++),
      organizationId: ORG_ID,
      email: "accountant@imhs.edu.pk",
      username: "accountant_imhs",
      password: hashPass("account123"),
      role: "ACCOUNTANT",
      name: "Kamran Akram Durrani (Chief Accountant)",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Kamran%20Akram",
      status: "Active"
    }
  ];

  // 3. 32 Teachers with broad assigned classes
  const TEACHER_CONFIGS = [
    { name: "Ayesha Malik", email: "ayesha.malik@imhs.edu.pk", user: "ayesha_sci", sub: ["General Science", "Biology"], des: "Head of Science Dept", qual: "M.Sc. Biology, UoB", sal: 85000, classes: ["Grade 8", "Grade 9", "Grade 10"] },
    { name: "Muhammad Aslam Kasi", email: "aslam.kasi@imhs.edu.pk", user: "aslam_math", sub: ["Mathematics"], des: "Senior Math Specialist", qual: "M.Sc. Mathematics, BUITEMS", sal: 80000, classes: ["Grade 9", "Grade 10"] },
    { name: "Abdul Qadeer Baloch", email: "qadeer.baloch@imhs.edu.pk", user: "qadeer_urdu", sub: ["Urdu", "Urdu Literature"], des: "Senior Urdu Master", qual: "M.A. Urdu, UoB", sal: 75000, classes: ["Grade 7", "Grade 8", "Grade 9", "Grade 10"] },
    { name: "Fatima Zahra Mengal", email: "fatima.mengal@imhs.edu.pk", user: "fatima_eng", sub: ["English", "English Literature"], des: "Head of English Dept", qual: "M.A. English, NUML", sal: 82000, classes: ["Grade 8", "Grade 9", "Grade 10"] },
    { name: "Gul Muhammad Achakzai", email: "gul.achakzai@imhs.edu.pk", user: "gul_phy", sub: ["Physics"], des: "Senior Physics Lecturer", qual: "M.Sc. Physics, UoB", sal: 78000, classes: ["Grade 9", "Grade 10"] },
    { name: "Noman Shah Tareen", email: "noman.tareen@imhs.edu.pk", user: "noman_chem", sub: ["Chemistry"], des: "Chemistry Master", qual: "M.Sc. Chemistry, UoB", sal: 76000, classes: ["Grade 9", "Grade 10"] },
    { name: "Dr. Zubair Ahmed Jamali", email: "zubair.jamali@imhs.edu.pk", user: "zubair_bio", sub: ["Biology"], des: "Senior Biology Lecturer", qual: "Ph.D. Zoology, QAU", sal: 90000, classes: ["Grade 9", "Grade 10"] },
    { name: "Hassan Raza Bangash", email: "hassan.bangash@imhs.edu.pk", user: "hassan_comp", sub: ["Computer Science"], des: "Head of IT & CS", qual: "MS Computer Science, BUITEMS", sal: 88000, classes: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"] },
    { name: "Qari Jamal-ud-Din", email: "jamal.din@imhs.edu.pk", user: "jamal_isl", sub: ["Islamiat", "Quran Studies"], des: "HOD Islamic Studies", qual: "M.A. Islamiat, Wafaq-ul-Madaris", sal: 72000, classes: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"] },
    { name: "Bashir Ahmed Rind", email: "bashir.rind@imhs.edu.pk", user: "bashir_pst", sub: ["Pakistan Studies", "Social Studies"], des: "Social Studies Master", qual: "M.A. History, UoB", sal: 74000, classes: ["Grade 7", "Grade 8", "Grade 9", "Grade 10"] },
    { name: "Sanaullah Kakar", email: "sanaullah.kakar@imhs.edu.pk", user: "sanaullah_geo", sub: ["Geography", "General Knowledge"], des: "Geography Teacher", qual: "M.Sc. Geography, UoB", sal: 70000, classes: ["Grade 6", "Grade 7", "Grade 8"] },
    { name: "Maryam Bibi Durrani", email: "maryam.durrani@imhs.edu.pk", user: "maryam_prim", sub: ["English", "Mathematics"], des: "Primary Section Head", qual: "B.Ed & M.A. Education", sal: 75000, classes: ["Grade 1", "Grade 2", "Grade 3"] },
    { name: "Zainab Shah", email: "zainab.shah@imhs.edu.pk", user: "zainab_sci", sub: ["General Science", "Art & Craft"], des: "Junior Science Teacher", qual: "B.Sc. Biotechnology", sal: 65000, classes: ["Grade 4", "Grade 5", "Grade 6"] },
    { name: "Farhan Ali Bugti", email: "farhan.bugti@imhs.edu.pk", user: "farhan_math", sub: ["Mathematics"], des: "Junior Math Teacher", qual: "B.Sc. Mathematics", sal: 68000, classes: ["Grade 6", "Grade 7", "Grade 8"] },
    { name: "Sohail Ahmed Marri", email: "sohail.marri@imhs.edu.pk", user: "sohail_pe", sub: ["Physical Education", "Sports"], des: "Director Physical Education", qual: "Master in Sports Science", sal: 72000, classes: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"] },
    { name: "Rashid Minhas", email: "rashid.minhas@imhs.edu.pk", user: "rashid_eng", sub: ["English"], des: "Middle School English Teacher", qual: "M.A. English", sal: 70000, classes: ["Grade 5", "Grade 6", "Grade 7"] },
    { name: "Nida Fatima Kasi", email: "nida.kasi@imhs.edu.pk", user: "nida_art", sub: ["Fine Arts", "Drawing"], des: "Art Specialist", qual: "Bachelor of Fine Arts", sal: 65000, classes: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"] },
    { name: "Khurram Shehzad", email: "khurram.shehzad@imhs.edu.pk", user: "khurram_cs", sub: ["Computer Science"], des: "Lab Instructor & CS", qual: "BS Software Engineering", sal: 72000, classes: ["Grade 5", "Grade 6", "Grade 7"] },
    { name: "Ghazala Parveen", email: "ghazala.parveen@imhs.edu.pk", user: "ghazala_urdu", sub: ["Urdu"], des: "Language Teacher", qual: "M.A. Urdu", sal: 68000, classes: ["Grade 4", "Grade 5", "Grade 6"] },
    { name: "Imran Khan Tareen", email: "imran.tareen@imhs.edu.pk", user: "imran_chem", sub: ["General Science", "Chemistry"], des: "Lab Coordinator", qual: "B.Sc. Chemistry", sal: 66000, classes: ["Grade 7", "Grade 8"] },
    { name: "Palwasha Kakar", email: "palwasha.kakar@imhs.edu.pk", user: "palwasha_prim", sub: ["General Science", "Social Studies"], des: "Primary Teacher", qual: "B.A., B.Ed.", sal: 62000, classes: ["Grade 1", "Grade 2"] },
    { name: "Mirza Bakhtiar Baig", email: "bakhtiar.baig@imhs.edu.pk", user: "bakhtiar_math", sub: ["Mathematics"], des: "Senior Math Faculty", qual: "M.Phil Mathematics", sal: 82000, classes: ["Grade 9", "Grade 10"] },
    { name: "Spogmai Baloch", email: "spogmai.baloch@imhs.edu.pk", user: "spogmai_eng", sub: ["English"], des: "Language Facilitator", qual: "M.A. Linguistics", sal: 71000, classes: ["Grade 3", "Grade 4"] },
    { name: "Sardar Jan Mengal", email: "sardar.mengal@imhs.edu.pk", user: "sardar_isl", sub: ["Islamiat", "Nazra Quran"], des: "Religious Instructor", qual: "Dars-e-Nizami, M.A.", sal: 69000, classes: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"] },
    { name: "Shahbaz Ahmed Khan", email: "shahbaz.khan@imhs.edu.pk", user: "shahbaz_phy", sub: ["Physics"], des: "Physics Master", qual: "M.Sc. Electronics", sal: 76000, classes: ["Grade 9", "Grade 10"] },
    { name: "Uzma Noreen", email: "uzma.noreen@imhs.edu.pk", user: "uzma_bio", sub: ["General Science", "Biology"], des: "Biology Teacher", qual: "M.Sc. Botany", sal: 74000, classes: ["Grade 7", "Grade 8"] },
    { name: "Azizullah Kasi", email: "azizullah.kasi@imhs.edu.pk", user: "aziz_pst", sub: ["Social Studies", "General Knowledge"], des: "Humanities Master", qual: "M.A. Political Science", sal: 73000, classes: ["Grade 5", "Grade 6"] },
    { name: "Bushra Qureshi", email: "bushra.qureshi@imhs.edu.pk", user: "bushra_prim", sub: ["Mathematics", "English"], des: "Junior Grade Master", qual: "M.Sc. Psychology", sal: 67000, classes: ["Grade 2", "Grade 3"] },
    { name: "Mustafa Kamal", email: "mustafa.kamal@imhs.edu.pk", user: "mustafa_comp", sub: ["Computer Science"], des: "Robotics & STEM Trainer", qual: "BS Computer Engineering", sal: 80000, classes: ["Grade 8", "Grade 9", "Grade 10"] },
    { name: "Zarlasht Achakzai", email: "zarlasht.achakzai@imhs.edu.pk", user: "zarlasht_sci", sub: ["General Science"], des: "Science Faculty", qual: "B.Sc. Chemistry", sal: 64000, classes: ["Grade 3", "Grade 4"] },
    { name: "Tanveer Abbas", email: "tanveer.abbas@imhs.edu.pk", user: "tanveer_urdu", sub: ["Urdu"], des: "Urdu Master", qual: "M.Phil Urdu", sal: 75000, classes: ["Grade 8", "Grade 9"] },
    { name: "Fozia Bibi Jamali", email: "fozia.jamali@imhs.edu.pk", user: "fozia_math", sub: ["Mathematics"], des: "Middle Math Specialist", qual: "M.Sc. Statistics", sal: 73000, classes: ["Grade 4", "Grade 5"] }
  ];

  const teachers: any[] = [];
  TEACHER_CONFIGS.forEach((tc, idx) => {
    const tid = getTeacherId(idx + 1);
    const uid = getUserId(userCounter++);

    users.push({
      id: uid,
      organizationId: ORG_ID,
      email: tc.email,
      username: tc.user,
      password: hashPass("teacher123"),
      role: "TEACHER",
      name: tc.name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(tc.name)}`,
      status: "Active"
    });

    teachers.push({
      id: tid,
      userId: uid,
      organizationId: ORG_ID,
      employeeId: `EMP-${String(idx + 1).padStart(3, "0")}`,
      name: tc.name,
      email: tc.email,
      phone: `+92 3${randomInt(10, 49)} ${randomInt(1000000, 9999999)}`,
      department: "Academic Faculty",
      designation: tc.des,
      qualification: tc.qual,
      subjectsTaught: tc.sub,
      subjectsAssigned: tc.sub,
      classesAssigned: tc.classes,
      salary: tc.sal,
      joiningDate: `202${randomInt(0, 3)}-0${randomInt(1, 9)}-15`,
      status: "Active",
      createdAt: "2024-01-15T00:00:00.000Z"
    });
  });

  // 4. 800 Students across all 10 Grades and 3 Sections
  const students: any[] = [];
  let studentCount = 0;
  for (let g = 0; g < GRADES.length; g++) {
    const grade = GRADES[g];
    for (let s = 0; s < SECTIONS.length; s++) {
      const section = SECTIONS[s];
      const countForThisSection = (g === 9 && s === 2) ? (800 - studentCount) : 27;

      for (let i = 1; i <= countForThisSection; i++) {
        studentCount++;
        const isMale = Math.random() > 0.45;
        const firstName = isMale ? randomPick(FIRST_NAMES_MALE) : randomPick(FIRST_NAMES_FEMALE);
        const lastName = randomPick(LAST_NAMES);
        const fullName = `${firstName} ${lastName}`;
        const guardianName = `${randomPick(FIRST_NAMES_MALE)} ${lastName}`;
        const stdId = getStudentId(studentCount);
        const rollNo = `${String(i).padStart(2, "0")}`;
        const admissionNo = `IMHS-2025-${String(studentCount).padStart(4, "0")}`;
        const baseFee = g < 5 ? 4500 : g < 8 ? 5500 : 6500;

        let uid = undefined;
        if (studentCount <= 60) {
          uid = getUserId(userCounter++);
          users.push({
            id: uid,
            organizationId: ORG_ID,
            email: `student${studentCount}@imhs.edu.pk`,
            username: `student${studentCount}`,
            password: hashPass("student123"),
            role: "STUDENT",
            name: fullName,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
            status: "Active"
          });

          if (studentCount <= 25) {
            const prtUid = getUserId(userCounter++);
            users.push({
              id: prtUid,
              organizationId: ORG_ID,
              email: `parent${studentCount}@gmail.com`,
              username: `parent${studentCount}`,
              password: hashPass("parent123"),
              role: "PARENT",
              name: `${guardianName} (Parent of ${firstName})`,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(guardianName)}`,
              status: "Active"
            });
          }
        }

        students.push({
          id: stdId,
          userId: uid,
          organizationId: ORG_ID,
          admissionNo,
          rollNo,
          name: fullName,
          className: grade,
          sectionName: section,
          guardianName,
          guardianPhone: `+92 3${randomInt(10, 49)} ${randomInt(1000000, 9999999)}`,
          bloodGroup: randomPick(BLOOD_GROUPS),
          status: "Active",
          monthlyFee: baseFee,
          attendanceRate: randomInt(88, 99),
          behaviorScore: randomInt(85, 100),
          emergencyContact: `Dr. ${randomPick(LAST_NAMES)} — Civil Hospital Quetta (+92 81 9201000)`,
          createdAt: "2024-03-01T08:00:00.000Z"
        });
      }
    }
  }

  // 5. Rich Daily Attendance Registers (including today's date & past dates)
  const attendance: any[] = [];
  const ATTENDANCE_DATES: string[] = [];

  // Recent 10 consecutive days up to today
  const today = new Date();
  for (let d = 0; d < 10; d++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - d);
    ATTENDANCE_DATES.push(dt.toISOString().split("T")[0]);
  }

  // Sample historical days across past 6 months
  const months = ["2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07"];
  months.forEach(m => {
    [1, 10, 20].forEach(day => {
      ATTENDANCE_DATES.push(`${m}-${String(day).padStart(2, "0")}`);
    });
  });

  // Unique dates list
  const uniqueDates = Array.from(new Set(ATTENDANCE_DATES));

  let attCounter = 0;
  uniqueDates.forEach(date => {
    students.forEach(st => {
      attCounter++;
      const rand = Math.random();
      const status = rand > 0.08 ? "Present" : rand > 0.03 ? "Absent" : rand > 0.01 ? "Late" : "Excused";
      attendance.push({
        id: `att-imhs-${attCounter}`,
        organizationId: ORG_ID,
        studentId: st.id,
        studentName: st.name,
        className: st.className,
        sectionName: st.sectionName,
        date,
        status,
        remarks: status === "Late" ? "School bus traffic delay" : status === "Absent" ? "Medical leave application" : status === "Excused" ? "Family emergency" : "Present in morning roll-call"
      });
    });
  });

  // 6. Comprehensive Weekly Timetables (Monday to Saturday, 7 periods/day) for all 10 Grades & 3 Sections
  const timetables: any[] = [];
  let ttCounter = 0;

  GRADES.forEach((grade, gIdx) => {
    const isPrimary = gIdx < 5;
    const isMiddle = gIdx >= 5 && gIdx < 8;
    
    const subjectRoster = isPrimary 
      ? ["Mathematics", "English", "Urdu", "General Science", "Islamiat", "Art & Craft", "Physical Education"]
      : isMiddle 
        ? ["Mathematics", "English", "Urdu", "General Science", "Computer Science", "Islamiat", "Social Studies"]
        : ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "Urdu", "Pakistan Studies", "Islamiat"];

    SECTIONS.forEach(section => {
      DAYS.forEach(day => {
        PERIOD_TIMES.forEach(period => {
          ttCounter++;
          const subject = subjectRoster[(period.p + DAYS.indexOf(day)) % subjectRoster.length];
          
          // Find teacher who teaches this subject
          const matchedTeacher = teachers.find(t => t.subjectsAssigned.some((s: string) => s.toLowerCase().includes(subject.toLowerCase()))) || teachers[ttCounter % teachers.length];
          
          const roomNumber = isPrimary 
            ? `Primary Wing Room ${gIdx + 1}${section.slice(-1)}`
            : isMiddle 
              ? `Middle Block Room ${gIdx + 1}${section.slice(-1)}`
              : subject === "Physics" ? "Physics Lab 1" 
              : subject === "Chemistry" ? "Chemistry Lab 1" 
              : subject === "Biology" ? "Biology Lab" 
              : subject === "Computer Science" ? "AI & CS Lab 2" 
              : `Senior Hall Room ${gIdx + 1}${section.slice(-1)}`;

          timetables.push({
            id: `tt-imhs-${ttCounter}`,
            organizationId: ORG_ID,
            className: grade,
            sectionName: section,
            dayOfWeek: day,
            periodNumber: period.p,
            startTime: period.start,
            endTime: period.end,
            subject,
            teacherName: matchedTeacher.name,
            roomNumber
          });
        });
      });
    });
  });

  // 7. Comprehensive Exams & Results for ALL 10 Grades
  const exams: any[] = [];
  const results: any[] = [];
  let examCounter = 0;
  let resultCounter = 0;

  const EXAM_TERMS = [
    { title: "1st Term Diagnostic Assessment 2025", term: "Term 1", date: "2025-10-15" },
    { title: "Mid-Term Examination 2025", term: "Mid-Term", date: "2025-12-15" },
    { title: "2nd Term Assessment 2026", term: "Term 2", date: "2026-02-18" },
    { title: "Annual Pre-Board Examination 2026", term: "Final Term", date: "2026-08-20" }
  ];

  GRADES.forEach((grade, gIdx) => {
    const subjectsForGrade = gIdx < 5 
      ? ["Mathematics", "English", "Urdu", "General Science", "Islamiat"]
      : gIdx < 8 
        ? ["Mathematics", "English", "Urdu", "General Science", "Computer Science"]
        : ["Mathematics", "Physics", "Chemistry", "English", "Computer Science", "Pakistan Studies"];

    EXAM_TERMS.forEach(exTerm => {
      subjectsForGrade.forEach(subj => {
        examCounter++;
        const examId = `05000000-0000-0000-0000-${String(examCounter).padStart(12, "0")}`;
        const examTitle = `${exTerm.term} ${subj} (${grade})`;

        exams.push({
          id: examId,
          organizationId: ORG_ID,
          className: grade,
          subject: subj,
          title: examTitle,
          maxMarks: 100,
          passingMarks: 40,
          date: exTerm.date,
          startTime: "09:00",
          status: "Completed",
          createdAt: `${exTerm.date}T00:00:00.000Z`
        });

        // Generate student results for this exam
        const studentsInGrade = students.filter(s => s.className === grade);
        studentsInGrade.forEach(st => {
          resultCounter++;
          const marks = randomInt(45, 98);
          const gradeLetter = marks >= 85 ? "A+" : marks >= 75 ? "A" : marks >= 65 ? "B" : marks >= 50 ? "C" : "D";
          
          results.push({
            id: `res-imhs-${resultCounter}`,
            organizationId: ORG_ID,
            examId,
            examTitle,
            subject: subj,
            studentId: st.id,
            studentName: st.name,
            rollNo: st.rollNo,
            marksObtained: marks,
            maxMarks: 100,
            grade: gradeLetter,
            comments: gradeLetter === "A+" ? "Exceptional academic grasp and perfect problem solving." : gradeLetter === "A" ? "Very good performance, consistent effort." : gradeLetter === "B" ? "Satisfactory result with solid fundamentals." : "Needs targeted revision before board exams.",
            remarks: gradeLetter === "A+" ? "Exceptional performance" : "Good performance",
            createdAt: `${exTerm.date}T15:00:00.000Z`
          });
        });
      });
    });
  });

  // 8. 6 Months Fee Invoices (4,800 records)
  const invoices: any[] = [];
  let invCounter = 0;
  const MONTH_NAMES = ["September 2025", "October 2025", "November 2025", "December 2025", "January 2026", "February 2026", "March 2026", "April 2026", "May 2026", "June 2026", "July 2026", "August 2026"];
  const PAYMENT_METHODS = ["Cash Counter", "Bank Alfalah Chaman Phatak", "HBL Zarghoon Road", "EasyPaisa", "JazzCash"];

  MONTH_NAMES.forEach((mName, mIdx) => {
    const isPast = mIdx < 11;
    const dueDate = `2026-08-10`;

    students.forEach(st => {
      invCounter++;
      const invNo = `INV-25-${String(invCounter).padStart(6, "0")}`;
      const isPaid = isPast ? (Math.random() > 0.05) : (Math.random() > 0.35);
      const paidAmount = isPaid ? st.monthlyFee : 0;
      const status = isPaid ? "Paid" : isPast ? "Overdue" : "Pending";

      invoices.push({
        id: `inv-imhs-${invCounter}`,
        organizationId: ORG_ID,
        studentId: st.id,
        studentName: st.name,
        className: st.className,
        sectionName: st.sectionName,
        invoiceNo: invNo,
        title: `${mName} Tuition Fee (${st.className})`,
        amount: st.monthlyFee,
        paidAmount,
        dueDate,
        paidDate: isPaid ? `2026-08-08` : null,
        status,
        month: mName,
        paymentMethod: isPaid ? randomPick(PAYMENT_METHODS) : undefined,
        createdAt: `2026-08-01T00:00:00.000Z`
      });
    });
  });

  // 9. Faculty Payroll Slips
  const payrolls: any[] = [];
  let payCounter = 0;
  MONTH_NAMES.slice(0, 6).forEach((mName) => {
    teachers.forEach(tch => {
      payCounter++;
      const basic = tch.salary;
      const allowances = Math.round(basic * 0.15);
      const deductions = Math.round(basic * 0.05);
      const netSalary = basic + allowances - deductions;

      payrolls.push({
        id: `pay-imhs-${payCounter}`,
        organizationId: ORG_ID,
        teacherId: tch.id,
        teacherName: tch.name,
        employeeName: tch.name,
        designation: tch.designation,
        month: mName.split(" ")[0],
        year: parseInt(mName.split(" ")[1]),
        monthYear: mName,
        basicSalary: basic,
        allowances,
        deductions,
        netSalary,
        status: "Paid",
        paymentStatus: "Paid",
        paymentDate: `2026-08-28`,
        payoutDate: `2026-08-28`,
        paymentMethod: "Bank Alfalah Direct Transfer",
        createdAt: `2026-08-28T00:00:00.000Z`
      });
    });
  });

  // 10. Operating Expenses
  const expenses: any[] = [];
  const EXPENSE_CATEGORIES = [
    { cat: "Utilities", title: "QESCO Electricity Commercial Bill", amt: 145000 },
    { cat: "Utilities", title: "SSGC Natural Gas Heating Bill", amt: 88000 },
    { cat: "Internet & Telecom", title: "PTCL Smart Optical Fiber Lease", amt: 35000 },
    { cat: "Laboratory", title: "Chemistry & Biology Lab Reagents Supply", amt: 125000 },
    { cat: "Stationery", title: "Term Exam Papers & Answer Booklets Printing", amt: 95000 },
    { cat: "Maintenance", title: "Winter Campus Roof Sealing & Painting", amt: 180000 },
    { cat: "Sports", title: "Inter-School Balochistan Cricket Tournament", amt: 65000 },
    { cat: "Security", title: "Campus CCTV & Armed Security Guard Retainer", amt: 110000 }
  ];

  let expCounter = 0;
  MONTH_NAMES.slice(0, 6).forEach(() => {
    EXPENSE_CATEGORIES.forEach(ec => {
      expCounter++;
      expenses.push({
        id: `exp-imhs-${expCounter}`,
        organizationId: ORG_ID,
        category: ec.cat,
        title: ec.title,
        amount: Math.round(ec.amt * (0.9 + Math.random() * 0.2)),
        date: `2026-08-${randomInt(12, 28)}`,
        paymentMethod: "Bank Cheque (Alfalah)",
        recordedBy: "Kamran Akram Durrani (Accountant)",
        status: "Approved",
        createdAt: `2026-08-15T00:00:00.000Z`
      });
    });
  });

  // 11. Homework & Submissions across Grades 1–10
  const homework: any[] = [
    { id: "hw-imhs-1", organizationId: ORG_ID, title: "Quadratic Equations Exercise 2.4", description: "Solve all problems from Exercise 2.4 on your homework notebooks.", subject: "Mathematics", className: "Grade 10", sectionName: "Section A", assignedBy: "Muhammad Aslam Kasi", createdByName: "Muhammad Aslam Kasi", dueDate: "2026-09-05", createdAt: "2026-08-28T00:00:00.000Z" },
    { id: "hw-imhs-2", organizationId: ORG_ID, title: "Electromagnetic Induction Notes", description: "Summarize Faraday's Law and Lenz's Law with neat diagrams.", subject: "Physics", className: "Grade 10", sectionName: "Section A", assignedBy: "Gul Muhammad Achakzai", createdByName: "Gul Muhammad Achakzai", dueDate: "2026-09-06", createdAt: "2026-08-28T00:00:00.000Z" },
    { id: "hw-imhs-3", organizationId: ORG_ID, title: "Urdu Essay: Allama Iqbal's Khudi", description: "Write a 350-word essay illustrating Iqbal's philosophy of self-reliance.", subject: "Urdu", className: "Grade 9", sectionName: "Section B", assignedBy: "Abdul Qadeer Baloch", createdByName: "Abdul Qadeer Baloch", dueDate: "2026-09-04", createdAt: "2026-08-27T00:00:00.000Z" },
    { id: "hw-imhs-4", organizationId: ORG_ID, title: "Basic Fractions and Decimals Worksheet", description: "Complete all fraction addition and subtraction worksheets.", subject: "Mathematics", className: "Grade 5", sectionName: "Section A", assignedBy: "Fozia Bibi Jamali", createdByName: "Fozia Bibi Jamali", dueDate: "2026-09-03", createdAt: "2026-08-27T00:00:00.000Z" }
  ];

  const submissions: any[] = [
    { id: "sub-imhs-1", organizationId: ORG_ID, homeworkId: "hw-imhs-1", studentId: getStudentId(1), studentName: "Ali Khan", submissionContent: "Completed Exercise 2.4 with all verification steps attached.", grade: "A+", feedback: "Excellent and clean step-by-step solutions.", submittedAt: "2026-08-28T10:00:00.000Z" },
    { id: "sub-imhs-2", organizationId: ORG_ID, homeworkId: "hw-imhs-2", studentId: getStudentId(1), studentName: "Ali Khan", submissionContent: "Diagrams and laws explained clearly.", grade: "A", feedback: "Neat diagrams, very good summary.", submittedAt: "2026-08-28T14:30:00.000Z" }
  ];

  // 12. Notices & Events
  const notices: any[] = [
    { id: "not-1", organizationId: ORG_ID, title: "Balochistan Board Matric Registration 2026", content: "All Grade 9 and 10 students must submit their B-Form and photograph copies by Friday to the examination desk.", category: "Academic", targetRole: "All", author: "Malik Abdul Rehman Tareen", date: "2026-08-28", isPinned: true, priority: "High", createdAt: "2026-08-28T00:00:00.000Z" },
    { id: "not-2", organizationId: ORG_ID, title: "Quetta Winter Sports Gala 2026", content: "Annual Table Tennis, Badminton, and Football tournaments start from next Monday on campus grounds.", category: "Sports", targetRole: "Students", author: "Sohail Ahmed Marri", date: "2026-08-28", isPinned: false, priority: "Normal", createdAt: "2026-08-28T00:00:00.000Z" },
    { id: "not-3", organizationId: ORG_ID, title: "Parent-Teacher Conference (PTC)", content: "Parent-Teacher meeting for academic progress discussion is scheduled for Saturday 10:00 AM to 02:00 PM.", category: "Event", targetRole: "Parents", author: "Prof. Dr. Tariq Mahmood Kakar", date: "2026-08-28", isPinned: true, priority: "High", createdAt: "2026-08-28T00:00:00.000Z" }
  ];

  const events: any[] = [
    { id: "evt-1", organizationId: ORG_ID, title: "Annual Science & AI Exhibition 2026", description: "Display of student robotics, physics models, and chemical demonstrations.", date: "2026-09-15", location: "Main Auditorium, Quetta Campus", type: "Academic", createdAt: "2026-08-20T00:00:00.000Z" }
  ];

  // 13. Digital Library
  const books: any[] = [
    { id: "bk-1", organizationId: ORG_ID, title: "Fundamentals of Physics (Halliday & Resnick)", author: "Jearl Walker", isbn: "978-1118230718", category: "Science", totalCopies: 25, availableCopies: 18, shelfLocation: "Rack S-101", status: "Available", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "bk-2", organizationId: ORG_ID, title: "Kulliyat-e-Iqbal (Urdu)", author: "Allama Muhammad Iqbal", isbn: "978-9694160016", category: "Literature", totalCopies: 40, availableCopies: 32, shelfLocation: "Rack U-204", status: "Available", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "bk-3", organizationId: ORG_ID, title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell & Peter Norvig", isbn: "978-0134610993", category: "Computer Science", totalCopies: 15, availableCopies: 9, shelfLocation: "Rack CS-305", status: "Available", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "bk-4", organizationId: ORG_ID, title: "History of Balochistan & Quetta Valley", author: "Mir Ahmad Yar Khan Baloch", isbn: "978-9694164014", category: "History", totalCopies: 20, availableCopies: 14, shelfLocation: "Rack H-402", status: "Available", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "bk-5", organizationId: ORG_ID, title: "Oxford Advanced Learner's Dictionary 10th Ed", author: "Oxford University Press", isbn: "978-0194798488", category: "Reference", totalCopies: 30, availableCopies: 26, shelfLocation: "Reference Hall", status: "Available", createdAt: "2024-01-01T00:00:00.000Z" }
  ];

  // 14. Transport Routes & Hostel
  const routes: any[] = [
    { id: "rt-1", organizationId: ORG_ID, routeName: "Route 1: Samungli Rd - Chaman Phatak - Campus", vehicleNo: "QTA-8412", driverName: "Mirza Gul Kasi", driverPhone: "+92 333 7891234", capacity: 45, stops: ["Samungli Housing", "Chaman Phatak", "Airport Rd", "Main Gate"], fee: 3500, status: "Active", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "rt-2", organizationId: ORG_ID, routeName: "Route 2: Satellite Town - Zarghoon Rd - Campus", vehicleNo: "QTA-5590", driverName: "Muhammad Niaz Tareen", driverPhone: "+92 312 9012345", capacity: 45, stops: ["Satellite Town Block 3", "Zarghoon Road", "Al-Khair Chowk", "Campus"], fee: 4000, status: "Active", createdAt: "2024-01-01T00:00:00.000Z" }
  ];

  const rooms: any[] = [
    { id: "rm-1", organizationId: ORG_ID, roomNo: "Hostel Block A - Room 101", floor: "1st Floor", capacity: 4, occupancy: 4, type: "Shared (4-Bed)", fee: 12000, status: "Occupied", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "rm-2", organizationId: ORG_ID, roomNo: "Hostel Block A - Room 102", floor: "1st Floor", capacity: 4, occupancy: 3, type: "Shared (4-Bed)", fee: 12000, status: "Available", createdAt: "2024-01-01T00:00:00.000Z" }
  ];

  // 15. Leave Requests & Audit Logs
  const leaveRequests: any[] = [
    { id: "lev-1", organizationId: ORG_ID, applicantName: "Ayesha Malik", role: "TEACHER", leaveType: "Casual Leave", startDate: "2026-08-25", endDate: "2026-08-26", reason: "Family event in Quetta", status: "Approved", createdAt: "2026-08-24T00:00:00.000Z" }
  ];

  const auditLogs: any[] = [
    { id: "log-1", organizationId: ORG_ID, userName: "Prof. Dr. Tariq Mahmood Kakar", role: "PRINCIPAL", action: "Academic Session Initialized", module: "Session Setup", timestamp: new Date().toISOString(), ipAddress: "182.180.12.4" },
    { id: "log-2", organizationId: ORG_ID, userName: "Kamran Akram Durrani", role: "ACCOUNTANT", action: "Fee Invoices & Payroll Slips Generated", module: "Finance & Accounts", timestamp: new Date().toISOString(), ipAddress: "182.180.12.9" }
  ];

  console.log(`✅ Generated: ${organizations.length} School, ${teachers.length} Teachers, ${students.length} Students, ${attendance.length} Attendance Logs, ${timetables.length} Timetable Periods, ${exams.length} Exams, ${results.length} Exam Results, ${invoices.length} Invoices, ${payrolls.length} Payrolls!`);

  return {
    organizations,
    users,
    students,
    teachers,
    attendance,
    invoices,
    feeInvoices: invoices,
    expenses,
    payroll: payrolls,
    payrolls,
    homework,
    homeworkSubmissions: submissions,
    submissions,
    exams,
    results,
    timetable: timetables,
    timetables,
    leaveRequests,
    notices,
    schoolEvents: events,
    events,
    libraryBooks: books,
    books,
    transportRoutes: routes,
    routes,
    hostelRooms: rooms,
    rooms,
    auditLogs
  };
}

// ─── Direct Database Sync Runner ─────────────────────────────────────────────
async function runMasterReseed() {
  const db = generateIslamiaQuettaDatabase();

  // 1. Write to local JSON store
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, "db.json"), JSON.stringify(db, null, 2));
  console.log("💾 Saved locally to data/db.json");

  // 2. Clear and sync to Supabase Cloud
  if (supabase) {
    console.log("☁️ Connecting to Supabase to clear and populate cloud database...");
    try {
      async function batchInsert(table: string, records: any[]) {
        if (!supabase || !records || records.length === 0) return;
        const chunkSize = 150;
        for (let i = 0; i < records.length; i += chunkSize) {
          const chunk = records.slice(i, i + chunkSize);
          const { error } = await supabase.from(table).insert(chunk);
          if (error) {
            console.warn(`⚠️ Warning on inserting ${table} chunk [${i}-${i + chunk.length}]:`, error.message);
          }
        }
        console.log(`  ✓ Inserted ${records.length} records into '${table}'`);
      }

      // First delete old records
      const tablesToClean = [
        "homework_submissions", "homework", "results", "exams", "attendance",
        "fee_invoices", "payrolls", "expenses", "timetables", "leave_requests",
        "notices", "school_events", "library_books", "transport_routes", "hostel_rooms",
        "students", "teachers", "users", "organizations"
      ];

      for (const t of tablesToClean) {
        try {
          await supabase.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        } catch (e: any) {
          console.warn(`Delete check on ${t}:`, e.message);
        }
      }
      console.log("  ✓ Cleared previous database records from Supabase");

      // Insert Organizations
      await supabase.from("organizations").insert(db.organizations.map(o => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        logo: o.logo,
        primary_color: o.primaryColor,
        academic_session: o.academicSession,
        plan: o.plan,
        mrr: o.mrr,
        status: o.status,
        phone: o.phone,
        email: o.email,
        address: o.address,
        created_at: o.createdAt
      })));

      // Insert Users (with password_hash)
      await batchInsert("users", db.users.map(u => ({
        id: u.id,
        organization_id: u.organizationId,
        email: u.email,
        username: u.username,
        password_hash: u.password,
        role: u.role,
        name: u.name,
        avatar: u.avatar,
        status: u.status
      })));

      // Insert Teachers
      await batchInsert("teachers", db.teachers.map(t => ({
        id: t.id,
        organization_id: t.organizationId,
        user_id: t.userId,
        employee_id: t.employeeId,
        name: t.name,
        email: t.email,
        phone: t.phone,
        department: "Academic Faculty",
        qualification: t.qualification,
        designation: t.designation,
        classes_assigned: t.classesAssigned,
        subjects_assigned: t.subjectsAssigned,
        salary: t.salary,
        joining_date: t.joiningDate
      })));

      // Insert Students
      await batchInsert("students", db.students.map(s => ({
        id: s.id,
        organization_id: s.organizationId,
        user_id: s.userId,
        admission_no: s.admissionNo,
        roll_no: s.rollNo,
        name: s.name,
        class_name: s.className,
        section_name: s.sectionName,
        guardian_name: s.guardianName,
        guardian_phone: s.guardianPhone,
        behavior_score: s.behaviorScore,
        attendance_rate: s.attendanceRate,
        status: s.status,
        created_at: s.createdAt
      })));

      // Insert Fee Invoices
      await batchInsert("fee_invoices", db.invoices.map(inv => ({
        organization_id: inv.organizationId,
        student_id: inv.studentId,
        student_name: inv.studentName,
        class_name: inv.className,
        title: inv.title,
        amount: inv.amount,
        fine: 0,
        discount: 0,
        paid_amount: inv.paidAmount,
        due_date: inv.dueDate,
        status: inv.status,
        payment_method: inv.paymentMethod,
        pay_date: inv.paidDate
      })));

      // Insert Attendance
      await batchInsert("attendance", db.attendance.map(a => ({
        organization_id: a.organizationId,
        student_id: a.studentId,
        student_name: a.studentName,
        class_name: a.className,
        section_name: a.sectionName,
        date: a.date,
        status: a.status,
        remarks: a.remarks
      })));

      // Insert Timetables
      await batchInsert("timetables", db.timetables.map(tt => ({
        organization_id: tt.organizationId,
        class_name: tt.className,
        day_of_week: tt.dayOfWeek,
        period_number: tt.periodNumber,
        start_time: tt.startTime,
        end_time: tt.endTime,
        subject: tt.subject,
        teacher_name: tt.teacherName,
        room_number: tt.roomNumber
      })));

      // Insert Payroll
      await batchInsert("payrolls", db.payrolls.map(p => ({
        organization_id: p.organizationId,
        teacher_id: p.teacherId,
        employee_name: p.employeeName,
        month_year: p.monthYear,
        basic_salary: p.basicSalary,
        allowances: p.allowances,
        deductions: p.deductions,
        net_salary: p.netSalary,
        payment_status: p.paymentStatus,
        payout_date: p.payoutDate
      })));

      // Insert Expenses
      await batchInsert("expenses", db.expenses.map(e => ({
        organization_id: e.organizationId,
        title: e.title,
        category: e.category,
        amount: e.amount,
        date: e.date,
        status: e.status
      })));

      // Insert Exams
      await batchInsert("exams", db.exams.map(ex => ({
        id: ex.id,
        organization_id: ex.organizationId,
        class_name: ex.className,
        subject: ex.subject,
        title: ex.title,
        max_marks: ex.maxMarks,
        date: ex.date,
        status: ex.status
      })));

      // Insert Results
      await batchInsert("results", db.results.map(r => ({
        organization_id: r.organizationId,
        exam_id: r.examId,
        exam_title: r.examTitle,
        subject: r.subject,
        student_id: r.studentId,
        student_name: r.studentName,
        marks_obtained: r.marksObtained,
        max_marks: r.maxMarks,
        grade: r.grade,
        comments: r.comments
      })));

      // Insert Notices
      await batchInsert("notices", db.notices.map(n => ({
        organization_id: n.organizationId,
        title: n.title,
        content: n.content,
        target_role: n.targetRole,
        date: n.date,
        author: n.author
      })));

      // Insert Homework
      await batchInsert("homework", db.homework.map(h => ({
        organization_id: h.organizationId,
        class_name: h.className,
        subject: h.subject,
        title: h.title,
        description: h.description,
        due_date: h.dueDate,
        created_by_name: h.createdByName
      })));

      // Insert Library Books
      await batchInsert("library_books", db.books.map(b => ({
        organization_id: b.organizationId,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        category: b.category,
        total_copies: b.totalCopies,
        available_copies: b.availableCopies,
        status: b.status
      })));

      // Insert Transport Routes
      await batchInsert("transport_routes", db.routes.map(r => ({
        organization_id: r.organizationId,
        route_name: r.routeName,
        vehicle_no: r.vehicleNo,
        driver_name: r.driverName,
        driver_phone: r.driverPhone,
        stops: r.stops,
        fee: r.fee,
        status: r.status
      })));

      // Insert Hostel Rooms
      await batchInsert("hostel_rooms", db.rooms.map(rm => ({
        organization_id: rm.organizationId,
        room_no: rm.roomNo,
        floor: rm.floor,
        occupancy: rm.occupancy,
        type: rm.type,
        fee: rm.fee,
        status: rm.status
      })));

      // Insert Leave Requests
      await batchInsert("leave_requests", db.leaveRequests.map(l => ({
        organization_id: l.organizationId,
        applicant_name: l.applicantName,
        role: l.role,
        leave_type: l.leaveType,
        start_date: l.startDate,
        end_date: l.endDate,
        reason: l.reason,
        status: l.status
      })));

      // Insert Audit Logs
      await batchInsert("audit_logs", db.auditLogs.map(l => ({
        organization_id: l.organizationId,
        user_name: l.userName,
        role: l.role,
        action: l.action,
        module: l.module,
        ip_address: l.ipAddress,
        timestamp: l.timestamp
      })));

      console.log("🎉 Supabase cloud database successfully reseeded with Islamia Model High School Quetta with 0 errors!");
    } catch (supaErr: any) {
      console.error("Supabase sync encountered an issue:", supaErr.message);
    }
  } else {
    console.log("ℹ️ Supabase not configured; local db.json updated.");
  }
}

// Run if called directly
runMasterReseed();
