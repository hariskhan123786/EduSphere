# EduSphere AI Enterprise 2.0 — System Architecture

## Overview
EduSphere AI is an Enterprise Multi-Tenant School Management Platform with full parity between Web (Cloud SaaS) and Windows Desktop (Offline-First Local SQLite + Two-Way Cloud Sync).

```
WEB CLIENT                               DESKTOP CLIENT (Windows Tauri 2)
    |                                                 |
Express API Server / Vite React SPA             Local SQLite (r2d2 connection pool)
    |                                                 |
JSON Store / Supabase Postgres                   Durable Sync Engine (Rust)
    |                                                 |
PostgreSQL (Row-Level Security)  <--------------------+ (Two-Way Sync & Conflict Resolution)
```

## Core Modules & Parity Matrix
| Module | Web Status | Desktop Status | Offline SQLite | Two-Way Sync |
|---|---|---|---|---|
| Dashboard & KPIs | Available | Available | Yes | Yes |
| Students Roster | Available | Available | Yes | Yes |
| Faculty & Staff | Available | Available | Yes | Yes |
| Attendance Register | Available | Available | Yes | Yes |
| Fee Vouchers & Ledger (PKR) | Available | Available | Yes | Yes |
| Exams & Grade Matrix | Available | Available | Yes | Yes |
| Class Timetables | Available | Available | Yes | Yes |
| Homework & Submissions | Available | Available | Yes | Yes |
| Library Catalog | Available | Available | Yes | Yes |
| Transport Routes | Available | Available | Yes | Yes |
| Hostel Management | Available | Available | Yes | Yes |
| Staff Payroll (PKR) | Available | Available | Yes | Yes |
| Expense Accounting | Available | Available | Yes | Yes |
| Notices & Events | Available | Available | Yes | Yes |
| Command Palette (Ctrl+K) | Available | Available | Yes | N/A |
| Notification Center | Available | Available | Yes | Yes |
| Security Center | Available | Available | Yes | Yes |
| Document Generator | Available | Available | Yes | N/A |
| Analytics Dashboard | Available | Available | Yes | Yes |
| Import Center | Available | Available | Yes | Yes |
| Approval Workflows | Available | Available | Yes | Yes |
| Academic Sessions | Available | Available | Yes | Yes |
| AI School Copilot | Available (Groq) | Available (Groq) | Online Required | N/A |
| Multi-Language (EN/UR/AR) | Available | Available | Yes | N/A |

## Technology Stack
- **Web Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite
- **Web Backend**: Node.js, Express, bcrypt, Groq SDK
- **Desktop**: Tauri 2, Rust, rusqlite, r2d2 connection pool
- **Database**: PostgreSQL (Supabase) + Local SQLite (Desktop)
- **Localization**: English, Urdu (اردو with RTL), Arabic (العربية with RTL)
