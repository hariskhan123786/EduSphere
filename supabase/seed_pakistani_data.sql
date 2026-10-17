-- ==============================================================================
-- EDUSPHERE AI — PAKISTANI SCHOOL DUMMY DATA SEED
-- ==============================================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- Populates: Organizations, Users, Students, Teachers, Attendance, Fees,
--            Expenses, Payroll, Homework, Exams, Results, Timetable,
--            Leave Requests, Notices, Events, Library, Transport, Hostel
-- ==============================================================================

-- First run the anon policies if not already done
-- (copy desktop_anon_policies.sql and run it first)

-- ─── STEP 1: ORGANIZATIONS ────────────────────────────────────────────────────
INSERT INTO organizations (id, name, slug, logo, primary_color, academic_session, plan, mrr, status, phone, email, address) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Beaconhouse School System — Islamabad', 'beaconhouse-isb', '', '#4f46e5', '2025-2026', 'Enterprise', 1250000.00, 'Active', '+92 51 111 777 888', 'islamabad@beaconhouse.edu.pk', 'Sector H-8/4, Islamabad, Pakistan'),
  ('a2000000-0000-0000-0000-000000000002', 'The City School — Lahore', 'city-school-lhr', '', '#0ea5e9', '2025-2026', 'Professional', 980000.00, 'Active', '+92 42 111 248 248', 'lahore@cityschool.edu.pk', 'Gulberg III, Lahore, Punjab, Pakistan'),
  ('a3000000-0000-0000-0000-000000000003', 'Karachi Grammar School', 'kgs-karachi', '', '#10b981', '2025-2026', 'Enterprise', 1750000.00, 'Active', '+92 21 3586 0955', 'info@kgs.edu.pk', 'Lawrence Road, Karachi, Sindh, Pakistan')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 2: USERS ────────────────────────────────────────────────────────────
INSERT INTO users (id, organization_id, email, username, password_hash, role, name, avatar, phone, status) VALUES
  -- Super Admin (Platform Owner)
  ('b1000000-0000-0000-0000-000000000001', NULL, 'superadmin@edusphere.ai', 'superadmin', 'admin123', 'SUPER_ADMIN', 'Dr. Haris Ahmed Khan', '', '+92 300 1234567', 'Active'),

  -- Beaconhouse Islamabad Staff
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'principal@beaconhouse-isb.edu.pk', 'admin.isb', 'admin123', 'SCHOOL_ADMIN', 'Dr. Amna Siddiqui', '', '+92 51 2345678', 'Active'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'asad.ullah@beaconhouse-isb.edu.pk', 'asad.math', 'teacher123', 'TEACHER', 'Prof. Asad Ullah', '', '+92 333 4445566', 'Active'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'sara.khan@beaconhouse-isb.edu.pk', 'sara.english', 'teacher123', 'TEACHER', 'Ms. Sara Khan', '', '+92 321 7778899', 'Active'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'zain.ali@beaconhouse-isb.edu.pk', 'zain.science', 'teacher123', 'TEACHER', 'Mr. Zain Ali', '', '+92 345 6667788', 'Active'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'accounts@beaconhouse-isb.edu.pk', 'accounts.isb', 'accounts123', 'ACCOUNTANT', 'Mr. Farhan Malik', '', '+92 312 9990011', 'Active'),

  -- Students (Beaconhouse ISB)
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001', 'rayyan.khan@student.beaconhouse.edu.pk', 'rayyan.khan', 'student123', 'STUDENT', 'Muhammad Rayyan Khan', '', '+92 300 1112233', 'Active'),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000001', 'aisha.tariq@student.beaconhouse.edu.pk', 'aisha.tariq', 'student123', 'STUDENT', 'Aisha Tariq', '', '+92 311 2223344', 'Active'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000001', 'hamza.butt@student.beaconhouse.edu.pk', 'hamza.butt', 'student123', 'STUDENT', 'Hamza Butt', '', '+92 322 3334455', 'Active'),
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000001', 'fatima.sheikh@student.beaconhouse.edu.pk', 'fatima.sheikh', 'student123', 'STUDENT', 'Fatima Sheikh', '', '+92 333 4445566', 'Active'),
  ('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000001', 'usman.raza@student.beaconhouse.edu.pk', 'usman.raza', 'student123', 'STUDENT', 'Usman Raza', '', '+92 344 5556677', 'Active'),

  -- City School Lahore Staff
  ('b2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'principal@cityschool-lhr.edu.pk', 'admin.lhr', 'admin123', 'SCHOOL_ADMIN', 'Mr. Imran Qureshi', '', '+92 42 3456789', 'Active'),
  ('b2000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000002', 'nadia.hussain@cityschool-lhr.edu.pk', 'nadia.bio', 'teacher123', 'TEACHER', 'Ms. Nadia Hussain', '', '+92 321 5556677', 'Active'),
  ('b2000000-0000-0000-0000-000000000004', 'a2000000-0000-0000-0000-000000000002', 'bilal.ahmad@cityschool-lhr.edu.pk', 'bilal.urdu', 'teacher123', 'TEACHER', 'Mr. Bilal Ahmad', '', '+92 300 6667788', 'Active'),

  -- KGS Karachi Staff
  ('b3000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000003', 'director@kgs.edu.pk', 'admin.kgs', 'admin123', 'SCHOOL_ADMIN', 'Mrs. Rubina Farooqui', '', '+92 21 9876543', 'Active'),
  ('b3000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000003', 'tariq.mehmood@kgs.edu.pk', 'tariq.phy', 'teacher123', 'TEACHER', 'Dr. Tariq Mehmood', '', '+92 321 8889900', 'Active')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 3: STUDENTS ─────────────────────────────────────────────────────────
INSERT INTO students (id, organization_id, user_id, admission_no, roll_no, name, class_name, section_name, guardian_name, guardian_phone, guardian_email, medical_records, behavior_score, attendance_rate, status, admission_date, dob, gender, address) VALUES
  -- Beaconhouse ISB Students
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000010', 'BSS-2025-0101', '10-A-01', 'Muhammad Rayyan Khan', 'Grade 10', 'Section A', 'Tariq Jameel Khan', '+92 300 5556677', 'tariq.khan@gmail.com', 'None declared.', 96, 94.50, 'Active', '2022-08-15', '2010-03-12', 'Male', 'House 14, Street 5, F-7/2, Islamabad'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000011', 'BSS-2025-0102', '10-A-02', 'Aisha Tariq', 'Grade 10', 'Section A', 'Tariq Mahmood', '+92 311 7778899', 'aisha.parent@gmail.com', 'Mild asthma — carries inhaler.', 99, 97.20, 'Active', '2022-08-15', '2010-07-25', 'Female', 'Flat 3B, Margalla View Apartments, E-7, Islamabad'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000012', 'BSS-2025-0103', '10-B-01', 'Hamza Butt', 'Grade 10', 'Section B', 'Khalid Butt', '+92 322 8889900', 'khalid.butt@yahoo.com', 'None declared.', 88, 89.00, 'Active', '2022-09-01', '2010-01-18', 'Male', 'House 22, Street 3, G-10/3, Islamabad'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000013', 'BSS-2025-0104', '9-A-01', 'Fatima Sheikh', 'Grade 9', 'Section A', 'Sheikh Imtiaz', '+92 333 9990011', 'fatima.parent@gmail.com', 'None declared.', 100, 99.00, 'Active', '2023-08-20', '2011-05-08', 'Female', 'House 7, Street 12, F-8/1, Islamabad'),
  ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000014', 'BSS-2025-0105', '9-B-01', 'Usman Raza', 'Grade 9', 'Section B', 'Raza Ahmed', '+92 344 1112233', 'raza.ahmed@hotmail.com', 'Peanut allergy — keep EpiPen nearby.', 82, 85.50, 'Active', '2023-09-01', '2011-11-30', 'Male', 'House 45, Street 8, G-9/2, Islamabad'),
  ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', NULL, 'BSS-2025-0106', '8-A-01', 'Zara Noor', 'Grade 8', 'Section A', 'Noor Ahmed', '+92 355 2223344', 'noor.ahmed@gmail.com', 'None declared.', 95, 96.00, 'Active', '2024-08-15', '2012-04-15', 'Female', 'House 3, Street 1, F-6/3, Islamabad'),
  ('c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', NULL, 'BSS-2025-0107', '8-A-02', 'Ali Hassan', 'Grade 8', 'Section A', 'Hassan Mehmood', '+92 366 3334455', 'hassan.parent@gmail.com', 'None declared.', 91, 92.50, 'Active', '2024-08-15', '2012-09-22', 'Male', 'House 18, Street 6, E-11/4, Islamabad'),

  -- City School Lahore Students
  ('c2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', NULL, 'CSL-2025-0201', '11-A-01', 'Sana Ijaz', 'Grade 11', 'Section A', 'Ijaz Ahmed', '+92 300 4445566', 'ijaz.parent@gmail.com', 'None declared.', 97, 95.00, 'Active', '2021-08-10', '2009-02-14', 'Female', '45-B, Gulberg II, Lahore'),
  ('c2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', NULL, 'CSL-2025-0202', '11-A-02', 'Bilal Chaudhry', 'Grade 11', 'Section A', 'Chaudhry Waseem', '+92 311 5556677', 'waseem.parent@yahoo.com', 'None declared.', 85, 88.00, 'Active', '2021-08-10', '2009-06-30', 'Male', '12, Model Town, Lahore'),
  ('c2000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000002', NULL, 'CSL-2025-0203', '10-B-01', 'Hira Malik', 'Grade 10', 'Section B', 'Malik Farooq', '+92 322 6667788', 'malik.farooq@gmail.com', 'None declared.', 93, 91.50, 'Active', '2022-08-15', '2010-12-05', 'Female', '78, DHA Phase 4, Lahore'),

  -- KGS Karachi Students
  ('c3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', NULL, 'KGS-2025-0301', '12-A-01', 'Ahmed Mirza', 'Grade 12', 'Section A', 'Mirza Salim', '+92 300 7778899', 'mirza.parent@gmail.com', 'None declared.', 98, 97.00, 'Active', '2019-08-01', '2007-08-20', 'Male', 'Clifton Block 5, Karachi'),
  ('c3000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000003', NULL, 'KGS-2025-0302', '12-A-02', 'Nadia Farooqui', 'Grade 12', 'Section A', 'Farooqui Imran', '+92 311 8889900', 'farooqui.parent@gmail.com', 'None declared.', 100, 99.50, 'Active', '2019-08-01', '2007-11-12', 'Female', 'Defence Housing Authority, Phase 6, Karachi')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 4: TEACHERS ─────────────────────────────────────────────────────────
INSERT INTO teachers (id, organization_id, user_id, employee_id, name, email, phone, department, qualification, designation, classes_assigned, subjects_assigned, joining_date, salary) VALUES
  -- Beaconhouse ISB
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'EMP-BSS-001', 'Prof. Asad Ullah', 'asad.ullah@beaconhouse-isb.edu.pk', '+92 333 4445566', 'Science & Mathematics', 'M.Phil Applied Physics (QAU)', 'Senior Faculty Head', ARRAY['Grade 10 - Section A', 'Grade 9 - Section A'], ARRAY['Physics', 'Applied Mathematics'], '2018-08-01', 145000.00),
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'EMP-BSS-002', 'Ms. Sara Khan', 'sara.khan@beaconhouse-isb.edu.pk', '+92 321 7778899', 'Languages & Literature', 'MA English Literature (PU)', 'Senior Teacher', ARRAY['Grade 10 - Section A', 'Grade 10 - Section B', 'Grade 8 - Section A'], ARRAY['English', 'Literature'], '2020-01-15', 120000.00),
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'EMP-BSS-003', 'Mr. Zain Ali', 'zain.ali@beaconhouse-isb.edu.pk', '+92 345 6667788', 'Natural Sciences', 'B.Sc Chemistry (COMSATS)', 'Teacher', ARRAY['Grade 9 - Section A', 'Grade 9 - Section B', 'Grade 8 - Section A'], ARRAY['Chemistry', 'Biology'], '2021-08-01', 105000.00),
  ('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', NULL, 'EMP-BSS-004', 'Mr. Kamran Bashir', 'kamran.bashir@beaconhouse-isb.edu.pk', '+92 300 2223344', 'Social Sciences', 'MA Pakistan Studies (AIOU)', 'Teacher', ARRAY['Grade 9 - Section B', 'Grade 8 - Section A'], ARRAY['Pakistan Studies', 'Islamiyat'], '2019-03-01', 98000.00),
  ('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', NULL, 'EMP-BSS-005', 'Ms. Huma Shafiq', 'huma.shafiq@beaconhouse-isb.edu.pk', '+92 311 3334455', 'Mathematics', 'M.Sc Mathematics (NUST)', 'Teacher', ARRAY['Grade 10 - Section B', 'Grade 9 - Section A'], ARRAY['Mathematics', 'Statistics'], '2022-08-01', 110000.00),

  -- City School Lahore
  ('d2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000003', 'EMP-CSL-001', 'Ms. Nadia Hussain', 'nadia.hussain@cityschool-lhr.edu.pk', '+92 321 5556677', 'Biology & Science', 'M.Sc Zoology (PU)', 'Senior Teacher', ARRAY['Grade 11 - Section A', 'Grade 10 - Section B'], ARRAY['Biology', 'Environmental Science'], '2017-08-01', 130000.00),
  ('d2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000004', 'EMP-CSL-002', 'Mr. Bilal Ahmad', 'bilal.ahmad@cityschool-lhr.edu.pk', '+92 300 6667788', 'Languages', 'MA Urdu (GCU)', 'Teacher', ARRAY['Grade 11 - Section A', 'Grade 10 - Section B'], ARRAY['Urdu', 'Islamiyat'], '2019-01-05', 95000.00),

  -- KGS Karachi
  ('d3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'b3000000-0000-0000-0000-000000000003', 'EMP-KGS-001', 'Dr. Tariq Mehmood', 'tariq.mehmood@kgs.edu.pk', '+92 321 8889900', 'Physics & Advanced Sciences', 'PhD Physics (UoK)', 'Head of Department', ARRAY['Grade 12 - Section A', 'Grade 11 - Section A'], ARRAY['Physics', 'Advanced Mathematics'], '2015-06-01', 180000.00)
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 5: ATTENDANCE ───────────────────────────────────────────────────────
INSERT INTO attendance (id, organization_id, student_id, student_name, class_name, section_name, date, status, remarks) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Muhammad Rayyan Khan', 'Grade 10', 'Section A', '2026-08-18', 'Present', NULL),
  ('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'Aisha Tariq', 'Grade 10', 'Section A', '2026-08-18', 'Present', NULL),
  ('e1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 'Hamza Butt', 'Grade 10', 'Section B', '2026-08-18', 'Absent', 'Sick leave — doctor note submitted'),
  ('e1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 'Fatima Sheikh', 'Grade 9', 'Section A', '2026-08-18', 'Present', NULL),
  ('e1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005', 'Usman Raza', 'Grade 9', 'Section B', '2026-08-18', 'Late', 'Arrived 20 minutes late'),
  ('e1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000006', 'Zara Noor', 'Grade 8', 'Section A', '2026-08-18', 'Present', NULL),
  ('e1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000007', 'Ali Hassan', 'Grade 8', 'Section A', '2026-08-18', 'Present', NULL),
  ('e1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Muhammad Rayyan Khan', 'Grade 10', 'Section A', '2026-08-17', 'Present', NULL),
  ('e1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'Aisha Tariq', 'Grade 10', 'Section A', '2026-08-17', 'Present', NULL),
  ('e1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 'Hamza Butt', 'Grade 10', 'Section B', '2026-08-17', 'Present', NULL),
  ('e2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000001', 'Sana Ijaz', 'Grade 11', 'Section A', '2026-08-18', 'Present', NULL),
  ('e2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'Bilal Chaudhry', 'Grade 11', 'Section A', '2026-08-18', 'Absent', 'Unexcused'),
  ('e3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000001', 'Ahmed Mirza', 'Grade 12', 'Section A', '2026-08-18', 'Present', NULL)
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 6: FEE INVOICES ─────────────────────────────────────────────────────
INSERT INTO fee_invoices (id, organization_id, student_id, student_name, class_name, title, amount, fine, discount, paid_amount, due_date, status, payment_method, pay_date) VALUES
  -- Beaconhouse ISB Invoices
  ('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Muhammad Rayyan Khan', 'Grade 10', 'Term 1 Tuition Fee (Aug–Dec 2025)', 45000.00, 0.00, 2000.00, 43000.00, '2025-09-10', 'Paid', 'Bank Transfer', '2025-09-05 10:00:00+05'),
  ('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Muhammad Rayyan Khan', 'Grade 10', 'Term 2 Tuition Fee (Jan–May 2026)', 45000.00, 0.00, 0.00, 45000.00, '2026-01-15', 'Paid', 'Online Banking', '2026-01-10 11:30:00+05'),
  ('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Muhammad Rayyan Khan', 'Grade 10', 'Annual Lab & Activity Fee 2025-2026', 15000.00, 0.00, 0.00, 0.00, '2026-09-01', 'Unpaid', NULL, NULL),
  ('f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'Aisha Tariq', 'Grade 10', 'Term 1 Tuition Fee (Aug–Dec 2025)', 45000.00, 0.00, 5000.00, 40000.00, '2025-09-10', 'Paid', 'Cash', '2025-09-02 09:00:00+05'),
  ('f1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'Aisha Tariq', 'Grade 10', 'Term 2 Tuition Fee (Jan–May 2026)', 45000.00, 500.00, 0.00, 22500.00, '2026-01-15', 'Partially Paid', 'Cash', '2026-01-20 14:00:00+05'),
  ('f1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 'Hamza Butt', 'Grade 10', 'Term 1 Tuition Fee (Aug–Dec 2025)', 45000.00, 1500.00, 0.00, 0.00, '2025-09-10', 'Overdue', NULL, NULL),
  ('f1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 'Fatima Sheikh', 'Grade 9', 'Term 1 Tuition Fee (Aug–Dec 2025)', 40000.00, 0.00, 0.00, 40000.00, '2025-09-10', 'Paid', 'Bank Transfer', '2025-09-01 10:00:00+05'),
  ('f1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005', 'Usman Raza', 'Grade 9', 'Transport Fee — Annual 2025-2026', 18000.00, 0.00, 0.00, 18000.00, '2025-09-01', 'Paid', 'Online Banking', '2025-08-28 15:00:00+05'),

  -- City School Lahore
  ('f2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000001', 'Sana Ijaz', 'Grade 11', 'Term 1 Tuition Fee (Aug–Dec 2025)', 38000.00, 0.00, 0.00, 38000.00, '2025-09-10', 'Paid', 'Bank Transfer', '2025-09-08 10:00:00+05'),
  ('f2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'Bilal Chaudhry', 'Grade 11', 'Term 1 Tuition Fee (Aug–Dec 2025)', 38000.00, 2000.00, 0.00, 0.00, '2025-09-10', 'Overdue', NULL, NULL),

  -- KGS Karachi
  ('f3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000001', 'Ahmed Mirza', 'Grade 12', 'A-Level Tuition Fee (Aug–Dec 2025)', 75000.00, 0.00, 0.00, 75000.00, '2025-09-10', 'Paid', 'Bank Transfer', '2025-09-05 09:00:00+05')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 7: EXPENSES ─────────────────────────────────────────────────────────
INSERT INTO expenses (id, organization_id, title, category, amount, date, status) VALUES
  ('g1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'August Electricity & Generator Fuel', 'Utilities', 85000.00, '2026-08-01', 'Approved'),
  ('g1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Monthly Internet & IT Infrastructure', 'Utilities', 25000.00, '2026-08-01', 'Approved'),
  ('g1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Annual Day Ceremony Arrangements', 'Events', 350000.00, '2026-08-10', 'Pending'),
  ('g1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Classroom Furniture Replacement (8 desks)', 'Maintenance', 64000.00, '2026-08-12', 'Approved'),
  ('g1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Staff Salaries — August 2026', 'Salary', 875000.00, '2026-08-31', 'Approved'),
  ('g2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Monthly Utilities — August 2026', 'Utilities', 65000.00, '2026-08-01', 'Approved'),
  ('g2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'Science Lab Equipment Purchase', 'Maintenance', 220000.00, '2026-08-05', 'Approved'),
  ('g3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'AC Repair & Maintenance', 'Maintenance', 95000.00, '2026-08-08', 'Approved')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 8: PAYROLL ──────────────────────────────────────────────────────────
INSERT INTO payrolls (id, organization_id, teacher_id, employee_name, month_year, basic_salary, allowances, deductions, net_salary, payment_status, payout_date) VALUES
  ('h1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Prof. Asad Ullah', 'August 2026', 145000.00, 20000.00, 10000.00, 155000.00, 'Paid', '2026-08-31'),
  ('h1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'Ms. Sara Khan', 'August 2026', 120000.00, 15000.00, 8000.00, 127000.00, 'Paid', '2026-08-31'),
  ('h1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'Mr. Zain Ali', 'August 2026', 105000.00, 12000.00, 7000.00, 110000.00, 'Paid', '2026-08-31'),
  ('h1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', 'Mr. Kamran Bashir', 'August 2026', 98000.00, 10000.00, 6500.00, 101500.00, 'Pending', '2026-08-31'),
  ('h1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005', 'Ms. Huma Shafiq', 'August 2026', 110000.00, 12000.00, 7500.00, 114500.00, 'Paid', '2026-08-31'),
  ('h2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'd2000000-0000-0000-0000-000000000001', 'Ms. Nadia Hussain', 'August 2026', 130000.00, 18000.00, 9000.00, 139000.00, 'Paid', '2026-08-31'),
  ('h3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'd3000000-0000-0000-0000-000000000001', 'Dr. Tariq Mehmood', 'August 2026', 180000.00, 30000.00, 15000.00, 195000.00, 'Paid', '2026-08-31')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 9: HOMEWORK ─────────────────────────────────────────────────────────
INSERT INTO homework (id, organization_id, class_name, subject, title, description, due_date, created_by_name) VALUES
  ('i1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Grade 10', 'Physics', 'Numerical Problems — Chapter 3: Motion', 'Solve problems 3.1 to 3.15 from the textbook. Show all working. Diagrams must be labeled.', '2026-08-22', 'Prof. Asad Ullah'),
  ('i1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Grade 10', 'English', 'Essay — My Role Model', 'Write a 400-word essay on your role model. Use proper paragraphs and vocabulary.', '2026-08-21', 'Ms. Sara Khan'),
  ('i1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Grade 9', 'Chemistry', 'Balancing Chemical Equations', 'Complete Exercise 4 from Chapter 2. Balance all equations and state the type of reaction.', '2026-08-23', 'Mr. Zain Ali'),
  ('i1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Grade 8', 'Mathematics', 'Algebraic Expressions Worksheet', 'Complete all 20 questions on the attached worksheet on simplifying algebraic expressions.', '2026-08-20', 'Ms. Huma Shafiq'),
  ('i2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Grade 11', 'Biology', 'Cell Division Diagrams', 'Draw and label all stages of Mitosis and Meiosis. Explain differences in 200 words.', '2026-08-22', 'Ms. Nadia Hussain')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 10: EXAMS ───────────────────────────────────────────────────────────
INSERT INTO exams (id, organization_id, class_name, subject, title, max_marks, date, status) VALUES
  ('j1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Grade 10', 'Physics', 'Mid-Term Examination — Physics', 100, '2026-09-15', 'Scheduled'),
  ('j1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Grade 10', 'Mathematics', 'Mid-Term Examination — Mathematics', 100, '2026-09-16', 'Scheduled'),
  ('j1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Grade 10', 'English', 'Mid-Term Examination — English', 100, '2026-09-17', 'Scheduled'),
  ('j1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Grade 9', 'Chemistry', 'Class Test — Chemical Bonding', 50, '2026-08-25', 'Scheduled'),
  ('j1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Grade 10', 'Physics', 'Unit Test — Chapter 1 & 2', 50, '2026-08-10', 'Graded'),
  ('j2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Grade 11', 'Biology', 'Mid-Term — Biology', 100, '2026-09-14', 'Scheduled'),
  ('j3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'Grade 12', 'Physics', 'A-Level Mock Examination — Physics', 100, '2026-09-20', 'Scheduled')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 11: RESULTS ─────────────────────────────────────────────────────────
INSERT INTO results (id, organization_id, exam_id, exam_title, subject, student_id, student_name, marks_obtained, max_marks, grade, comments) VALUES
  ('k1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'j1000000-0000-0000-0000-000000000005', 'Unit Test — Chapter 1 & 2', 'Physics', 'c1000000-0000-0000-0000-000000000001', 'Muhammad Rayyan Khan', 46.00, 50, 'A*', 'Excellent understanding of kinematics. Near-perfect attempt.'),
  ('k1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'j1000000-0000-0000-0000-000000000005', 'Unit Test — Chapter 1 & 2', 'Physics', 'c1000000-0000-0000-0000-000000000002', 'Aisha Tariq', 48.00, 50, 'A*', 'Outstanding performance. Diagrams are precise.'),
  ('k1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'j1000000-0000-0000-0000-000000000005', 'Unit Test — Chapter 1 & 2', 'Physics', 'c1000000-0000-0000-0000-000000000003', 'Hamza Butt', 38.00, 50, 'B+', 'Good attempt. Needs to improve on numerical accuracy.'),
  ('k1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'j1000000-0000-0000-0000-000000000005', 'Unit Test — Chapter 1 & 2', 'Physics', 'c1000000-0000-0000-0000-000000000004', 'Fatima Sheikh', 45.00, 50, 'A*', 'Impressive for Grade 9. Shows strong aptitude for science.')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 12: TIMETABLE ───────────────────────────────────────────────────────
INSERT INTO timetables (id, organization_id, class_name, day_of_week, period_number, start_time, end_time, subject, teacher_name, room_number) VALUES
  ('l1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Monday', 1, '08:00', '08:45', 'Physics', 'Prof. Asad Ullah', 'Lab 1'),
  ('l1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Monday', 2, '08:45', '09:30', 'English', 'Ms. Sara Khan', 'Room 12'),
  ('l1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Monday', 3, '09:30', '10:15', 'Mathematics', 'Ms. Huma Shafiq', 'Room 10'),
  ('l1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Monday', 4, '10:30', '11:15', 'Chemistry', 'Mr. Zain Ali', 'Lab 2'),
  ('l1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Monday', 5, '11:15', '12:00', 'Pakistan Studies', 'Mr. Kamran Bashir', 'Room 5'),
  ('l1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Tuesday', 1, '08:00', '08:45', 'Mathematics', 'Ms. Huma Shafiq', 'Room 10'),
  ('l1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Tuesday', 2, '08:45', '09:30', 'Physics', 'Prof. Asad Ullah', 'Lab 1'),
  ('l1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Wednesday', 1, '08:00', '08:45', 'English', 'Ms. Sara Khan', 'Room 12'),
  ('l1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Wednesday', 2, '08:45', '09:30', 'Chemistry', 'Mr. Zain Ali', 'Lab 2')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 13: LEAVE REQUESTS ──────────────────────────────────────────────────
INSERT INTO leave_requests (id, organization_id, applicant_name, role, leave_type, start_date, end_date, reason, status) VALUES
  ('m1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Mr. Zain Ali', 'TEACHER', 'Sick', '2026-08-20', '2026-08-21', 'Fever and flu — doctor prescribed 2 days rest.', 'Approved'),
  ('m1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Ms. Sara Khan', 'TEACHER', 'Casual', '2026-09-05', '2026-09-05', 'Family function in Lahore — one-day leave requested.', 'Pending'),
  ('m1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Mr. Kamran Bashir', 'TEACHER', 'Emergency', '2026-08-15', '2026-08-16', 'Father hospitalized — emergency family situation.', 'Approved'),
  ('m2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Ms. Nadia Hussain', 'TEACHER', 'Annual', '2026-09-10', '2026-09-15', 'Annual family trip booked in advance.', 'Pending')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 14: NOTICES ─────────────────────────────────────────────────────────
INSERT INTO notices (id, organization_id, title, content, target_role, date, author) VALUES
  ('n1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Mid-Term Examination Schedule Released', 'The Mid-Term Examinations for all classes will be held from September 15-20, 2026. Students are advised to collect their admit cards from the admin office by September 10.', 'All', '2026-08-18', 'Dr. Amna Siddiqui'),
  ('n1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'School Uniform Policy Reminder', 'All students must wear the prescribed school uniform. White shirt/kameez with school tie on Mondays and Wednesdays is mandatory. Non-compliance will result in disciplinary action.', 'Students', '2026-08-15', 'Administration'),
  ('n1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Fee Submission Deadline — Term 2', 'Parents are reminded that Term 2 fee must be submitted by September 10, 2026. A fine of Rs. 500/day will be charged after the due date.', 'Parents', '2026-08-12', 'Mr. Farhan Malik'),
  ('n1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Staff Development Training — September 2026', 'All teaching staff must attend the mandatory CPD training session on September 8, 2026 at 2:00 PM in the Conference Hall.', 'Teachers', '2026-08-10', 'Dr. Amna Siddiqui'),
  ('n2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Annual Prize Distribution Ceremony', 'The Annual Prize Distribution Ceremony will be held on October 15, 2026. All parents are cordially invited. RSVPs to be submitted by October 1.', 'All', '2026-08-18', 'Mr. Imran Qureshi'),
  ('n3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'A-Level Mock Exams Registration Open', 'Registration for Cambridge A-Level Mock Examinations is now open. Last date to register: September 5, 2026. Contact the Exam Department.', 'Students', '2026-08-17', 'Mrs. Rubina Farooqui')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 15: SCHOOL EVENTS ───────────────────────────────────────────────────
INSERT INTO school_events (id, organization_id, title, description, date, type) VALUES
  ('o1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Pakistan Independence Day Celebration', 'Flag hoisting ceremony at 8:00 AM, followed by speeches and a cultural show. All students in white dress.', '2026-08-14', 'cultural'),
  ('o1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Inter-School Science Olympiad', 'Beaconhouse ISB is hosting the annual Science Olympiad. Teams from 12 schools participating.', '2026-09-05', 'academic'),
  ('o1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Annual Sports Day 2026', 'Track & field events, cricket, football, basketball. Trophies awarded to top performers.', '2026-10-10', 'sports'),
  ('o1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Eid Milad-un-Nabi (PBUH)', 'No classes. School closed in observance of Eid Milad-un-Nabi.', '2026-09-15', 'holiday'),
  ('o2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Lahore Literature Festival Participation', 'Grade 11 & 12 students to attend LLF sessions. Permission slips due by August 25.', '2026-09-12', 'cultural'),
  ('o3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'Cambridge Mock Examination Week', 'Full-week mock examinations for A-Level candidates. Strict exam conditions apply.', '2026-09-20', 'academic')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 16: LIBRARY BOOKS ───────────────────────────────────────────────────
INSERT INTO library_books (id, organization_id, title, author, isbn, category, total_copies, available_copies) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'O Level Physics (Cambridge)', 'Tom Duncan', '978-1444176421', 'Science & Physics', 15, 8),
  ('p1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Pure Mathematics 1 (Cambridge)', 'Hugh Neill & Douglas Quadling', '978-0521530118', 'Mathematics', 12, 5),
  ('p1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Pakistan: A Hard Country', 'Anatol Lieven', '978-1610390231', 'Social Sciences', 3, 2),
  ('p1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Bano (ناول)', 'Razia Butt', '978-9696200000', 'Urdu Literature', 5, 4),
  ('p1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Aangan (آنگن)', 'Khadija Mastoor', '978-0199062720', 'Urdu Literature', 4, 3),
  ('p1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'An Introduction to Chemistry (O Level)', 'Brian Earl & Doug Wilford', '978-0340945988', 'Science & Chemistry', 10, 6),
  ('p1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'History of Pakistan and India', 'B.H. Farmer', '978-0521094337', 'History', 6, 6),
  ('p2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'A Level Biology (Cambridge)', 'Mary Jones & Geoff Jones', '978-1444176278', 'Science & Biology', 10, 3),
  ('p3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'Advanced Physics for You', 'Keith Johnson', '978-1408527368', 'Science & Physics', 8, 2)
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 17: TRANSPORT ROUTES ────────────────────────────────────────────────
INSERT INTO transport_routes (id, organization_id, route_name, vehicle_no, driver_name, driver_phone, fee) VALUES
  ('q1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Route A — F-6, F-7, F-8', 'ISB-BUS-001 (Hino Bus)', 'Muhammad Iqbal', '+92 300 1231231', 18000.00),
  ('q1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Route B — G-9, G-10, G-11', 'ISB-BUS-002 (Hino Bus)', 'Abdul Rehman', '+92 311 4564564', 18000.00),
  ('q1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Route C — E-7, E-11, Bahria Town', 'ISB-BUS-003 (Coaster)', 'Shahid Mehmood', '+92 321 7897897', 22000.00),
  ('q2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Route LHR-1 — Gulberg, Garden Town', 'LHR-BUS-001 (Hino Bus)', 'Asghar Ali', '+92 300 2323232', 16000.00),
  ('q3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'Route KHI-1 — Clifton, Defence', 'KHI-BUS-001 (Hino Bus)', 'Rafiq Ahmed', '+92 321 5656565', 20000.00)
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 18: HOSTEL ROOMS ────────────────────────────────────────────────────
INSERT INTO hostel_rooms (id, organization_id, room_no, type, total_beds, available_beds, fee) VALUES
  ('r1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'H-101', 'Double', 2, 0, 25000.00),
  ('r1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'H-102', 'Double', 2, 1, 25000.00),
  ('r1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'H-201', 'Dormitory', 6, 2, 15000.00),
  ('r1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'H-202', 'Dormitory', 6, 4, 15000.00),
  ('r1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'H-301', 'Single', 1, 1, 35000.00),
  ('r3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'KGS-H-01', 'Double', 2, 0, 30000.00),
  ('r3000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000003', 'KGS-H-02', 'Dormitory', 4, 1, 18000.00)
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 19: AUDIT LOGS ──────────────────────────────────────────────────────
INSERT INTO audit_logs (id, organization_id, user_name, role, action, module, ip_address, timestamp) VALUES
  ('s1000000-0000-0000-0000-000000000001', NULL, 'Dr. Haris Ahmed Khan', 'SUPER_ADMIN', 'LOGIN', 'Authentication', '192.168.1.100', '2026-08-18T08:00:00Z'),
  ('s1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Dr. Amna Siddiqui', 'SCHOOL_ADMIN', 'LOGIN', 'Authentication', '192.168.1.101', '2026-08-18T08:15:00Z'),
  ('s1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Mr. Farhan Malik', 'ACCOUNTANT', 'UPDATE', 'Fee Invoices', '192.168.1.105', '2026-08-18T09:30:00Z'),
  ('s1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Prof. Asad Ullah', 'TEACHER', 'INSERT', 'Homework', '192.168.1.102', '2026-08-18T10:00:00Z'),
  ('s1000000-0000-0000-0000-000000000005', 'a2000000-0000-0000-0000-000000000002', 'Mr. Imran Qureshi', 'SCHOOL_ADMIN', 'INSERT', 'Notices', '192.168.1.200', '2026-08-18T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SEED COMPLETE ✅
-- Schools: 3 | Users: 17 | Students: 12 | Teachers: 8
-- Fee Invoices: 11 | Exams: 7 | Results: 4 | Notices: 6
-- ==============================================================================
SELECT 'Seed data inserted successfully!' AS status,
  (SELECT COUNT(*) FROM organizations) AS organizations,
  (SELECT COUNT(*) FROM users) AS users,
  (SELECT COUNT(*) FROM students) AS students,
  (SELECT COUNT(*) FROM teachers) AS teachers,
  (SELECT COUNT(*) FROM fee_invoices) AS fee_invoices,
  (SELECT COUNT(*) FROM exams) AS exams;
