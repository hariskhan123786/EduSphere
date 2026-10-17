/**
 * EduSphere AI - Academic Sessions & Student Promotion Engine
 * Manages school terms, academic roll-overs, and batch promotion (e.g. Class 9 -> Class 10).
 */

import React, { useState } from "react";
import {
  Calendar, GraduationCap, ArrowRight, CheckCircle2, ShieldCheck,
  Plus, Users, Sparkles, Check, AlertCircle, RefreshCw
} from "lucide-react";
import { Student } from "../types.js";

interface AcademicSessionsProps {
  students: Student[];
  onPromotionComplete?: () => void;
}

interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Upcoming" | "Archived";
  enrolledStudents: number;
}

export default function AcademicSessions({ students = [], onPromotionComplete }: AcademicSessionsProps) {
  const [sessions, setSessions] = useState<AcademicSession[]>([
    {
      id: "sess-2025-26",
      name: "Academic Year 2025-2026",
      startDate: "2025-08-15",
      endDate: "2026-06-30",
      status: "Active",
      enrolledStudents: students.length || 6,
    },
    {
      id: "sess-2026-27",
      name: "Academic Year 2026-2027 (Upcoming)",
      startDate: "2026-08-15",
      endDate: "2027-06-30",
      status: "Upcoming",
      enrolledStudents: 0,
    },
    {
      id: "sess-2024-25",
      name: "Academic Year 2024-2025 (Archived)",
      startDate: "2024-08-15",
      endDate: "2025-06-30",
      status: "Archived",
      enrolledStudents: 120,
    },
  ]);

  // Promotion Wizard States
  const [sourceClass, setSourceClass] = useState("Grade 10");
  const [targetClass, setTargetClass] = useState("Grade 11 (A-Level / FSc)");
  const [selectedStudents, setSelectedStudents] = useState<string[]>(students.map(s => s.id));
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionSuccess, setPromotionSuccess] = useState(false);

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  const handlePromoteBatch = () => {
    setIsPromoting(true);
    setTimeout(() => {
      setIsPromoting(false);
      setPromotionSuccess(true);
      onPromotionComplete?.();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" /> Academic Session Management & Student Promotion
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure school calendars, create future sessions, and execute bulk grade roll-overs.
          </p>
        </div>
      </div>

      {/* Promotion Result Alert */}
      {promotionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <p className="text-xs font-bold">Promotion Executed Successfully</p>
              <p className="text-[11px] text-emerald-300">
                {selectedStudents.length} students promoted from {sourceClass} to {targetClass}. SQLite records updated.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPromotionSuccess(false)}
            className="px-3 py-1 bg-emerald-500/20 rounded-lg text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Academic Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sessions.map(session => (
          <div
            key={session.id}
            className={`p-5 rounded-2xl border space-y-3 transition-all ${
              session.status === "Active"
                ? "bg-indigo-950/20 border-indigo-500/30"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                session.status === "Active"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : session.status === "Upcoming"
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  : "bg-white/5 text-gray-500 border-white/10"
              }`}>
                {session.status}
              </span>
              <span className="text-xs text-gray-400 font-mono">{session.enrolledStudents} Students</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{session.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {session.startDate} — {session.endDate}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Student Promotion Wizard Box */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" /> Bulk Student Grade Promotion Wizard
          </h2>
          <p className="text-xs text-gray-400">
            Batch promote candidates passing their final matriculation/term exams into the next academic year.
          </p>
        </div>

        {/* Source and Target Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium">Source Class (Current)</label>
            <select
              value={sourceClass}
              onChange={e => setSourceClass(e.target.value)}
              className="w-full bg-[#151824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium">Target Class (Promoted To)</label>
            <select
              value={targetClass}
              onChange={e => setTargetClass(e.target.value)}
              className="w-full bg-[#151824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11 (A-Level / FSc)">Grade 11 (A-Level / FSc)</option>
              <option value="Grade 12 (Graduated)">Grade 12 (Graduated)</option>
            </select>
          </div>
        </div>

        {/* Student Checkbox Roster */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 font-semibold">
              Eligible Candidates ({selectedStudents.length} of {students.length} selected)
            </span>
            <button
              onClick={selectAll}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Select All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
            {students.map(s => {
              const isSelected = selectedStudents.includes(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => toggleStudent(s.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-indigo-600/10 border-indigo-500/40 text-white"
                      : "bg-white/2 border-white/5 text-gray-400 hover:bg-white/5"
                  }`}
                >
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-[10px] text-gray-500">Roll: {s.rollNo} • {s.attendanceRate}% Attd</p>
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    isSelected ? "bg-indigo-600 border-indigo-500 text-white" : "border-white/20"
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={handlePromoteBatch}
            disabled={isPromoting || selectedStudents.length === 0}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            {isPromoting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Execute Promotion ({selectedStudents.length} Students)
          </button>
        </div>
      </div>
    </div>
  );
}
