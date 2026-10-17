pub const CREATE_TABLES_SQL: &str = r#"
-- Core Organizations (Schools / Tenants)
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#4f46e5',
  academic_session TEXT DEFAULT '2025-2026',
  plan TEXT DEFAULT 'Professional',
  mrr REAL DEFAULT 0.00,
  status TEXT DEFAULT 'Active',
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'STUDENT',
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  phone TEXT,
  status TEXT DEFAULT 'Active',
  last_login TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  admission_no TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  section_name TEXT NOT NULL,
  guardian_name TEXT NOT NULL,
  guardian_phone TEXT NOT NULL,
  guardian_email TEXT,
  medical_records TEXT DEFAULT 'None declared.',
  behavior_score INTEGER DEFAULT 100,
  attendance_rate REAL DEFAULT 100.00,
  status TEXT DEFAULT 'Active',
  admission_date TEXT DEFAULT (date('now')),
  dob TEXT,
  gender TEXT,
  address TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  employee_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT NOT NULL,
  qualification TEXT NOT NULL,
  designation TEXT NOT NULL,
  classes_assigned TEXT DEFAULT '[]',
  subjects_assigned TEXT DEFAULT '[]',
  joining_date TEXT DEFAULT (date('now')),
  salary REAL DEFAULT 0.00,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  section_name TEXT,
  date TEXT NOT NULL DEFAULT (date('now')),
  status TEXT NOT NULL DEFAULT 'Present',
  remarks TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Fee Invoices
CREATE TABLE IF NOT EXISTS fee_invoices (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  fine REAL DEFAULT 0.00,
  discount REAL DEFAULT 0.00,
  paid_amount REAL DEFAULT 0.00,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Unpaid',
  payment_method TEXT,
  pay_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL DEFAULT (date('now')),
  status TEXT DEFAULT 'Approved',
  receipt_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Payrolls
CREATE TABLE IF NOT EXISTS payrolls (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  teacher_id TEXT,
  employee_name TEXT NOT NULL,
  month_year TEXT NOT NULL,
  basic_salary REAL NOT NULL,
  allowances REAL DEFAULT 0.00,
  deductions REAL DEFAULT 0.00,
  net_salary REAL NOT NULL,
  payment_status TEXT DEFAULT 'Paid',
  payout_date TEXT DEFAULT (date('now')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Homework & Submissions
CREATE TABLE IF NOT EXISTS homework (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TEXT NOT NULL,
  attachment_url TEXT,
  created_by_name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS homework_submissions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  homework_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  submission_content TEXT,
  file_url TEXT,
  grade TEXT,
  feedback TEXT,
  submitted_at TEXT DEFAULT (datetime('now')),
  graded_at TEXT,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Exams & Results
CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  max_marks INTEGER NOT NULL DEFAULT 100,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'Scheduled',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  subject TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  marks_obtained REAL NOT NULL,
  max_marks REAL NOT NULL DEFAULT 100,
  grade TEXT NOT NULL,
  comments TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Timetables
CREATE TABLE IF NOT EXISTS timetables (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  period_number INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  room_number TEXT DEFAULT 'Room 101',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  role TEXT NOT NULL,
  leave_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Notices & School Events
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role TEXT DEFAULT 'All',
  date TEXT DEFAULT (date('now')),
  author TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS school_events (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  type TEXT DEFAULT 'academic',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Library Books
CREATE TABLE IF NOT EXISTS library_books (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT NOT NULL,
  category TEXT NOT NULL,
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Transport Routes
CREATE TABLE IF NOT EXISTS transport_routes (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  route_name TEXT NOT NULL,
  vehicle_no TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  fee REAL DEFAULT 0.00,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Hostel Rooms
CREATE TABLE IF NOT EXISTS hostel_rooms (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  room_no TEXT NOT NULL,
  type TEXT DEFAULT 'Dormitory',
  total_beds INTEGER DEFAULT 4,
  available_beds INTEGER DEFAULT 4,
  fee REAL DEFAULT 0.00,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  ip_address TEXT DEFAULT '127.0.0.1',
  timestamp TEXT DEFAULT (datetime('now'))
);

-- ==============================================================================
-- DESKTOP OFFLINE & SYNCHRONIZATION TABLES
-- ==============================================================================

-- Offline Sync Queue: records all local mutations performed while offline
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  payload TEXT NOT NULL, -- JSON serialized row
  user_context TEXT NOT NULL, -- JSON serialized user info
  created_at TEXT DEFAULT (datetime('now')),
  retry_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SYNCING', 'FAILED', 'RESOLVED'
  error_message TEXT
);

-- Sync Metadata: tracks cloud sync watermarks
CREATE TABLE IF NOT EXISTS sync_metadata (
  table_name TEXT PRIMARY KEY,
  last_pulled_at TEXT,
  last_pushed_at TEXT,
  status TEXT DEFAULT 'IDLE'
);

-- Offline Auth Cache: securely caches active user sessions for offline login
CREATE TABLE IF NOT EXISTS offline_sessions (
  user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  organization_id TEXT,
  user_json TEXT NOT NULL,
  last_login TEXT DEFAULT (datetime('now'))
);

-- Conflict Log: records conflicting updates between local and cloud
CREATE TABLE IF NOT EXISTS conflict_log (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  local_data TEXT NOT NULL,
  remote_data TEXT NOT NULL,
  resolved_status TEXT DEFAULT 'PENDING', -- 'PENDING', 'RESOLVED_LOCAL', 'RESOLVED_REMOTE'
  detected_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT
);

-- Backups: tracks local database backups created by user
CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
"#;
