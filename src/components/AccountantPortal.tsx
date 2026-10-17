/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI - Comprehensive Production-Ready Accountant Portal Pro Max
 * Complete Financial & Ledger Operations Center:
 * Revenue Dashboards (PKR), Student Fee Registers, Fee Structure Master,
 * Invoice Generator & Batch Billing, Partial Payment Settlements,
 * Printable Official Payment Receipts, Expense Tracking, Student Ledgers, and CSV Exports.
 */

import React, { useState, useMemo } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, Clock, Plus, Search, 
  CheckCircle, ArrowUpRight, ShieldAlert, Sparkles, AlertCircle, 
  Trash2, Landmark, Calculator, Download, Printer, FileText, 
  Users, Check, CreditCard, Filter, RefreshCw, X, Receipt,
  PieChart, BarChart2, ShieldCheck, UserCheck, Layers
} from "lucide-react";
import { DatabaseSchema } from "../../server/dbStore.js";
import { 
  FeeInvoice, ExpenseRecord, PayrollRecord, Student, 
  UserRole, AuditLog 
} from "../types.js";
import { exportToCsv, printHtmlDocument } from "../lib/api.js";
import { exportFeesExcel, exportPayrollExcel, exportFeeRegisterPDF, exportPayrollPDF, exportBackupExcel } from "../lib/reports.js";

interface AccountantPortalProps {
  dbState: DatabaseSchema;
  onMutate: (action: "INSERT" | "UPDATE" | "DELETE", table: string, data: any) => Promise<void>;
  isLoading: boolean;
  currentUser?: any;
}

type AccountantTab = 
  | "financial_dashboard"
  | "student_fees"
  | "invoices"
  | "fee_structures"
  | "expenses"
  | "payroll"
  | "reports"
  | "student_ledger"
  | "audit_trail";

export default function AccountantPortal({ dbState, onMutate, isLoading, currentUser }: AccountantPortalProps) {
  const [activeTab, setActiveTab] = useState<AccountantTab>("financial_dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("ALL");

  // Listen for sidebar tab navigation events
  React.useEffect(() => {
    const handleNav = (e: any) => {
      if (e.detail) {
        setActiveTab(e.detail as AccountantTab);
      }
    };
    window.addEventListener("edusphere:navigate-tab", handleNav);
    return () => window.removeEventListener("edusphere:navigate-tab", handleNav);
  }, []);

  // Active School
  const currentSchool = (dbState.organizations || []).find(o => o.id === currentUser?.organizationId) || 
                        (dbState.organizations || [])[0] || {
                          id: "org-pk-1",
                          name: "Al-Noor Model High School",
                          address: "Gulberg III, Lahore, Pakistan",
                          phone: "+92-42-35870001",
                          academicSession: "2025-2026"
                        };

  // Scoped Data
  const schoolStudents = useMemo(() => {
    return (dbState.students || []).filter(s => s.organizationId === currentSchool.id || !s.organizationId);
  }, [dbState.students, currentSchool.id]);

  const schoolInvoices = useMemo(() => {
    return (dbState.invoices || []).filter(i => i.organizationId === currentSchool.id || !i.organizationId);
  }, [dbState.invoices, currentSchool.id]);

  const schoolExpenses = useMemo(() => {
    return (dbState.expenses || []).filter(e => e.organizationId === currentSchool.id || !e.organizationId);
  }, [dbState.expenses, currentSchool.id]);

  const schoolPayrolls = useMemo(() => {
    return (dbState.payrolls || []).filter(p => p.organizationId === currentSchool.id || !p.organizationId);
  }, [dbState.payrolls, currentSchool.id]);

  const schoolAuditLogs = useMemo(() => {
    return (dbState.auditLogs || []).filter(l => l.organizationId === currentSchool.id || !l.organizationId);
  }, [dbState.auditLogs, currentSchool.id]);

  const distinctClasses = useMemo(() => {
    return Array.from(new Set(schoolStudents.map(s => s.className)));
  }, [schoolStudents]);

  // -------------------------------------------------------------
  // Computed Financial Metrics (in PKR)
  // -------------------------------------------------------------
  const totalInvoicedAmount = schoolInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPaidAmount = schoolInvoices.reduce((sum, i) => sum + (i.paidAmount || (i.status === "Paid" ? i.amount : 0)), 0);
  const totalOutstandingReceivables = totalInvoicedAmount - totalPaidAmount;
  const collectionRate = totalInvoicedAmount > 0 ? ((totalPaidAmount / totalInvoicedAmount) * 100).toFixed(1) : "0.0";

  const totalExpenseSum = schoolExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPayrollSum = schoolPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const netOperatingSurplus = totalPaidAmount - (totalExpenseSum + totalPayrollSum);

  // -------------------------------------------------------------
  // Modals & Form State
  // -------------------------------------------------------------
  // Single Invoice Modal
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [invStudentId, setInvStudentId] = useState(schoolStudents[0]?.id || "");
  const [invTitle, setInvTitle] = useState("Monthly Tuition Fee");
  const [invAmount, setInvAmount] = useState("12000");
  const [invDueDate, setInvDueDate] = useState(new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0]);

  // Batch Invoice Modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchClass, setBatchClass] = useState("Grade 10");
  const [batchTitle, setBatchTitle] = useState("Monthly Tuition & Lab Charges");
  const [batchAmount, setBatchAmount] = useState("12000");
  const [batchDueDate, setBatchDueDate] = useState(new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0]);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  // Payment Recording Modal
  const [recordingPaymentFor, setRecordingPaymentFor] = useState<FeeInvoice | null>(null);
  const [payAmountInput, setPayAmountInput] = useState("");
  const [payMethodInput, setPayMethodInput] = useState("Bank Transfer (1Link/1Bill)");
  const [payReferenceNo, setPayReferenceNo] = useState("");
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Expense Modal
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expCategory, setExpCategory] = useState<"Salary" | "Maintenance" | "Utilities" | "Events" | "Other">("Utilities");
  const [expAmount, setExpAmount] = useState("");

  // Ledger Selected Student
  const [ledgerStudentId, setLedgerStudentId] = useState(schoolStudents[0]?.id || "");

  // -------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = schoolStudents.find(s => s.id === invStudentId);
    if (!st || !invTitle.trim() || !invAmount) return;

    await onMutate("INSERT", "invoices", {
      studentId: st.id,
      studentName: st.name,
      className: st.className,
      title: invTitle.trim(),
      amount: Number(invAmount),
      paidAmount: 0,
      fine: 0,
      discount: 0,
      dueDate: invDueDate,
      status: "Unpaid",
      organizationId: currentSchool.id
    });

    setShowAddInvoice(false);
    alert(`Fee invoice created for ${st.name} (PKR ${Number(invAmount).toLocaleString()}).`);
  };

  const handleBatchGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    const classStudents = schoolStudents.filter(s => s.className === batchClass);
    if (classStudents.length === 0) {
      alert(`No scholars found in ${batchClass}.`);
      return;
    }

    setIsGeneratingBatch(true);
    for (const st of classStudents) {
      await onMutate("INSERT", "invoices", {
        studentId: st.id,
        studentName: st.name,
        className: st.className,
        title: batchTitle.trim(),
        amount: Number(batchAmount),
        paidAmount: 0,
        fine: 0,
        discount: 0,
        dueDate: batchDueDate,
        status: "Unpaid",
        organizationId: currentSchool.id
      });
    }

    setIsGeneratingBatch(false);
    setShowBatchModal(false);
    alert(`Batch fee generation completed! Generated ${classStudents.length} vouchers for ${batchClass}.`);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingPaymentFor) return;

    const remaining = recordingPaymentFor.amount - (recordingPaymentFor.paidAmount || 0);
    const amountToPay = Number(payAmountInput) || remaining;
    setIsSubmittingPay(true);

    const newPaidAmount = (recordingPaymentFor.paidAmount || 0) + amountToPay;
    const isFullyPaid = newPaidAmount >= recordingPaymentFor.amount;

    await onMutate("UPDATE", "invoices", {
      id: recordingPaymentFor.id,
      paidAmount: newPaidAmount,
      status: isFullyPaid ? "Paid" : "Partially Paid",
      paymentMethod: payMethodInput,
      payDate: new Date().toISOString().split("T")[0]
    });

    setIsSubmittingPay(false);
    setRecordingPaymentFor(null);
    setPayAmountInput("");
    setPayReferenceNo("");
    alert(`Payment of PKR ${amountToPay.toLocaleString()} recorded. Status: ${isFullyPaid ? "PAID" : "PARTIAL"}.`);
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expAmount) return;

    await onMutate("INSERT", "expenses", {
      title: expTitle.trim(),
      category: expCategory,
      amount: Number(expAmount),
      date: new Date().toISOString().split("T")[0],
      status: "Approved",
      organizationId: currentSchool.id
    });

    setShowAddExpense(false);
    setExpTitle("");
    setExpAmount("");
    alert("Operational expense recorded in general ledger.");
  };

  const handlePrintReceipt = (invoice: FeeInvoice) => {
    const html = `
      <div style="border: 2px solid #1e1b4b; padding: 32px; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 20px; color: #1e1b4b; font-weight: 800;">${currentSchool.name}</h1>
            <p style="color: #64748b; font-size: 11px;">Accounts & Finance Division • ${currentSchool.address}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-family: monospace; font-size: 13px; font-weight: bold; color: #4f46e5;">RECEIPT: #RCP-PK-${invoice.id.substring(4)}</p>
            <p style="color: #64748b; font-size: 11px;">Date: ${new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        <div style="margin-bottom: 24px; font-size: 12px; line-height: 1.8;">
          <p><strong>Student Name:</strong> ${invoice.studentName}</p>
          <p><strong>Class Grade:</strong> ${invoice.className}</p>
          <p><strong>Fee Title:</strong> ${invoice.title}</p>
          <p><strong>Payment Method:</strong> ${invoice.paymentMethod || 'Bank Transfer'}</p>
          <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">${invoice.status.toUpperCase()}</span></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Particulars</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Total Amount</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Paid Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${invoice.title}</td>
              <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">PKR ${invoice.amount.toLocaleString()}</td>
              <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #16a34a;">PKR ${(invoice.paidAmount || invoice.amount).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 60px; font-size: 12px;">
          <p style="border-top: 1px dashed #94a3b8; width: 160px; text-align: center; padding-top: 6px;">Cashier / Accountant</p>
          <p style="border-top: 1px dashed #94a3b8; width: 160px; text-align: center; padding-top: 6px;">Principal Seal</p>
        </div>
      </div>
    `;
    printHtmlDocument(`Receipt_${invoice.id}`, html);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ================= HEADER BANNER ================= */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-display font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              Accounts & Finance Command Desk
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {currentSchool.name} • Fee billing, partial collections, expense vouchers, and immutable student ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-600 hover:text-white text-purple-600 dark:text-purple-400 font-bold text-xs transition-all cursor-pointer border border-purple-200 dark:border-purple-800"
          >
            <Layers className="w-3.5 h-3.5" />
            Batch Class Billing
          </button>
          <button
            onClick={() => setShowAddInvoice(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Invoice
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 font-bold text-xs transition-all cursor-pointer border border-rose-200 dark:border-rose-800"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Expense
          </button>
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
          { id: "financial_dashboard", label: "Executive Dashboard", icon: Sparkles },
          { id: "student_fees", label: "Student Fee Directory", icon: Users },
          { id: "invoices", label: "Fee Vouchers & Invoices", icon: FileText },
          { id: "fee_structures", label: "Fee Structure Master", icon: Layers },
          { id: "expenses", label: "Operational Expenses", icon: DollarSign },
          { id: "student_ledger", label: "Student Ledger", icon: Calculator },
          { id: "reports", label: "Financial Reports & CSV", icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AccountantTab)}
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

      {/* ================= TAB 1: EXECUTIVE FINANCIAL DASHBOARD ================= */}
      {activeTab === "financial_dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total Billed Volume</p>
                <p className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mt-1">
                  PKR {totalInvoicedAmount.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{schoolInvoices.length} Vouchers Issued</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Realized Collections</p>
                <p className="text-2xl font-display font-extrabold text-emerald-600 mt-1">
                  PKR {totalPaidAmount.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{collectionRate}% Recovery Rate</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Outstanding Receivables</p>
                <p className="text-2xl font-display font-extrabold text-rose-600 mt-1">
                  PKR {totalOutstandingReceivables.toLocaleString()}
                </p>
                <p className="text-[10px] text-rose-600 font-semibold mt-0.5">Overdue balances</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Operating Net Surplus</p>
                <p className="text-2xl font-display font-extrabold text-purple-600 mt-1">
                  PKR {netOperatingSurplus.toLocaleString()}
                </p>
                <p className="text-[10px] text-purple-600 font-semibold mt-0.5">After Expenses & Payroll</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: STUDENT FEES DIRECTORY ================= */}
      {activeTab === "student_fees" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">
                Student Tuition & Fee Status Register
              </h3>
              <p className="text-xs text-gray-500">
                Search individual student balances, payment compliance, and contact details.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student or roll..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent focus:outline-none text-xs"
                />
              </div>

              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 font-semibold"
              >
                <option value="ALL">All Classes</option>
                {distinctClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Guardian Contact</th>
                    <th className="py-3 px-4 text-right">Outstanding Fee</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {schoolStudents
                    .filter(s => {
                      const matchClass = selectedClassFilter === "ALL" || s.className === selectedClassFilter;
                      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNo.includes(searchTerm);
                      return matchClass && matchSearch;
                    })
                    .map(st => {
                      const invs = schoolInvoices.filter(i => i.studentId === st.id);
                      const due = invs.reduce((sum, i) => sum + (i.amount - (i.paidAmount || 0)), 0);

                      return (
                        <tr key={st.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                          <td className="py-3 px-4 font-mono font-bold text-gray-500">{st.rollNo}</td>
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{st.name}</td>
                          <td className="py-3 px-4">{st.className}</td>
                          <td className="py-3 px-4 text-gray-500">{st.guardianPhone}</td>
                          <td className="py-3 px-4 text-right font-bold">
                            {due > 0 ? (
                              <span className="text-rose-600">PKR {due.toLocaleString()}</span>
                            ) : (
                              <span className="text-emerald-600">Cleared (0.00)</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setLedgerStudentId(st.id);
                                setActiveTab("student_ledger");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold hover:bg-indigo-100 cursor-pointer"
                            >
                              Ledger
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: INVOICES & PAYMENTS ================= */}
      {activeTab === "invoices" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">
                Fee Vouchers & Invoice Register
              </h3>
              <p className="text-xs text-gray-500">Record cash/bank payments, print receipts, and issue new challans.</p>
            </div>

            <select
              value={invoiceStatusFilter}
              onChange={(e) => setInvoiceStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 font-semibold"
            >
              <option value="ALL">All Invoice Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <div className="space-y-3">
            {schoolInvoices
              .filter(i => invoiceStatusFilter === "ALL" || i.status === invoiceStatusFilter)
              .map(inv => {
                const remaining = inv.amount - (inv.paidAmount || 0);

                return (
                  <div key={inv.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{inv.studentName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold">
                          {inv.className} • {inv.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === "Paid" ? "bg-emerald-50 text-emerald-600" :
                          inv.status === "Partially Paid" ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Total: <strong>PKR {inv.amount.toLocaleString()}</strong> • Paid: <strong>PKR {(inv.paidAmount || 0).toLocaleString()}</strong> • Remaining: <strong className="text-rose-600">PKR {remaining.toLocaleString()}</strong> • Due: {inv.dueDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrintReceipt(inv)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer hover:bg-gray-200"
                      >
                        <Printer className="w-3.5 h-3.5 inline mr-1" />
                        Print Receipt
                      </button>

                      {inv.status !== "Paid" && (
                        <button
                          onClick={() => {
                            setRecordingPaymentFor(inv);
                            setPayAmountInput(String(remaining));
                          }}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20"
                        >
                          Record Payment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Modal: Record Payment */}
          {recordingPaymentFor && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    Record Fee Payment — {recordingPaymentFor.studentName}
                  </h3>
                  <button onClick={() => setRecordingPaymentFor(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Payment Amount (PKR)</label>
                    <input
                      type="number"
                      required
                      min="100"
                      max={recordingPaymentFor.amount - (recordingPaymentFor.paidAmount || 0)}
                      value={payAmountInput}
                      onChange={(e) => setPayAmountInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Payment Method</label>
                    <select
                      value={payMethodInput}
                      onChange={(e) => setPayMethodInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 font-semibold"
                    >
                      <option value="Cash at Counter">Cash Deposit at Campus Cashier</option>
                      <option value="Bank Transfer (1Link/1Bill)">1Link / 1Bill Online Transfer</option>
                      <option value="Bank Cheque / Pay Order">Bank Cheque / Pay Order</option>
                      <option value="Debit/Credit Card">POS Terminal Card Swipe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Bank Ref / Transaction Code</label>
                    <input
                      type="text"
                      value={payReferenceNo}
                      onChange={(e) => setPayReferenceNo(e.target.value)}
                      placeholder="e.g. HBL-FT-991823"
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:bg-gray-800"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setRecordingPaymentFor(null)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold cursor-pointer">Cancel</button>
                    <button
                      type="submit"
                      disabled={isSubmittingPay}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingPay ? "Saving..." : "Commit Payment Record"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Create Single Invoice */}
          {showAddInvoice && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Issue Single Fee Voucher</h3>
                <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Select Scholar</label>
                    <select value={invStudentId} onChange={(e) => setInvStudentId(e.target.value)} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800 font-bold">
                      {schoolStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.className} - Roll #{s.rollNo})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Fee Description / Title</label>
                    <input type="text" required value={invTitle} onChange={(e) => setInvTitle(e.target.value)} placeholder="e.g. Term 1 Tuition Fee" className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Amount (PKR)</label>
                      <input type="number" required value={invAmount} onChange={(e) => setInvAmount(e.target.value)} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800 font-bold" />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Due Date</label>
                      <input type="date" required value={invDueDate} onChange={(e) => setInvDueDate(e.target.value)} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddInvoice(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer">Issue Invoice</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Batch Generate */}
          {showBatchModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Batch Class-Wide Fee Generation</h3>
                <form onSubmit={handleBatchGenerateInvoices} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Target Class Cohort</label>
                    <select value={batchClass} onChange={(e) => setBatchClass(e.target.value)} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800 font-bold">
                      {distinctClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Challan Description</label>
                    <input type="text" required value={batchTitle} onChange={(e) => setBatchTitle(e.target.value)} placeholder="e.g. Monthly Tuition Fee" className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Amount Per Scholar (PKR)</label>
                      <input type="number" required value={batchAmount} onChange={(e) => setBatchAmount(e.target.value)} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800 font-bold" />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Due Date</label>
                      <input type="date" required value={batchDueDate} onChange={(e) => setBatchDueDate(e.target.value)} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowBatchModal(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" disabled={isGeneratingBatch} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer disabled:opacity-50">
                      {isGeneratingBatch ? "Generating..." : "Generate Vouchers"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: FEE STRUCTURES ================= */}
      {activeTab === "fee_structures" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {distinctClasses.map(cls => (
              <div key={cls} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
                <h4 className="font-bold text-base text-gray-900 dark:text-white">{cls} Fee Structure</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">Monthly Tuition</span>
                    <span className="font-bold text-gray-900 dark:text-white">PKR 12,000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">Science Lab Levy</span>
                    <span className="font-bold text-gray-900 dark:text-white">PKR 1,500</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">Exam Assessment Fee</span>
                    <span className="font-bold text-gray-900 dark:text-white">PKR 2,000</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-indigo-600">
                    <span>Total Standard Term Fee</span>
                    <span>PKR 15,500</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: EXPENSES ================= */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          <div className="space-y-3">
            {schoolExpenses.map(exp => (
              <div key={exp.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{exp.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">{exp.category}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono block mt-1">Recorded: {exp.date}</span>
                </div>
                <span className="font-bold text-base text-rose-600">
                  PKR {exp.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Modal: Record Expense */}
          {showAddExpense && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Record Operational Expense</h3>
                <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Expense Title</label>
                    <input type="text" required value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="e.g. Campus Electricity & Generators" className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Category</label>
                      <select value={expCategory} onChange={(e) => setExpCategory(e.target.value as any)} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800">
                        <option value="Utilities">Utilities</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Salary">Salary</option>
                        <option value="Events">Events</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Amount (PKR)</label>
                      <input type="number" required value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-gray-800 font-bold" />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddExpense(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer">Record Expense</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 6: STUDENT LEDGER ================= */}
      {activeTab === "student_ledger" && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">
                Immutable Student Financial Ledger
              </h3>
              <p className="text-xs text-gray-500">Historical chronological record of fees, payments, and balances.</p>
            </div>

            <select
              value={ledgerStudentId}
              onChange={(e) => setLedgerStudentId(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
            >
              {schoolStudents.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Debit / Charged</th>
                  <th className="py-2.5 px-3 text-right">Credit / Paid</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {schoolInvoices
                  .filter(i => i.studentId === ledgerStudentId)
                  .map(inv => (
                    <tr key={inv.id}>
                      <td className="py-3 px-3 font-mono text-gray-400">{inv.dueDate}</td>
                      <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{inv.title}</td>
                      <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-white">PKR {inv.amount.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">PKR {(inv.paidAmount || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 7: REPORTS & EXPORT ================= */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Fee Invoicing Register</h4>
              <p className="text-xs text-gray-400">Complete historical fee billing ledger with collection & arrears.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    exportToCsv("Accountant_Invoices", schoolInvoices, [
                      { key: "id", label: "Invoice ID" },
                      { key: "studentName", label: "Student Name" },
                      { key: "className", label: "Class" },
                      { key: "title", label: "Fee Title" },
                      { key: "amount", label: "Amount (PKR)" },
                      { key: "paidAmount", label: "Paid (PKR)" },
                      { key: "status", label: "Status" },
                      { key: "dueDate", label: "Due Date" }
                    ]);
                  }}
                  className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
                <button
                  onClick={() => exportFeesExcel(schoolInvoices, currentSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => exportFeeRegisterPDF(schoolInvoices, currentSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  PDF Ledger
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Operational Expenses & Full Excel</h4>
              <p className="text-xs text-gray-400">Export campus expenditure records or generate a full Excel data export.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    exportToCsv("Accountant_Expenses", schoolExpenses, [
                      { key: "id", label: "Expense ID" },
                      { key: "title", label: "Expense Title" },
                      { key: "category", label: "Category" },
                      { key: "amount", label: "Amount (PKR)" },
                      { key: "date", label: "Date" }
                    ]);
                  }}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Expenses CSV
                </button>
                <button
                  onClick={() => exportBackupExcel(dbState, currentSchool.name)}
                  className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Full Excel (.xlsx)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
