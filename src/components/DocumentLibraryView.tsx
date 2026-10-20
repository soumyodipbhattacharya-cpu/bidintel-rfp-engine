import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  FileUp,
  FolderOpen,
  Info,
  Layers,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { auditExcelWorkbook } from '../lib/costSheetAuditor';
import { DocumentCategory, TenderDocument, TenderWorkspace } from '../types';

interface DocumentLibraryViewProps {
  documents: TenderDocument[];
  workspace: TenderWorkspace;
  onUpdateDocuments: (docs: TenderDocument[]) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  onAddCostFinding?: (findings: any[]) => void;
}

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'RFP / Invitation',
  'Scope of Work',
  'Service Agreement',
  'SLA / KPI Schedule',
  'Commercial / Cost Sheet',
  'Manpower Schedule',
  'Compliance Form',
  'Annexure / Appendix',
  'Other / Unclassified',
];

export const DocumentLibraryView: React.FC<DocumentLibraryViewProps> = ({
  documents,
  workspace,
  onUpdateDocuments,
  onRunAnalysis,
  isAnalyzing,
  onAddCostFinding,
}) => {
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [legacyDocNotice, setLegacyDocNotice] = useState<string | null>(null);
  const [selectedDocForInspection, setSelectedDocForInspection] = useState<TenderDocument | null>(null);

  // Automatic category detection heuristic
  const detectCategoryFromName = (fileName: string): DocumentCategory => {
    const lower = fileName.toLowerCase();
    if (lower.includes('rfp') || lower.includes('invitation') || lower.includes('tender_doc') || lower.includes('itt')) {
      return 'RFP / Invitation';
    }
    if (lower.includes('sow') || lower.includes('statement_of_work') || lower.includes('scope')) {
      return 'Scope of Work';
    }
    if (lower.includes('msa') || lower.includes('agreement') || lower.includes('contract') || lower.includes('terms')) {
      return 'Service Agreement';
    }
    if (lower.includes('sla') || lower.includes('kpi') || lower.includes('penalty')) {
      return 'SLA / KPI Schedule';
    }
    if (
      lower.includes('commercial') ||
      lower.includes('pricing') ||
      lower.includes('cost') ||
      lower.includes('fee') ||
      lower.endsWith('.xlsx') ||
      lower.endsWith('.xlsm')
    ) {
      return 'Commercial / Cost Sheet';
    }
    if (lower.includes('manpower') || lower.includes('staffing') || lower.includes('roster')) {
      return 'Manpower Schedule';
    }
    if (lower.includes('compliance') || lower.includes('declaration') || lower.includes('form') || lower.includes('iso')) {
      return 'Compliance Form';
    }
    if (lower.includes('annexure') || lower.includes('appendix') || lower.includes('schedule')) {
      return 'Annexure / Appendix';
    }
    return 'Other / Unclassified';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setDuplicateWarning(null);
    setLegacyDocNotice(null);

    const newDocs: TenderDocument[] = [];
    const duplicates: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name;
      const lower = fileName.toLowerCase();

      // Check for legacy .doc
      if (lower.endsWith('.doc')) {
        setLegacyDocNotice(
          `File "${fileName}" uses legacy binary format (.doc). Please save as .docx or PDF for deep structural table extraction.`
        );
      }

      // Check duplicates
      const isDuplicate = documents.some((d) => d.fileName.toLowerCase() === fileName.toLowerCase());
      if (isDuplicate) {
        duplicates.push(fileName);
        continue;
      }

      let fileType: any = 'pdf';
      if (lower.endsWith('.xlsx')) fileType = 'xlsx';
      else if (lower.endsWith('.xlsm')) fileType = 'xlsm';
      else if (lower.endsWith('.docx')) fileType = 'docx';
      else if (lower.endsWith('.csv')) fileType = 'csv';
      else if (lower.endsWith('.doc')) fileType = 'doc';

      const detected = detectCategoryFromName(fileName);

      let sheets: any[] = [];
      let warnings: string[] = [];

      // If it's an Excel spreadsheet, parse sheets and run immediate inspection
      if (fileType === 'xlsx' || fileType === 'xlsm' || fileType === 'csv') {
        try {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, cellFormula: true, cellStyles: true });
          const audit = auditExcelWorkbook(workbook, fileName, workspace.id);
          sheets = audit.sheets;
          if (audit.summary.hiddenSheetsCount > 0) {
            warnings.push(`Contains ${audit.summary.hiddenSheetsCount} hidden worksheet(s)`);
          }
          if (audit.summary.formulaErrorsCount > 0) {
            warnings.push(`Detected ${audit.summary.formulaErrorsCount} formula error(s)`);
          }
          if (onAddCostFinding && audit.findings.length > 0) {
            onAddCostFinding(audit.findings);
          }
        } catch (err: any) {
          warnings.push(`Workbook parse error: ${err.message}`);
        }
      }

      newDocs.push({
        id: `doc-${Date.now()}-${i}`,
        workspaceId: workspace.id,
        fileName,
        fileType,
        fileSize: file.size,
        status: 'processed',
        detectedCategory: detected,
        userCategory: detected,
        uploadTimestamp: new Date().toISOString(),
        extractedSnippet: `Uploaded document ${fileName} (${(file.size / 1024).toFixed(1)} KB). Ready for connected tender audit.`,
        sheets: sheets.length > 0 ? sheets : undefined,
        warnings,
      });
    }

    if (duplicates.length > 0) {
      setDuplicateWarning(
        `Duplicate file detected: "${duplicates.join(', ')}". Duplicates were skipped to prevent double-counting requirements.`
      );
    }

    if (newDocs.length > 0) {
      onUpdateDocuments([...documents, ...newDocs]);
    }

    // Reset input
    event.target.value = '';
  };

  const handleCategoryChange = (docId: string, newCategory: DocumentCategory) => {
    const updated = documents.map((doc) => (doc.id === docId ? { ...doc, userCategory: newCategory } : doc));
    onUpdateDocuments(updated);
  };

  const handleDeleteDoc = (docId: string) => {
    onUpdateDocuments(documents.filter((doc) => doc.id !== docId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone & Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
              Tender Document Library & Ingestion
            </h2>
            <p className="text-xs text-slate-400">
              Upload multiple tender files or single combined packages. Automatic category tagging & cell-level indexing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRunAnalysis}
              disabled={isAnalyzing || documents.length === 0}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isAnalyzing
                  ? 'bg-indigo-900/50 text-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Package...' : 'Re-run Package Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Upload Container */}
        <label className="block border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center bg-slate-950/40 hover:bg-slate-950/70 transition-all cursor-pointer group">
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.xlsx,.xlsm,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-indigo-600/20 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-colors">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Click to browse or drop RFP files here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PDF, DOCX, Excel (.xlsx, .xlsm), CSV. Multiple files or combined document.
              </p>
            </div>
            <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Safe & Client-Side Ingestion • Preserves Source Page & Cell Coordinates
            </span>
          </div>
        </label>

        {/* Warnings / Notices */}
        {duplicateWarning && (
          <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-800/80 text-xs text-amber-300 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{duplicateWarning}</span>
          </div>
        )}

        {legacyDocNotice && (
          <div className="mt-4 p-3 rounded-lg bg-blue-950/40 border border-blue-800/80 text-xs text-blue-300 flex items-center gap-2.5">
            <Info className="w-4 h-4 shrink-0 text-blue-400" />
            <span>{legacyDocNotice}</span>
          </div>
        )}
      </div>

      {/* Documents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Connected Tender Package Files ({documents.length})
          </h3>
          <span className="text-xs text-slate-400">
            Click on category tag to override classification manually
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No documents in this workspace yet. Upload files above or load the synthetic benchmark package.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Document File</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Detected Category</th>
                  <th className="py-3 px-4">Worksheet / Page Structure</th>
                  <th className="py-3 px-4">Status & Warnings</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-850/50 transition-colors">
                    {/* File Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {doc.fileType === 'xlsx' || doc.fileType === 'xlsm' ? (
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                        <span className="font-medium text-slate-200">{doc.fileName}</span>
                      </div>
                    </td>

                    {/* Format */}
                    <td className="py-3 px-4 uppercase font-mono text-[11px] text-slate-400">
                      {doc.fileType}
                    </td>

                    {/* Size */}
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {formatFileSize(doc.fileSize)}
                    </td>

                    {/* Category Selector */}
                    <td className="py-3 px-4">
                      <select
                        value={doc.userCategory}
                        onChange={(e) => handleCategoryChange(doc.id, e.target.value as DocumentCategory)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        {DOCUMENT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Structure Details */}
                    <td className="py-3 px-4">
                      {doc.sheets && doc.sheets.length > 0 ? (
                        <button
                          onClick={() => setSelectedDocForInspection(doc)}
                          className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[11px] font-medium hover:bg-emerald-900/60 cursor-pointer"
                        >
                          {doc.sheets.length} Sheets (Inspect)
                        </button>
                      ) : doc.pageCount ? (
                        <span className="text-slate-400">{doc.pageCount} Pages</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    {/* Status & Warnings */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ready
                        </span>
                        {doc.warnings && doc.warnings.length > 0 && (
                          <div className="flex flex-col gap-0.5">
                            {doc.warnings.map((w, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] text-amber-400 flex items-center gap-1 leading-tight"
                              >
                                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                {w}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        title="Remove file from workspace"
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Spreadsheet Structure Inspection Modal */}
      {selectedDocForInspection && selectedDocForInspection.sheets && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Worksheet Structure: {selectedDocForInspection.fileName}
                </h3>
                <p className="text-xs text-slate-400">
                  Total {selectedDocForInspection.sheets.length} worksheets detected
                </p>
              </div>
              <button
                onClick={() => setSelectedDocForInspection(null)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {selectedDocForInspection.sheets.map((sheet, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                    sheet.isHidden
                      ? 'bg-amber-950/20 border-amber-800/80'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{sheet.name}</span>
                    {sheet.isHidden && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        HIDDEN SHEET
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
                    <span>Rows: {sheet.rowCount}</span>
                    <span>Columns: {sheet.colCount}</span>
                    <span>Formulas: {sheet.hasFormulas ? 'Yes' : 'None'}</span>
                    <span>Errors: {sheet.hasErrors ? 'Detected' : 'Clean'}</span>
                  </div>
                  {sheet.sampleHeaders.length > 0 && (
                    <div className="text-[11px] text-slate-500 truncate">
                      Headers: {sheet.sampleHeaders.join(' | ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
