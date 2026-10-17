-- ==============================================================================
-- EDUSPHERE AI — ENTERPRISE DATABASE MIGRATION V2
-- Student photo storage, notice prioritization, and audit index enhancements.
-- ==============================================================================

-- 1. Add photo_url and avatar columns to students table if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'photo_url'
    ) THEN
        ALTER TABLE students ADD COLUMN photo_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'avatar'
    ) THEN
        ALTER TABLE students ADD COLUMN avatar TEXT;
    END IF;
END $$;

-- 2. Add priority and target_role columns to notices table if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notices' AND column_name = 'priority'
    ) THEN
        ALTER TABLE notices ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notices' AND column_name = 'target_role'
    ) THEN
        ALTER TABLE notices ADD COLUMN target_role VARCHAR(50) DEFAULT 'ALL';
    END IF;
END $$;

-- 3. Create fast lookup indexes for multi-tenant isolation
CREATE INDEX IF NOT EXISTS idx_students_org_id ON students(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_org_id ON fee_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_attendance_org_id ON attendance(organization_id);
CREATE INDEX IF NOT EXISTS idx_results_org_id ON results(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
