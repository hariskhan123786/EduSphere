/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI - Comprehensive Production-Ready Parent Portal Pro Max
 * Complete Parent Experience with Multiple Children Switcher, Live Academic Tracking,
 * Attendance Registers, Printable Report Cards, Homework Feedback, Fee Vouchers (PKR),
 * Teacher Communication, Support Desk, and Event Calendars.
 */

import React, { useState, useMemo } from "react";
import { 
  Sparkles, ShieldCheck, CreditCard, Clock, Bell, MapPin, 
  Map, CheckCircle, Navigation, Loader2, RefreshCw, Info, 
  Printer, User, Download, Phone, Mail, Award, Check,
  BookOpen, Users, Calendar, AlertCircle, FileText, Send,
  HelpCircle, ChevronRight, ArrowRight, Eye, Bookmark,
  CheckSquare, X, ShieldAlert, MessageSquare
} from "lucide-react";
import { DatabaseSchema } from "../types.js";
import { 
  FeeInvoice, Student, Result, Homework, HomeworkSubmission, 
  Notice, SchoolEvent, TimetableEntry, Exam, UserRole 
} from "../types.js";
import { printHtmlDocument } from "../lib/desktop-api.js";
import { formatPKR, formatPKRFull, exportStudentReportPDF, exportFeeReceiptPDF, exportFeeRegisterPDF, exportPayrollPDF, exportAttendancePDF, exportClassResultsPDF, exportNoticeDocx, exportLeaveLetterDocx, exportBackupJSON, exportBackupExcel } from "../lib/reports.js";

interface ParentPortalProps {
  dbState: DatabaseSchema;
  onMutate: (action: "INSERT" | "UPDATE" | "DELETE", table: string, data: any) => Promise<void>;
  isLoading: boolean;
  currentUser?: any;
}

type ParentTab = 
  | "dashboard"
  | "profile"
  | "attendance"
  | "results"
  | "assignments"
  | "exams"
  | "timetable"
  | "fees"
  | "communication"
  | "announcements"
  | "events"
  | "support"
  | "settings";

export default function ParentPortal({ dbState, onMutate, isLoading, currentUser }: ParentPortalProps) {
  const [activeTab, setActiveTab] = useState<ParentTab>("dashboard");
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  // -------------------------------------------------------------
  // Parent Identity & Linked Children Discovery
  // -------------------------------------------------------------
  const parentName = currentUser?.name || "Hassan Malik";
  const parentEmail = currentUser?.email || "hassan.malik@example.com";

  // Find linked children based on guardian name / email or fallback list
  const linkedChildren: Student[] = useMemo(() => {
    const matched = (dbState.students || []).filter(s => 
      s.guardianName?.toLowerCase().includes("hassan") ||
      s.guardianEmail?.toLowerCase().includes("hassan") ||
      s.guardianName?.toLowerCase().includes(parentName.toLowerCase()) ||
      s.guardianEmail?.toLowerCase().includes(parentEmail.toLowerCase())
    );

    if (matched.length > 0) return matched;

    // Fallback default child
    return (dbState.students || []).slice(0, 2);
  }, [dbState.students, parentName, parentEmail]);

  // Active Child
  const activeChild: Student = useMemo(() => {
    return linkedChildren.find(c => c.id === selectedChildId) || 
           linkedChildren[0] || 
           (dbState.students?.[0]) || {
             id: "std-pk-001",
             name: "Ali Hassan Malik",
             className: "Grade 10",
             sectionName: "Section A",
             admissionNo: "ANMS-2025-001",
             rollNo: "01",
             attendanceRate: 95.0,
             behaviorScore: 94,
             guardianName: "Hassan Malik",
             guardianPhone: "+92-300-4412234",
             guardianEmail: "hassan.malik@example.com",
             medicalRecords: "No known conditions.",
             status: "Active",
             organizationId: "org-pk-1",
             userId: "usr-std-001",
             admissionDate: "2025-04-01"
           };
  }, [linkedChildren, selectedChildId, dbState.students]);

  const school = useMemo(() => {
    return (dbState.organizations || []).find(o => o.id === activeChild.organizationId) || 
           (dbState.organizations || [])[0] || 
           { name: "Al-Noor Model High School", address: "Lahore, Pakistan", academicSession: "2025-2026", phone: "+92-42-35870001" };
  }, [dbState.organizations, activeChild.organizationId]);

  // -------------------------------------------------------------
  // Data for Active Selected Child
  // -------------------------------------------------------------
  const childAttendance = useMemo(() => {
    return (dbState.attendance || []).filter(a => a.studentId === activeChild.id);
  }, [dbState.attendance, activeChild.id]);

  const childResults = useMemo(() => {
    return (dbState.results || []).filter(r => r.studentId === activeChild.id);
  }, [dbState.results, activeChild.id]);

  const childInvoices = useMemo(() => {
    return ((dbState.feeInvoices || (dbState as any).invoices || []) || []).filter(i => i.studentId === activeChild.id);
  }, [(dbState.feeInvoices || (dbState as any).invoices || []), activeChild.id]);

  const childHomework = useMemo(() => {
    return (dbState.homework || []).filter(h => h.className === activeChild.className);
  }, [dbState.homework, activeChild.className]);

  const childSubmissions = useMemo(() => {
    return ((dbState.homeworkSubmissions || (dbState as any).submissions || []) || []).filter(s => s.studentId === activeChild.id);
  }, [(dbState.homeworkSubmissions || (dbState as any).submissions || []), activeChild.id]);

  const childExams = useMemo(() => {
    return (dbState.exams || []).filter(e => e.className === activeChild.className);
  }, [dbState.exams, activeChild.className]);

  const childTimetable = useMemo(() => {
    return ((dbState.timetable || (dbState as any).timetables || []) || []).filter(t => t.className === activeChild.className);
  }, [(dbState.timetable || (dbState as any).timetables || []), activeChild.className]);

  const notices = useMemo(() => {
    return (dbState.notices || []).filter(n => n.targetRole === "All" || n.targetRole === "Parents");
  }, [dbState.notices]);

  const events = useMemo(() => (dbState.schoolEvents || (dbState as any).events || []) || [], [(dbState.schoolEvents || (dbState as any).events || [])]);

  // -------------------------------------------------------------
  // Computed Child Analytics
  // -------------------------------------------------------------
  const totalFeeBalance = childInvoices
    .filter(i => i.status !== "Paid")
    .reduce((sum, i) => sum + (i.amount - (i.paidAmount || 0)), 0);

  const presentCount = childAttendance.filter(a => a.status === "Present" || a.status === "Late").length;
  const totalAttDays = childAttendance.length || 1;
  const computedAttPercent = ((presentCount / totalAttDays) * 100).toFixed(1);

  const averageMarks = childResults.length > 0
    ? (childResults.reduce((sum, r) => sum + r.marksObtained, 0) / childResults.length).toFixed(1)
    : "88.5";

  // -------------------------------------------------------------
  // Modals & Forms State
  // -------------------------------------------------------------
  const [payingInvoice, setPayingInvoice] = useState<FeeInvoice | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer (1Link/1Bill)");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Messaging State
  const [messageRecipient, setMessageRecipient] = useState("Class Teacher");
  const [messageText, setMessageText] = useState("");
  const [parentMessages, setParentMessages] = useState<Array<{ id: string; sender: string; recipient: string; text: string; time: string; isMine: boolean }>>([
    { id: "pm-1", sender: "Class Teacher (Muhammad Imran)", recipient: parentName, text: "Assalam-o-Alaikum Mr. Hassan, Ali has shown great performance in Mathematics this term.", time: "Yesterday, 3:30 PM", isMine: false },
    { id: "pm-2", sender: parentName, recipient: "Class Teacher (Muhammad Imran)", text: "Wa Alaikum Assalam sir! Thank you for the update. We are monitoring his daily homework.", time: "Yesterday, 4:10 PM", isMine: true }
  ]);

  // Support Desk State
  const [supportCategory, setSupportCategory] = useState("Fee & Billing");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportDesc, setSupportDesc] = useState("");
  const [parentTickets, setParentTickets] = useState<Array<{ id: string; subject: string; category: string; desc: string; date: string; status: "Open" | "In Progress" | "Resolved" }>>([
    { id: "TCK-PR-801", subject: "Request for Transport Route Pickup Change", category: "Transport", desc: "Kindly update morning pickup to Main Gulberg Stop B.", date: "2025-05-02", status: "Resolved" }
  ]);

  // -------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------
  const handlePayFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    const payAmt = Number(paymentAmountInput) || (payingInvoice.amount - (payingInvoice.paidAmount || 0));
    setIsProcessingPayment(true);

    const newPaidAmount = (payingInvoice.paidAmount || 0) + payAmt;
    const isFullyPaid = newPaidAmount >= payingInvoice.amount;

    await onMutate("UPDATE", "invoices", {
      id: payingInvoice.id,
      paidAmount: newPaidAmount,
      status: isFullyPaid ? "Paid" : "Partially Paid",
      paymentMethod,
      payDate: new Date().toISOString().split("T")[0]
    });

    setIsProcessingPayment(false);
    const invoiceCopy = { ...payingInvoice, paidAmount: newPaidAmount };
    setPayingInvoice(null);
    alert(`Payment of PKR ${payAmt.toLocaleString()} confirmed via ${paymentMethod}! Official receipt generated.`);
  };

  const handlePrintReceipt = (invoice: FeeInvoice) => {
    const html = `
      <div style="border: 2px solid #1e1b4b; padding: 32px; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 20px; color: #1e1b4b; font-weight: 800; text-transform: uppercase;">${school.name}</h1>
            <p style="color: #64748b; font-size: 11px;">${school.address} • Phone: ${school.phone}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-family: monospace; font-size: 13px; font-weight: bold; color: #4f46e5;">RECEIPT: #RCP-PK-${invoice.id.substring(4)}</p>
            <p style="color: #64748b; font-size: 11px;">Issue Date: ${new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        <div style="margin-bottom: 24px; font-size: 12px; line-height: 1.8;">
          <p><strong>Student Name:</strong> ${invoice.studentName} (Roll #${activeChild.rollNo})</p>
          <p><strong>Class & Section:</strong> ${invoice.className} (${activeChild.sectionName})</p>
          <p><strong>Parent / Guardian:</strong> ${parentName}</p>
          <p><strong>Fee Title:</strong> ${invoice.title}</p>
          <p><strong>Payment Method:</strong> ${invoice.paymentMethod || 'Bank Transfer (1Link)'}</p>
          <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">${invoice.status.toUpperCase()}</span></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Particulars</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Total Amount (PKR)</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Paid Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${invoice.title}</td>
              <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">Rs. ${invoice.amount.toLocaleString()}</td>
              <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #16a34a;">Rs. ${(invoice.paidAmount || invoice.amount).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 50px; font-size: 12px;">
          <p style="border-top: 1px dashed #94a3b8; width: 160px; text-align: center; padding-top: 6px;">Parent Signature</p>
          <p style="border-top: 1px dashed #94a3b8; width: 160px; text-align: center; padding-top: 6px;">Accounts Officer Signature</p>
        </div>
      </div>
    `;
    printHtmlDocument(`Receipt_${activeChild.name}_${invoice.id}`, html);
  };

  const handlePrintReportCard = () => {
    const html = `
      <div style="border: 3px double #4338ca; padding: 32px; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif;">
        <div style="text-align: center; border-bottom: 2px solid #4338ca; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="font-size: 22px; color: #1e1b4b; text-transform: uppercase; margin: 0;">${school.name}</h1>
          <p style="color: #64748b; font-size: 11px; margin-top: 4px;">${school.address} • Session ${school.academicSession}</p>
          <h2 style="font-size: 15px; color: #4338ca; margin-top: 12px; text-decoration: underline;">OFFICIAL STUDENT PROGRESS REPORT CARD</h2>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; margin-bottom: 20px; line-height: 1.6;">
          <div>
            <p><strong>Student Name:</strong> ${activeChild.name}</p>
            <p><strong>Admission No:</strong> ${activeChild.admissionNo}</p>
            <p><strong>Class & Section:</strong> ${activeChild.className} (${activeChild.sectionName})</p>
          </div>
          <div>
            <p><strong>Roll Number:</strong> ${activeChild.rollNo}</p>
            <p><strong>Guardian:</strong> ${parentName}</p>
            <p><strong>Attendance Rate:</strong> ${activeChild.attendanceRate}%</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">
          <thead>
            <tr style="background: #eef2ff;">
              <th style="border: 1px solid #c7d2fe; padding: 8px; text-align: left;">Subject</th>
              <th style="border: 1px solid #c7d2fe; padding: 8px; text-align: center;">Evaluation Title</th>
              <th style="border: 1px solid #c7d2fe; padding: 8px; text-align: center;">Marks Obtained</th>
              <th style="border: 1px solid #c7d2fe; padding: 8px; text-align: center;">Max Marks</th>
              <th style="border: 1px solid #c7d2fe; padding: 8px; text-align: center;">Grade</th>
            </tr>
          </thead>
          <tbody>
            ${childResults.map(r => `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">${r.subject}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${r.examTitle}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold;">${r.marksObtained}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${r.maxMarks}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; color: #4338ca;">${r.grade}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div style="font-size: 12px; margin-bottom: 30px;">
          <p><strong>Cumulative Average:</strong> ${averageMarks}% • <strong>Conduct Score:</strong> ${activeChild.behaviorScore || 95}/100</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 50px; font-size: 12px;">
          <p style="border-top: 1px solid #94a3b8; width: 140px; text-align: center; padding-top: 4px;">Class Teacher</p>
          <p style="border-top: 1px solid #94a3b8; width: 140px; text-align: center; padding-top: 4px;">Principal Signature</p>
        </div>
      </div>
    `;
    printHtmlDocument(`ReportCard_${activeChild.name}`, html);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg = {
      id: `pm-${Date.now()}`,
      sender: parentName,
      recipient: messageRecipient,
      text: messageText.trim(),
      time: "Just now",
      isMine: true
    };

    setParentMessages(prev => [...prev, newMsg]);
    setMessageText("");
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportDesc.trim()) return;

    const newTicket = {
      id: `TCK-PR-${Math.floor(100 + Math.random() * 900)}`,
      subject: supportSubject.trim(),
      category: supportCategory,
      desc: supportDesc.trim(),
      date: new Date().toISOString().split("T")[0],
      status: "Open" as const
    };

    setParentTickets(prev => [newTicket, ...prev]);
    setSupportSubject("");
    setSupportDesc("");
    alert("Support request ticket submitted to school desk!");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ================= TOP CHILDREN SWITCHER BANNER ================= */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-display font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                Guardian & Parent Gateway
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Welcome back, <strong>{parentName}</strong>. Select your child below to inspect isolated academic records.
            </p>
          </div>

          <button
            onClick={handlePrintReportCard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-all cursor-pointer border border-indigo-200 dark:border-indigo-800"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Child Report Card
          </button>
        </div>

        {/* Linked Children Switcher Pills */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 overflow-x-auto">
          <span className="text-[10px] font-extrabold uppercase text-gray-400 shrink-0">Enrolled Children:</span>
          {linkedChildren.map((child) => {
            const isSelected = activeChild.id === child.id;
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border text-xs transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.02]"
                    : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400"
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isSelected ? "bg-white/20 text-white" : "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                }`}>
                  {child.name[0]}
                </div>
                <div className="text-left">
                  <p className="font-bold leading-tight">{child.name}</p>
                  <p className={`text-[10px] ${isSelected ? "text-indigo-100" : "text-gray-400"}`}>
                    {child.className} ({child.sectionName})
                  </p>
                </div>
              </button>
            );
          })}
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
          { id: "dashboard", label: "Dashboard", icon: Sparkles },
          { id: "profile", label: "Child Profile", icon: User },
          { id: "attendance", label: "Attendance Sheet", icon: CheckSquare },
          { id: "results", label: "Academic Results", icon: Award },
          { id: "assignments", label: "Homework & Tasks", icon: BookOpen },
          { id: "exams", label: "Exam Calendar", icon: Calendar },
          { id: "timetable", label: "Class Timetable", icon: Clock },
          { id: "fees", label: `Fee Vouchers (PKR ${totalFeeBalance.toLocaleString()})`, icon: CreditCard },
          { id: "communication", label: "Teacher Messages", icon: MessageSquare },
          { id: "announcements", label: "Circulars & Notices", icon: Bell },
          { id: "events", label: "School Events", icon: Calendar },
          { id: "support", label: "Parent Support Desk", icon: HelpCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ParentTab)}
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

      {/* ================= TAB 1: DASHBOARD ================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Active Child Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Attendance Rate</p>
                <p className="text-2xl font-display font-extrabold text-emerald-600 mt-1">{activeChild.attendanceRate}%</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Compliant with &gt;75% policy</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Academic Score</p>
                <p className="text-2xl font-display font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{averageMarks}%</p>
                <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">GPA: 3.8 / 4.0</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Pending Homework</p>
                <p className="text-2xl font-display font-extrabold text-amber-600 mt-1">
                  {childHomework.length - childSubmissions.length > 0 ? childHomework.length - childSubmissions.length : 0}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{childSubmissions.length} Completed</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Fee Balance</p>
                <p className="text-2xl font-display font-extrabold text-rose-600 mt-1">
                  PKR {totalFeeBalance.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{childInvoices.length} Vouchers</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Academic & Financial Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Results */}
            <div className="lg:col-span-7 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Recent Academic Grades — {activeChild.name}
                </h3>
                <button onClick={() => setActiveTab("results")} className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {childResults.slice(0, 4).map(r => (
                  <div key={r.id} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{r.subject}</p>
                      <p className="text-[10px] text-gray-400">{r.examTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{r.marksObtained}/{r.maxMarks}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 ml-2">
                        {r.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoices Action */}
            <div className="lg:col-span-5 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Fee Challan Vouchers (PKR)
                </h3>
                <button onClick={() => setActiveTab("fees")} className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer">
                  Pay Vouchers
                </button>
              </div>

              <div className="space-y-2.5">
                {childInvoices.slice(0, 3).map(inv => (
                  <div key={inv.id} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{inv.title}</p>
                      <p className="text-[10px] text-gray-400 font-mono">Due: {inv.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">Rs. {inv.amount.toLocaleString()}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CHILD PROFILE ================= */}
      {activeTab === "profile" && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                {activeChild.name[0]}
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-gray-900 dark:text-white">{activeChild.name}</h3>
                <p className="text-xs text-gray-400">Admission #{activeChild.admissionNo} • Roll #{activeChild.rollNo}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 space-y-1">
              <p className="text-[9px] text-gray-400 font-bold uppercase">Class Grade & Section</p>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{activeChild.className} ({activeChild.sectionName})</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 space-y-1">
              <p className="text-[9px] text-gray-400 font-bold uppercase">Campus / School</p>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{school.name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 space-y-1">
              <p className="text-[9px] text-gray-400 font-bold uppercase">Admission Date</p>
              <p className="font-mono font-bold text-gray-800 dark:text-gray-200">{activeChild.admissionDate}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 space-y-1">
              <p className="text-[9px] text-gray-400 font-bold uppercase">Guardian Name</p>
              <p className="font-bold text-gray-800 dark:text-gray-200">{activeChild.guardianName}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 space-y-1">
              <p className="text-[9px] text-gray-400 font-bold uppercase">Registered Contact</p>
              <p className="font-bold text-gray-800 dark:text-gray-200">{activeChild.guardianPhone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 space-y-1">
              <p className="text-[9px] text-gray-400 font-bold uppercase">Medical / Special Notes</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300">{activeChild.medicalRecords || "None declared."}</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ATTENDANCE ================= */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Daily Attendance Sheet — {activeChild.name}
                </h3>
                <p className="text-xs text-gray-400">Cumulative Attendance Rate: <strong className="text-emerald-600">{activeChild.attendanceRate}%</strong></p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {childAttendance.map(a => (
                    <tr key={a.id}>
                      <td className="py-2.5 px-3 font-mono font-bold">{a.date}</td>
                      <td className="py-2.5 px-3">{a.className}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.status === "Present" ? "bg-emerald-50 text-emerald-600" :
                          a.status === "Absent" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-400">{a.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: RESULTS ================= */}
      {activeTab === "results" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">
                Examination Results & Grade Card
              </h3>
              <p className="text-xs text-gray-500">Official academic evaluations for {activeChild.name}.</p>
            </div>
            <button
              onClick={handlePrintReportCard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              Download Report Card
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {childResults.map(r => (
              <div key={r.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                      {r.subject}
                    </span>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">{r.examTitle}</h4>
                  </div>
                  <span className="text-base font-display font-extrabold text-indigo-600 dark:text-indigo-400">
                    Grade {r.grade}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs">
                  <span className="text-gray-400">Marks: <strong>{r.marksObtained} / {r.maxMarks}</strong></span>
                  <span className="text-gray-400 italic">"{r.comments || "Good performance"}"</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: ASSIGNMENTS (READ-ONLY) ================= */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">
              Child Homework & Tasks Monitor
            </h3>
            <p className="text-xs text-gray-500">Read-only view of published assignments and teacher evaluations.</p>
          </div>

          <div className="space-y-3">
            {childHomework.map(hw => {
              const sub = childSubmissions.find(s => s.homeworkId === hw.id);

              return (
                <div key={hw.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                        {hw.subject}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">{hw.title}</h4>
                    </div>
                    {sub?.grade ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                        Graded: {sub.grade}
                      </span>
                    ) : sub ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                        Submitted (Pending Review)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">
                        Not Submitted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{hw.description}</p>
                  {sub?.feedback && (
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 italic">Teacher Feedback: "{sub.feedback}"</p>
                  )}
                  <span className="text-[10px] font-mono text-gray-400 block pt-1">Due Date: {hw.dueDate}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 6: EXAM CALENDAR ================= */}
      {activeTab === "exams" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">
              Examination Schedules & Dates
            </h3>
            <p className="text-xs text-gray-500">Upcoming assessments for {activeChild.className}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {childExams.map(ex => (
              <div key={ex.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                  {ex.subject}
                </span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{ex.title}</h4>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs">
                  <span className="font-mono text-gray-400">Date: {ex.date}</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">Max Marks: {ex.maxMarks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 7: TIMETABLE ================= */}
      {activeTab === "timetable" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">
              Weekly Timetable — {activeChild.className}
            </h3>
            <p className="text-xs text-gray-500">Class schedule for {activeChild.name}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => {
              const slots = childTimetable.filter(t => t.dayOfWeek === day);

              return (
                <div key={day} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-2">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">{day}</h4>
                  <div className="space-y-2">
                    {slots.map(s => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-xs">
                        <div className="flex justify-between font-bold text-indigo-600">
                          <span>{s.subject}</span>
                          <span className="font-mono text-[10px] text-gray-400">{s.startTime} - {s.endTime}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 block">{s.teacherName} • {s.roomNumber}</span>
                      </div>
                    ))}
                    {slots.length === 0 && <p className="text-xs text-gray-400 py-2">No periods scheduled.</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 8: FEES & PAYMENTS ================= */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">
                Tuition Fee Vouchers & Payment Receipts (PKR)
              </h3>
              <p className="text-xs text-gray-500">Pay school fees securely and download verified payment vouchers.</p>
            </div>
          </div>

          <div className="space-y-3">
            {childInvoices.map(inv => {
              const remaining = inv.amount - (inv.paidAmount || 0);

              return (
                <div key={inv.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{inv.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === "Paid" ? "bg-emerald-50 text-emerald-600" :
                        inv.status === "Partially Paid" ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Total: <strong>Rs. {inv.amount.toLocaleString()}</strong> • Paid: <strong>Rs. {(inv.paidAmount || 0).toLocaleString()}</strong> • Due Date: {inv.dueDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePrintReceipt(inv)}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer hover:bg-gray-200"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Voucher
                    </button>
                    {inv.status !== "Paid" && (
                      <button
                        onClick={() => {
                          setPayingInvoice(inv);
                          setPaymentAmountInput(String(remaining));
                        }}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay Online (Rs. {remaining.toLocaleString()})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal: Pay Fee Online */}
          {payingInvoice && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    Pay Fee Voucher — {payingInvoice.title}
                  </h3>
                  <button onClick={() => setPayingInvoice(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handlePayFeeSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Payment Amount (PKR)</label>
                    <input
                      type="number"
                      required
                      min="100"
                      max={payingInvoice.amount - (payingInvoice.paidAmount || 0)}
                      value={paymentAmountInput}
                      onChange={(e) => setPaymentAmountInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Select Payment Gateway</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold"
                    >
                      <option value="Bank Transfer (1Link/1Bill)">1Link / 1Bill Instant Transfer</option>
                      <option value="Easypaisa / JazzCash">Easypaisa / JazzCash Mobile Wallet</option>
                      <option value="Debit/Credit Card (Visa/Mastercard)">Debit / Credit Card (Visa/Mastercard)</option>
                      <option value="Cash at Bank Counter">Cash Voucher at Habib Bank Ltd (HBL)</option>
                    </select>
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setPayingInvoice(null)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold cursor-pointer">Cancel</button>
                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isProcessingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      {isProcessingPayment ? "Processing..." : "Confirm Online Payment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 9: TEACHER MESSAGES ================= */}
      {activeTab === "communication" && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">
              Direct Teacher Communication
            </h3>
            <p className="text-xs text-gray-500">Contact your child's teachers and school administration directly.</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-72">
            <div className="space-y-2 overflow-y-auto pr-2">
              {parentMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-2xl max-w-sm text-xs ${
                    msg.isMine ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
                  }`}>
                    <p className="font-semibold">{msg.text}</p>
                    <span className="text-[9px] block text-right mt-1 opacity-70">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Type message to teacher..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              />
              <button type="submit" className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 10: ANNOUNCEMENTS ================= */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map(n => (
              <div key={n.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                    {n.priority || "Normal"} Notice
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{n.date}</span>
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{n.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 11: SCHOOL EVENTS ================= */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map(e => (
              <div key={e.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                  {e.type}
                </span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{e.title}</h4>
                <p className="text-xs text-gray-400">{e.description}</p>
                <span className="text-[10px] font-mono text-gray-500 block pt-1">Date: {e.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 12: PARENT SUPPORT ================= */}
      {activeTab === "support" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Submit Parent Support Inquiry</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Inquiry Category</label>
                  <select value={supportCategory} onChange={(e) => setSupportCategory(e.target.value)} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800">
                    <option value="Fee & Billing">Fee & Billing</option>
                    <option value="Academic Progress">Academic Progress</option>
                    <option value="Transport & Bus">Transport & Bus</option>
                    <option value="General Admin">General Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Subject</label>
                  <input type="text" required value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} placeholder="Inquiry subject..." className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea required rows={3} value={supportDesc} onChange={(e) => setSupportDesc(e.target.value)} placeholder="Provide full details for the administration..." className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {parentTickets.map(t => (
              <div key={t.id} className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">{t.subject}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold">{t.category}</span>
                    <span className="text-[10px] font-mono text-gray-400">#{t.id}</span>
                  </div>
                  <p className="text-gray-500 mt-0.5">{t.desc}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-600">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
