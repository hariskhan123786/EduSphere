-- EDUSPHERE AI — mandatory production security hardening
-- Run once in Supabase SQL Editor after review in staging.

CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT organization_id FROM public.users WHERE id = auth.uid() $$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.users WHERE id = auth.uid() $$;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'organizations', 'users', 'students', 'teachers', 'attendance', 'fee_invoices',
    'expenses', 'payrolls', 'homework', 'homework_submissions', 'exams', 'results',
    'timetables', 'leave_requests', 'notices', 'school_events', 'library_books',
    'transport_routes', 'hostel_rooms', 'audit_logs'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format(
      'DO $inner$ DECLARE p record; BEGIN FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = ''public'' AND tablename = %L LOOP EXECUTE format(''DROP POLICY IF EXISTS %%I ON public.%I'', p.policyname); END LOOP; END $inner$',
      table_name, table_name
    );
  END LOOP;
END $$;

CREATE POLICY organizations_tenant_access ON public.organizations
  FOR SELECT TO authenticated
  USING (public.current_user_role() = 'SUPER_ADMIN' OR id = public.current_user_org_id());

CREATE POLICY organizations_admin_update ON public.organizations
  FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN') AND id = public.current_user_org_id())
  WITH CHECK (public.current_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN') AND id = public.current_user_org_id());

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'users', 'students', 'teachers', 'attendance', 'fee_invoices', 'expenses',
    'payrolls', 'homework', 'homework_submissions', 'exams', 'results', 'timetables',
    'leave_requests', 'notices', 'school_events', 'library_books', 'transport_routes',
    'hostel_rooms', 'audit_logs'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.current_user_role() = ''SUPER_ADMIN'' OR organization_id = public.current_user_org_id()) WITH CHECK (public.current_user_role() = ''SUPER_ADMIN'' OR organization_id = public.current_user_org_id())',
      table_name || '_tenant_access', table_name
    );
  END LOOP;
END $$;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
