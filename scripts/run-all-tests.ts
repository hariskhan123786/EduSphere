/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI — Unified System Verification Suite
 * Tests environment, database integrity, print service, public endpoints, and report generators.
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? " — " + detail : ""}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("  EDUSPHERE AI — PRODUCTION VERIFICATION TEST SUITE");
  console.log("=======================================================\n");

  // 1. Filesystem & Critical Files Check
  console.log("▶ 1. Validating Critical Files & Configuration...");
  const criticalFiles = [
    "server.ts",
    "src/lib/api.ts",
    "src/lib/printService.ts",
    "src/lib/reports.ts",
    "src/components/PrintPreviewModal.tsx",
    "desktop/src/lib/printService.ts",
    "desktop/src/lib/desktop-api.ts",
    "desktop/src-tauri/capabilities/default.json",
    "desktop/src-tauri/tauri.conf.json"
  ];

  for (const f of criticalFiles) {
    const fullPath = path.resolve(process.cwd(), f);
    assert(fs.existsSync(fullPath), `File exists: ${f}`);
  }

  // 2. Database Store Verification
  console.log("\n▶ 2. Validating Local Database Store...");
  try {
    const { readDb } = await import("../server/dbStore.js");
    const dbContent = readDb();
    assert(Array.isArray(dbContent.organizations), "Organizations collection exists");
    assert(dbContent.organizations.length > 0, `Organizations populated (${dbContent.organizations.length} schools)`);
    assert(Array.isArray(dbContent.users), "Users collection exists");
    assert(Array.isArray(dbContent.students), "Students collection exists");
    assert(Array.isArray(dbContent.teachers), "Teachers collection exists");
    assert(Array.isArray(dbContent.invoices), "Invoices collection exists");
  } catch (err: any) {
    assert(false, "Validate dbStore", err.message);
  }

  // 3. Print Service Architecture Verification
  console.log("\n▶ 3. Validating Print Service Safety (Non-Intrusive)...");
  const webPrintService = fs.readFileSync(path.resolve(process.cwd(), "src/lib/printService.ts"), "utf-8");
  assert(
    !webPrintService.includes('rootEl.style.setProperty("display", "none"'),
    "printService NEVER hides #root DOM element"
  );
  assert(
    webPrintService.includes("document.createElement(\"iframe\")"),
    "printService uses isolated iframe sandbox"
  );
  assert(
    webPrintService.includes("@page {"),
    "printService contains proper @page A4 CSS rules"
  );

  // 4. Tauri Capabilities Check
  console.log("\n▶ 4. Validating Tauri Capabilities & Desktop Security...");
  const capPath = path.resolve(process.cwd(), "desktop/src-tauri/capabilities/default.json");
  if (fs.existsSync(capPath)) {
    const capJson = JSON.parse(fs.readFileSync(capPath, "utf-8"));
    assert(capJson.identifier === "default", "Capability identifier is 'default'");
    assert(Array.isArray(capJson.permissions), "Permissions array defined");
    assert(!capJson.permissions.includes("shell:allow-execute"), "High-risk shell:allow-execute is NOT present (Secured)");
  }

  // 5. Reports Engine Verification
  console.log("\n▶ 5. Validating Reports & Excel Freeze Panes...");
  const reportsCode = fs.readFileSync(path.resolve(process.cwd(), "src/lib/reports.ts"), "utf-8");
  assert(reportsCode.includes("<FreezePanes/>"), "Excel XML includes FreezePanes element");
  assert(reportsCode.includes("<SplitHorizontal>5</SplitHorizontal>"), "Excel XML locks headers (SplitHorizontal: 5)");
  assert(reportsCode.includes("<FitWidth>1</FitWidth>"), "Excel XML has FitWidth page print setup");

  // Summary
  console.log("\n=======================================================");
  console.log(`  VERIFICATION FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
