# EduSphere AI — Desktop Application (Windows)

> **Enterprise School Management SaaS — Standalone Windows Desktop Edition**  
> Built with **Tauri 2.x**, **React 19**, **Vite**, **Embedded SQLite (`rusqlite`)**, and **Supabase Cloud Sync Engine**.

---

## 🏛️ Architecture Overview

The desktop version of **EduSphere AI** is built in a completely separate folder (`desktop/`) to ensure the existing web application remains 100% untouched and functional.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 19 Desktop Frontend                       │
│    (Tailwind 4, Lucide Icons, Theme Customizer, Sync Center UI)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Tauri IPC (invoke)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Tauri 2.x Rust Core                           │
│  ┌───────────────────────┐              ┌───────────────────────────┐  │
│  │   Embedded SQLite DB  │              │  Background Sync Manager  │  │
│  │     (edusphere.db)    │◄────────────►│       (sync_queue)        │  │
│  └───────────────────────┘              └─────────────┬─────────────┘  │
└───────────────────────────────────────────────────────┼────────────────┘
                                                        │ HTTPS REST Sync
                                                        ▼
                                          ┌───────────────────────────┐
                                          │     Supabase Cloud DB     │
                                          └───────────────────────────┘
```

---

## ✨ Key Features

1. **100% Offline-First Operations**:
   - Local SQLite database (`edusphere.db`) stored in user data directory (`%APPDATA%\com.edusphere.desktop\`).
   - Full CRUD support for all modules (Students, Teachers, Attendance, Results, Fee Invoices, Timetables, Homework, Circulars).
2. **Two-Way Cloud Synchronization**:
   - Offline mutations are automatically recorded in a durable `sync_queue` table.
   - When online, the background orchestrator processes the queue, pushing local changes to Supabase and pulling cloud updates.
3. **Conflict Resolution Engine**:
   - `last_write_wins` with conflict logging in `conflict_log`.
4. **Local Backup & Restore**:
   - 1-click snapshot creation (`edusphere_backup_*.db`) directly from the desktop UI.
5. **Offline Authentication**:
   - Cached user sessions and encrypted offline password hashing (`bcrypt`).
6. **Native Windows Features**:
   - Export official ledgers directly to `.csv` on disk.
   - Print certified student ID cards, progress report cards, and fee challans.

---

## 🚀 Quick Start & Development

### 1. Prerequisites
Ensure you have the following installed on Windows:
- **Node.js 18+** & **npm**
- **Rust & Cargo** (`rustup` installer)
- **Visual Studio C++ Build Tools** (MSVC target)

> *Tip: Run the automated setup script:*
> ```powershell
> .\install-prerequisites.ps1
> ```

---

### 2. Running in Development Mode
To start the Vite frontend and Tauri native window simultaneously:

```bash
# Navigate to the desktop directory
cd desktop

# Install dependencies (first time only)
npm install

# Launch Tauri Development App
npm run tauri:dev
```

Alternatively, to run only the Vite UI in browser for fast styling:
```bash
npm run vite:dev
```

---

### 3. Building Production Windows Installer (.msi / .exe)
To compile the native Rust backend, bundle the assets, and create the Windows NSIS / MSI installer:

```bash
cd desktop
npm run tauri:build
```

The output installer will be generated in:
`desktop/src-tauri/target/release/bundle/nsis/` or `bundle/msi/`.

---

## 🗄️ Database Tables (SQLite)

- `organizations`: Schools and campuses
- `users`: Authenticated accounts and roles
- `students`: Scholar enrollment biodata and attendance rates
- `teachers`: Faculty assignments, departments, and payroll
- `attendance`: Daily registers and remarks
- `homework` & `homework_submissions`: Assignments and student grading
- `exams` & `results`: Assessments and marks matrix
- `fee_invoices`: Tuition fee ledgers, balances, and challan receipts
- `timetables`: Daily period schedules
- `notices`: Institutional broadcasts and priority circulars
- `school_events`: Campus calendar events
- `library_books`: Book catalogs and availability
- `transport_routes` & `hostel_rooms`: Facility logistics
- `sync_queue` & `sync_metadata`: Offline sync orchestration
- `conflict_log`: Conflict history and audit
- `backups`: Local SQLite backup archives

---

## 🔒 Security & Privacy
- Zero leakage to existing web application directories.
- SQLite connections are pooled using `r2d2` with foreign keys enforced.
- Offline credentials securely hashed and verified with `bcrypt`.
