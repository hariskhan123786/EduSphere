/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI - Comprehensive Production-Ready Admin Portal Pro Max
 * Complete School & System Management Center:
 * User Administration, Student Lifecycle, Faculty Staffing, Classes & Subjects,
 * Timetable Scheduling, Multi-Module Reporting Center, Real-Time Audit Trails,
 * Transport & Hostel Logistics, Library Circulation, and Institutional Settings.
 */

import React, { useState, useMemo } from "react";
import { 
  Users, UserCheck, Calendar, BookOpen, AlertCircle, Plus, 
  Search, CheckCircle, Bell, UserPlus, Info, Trash2, Mail, Phone, 
  Download, Printer, FileText, ArrowRight, ShieldCheck, Bus, 
  BedDouble, Edit3, Settings, Sparkles, Check, ChevronRight,
  Shield, Key, Lock, RefreshCw, BarChart2, CreditCard, Award,
  X, CheckSquare, Layers, Clock, Eye, EyeOff
} from "lucide-react";
import { DatabaseSchema } from "../types.js";
import { 
  Student, Teacher, LibraryBook, TransportRoute, HostelRoom, 
  TimetableEntry, ExamRecord, UserRole, User as UserType, AuditLog, FeeInvoice 
} from "../types.js";
import { exportToCsv, printHtmlDocument, uploadStudentPhoto } from "../lib/desktop-api.js";
import { formatPKR, formatPKRFull, exportStudentReportPDF, exportFeeReceiptPDF, exportFeeRegisterPDF, exportPayrollPDF, exportAttendancePDF, exportClassResultsPDF, exportNoticeDocx, exportLeaveLetterDocx, exportBackupJSON, exportBackupExcel, exportStudentsExcel, exportFeesExcel, exportAttendanceExcel, exportResultsExcel, exportPayrollExcel } from "../lib/reports.js";
import AnalyticsDashboard from "./AnalyticsDashboard.js";
import AcademicSessions from "./AcademicSessions.js";
import ApprovalWorkflows from "./ApprovalWorkflows.js";
import DocumentGenerator from "./DocumentGenerator.js";
import ImportCenter from "./ImportCenter.js";
import SecurityCenter from "./SecurityCenter.js";

interface SchoolAdminProps {
  dbState: DatabaseSchema;
  onMutate: (action: "INSERT" | "UPDATE" | "DELETE", table: string, data: any) => Promise<void>;
  isLoading: boolean;
  currentUser?: any;
}

type AdminTab = 
  | "users"
  | "students"
  | "staff"
  | "classes_subjects"
  | "timetables"
  | "exam_center"
  | "reports"
  | "analytics"
  | "academic_sessions"
  | "workflows"
  | "documents"
  | "import_center"
  | "security_center"
  | "audit_logs"
  | "transport_hostel"
  | "library"
  | "announcements"
  | "settings";

export default function SchoolAdmin({ dbState, onMutate, isLoading, currentUser }: SchoolAdminProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userVisibilityFilter, setUserVisibilityFilter] = useState<"ALL" | "VISIBLE" | "HIDDEN">("ALL");

  // Active School
  const activeSchool = (dbState.organizations || []).find(o => o.id === currentUser?.organizationId) || 
                       (dbState.organizations || [])[0] || {
                         id: "org-pk-1",
                         name: "Al-Noor Model High School",
                         academicSession: "2025-2026",
                         phone: "+92-42-35870001",
                         email: "info@alnoor.edu.pk",
                         address: "Gulberg III, Lahore, Pakistan",
                         plan: "Enterprise"
                       };

  // Modals
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [showAddTimetable, setShowAddTimetable] = useState(false);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  // User Form State
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.TEACHER);

  // Student Form State
  const [stdName, setStdName] = useState("");
  const [stdRollNo, setStdRollNo] = useState("");
  const [stdClassName, setStdClassName] = useState("Grade 10");
  const [stdSectionName, setStdSectionName] = useState("Section A");
  const [stdGuardianName, setStdGuardianName] = useState("");
  const [stdGuardianPhone, setStdGuardianPhone] = useState("");
  const [stdGuardianEmail, setStdGuardianEmail] = useState("");
  const [stdPhoto, setStdPhoto] = useState("");

  // Teacher Form State
  const [tchName, setTchName] = useState("");
  const [tchDepartment, setTchDepartment] = useState("Department of Mathematics & Science");
  const [tchQualification, setTchQualification] = useState("Master's Degree");
  const [tchDesignation, setTchDesignation] = useState("Senior Lecturer");
  const [tchPhone, setTchPhone] = useState("");
  const [tchEmail, setTchEmail] = useState("");
  const [tchSalary, setTchSalary] = useState(65000);
  const [tchClasses, setTchClasses] = useState("Grade 9, Grade 10");
  const [tchSubjects, setTchSubjects] = useState("Mathematics, General Science");

  // Timetable Form State
  const [ttClass, setTtClass] = useState("Grade 10");
  const [ttDay, setTtDay] = useState<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday">("Monday");
  const [ttPeriod, setTtPeriod] = useState(1);
  const [ttStart, setTtStart] = useState("08:30");
  const [ttEnd, setTtEnd] = useState("09:20");
  const [ttSubject, setTtSubject] = useState("Mathematics");
  const [ttTeacher, setTtTeacher] = useState("Muhammad Imran");
  const [ttRoom, setTtRoom] = useState("Room 101");

  // Exam Center Form State
  const [showAddExamRecord, setShowAddExamRecord] = useState(false);
  const [examTierFilter, setExamTierFilter] = useState<"ALL" | "Primary" | "Secondary" | "Annual">("ALL");
  const [erTier, setErTier] = useState<"Primary" | "Secondary" | "Annual">("Annual");
  const [erTitle, setErTitle] = useState("");
  const [erClass, setErClass] = useState("Grade 9");
  const [erSubject, setErSubject] = useState("Mathematics");
  const [erMaxMarks, setErMaxMarks] = useState(100);
  const [erPassingMarks, setErPassingMarks] = useState(40);
  const [erExamDate, setErExamDate] = useState("");
  const [erResultDate, setErResultDate] = useState("");

  // Transport & Hostel Form State
  const [routeName, setRouteName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [routeFee, setRouteFee] = useState(4500);

  const [roomNo, setRoomNo] = useState("");
  const [roomType, setRoomType] = useState<"Single" | "Double" | "Dormitory">("Double");
  const [totalBeds, setTotalBeds] = useState(2);
  const [roomFee, setRoomFee] = useState(12000);

  // Library Book Form State
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [bookCategory, setBookCategory] = useState("Science & Technology");
  const [bookCopies, setBookCopies] = useState(5);

  // Settings State
  const [schoolName, setSchoolName] = useState(activeSchool.name);
  const [academicSession, setAcademicSession] = useState(activeSchool.academicSession || "2025-2026");
  const [schoolEmail, setSchoolEmail] = useState(activeSchool.email || "info@alnoor.edu.pk");
  const [schoolPhone, setSchoolPhone] = useState(activeSchool.phone || "+92-42-35870001");
  const [schoolAddress, setSchoolAddress] = useState(activeSchool.address || "Lahore, Pakistan");

  // -------------------------------------------------------------
  // Data Filtering
  // -------------------------------------------------------------
  const schoolUsers = useMemo(() => {
    return (dbState.users || []).filter(u => u.organizationId === activeSchool.id || !u.organizationId);
  }, [dbState.users, activeSchool.id]);

  const schoolStudents = useMemo(() => {
    return (dbState.students || []).filter(s => s.organizationId === activeSchool.id || !s.organizationId);
  }, [dbState.students, activeSchool.id]);

  const schoolTeachers = useMemo(() => {
    return (dbState.teachers || []).filter(t => t.organizationId === activeSchool.id || !t.organizationId);
  }, [dbState.teachers, activeSchool.id]);

  const schoolAuditLogs = useMemo(() => {
    return (dbState.auditLogs || []).filter(l => l.organizationId === activeSchool.id || !l.organizationId);
  }, [dbState.auditLogs, activeSchool.id]);

  const schoolInvoices = useMemo(() => {
    return ((dbState.feeInvoices || (dbState as any).invoices || []) || []).filter(i => i.organizationId === activeSchool.id || !i.organizationId);
  }, [(dbState.feeInvoices || (dbState as any).invoices || []), activeSchool.id]);

  // Distinct Classes
  const distinctClasses = useMemo(() => {
    return Array.from(new Set(schoolStudents.map(s => s.className)));
  }, [schoolStudents]);

  // -------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim() || !newUserEmail.trim()) return;

    await onMutate("INSERT", "users", {
      name: newUserName.trim(),
      username: newUserUsername.toLowerCase().trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newUserName.trim())}`,
      status: "Active",
      organizationId: activeSchool.id
    });

    setShowAddUser(false);
    setNewUserName("");
    setNewUserUsername("");
    setNewUserEmail("");
    setNewUserPassword("");
    alert("New authorized system user account created successfully!");
  };

  const handleToggleUserStatus = async (user: UserType) => {
    const nextStatus = user.status === "Active" ? "Inactive" : "Active";
    await onMutate("UPDATE", "users", {
      id: user.id,
      status: nextStatus
    });
    alert(`User ${user.name} has been ${nextStatus === "Active" ? "activated" : "suspended"}.`);
  };

  const handleToggleUserHide = async (user: UserType) => {
    const isCurrentlyHidden = user.isHidden || user.status === "Hidden";
    const nextHidden = !isCurrentlyHidden;
    await onMutate("UPDATE", "users", {
      id: user.id,
      isHidden: nextHidden,
      status: nextHidden ? "Hidden" : "Active"
    });
    alert(`User ${user.name} has been ${nextHidden ? "hidden from listings" : "unhidden and restored to visible status"}.`);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stdName.trim() || !stdGuardianName.trim()) return;

    const randId = Math.floor(1000 + Math.random() * 9000);
    const admissionNo = `ANMS-2025-${randId}`;

    await onMutate("INSERT", "students", {
      name: stdName.trim(),
      rollNo: stdRollNo || String((schoolStudents.length || 0) + 1),
      className: stdClassName,
      sectionName: stdSectionName,
      guardianName: stdGuardianName.trim(),
      guardianPhone: stdGuardianPhone || "+92-300-0000000",
      guardianEmail: stdGuardianEmail || `${stdName.toLowerCase().replace(/\s+/g, ".")}@family.pk`,
      medicalRecords: "None declared.",
      behaviorScore: 100,
      attendanceRate: 100.0,
      status: "Active",
      admissionNo,
      admissionDate: new Date().toISOString().split('T')[0],
      avatar: stdPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(stdName.trim())}`,
      photoUrl: stdPhoto,
      organizationId: activeSchool.id
    });

    setShowAddStudent(false);
    setStdName("");
    setStdRollNo("");
    setStdGuardianName("");
    setStdGuardianPhone("");
    setStdGuardianEmail("");
    setStdPhoto("");
    alert("Scholar admitted successfully with admission ID generated.");
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tchName.trim() || !tchDepartment.trim()) return;

    const randId = Math.floor(100 + Math.random() * 900);
    const employeeId = `TCH-PK-${randId}`;

    await onMutate("INSERT", "teachers", {
      name: tchName.trim(),
      employeeId,
      department: tchDepartment.trim(),
      qualification: tchQualification.trim(),
      designation: tchDesignation.trim(),
      phone: tchPhone || "+92-300-0000000",
      email: tchEmail || `${tchName.toLowerCase().replace(/\s+/g, ".")}@alnoor.edu.pk`,
      salary: Number(tchSalary) || 65000,
      classesAssigned: tchClasses.split(",").map(c => c.trim()),
      subjectsAssigned: tchSubjects.split(",").map(s => s.trim()),
      organizationId: activeSchool.id
    });

    setShowAddTeacher(false);
    setTchName("");
    setTchPhone("");
    setTchEmail("");
    alert("Faculty instructor appointment recorded.");
  };

  const handleAddTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    await onMutate("INSERT", "timetables", {
      className: ttClass,
      dayOfWeek: ttDay,
      periodNumber: Number(ttPeriod),
      startTime: ttStart,
      endTime: ttEnd,
      subject: ttSubject,
      teacherName: ttTeacher,
      roomNumber: ttRoom,
      organizationId: activeSchool.id
    });
    setShowAddTimetable(false);
    alert("Period slot added to timetable master.");
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim() || !vehicleNo.trim()) return;
    await onMutate("INSERT", "routes", {
      routeName: routeName.trim(),
      vehicleNo: vehicleNo.trim(),
      driverName: driverName.trim() || "Driver",
      driverPhone: driverPhone.trim() || "+92-300-0000000",
      fee: Number(routeFee),
      organizationId: activeSchool.id
    });
    setShowAddRoute(false);
    setRouteName("");
    setVehicleNo("");
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNo.trim()) return;
    await onMutate("INSERT", "rooms", {
      roomNo: roomNo.trim(),
      type: roomType,
      totalBeds: Number(totalBeds),
      availableBeds: Number(totalBeds),
      fee: Number(roomFee),
      organizationId: activeSchool.id
    });
    setShowAddRoom(false);
    setRoomNo("");
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !bookAuthor.trim()) return;
    await onMutate("INSERT", "books", {
      title: bookTitle.trim(),
      author: bookAuthor.trim(),
      isbn: bookIsbn.trim() || `978-969-${Math.floor(1000000 + Math.random() * 9000000)}`,
      category: bookCategory,
      totalCopies: Number(bookCopies),
      availableCopies: Number(bookCopies),
      organizationId: activeSchool.id
    });
    setShowAddBook(false);
    setBookTitle("");
    setBookAuthor("");
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onMutate("UPDATE", "organizations", {
      id: activeSchool.id,
      name: schoolName,
      academicSession,
      email: schoolEmail,
      phone: schoolPhone,
      address: schoolAddress
    });
    alert("School branding and academic configuration updated successfully!");
  };

  // Export Reports
  const handleExportStudents = () => {
    exportToCsv("Students_Roster", schoolStudents, [
      { key: "admissionNo", label: "Admission No" },
      { key: "name", label: "Full Name" },
      { key: "className", label: "Class" },
      { key: "sectionName", label: "Section" },
      { key: "rollNo", label: "Roll No" },
      { key: "guardianName", label: "Guardian" },
      { key: "guardianPhone", label: "Guardian Contact" },
      { key: "attendanceRate", label: "Attendance %" },
      { key: "status", label: "Status" }
    ]);
  };

  const handleExportInvoices = () => {
    exportToCsv("Fee_Invoices_Ledger", schoolInvoices, [
      { key: "id", label: "Invoice ID" },
      { key: "studentName", label: "Student Name" },
      { key: "className", label: "Class" },
      { key: "title", label: "Fee Title" },
      { key: "amount", label: "Amount (PKR)" },
      { key: "paidAmount", label: "Paid (PKR)" },
      { key: "status", label: "Status" },
      { key: "dueDate", label: "Due Date" }
    ]);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ================= HEADER BAR ================= */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              School Administration Command Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
              {activeSchool.academicSession || "2025-2026"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {activeSchool.name} • User provisioning, reporting engine, class mapping, and security audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "users" && (
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create User
            </button>
          )}

          {activeTab === "students" && (
            <>
              <button
                onClick={handleExportStudents}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={() => setShowAddStudent(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Admit Student
              </button>
            </>
          )}

          {activeTab === "staff" && (
            <button
              onClick={() => setShowAddTeacher(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Appoint Instructor
            </button>
          )}

          {activeTab === "timetables" && (
            <button
              onClick={() => setShowAddTimetable(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Period Slot
            </button>
          )}
        </div>
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
          { id: "users", label: "User Administration", icon: Shield },
          { id: "students", label: "Students Lifecycle", icon: Users },
          { id: "staff", label: "Faculty Staffing", icon: UserCheck },
          { id: "analytics", label: "Executive Analytics", icon: BarChart2 },
          { id: "academic_sessions", label: "Academic Sessions", icon: Calendar },
          { id: "workflows", label: "Approval Workflows", icon: ShieldCheck },
          { id: "documents", label: "Document Generator", icon: FileText },
          { id: "import_center", label: "Data Import", icon: Download },
          { id: "security_center", label: "Security & Devices", icon: Key },
          { id: "classes_subjects", label: "Classes & Subjects", icon: Layers },
          { id: "timetables", label: "Timetables Master", icon: Calendar },
          { id: "exam_center", label: "Exam Center", icon: Award },
          { id: "reports", label: "Reporting Center", icon: FileText },
          { id: "audit_logs", label: "Security Audit Logs", icon: Clock },
          { id: "transport_hostel", label: "Transport & Hostel", icon: Bus },
          { id: "library", label: "Library Catalog", icon: BookOpen },
          { id: "settings", label: "Institutional Settings", icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: USER ADMINISTRATION ================= */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">
                Authorized System Users
              </h3>
              <p className="text-xs text-gray-500">
                Manage credentials, role assignments, and active session statuses.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user by name, username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent focus:outline-none text-xs"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 font-semibold"
              >
                <option value="ALL">All Roles</option>
                <option value={UserRole.SCHOOL_ADMIN}>School Admin / Principal</option>
                <option value={UserRole.TEACHER}>Teachers</option>
                <option value={UserRole.STUDENT}>Students</option>
                <option value={UserRole.PARENT}>Parents</option>
                <option value={UserRole.ACCOUNTANT}>Accountants</option>
              </select>

              <select
                value={userVisibilityFilter}
                onChange={(e) => setUserVisibilityFilter(e.target.value as any)}
                className="text-xs px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 font-semibold"
              >
                <option value="ALL">All Visibility</option>
                <option value="VISIBLE">Visible Only</option>
                <option value="HIDDEN">Hidden Only</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">System Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {schoolUsers
                    .filter(u => {
                      const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
                      const isUserHidden = u.isHidden || u.status === "Hidden";
                      const matchVisibility = userVisibilityFilter === "ALL" || 
                        (userVisibilityFilter === "HIDDEN" && isUserHidden) || 
                        (userVisibilityFilter === "VISIBLE" && !isUserHidden);
                      const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchRole && matchVisibility && matchSearch;
                    })
                    .map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img src={u.avatar} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800" alt="avatar" />
                            <span className="font-bold text-gray-900 dark:text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-gray-500">{u.username}</td>
                        <td className="py-3 px-4 text-gray-500">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit ${
                            u.isHidden || u.status === "Hidden"
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
                              : u.status === "Active" 
                                ? "bg-emerald-50 text-emerald-600" 
                                : "bg-rose-50 text-rose-600"
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
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
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
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                u.status === "Active"
                                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              }`}
                            >
                              {u.status === "Active" ? "Disable" : "Enable"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Create User */}
          {showAddUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Provision Authorized User Account</h3>
                  <button onClick={() => setShowAddUser(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Full Name</label>
                    <input type="text" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="e.g. Tariq Mehmood" className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Username</label>
                      <input type="text" required value={newUserUsername} onChange={(e) => setNewUserUsername(e.target.value)} placeholder="tariq.m" className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">System Role</label>
                      <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as UserRole)} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800 font-bold">
                        <option value={UserRole.TEACHER}>Teacher</option>
                        <option value={UserRole.STUDENT}>Student</option>
                        <option value={UserRole.PARENT}>Parent</option>
                        <option value={UserRole.ACCOUNTANT}>Accountant</option>
                        <option value={UserRole.SCHOOL_ADMIN}>School Admin / Principal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Email Address</label>
                    <input type="email" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="tariq@alnoor.edu.pk" className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddUser(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer">Provision Account</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: STUDENTS LIFECYCLE ================= */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Photo</th>
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Scholar Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Admission No</th>
                    <th className="py-3 px-4">Guardian Contact</th>
                    <th className="py-3 px-4">Attendance %</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {schoolStudents.map(st => (
                    <tr key={st.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="py-3 px-4">
                        <div className="relative group w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {st.avatar || (st as any).photoUrl ? (
                            <img src={st.avatar || (st as any).photoUrl} alt={st.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-gray-500">{st.name.substring(0, 2).toUpperCase()}</span>
                          )}
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-[8px] font-bold">
                            Edit
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = async (ev) => {
                                    const base64 = ev.target?.result as string;
                                    await uploadStudentPhoto(st.id, activeSchool.id, base64);
                                    await onMutate("UPDATE", "students", { ...st, avatar: base64, photoUrl: base64 });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-500">{st.rollNo}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{st.name}</td>
                      <td className="py-3 px-4">{st.className} ({st.sectionName})</td>
                      <td className="py-3 px-4 font-mono text-gray-400">{st.admissionNo}</td>
                      <td className="py-3 px-4 text-gray-500">{st.guardianPhone}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{st.attendanceRate}%</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Remove student ${st.name}?`)) {
                              onMutate("DELETE", "students", { id: st.id });
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 cursor-pointer p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Admit Student */}
          {showAddStudent && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Admit New Scholar</h3>
                <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
                  {/* Photo upload box */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {stdPhoto ? (
                        <img src={stdPhoto} alt="Student preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400">Photo</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Scholar Profile Picture</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setStdPhoto(ev.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600 file:text-white file:cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Scholar Full Name</label>
                    <input type="text" required value={stdName} onChange={(e) => setStdName(e.target.value)} placeholder="Full Name" className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Class</label>
                      <select value={stdClassName} onChange={(e) => setStdClassName(e.target.value)} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800 font-bold">
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Roll No</label>
                      <input type="text" value={stdRollNo} onChange={(e) => setStdRollNo(e.target.value)} placeholder="01" className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Guardian Name</label>
                      <input type="text" required value={stdGuardianName} onChange={(e) => setStdGuardianName(e.target.value)} placeholder="Guardian Name" className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Guardian Contact</label>
                      <input type="text" required value={stdGuardianPhone} onChange={(e) => setStdGuardianPhone(e.target.value)} placeholder="+92-300-0000000" className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddStudent(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer">Admit Student</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: FACULTY STAFFING ================= */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schoolTeachers.map(tch => (
              <div key={tch.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{tch.name}</h4>
                    <p className="text-[11px] text-gray-400 font-mono">{tch.employeeId} • {tch.designation}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                    Salary: PKR {tch.salary?.toLocaleString() || "65,000"}
                  </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                  <p>Department: <strong className="text-gray-800 dark:text-gray-200">{tch.department}</strong></p>
                  <p>Classes: <strong className="text-gray-800 dark:text-gray-200">{tch.classesAssigned?.join(", ")}</strong></p>
                  <p>Contact: <strong className="text-gray-800 dark:text-gray-200">{tch.phone}</strong></p>
                </div>
              </div>
            ))}
          </div>

          {/* Modal: Appoint Teacher */}
          {showAddTeacher && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Appoint Faculty Instructor</h3>
                <form onSubmit={handleAddTeacher} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Instructor Full Name</label>
                    <input type="text" required value={tchName} onChange={(e) => setTchName(e.target.value)} placeholder="Full Name" className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Department</label>
                      <input type="text" required value={tchDepartment} onChange={(e) => setTchDepartment(e.target.value)} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Monthly Salary (PKR)</label>
                      <input type="number" required value={tchSalary} onChange={(e) => setTchSalary(Number(e.target.value))} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddTeacher(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer">Appoint</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: CLASSES & SUBJECTS ================= */}
      {activeTab === "classes_subjects" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {distinctClasses.map(cls => (
              <div key={cls} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-2">
                <h4 className="font-bold text-base text-gray-900 dark:text-white">{cls}</h4>
                <p className="text-xs text-gray-400">
                  {schoolStudents.filter(s => s.className === cls).length} Enrolled Scholars
                </p>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-xs space-y-1">
                  <p className="text-gray-500">Subjects: Mathematics, Physics, Chemistry, English, Urdu</p>
                  <p className="text-gray-500">Sections: Section A, Section B</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: TIMETABLES MASTER ================= */}
      {activeTab === "timetables" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {((dbState.timetable || (dbState as any).timetables || []) || []).map(tt => (
              <div key={tt.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{tt.subject} ({tt.className})</span>
                  <span className="font-mono text-[10px] text-gray-400">{tt.startTime} - {tt.endTime}</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">{tt.teacherName}</p>
                <span className="text-[10px] text-gray-400 block">{tt.dayOfWeek} • {tt.roomNumber}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5b: EXAM CENTER ================= */}
      {activeTab === "exam_center" && (() => {
        const allExamRecords: ExamRecord[] = ((dbState as any).examRecords || []).filter(
          (er: ExamRecord) => er.organizationId === activeSchool.id || !er.organizationId
        );
        const filtered = examTierFilter === "ALL" ? allExamRecords : allExamRecords.filter(er => er.examTier === examTierFilter);

        const tierStats = (tier: "Primary" | "Secondary" | "Annual") => {
          const t = allExamRecords.filter(er => er.examTier === tier);
          return { count: t.length, scheduled: t.filter(e => e.status === "Scheduled").length, completed: t.filter(e => e.status === "Completed" || e.status === "Results Declared").length };
        };

        const handleCreateExamRecord = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!erTitle || !erExamDate) { alert("Please fill all required fields."); return; }
          await onMutate("INSERT", "examRecords", {
            id: `er-${Date.now()}`,
            organizationId: activeSchool.id,
            examTier: erTier,
            title: erTitle,
            className: erClass,
            subject: erSubject,
            maxMarks: erMaxMarks,
            passingMarks: erPassingMarks,
            examDate: erExamDate,
            resultDate: erResultDate || null,
            status: "Scheduled",
            createdAt: new Date().toISOString(),
          });
          setErTitle(""); setErExamDate(""); setErResultDate("");
          setShowAddExamRecord(false);
          alert("Exam record scheduled successfully.");
        };

        const tierColors: Record<string, string> = {
          Primary: "indigo",
          Secondary: "emerald",
          Annual: "rose",
        };

        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">Examination Center</h3>
                <p className="text-xs text-gray-500">Schedule, manage, and track Primary, Secondary, and Annual examination records.</p>
              </div>
              <button
                onClick={() => setShowAddExamRecord(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-rose-600/20"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule Exam
              </button>
            </div>

            {/* Tier summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["Primary","Secondary","Annual"] as const).map(tier => {
                const stats = tierStats(tier);
                const col = tierColors[tier];
                return (
                  <button
                    key={tier}
                    onClick={() => setExamTierFilter(examTierFilter === tier ? "ALL" : tier)}
                    className={`p-5 rounded-3xl border text-left transition-all cursor-pointer ${
                      examTierFilter === tier
                        ? `bg-${col}-600 border-${col}-600 text-white shadow-lg`
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <p className={`text-[10px] font-extrabold uppercase tracking-wider ${examTierFilter === tier ? "text-white/70" : "text-gray-400"}`}>{tier} Exams</p>
                    <p className={`text-3xl font-extrabold mt-1 ${examTierFilter === tier ? "text-white" : "text-gray-900 dark:text-white"}`}>{stats.count}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] font-bold ${examTierFilter === tier ? "text-white/80" : "text-amber-500"}`}>🕐 {stats.scheduled} Scheduled</span>
                      <span className={`text-[10px] font-bold ${examTierFilter === tier ? "text-white/80" : "text-emerald-500"}`}>✓ {stats.completed} Completed</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Exam Records Table */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  {examTierFilter === "ALL" ? "All Exam Records" : `${examTierFilter} Exam Records`}
                  <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length})</span>
                </h4>
                <div className="flex gap-2">
                  {(["ALL","Primary","Secondary","Annual"] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => setExamTierFilter(tier)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        examTierFilter === tier ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Exam Title</th>
                      <th className="py-3 px-4">Tier</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Marks</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Result Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-gray-400 text-xs">
                          No {examTierFilter !== "ALL" ? examTierFilter : ""} exam records found. Schedule an exam to get started.
                        </td>
                      </tr>
                    )}
                    {filtered.map(er => {
                      const statusColor = er.status === "Scheduled" ? "amber" : er.status === "Ongoing" ? "blue" : er.status === "Completed" ? "emerald" : "indigo";
                      const tierColor = er.examTier === "Primary" ? "indigo" : er.examTier === "Secondary" ? "emerald" : "rose";
                      return (
                        <tr key={er.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{er.title}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-${tierColor}-50 dark:bg-${tierColor}-950/40 text-${tierColor}-600`}>
                              {er.examTier}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{er.className}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{er.subject}</td>
                          <td className="py-3 px-4 font-mono">{er.passingMarks}/{er.maxMarks}</td>
                          <td className="py-3 px-4 font-mono text-gray-500">{er.examDate}</td>
                          <td className="py-3 px-4 font-mono text-gray-500">{er.resultDate || "—"}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-${statusColor}-50 dark:bg-${statusColor}-950/40 text-${statusColor}-600`}>
                              {er.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Exam Modal */}
            {showAddExamRecord && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddExamRecord(false)}>
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-rose-500" /> Schedule Examination
                    </h3>
                    <button onClick={() => setShowAddExamRecord(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <form onSubmit={handleCreateExamRecord} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Exam Tier *</label>
                        <select value={erTier} onChange={e => setErTier(e.target.value as any)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold">
                          <option value="Primary">Primary</option>
                          <option value="Secondary">Secondary</option>
                          <option value="Annual">Annual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Class *</label>
                        <select value={erClass} onChange={e => setErClass(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold">
                          {["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Exam Title *</label>
                      <input value={erTitle} onChange={e => setErTitle(e.target.value)} placeholder="e.g. Annual Mathematics Final Examination 2025" required className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Subject *</label>
                      <select value={erSubject} onChange={e => setErSubject(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold">
                        {["Mathematics","English","Urdu","Physics","Chemistry","Biology","Computer Science","Pakistan Studies","Islamiat","General Science","Social Studies","Geography"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Max Marks</label>
                        <input type="number" value={erMaxMarks} onChange={e => setErMaxMarks(+e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Passing Marks</label>
                        <input type="number" value={erPassingMarks} onChange={e => setErPassingMarks(+e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Exam Date *</label>
                        <input type="date" value={erExamDate} onChange={e => setErExamDate(e.target.value)} required className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Result Date</label>
                        <input type="date" value={erResultDate} onChange={e => setErResultDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setShowAddExamRecord(false)} className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold cursor-pointer">Cancel</button>
                      <button type="submit" className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer">Schedule Exam</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ================= TAB 6: REPORTING CENTER ================= */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">
              Institutional Reporting &amp; Export Engine
            </h3>
            <p className="text-xs text-gray-500">
              Generate certified institutional records, formatted Excel spreadsheets (.xlsx), CSV files, and printable PDF ledgers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Student Enrollment Register */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Student Enrollment Register</h4>
              <p className="text-xs text-gray-400">Complete student biodata, admission numbers, guardian contacts.</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleExportStudents}
                  className="flex-1 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
                <button
                  onClick={() => exportStudentsExcel(schoolStudents, activeSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Excel (.xlsx)
                </button>
              </div>
            </div>

            {/* 2. Fee Invoicing Ledger */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Fee Invoicing Ledger (₨ PKR)</h4>
              <p className="text-xs text-gray-400">Fee collection, student balances, realized recoveries in PKR.</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleExportInvoices}
                  className="flex-1 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
                <button
                  onClick={() => exportFeesExcel(schoolInvoices, activeSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => exportFeeRegisterPDF(schoolInvoices, activeSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>

            {/* 3. Classroom Attendance Register */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Classroom Attendance Register</h4>
              <p className="text-xs text-gray-400">Daily attendance roll calls, presence ratios, and absent logs.</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => exportAttendanceExcel(dbState.attendance || [], "Campus Wide", new Date().toISOString().split("T")[0], activeSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => exportAttendancePDF(dbState.attendance || [], "Campus Wide", new Date().toISOString().split("T")[0], activeSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>

            {/* 4. Examination Results Matrix */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Examination Results Matrix</h4>
              <p className="text-xs text-gray-400">Term evaluation marks, grades, and percentage summaries.</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => exportResultsExcel(dbState.results || [], "Academic Session 2025-2026", activeSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => exportClassResultsPDF(dbState.results || [], "Academic Session 2025-2026", activeSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>

            {/* 5. Faculty Payroll Register */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Faculty Payroll Register</h4>
              <p className="text-xs text-gray-400">Staff salary disbursements, allowances, and net pay in PKR.</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => exportPayrollExcel(dbState.payrolls || (dbState as any).payroll || [], activeSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => exportPayrollPDF(dbState.payrolls || (dbState as any).payroll || [], activeSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>

            {/* 6. Complete System Backup */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Complete System Backup</h4>
              <p className="text-xs text-gray-400">Export all institutional data into portable Excel or JSON archives.</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => exportBackupJSON(dbState, activeSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  JSON
                </button>
                <button
                  onClick={() => exportBackupExcel(dbState, activeSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Excel (.xlsx)
                </button>
              </div>
            </div>

            {/* 7. Security Audit Trail */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Security Audit Log Report</h4>
              <p className="text-xs text-gray-400">Chronological history of mutations, user logins, and permissions.</p>
              <button
                onClick={() => {
                  exportToCsv("Audit_Logs", schoolAuditLogs, [
                    { key: "timestamp", label: "Timestamp" },
                    { key: "userName", label: "Actor" },
                    { key: "role", label: "Role" },
                    { key: "action", label: "Action" },
                    { key: "module", label: "Module" }
                  ]);
                }}
                className="w-full py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 font-bold text-xs hover:bg-purple-600 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Audit Stream (CSV)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: AUDIT LOGS ================= */}
      {activeTab === "audit_logs" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Module</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {schoolAuditLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="py-3 px-4 font-mono text-gray-400">{new Date(l.timestamp).toLocaleTimeString()}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{l.userName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-gray-800">
                          {l.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">{l.action}</td>
                      <td className="py-3 px-4 font-mono text-gray-400">{l.module}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 8: TRANSPORT & HOSTEL ================= */}
      {activeTab === "transport_hostel" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transport Routes */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Campus Transport Fleet</h4>
                <button onClick={() => setShowAddRoute(true)} className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
                  + Add Route
                </button>
              </div>
              <div className="space-y-2">
                {((dbState.transportRoutes || (dbState as any).routes || []) || []).map(r => (
                  <div key={r.id} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{r.routeName} ({r.vehicleNo})</p>
                      <p className="text-gray-400 text-[10px]">Driver: {r.driverName} • {r.driverPhone}</p>
                    </div>
                    <span className="font-bold text-indigo-600">PKR {r.fee}/mo</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hostel Rooms */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Hostel Accommodations</h4>
                <button onClick={() => setShowAddRoom(true)} className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer">
                  + Add Room
                </button>
              </div>
              <div className="space-y-2">
                {((dbState.hostelRooms || (dbState as any).rooms || []) || []).map(rm => (
                  <div key={rm.id} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Room #{rm.roomNo} ({rm.type})</p>
                      <p className="text-gray-400 text-[10px]">{rm.availableBeds} / {rm.totalBeds} Beds Available</p>
                    </div>
                    <span className="font-bold text-emerald-600">PKR {rm.fee}/term</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 9: LIBRARY ================= */}
      {activeTab === "library" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">Library Book Catalog</h3>
              <p className="text-xs text-gray-500">Track textbook copies and circulation.</p>
            </div>
            <button onClick={() => setShowAddBook(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
              + Add Title
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {((dbState.libraryBooks || (dbState as any).books || []) || []).map(b => (
              <div key={b.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                  {b.category}
                </span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{b.title}</h4>
                <p className="text-xs text-gray-400">Author: {b.author} • ISBN: {b.isbn}</p>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs">
                  <span className="text-gray-500">Available Copies:</span>
                  <span className="font-bold text-emerald-600">{b.availableCopies} / {b.totalCopies}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 10: SETTINGS ================= */}
      {activeTab === "settings" && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">School & Institutional Settings</h3>
            <p className="text-xs text-gray-500">Update branding, contact information, and academic session parameters.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1">School Name</label>
                <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Academic Session</label>
                <input type="text" value={academicSession} onChange={(e) => setAcademicSession(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Official Email</label>
                <input type="email" value={schoolEmail} onChange={(e) => setSchoolEmail(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Official Phone</label>
                <input type="text" value={schoolPhone} onChange={(e) => setSchoolPhone(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold" />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">Campus Address</label>
              <input type="text" value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold" />
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-md shadow-indigo-600/20">
                Save School Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 11: ANALYTICS & INSIGHTS ================= */}
      {activeTab === "analytics" && (
        <AnalyticsDashboard
          students={schoolStudents}
          teachers={schoolTeachers}
          feeInvoices={(dbState.feeInvoices || (dbState as any).invoices || []).filter(i => i.organizationId === activeSchool.id)}
          results={(dbState.results || []).filter(r => r.organizationId === activeSchool.id)}
        />
      )}

      {/* ================= TAB 12: ACADEMIC SESSIONS ================= */}
      {activeTab === "academic_sessions" && (
        <AcademicSessions
          students={schoolStudents}
          onPromotionComplete={() => {
            alert("Student promotion batch completed.");
          }}
        />
      )}

      {/* ================= TAB 13: APPROVAL WORKFLOWS ================= */}
      {activeTab === "workflows" && (
        <ApprovalWorkflows />
      )}

      {/* ================= TAB 14: DOCUMENT GENERATOR ================= */}
      {activeTab === "documents" && (
        <DocumentGenerator
          organization={activeSchool as any}
          students={schoolStudents}
          teachers={schoolTeachers}
          feeInvoices={(dbState.feeInvoices || (dbState as any).invoices || []).filter(i => i.organizationId === activeSchool.id)}
          payrolls={(dbState.payroll || (dbState as any).payrolls || []).filter(p => p.organizationId === activeSchool.id)}
        />
      )}

      {/* ================= TAB 15: DATA IMPORT CENTER ================= */}
      {activeTab === "import_center" && (
        <ImportCenter
          activeOrgId={activeSchool.id}
          onImportComplete={() => {
            alert("Data import processed successfully.");
          }}
        />
      )}

      {/* ================= TAB 16: SECURITY CENTER ================= */}
      {activeTab === "security_center" && (
        <SecurityCenter
          currentUser={currentUser}
          auditLogs={schoolAuditLogs}
        />
      )}
    </div>
  );
}
