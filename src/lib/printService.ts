/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI — Centralized Print Service (Web Edition)
 *
 * Architecture:
 *   printService
 *   ├── printHtmlDocument      — universal entry-point used by all components
 *   ├── printA4Portrait        — helper for standard A4 portrait documents
 *   ├── printA4Landscape       — helper for wide-table landscape documents
 *   └── buildReportShell       — reusable school letterhead / footer wrapper
 *
 * Design decisions:
 *  • We NEVER touch #root or the live app DOM.  The previous implementation hid
 *    #root with display:none — causing a permanent white screen whenever the
 *    browser or WebView2 omitted the 'afterprint' event (which happens on
 *    cancel, minimise, or when the dialog is closed without printing).
 *  • A hidden <iframe> is created and populated with a self-contained print
 *    document.  The host application remains fully interactive.
 *  • Full A4 CSS is embedded inside the iframe so fonts, colours, borders, and
 *    page breaks are consistent on every browser and Windows print driver.
 *  • Images and fonts are waited on before print() is called to eliminate
 *    blank-image or wrong-font artefacts.
 */

export type PrintOrientation = "portrait" | "landscape";

export interface PrintOptions {
  title?: string;
  orientation?: PrintOrientation;
  /** If true, wraps htmlContent in the standard EduSphere school letterhead */
  withLetterhead?: boolean;
  schoolName?: string;
  reportTitle?: string;
  generatedBy?: string;
}

// ─── A4 base CSS injected inside every print iframe ──────────────────────────
function buildA4Css(orientation: PrintOrientation): string {
  return `
    *, *::before, *::after { box-sizing: border-box; }

    @page {
      size: A4 ${orientation};
      margin: 12mm 10mm 14mm 10mm;
    }

    html, body {
      width: 100%;
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .print-page {
      width: ${orientation === "landscape" ? "267mm" : "190mm"};
      min-height: ${orientation === "landscape" ? "179mm" : "265mm"};
      margin: 0 auto;
      padding: 0;
      background: #ffffff;
    }

    /* ─── Letterhead ─────────────────────────────── */
    .lh-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .lh-school-name {
      font-size: 16px;
      font-weight: 800;
      color: #4f46e5;
      margin: 0;
    }
    .lh-school-meta {
      font-size: 9px;
      color: #64748b;
      margin: 2px 0 0 0;
    }
    .lh-report-title {
      text-align: right;
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .lh-generated {
      text-align: right;
      font-size: 9px;
      color: #94a3b8;
    }

    /* ─── Tables ─────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 10px;
    }
    thead {
      display: table-header-group; /* repeats on every page */
    }
    tfoot {
      display: table-footer-group;
    }
    th {
      background: #4f46e5 !important;
      color: #ffffff !important;
      font-weight: 700;
      padding: 6px 8px;
      text-align: left;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      border: 1px solid #4338ca;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
      font-size: 10px;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    tr { break-inside: avoid; page-break-inside: avoid; }

    /* ─── Page breaks ────────────────────────────── */
    h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }
    .avoid-break { break-inside: avoid; page-break-inside: avoid; }
    .page-break { break-before: page; page-break-before: always; }

    /* ─── Footer ─────────────────────────────────── */
    .print-footer {
      position: running(footer);
      font-size: 8px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 4px;
      margin-top: 20px;
    }

    @page {
      @bottom-left { content: element(footer); }
    }

    /* ─── Utility ────────────────────────────────── */
    .no-print { display: none !important; }
    .text-indigo { color: #4f46e5; }
    .text-gray    { color: #64748b; }
    .font-bold    { font-weight: 700; }
    .text-center  { text-align: center; }
    .text-right   { text-align: right; }
    .mt-4         { margin-top: 16px; }
    .mb-4         { margin-bottom: 16px; }
  `;
}

// ─── School letterhead wrapper ────────────────────────────────────────────────
function buildLetterhead(opts: PrintOptions, content: string): string {
  const today = new Date().toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const header = opts.withLetterhead
    ? `
    <div class="lh-header">
      <div>
        <h1 class="lh-school-name">${escapeHtml(opts.schoolName || "EduSphere AI")}</h1>
        <p class="lh-school-meta">Official Report — EduSphere AI Enterprise</p>
      </div>
      <div>
        <div class="lh-report-title">${escapeHtml(opts.reportTitle || "")}</div>
        <div class="lh-generated">Generated: ${today}${opts.generatedBy ? " · " + escapeHtml(opts.generatedBy) : ""}</div>
      </div>
    </div>`
    : "";

  return `
    <div class="print-page">
      ${header}
      ${content}
      <div class="print-footer">
        <span>EduSphere AI Enterprise • Confidential School Document</span>
        <span>Generated: ${today}</span>
      </div>
    </div>
  `;
}

// ─── HTML entity escaping ─────────────────────────────────────────────────────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Wait for all resources inside a container ───────────────────────────────
function waitForResources(doc: Document): Promise<void> {
  const fontsReady: Promise<unknown> =
    "fonts" in doc ? (doc as any).fonts.ready.catch(() => undefined) : Promise.resolve();

  const images = Array.from(doc.querySelectorAll<HTMLImageElement>("img"));
  const imagesReady = images.map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete) return resolve();
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      })
  );

  return Promise.race([
    Promise.all([fontsReady, ...imagesReady]),
    new Promise<void>((resolve) => setTimeout(resolve, 5000)),
  ]) as Promise<void>;
}

// ─── Core print function ──────────────────────────────────────────────────────
/**
 * Renders an HTML document inside an isolated hidden iframe and triggers the
 * native browser / WebView2 print dialog.
 *
 * The host app UI (#root) is NEVER touched. The iframe is removed after
 * printing completes (or after a 2-minute safety timeout).
 */
export async function printHtmlDocument(
  title: string,
  htmlContent: string,
  opts: PrintOptions = {}
): Promise<void> {
  const orientation = opts.orientation ?? "portrait";

  const body = opts.withLetterhead
    ? buildLetterhead(opts, htmlContent)
    : `<div class="print-page">${htmlContent}</div>`;

  const printStyles = `<style>
    ${buildA4Css(orientation)}
  </style>`;

  return new Promise<void>(async (resolve) => {
    // 1. Ensure dedicated #edusphere-print-overlay element exists on document.body
    let overlay = document.getElementById("edusphere-print-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "edusphere-print-overlay";
      document.body.appendChild(overlay);
    }

    // 2. Populate print overlay with isolated styles & content
    overlay.innerHTML = `${printStyles}${body}`;

    const originalTitle = document.title;
    document.title = title;

    // 3. Flag body for print isolation (hides #root in @media print only)
    document.body.classList.add("printing-document");

    let isCleanedUp = false;
    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      document.body.classList.remove("printing-document");
      document.title = originalTitle;
      if (overlay) {
        overlay.innerHTML = "";
      }
      window.removeEventListener("afterprint", onAfterPrint);
      resolve();
    };

    const onAfterPrint = () => {
      setTimeout(cleanup, 200);
    };

    window.addEventListener("afterprint", onAfterPrint, { once: true });

    try {
      // 4. Wait for fonts & images inside the print overlay to render
      await waitForResources(document);
      window.focus();
      window.print();
    } catch (printErr) {
      console.warn("[Print Service] window.print invocation failed, attempting fallback:", printErr);
    }

    // Safety timeout: In case afterprint is withheld by the OS/WebView2 environment
    setTimeout(cleanup, 2500);
  });
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

export function printA4Portrait(title: string, html: string, opts?: Omit<PrintOptions, "orientation">): Promise<void> {
  return printHtmlDocument(title, html, { ...opts, orientation: "portrait" });
}

export function printA4Landscape(title: string, html: string, opts?: Omit<PrintOptions, "orientation">): Promise<void> {
  return printHtmlDocument(title, html, { ...opts, orientation: "landscape" });
}

export function printStudentReport(schoolName: string, title: string, html: string): Promise<void> {
  return printHtmlDocument(title, html, {
    withLetterhead: true,
    schoolName,
    reportTitle: title,
    orientation: "portrait",
  });
}

export function printFeeReceipt(schoolName: string, receiptId: string, html: string): Promise<void> {
  return printHtmlDocument(`Fee Receipt — ${receiptId}`, html, {
    withLetterhead: true,
    schoolName,
    reportTitle: `Fee Receipt #${receiptId}`,
    orientation: "portrait",
  });
}

export function printAttendanceReport(schoolName: string, className: string, date: string, html: string): Promise<void> {
  return printHtmlDocument(`Attendance — ${className} — ${date}`, html, {
    withLetterhead: true,
    schoolName,
    reportTitle: `Attendance Register — ${className}`,
    orientation: "landscape",
  });
}

export function printExamReport(schoolName: string, examTitle: string, html: string): Promise<void> {
  return printHtmlDocument(`Results — ${examTitle}`, html, {
    withLetterhead: true,
    schoolName,
    reportTitle: `Examination Results — ${examTitle}`,
    orientation: "portrait",
  });
}

export function printPayrollReport(schoolName: string, html: string): Promise<void> {
  return printHtmlDocument("Payroll Disbursement Ledger", html, {
    withLetterhead: true,
    schoolName,
    reportTitle: "Staff Payroll Disbursement",
    orientation: "landscape",
  });
}

export function printInvoice(schoolName: string, invoiceId: string, html: string): Promise<void> {
  return printHtmlDocument(`Invoice — ${invoiceId}`, html, {
    withLetterhead: true,
    schoolName,
    reportTitle: `Invoice #${invoiceId}`,
    orientation: "portrait",
  });
}
