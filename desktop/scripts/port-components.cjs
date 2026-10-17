const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../../src/components');
const destDir = path.resolve(__dirname, '../src/components');

const files = [
  'TeacherPortal.tsx',
  'StudentPortal.tsx',
  'AccountantPortal.tsx',
  'ParentPortal.tsx',
  'PrincipalPortal.tsx',
  'SchoolAdmin.tsx',
  'SuperAdmin.tsx',
  'DashboardLayout.tsx'
];

for (const file of files) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);

  if (!fs.existsSync(srcPath)) {
    console.warn(`Source file ${srcPath} does not exist.`);
    continue;
  }

  let content = fs.readFileSync(srcPath, 'utf8');

  // Fix imports
  content = content.replace(/from\s+["']\.\.\/\.\.\/server\/dbStore\.js["'];/g, 'from "../types.js";');
  content = content.replace(/from\s+["']\.\.\/lib\/api\.js["'];/g, 'from "../lib/desktop-api.js";');
  content = content.replace(/from\s+["']\.\.\/lib\/desktop-api\.js["'];/g, 'from "../lib/desktop-api.js";');

  // Add reports imports if not already present
  if (!content.includes('from "../lib/reports.js"')) {
    content = content.replace(
      /import\s+{[^}]+}\s+from\s+["']\.\.\/lib\/desktop-api\.js["'];/g,
      (match) => `${match}\nimport { formatPKR, formatPKRFull, exportStudentReportPDF, exportFeeReceiptPDF, exportFeeRegisterPDF, exportPayrollPDF, exportAttendancePDF, exportClassResultsPDF, exportNoticeDocx, exportLeaveLetterDocx, exportBackupJSON, exportBackupExcel } from "../lib/reports.js";`
    );
  }

  // Schema compatibility
  content = content.replace(/dbState\.submissions/g, '(dbState.homeworkSubmissions || (dbState as any).submissions || [])');
  content = content.replace(/dbState\.timetables/g, '(dbState.timetable || (dbState as any).timetables || [])');
  content = content.replace(/dbState\.invoices/g, '(dbState.feeInvoices || (dbState as any).invoices || [])');
  content = content.replace(/dbState\.payrolls/g, '(dbState.payroll || (dbState as any).payrolls || [])');

  // Replace Dollar symbols with PKR
  content = content.replace(/DollarSign/g, 'CreditCard');
  content = content.replace(/\$\s*\{/g, '__TMP_INTERPOLATION__{'); // protect string interpolations `${...}`
  content = content.replace(/\$(\d+[\d,.]*)/g, '₨ $1');
  content = content.replace(/Amount\s*\(\$\)/gi, 'Amount (₨)');
  content = content.replace(/Fee\s*\(\$\)/gi, 'Fee (₨)');
  content = content.replace(/Salary\s*\(\$\)/gi, 'Salary (₨)');
  content = content.replace(/Revenue\s*\(\$\)/gi, 'Revenue (₨)');
  content = content.replace(/Total\s*\(\$\)/gi, 'Total (₨)');
  content = content.replace(/Balance\s*\(\$\)/gi, 'Balance (₨)');
  content = content.replace(/USD/g, 'PKR');
  content = content.replace(/\$\s*([0-9])/g, '₨ $1');
  content = content.replace(/__TMP_INTERPOLATION__{/g, '${');

  fs.writeFileSync(destPath, content, 'utf8');
  console.log(`✅ Ported ${file} -> size: ${content.length} bytes`);
}
