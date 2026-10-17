/**
 * EduSphere AI Desktop - Enterprise Multi-Stage Approval Workflows
 * Review chains for Marks Publishing, Fee Concessions, Staff Leaves, and Student Transfers.
 */

import React, { useState } from "react";
import {
  CheckCircle2, XCircle, Clock, ShieldCheck, FileCheck, ArrowRight,
  User, Check, X, AlertCircle, Building, Award, CreditCard
} from "lucide-react";
import { UserRole } from "../types.js";

export interface ApprovalItem {
  id: string;
  type: "result_publishing" | "fee_discount" | "leave_request" | "student_transfer";
  title: string;
  applicant: string;
  applicantRole: string;
  departmentOrClass: string;
  details: string;
  requestedAt: string;
  status: "Pending" | "Approved" | "Rejected";
  currentStage: string;
  totalStages: number;
  stageNumber: number;
}

const DEFAULT_APPROVALS: ApprovalItem[] = [
  {
    id: "appr-1",
    type: "result_publishing",
    title: "Mid-Term Physics Results Approval (Grade 10-A)",
    applicant: "Prof. Asad Ullah",
    applicantRole: "Senior Physics Lecturer",
    departmentOrClass: "Grade 10-A (30 Students)",
    details: "Average Score: 88.5%, Highest: 98%. All practical assignments verified.",
    requestedAt: "Today at 09:30 AM",
    status: "Pending",
    currentStage: "Principal Review & Final Sign-Off",
    totalStages: 3,
    stageNumber: 2,
  },
  {
    id: "appr-2",
    type: "fee_discount",
    title: "Need-Based Concession: Hamza Ali Abbasi",
    applicant: "Mr. Farooq (Accountant)",
    applicantRole: "Senior Accountant",
    departmentOrClass: "Grade 10-A (BSS-2025-0103)",
    details: "Requested 25% discount (₨ 10,000 concession) on Term 1 tuition fee.",
    requestedAt: "Yesterday at 03:15 PM",
    status: "Pending",
    currentStage: "School Director Approval",
    totalStages: 2,
    stageNumber: 1,
  },
  {
    id: "appr-3",
    type: "leave_request",
    title: "Emergency Medical Leave (2 Days)",
    applicant: "Ms. Maryam Siddiqui",
    applicantRole: "Head of Mathematics",
    departmentOrClass: "Mathematics Department",
    details: "Substitute teacher Engr. Bilal Khan will cover Grade 10 Algebra periods.",
    requestedAt: "Yesterday at 11:00 AM",
    status: "Approved",
    currentStage: "Approved by Principal",
    totalStages: 2,
    stageNumber: 2,
  },
  {
    id: "appr-4",
    type: "student_transfer",
    title: "Board Migration Certificate: Zainab Bibi",
    applicant: "Registrar Office",
    applicantRole: "Admissions Admin",
    departmentOrClass: "Grade 10-A",
    details: "Family relocating to Lahore (Beaconhouse Model Town Campus transfer).",
    requestedAt: "2 days ago",
    status: "Approved",
    currentStage: "Clearance Complete",
    totalStages: 3,
    stageNumber: 3,
  },
];

export default function ApprovalWorkflows() {
  const [items, setItems] = useState<ApprovalItem[]>(() => {
    const saved = localStorage.getItem("edusphere_approvals");
    return saved ? JSON.parse(saved) : DEFAULT_APPROVALS;
  });

  const [activeTab, setActiveTab] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAction = (id: string, newStatus: "Approved" | "Rejected") => {
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          currentStage: newStatus === "Approved" ? "Completed & Published" : "Rejected / Returned to Originator"
        };
      }
      return item;
    });
    setItems(updated);
    localStorage.setItem("edusphere_approvals", JSON.stringify(updated));
    setToastMessage(`Workflow record marked as ${newStatus}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = items.filter(item => {
    if (activeTab === "pending") return item.status === "Pending";
    if (activeTab === "approved") return item.status === "Approved";
    if (activeTab === "rejected") return item.status === "Rejected";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-indigo-400" /> Multi-Stage Approval Workflows
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Strict chain of custody for Exam Marks, Fee Waivers, Staff Leaves, and Student Transfers.
          </p>
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Workflow Items List */}
      <div className="space-y-4">
        {filtered.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 hover:border-white/20 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl shrink-0 ${
                  item.type === "result_publishing"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : item.type === "fee_discount"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : item.type === "leave_request"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                }`}>
                  {item.type === "result_publishing" ? <Award className="w-5 h-5" /> :
                   item.type === "fee_discount" ? <CreditCard className="w-5 h-5" /> :
                   item.type === "leave_request" ? <User className="w-5 h-5" /> :
                   <Building className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.status === "Approved"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : item.status === "Rejected"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Initiated by <strong className="text-gray-200">{item.applicant}</strong> ({item.applicantRole}) • {item.requestedAt}
                  </p>
                </div>
              </div>

              {item.status === "Pending" && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(item.id, "Rejected")}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleAction(item.id, "Approved")}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-xs text-gray-300">
              <span className="text-gray-500 font-semibold">Details: </span>
              {item.details}
            </div>

            {/* Stage Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1 text-indigo-400">
                  <Clock className="w-3.5 h-3.5" /> Stage {item.stageNumber} of {item.totalStages}: {item.currentStage}
                </span>
                <span className="font-mono">{Math.round((item.stageNumber / item.totalStages) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.status === "Approved" ? "bg-emerald-500" : item.status === "Rejected" ? "bg-rose-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${(item.stageNumber / item.totalStages) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
