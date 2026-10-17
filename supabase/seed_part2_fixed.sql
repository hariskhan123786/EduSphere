-- ==============================================================================
-- EDUSPHERE AI — PAKISTANI SEED DATA (PART 2 — FIXED UUIDs)
-- ==============================================================================
-- Run this AFTER seed_pakistani_data.sql (orgs, users, students, teachers,
-- attendance, fee_invoices already inserted). This covers the rest.
-- All IDs use valid hex only (0-9, a-f).
-- UUID format: {table_2hex}{school_1d}00000-0000-0000-0000-{record_12hex}
--   07 = expenses | 08 = payroll | 09 = homework | 0a = exams
--   0b = results  | 0c = timetables | 0d = leave | 0e = notices
--   0f = events   | 10 = library | 11 = transport | 12 = hostel | 13 = audit
--   School: 1=ISB  2=LHR  3=KGS
-- ==============================================================================

-- ─── EXPENSES ─────────────────────────────────────────────────────────────────
INSERT INTO expenses (id, organization_id, title, category, amount, date, status) VALUES
  ('07100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'August Electricity & Generator Fuel', 'Utilities', 85000.00, '2026-08-01', 'Approved'),
  ('07100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Monthly Internet & IT Infrastructure', 'Utilities', 25000.00, '2026-08-01', 'Approved'),
  ('07100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Annual Day Ceremony Arrangements', 'Events', 350000.00, '2026-08-10', 'Pending'),
  ('07100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Classroom Furniture Replacement (8 desks)', 'Maintenance', 64000.00, '2026-08-12', 'Approved'),
  ('07100000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Staff Salaries — August 2026', 'Salary', 875000.00, '2026-08-31', 'Approved'),
  ('07200000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Monthly Utilities — August 2026', 'Utilities', 65000.00, '2026-08-01', 'Approved'),
  ('07200000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'Science Lab Equipment Purchase', 'Maintenance', 220000.00, '2026-08-05', 'Approved'),
  ('07300000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'AC Repair & Maintenance', 'Maintenance', 95000.00, '2026-08-08', 'Approved')
ON CONFLICT (id) DO NOTHING;

-- ─── PAYROLL ──────────────────────────────────────────────────────────────────
INSERT INTO payrolls (id, organization_id, teacher_id, employee_name, month_year, basic_salary, allowances, deductions, net_salary, payment_status, payout_date) VALUES
  ('08100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Prof. Asad Ullah', 'August 2026', 145000.00, 20000.00, 10000.00, 155000.00, 'Paid', '2026-08-31'),
  ('08100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'Ms. Sara Khan', 'August 2026', 120000.00, 15000.00, 8000.00, 127000.00, 'Paid', '2026-08-31'),
  ('08100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'Mr. Zain Ali', 'August 2026', 105000.00, 12000.00, 7000.00, 110000.00, 'Paid', '2026-08-31'),
  ('08100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', 'Mr. Kamran Bashir', 'August 2026', 98000.00, 10000.00, 6500.00, 101500.00, 'Pending', '2026-08-31'),
  ('08100000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005', 'Ms. Huma Shafiq', 'August 2026', 110000.00, 12000.00, 7500.00, 114500.00, 'Paid', '2026-08-31'),
  ('08200000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'd2000000-0000-0000-0000-000000000001', 'Ms. Nadia Hussain', 'August 2026', 130000.00, 18000.00, 9000.00, 139000.00, 'Paid', '2026-08-31'),
  ('08300000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'd3000000-0000-0000-0000-000000000001', 'Dr. Tariq Mehmood', 'August 2026', 180000.00, 30000.00, 15000.00, 195000.00, 'Paid', '2026-08-31')
ON CONFLICT (id) DO NOTHING;

-- ─── HOMEWORK ─────────────────────────────────────────────────────────────────
INSERT INTO homework (id, organization_id, class_name, subject, title, description, due_date, created_by_name) VALUES
  ('09100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Grade 10', 'Physics', 'Numerical Problems — Chapter 3: Motion', 'Solve problems 3.1 to 3.15 from the textbook. Show all working. Diagrams must be labeled.', '2026-08-22', 'Prof. Asad Ullah'),
  ('09100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Grade 10', 'English', 'Essay — My Role Model', 'Write a 400-word essay on your role model. Use proper paragraphs and vocabulary.', '2026-08-21', 'Ms. Sara Khan'),
  ('09100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Grade 9', 'Chemistry', 'Balancing Chemical Equations', 'Complete Exercise 4 from Chapter 2. Balance all equations and state the type of reaction.', '2026-08-23', 'Mr. Zain Ali'),
  ('09100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Grade 8', 'Mathematics', 'Algebraic Expressions Worksheet', 'Complete all 20 questions on the worksheet on simplifying algebraic expressions.', '2026-08-20', 'Ms. Huma Shafiq'),
  ('09200000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Grade 11', 'Biology', 'Cell Division Diagrams', 'Draw and label all stages of Mitosis and Meiosis. Explain differences in 200 words.', '2026-08-22', 'Ms. Nadia Hussain')
ON CONFLICT (id) DO NOTHING;

-- ─── EXAMS ────────────────────────────────────────────────────────────────────
INSERT INTO exams (id, organization_id, class_name, subject, title, max_marks, date, status) VALUES
  ('0a100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Grade 10', 'Physics', 'Mid-Term Examination — Physics', 100, '2026-09-15', 'Scheduled'),
  ('0a100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Grade 10', 'Mathematics', 'Mid-Term Examination — Mathematics', 100, '2026-09-16', 'Scheduled'),
  ('0a100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Grade 10', 'English', 'Mid-Term Examination — English', 100, '2026-09-17', 'Scheduled'),
  ('0a100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Grade 9', 'Chemistry', 'Class Test — Chemical Bonding', 50, '2026-08-25', 'Scheduled'),
  ('0a100000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Grade 10', 'Physics', 'Unit Test — Chapter 1 & 2', 50, '2026-08-10', 'Graded'),
  ('0a200000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Grade 11', 'Biology', 'Mid-Term — Biology', 100, '2026-09-14', 'Scheduled'),
  ('0a300000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'Grade 12', 'Physics', 'A-Level Mock Examination — Physics', 100, '2026-09-20', 'Scheduled')
ON CONFLICT (id) DO NOTHING;

-- ─── RESULTS ──────────────────────────────────────────────────────────────────
INSERT INTO results (id, organization_id, exam_id, exam_title, subject, student_id, student_name, marks_obtained, max_marks, grade, comments) VALUES
  ('0b100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', '0a100000-0000-0000-0000-000000000005', 'Unit Test — Chapter 1 & 2', 'Physics', 'c1000000-0000-0000-0000-000000000001', 'Muhammad Rayyan Khan', 46.00, 50, 'A*', 'Excellent understanding of kinematics. Near-perfect attempt.'),
  ('0b100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', '0a100000-0000-0000-0000-000000000005', 'Unit Test — Chapter 1 & 2', 'Physics', 'c1000000-0000-0000-0000-000000000002', 'Aisha Tariq', 48.00, 50, 'A*', 'Outstanding performance. Diagrams are precise.'),
  ('0b100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', '0a100000-0000-0000-0000-000000000005', 'Unit Test — Chapter 1 & 2', 'Physics', 'c1000000-0000-0000-0000-000000000003', 'Hamza Butt', 38.00, 50, 'B+', 'Good attempt. Needs to improve on numerical accuracy.'),
  ('0b100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', '0a100000-0000-0000-0000-000000000005', 'Unit Test — Chapter 1 & 2', 'Physics', 'c1000000-0000-0000-0000-000000000004', 'Fatima Sheikh', 45.00, 50, 'A*', 'Impressive for Grade 9. Strong aptitude for science.')
ON CONFLICT (id) DO NOTHING;

-- ─── TIMETABLES ───────────────────────────────────────────────────────────────
INSERT INTO timetables (id, organization_id, class_name, day_of_week, period_number, start_time, end_time, subject, teacher_name, room_number) VALUES
  ('0c100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Monday', 1, '08:00', '08:45', 'Physics', 'Prof. Asad Ullah', 'Lab 1'),
  ('0c100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Monday', 2, '08:45', '09:30', 'English', 'Ms. Sara Khan', 'Room 12'),
  ('0c100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Monday', 3, '09:30', '10:15', 'Mathematics', 'Ms. Huma Shafiq', 'Room 10'),
  ('0c100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Monday', 4, '10:30', '11:15', 'Chemistry', 'Mr. Zain Ali', 'Lab 2'),
  ('0c100000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Monday', 5, '11:15', '12:00', 'Pakistan Studies', 'Mr. Kamran Bashir', 'Room 5'),
  ('0c100000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Tuesday', 1, '08:00', '08:45', 'Mathematics', 'Ms. Huma Shafiq', 'Room 10'),
  ('0c100000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Tuesday', 2, '08:45', '09:30', 'Physics', 'Prof. Asad Ullah', 'Lab 1'),
  ('0c100000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Wednesday', 1, '08:00', '08:45', 'English', 'Ms. Sara Khan', 'Room 12'),
  ('0c100000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 'Grade 10 - Section A', 'Wednesday', 2, '08:45', '09:30', 'Chemistry', 'Mr. Zain Ali', 'Lab 2')
ON CONFLICT (id) DO NOTHING;

-- ─── LEAVE REQUESTS ───────────────────────────────────────────────────────────
INSERT INTO leave_requests (id, organization_id, applicant_name, role, leave_type, start_date, end_date, reason, status) VALUES
  ('0d100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Mr. Zain Ali', 'TEACHER', 'Sick', '2026-08-20', '2026-08-21', 'Fever and flu — doctor prescribed 2 days rest.', 'Approved'),
  ('0d100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Ms. Sara Khan', 'TEACHER', 'Casual', '2026-09-05', '2026-09-05', 'Family function in Lahore — one-day leave requested.', 'Pending'),
  ('0d100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Mr. Kamran Bashir', 'TEACHER', 'Emergency', '2026-08-15', '2026-08-16', 'Father hospitalized — emergency family situation.', 'Approved'),
  ('0d200000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Ms. Nadia Hussain', 'TEACHER', 'Annual', '2026-09-10', '2026-09-15', 'Annual family trip booked in advance.', 'Pending')
ON CONFLICT (id) DO NOTHING;

-- ─── NOTICES ──────────────────────────────────────────────────────────────────
INSERT INTO notices (id, organization_id, title, content, target_role, date, author) VALUES
  ('0e100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Mid-Term Examination Schedule Released', 'The Mid-Term Examinations for all classes will be held from September 15-20, 2026. Students are advised to collect their admit cards from the admin office by September 10.', 'All', '2026-08-18', 'Dr. Amna Siddiqui'),
  ('0e100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'School Uniform Policy Reminder', 'All students must wear the prescribed school uniform. White shirt/kameez with school tie on Mondays and Wednesdays is mandatory.', 'Students', '2026-08-15', 'Administration'),
  ('0e100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Fee Submission Deadline — Term 2', 'Parents are reminded that Term 2 fee must be submitted by September 10, 2026. A fine of Rs. 500/day will be charged after the due date.', 'Parents', '2026-08-12', 'Mr. Farhan Malik'),
  ('0e100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Staff Development Training — September 2026', 'All teaching staff must attend the mandatory CPD training session on September 8, 2026 at 2:00 PM in the Conference Hall.', 'Teachers', '2026-08-10', 'Dr. Amna Siddiqui'),
  ('0e200000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Annual Prize Distribution Ceremony', 'The Annual Prize Distribution Ceremony will be held on October 15, 2026. All parents are cordially invited. RSVPs due by October 1.', 'All', '2026-08-18', 'Mr. Imran Qureshi'),
  ('0e300000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'A-Level Mock Exams Registration Open', 'Registration for Cambridge A-Level Mock Examinations is now open. Last date: September 5, 2026.', 'Students', '2026-08-17', 'Mrs. Rubina Farooqui')
ON CONFLICT (id) DO NOTHING;

-- ─── SCHOOL EVENTS ────────────────────────────────────────────────────────────
INSERT INTO school_events (id, organization_id, title, description, date, type) VALUES
  ('0f100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Pakistan Independence Day Celebration', 'Flag hoisting at 8:00 AM, speeches and cultural show. All students in white dress.', '2026-08-14', 'cultural'),
  ('0f100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Inter-School Science Olympiad', 'Beaconhouse ISB hosting the annual Science Olympiad. Teams from 12 schools.', '2026-09-05', 'academic'),
  ('0f100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Annual Sports Day 2026', 'Track & field, cricket, football, basketball. Trophies awarded to top performers.', '2026-10-10', 'sports'),
  ('0f100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Eid Milad-un-Nabi (PBUH) Holiday', 'School closed in observance of Eid Milad-un-Nabi (PBUH).', '2026-09-15', 'holiday'),
  ('0f200000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Lahore Literature Festival Participation', 'Grade 11 & 12 students attending LLF. Permission slips due August 25.', '2026-09-12', 'cultural'),
  ('0f300000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'Cambridge Mock Examination Week', 'Full-week mocks for A-Level candidates. Strict exam conditions apply.', '2026-09-20', 'academic')
ON CONFLICT (id) DO NOTHING;

-- ─── LIBRARY BOOKS ────────────────────────────────────────────────────────────
INSERT INTO library_books (id, organization_id, title, author, isbn, category, total_copies, available_copies) VALUES
  ('10100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'O Level Physics (Cambridge)', 'Tom Duncan', '978-1444176421', 'Science & Physics', 15, 8),
  ('10100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Pure Mathematics 1 (Cambridge)', 'Hugh Neill & Douglas Quadling', '978-0521530118', 'Mathematics', 12, 5),
  ('10100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Pakistan: A Hard Country', 'Anatol Lieven', '978-1610390231', 'Social Sciences', 3, 2),
  ('10100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Bano (ناول)', 'Razia Butt', '978-9696200000', 'Urdu Literature', 5, 4),
  ('10100000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Aangan (آنگن)', 'Khadija Mastoor', '978-0199062720', 'Urdu Literature', 4, 3),
  ('10100000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'An Introduction to Chemistry (O Level)', 'Brian Earl & Doug Wilford', '978-0340945988', 'Science & Chemistry', 10, 6),
  ('10100000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'History of Pakistan and India', 'B.H. Farmer', '978-0521094337', 'History', 6, 6),
  ('10200000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'A Level Biology (Cambridge)', 'Mary Jones & Geoff Jones', '978-1444176278', 'Science & Biology', 10, 3),
  ('10300000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'Advanced Physics for You', 'Keith Johnson', '978-1408527368', 'Science & Physics', 8, 2)
ON CONFLICT (id) DO NOTHING;

-- ─── TRANSPORT ROUTES ─────────────────────────────────────────────────────────
INSERT INTO transport_routes (id, organization_id, route_name, vehicle_no, driver_name, driver_phone, fee) VALUES
  ('11100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Route A — F-6, F-7, F-8', 'ISB-BUS-001', 'Muhammad Iqbal', '+92 300 1231231', 18000.00),
  ('11100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Route B — G-9, G-10, G-11', 'ISB-BUS-002', 'Abdul Rehman', '+92 311 4564564', 18000.00),
  ('11100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Route C — E-7, E-11, Bahria Town', 'ISB-BUS-003', 'Shahid Mehmood', '+92 321 7897897', 22000.00),
  ('11200000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Route LHR-1 — Gulberg, Garden Town', 'LHR-BUS-001', 'Asghar Ali', '+92 300 2323232', 16000.00),
  ('11300000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'Route KHI-1 — Clifton, Defence', 'KHI-BUS-001', 'Rafiq Ahmed', '+92 321 5656565', 20000.00)
ON CONFLICT (id) DO NOTHING;

-- ─── HOSTEL ROOMS ─────────────────────────────────────────────────────────────
INSERT INTO hostel_rooms (id, organization_id, room_no, type, total_beds, available_beds, fee) VALUES
  ('12100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'H-101', 'Double', 2, 0, 25000.00),
  ('12100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'H-102', 'Double', 2, 1, 25000.00),
  ('12100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'H-201', 'Dormitory', 6, 2, 15000.00),
  ('12100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'H-202', 'Dormitory', 6, 4, 15000.00),
  ('12100000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'H-301', 'Single', 1, 1, 35000.00),
  ('12300000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'KGS-H-01', 'Double', 2, 0, 30000.00),
  ('12300000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000003', 'KGS-H-02', 'Dormitory', 4, 1, 18000.00)
ON CONFLICT (id) DO NOTHING;

-- ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
INSERT INTO audit_logs (id, organization_id, user_name, role, action, module, ip_address, timestamp) VALUES
  ('13000000-0000-0000-0000-000000000001', NULL, 'Dr. Haris Ahmed Khan', 'SUPER_ADMIN', 'LOGIN', 'Authentication', '192.168.1.100', '2026-08-18T08:00:00Z'),
  ('13100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Dr. Amna Siddiqui', 'SCHOOL_ADMIN', 'LOGIN', 'Authentication', '192.168.1.101', '2026-08-18T08:15:00Z'),
  ('13100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Mr. Farhan Malik', 'ACCOUNTANT', 'UPDATE', 'Fee Invoices', '192.168.1.105', '2026-08-18T09:30:00Z'),
  ('13100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Prof. Asad Ullah', 'TEACHER', 'INSERT', 'Homework', '192.168.1.102', '2026-08-18T10:00:00Z'),
  ('13200000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Mr. Imran Qureshi', 'SCHOOL_ADMIN', 'INSERT', 'Notices', '192.168.1.200', '2026-08-18T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ─── VERIFICATION ─────────────────────────────────────────────────────────────
SELECT
  'Seed Part 2 complete!' AS status,
  (SELECT COUNT(*) FROM expenses)       AS expenses,
  (SELECT COUNT(*) FROM payrolls)       AS payroll,
  (SELECT COUNT(*) FROM homework)       AS homework,
  (SELECT COUNT(*) FROM exams)          AS exams,
  (SELECT COUNT(*) FROM results)        AS results,
  (SELECT COUNT(*) FROM timetables)     AS timetables,
  (SELECT COUNT(*) FROM leave_requests) AS leave_requests,
  (SELECT COUNT(*) FROM notices)        AS notices,
  (SELECT COUNT(*) FROM school_events)  AS school_events,
  (SELECT COUNT(*) FROM library_books)  AS library_books,
  (SELECT COUNT(*) FROM transport_routes) AS transport_routes,
  (SELECT COUNT(*) FROM hostel_rooms)   AS hostel_rooms,
  (SELECT COUNT(*) FROM audit_logs)     AS audit_logs;
