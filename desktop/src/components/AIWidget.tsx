/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Send, Copy, Check, Loader2, AlertTriangle, BookOpen, FileQuestion, MessageCircle, HelpCircle, TrendingUp } from "lucide-react";
import { generateAI } from "../lib/desktop-api.js";
import { UserRole } from "../types.js";

interface AIWidgetProps {
  currentRole?: UserRole;
  userRole?: UserRole;
  orgName?: string;
  organizationId?: string;
  studentContext?: any;
  invoiceContext?: any;
}

export default function AIWidget({ 
  currentRole, 
  userRole, 
  orgName = "EduSphere International Academy", 
  studentContext, 
  invoiceContext 
}: AIWidgetProps) {
  const effectiveRole = currentRole || userRole || UserRole.STUDENT;
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (effectiveRole === UserRole.TEACHER) return "lesson";
    if (effectiveRole === UserRole.ACCOUNTANT) return "fee_risk";
    return "assistant";
  });

  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("Grade 10");
  const [objectives, setObjectives] = useState("");
  const [qLevel, setQLevel] = useState("analytical");
  const [promptMsg, setPromptMsg] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAIInvocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setResultText("");

    try {
      let type: "lesson_planner" | "question_generator" | "report_comments" | "fee_prediction" | "general_chatbot" = "general_chatbot";
      let context: any = {};

      if (activeTab === "lesson") {
        if (!topic || !subject) throw new Error("Please specify both subject and lesson topic.");
        type = "lesson_planner";
        context = { className: grade, subject, topic, objectives };
      } else if (activeTab === "questions") {
        if (!topic || !subject) throw new Error("Please specify both subject and question topic.");
        type = "question_generator";
        context = { className: grade, subject, topic, level: qLevel };
      } else if (activeTab === "comments") {
        type = "report_comments";
        context = { 
          studentName: studentContext?.name || "Lucas Miller", 
          className: studentContext?.className || "Grade 10",
          grade: studentContext?.grade || "A", 
          attendanceRate: studentContext?.attendanceRate || 95, 
          behaviorScore: studentContext?.behaviorScore || 90 
        };
      } else if (activeTab === "fee_risk") {
        type = "fee_prediction";
        context = {
          studentName: invoiceContext?.studentName || "Lucas Miller",
          className: invoiceContext?.className || "Grade 10",
          invoiceTitle: invoiceContext?.title || "Laboratory & Computer Lab Fee",
          amount: invoiceContext?.amount || 250,
          dueDate: invoiceContext?.dueDate || "2026-07-10",
          attendanceRate: invoiceContext?.attendanceRate || 94.5,
          behaviorScore: invoiceContext?.behaviorScore || 92
        };
      } else {
        if (!promptMsg.trim()) throw new Error("Please type an inquiry for the AI Assistant.");
        type = "general_chatbot";
        context = { role: effectiveRole, orgName, message: promptMsg };
      }

      const aiResponse = await generateAI(type, context);
      setResultText(aiResponse);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "An error occurred during generation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-assistant-widget" className="glass-panel rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 px-5 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-200 animate-pulse" />
          <div>
            <h3 className="font-display font-semibold tracking-tight text-sm">EduSphere GenAI Hub</h3>
            <p className="text-[10px] text-indigo-100">Powered by Groq AI</p>
          </div>
        </div>
        <div className="bg-white/15 text-white text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
          Desktop AI Assistant
        </div>
      </div>

      <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 overflow-x-auto text-xs font-medium">
        {effectiveRole === UserRole.TEACHER && (
          <>
            <button
              onClick={() => { setActiveTab("lesson"); setErrorMsg(""); }}
              className={`flex items-center gap-1.5 px-4 py-3 whitespace-nowrap border-b-2 transition-all ${
                activeTab === "lesson" 
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-950/40" 
                  : "border-transparent text-gray-500 hover:text-gray-950"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Lesson Planner
            </button>
            <button
              onClick={() => { setActiveTab("questions"); setErrorMsg(""); }}
              className={`flex items-center gap-1.5 px-4 py-3 whitespace-nowrap border-b-2 transition-all ${
                activeTab === "questions" 
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-950/40" 
                  : "border-transparent text-gray-500 hover:text-gray-950"
              }`}
            >
              <FileQuestion className="w-3.5 h-3.5" />
              Exam Generator
            </button>
            <button
              onClick={() => { setActiveTab("comments"); setErrorMsg(""); }}
              className={`flex items-center gap-1.5 px-4 py-3 whitespace-nowrap border-b-2 transition-all ${
                activeTab === "comments" 
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-950/40" 
                  : "border-transparent text-gray-500 hover:text-gray-950"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Report Cards
            </button>
          </>
        )}

        {effectiveRole === UserRole.ACCOUNTANT && (
          <button
            onClick={() => { setActiveTab("fee_risk"); setErrorMsg(""); }}
            className={`flex items-center gap-1.5 px-4 py-3 whitespace-nowrap border-b-2 transition-all ${
              activeTab === "fee_risk" 
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-950/40" 
                : "border-transparent text-gray-500 hover:text-gray-950"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Risk Predictor
          </button>
        )}

        <button
          onClick={() => { setActiveTab("assistant"); setErrorMsg(""); }}
          className={`flex items-center gap-1.5 px-4 py-3 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "assistant" 
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-950/40" 
              : "border-transparent text-gray-500 hover:text-gray-950"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          AI School Chat
        </button>
      </div>

      <div className="p-5 flex flex-col md:flex-row gap-5 h-[480px]">
        <form onSubmit={handleAIInvocation} className="w-full md:w-5/12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-4 md:pb-0 md:pr-5">
          <div className="space-y-4 overflow-y-auto pr-1">
            {activeTab === "lesson" && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Molecular Biology"
                    className="w-full text-xs rounded-lg border border-gray-200 p-2 dark:bg-gray-900 dark:border-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Topic / Theme</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Photosynthesis Cycle"
                    className="w-full text-xs rounded-lg border border-gray-200 p-2 dark:bg-gray-900 dark:border-gray-800"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Class Grade</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full text-xs rounded-lg border border-gray-200 p-2 bg-white dark:bg-gray-900 dark:border-gray-800"
                    >
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Custom Objectives</label>
                  <textarea
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    placeholder="e.g. Focus on differences between C3 and C4 pathways."
                    className="w-full h-16 text-xs rounded-lg border border-gray-200 p-2 dark:bg-gray-900 dark:border-gray-800 resize-none"
                  />
                </div>
              </>
            )}

            {activeTab === "questions" && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Chemistry"
                    className="w-full text-xs rounded-lg border border-gray-200 p-2 dark:bg-gray-900 dark:border-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Organic Polymers"
                    className="w-full text-xs rounded-lg border border-gray-200 p-2 dark:bg-gray-900 dark:border-gray-800"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Cognitive Level</label>
                    <select
                      value={qLevel}
                      onChange={(e) => setQLevel(e.target.value)}
                      className="w-full text-xs rounded-lg border border-gray-200 p-2 bg-white dark:bg-gray-900 dark:border-gray-800"
                    >
                      <option value="recall">Recall/Factual</option>
                      <option value="analytical">Analytical</option>
                      <option value="creative">Creative Critique</option>
                      <option value="synthesis">Synthesis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Class Grade</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full text-xs rounded-lg border border-gray-200 p-2 bg-white dark:bg-gray-900 dark:border-gray-800"
                    >
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeTab === "comments" && (
              <div className="bg-gray-50 dark:bg-gray-900/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
                <span className="font-semibold text-indigo-600 block">Report Card Comments Generator</span>
                <p className="text-gray-500 text-[11px]">This model uses active student profile data to construct narrative grade reviews.</p>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-1.5 text-gray-600 dark:text-gray-400">
                  <p>🧑‍🎓 <strong>Student</strong>: {studentContext?.name || "Lucas Miller"}</p>
                  <p>📊 <strong>Attendance</strong>: {studentContext?.attendanceRate || "94.5"}%</p>
                  <p>📝 <strong>Est. Grade</strong>: {studentContext?.grade || "A"}</p>
                  <p>🧠 <strong>Behavior Index</strong>: {studentContext?.behaviorScore || "92"}/100</p>
                </div>
              </div>
            )}

            {activeTab === "fee_risk" && (
              <div className="bg-gray-50 dark:bg-gray-900/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2 text-xs animate-fade-in">
                <span className="font-semibold text-indigo-600 block flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  Financial Risk Engine
                </span>
                <p className="text-gray-500 text-[11px]">Predict default likelihoods and generate compassionate administrative responses based on ledger statistics.</p>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-1.5 text-gray-600 dark:text-gray-400">
                  <p>🏢 <strong>Account</strong>: {invoiceContext?.studentName || "Lucas Miller"}</p>
                  <p>💰 <strong>Invoice</strong>: "{invoiceContext?.title || "Laboratory & Computer Lab Fee"}"</p>
                  <p>💵 <strong>Unpaid Balance</strong>: ${invoiceContext?.amount || "250.00"}</p>
                  <p>⏳ <strong>Due Date</strong>: {invoiceContext?.dueDate || "2026-07-10"}</p>
                </div>
              </div>
            )}

            {activeTab === "assistant" && (
              <div className="space-y-3">
                <p className="text-[11px] text-gray-500">Ask the school advisor questions regarding scheduling, enrollment logistics, curriculum maps, or system settings.</p>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Inquiry / Prompt</label>
                  <textarea
                    value={promptMsg}
                    onChange={(e) => setPromptMsg(e.target.value)}
                    placeholder="e.g. Suggest a strategy to reduce student absentee rates using school notice incentives."
                    className="w-full h-36 text-xs rounded-lg border border-gray-200 p-2.5 dark:bg-gray-900 dark:border-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing Groq API...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Generate Intelligence
              </>
            )}
          </button>
        </form>

        <div className="w-full md:w-7/12 flex flex-col bg-gray-50/50 dark:bg-gray-950/20 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 font-semibold tracking-wide flex items-center gap-1.5 uppercase">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Groq AI Output Pipeline
            </span>
            {resultText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            )}
          </div>

          <div className="p-4 flex-1 overflow-y-auto font-sans text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Consulting AI Knowledge Base...</p>
                  <p className="text-[10px] text-gray-400 mt-1">Reconstructing curriculum parameters and compiling structures</p>
                </div>
              </div>
            )}

            {!isLoading && errorMsg && (
              <div className="flex flex-col items-center justify-center h-full text-center text-red-500 px-4 gap-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 animate-bounce" />
                <p className="font-semibold">AI Generation Paused</p>
                <p className="text-[11px] text-gray-400">{errorMsg}</p>
                <button
                  type="button"
                  onClick={handleAIInvocation}
                  className="mt-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg border border-red-200 transition-all cursor-pointer"
                >
                  Retry Request
                </button>
              </div>
            )}

            {!isLoading && !resultText && !errorMsg && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-6">
                <Sparkles className="w-10 h-10 text-indigo-300 dark:text-indigo-700 mb-2 animate-pulse" />
                <p className="font-medium text-gray-700 dark:text-gray-300">Awaiting prompt configuration...</p>
                <p className="text-[11px] text-gray-400 mt-1">Configure parameters on the left and trigger the secure pipeline.</p>
              </div>
            )}

            {!isLoading && resultText && (
              <div className="whitespace-pre-wrap select-text selection:bg-indigo-200/50">
                {resultText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
