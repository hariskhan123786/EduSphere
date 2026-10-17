-- ==============================================================================
-- EDUSPHERE AI - ENTERPRISE MULTI-TENANT DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'TEACHER',
    'STUDENT',
    'PARENT',
    'ACCOUNTANT',
    'LIBRARIAN',
    'TRANSPORT_MANAGER'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. ORGANIZATIONS (TENANTS)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo TEXT DEFAULT '',
  primary_color VARCHAR(20) DEFAULT '#4f46e5',
  academic_session VARCHAR(50) DEFAULT '2025-2026',
  plan VARCHAR(50) DEFAULT 'Professional',
  mrr NUMERIC(10, 2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'Active',
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
  name VARCHAR(255) NOT NULL,
  avatar TEXT DEFAULT '',
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Active',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admission_no VARCHAR(50) NOT NULL,
  roll_no VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  section_name VARCHAR(50) NOT NULL,
  guardian_name VARCHAR(255) NOT NULL,
  guardian_phone VARCHAR(50) NOT NULL,
  guardian_email VARCHAR(255),
  medical_records TEXT DEFAULT 'None declared.',
  behavior_score INT DEFAULT 100 CHECK (behavior_score >= 0 AND behavior_score <= 100),
  attendance_rate NUMERIC(5, 2) DEFAULT 100.00,
  status VARCHAR(50) DEFAULT 'Active',
  admission_date DATE DEFAULT CURRENT_DATE,
  dob DATE,
  gender VARCHAR(20),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  employee_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  department VARCHAR(100) NOT NULL,
  qualification VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  classes_assigned TEXT[] DEFAULT '{}',
  subjects_assigned TEXT[] DEFAULT '{}',
  joining_date DATE DEFAULT CURRENT_DATE,
  salary NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  section_name VARCHAR(50),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'Present',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FEE INVOICES
CREATE TABLE IF NOT EXISTS fee_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  fine NUMERIC(10, 2) DEFAULT 0.00,
  discount NUMERIC(10, 2) DEFAULT 0.00,
  paid_amount NUMERIC(10, 2) DEFAULT 0.00,
  due_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Unpaid',
  payment_method VARCHAR(50),
  pay_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EXPENSES (ACCOUNTING)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'Approved',
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PAYROLL
CREATE TABLE IF NOT EXISTS payrolls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  employee_name VARCHAR(255) NOT NULL,
  month_year VARCHAR(50) NOT NULL,
  basic_salary NUMERIC(10, 2) NOT NULL,
  allowances NUMERIC(10, 2) DEFAULT 0.00,
  deductions NUMERIC(10, 2) DEFAULT 0.00,
  net_salary NUMERIC(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'Paid',
  payout_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. HOMEWORK & SUBMISSIONS
CREATE TABLE IF NOT EXISTS homework (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  class_name VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  attachment_url TEXT,
  created_by_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homework_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  homework_id UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  submission_content TEXT,
  file_url TEXT,
  grade VARCHAR(10),
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ
);

-- 11. EXAMS & RESULTS
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  class_name VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  max_marks INT NOT NULL DEFAULT 100,
  date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  exam_title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  marks_obtained NUMERIC(5, 2) NOT NULL,
  max_marks NUMERIC(5, 2) NOT NULL DEFAULT 100,
  grade VARCHAR(10) NOT NULL,
  comments TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TIMETABLE
CREATE TABLE IF NOT EXISTS timetables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  class_name VARCHAR(50) NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  period_number INT NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  teacher_name VARCHAR(255) NOT NULL,
  room_number VARCHAR(50) DEFAULT 'Room 101',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. LEAVE APPLICATIONS
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  applicant_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. NOTICES & EVENTS
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_role VARCHAR(50) DEFAULT 'All',
  date DATE DEFAULT CURRENT_DATE,
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS school_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  type VARCHAR(50) DEFAULT 'academic',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. LIBRARY
CREATE TABLE IF NOT EXISTS library_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. TRANSPORT
CREATE TABLE IF NOT EXISTS transport_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  route_name VARCHAR(255) NOT NULL,
  vehicle_no VARCHAR(50) NOT NULL,
  driver_name VARCHAR(255) NOT NULL,
  driver_phone VARCHAR(50) NOT NULL,
  fee NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. HOSTEL
CREATE TABLE IF NOT EXISTS hostel_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  room_no VARCHAR(50) NOT NULL,
  type VARCHAR(50) DEFAULT 'Dormitory',
  total_beds INT DEFAULT 4,
  available_beds INT DEFAULT 4,
  fee NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  ip_address VARCHAR(100) DEFAULT '127.0.0.1',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES & ROW LEVEL SECURITY
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_students_org ON students(organization_id);
CREATE INDEX IF NOT EXISTS idx_teachers_org ON teachers(organization_id);
CREATE INDEX IF NOT EXISTS idx_attendance_org ON attendance(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON fee_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS POLICIES (MULTI-TENANCY & RBAC)
-- ------------------------------------------------------------------------------

-- Helper function to get current user's organization_id
CREATE OR REPLACE FUNCTION current_user_org_id() 
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION current_user_role() 
RETURNS VARCHAR AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. Organizations: Super Admin or Members of the Organization
CREATE POLICY "org_access_policy" ON organizations
  FOR ALL USING (
    current_user_role() = 'SUPER_ADMIN' OR 
    id = current_user_org_id()
  );

-- 2. Users: View within same organization, edit own profile
CREATE POLICY "users_read_policy" ON users
  FOR SELECT USING (
    current_user_role() = 'SUPER_ADMIN' OR
    organization_id = current_user_org_id()
  );

CREATE POLICY "users_manage_policy" ON users
  FOR ALL USING (
    current_user_role() = 'SUPER_ADMIN' OR
    (current_user_role() IN ('SCHOOL_ADMIN', 'PRINCIPAL') AND organization_id = current_user_org_id()) OR
    id = auth.uid()
  );

-- 3. Students: Teachers view their class, Students view self, Parents view children
CREATE POLICY "students_read_policy" ON students
  FOR SELECT USING (
    current_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT') AND organization_id = current_user_org_id()
    OR user_id = auth.uid()
    OR (current_user_role() = 'TEACHER' AND class_name IN (
        SELECT unnest(classes_assigned) FROM teachers WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "students_write_policy" ON students
  FOR ALL USING (
    current_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL') AND organization_id = current_user_org_id()
  );

-- 4. Attendance: Teachers can read & write for their assigned classes
CREATE POLICY "attendance_policy" ON attendance
  FOR ALL USING (
    current_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL') AND organization_id = current_user_org_id()
    OR (current_user_role() = 'TEACHER' AND class_name IN (
        SELECT unnest(classes_assigned) FROM teachers WHERE user_id = auth.uid()
    ))
    OR (current_user_role() = 'STUDENT' AND student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ))
  );

-- 5. Homework & Submissions
CREATE POLICY "homework_policy" ON homework
  FOR ALL USING (
    current_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER') AND organization_id = current_user_org_id()
    OR (current_user_role() = 'STUDENT' AND class_name IN (
        SELECT class_name FROM students WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "submissions_policy" ON homework_submissions
  FOR ALL USING (
    current_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL') AND organization_id = current_user_org_id()
    OR (current_user_role() = 'TEACHER' AND organization_id = current_user_org_id())
    OR (current_user_role() = 'STUDENT' AND student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ))
  );

-- 6. Exams & Results
CREATE POLICY "exams_policy" ON exams
  FOR ALL USING (
    organization_id = current_user_org_id()
  );

CREATE POLICY "results_policy" ON results
  FOR ALL USING (
    current_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL') AND organization_id = current_user_org_id()
    OR (current_user_role() = 'TEACHER' AND organization_id = current_user_org_id())
    OR (current_user_role() = 'STUDENT' AND student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ))
  );

-- 7. Fee Invoices
CREATE POLICY "fee_invoices_policy" ON fee_invoices
  FOR ALL USING (
    current_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT') AND organization_id = current_user_org_id()
    OR (current_user_role() = 'STUDENT' AND student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ))
  );

