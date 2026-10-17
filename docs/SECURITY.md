# EduSphere AI — Enterprise Security & Data Isolation Architecture

## 1. Multi-Tenant Isolation
Every school campus operates within its own cryptographic and logical boundary defined by `organization_id`. All database queries, sync queues, and API payloads enforce tenant scoping.

## 2. Row-Level Security (PostgreSQL)
- Supabase PostgreSQL schema enforces strict RLS policies on all 19 entities.
- Non-superadmins can only access records matching `organization_id = current_user_org_id()`.
- Super Admin accounts have explicit multi-tenant traversal privileges.

## 3. Brute-Force & Rate Limiting
- Login attempts are tracked in memory.
- 5 sequential failed attempts trigger a 15-minute security lockout.
- All administrative and authentication events are logged into the immutable `audit_logs` table.

## 4. Session Management
- Passwords are encrypted with bcrypt (cost factor 10).
- Session tokens are randomly generated UUIDv4 tokens held in authenticated session maps.
- Security Center provides remote session revocation and device termination.
