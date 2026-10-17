/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI — Unified Enterprise Report & Document Generation Engine
 * Generates styled printable A4 documents (PDF/Print) and professionally formatted Excel spreadsheets.
 */

import { printHtmlDocument, exportToCsv } from "./api.js";

// ─── Currency & Date Formatters ───────────────────────────────────────────────
export function formatPKR(amount: number | null | undefined): string {
  if (amount == null) return "PKR 0";
  return "PKR " + Math.round(amount).toLocaleString("en-PK");
}

export function formatPKRFull(amount: number | null | undefined): string {
  if (amount == null) return "PKR 0.00";
  return "PKR " + Number(amount).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try { return new Date(date).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return String(date); }
}

export function todayString(): string {
  return new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── Professional Formatted Excel / SpreadsheetML Export ─────────────────────

export interface ExcelColumn {
  key: string;
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
  format?: "text" | "currency" | "number" | "percentage" | "date";
}

export interface ExcelReportOptions {
  filename: string;
  sheetName?: string;
  schoolName: string;
  schoolAddress?: string;
  reportTitle: string;
  academicSession?: string;
  generatedBy?: string;
  columns: ExcelColumn[];
  data: Record<string, any>[];
  summaryRow?: Record<string, any>;
  notes?: string;
}

function escapeXml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generates a professionally formatted, stylized Excel Spreadsheet (SpreadsheetML XML).
 * Opens natively in Microsoft Excel, LibreOffice Calc, and Google Sheets with formatted headers,
 * currency styling, alternating zebra lines, and summary totals.
 */
export function exportToExcelFormatted(options: ExcelReportOptions): void {
  const {
    filename,
    sheetName = "Report",
    schoolName,
    schoolAddress = "Campus Administration Division",
    reportTitle,
    academicSession = "2025-2026",
    generatedBy = "EduSphere AI Enterprise",
    columns,
    data,
    summaryRow,
    notes
  } = options;

  const totalCols = columns.length;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>${escapeXml(generatedBy)}</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>EduSphere AI</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <!-- Main Title Banner -->
  <Style ss:ID="SchoolBanner">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="15" ss:Bold="1" ss:Color="#4338CA"/>
   <Interior ss:Color="#EEF2FF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ReportTitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="12" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#EEF2FF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="MetaText">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#64748B" ss:Italic="1"/>
   <Interior ss:Color="#EEF2FF" ss:Pattern="Solid"/>
  </Style>
  <!-- Table Header -->
  <Style ss:ID="TableHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#3730A3"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#4F46E5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#4F46E5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#4F46E5"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
  </Style>
  <!-- Data Cell Styles -->
  <Style ss:ID="CellLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="CellLeftZebra">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#1E293B"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="CellCenterZebra">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#1E293B"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellCurrency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#0F172A" ss:Bold="1"/>
   <NumberFormat ss:Format="&quot;PKR &quot;#,##0"/>
  </Style>
  <Style ss:ID="CellCurrencyZebra">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#0F172A" ss:Bold="1"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="&quot;PKR &quot;#,##0"/>
  </Style>
  <!-- Summary Row -->
  <Style ss:ID="SummaryRow">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#4F46E5"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#1E1B4B"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#1E1B4B"/>
   <Interior ss:Color="#E0E7FF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SummaryRowCurrency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#4F46E5"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#1E1B4B"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#1E1B4B"/>
   <Interior ss:Color="#E0E7FF" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="&quot;PKR &quot;#,##0"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetName.slice(0, 31))}">
  <Table ss:DefaultRowHeight="20">
`;

  // Column definitions
  columns.forEach(col => {
    const colWidth = col.width || (col.format === "currency" ? 120 : col.label.length > 15 ? 140 : 100);
    xml += `   <Column ss:Width="${colWidth}"/>\n`;
  });

  // Header Banner Rows
  xml += `   <!-- Header Section -->\n`;
  xml += `   <Row ss:Height="26">\n`;
  xml += `    <Cell ss:MergeAcross="${totalCols - 1}" ss:StyleID="SchoolBanner"><Data ss:Type="String">🏫 ${escapeXml(schoolName)}</Data></Cell>\n`;
  xml += `   </Row>\n`;
  xml += `   <Row ss:Height="22">\n`;
  xml += `    <Cell ss:MergeAcross="${totalCols - 1}" ss:StyleID="ReportTitle"><Data ss:Type="String">📊 ${escapeXml(reportTitle)}</Data></Cell>\n`;
  xml += `   </Row>\n`;
  xml += `   <Row ss:Height="18">\n`;
  xml += `    <Cell ss:MergeAcross="${totalCols - 1}" ss:StyleID="MetaText"><Data ss:Type="String">Academic Session: ${escapeXml(academicSession)}  |  Generated: ${escapeXml(todayString())}  |  Issued by: ${escapeXml(generatedBy)}  |  ${escapeXml(schoolAddress)}</Data></Cell>\n`;
  xml += `   </Row>\n`;
  xml += `   <Row ss:Height="10"/>\n`; // Spacing row

  // Table Column Headers
  xml += `   <!-- Table Column Headers -->\n`;
  xml += `   <Row ss:Height="24">\n`;
  columns.forEach(col => {
    xml += `    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">${escapeXml(col.label)}</Data></Cell>\n`;
  });
  xml += `   </Row>\n`;

  // Data Rows
  xml += `   <!-- Data Records -->\n`;
  data.forEach((row, index) => {
    const isZebra = index % 2 === 1;
    xml += `   <Row ss:Height="20">\n`;

    columns.forEach(col => {
      const rawVal = row[col.key];
      const align = col.align || (col.format === "currency" || col.format === "number" ? "right" : "left");
      let styleId = isZebra ? "CellLeftZebra" : "CellLeft";

      if (col.format === "currency") {
        styleId = isZebra ? "CellCurrencyZebra" : "CellCurrency";
        const num = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal).replace(/[^0-9.-]+/g, "")) || 0;
        xml += `    <Cell ss:StyleID="${styleId}"><Data ss:Type="Number">${num}</Data></Cell>\n`;
      } else if (col.format === "number") {
        styleId = isZebra ? "CellCenterZebra" : "CellCenter";
        const num = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal)) || 0;
        xml += `    <Cell ss:StyleID="${styleId}"><Data ss:Type="Number">${num}</Data></Cell>\n`;
      } else {
        if (align === "center") styleId = isZebra ? "CellCenterZebra" : "CellCenter";
        xml += `    <Cell ss:StyleID="${styleId}"><Data ss:Type="String">${escapeXml(rawVal ?? "—")}</Data></Cell>\n`;
      }
    });

    xml += `   </Row>\n`;
  });

  // Summary Row (if provided)
  if (summaryRow) {
    xml += `   <!-- Summary / Totals Row -->\n`;
    xml += `   <Row ss:Height="22">\n`;
    columns.forEach((col, idx) => {
      const summaryVal = summaryRow[col.key];
      if (idx === 0 && !summaryVal) {
        xml += `    <Cell ss:StyleID="SummaryRow"><Data ss:Type="String">TOTAL / SUMMARY:</Data></Cell>\n`;
      } else if (col.format === "currency" && typeof summaryVal === "number") {
        xml += `    <Cell ss:StyleID="SummaryRowCurrency"><Data ss:Type="Number">${summaryVal}</Data></Cell>\n`;
      } else if (summaryVal !== undefined && summaryVal !== null) {
        xml += `    <Cell ss:StyleID="SummaryRow"><Data ss:Type="String">${escapeXml(summaryVal)}</Data></Cell>\n`;
      } else {
        xml += `    <Cell ss:StyleID="SummaryRow"><Data ss:Type="String"></Data></Cell>\n`;
      }
    });
    xml += `   </Row>\n`;
  }

  // Notes Section
  if (notes) {
    xml += `   <Row ss:Height="12"/>\n`;
    xml += `   <Row ss:Height="18">\n`;
    xml += `    <Cell ss:MergeAcross="${totalCols - 1}" ss:StyleID="MetaText"><Data ss:Type="String">📌 Note: ${escapeXml(notes)}</Data></Cell>\n`;
    xml += `   </Row>\n`;
  }

  xml += `  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Layout x:Orientation="Landscape"/>
    <Header x:Margin="0.3"/>
    <Footer x:Margin="0.3"/>
    <PageMargins x:Bottom="0.5" x:Left="0.5" x:Right="0.5" x:Top="0.5"/>
   </PageSetup>
   <Print>
    <ValidPrinterInfo/>
    <FitWidth>1</FitWidth>
    <FitHeight>0</FitHeight>
   </Print>
   <Selected/>
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>5</SplitHorizontal>
   <TopRowBottomPane>5</TopRowBottomPane>
   <ActivePane>2</ActivePane>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const safeFilename = filename.endsWith(".xls") ? filename : filename.endsWith(".xlsx") ? filename.replace(/\.xlsx$/, ".xls") : `${filename}.xls`;
  link.setAttribute("download", safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Specialized Module Excel Exporters ──────────────────────────────────────

export function exportStudentsExcel(students: any[], schoolName: string): void {
  exportToExcelFormatted({
    filename: `Students_Directory_${new Date().toISOString().split("T")[0]}`,
    sheetName: "Students Directory",
    schoolName,
    reportTitle: "Student Enrolment & Demographic Directory",
    columns: [
      { key: "admissionNo", label: "Admission No", width: 110, align: "center" },
      { key: "rollNo", label: "Roll No", width: 80, align: "center" },
      { key: "name", label: "Student Full Name", width: 160 },
      { key: "className", label: "Grade", width: 90, align: "center" },
      { key: "sectionName", label: "Section", width: 80, align: "center" },
      { key: "guardianName", label: "Guardian / Father", width: 150 },
      { key: "guardianPhone", label: "Contact Phone", width: 130 },
      { key: "attendanceRate", label: "Attendance (%)", width: 110, align: "center", format: "number" },
      { key: "status", label: "Status", width: 90, align: "center" }
    ],
    data: students.map(s => ({
      ...s,
      attendanceRate: s.attendanceRate ? `${s.attendanceRate}%` : "100%"
    })),
    notes: "Official institutional roll list. Confidential record."
  });
}

export function exportAttendanceExcel(attendance: any[], className: string, date: string, schoolName: string): void {
  const presentCount = attendance.filter(a => a.status === "Present").length;
  const absentCount = attendance.filter(a => a.status === "Absent").length;
  const leaveCount = attendance.filter(a => a.status === "Leave").length;

  exportToExcelFormatted({
    filename: `Attendance_${className.replace(/\s+/g, "_")}_${date}`,
    sheetName: "Daily Attendance",
    schoolName,
    reportTitle: `Daily Classroom Attendance Register — ${className}`,
    notes: `Summary: ${presentCount} Present, ${absentCount} Absent, ${leaveCount} On Leave. Total Enrolled: ${attendance.length}`,
    columns: [
      { key: "rollNo", label: "Roll #", width: 80, align: "center" },
      { key: "studentName", label: "Student Name", width: 180 },
      { key: "className", label: "Class", width: 90, align: "center" },
      { key: "status", label: "Attendance Status", width: 130, align: "center" },
      { key: "remarks", label: "Remarks / Reason", width: 200 }
    ],
    data: attendance
  });
}

export function exportFeesExcel(invoices: any[], schoolName: string): void {
  const totalBilled = invoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
  const totalOutstanding = totalBilled - totalPaid;

  exportToExcelFormatted({
    filename: `Fee_Ledger_${new Date().toISOString().split("T")[0]}`,
    sheetName: "Fee Invoices",
    schoolName,
    reportTitle: "Student Tuition & Fee Ledger Register",
    columns: [
      { key: "id", label: "Invoice ID", width: 110, align: "center" },
      { key: "studentName", label: "Student Name", width: 160 },
      { key: "className", label: "Grade", width: 80, align: "center" },
      { key: "title", label: "Fee Particulars", width: 150 },
      { key: "amount", label: "Billed Amount", width: 120, format: "currency" },
      { key: "paidAmount", label: "Collected Amount", width: 120, format: "currency" },
      { key: "dueDate", label: "Due Date", width: 100, align: "center" },
      { key: "status", label: "Status", width: 100, align: "center" },
      { key: "paymentMethod", label: "Payment Channel", width: 130 }
    ],
    data: invoices,
    summaryRow: {
      title: "AGGREGATE TOTALS:",
      amount: totalBilled,
      paidAmount: totalPaid,
      status: `Outstanding: ${formatPKR(totalOutstanding)}`
    },
    notes: `All fee transactions are verified against institutional bank ledgers.`
  });
}

export function exportResultsExcel(results: any[], examTitle: string, schoolName: string): void {
  exportToExcelFormatted({
    filename: `Results_${examTitle.replace(/\s+/g, "_")}`,
    sheetName: "Exam Results",
    schoolName,
    reportTitle: `Official Academic Assessment Matrix — ${examTitle}`,
    columns: [
      { key: "studentName", label: "Student Full Name", width: 170 },
      { key: "subject", label: "Subject Module", width: 130 },
      { key: "marksObtained", label: "Obtained Marks", width: 110, align: "center", format: "number" },
      { key: "maxMarks", label: "Max Marks", width: 100, align: "center", format: "number" },
      { key: "percentage", label: "Percentage (%)", width: 110, align: "center" },
      { key: "grade", label: "Grade", width: 80, align: "center" },
      { key: "comments", label: "Teacher Evaluation Remarks", width: 220 }
    ],
    data: results.map(r => ({
      ...r,
      percentage: r.maxMarks ? `${((r.marksObtained / r.maxMarks) * 100).toFixed(1)}%` : "—"
    }))
  });
}

export function exportPayrollExcel(payrolls: any[], monthOrSchool: string, maybeSchool?: string): void {
  const month = maybeSchool ? monthOrSchool : todayString();
  const schoolName = maybeSchool || monthOrSchool;
  const totalGross = payrolls.reduce((sum, p) => sum + (Number(p.basicSalary || p.salary) || 0) + (Number(p.allowances) || 0), 0);
  const totalNet = payrolls.reduce((sum, p) => sum + (Number(p.netSalary || p.salary) || 0), 0);

  exportToExcelFormatted({
    filename: `Payroll_Register_${month.replace(/\s+/g, "_")}`,
    sheetName: "Payroll Ledger",
    schoolName,
    reportTitle: `Faculty & Staff Salary Disbursement Ledger — ${month}`,
    columns: [
      { key: "employeeName", label: "Staff Member", width: 170 },
      { key: "monthYear", label: "Disbursement Month", width: 130, align: "center" },
      { key: "basicSalary", label: "Basic Pay", width: 120, format: "currency" },
      { key: "allowances", label: "Allowances", width: 110, format: "currency" },
      { key: "deductions", label: "Deductions", width: 110, format: "currency" },
      { key: "netSalary", label: "Net Payable", width: 120, format: "currency" },
      { key: "paymentStatus", label: "Payment Status", width: 110, align: "center" },
      { key: "payoutDate", label: "Execution Date", width: 110, align: "center" }
    ],
    data: payrolls,
    summaryRow: {
      monthYear: "TOTAL DISBURSEMENT:",
      basicSalary: totalGross,
      netSalary: totalNet,
      paymentStatus: "Approved"
    }
  });
}

export function exportAuditLogsExcel(logs: any[], schoolName: string): void {
  exportToExcelFormatted({
    filename: `Security_Audit_Log_${new Date().toISOString().split("T")[0]}`,
    sheetName: "Audit Logs",
    schoolName,
    reportTitle: "Enterprise Security & Data Modification Audit Log",
    columns: [
      { key: "timestamp", label: "Timestamp", width: 140, align: "center" },
      { key: "userName", label: "Operator User", width: 150 },
      { key: "role", label: "Security Role", width: 110, align: "center" },
      { key: "action", label: "Action Executed", width: 160 },
      { key: "module", label: "Target Module", width: 130, align: "center" },
      { key: "ipAddress", label: "IP / Terminal", width: 120, align: "center" }
    ],
    data: logs,
    notes: "Immutable tamper-proof audit record of all tenant events."
  });
}

// ─── Student Report Card Printable (A4 Multi-Page Layout) ────────────────────

export function exportStudentReportPDF(
  student: any,
  results: any[],
  attendance: any[],
  schoolName: string
): void {
  const present = attendance.filter(a => a.status === "Present").length;
  const total = attendance.length;
  const attRate = total > 0 ? ((present / total) * 100).toFixed(1) : (student.attendanceRate || 100);

  const resultsHtml = results.map(r => `
    <tr>
      <td>${escapeXml(r.examTitle || "General Assessment")}</td>
      <td>${escapeXml(r.subject || "Core Module")}</td>
      <td style="font-weight:bold;text-align:center;">${r.marksObtained ?? "—"}</td>
      <td style="text-align:center;">${r.maxMarks ?? 100}</td>
      <td style="font-weight:bold;text-align:center;">${r.maxMarks ? ((r.marksObtained / r.maxMarks) * 100).toFixed(1) + "%" : "—"}</td>
      <td style="color:#4f46e5;font-weight:bold;text-align:center;">${escapeXml(r.grade || "A")}</td>
      <td>${escapeXml(r.comments || "Satisfactory academic performance.")}</td>
    </tr>
  `).join("");

  const html = `
    <div class="print-container">
      <div style="text-align:center;border-bottom:2px solid #4f46e5;padding-bottom:12px;margin-bottom:16px;">
        <h1 style="color:#4f46e5;margin:0;font-size:20px;font-weight:800;letter-spacing:-0.02em;">${escapeXml(schoolName)}</h1>
        <h3 style="margin:4px 0 0 0;font-size:13px;color:#475569;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;">Official Student Progress Report Card</h3>
        <p style="margin:4px 0 0 0;font-size:10px;color:#94a3b8;">Academic Session 2025-2026 • Issued: ${todayString()}</p>
      </div>

      <div class="avoid-break" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;background:#f8fafc;padding:12px;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:16px;font-size:11px;">
        <div style="line-height:1.6;">
          <p><strong>Student Full Name:</strong> ${escapeXml(student.name)}</p>
          <p><strong>Admission Number:</strong> ${escapeXml(student.admissionNo || "—")}</p>
          <p><strong>Class &amp; Section:</strong> ${escapeXml(student.className)} — ${escapeXml(student.sectionName)}</p>
          <p><strong>Roll Number:</strong> ${escapeXml(student.rollNo || "01")}</p>
        </div>
        <div style="line-height:1.6;">
          <p><strong>Father / Guardian:</strong> ${escapeXml(student.guardianName || "Parent")}</p>
          <p><strong>Attendance Percentage:</strong> <span style="color:#10b981;font-weight:bold;">${attRate}%</span></p>
          <p><strong>Behavior &amp; Discipline Score:</strong> ${student.behaviorScore || 100}/100</p>
          <p><strong>Enrolment Status:</strong> <span style="color:#4f46e5;font-weight:bold;">${escapeXml(student.status || "Active")}</span></p>
        </div>
      </div>

      <div class="avoid-break">
        <h4 style="margin:12px 0 6px 0;color:#1e293b;font-size:12px;font-weight:700;">Academic Subject Marks Evaluation</h4>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Subject</th>
              <th style="text-align:center;">Marks</th>
              <th style="text-align:center;">Max</th>
              <th style="text-align:center;">Percentage</th>
              <th style="text-align:center;">Grade</th>
              <th>Teacher Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${resultsHtml || '<tr><td colspan="7" style="text-align:center;color:#64748b;padding:12px;">No assessment records recorded for this session.</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="avoid-break" style="margin-top:32px;display:flex;justify-content:space-between;padding-top:16px;border-top:1px dashed #cbd5e1;font-size:10px;">
        <div style="text-align:center;width:140px;">
          <p style="margin-bottom:32px;">_________________________</p>
          <p style="font-weight:bold;color:#334155;">Class Incharge</p>
        </div>
        <div style="text-align:center;width:140px;">
          <p style="margin-bottom:32px;">_________________________</p>
          <p style="font-weight:bold;color:#334155;">Examination Controller</p>
        </div>
        <div style="text-align:center;width:140px;">
          <p style="margin-bottom:32px;">_________________________</p>
          <p style="font-weight:bold;color:#334155;">Principal Seal</p>
        </div>
      </div>
    </div>
  `;

  printHtmlDocument(`Report Card — ${student.name}`, html);
}

// ─── Fee Receipt Printable (A4 Multi-Copy Layout) ────────────────────────────

export function exportFeeReceiptPDF(invoice: any, schoolName: string): void {
  const html = `
    <div class="print-container">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #4f46e5;padding-bottom:10px;margin-bottom:14px;">
        <div>
          <h2 style="color:#4f46e5;margin:0;font-size:18px;font-weight:800;">${escapeXml(schoolName)}</h2>
          <p style="color:#64748b;font-size:10px;margin:2px 0 0 0;">Campus Accounts &amp; Finance Division • Official Fee Voucher</p>
        </div>
        <div style="text-align:right;">
          <p style="font-family:monospace;font-size:12px;font-weight:bold;color:#4f46e5;margin:0;">VOUCHER: #FEE-${escapeXml(invoice.id?.substring(0, 8) || "001")}</p>
          <p style="color:#64748b;font-size:10px;margin:2px 0 0 0;">Issue Date: ${todayString()}</p>
        </div>
      </div>

      <div class="avoid-break" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#f8fafc;padding:12px;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:14px;font-size:11px;line-height:1.6;">
        <div>
          <p><strong>Student Full Name:</strong> ${escapeXml(invoice.studentName)}</p>
          <p><strong>Grade &amp; Section:</strong> ${escapeXml(invoice.className)}</p>
          <p><strong>Fee Title:</strong> ${escapeXml(invoice.title)}</p>
        </div>
        <div>
          <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
          <p><strong>Payment Channel:</strong> ${escapeXml(invoice.paymentMethod || "Bank Transfer")}</p>
          <p><strong>Settlement Status:</strong> <span style="color:#16a34a;font-weight:bold;">${escapeXml(invoice.status?.toUpperCase())}</span></p>
        </div>
      </div>

      <div class="avoid-break">
        <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
          <thead>
            <tr>
              <th>Fee Breakdown Description</th>
              <th style="text-align:right;">Billed Amount</th>
              <th style="text-align:right;">Paid / Collected</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${escapeXml(invoice.title)}</td>
              <td style="text-align:right;font-weight:bold;">${formatPKR(invoice.amount)}</td>
              <td style="text-align:right;font-weight:bold;color:#16a34a;">${formatPKR(invoice.paidAmount || invoice.amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="avoid-break" style="display:flex;justify-content:space-between;margin-top:40px;font-size:10px;">
        <p style="border-top:1px dashed #94a3b8;width:150px;text-align:center;padding-top:6px;font-weight:bold;">Accountant Signature</p>
        <p style="border-top:1px dashed #94a3b8;width:150px;text-align:center;padding-top:6px;font-weight:bold;">Principal Approval</p>
      </div>
    </div>
  `;

  printHtmlDocument(`Receipt_${invoice.id}`, html);
}

// ─── Daily Attendance Register Printable ──────────────────────────────────────

export function exportAttendancePDF(
  attendance: any[],
  className: string,
  date: string,
  schoolName: string
): void {
  const rows = attendance.map((a, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td style="font-weight:bold;">${escapeXml(a.studentName)}</td>
      <td style="text-align:center;">${escapeXml(a.rollNo || "0" + (i + 1))}</td>
      <td style="text-align:center;font-weight:bold;color:${a.status === 'Present' ? '#10b981' : a.status === 'Absent' ? '#ef4444' : '#f59e0b'};">${escapeXml(a.status)}</td>
      <td>${escapeXml(a.remarks || "—")}</td>
    </tr>
  `).join("");

  const html = `
    <div class="print-container">
      <div style="text-align:center;margin-bottom:14px;border-bottom:2px solid #4f46e5;padding-bottom:10px;">
        <h2 style="color:#4f46e5;margin:0;font-size:18px;font-weight:800;">${escapeXml(schoolName)}</h2>
        <h3 style="margin:4px 0 0 0;font-size:13px;color:#475569;">Daily Attendance Register — ${escapeXml(className)}</h3>
        <p style="margin:2px 0 0 0;font-size:10px;color:#94a3b8;">Record Date: ${formatDate(date)} • Issued: ${todayString()}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:40px;text-align:center;">#</th>
            <th>Student Name</th>
            <th style="width:80px;text-align:center;">Roll No</th>
            <th style="width:100px;text-align:center;">Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;

  printHtmlDocument(`Attendance — ${className} — ${date}`, html);
}

// ─── Class Results Matrix Printable ──────────────────────────────────────────

export function exportClassResultsPDF(results: any[], examTitle: string, schoolName: string): void {
  const rows = results.map((r, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td style="font-weight:bold;">${escapeXml(r.studentName)}</td>
      <td>${escapeXml(r.subject)}</td>
      <td style="text-align:center;font-weight:bold;">${r.marksObtained}</td>
      <td style="text-align:center;">${r.maxMarks || 100}</td>
      <td style="text-align:center;font-weight:bold;">${r.maxMarks ? ((r.marksObtained / r.maxMarks) * 100).toFixed(1) + "%" : "—"}</td>
      <td style="text-align:center;color:#4f46e5;font-weight:bold;">${escapeXml(r.grade || "A")}</td>
      <td>${escapeXml(r.comments || "—")}</td>
    </tr>
  `).join("");

  const html = `
    <div class="print-container">
      <div style="text-align:center;margin-bottom:14px;border-bottom:2px solid #4f46e5;padding-bottom:10px;">
        <h2 style="color:#4f46e5;margin:0;font-size:18px;font-weight:800;">${escapeXml(schoolName)}</h2>
        <h3 style="margin:4px 0 0 0;font-size:13px;color:#475569;">Examination Marks Matrix — ${escapeXml(examTitle)}</h3>
        <p style="margin:2px 0 0 0;font-size:10px;color:#94a3b8;">Generated: ${todayString()}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:40px;text-align:center;">#</th>
            <th>Student Name</th>
            <th>Subject</th>
            <th style="text-align:center;">Obtained</th>
            <th style="text-align:center;">Max</th>
            <th style="text-align:center;">Percentage</th>
            <th style="text-align:center;">Grade</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;

  printHtmlDocument(`Results — ${examTitle}`, html);
}

export function exportFeeRegisterPDF(invoices: any[], schoolName: string): void {
  const totalBilled = invoices.reduce((acc, i) => acc + (i.amount || 0), 0);
  const totalCollected = invoices.reduce((acc, i) => acc + (i.paidAmount || (i.status === "Paid" ? i.amount : 0)), 0);
  const totalOutstanding = totalBilled - totalCollected;

  const rows = invoices.map((inv, idx) => `
    <tr>
      <td style="text-align:center;">${idx + 1}</td>
      <td style="font-weight:bold;">${escapeXml(inv.studentName || "")}</td>
      <td>${escapeXml(inv.className || "—")}</td>
      <td>${escapeXml(inv.title || "Tuition")}</td>
      <td style="text-align:right;font-weight:bold;">${formatPKR(inv.amount)}</td>
      <td style="text-align:right;color:#16a34a;font-weight:bold;">${formatPKR(inv.paidAmount || (inv.status === "Paid" ? inv.amount : 0))}</td>
      <td style="text-align:center;font-weight:bold;color:${inv.status === 'Paid' ? '#16a34a' : inv.status === 'Partial' ? '#f59e0b' : '#ef4444'};">${escapeXml(inv.status?.toUpperCase() || "UNPAID")}</td>
      <td style="text-align:center;">${formatDate(inv.dueDate)}</td>
    </tr>
  `).join("");

  const html = `
    <div class="print-container">
      <div style="text-align:center;margin-bottom:14px;border-bottom:2px solid #4f46e5;padding-bottom:10px;">
        <h2 style="color:#4f46e5;margin:0;font-size:18px;font-weight:800;">${escapeXml(schoolName)}</h2>
        <h3 style="margin:4px 0 0 0;font-size:13px;color:#475569;">Comprehensive Fee Collection Ledger</h3>
        <p style="margin:2px 0 0 0;font-size:10px;color:#94a3b8;">Issued: ${todayString()} • Total Records: ${invoices.length}</p>
      </div>

      <div class="avoid-break" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;background:#f8fafc;padding:12px;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:14px;font-size:11px;text-align:center;">
        <div><strong>Total Billed:</strong> <span style="font-weight:bold;color:#4f46e5;">${formatPKR(totalBilled)}</span></div>
        <div><strong>Total Collected:</strong> <span style="font-weight:bold;color:#16a34a;">${formatPKR(totalCollected)}</span></div>
        <div><strong>Outstanding:</strong> <span style="font-weight:bold;color:#ef4444;">${formatPKR(totalOutstanding)}</span></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:30px;text-align:center;">#</th>
            <th>Student Name</th>
            <th>Class</th>
            <th>Fee Title</th>
            <th style="text-align:right;">Billed</th>
            <th style="text-align:right;">Collected</th>
            <th style="text-align:center;">Status</th>
            <th style="text-align:center;">Due Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
  printHtmlDocument("Fee_Collection_Ledger", html);
}

export function exportPayrollPDF(payrolls: any[], schoolName: string): void {
  const totalGross = payrolls.reduce((acc, p) => acc + (p.salary || p.basicSalary || 0), 0);
  const totalNet = payrolls.reduce((acc, p) => acc + (p.netSalary || p.salary || 0), 0);

  const rows = payrolls.map((p, idx) => `
    <tr>
      <td style="text-align:center;">${idx + 1}</td>
      <td style="font-weight:bold;">${escapeXml(p.teacherName || p.employeeName || "")}</td>
      <td>${escapeXml(p.designation || "Faculty")}</td>
      <td>${escapeXml(p.month || todayString())}</td>
      <td style="text-align:right;font-weight:bold;">${formatPKR(p.salary || p.basicSalary)}</td>
      <td style="text-align:right;color:#16a34a;font-weight:bold;">${formatPKR(p.netSalary || p.salary)}</td>
      <td style="text-align:center;font-weight:bold;color:${p.status === 'Paid' ? '#16a34a' : '#f59e0b'};">${escapeXml(p.status?.toUpperCase() || "PAID")}</td>
    </tr>
  `).join("");

  const html = `
    <div class="print-container">
      <div style="text-align:center;margin-bottom:14px;border-bottom:2px solid #4f46e5;padding-bottom:10px;">
        <h2 style="color:#4f46e5;margin:0;font-size:18px;font-weight:800;">${escapeXml(schoolName)}</h2>
        <h3 style="margin:4px 0 0 0;font-size:13px;color:#475569;">Faculty & Staff Payroll Ledger</h3>
        <p style="margin:2px 0 0 0;font-size:10px;color:#94a3b8;">Issued: ${todayString()} • Total Employees: ${payrolls.length}</p>
      </div>

      <div class="avoid-break" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#f8fafc;padding:12px;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:14px;font-size:11px;text-align:center;">
        <div><strong>Total Basic Salary:</strong> <span style="font-weight:bold;color:#4f46e5;">${formatPKR(totalGross)}</span></div>
        <div><strong>Total Net Disbursed:</strong> <span style="font-weight:bold;color:#16a34a;">${formatPKR(totalNet)}</span></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:30px;text-align:center;">#</th>
            <th>Staff Name</th>
            <th>Designation</th>
            <th>Payroll Period</th>
            <th style="text-align:right;">Gross</th>
            <th style="text-align:right;">Net Salary</th>
            <th style="text-align:center;">Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
  printHtmlDocument("Payroll_Disbursement_Ledger", html);
}

export function exportNoticeDocx(notice: any, schoolName: string): void {
  const content = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${escapeXml(notice.title || "School Notice")}</title></head>
<body style="font-family: Arial, sans-serif; padding: 40px; line-height: 1.6;">
  <div style="text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px;">
    <h1 style="color: #4f46e5; margin: 0;">${escapeXml(schoolName)}</h1>
    <h2 style="color: #334155; margin: 10px 0 0 0;">OFFICIAL CIRCULAR / NOTICE</h2>
    <p style="color: #64748b; margin: 5px 0;">Date: ${formatDate(notice.date || new Date())}</p>
  </div>
  <div style="margin-top: 30px;">
    <h3 style="color: #1e293b;">Subject: ${escapeXml(notice.title || "")}</h3>
    <p style="margin-top: 20px; font-size: 14px; text-align: justify;">${escapeXml(notice.content || notice.description || "")}</p>
  </div>
  <div style="margin-top: 60px; display: flex; justify-content: space-between;">
    <div><p>_________________________<br>Issued By: Administration</p></div>
    <div><p>_________________________<br>Principal Seal & Signature</p></div>
  </div>
</body>
</html>`;
  const blob = new Blob([content], { type: "application/vnd.ms-word;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Notice_${(notice.title || "Notice").replace(/[^a-zA-Z0-9]/g, "_")}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportLeaveLetterDocx(leave: any, schoolName: string): void {
  const content = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Leave Application</title></head>
<body style="font-family: Arial, sans-serif; padding: 40px; line-height: 1.6;">
  <div style="text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px;">
    <h1 style="color: #4f46e5; margin: 0;">${escapeXml(schoolName)}</h1>
    <h2 style="color: #334155; margin: 10px 0 0 0;">OFFICIAL LEAVE APPLICATION</h2>
    <p style="color: #64748b; margin: 5px 0;">Date: ${formatDate(leave.appliedDate || new Date())}</p>
  </div>
  <div style="margin-top: 30px;">
    <p>To,<br>The Principal / Authority,<br>${escapeXml(schoolName)}</p>
    <p><strong>Applicant Name:</strong> ${escapeXml(leave.applicantName || leave.teacherName || "")}</p>
    <p><strong>Leave Duration:</strong> ${formatDate(leave.startDate)} to ${formatDate(leave.endDate)}</p>
    <p><strong>Reason for Leave:</strong></p>
    <p style="background: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5;">${escapeXml(leave.reason || "")}</p>
    <p><strong>Clearance Status:</strong> ${escapeXml(leave.status || "Pending")}</p>
  </div>
  <div style="margin-top: 60px; display: flex; justify-content: space-between;">
    <div><p>_________________________<br>Applicant Signature</p></div>
    <div><p>_________________________<br>Authorized Approval</p></div>
  </div>
</body>
</html>`;
  const blob = new Blob([content], { type: "application/vnd.ms-word;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Leave_Application_${(leave.applicantName || "Staff").replace(/[^a-zA-Z0-9]/g, "_")}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportBackupJSON(dbState: any, schoolName: string): void {
  const json = JSON.stringify(dbState, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${schoolName.replace(/[^a-zA-Z0-9]/g, "_")}_System_Backup_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportBackupExcel(dbState: any, schoolName: string): void {
  exportFeesExcel(dbState.invoices || dbState.feeInvoices || [], schoolName);
}
