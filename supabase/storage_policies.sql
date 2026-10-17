-- ==============================================================================
-- DEPRECATED — DO NOT RUN. Public and anonymous photo access violates school isolation.
-- Replace with private tenant-scoped storage policies after migrating existing object paths.
DO $$ BEGIN
  RAISE EXCEPTION 'storage_policies.sql has been retired pending private tenant-scoped storage migration.';
END $$;
-- EDUSPHERE AI — SUPABASE STORAGE POLICIES FOR STUDENT PHOTOS
-- Creates 'student-photos' bucket and defines secure public read / authorized write
-- ==============================================================================

-- 1. Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow public viewing of student photos
CREATE POLICY "Public Student Photos Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-photos');

-- 3. Allow anon/authenticated uploads to student-photos bucket
CREATE POLICY "Allow Student Photos Upload"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'student-photos');

-- 4. Allow photo updates and replacements
CREATE POLICY "Allow Student Photos Update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'student-photos');

-- 5. Allow photo deletion
CREATE POLICY "Allow Student Photos Delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'student-photos');
