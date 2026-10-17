-- ==============================================================================
-- DEPRECATED — DO NOT RUN. This legacy script contains anonymous bypasses.
-- Apply 20260916_security_hardening.sql instead.
DO $$ BEGIN
  RAISE EXCEPTION 'complete_rls_security.sql has been retired; apply 20260916_security_hardening.sql.';
END $$;
-- EduSphere AI — Production Multi-Tenant Row Level Security (RLS) Migration
-- ==============================================================================

-- 1. Helper Security Functions (executed in PostgreSQL)
CREATE OR REPLACE FUNCTION public.get_auth_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'organization_id')::uuid,
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'organization_id')::uuid,
    NULL
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
    current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role',
    'ANONYMOUS'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (public.get_auth_role() = 'SUPER_ADMIN');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Enable RLS on all core tables
ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Multi-Tenant Organization Isolation Policies

-- Organizations: Read own org or all if Super Admin
DROP POLICY IF EXISTS "org_tenant_isolation" ON public.organizations;
CREATE POLICY "org_tenant_isolation" ON public.organizations
  FOR ALL
  USING (
    public.is_super_admin() OR 
    id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Users: Read and write within authorized organization
DROP POLICY IF EXISTS "users_tenant_isolation" ON public.users;
CREATE POLICY "users_tenant_isolation" ON public.users
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Students: Read/write within authorized organization
DROP POLICY IF EXISTS "students_tenant_isolation" ON public.students;
CREATE POLICY "students_tenant_isolation" ON public.students
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Teachers: Read/write within authorized organization
DROP POLICY IF EXISTS "teachers_tenant_isolation" ON public.teachers;
CREATE POLICY "teachers_tenant_isolation" ON public.teachers
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Attendance: Read/write within authorized organization
DROP POLICY IF EXISTS "attendance_tenant_isolation" ON public.attendance;
CREATE POLICY "attendance_tenant_isolation" ON public.attendance
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Fee Invoices: Read/write within authorized organization
DROP POLICY IF EXISTS "fee_invoices_tenant_isolation" ON public.fee_invoices;
CREATE POLICY "fee_invoices_tenant_isolation" ON public.fee_invoices
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Payrolls: Read/write within authorized organization
DROP POLICY IF EXISTS "payrolls_tenant_isolation" ON public.payrolls;
CREATE POLICY "payrolls_tenant_isolation" ON public.payrolls
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Expenses: Read/write within authorized organization
DROP POLICY IF EXISTS "expenses_tenant_isolation" ON public.expenses;
CREATE POLICY "expenses_tenant_isolation" ON public.expenses
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Exams: Read/write within authorized organization
DROP POLICY IF EXISTS "exams_tenant_isolation" ON public.exams;
CREATE POLICY "exams_tenant_isolation" ON public.exams
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Results: Read/write within authorized organization
DROP POLICY IF EXISTS "results_tenant_isolation" ON public.results;
CREATE POLICY "results_tenant_isolation" ON public.results
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Timetables: Read/write within authorized organization
DROP POLICY IF EXISTS "timetables_tenant_isolation" ON public.timetables;
CREATE POLICY "timetables_tenant_isolation" ON public.timetables
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Homework: Read/write within authorized organization
DROP POLICY IF EXISTS "homework_tenant_isolation" ON public.homework;
CREATE POLICY "homework_tenant_isolation" ON public.homework
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Submissions: Read/write within authorized organization
DROP POLICY IF EXISTS "homework_submissions_tenant_isolation" ON public.homework_submissions;
CREATE POLICY "homework_submissions_tenant_isolation" ON public.homework_submissions
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Notices: Read/write within authorized organization
DROP POLICY IF EXISTS "notices_tenant_isolation" ON public.notices;
CREATE POLICY "notices_tenant_isolation" ON public.notices
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- School Events: Read/write within authorized organization
DROP POLICY IF EXISTS "school_events_tenant_isolation" ON public.school_events;
CREATE POLICY "school_events_tenant_isolation" ON public.school_events
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Library: Read/write within authorized organization
DROP POLICY IF EXISTS "library_books_tenant_isolation" ON public.library_books;
CREATE POLICY "library_books_tenant_isolation" ON public.library_books
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Transport: Read/write within authorized organization
DROP POLICY IF EXISTS "transport_routes_tenant_isolation" ON public.transport_routes;
CREATE POLICY "transport_routes_tenant_isolation" ON public.transport_routes
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Hostel: Read/write within authorized organization
DROP POLICY IF EXISTS "hostel_rooms_tenant_isolation" ON public.hostel_rooms;
CREATE POLICY "hostel_rooms_tenant_isolation" ON public.hostel_rooms
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Leave Requests: Read/write within authorized organization
DROP POLICY IF EXISTS "leave_requests_tenant_isolation" ON public.leave_requests;
CREATE POLICY "leave_requests_tenant_isolation" ON public.leave_requests
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- Audit Logs: Read/write within authorized organization
DROP POLICY IF EXISTS "audit_logs_tenant_isolation" ON public.audit_logs;
CREATE POLICY "audit_logs_tenant_isolation" ON public.audit_logs
  FOR ALL
  USING (
    public.is_super_admin() OR 
    organization_id = public.get_auth_org_id() OR
    organization_id IS NULL OR
    auth.role() = 'service_role' OR
    auth.role() = 'anon'
  );

-- 4. Storage Bucket Policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('school-documents', 'school-documents', false)
ON CONFLICT (id) DO NOTHING;
