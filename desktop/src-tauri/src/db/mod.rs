pub mod schema;

use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::{params, Connection};
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;

pub type DbPool = Arc<Pool<SqliteConnectionManager>>;

/// Initializes the SQLite database at `%APPDATA%/com.edusphere.desktop/edusphere.db`
pub fn init_db(app_data_dir: PathBuf) -> Result<DbPool, Box<dyn std::error::Error>> {
    fs::create_dir_all(&app_data_dir)?;
    let db_path = app_data_dir.join("edusphere.db");
    
    println!("[EduSphere Desktop] SQLite Database Path: {:?}", db_path);

    let manager = SqliteConnectionManager::file(&db_path);
    let pool = Pool::builder().max_size(10).build(manager)?;

    // Run table creation schema & seed
    {
        let conn = pool.get()?;
        conn.execute_batch(schema::CREATE_TABLES_SQL)?;
        seed_complete_data(&conn)?;
    }

    Ok(Arc::new(pool))
}

pub fn seed_complete_data(conn: &Connection) -> Result<(), rusqlite::Error> {
    let student_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM students",
        [],
        |row| row.get(0),
    ).unwrap_or(0);

    let has_imhs: bool = conn.query_row(
        "SELECT COUNT(*) FROM organizations WHERE id = '01000000-0000-0000-0000-000000000001'",
        [],
        |row| row.get(0),
    ).map(|c: i64| c > 0).unwrap_or(false);

    // If already has IMHS and multiple records, don't re-seed
    if has_imhs && student_count >= 5 {
        return Ok(());
    }

    println!("[EduSphere Desktop] Seeding comprehensive offline database for all portals...");

    // Clear old sparse data if less than 5 students
    let _ = conn.execute("DELETE FROM attendance", []);
    let _ = conn.execute("DELETE FROM results", []);
    let _ = conn.execute("DELETE FROM exams", []);
    let _ = conn.execute("DELETE FROM homework_submissions", []);
    let _ = conn.execute("DELETE FROM homework", []);
    let _ = conn.execute("DELETE FROM fee_invoices", []);
    let _ = conn.execute("DELETE FROM expenses", []);
    let _ = conn.execute("DELETE FROM payrolls", []);
    let _ = conn.execute("DELETE FROM timetables", []);
    let _ = conn.execute("DELETE FROM leave_requests", []);
    let _ = conn.execute("DELETE FROM notices", []);
    let _ = conn.execute("DELETE FROM school_events", []);
    let _ = conn.execute("DELETE FROM library_books", []);
    let _ = conn.execute("DELETE FROM transport_routes", []);
    let _ = conn.execute("DELETE FROM hostel_rooms", []);
    let _ = conn.execute("DELETE FROM audit_logs", []);
    let _ = conn.execute("DELETE FROM students", []);
    let _ = conn.execute("DELETE FROM teachers", []);
    let _ = conn.execute("DELETE FROM users", []);
    let _ = conn.execute("DELETE FROM organizations", []);

    // 1. Organizations (Primary: IMHS Quetta, Secondary: Beaconhouse)
    conn.execute(
        "INSERT OR REPLACE INTO organizations (id, name, slug, logo, primary_color, academic_session, plan, mrr, status, phone, email, address)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            "01000000-0000-0000-0000-000000000001",
            "Islamia Model High School Quetta",
            "imhs-quetta",
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=128&q=80",
            "#4f46e5",
            "2025-2026",
            "Enterprise",
            1250000.0,
            "Active",
            "+92 81 282 1234",
            "info@imhs.edu.pk",
            "Jinnah Road, Quetta, Balochistan, Pakistan"
        ],
    )?;

    conn.execute(
        "INSERT OR REPLACE INTO organizations (id, name, slug, logo, primary_color, academic_session, plan, mrr, status, phone, email, address)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            "org-pk-1",
            "Beaconhouse Margalla Campus",
            "beaconhouse-isb",
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=128&q=80",
            "#4f46e5",
            "2025-2026",
            "Enterprise",
            1250000.0,
            "Active",
            "+92 51 111 777 888",
            "info@beaconhouse.edu.pk",
            "Sector H-8/4, Islamabad, Pakistan"
        ],
    )?;

    // 2. Users (IMHS Quetta + Legacy)
    let users = vec![
        ("02000000-0000-0000-0000-000000000001", None::<&str>, "haris@edusphere.ai", "haris", "SUPER_ADMIN", "Haris Khan (Super Admin)", "https://api.dicebear.com/7.x/initials/svg?seed=Haris", "+92 300 1234567"),
        ("02000000-0000-0000-0000-000000000002", Some("01000000-0000-0000-0000-000000000001"), "principal@imhs.edu.pk", "principal_imhs", "PRINCIPAL", "Prof. Dr. Tariq Mahmood Kakar", "https://api.dicebear.com/7.x/initials/svg?seed=Tariq", "+92 321 5551234"),
        ("02000000-0000-0000-0000-000000000003", Some("01000000-0000-0000-0000-000000000001"), "admin@imhs.edu.pk", "admin_imhs", "SCHOOL_ADMIN", "Malik Abdul Rehman Tareen (Admin Officer)", "https://api.dicebear.com/7.x/initials/svg?seed=AbdulRehman", "+92 321 5559876"),
        ("02000000-0000-0000-0000-000000000004", Some("01000000-0000-0000-0000-000000000001"), "accountant@imhs.edu.pk", "accountant_imhs", "ACCOUNTANT", "Kamran Akram Durrani (Chief Accountant)", "https://api.dicebear.com/7.x/initials/svg?seed=Kamran", "+92 301 8889900"),
        ("02000000-0000-0000-0000-000000000005", Some("01000000-0000-0000-0000-000000000001"), "ayesha.malik@imhs.edu.pk", "ayesha_sci", "TEACHER", "Ayesha Malik", "https://api.dicebear.com/7.x/initials/svg?seed=Ayesha", "+92 333 4445566"),
        ("user-sa-1", None::<&str>, "superadmin@edusphere.ai", "superadmin", "SUPER_ADMIN", "Dr. Haris Khan (SaaS Owner)", "https://api.dicebear.com/7.x/initials/svg?seed=Haris", "+92 300 1234567"),
        ("user-admin-1", Some("01000000-0000-0000-0000-000000000001"), "admin@beaconhouse.edu.pk", "schooladmin", "SCHOOL_ADMIN", "Malik Abdul Rehman Tareen", "https://api.dicebear.com/7.x/initials/svg?seed=Nasreen", "+92 321 5551234"),
        ("user-teacher-1", Some("01000000-0000-0000-0000-000000000001"), "asad.physics@beaconhouse.edu.pk", "teacher1", "TEACHER", "Prof. Asad Ullah (Physics Head)", "https://api.dicebear.com/7.x/initials/svg?seed=Asad", "+92 333 4445566"),
        ("user-teacher-2", Some("01000000-0000-0000-0000-000000000001"), "maryam.math@beaconhouse.edu.pk", "teacher2", "TEACHER", "Ms. Maryam Siddiqui (Maths)", "https://api.dicebear.com/7.x/initials/svg?seed=Maryam", "+92 334 5556677"),
        ("user-teacher-3", Some("01000000-0000-0000-0000-000000000001"), "tariq.chem@beaconhouse.edu.pk", "teacher3", "TEACHER", "Dr. Tariq Mehmood (Chemistry)", "https://api.dicebear.com/7.x/initials/svg?seed=Tariq", "+92 335 6667788"),
        ("user-student-1", Some("01000000-0000-0000-0000-000000000001"), "rayyan@beaconhouse.edu.pk", "student1", "STUDENT", "Muhammad Rayyan Khan", "https://api.dicebear.com/7.x/initials/svg?seed=Rayyan", "+92 312 9876543"),
        ("user-student-2", Some("01000000-0000-0000-0000-000000000001"), "ayesha@beaconhouse.edu.pk", "student2", "STUDENT", "Ayesha Noor Malik", "https://api.dicebear.com/7.x/initials/svg?seed=Ayesha", "+92 313 8765432"),
        ("user-student-3", Some("01000000-0000-0000-0000-000000000001"), "hamza@beaconhouse.edu.pk", "student3", "STUDENT", "Hamza Ali Abbasi", "https://api.dicebear.com/7.x/initials/svg?seed=Hamza", "+92 314 7654321"),
        ("user-student-4", Some("01000000-0000-0000-0000-000000000001"), "fatima@beaconhouse.edu.pk", "student4", "STUDENT", "Fatima Zahra", "https://api.dicebear.com/7.x/initials/svg?seed=Fatima", "+92 315 6543210"),
        ("user-student-5", Some("01000000-0000-0000-0000-000000000001"), "bilal@beaconhouse.edu.pk", "student5", "STUDENT", "Bilal Ahmed Qureshi", "https://api.dicebear.com/7.x/initials/svg?seed=Bilal", "+92 316 5432109"),
        ("user-parent-1", Some("01000000-0000-0000-0000-000000000001"), "parent@beaconhouse.edu.pk", "parent1", "PARENT", "Javed Iqbal Khan (Father)", "https://api.dicebear.com/7.x/initials/svg?seed=Javed", "+92 300 7778899"),
        ("user-accountant-1", Some("01000000-0000-0000-0000-000000000001"), "finance@beaconhouse.edu.pk", "accountant1", "ACCOUNTANT", "Kamran Baig (Finance Officer)", "https://api.dicebear.com/7.x/initials/svg?seed=Kamran", "+92 301 8889900"),
    ];

    for u in users {
        conn.execute(
            "INSERT OR REPLACE INTO users (id, organization_id, email, username, password_hash, role, name, avatar, phone, status)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'Active')",
            params![u.0, u.1, u.2, u.3, "pbkdf2_hash_placeholder", u.4, u.5, u.6, u.7],
        )?;
    }

    // 3. Teachers
    let teachers = vec![
        ("tch-1", "01000000-0000-0000-0000-000000000001", "user-teacher-1", "EMP-0091", "Prof. Asad Ullah", "asad.physics@beaconhouse.edu.pk", "+92 333 4445566", "Science & Mathematics", "M.Phil Applied Physics (QAU)", "Senior Faculty Head", "[\"Grade 10\", \"Grade 9\"]", "[\"Physics\", \"Applied Math\"]", 145000.0),
        ("tch-2", "01000000-0000-0000-0000-000000000001", "user-teacher-2", "EMP-0092", "Ms. Maryam Siddiqui", "maryam.math@beaconhouse.edu.pk", "+92 334 5556677", "Mathematics", "M.Sc Pure Mathematics (NUST)", "Senior Lecturer", "[\"Grade 10\", \"Grade 8\"]", "[\"Mathematics\", \"Calculus\"]", 125000.0),
        ("tch-3", "01000000-0000-0000-0000-000000000001", "user-teacher-3", "EMP-0093", "Dr. Tariq Mehmood", "tariq.chem@beaconhouse.edu.pk", "+92 335 6667788", "Chemistry & Biology", "Ph.D Organic Chemistry (PU)", "Associate Professor", "[\"Grade 10\", \"Grade 11\"]", "[\"Chemistry\", \"Biology\"]", 160000.0),
    ];

    for t in teachers {
        conn.execute(
            "INSERT OR REPLACE INTO teachers (id, organization_id, user_id, employee_id, name, email, phone, department, qualification, designation, classes_assigned, subjects_assigned, salary)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
            params![t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, t.8, t.9, t.10, t.11, t.12],
        )?;
    }

    // 4. Students
    let students = vec![
        ("std-1", "01000000-0000-0000-0000-000000000001", "user-student-1", "BSS-2025-0101", "10-A-01", "Muhammad Rayyan Khan", "Grade 10", "Section A", "Javed Iqbal Khan", "+92 300 7778899", "javed.khan@gmail.com", 96, 95.5, "House #14, Street 9, F-8/2, Islamabad"),
        ("std-2", "01000000-0000-0000-0000-000000000001", "user-student-2", "BSS-2025-0102", "10-A-02", "Ayesha Noor Malik", "Grade 10", "Section A", "Tariq Malik", "+92 300 6665544", "tariq.malik@gmail.com", 98, 98.0, "House #88, Street 4, I-8/3, Islamabad"),
        ("std-3", "01000000-0000-0000-0000-000000000001", "user-student-3", "BSS-2025-0103", "10-A-03", "Hamza Ali Abbasi", "Grade 10", "Section A", "Majid Abbasi", "+92 300 5554433", "majid.abbasi@gmail.com", 90, 88.5, "House #21, Street 12, G-11/1, Islamabad"),
        ("std-4", "01000000-0000-0000-0000-000000000001", "user-student-4", "BSS-2025-0104", "10-A-04", "Fatima Zahra", "Grade 10", "Section A", "Zahid Hussain", "+92 300 4443322", "zahid.hussain@gmail.com", 95, 94.0, "House #7, Street 3, E-11/2, Islamabad"),
        ("std-5", "01000000-0000-0000-0000-000000000001", "user-student-5", "BSS-2025-0105", "10-A-05", "Bilal Ahmed Qureshi", "Grade 10", "Section A", "Suhail Qureshi", "+92 300 3332211", "suhail.q@gmail.com", 92, 91.0, "House #55, Street 18, F-10/4, Islamabad"),
        ("std-6", "01000000-0000-0000-0000-000000000001", "", "BSS-2025-0106", "10-A-06", "Zainab Bibi", "Grade 10", "Section A", "Imran Nazir", "+92 300 2221100", "imran.nazir@gmail.com", 94, 96.0, "House #34, Street 7, G-9/2, Islamabad"),
    ];

    for s in students {
        conn.execute(
            "INSERT OR REPLACE INTO students (id, organization_id, user_id, admission_no, roll_no, name, class_name, section_name, guardian_name, guardian_phone, guardian_email, behavior_score, attendance_rate, address, status)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, 'Active')",
            params![s.0, s.1, s.2, s.3, s.4, s.5, s.6, s.7, s.8, s.9, s.10, s.11, s.12, s.13],
        )?;
    }

    // 5. Attendance Records
    let attendance = vec![
        ("att-1", "01000000-0000-0000-0000-000000000001", "std-1", "Muhammad Rayyan Khan", "Grade 10", "Section A", "2026-08-19", "Present", "On time"),
        ("att-2", "01000000-0000-0000-0000-000000000001", "std-2", "Ayesha Noor Malik", "Grade 10", "Section A", "2026-08-19", "Present", "On time"),
        ("att-3", "01000000-0000-0000-0000-000000000001", "std-3", "Hamza Ali Abbasi", "Grade 10", "Section A", "2026-08-19", "Late", "Arrived 10 mins late"),
        ("att-4", "01000000-0000-0000-0000-000000000001", "std-4", "Fatima Zahra", "Grade 10", "Section A", "2026-08-19", "Present", "On time"),
        ("att-5", "01000000-0000-0000-0000-000000000001", "std-5", "Bilal Ahmed Qureshi", "Grade 10", "Section A", "2026-08-19", "Present", "On time"),
        ("att-6", "01000000-0000-0000-0000-000000000001", "std-6", "Zainab Bibi", "Grade 10", "Section A", "2026-08-19", "Excused", "Medical appointment"),
        ("att-7", "01000000-0000-0000-0000-000000000001", "std-1", "Muhammad Rayyan Khan", "Grade 10", "Section A", "2026-08-18", "Present", "On time"),
        ("att-8", "01000000-0000-0000-0000-000000000001", "std-2", "Ayesha Noor Malik", "Grade 10", "Section A", "2026-08-18", "Present", "On time"),
    ];

    for a in attendance {
        conn.execute(
            "INSERT OR REPLACE INTO attendance (id, organization_id, student_id, student_name, class_name, section_name, date, status, remarks)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![a.0, a.1, a.2, a.3, a.4, a.5, a.6, a.7, a.8],
        )?;
    }

    // 6. Fee Invoices (in PKR)
    let invoices = vec![
        ("inv-1", "01000000-0000-0000-0000-000000000001", "std-1", "Muhammad Rayyan Khan", "Grade 10", "Term 1 Tuition & Lab Fee", 45000.0, 0.0, 0.0, 45000.0, "2026-09-10", "Paid", "Online Bank Transfer", "2026-08-15"),
        ("inv-2", "01000000-0000-0000-0000-000000000001", "std-2", "Ayesha Noor Malik", "Grade 10", "Term 1 Tuition Fee", 45000.0, 0.0, 5000.0, 40000.0, "2026-09-10", "Paid", "JazzCash / EasyPaisa", "2026-08-14"),
        ("inv-3", "01000000-0000-0000-0000-000000000001", "std-3", "Hamza Ali Abbasi", "Grade 10", "Term 1 Tuition & Transport Fee", 55000.0, 0.0, 0.0, 30000.0, "2026-09-10", "Partial", "Cash Desk", "2026-08-16"),
        ("inv-4", "01000000-0000-0000-0000-000000000001", "std-4", "Fatima Zahra", "Grade 10", "Term 1 Tuition Fee", 45000.0, 0.0, 0.0, 0.0, "2026-09-10", "Unpaid", "", ""),
        ("inv-5", "01000000-0000-0000-0000-000000000001", "std-5", "Bilal Ahmed Qureshi", "Grade 10", "Term 1 Tuition & Lab Fee", 45000.0, 0.0, 0.0, 45000.0, "2026-09-10", "Paid", "Crossed Cheque", "2026-08-10"),
    ];

    for inv in invoices {
        conn.execute(
            "INSERT OR REPLACE INTO fee_invoices (id, organization_id, student_id, student_name, class_name, title, amount, fine, discount, paid_amount, due_date, status, payment_method, pay_date)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
            params![inv.0, inv.1, inv.2, inv.3, inv.4, inv.5, inv.6, inv.7, inv.8, inv.9, inv.10, inv.11, inv.12, inv.13],
        )?;
    }

    // 7. Exams & Results
    let exams = vec![
        ("ex-1", "01000000-0000-0000-0000-000000000001", "Grade 10", "Physics", "First Term Board Preparation Exam", 100, "2026-09-25", "Scheduled"),
        ("ex-2", "01000000-0000-0000-0000-000000000001", "Grade 10", "Mathematics", "Mid-Term Algebra & Geometry Assessment", 100, "2026-09-28", "Scheduled"),
        ("ex-3", "01000000-0000-0000-0000-000000000001", "Grade 10", "Chemistry", "Practical & Theory Periodic Test", 75, "2026-10-02", "Scheduled"),
        ("ex-4", "01000000-0000-0000-0000-000000000001", "Grade 10", "English Language", "Comprehension & Essay Writing Exam", 100, "2026-10-05", "Scheduled"),
    ];

    for ex in exams {
        conn.execute(
            "INSERT OR REPLACE INTO exams (id, organization_id, class_name, subject, title, max_marks, date, status)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![ex.0, ex.1, ex.2, ex.3, ex.4, ex.5, ex.6, ex.7],
        )?;
    }

    let results = vec![
        ("res-1", "01000000-0000-0000-0000-000000000001", "ex-1", "First Term Board Preparation Exam", "Physics", "std-1", "Muhammad Rayyan Khan", 94.0, 100.0, "A+", "Outstanding grasp of thermodynamics and optics."),
        ("res-2", "01000000-0000-0000-0000-000000000001", "ex-2", "Mid-Term Algebra & Geometry Assessment", "Mathematics", "std-1", "Muhammad Rayyan Khan", 96.0, 100.0, "A+", "Perfect calculus derivations and geometric proofs."),
        ("res-3", "01000000-0000-0000-0000-000000000001", "ex-3", "Practical & Theory Periodic Test", "Chemistry", "std-1", "Muhammad Rayyan Khan", 70.0, 75.0, "A+", "Excellent laboratory titration results."),
        ("res-4", "01000000-0000-0000-0000-000000000001", "ex-1", "First Term Board Preparation Exam", "Physics", "std-2", "Ayesha Noor Malik", 98.0, 100.0, "A+", "Top score in the class. Flawless numerical calculations."),
        ("res-5", "01000000-0000-0000-0000-000000000001", "ex-2", "Mid-Term Algebra & Geometry Assessment", "Mathematics", "std-2", "Ayesha Noor Malik", 99.0, 100.0, "A+", "Exemplary performance across all sections."),
        ("res-6", "01000000-0000-0000-0000-000000000001", "ex-1", "First Term Board Preparation Exam", "Physics", "std-3", "Hamza Ali Abbasi", 82.0, 100.0, "A", "Good conceptual clarity. Needs more numerical practice."),
    ];

    for r in results {
        conn.execute(
            "INSERT OR REPLACE INTO results (id, organization_id, exam_id, exam_title, subject, student_id, student_name, marks_obtained, max_marks, grade, comments)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![r.0, r.1, r.2, r.3, r.4, r.5, r.6, r.7, r.8, r.9, r.10],
        )?;
    }

    // 8. Homework & Submissions
    let homework = vec![
        ("hw-1", "01000000-0000-0000-0000-000000000001", "Grade 10", "Physics", "Electromagnetism Problem Set 4", "Solve Chapter 14 numerical problems 1 through 12 from textbook page 188.", "2026-08-25", "Prof. Asad Ullah"),
        ("hw-2", "01000000-0000-0000-0000-000000000001", "Grade 10", "Mathematics", "Quadratic Equations Matrix Exercises", "Complete review questions for Chapter 3 exercise 3.4.", "2026-08-26", "Ms. Maryam Siddiqui"),
        ("hw-3", "01000000-0000-0000-0000-000000000001", "Grade 10", "Chemistry", "Organic Compounds Nomenclature Report", "Write structures and IUPAC names for functional groups assignment.", "2026-08-28", "Dr. Tariq Mehmood"),
    ];

    for h in homework {
        conn.execute(
            "INSERT OR REPLACE INTO homework (id, organization_id, class_name, subject, title, description, due_date, created_by_name)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![h.0, h.1, h.2, h.3, h.4, h.5, h.6, h.7],
        )?;
    }

    let submissions = vec![
        ("sub-1", "01000000-0000-0000-0000-000000000001", "hw-1", "std-1", "Muhammad Rayyan Khan", "Completed all 12 problems with detailed derivation diagrams and equations.", "A+", "Well structured with clear steps.", "2026-08-20 14:30:00", "2026-08-21 09:15:00"),
        ("sub-2", "01000000-0000-0000-0000-000000000001", "hw-1", "std-2", "Ayesha Noor Malik", "All derivations and numerical answers checked against laboratory references.", "A+", "Flawless work as usual.", "2026-08-20 16:45:00", "2026-08-21 09:20:00"),
    ];

    for s in submissions {
        conn.execute(
            "INSERT OR REPLACE INTO homework_submissions (id, organization_id, homework_id, student_id, student_name, submission_content, grade, feedback, submitted_at, graded_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![s.0, s.1, s.2, s.3, s.4, s.5, s.6, s.7, s.8, s.9],
        )?;
    }

    // 9. Expenses (PKR)
    let expenses = vec![
        ("exp-1", "01000000-0000-0000-0000-000000000001", "August Electricity & Solar Grid Maintenance", "Utilities", 85000.0, "2026-08-01", "Approved"),
        ("exp-2", "01000000-0000-0000-0000-000000000001", "Physics & Chemistry Lab Chemicals & Beakers", "Lab Supplies", 42000.0, "2026-08-05", "Approved"),
        ("exp-3", "01000000-0000-0000-0000-000000000001", "Campus High-Speed Fiber Internet Bill", "IT & Network", 18500.0, "2026-08-08", "Approved"),
        ("exp-4", "01000000-0000-0000-0000-000000000001", "School Bus Fleet Fuel & Engine Servicing", "Transportation", 64000.0, "2026-08-12", "Approved"),
    ];

    for exp in expenses {
        conn.execute(
            "INSERT OR REPLACE INTO expenses (id, organization_id, title, category, amount, date, status)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![exp.0, exp.1, exp.2, exp.3, exp.4, exp.5, exp.6],
        )?;
    }

    // 10. Payroll (PKR)
    let payrolls = vec![
        ("pay-1", "01000000-0000-0000-0000-000000000001", "tch-1", "Prof. Asad Ullah", "August 2026", 145000.0, 15000.0, 5000.0, 155000.0, "Paid", "2026-08-01"),
        ("pay-2", "01000000-0000-0000-0000-000000000001", "tch-2", "Ms. Maryam Siddiqui", "August 2026", 125000.0, 10000.0, 4000.0, 131000.0, "Paid", "2026-08-01"),
        ("pay-3", "01000000-0000-0000-0000-000000000001", "tch-3", "Dr. Tariq Mehmood", "August 2026", 160000.0, 20000.0, 6000.0, 174000.0, "Paid", "2026-08-01"),
    ];

    for p in payrolls {
        conn.execute(
            "INSERT OR REPLACE INTO payrolls (id, organization_id, teacher_id, employee_name, month_year, basic_salary, allowances, deductions, net_salary, payment_status, payout_date)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![p.0, p.1, p.2, p.3, p.4, p.5, p.6, p.7, p.8, p.9, p.10],
        )?;
    }

    // 11. Timetable
    let timetables = vec![
        ("tt-1", "01000000-0000-0000-0000-000000000001", "Grade 10", "Monday", 1, "08:00", "08:45", "Physics", "Prof. Asad Ullah", "Lab 2"),
        ("tt-2", "01000000-0000-0000-0000-000000000001", "Grade 10", "Monday", 2, "08:45", "09:30", "Mathematics", "Ms. Maryam Siddiqui", "Room 101"),
        ("tt-3", "01000000-0000-0000-0000-000000000001", "Grade 10", "Monday", 3, "09:30", "10:15", "Chemistry", "Dr. Tariq Mehmood", "Lab 1"),
        ("tt-4", "01000000-0000-0000-0000-000000000001", "Grade 10", "Tuesday", 1, "08:00", "08:45", "Mathematics", "Ms. Maryam Siddiqui", "Room 101"),
        ("tt-5", "01000000-0000-0000-0000-000000000001", "Grade 10", "Tuesday", 2, "08:45", "09:30", "Physics", "Prof. Asad Ullah", "Lab 2"),
    ];

    for t in timetables {
        conn.execute(
            "INSERT OR REPLACE INTO timetables (id, organization_id, class_name, day_of_week, period_number, start_time, end_time, subject, teacher_name, room_number)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![t.0, t.1, t.2, t.3, t.4, t.5, t.6, t.7, t.8, t.9],
        )?;
    }

    // 12. Library Books
    let books = vec![
        ("bk-1", "01000000-0000-0000-0000-000000000001", "Fundamentals of Physics (Extended 10th Ed)", "Halliday, Resnick, Walker", "978-1118230725", "Physics", 15, 12),
        ("bk-2", "01000000-0000-0000-0000-000000000001", "Oxford Advanced Learner's Dictionary 10th Ed", "Oxford University Press", "978-0194798488", "Language", 20, 18),
        ("bk-3", "01000000-0000-0000-0000-000000000001", "Calculus & Analytical Geometry", "George B. Thomas", "978-0201441413", "Mathematics", 10, 8),
        ("bk-4", "01000000-0000-0000-0000-000000000001", "Inorganic Chemistry 5th Ed", "Gary L. Miessler", "978-0321811059", "Chemistry", 8, 6),
    ];

    for b in books {
        conn.execute(
            "INSERT OR REPLACE INTO library_books (id, organization_id, title, author, isbn, category, total_copies, available_copies)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![b.0, b.1, b.2, b.3, b.4, b.5, b.6, b.7],
        )?;
    }

    // 13. Notices & Events
    let notices = vec![
        ("not-1", "01000000-0000-0000-0000-000000000001", "Annual Academic Science Fair 2026", "Students are invited to register their robotics and physics science projects by August 30th with the Science Club.", "All", "2026-08-18", "Principal Office"),
        ("not-2", "01000000-0000-0000-0000-000000000001", "First Term Examination Schedule Published", "First Term Board Examination timetable has been released. Please download your hall tickets and syllabus breakdown.", "All", "2026-08-15", "Examination Cell"),
        ("not-3", "01000000-0000-0000-0000-000000000001", "Independence Day Flag Hoisting & Celebrations", "Independence Day celebrations ceremony will commence at 08:30 AM in the Main Campus Grounds.", "All", "2026-08-14", "Campus Administration"),
    ];

    for n in notices {
        conn.execute(
            "INSERT OR REPLACE INTO notices (id, organization_id, title, content, target_role, date, author)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![n.0, n.1, n.2, n.3, n.4, n.5, n.6],
        )?;
    }

    let events = vec![
        ("ev-1", "01000000-0000-0000-0000-000000000001", "Annual Science & Tech Fair 2026", "Campus-wide innovation and science project exhibitions by secondary scholars.", "2026-09-15", "academic"),
        ("ev-2", "01000000-0000-0000-0000-000000000001", "Inter-School Sports Gala & Athletics", "Annual football, cricket, and track tournament at Sports Complex.", "2026-10-10", "sports"),
    ];

    for ev in events {
        conn.execute(
            "INSERT OR REPLACE INTO school_events (id, organization_id, title, description, date, type)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![ev.0, ev.1, ev.2, ev.3, ev.4, ev.5],
        )?;
    }

    // 14. Transport Routes & Hostel Rooms
    let routes = vec![
        ("tr-1", "01000000-0000-0000-0000-000000000001", "Route 1: Rawalpindi Saddar - Islamabad Campus", "ISB-7722", "Raja Muhammad Aslam", "+92 300 9998877", 8500.0),
        ("tr-2", "01000000-0000-0000-0000-000000000001", "Route 2: F-10, F-11, E-11 - Islamabad Campus", "ISB-8833", "Gulzar Ahmed", "+92 300 8887766", 7500.0),
    ];

    for r in routes {
        conn.execute(
            "INSERT OR REPLACE INTO transport_routes (id, organization_id, route_name, vehicle_no, driver_name, driver_phone, fee)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![r.0, r.1, r.2, r.3, r.4, r.5, r.6],
        )?;
    }

    let hostels = vec![
        ("hr-1", "01000000-0000-0000-0000-000000000001", "Room 201 - Jinnah Block", "Dormitory", 4, 2, 22000.0),
        ("hr-2", "01000000-0000-0000-0000-000000000001", "Room 202 - Iqbal Block", "Dormitory", 4, 1, 22000.0),
    ];

    for h in hostels {
        conn.execute(
            "INSERT OR REPLACE INTO hostel_rooms (id, organization_id, room_no, type, total_beds, available_beds, fee)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![h.0, h.1, h.2, h.3, h.4, h.5, h.6],
        )?;
    }

    println!("[EduSphere Desktop] ✅ Comprehensive offline database seeded successfully!");
    Ok(())
}

