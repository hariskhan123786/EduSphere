/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  SCHOOL_ADMIN = "SCHOOL_ADMIN",
  PRINCIPAL = "PRINCIPAL",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  PARENT = "PARENT",
  ACCOUNTANT = "ACCOUNTANT",
  LIBRARIAN = "LIBRARIAN",
  TRANSPORT_MANAGER = "TRANSPORT_MANAGER"
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string;
  primaryColor: string;
  academicSession: string;
  plan: "Growth" | "Professional" | "Enterprise";
  mrr: number;
  status: "Active" | "Suspended";
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string | null; // null for Super Admin
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  name: string;
  avatar: string;
  phone?: string;
  status: "Active" | "Inactive" | "Hidden";
  isHidden?: boolean;
}

export interface Student {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  admissionNo: string;
  rollNo: string;
  className: string;
  sectionName: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  medicalRecords: string;
  behaviorScore: number; // 0 - 100
  attendanceRate: number; // Percentage
  status: "Active" | "Inactive" | "Promoted" | "Transferred";
  admissionDate: string;
  dob?: string;
  gender?: string;
  address?: string;
  cnic?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  avatar?: string;
  photoUrl?: string;
}

export interface Teacher {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  employeeId: string;
  department: string;
  qualification: string;
  designation: string;
  phone: string;
  email?: string;
  salary?: number;
  classesAssigned: string[];
  subjectsAssigned: string[];
}

export interface AttendanceRecord {
  id: string;
  organizationId: string;
  studentId: string;
  studentName: string;
  className: string;
  sectionName?: string;
  date: string;
  status: "Present" | "Absent" | "Late" | "Excused";
  remarks?: string;
}

export interface FeeInvoice {
  id: string;
  organizationId: string;
  studentId: string;
  studentName: string;
  className: string;
  title: string;
  amount: number;
  fine: number;
  discount: number;
  paidAmount: number;
  dueDate: string;
  status: "Paid" | "Unpaid" | "Partially Paid" | "Overdue";
  paymentMethod?: string;
  payDate?: string;
}

export interface Homework {
  id: string;
  organizationId: string;
  className: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  createdByName: string;
  attachmentUrl?: string;
}

export interface HomeworkSubmission {
  id: string;
  organizationId: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  submissionContent: string;
  fileUrl?: string;
  grade?: string;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

export interface Exam {
  id: string;
  organizationId: string;
  className: string;
  subject: string;
  title: string;
  maxMarks: number;
  date: string;
  status: "Scheduled" | "Completed" | "Graded";
}

export interface Result {
  id: string;
  organizationId: string;
  examId: string;
  examTitle: string;
  subject: string;
  studentId: string;
  studentName: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  comments: string;
}

export interface TimetableEntry {
  id: string;
  organizationId: string;
  className: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  roomNumber: string;
  entryType?: "class" | "free" | "break";
}

export interface ExamRecord {
  id: string;
  organizationId: string;
  examTier: "Primary" | "Secondary" | "Annual";
  title: string;
  className: string;
  subject: string;
  maxMarks: number;
  passingMarks: number;
  examDate: string;
  resultDate?: string;
  status: "Scheduled" | "Ongoing" | "Completed" | "Results Declared";
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  organizationId: string;
  applicantName: string;
  role: UserRole;
  leaveType: "Sick" | "Casual" | "Emergency" | "Maternity" | "Annual";
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface PayrollRecord {
  id: string;
  organizationId: string;
  teacherId: string;
  employeeName: string;
  monthYear: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentStatus: "Paid" | "Pending";
  payoutDate: string;
}

export interface Notice {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  targetRole: "All" | "Teachers" | "Students" | "Parents";
  priority?: "Normal" | "Important" | "Urgent";
  date: string;
  author: string;
}

export interface SchoolEvent {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  date: string;
  type: "academic" | "sports" | "cultural" | "holiday";
}

export interface LibraryBook {
  id: string;
  organizationId: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

export interface TransportRoute {
  id: string;
  organizationId: string;
  routeName: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  fee: number;
}

export interface HostelRoom {
  id: string;
  organizationId: string;
  roomNo: string;
  type: "Single" | "Double" | "Dormitory";
  totalBeds: number;
  availableBeds: number;
  fee: number;
}

export interface AuditLog {
  id: string;
  organizationId: string | null;
  userName: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
}

export interface ExpenseRecord {
  id: string;
  organizationId: string;
  title: string;
  category: "Salary" | "Maintenance" | "Utilities" | "Events" | "Other";
  amount: number;
  date: string;
  status: "Approved" | "Pending";
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  durationMs?: number;
}

export interface DatabaseSchema {
  organizations: Organization[];
  users: User[];
  students: Student[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  invoices?: FeeInvoice[];
  feeInvoices: FeeInvoice[];
  expenses: ExpenseRecord[];
  payroll: PayrollRecord[];
  payrolls?: PayrollRecord[];
  homework: Homework[];
  submissions?: HomeworkSubmission[];
  homeworkSubmissions: HomeworkSubmission[];
  exams: Exam[];
  results: Result[];
  timetable: TimetableEntry[];
  timetables?: TimetableEntry[];
  examRecords?: ExamRecord[];
  leaveRequests: LeaveRequest[];
  notices: Notice[];
  schoolEvents: SchoolEvent[];
  events?: SchoolEvent[];
  libraryBooks: LibraryBook[];
  books?: LibraryBook[];
  transportRoutes: TransportRoute[];
  routes?: TransportRoute[];
  hostelRooms: HostelRoom[];
  rooms?: HostelRoom[];
  auditLogs: AuditLog[];
}
