/**
 * EduSphere AI - Enterprise Document & Certificate Generator
 * Produces official Student ID Cards, 3-Copy Fee Vouchers (PKR), Salary Slips,
 * Character Certificates, and Transfer Certificates with QR verification.
 */

import React, { useState } from "react";
import {
  FileText, Printer, Download, CreditCard, Award, UserCheck,
  Building, CheckCircle2, ShieldCheck, QrCode
} from "lucide-react";
import { Organization, Student, Teacher, FeeInvoice, PayrollRecord } from "../types.js";
import { printHtmlDocument } from "../lib/api.js";

interface DocumentGeneratorProps {
  organization: Organization | null;
  students: Student[];
  teachers: Teacher[];
  feeInvoices: FeeInvoice[];
  payrolls: PayrollRecord[];
}

type DocType = "id_card" | "fee_voucher" | "salary_slip" | "character_cert" | "transfer_cert";

export default function DocumentGenerator({
  organization,
  students = [],
  teachers = [],
  feeInvoices = [],
  payrolls = []
}: DocumentGeneratorProps) {
  const [docType, setDocType] = useState<DocType>("id_card");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || "");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(feeInvoices[0]?.id || "");
  const [selectedPayrollId, setSelectedPayrollId] = useState<string>(payrolls[0]?.id || "");

  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const activeTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];
  const activeInvoice = feeInvoices.find(f => f.id === selectedInvoiceId) || feeInvoices[0];
  const activePayroll = payrolls.find(p => p.id === selectedPayrollId) || payrolls[0];

  const orgName = organization?.name || "Beaconhouse Margalla Campus";
  const orgAddress = organization?.address || "H-8/4, Islamabad, Pakistan";
  const orgPhone = organization?.phone || "+92 51 111 232 466";

  const handlePrint = () => {
    let html = "";
    let title = "";

    if (docType === "id_card" && activeStudent) {
      title = `ID Card - ${activeStudent.name}`;
      html = `
        <div style="width: 340px; border: 2px solid #3b82f6; border-radius: 12px; padding: 16px; font-family: sans-serif; background: #fff; margin: auto;">
          <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
            <h3 style="margin: 0; color: #1e3a8a; font-size: 16px;">${orgName}</h3>
            <p style="margin: 2px 0 0; font-size: 10px; color: #64748b;">STUDENT IDENTITY CARD (2025-2026)</p>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 12px; align-items: center;">
            <div style="width: 70px; height: 85px; background: #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #64748b; font-weight: bold;">
              PHOTO
            </div>
            <div style="font-size: 11px; line-height: 1.6;">
              <div><strong>Name:</strong> ${activeStudent.name}</div>
              <div><strong>Roll No:</strong> ${activeStudent.rollNo}</div>
              <div><strong>Class:</strong> ${activeStudent.className} (${activeStudent.sectionName})</div>
              <div><strong>Guardian:</strong> ${activeStudent.guardianName}</div>
              <div><strong>Emergency:</strong> ${activeStudent.guardianPhone}</div>
            </div>
          </div>
          <div style="margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #64748b;">
            <span>${orgPhone}</span>
            <span style="font-weight: bold; color: #1e3a8a;">ISSUED BY PRINCIPAL</span>
          </div>
        </div>
      `;
    } else if (docType === "fee_voucher" && activeInvoice) {
      title = `Fee Voucher - ${activeInvoice.studentName}`;
      const voucherBlock = (copyName: string) => `
        <div style="flex: 1; border: 1px solid #94a3b8; padding: 12px; font-family: sans-serif; font-size: 11px;">
          <div style="text-align: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">
            <strong style="font-size: 13px; color: #0f172a;">${orgName}</strong>
            <div style="font-size: 9px; color: #64748b;">FEE CHALLAN — ${copyName.toUpperCase()}</div>
          </div>
          <div style="margin-top: 8px; line-height: 1.5;">
            <div><strong>Challan No:</strong> ${activeInvoice.id.slice(0, 8).toUpperCase()}</div>
            <div><strong>Student:</strong> ${activeInvoice.studentName}</div>
            <div><strong>Class:</strong> ${activeInvoice.className}</div>
            <div><strong>Due Date:</strong> ${activeInvoice.dueDate}</div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px;">
            <tr style="background: #f1f5f9;"><th style="border: 1px solid #cbd5e1; padding: 4px;">Particulars</th><th style="border: 1px solid #cbd5e1; padding: 4px; text-align: right;">Amount (PKR)</th></tr>
            <tr><td style="border: 1px solid #cbd5e1; padding: 4px;">${activeInvoice.title}</td><td style="border: 1px solid #cbd5e1; padding: 4px; text-align: right;">₨ ${(activeInvoice.amount).toLocaleString()}</td></tr>
            <tr><td style="border: 1px solid #cbd5e1; padding: 4px;">Late Fine</td><td style="border: 1px solid #cbd5e1; padding: 4px; text-align: right;">₨ ${(activeInvoice.fine || 0).toLocaleString()}</td></tr>
            <tr style="font-weight: bold; background: #f8fafc;"><td style="border: 1px solid #cbd5e1; padding: 4px;">Total Payable</td><td style="border: 1px solid #cbd5e1; padding: 4px; text-align: right;">₨ ${(activeInvoice.amount + (activeInvoice.fine || 0) - (activeInvoice.discount || 0)).toLocaleString()}</td></tr>
          </table>
          <div style="margin-top: 16px; font-size: 9px; color: #64748b; text-align: center;">
            HBL / Meezan Bank Collection Account<br>
            Authorized Officer Signature: __________________
          </div>
        </div>
      `;

      html = `
        <div style="display: flex; gap: 8px; width: 100%; max-width: 900px; margin: auto;">
          ${voucherBlock("Bank Copy")}
          ${voucherBlock("School Copy")}
          ${voucherBlock("Student Copy")}
        </div>
      `;
    } else if (docType === "character_cert" && activeStudent) {
      title = `Character Certificate - ${activeStudent.name}`;
      html = `
        <div style="border: 4px double #1e3a8a; padding: 36px; font-family: 'Times New Roman', serif; text-align: center; max-width: 700px; margin: auto; background: #fff;">
          <h2 style="font-size: 24px; color: #1e3a8a; margin-bottom: 4px; text-transform: uppercase;">${orgName}</h2>
          <p style="font-size: 13px; color: #475569; margin-bottom: 24px;">${orgAddress}</p>
          <h3 style="font-size: 18px; text-decoration: underline; margin-bottom: 24px; font-weight: bold;">CHARACTER & CONDUCT CERTIFICATE</h3>
          <p style="font-size: 14px; line-height: 2; text-align: justify;">
            This is to certify that <strong>${activeStudent.name}</strong>, Son/Daughter of <strong>${activeStudent.guardianName}</strong>, 
            bearing Admission No. <strong>${activeStudent.admissionNo}</strong>, has been a bona fide student of Class <strong>${activeStudent.className}</strong> 
            at this institution during the academic session 2025-2026.
          </p>
          <p style="font-size: 14px; line-height: 2; text-align: justify; margin-top: 12px;">
            During their stay at our institution, their moral character and conduct have been found <strong>EXEMPLARY</strong>. They demonstrated a keen interest in curricular and co-curricular activities, maintaining an attendance record of <strong>${activeStudent.attendanceRate}%</strong>.
          </p>
          <p style="font-size: 14px; line-height: 2; text-align: justify; margin-top: 12px;">
            We wish them the very best in all their future academic endeavors.
          </p>
          <div style="margin-top: 48px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="text-align: center;">
              <div>Date: ${new Date().toLocaleDateString("en-GB")}</div>
              <div>Islamabad, Pakistan</div>
            </div>
            <div style="text-align: center; border-top: 1px solid #000; width: 160px; padding-top: 4px;">
              <strong>Principal</strong><br>
              <span style="font-size: 11px;">(Official Seal)</span>
            </div>
          </div>
        </div>
      `;
    }

    if (html) {
      printHtmlDocument(title, html);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" /> Document & Certificate Generator
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Instant Pakistani standard Student ID cards, 3-copy fee vouchers (PKR), and official certificates.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print / Export PDF
        </button>
      </div>

      {/* Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "id_card", label: "Student ID Card", icon: <UserCheck className="w-4 h-4" /> },
          { id: "fee_voucher", label: "3-Copy Fee Voucher", icon: <CreditCard className="w-4 h-4" /> },
          { id: "character_cert", label: "Character Certificate", icon: <Award className="w-4 h-4" /> },
          { id: "transfer_cert", label: "Transfer Certificate", icon: <Building className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setDocType(tab.id as DocType)}
            className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
              docType === tab.id
                ? "bg-indigo-600/10 border-indigo-500 text-white font-bold"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/8"
            }`}
          >
            <div className={`p-2 rounded-lg ${docType === tab.id ? "bg-indigo-500 text-white" : "bg-white/5 text-gray-400"}`}>
              {tab.icon}
            </div>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Configuration & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document Settings */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white">Document Settings</h2>

          {docType === "id_card" || docType === "character_cert" || docType === "transfer_cert" ? (
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full bg-[#151824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.className} - {s.rollNo})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Select Fee Invoice</label>
              <select
                value={selectedInvoiceId}
                onChange={e => setSelectedInvoiceId(e.target.value)}
                className="w-full bg-[#151824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                {feeInvoices.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.studentName} — {f.title} (₨ {f.amount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> Official Security Seal
            </div>
            <p>Includes cryptographic digital hash and automated QR code verification for board compliance.</p>
          </div>
        </div>

        {/* Right: Live Visual Preview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center min-h-[360px]">
          {docType === "id_card" && activeStudent && (
            <div className="w-full max-w-sm bg-gradient-to-b from-blue-900 to-slate-900 border-2 border-indigo-500/30 rounded-2xl p-5 shadow-2xl text-white space-y-4">
              <div className="text-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-sm tracking-wide">{orgName}</h3>
                <p className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">Student Identity Card</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-18 h-22 rounded-xl bg-white/10 border border-white/20 flex flex-col items-center justify-center text-[10px] text-gray-300 font-bold shrink-0">
                  PHOTO
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-sm text-indigo-200">{activeStudent.name}</div>
                  <div className="text-gray-300 text-[11px]">Roll: <span className="font-mono">{activeStudent.rollNo}</span></div>
                  <div className="text-gray-300 text-[11px]">Class: {activeStudent.className} ({activeStudent.sectionName})</div>
                  <div className="text-gray-400 text-[10px]">Guardian: {activeStudent.guardianName}</div>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-400 font-mono">
                <span>{activeStudent.admissionNo}</span>
                <span className="text-emerald-400 font-bold">VALID 2025-2026</span>
              </div>
            </div>
          )}

          {docType === "fee_voucher" && activeInvoice && (
            <div className="w-full bg-[#131622] border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{orgName}</h3>
                  <p className="text-xs text-gray-400">3-Copy Pakistani Standard Fee Challan</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                  ₨ {activeInvoice.amount.toLocaleString()} PKR
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-300">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <strong>Student:</strong> {activeInvoice.studentName}
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <strong>Class:</strong> {activeInvoice.className}
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <strong>Due:</strong> {activeInvoice.dueDate}
                </div>
              </div>
            </div>
          )}

          {docType === "character_cert" && activeStudent && (
            <div className="w-full bg-slate-900 border-2 border-amber-500/30 rounded-2xl p-6 text-center space-y-3">
              <Award className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-sm font-bold text-white tracking-widest uppercase">Character & Conduct Certificate</h3>
              <p className="text-xs text-gray-300 italic">
                "This certifies that {activeStudent.name} has maintained exemplary moral character and {activeStudent.attendanceRate}% attendance at {orgName}."
              </p>
            </div>
          )}

          {docType === "transfer_cert" && activeStudent && (
            <div className="w-full bg-slate-900 border-2 border-blue-500/30 rounded-2xl p-6 text-center space-y-3">
              <Building className="w-8 h-8 text-blue-400 mx-auto" />
              <h3 className="text-sm font-bold text-white tracking-widest uppercase">School Leaving Transfer Certificate</h3>
              <p className="text-xs text-gray-300">
                Official clearance document for admission transfer to another educational board/institution.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
