const fs = require('fs');
const path = require('path');

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
  const destPath = path.join(destDir, file);
  if (!fs.existsSync(destPath)) continue;

  let content = fs.readFileSync(destPath, 'utf8');

  // Fix duplicate CreditCard in imports
  // Replace Lucide icon list duplicate CreditCard
  content = content.replace(/CreditCard,\s*([^}]*?)CreditCard/g, 'CreditCard, $1');

  // Fix dbState missing property names
  content = content.replace(/dbState\.events/g, '(dbState.schoolEvents || (dbState as any).events || [])');
  content = content.replace(/dbState\.books/g, '(dbState.libraryBooks || (dbState as any).books || [])');
  content = content.replace(/dbState\.routes/g, '(dbState.transportRoutes || (dbState as any).routes || [])');
  content = content.replace(/dbState\.rooms/g, '(dbState.hostelRooms || (dbState as any).rooms || [])');

  fs.writeFileSync(destPath, content, 'utf8');
}
console.log('✅ Applied fixes to components.');
