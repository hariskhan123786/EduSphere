/**
 * EduSphere AI - Centralized Notification Center
 * Handles real-time system alerts, fee reminders, attendance warnings, and security notices.
 */

import React, { useState } from "react";
import {
  Bell, X, Check, CheckCheck, AlertTriangle, Shield, CreditCard,
  BookOpen, Calendar, UserCheck, Trash2, Filter
} from "lucide-react";
import { UserRole } from "../types.js";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "fee" | "attendance" | "exam" | "security" | "homework" | "announcement";
  timestamp: string;
  read: boolean;
  targetRole?: UserRole | "ALL";
  actionUrl?: string;
  priority?: "low" | "medium" | "high" | "urgent";
}

const DEFAULT_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-1",
    title: "Urgent: Defaulter Fee Reminders Sent",
    message: "Automated PKR fee collection alerts dispatched to 14 guardians for Term 1 dues.",
    type: "fee",
    timestamp: "10 mins ago",
    read: false,
    priority: "high",
  },
  {
    id: "notif-2",
    title: "Daily Attendance Submitted",
    message: "Ms. Maryam Siddiqui marked Grade 10-A attendance. 28 present, 2 absent.",
    type: "attendance",
    timestamp: "45 mins ago",
    read: false,
    priority: "medium",
  },
  {
    id: "notif-3",
    title: "Mid-Term Examination Schedule Published",
    message: "Physics & Chemistry papers finalized for Beaconhouse Margalla Campus.",
    type: "exam",
    timestamp: "2 hours ago",
    read: true,
    priority: "medium",
  },
  {
    id: "notif-4",
    title: "Security Alert: New Session Login",
    message: "Desktop terminal connected from Windows 11 (Islamabad Campus IP: 192.168.1.104).",
    type: "security",
    timestamp: "5 hours ago",
    read: true,
    priority: "urgent",
  },
  {
    id: "notif-5",
    title: "Homework Assignment Uploaded",
    message: "Prof. Asad Ullah assigned 'Electromagnetism Numerical Problems' due next Monday.",
    type: "homework",
    timestamp: "Yesterday",
    read: true,
    priority: "low",
  },
];

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (section: string) => void;
}

export default function NotificationCenter({ isOpen, onClose, onNavigate }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem("edusphere_notifications");
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  const [activeFilter, setActiveFilter] = useState<string>("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("edusphere_notifications", JSON.stringify(updated));
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("edusphere_notifications", JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem("edusphere_notifications", JSON.stringify([]));
  };

  const getIcon = (type: SystemNotification["type"]) => {
    switch (type) {
      case "fee":
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case "attendance":
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case "exam":
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case "security":
        return <Shield className="w-4 h-4 text-rose-400" />;
      case "homework":
        return <BookOpen className="w-4 h-4 text-violet-400" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "fees") return n.type === "fee";
    if (activeFilter === "security") return n.type === "security";
    if (activeFilter === "academic") return n.type === "exam" || n.type === "homework" || n.type === "attendance";
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#0f111a] border-l border-white/10 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#151824]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Notification Center
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-xs font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">Campus alerts and workflow updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs">
          {["all", "unread", "fees", "academic", "security"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors font-medium ${
                activeFilter === tab
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Quick Toolbar */}
        <div className="px-4 py-2 bg-black/20 flex items-center justify-between text-xs text-gray-400 border-b border-white/5">
          <span>{filtered.length} notifications</span>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="hover:text-indigo-400 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-2">
              <Bell className="w-8 h-8 opacity-30" />
              <p className="text-sm">No notifications to display</p>
            </div>
          ) : (
            filtered.map(notif => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-4 transition-all hover:bg-white/5 cursor-pointer relative flex gap-3 ${
                  !notif.read ? "bg-indigo-950/20" : ""
                }`}
              >
                {!notif.read && (
                  <div className="absolute left-1 top-4 bottom-4 w-1 bg-indigo-500 rounded-r" />
                )}
                <div className="mt-0.5 p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 h-fit">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-xs font-semibold truncate ${!notif.read ? "text-white" : "text-gray-300"}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-gray-500 shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                  {notif.priority === "urgent" && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      High Priority
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
