pub mod auth;
pub mod backup;
pub mod reports;

use crate::db::DbPool;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct MutatePayload {
    pub action: String, // 'INSERT', 'UPDATE', 'DELETE'
    pub table: String,
    pub data: Value,
    pub user_context: Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MutateResult {
    pub success: bool,
    pub record: Value,
    pub queued: bool,
    pub sync_id: Option<String>,
}

/// Offline mutations remain disabled until every supported table has a reviewed,
/// transactional SQLite persistence implementation. Returning success here used
/// to create a misleading UI state: changes were only logged/queued and never
/// written locally.
#[tauri::command]
pub async fn mutate_db(
    _pool: State<'_, DbPool>,
    _payload: MutatePayload,
) -> Result<MutateResult, String> {
    Err("Offline changes are temporarily unavailable because local persistence has not been implemented for this operation. Reconnect to Supabase and retry; no change was saved.".to_string())
}

/// Returns the entire database schema state for the desktop frontend
#[tauri::command]
pub async fn fetch_db_state(
    pool: State<'_, DbPool>,
    org_id: Option<String>,
    role: Option<String>,
    user_id: Option<String>,
) -> Result<Value, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    // Query all organizations
    let mut org_stmt = conn.prepare("SELECT id, name, slug, logo, primary_color, academic_session, plan, mrr, status, phone, email, address FROM organizations").map_err(|e| e.to_string())?;
    let orgs = org_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "name": row.get::<_, String>(1)?,
            "slug": row.get::<_, String>(2)?,
            "logo": row.get::<_, String>(3)?,
            "primaryColor": row.get::<_, String>(4)?,
            "academicSession": row.get::<_, String>(5)?,
            "plan": row.get::<_, String>(6)?,
            "mrr": row.get::<_, f64>(7)?,
            "status": row.get::<_, String>(8)?,
            "phone": row.get::<_, Option<String>>(9)?,
            "email": row.get::<_, Option<String>>(10)?,
            "address": row.get::<_, Option<String>>(11)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query users
    let mut user_stmt = conn.prepare("SELECT id, organization_id, email, username, role, name, avatar, phone, status FROM users").map_err(|e| e.to_string())?;
    let users = user_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, Option<String>>(1)?,
            "email": row.get::<_, String>(2)?,
            "username": row.get::<_, String>(3)?,
            "role": row.get::<_, String>(4)?,
            "name": row.get::<_, String>(5)?,
            "avatar": row.get::<_, String>(6)?,
            "phone": row.get::<_, Option<String>>(7)?,
            "status": row.get::<_, String>(8)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query students
    let mut std_stmt = conn.prepare("SELECT id, organization_id, user_id, admission_no, roll_no, name, class_name, section_name, guardian_name, guardian_phone, guardian_email, medical_records, behavior_score, attendance_rate, status, admission_date, dob, gender, address FROM students").map_err(|e| e.to_string())?;
    let students = std_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "userId": row.get::<_, Option<String>>(2)?,
            "admissionNo": row.get::<_, String>(3)?,
            "rollNo": row.get::<_, String>(4)?,
            "name": row.get::<_, String>(5)?,
            "className": row.get::<_, String>(6)?,
            "sectionName": row.get::<_, String>(7)?,
            "guardianName": row.get::<_, String>(8)?,
            "guardianPhone": row.get::<_, String>(9)?,
            "guardianEmail": row.get::<_, Option<String>>(10)?,
            "medicalRecords": row.get::<_, String>(11)?,
            "behaviorScore": row.get::<_, i64>(12)?,
            "attendanceRate": row.get::<_, f64>(13)?,
            "status": row.get::<_, String>(14)?,
            "admissionDate": row.get::<_, String>(15)?,
            "dob": row.get::<_, Option<String>>(16)?,
            "gender": row.get::<_, Option<String>>(17)?,
            "address": row.get::<_, Option<String>>(18)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query teachers
    let mut tch_stmt = conn.prepare("SELECT id, organization_id, user_id, employee_id, name, email, phone, department, qualification, designation, classes_assigned, subjects_assigned, salary FROM teachers").map_err(|e| e.to_string())?;
    let teachers = tch_stmt.query_map([], |row| {
        let classes: String = row.get(10)?;
        let subjects: String = row.get(11)?;
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "userId": row.get::<_, Option<String>>(2)?,
            "employeeId": row.get::<_, String>(3)?,
            "name": row.get::<_, String>(4)?,
            "email": row.get::<_, Option<String>>(5)?,
            "phone": row.get::<_, String>(6)?,
            "department": row.get::<_, String>(7)?,
            "qualification": row.get::<_, String>(8)?,
            "designation": row.get::<_, String>(9)?,
            "classesAssigned": serde_json::from_str::<Value>(&classes).unwrap_or(serde_json::json!([])),
            "subjectsAssigned": serde_json::from_str::<Value>(&subjects).unwrap_or(serde_json::json!([])),
            "salary": row.get::<_, f64>(12)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query fee invoices
    let mut inv_stmt = conn.prepare("SELECT id, organization_id, student_id, student_name, class_name, title, amount, fine, discount, paid_amount, due_date, status, payment_method, pay_date FROM fee_invoices").map_err(|e| e.to_string())?;
    let invoices = inv_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "studentId": row.get::<_, String>(2)?,
            "studentName": row.get::<_, String>(3)?,
            "className": row.get::<_, String>(4)?,
            "title": row.get::<_, String>(5)?,
            "amount": row.get::<_, f64>(6)?,
            "fine": row.get::<_, f64>(7)?,
            "discount": row.get::<_, f64>(8)?,
            "paidAmount": row.get::<_, f64>(9)?,
            "dueDate": row.get::<_, String>(10)?,
            "status": row.get::<_, String>(11)?,
            "paymentMethod": row.get::<_, Option<String>>(12)?,
            "payDate": row.get::<_, Option<String>>(13)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query notices
    let mut notice_stmt = conn.prepare("SELECT id, organization_id, title, content, target_role, date, author FROM notices").map_err(|e| e.to_string())?;
    let notices = notice_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "title": row.get::<_, String>(2)?,
            "content": row.get::<_, String>(3)?,
            "targetRole": row.get::<_, String>(4)?,
            "date": row.get::<_, String>(5)?,
            "author": row.get::<_, String>(6)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query attendance
    let mut att_stmt = conn.prepare("SELECT id, organization_id, student_id, student_name, class_name, section_name, date, status, remarks FROM attendance").map_err(|e| e.to_string())?;
    let attendance = att_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "studentId": row.get::<_, String>(2)?,
            "studentName": row.get::<_, String>(3)?,
            "className": row.get::<_, String>(4)?,
            "sectionName": row.get::<_, Option<String>>(5)?,
            "date": row.get::<_, String>(6)?,
            "status": row.get::<_, String>(7)?,
            "remarks": row.get::<_, Option<String>>(8)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query expenses
    let mut exp_stmt = conn.prepare("SELECT id, organization_id, title, category, amount, date, status FROM expenses").map_err(|e| e.to_string())?;
    let expenses = exp_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "title": row.get::<_, String>(2)?,
            "category": row.get::<_, String>(3)?,
            "amount": row.get::<_, f64>(4)?,
            "date": row.get::<_, String>(5)?,
            "status": row.get::<_, String>(6)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query payrolls
    let mut pay_stmt = conn.prepare("SELECT id, organization_id, teacher_id, employee_name, month_year, basic_salary, allowances, deductions, net_salary, payment_status, payout_date FROM payrolls").map_err(|e| e.to_string())?;
    let payrolls = pay_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "teacherId": row.get::<_, Option<String>>(2)?,
            "employeeName": row.get::<_, String>(3)?,
            "monthYear": row.get::<_, String>(4)?,
            "basicSalary": row.get::<_, f64>(5)?,
            "allowances": row.get::<_, f64>(6)?,
            "deductions": row.get::<_, f64>(7)?,
            "netSalary": row.get::<_, f64>(8)?,
            "paymentStatus": row.get::<_, String>(9)?,
            "payoutDate": row.get::<_, Option<String>>(10)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query homework
    let mut hw_stmt = conn.prepare("SELECT id, organization_id, class_name, subject, title, description, due_date, created_by_name FROM homework").map_err(|e| e.to_string())?;
    let homework = hw_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "className": row.get::<_, String>(2)?,
            "subject": row.get::<_, String>(3)?,
            "title": row.get::<_, String>(4)?,
            "description": row.get::<_, String>(5)?,
            "dueDate": row.get::<_, String>(6)?,
            "createdByName": row.get::<_, String>(7)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query homework submissions
    let mut sub_stmt = conn.prepare("SELECT id, organization_id, homework_id, student_id, student_name, submission_content, grade, feedback, submitted_at, graded_at FROM homework_submissions").map_err(|e| e.to_string())?;
    let submissions = sub_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "homeworkId": row.get::<_, String>(2)?,
            "studentId": row.get::<_, String>(3)?,
            "studentName": row.get::<_, String>(4)?,
            "submissionContent": row.get::<_, String>(5)?,
            "grade": row.get::<_, Option<String>>(6)?,
            "feedback": row.get::<_, Option<String>>(7)?,
            "submittedAt": row.get::<_, Option<String>>(8)?,
            "gradedAt": row.get::<_, Option<String>>(9)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query exams
    let mut ex_stmt = conn.prepare("SELECT id, organization_id, class_name, subject, title, max_marks, date, status FROM exams").map_err(|e| e.to_string())?;
    let exams = ex_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "className": row.get::<_, String>(2)?,
            "subject": row.get::<_, String>(3)?,
            "title": row.get::<_, String>(4)?,
            "maxMarks": row.get::<_, i64>(5)?,
            "date": row.get::<_, String>(6)?,
            "status": row.get::<_, String>(7)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query results
    let mut res_stmt = conn.prepare("SELECT id, organization_id, exam_id, exam_title, subject, student_id, student_name, marks_obtained, max_marks, grade, comments FROM results").map_err(|e| e.to_string())?;
    let results = res_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "examId": row.get::<_, String>(2)?,
            "examTitle": row.get::<_, String>(3)?,
            "subject": row.get::<_, String>(4)?,
            "studentId": row.get::<_, String>(5)?,
            "studentName": row.get::<_, String>(6)?,
            "marksObtained": row.get::<_, f64>(7)?,
            "maxMarks": row.get::<_, f64>(8)?,
            "grade": row.get::<_, String>(9)?,
            "comments": row.get::<_, Option<String>>(10)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query timetables
    let mut tt_stmt = conn.prepare("SELECT id, organization_id, class_name, day_of_week, period_number, start_time, end_time, subject, teacher_name, room_number FROM timetables").map_err(|e| e.to_string())?;
    let timetables = tt_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "className": row.get::<_, String>(2)?,
            "dayOfWeek": row.get::<_, String>(3)?,
            "periodNumber": row.get::<_, i64>(4)?,
            "startTime": row.get::<_, String>(5)?,
            "endTime": row.get::<_, String>(6)?,
            "subject": row.get::<_, String>(7)?,
            "teacherName": row.get::<_, String>(8)?,
            "roomNumber": row.get::<_, Option<String>>(9)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query library books
    let mut bk_stmt = conn.prepare("SELECT id, organization_id, title, author, isbn, category, total_copies, available_copies FROM library_books").map_err(|e| e.to_string())?;
    let books = bk_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "title": row.get::<_, String>(2)?,
            "author": row.get::<_, String>(3)?,
            "isbn": row.get::<_, String>(4)?,
            "category": row.get::<_, String>(5)?,
            "totalCopies": row.get::<_, i64>(6)?,
            "availableCopies": row.get::<_, i64>(7)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query leave requests
    let mut lv_stmt = conn.prepare("SELECT id, organization_id, applicant_name, role, leave_type, start_date, end_date, reason, status FROM leave_requests").map_err(|e| e.to_string())?;
    let leaves = lv_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "applicantName": row.get::<_, String>(2)?,
            "role": row.get::<_, String>(3)?,
            "leaveType": row.get::<_, String>(4)?,
            "startDate": row.get::<_, String>(5)?,
            "endDate": row.get::<_, String>(6)?,
            "reason": row.get::<_, String>(7)?,
            "status": row.get::<_, String>(8)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query school events
    let mut ev_stmt = conn.prepare("SELECT id, organization_id, title, description, date, type FROM school_events").map_err(|e| e.to_string())?;
    let events = ev_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "title": row.get::<_, String>(2)?,
            "description": row.get::<_, Option<String>>(3)?,
            "date": row.get::<_, String>(4)?,
            "type": row.get::<_, Option<String>>(5)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query transport routes
    let mut tr_stmt = conn.prepare("SELECT id, organization_id, route_name, vehicle_no, driver_name, driver_phone, fee FROM transport_routes").map_err(|e| e.to_string())?;
    let transport = tr_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "routeName": row.get::<_, String>(2)?,
            "vehicleNo": row.get::<_, String>(3)?,
            "driverName": row.get::<_, String>(4)?,
            "driverPhone": row.get::<_, String>(5)?,
            "fee": row.get::<_, f64>(6)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    // Query hostel rooms
    let mut hr_stmt = conn.prepare("SELECT id, organization_id, room_no, type, total_beds, available_beds, fee FROM hostel_rooms").map_err(|e| e.to_string())?;
    let hostels = hr_stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "organizationId": row.get::<_, String>(1)?,
            "roomNo": row.get::<_, String>(2)?,
            "type": row.get::<_, Option<String>>(3)?,
            "totalBeds": row.get::<_, i64>(4)?,
            "availableBeds": row.get::<_, i64>(5)?,
            "fee": row.get::<_, f64>(6)?,
        }))
    }).map_err(|e| e.to_string())?.filter_map(|r| r.ok()).collect::<Vec<Value>>();

    let full_state = serde_json::json!({
        "organizations": orgs,
        "users": users,
        "students": students,
        "teachers": teachers,
        "attendance": attendance,
        "feeInvoices": invoices,
        "expenses": expenses,
        "payroll": payrolls,
        "homework": homework,
        "homeworkSubmissions": submissions,
        "exams": exams,
        "results": results,
        "timetable": timetables,
        "leaveRequests": leaves,
        "notices": notices,
        "schoolEvents": events,
        "libraryBooks": books,
        "transportRoutes": transport,
        "hostelRooms": hostels,
        "auditLogs": []
    });

    Ok(full_state)
}
