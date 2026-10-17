-- DEPRECATED — DO NOT RUN
--
-- This filename is retained only so legacy deployment steps fail safely. The
-- former contents granted anonymous read/write access to every school.
-- Apply 20260916_security_hardening.sql instead.

DO $$
BEGIN
  RAISE EXCEPTION 'desktop_anon_policies.sql is unsafe and has been retired. Apply 20260916_security_hardening.sql.';
END $$;
