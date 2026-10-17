/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EduSphere AI — Universal Print Preview Modal
 * Allows operators, principals, accountants, and teachers to inspect
 * formatted A4 print documents before sending them to physical printers
 * or PDF drivers. Works reliably across Web and Tauri/WebView2.
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Printer, X, ZoomIn, ZoomOut, RotateCcw, 
  Download, FileText, CheckCircle2 
} from "lucide-react";
import { printHtmlDocument, PrintOrientation } from "../lib/printService.js";

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  htmlContent: string;
  defaultOrientation?: PrintOrientation;
  schoolName?: string;
  documentCategory?: string;
}

export default function PrintPreviewModal({
  isOpen,
  onClose,
  title,
  htmlContent,
  defaultOrientation = "portrait",
  schoolName = "EduSphere AI",
  documentCategory = "Official Document"
}: PrintPreviewModalProps) {
  const [scale, setScale] = useState<number>(0.95);
  const [orientation, setOrientation] = useState<PrintOrientation>(defaultOrientation);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setOrientation(defaultOrientation);
    setScale(0.95);
  }, [isOpen, defaultOrientation]);

  // Construct iframe preview content with A4 page preview styles
  useEffect(() => {
    if (!isOpen || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (!doc) return;

    const widthMm = orientation === "landscape" ? "297mm" : "210mm";
    const minHeightMm = orientation === "landscape" ? "210mm" : "297mm";

    const previewDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 20px;
      background: #f1f5f9;
      display: flex;
      justify-content: center;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }
    .sheet {
      background: #ffffff;
      width: ${widthMm};
      min-height: ${minHeightMm};
      padding: 16mm 14mm 16mm 14mm;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      color: #0f172a;
      font-size: 11px;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    th {
      background: #4f46e5;
      color: #ffffff;
      padding: 6px 8px;
      font-weight: 700;
      text-align: left;
      font-size: 10px;
      border: 1px solid #4338ca;
    }
    td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      font-size: 10px;
    }
    tr:nth-child(even) td { background: #f8fafc; }
    .no-print { display: none !important; }
  </style>
</head>
<body>
  <div class="sheet">
    ${htmlContent}
  </div>
</body>
</html>`;

    doc.open();
    doc.write(previewDoc);
    doc.close();
  }, [isOpen, htmlContent, orientation]);

  if (!isOpen) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printHtmlDocument(title, htmlContent, {
        orientation,
        schoolName,
        reportTitle: title
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setScale(0.95);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {title || "Document Print Preview"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {documentCategory} • A4 {orientation === "landscape" ? "Landscape (297×210mm)" : "Portrait (210×297mm)"}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* Orientation Toggle */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-lg p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setOrientation("portrait")}
                className={`px-3 py-1 rounded-md transition-all ${
                  orientation === "portrait"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Portrait
              </button>
              <button
                type="button"
                onClick={() => setOrientation("landscape")}
                className={`px-3 py-1 rounded-md transition-all ${
                  orientation === "landscape"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Landscape
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 px-1 py-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300 select-none">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                title="Reset Zoom"
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 ml-0.5 border-l border-slate-200 dark:border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Primary Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              {isPrinting ? "Opening..." : "Print Document"}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Iframe viewport */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-auto p-4 flex justify-center items-start">
          <div 
            style={{ 
              transform: `scale(${scale})`, 
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out" 
            }}
            className="w-full h-full flex justify-center"
          >
            <iframe
              ref={iframeRef}
              title="Print Preview Surface"
              className="w-[220mm] h-[305mm] border-0 rounded shadow-md bg-white"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Isolated preview surface. Host application state is preserved.</span>
          </div>
          <div>
            <span>Press Esc or Close when done</span>
          </div>
        </div>

      </div>
    </div>
  );
}
