import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Filter,
  Search,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react';
import { exportToCsv } from '../lib/exportEngine';
import {
  AuditSeverity,
  CostAuditCheckCategory,
  CostSheetFinding,
  ReviewerAuditStatus,
} from '../types';

interface CostAuditViewProps {
  findings: CostSheetFinding[];
  onUpdateFinding: (updated: CostSheetFinding) => void;
  onExportExcel: () => void;
}

export const CostAuditView: React.FC<CostAuditViewProps> = ({
  findings,
  onUpdateFinding,
  onExportExcel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeFindingModal, setActiveFindingModal] = useState<CostSheetFinding | null>(null);

  const categories: CostAuditCheckCategory[] = [
    'Formula Error',
    'Missing Mandatory Rate',
    'Missing Quantity',
    'Missing Manpower Count',
    'Tax Discrepancy',
    'Broken Range / Row Omission',
    'Hardcoded Over Formula',
    'Arithmetic Mismatch',
    'Cross-Sheet Reconciliation',
    'Needs Review',
  ];

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (selectedSeverity !== 'ALL' && f.severity !== selectedSeverity) return false;
      if (selectedCategory !== 'ALL' && f.checkCategory !== selectedCategory) return false;
      if (selectedStatus !== 'ALL' && f.reviewerStatus !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          f.cellOrRange.toLowerCase().includes(q) ||
          f.worksheet.toLowerCase().includes(q) ||
          f.explanation.toLowerCase().includes(q) ||
          f.observedValueOrFormula.toLowerCase().includes(q) ||
          f.checkCategory.toLowerCase().includes(q) ||
          (f.assignedOwner && f.assignedOwner.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [findings, selectedSeverity, selectedCategory, selectedStatus, searchQuery]);

  const handleExportCsv = () => {
    const headers = [
      'Finding ID',
      'Severity',
      'Check Category',
      'File Name',
      'Worksheet',
      'Cell / Range',
      'Observed Value / Formula',
      'Expected Rule / Calculation',
      'Difference',
      'Explanation',
      'Recommended Action',
      'Reviewer Status',
      'Assigned Owner',
      'Evidence Reference',
    ];
    const rows = filteredFindings.map((f) => [
      f.id,
      f.severity,
      f.checkCategory,
      f.fileName,
      f.worksheet,
      f.cellOrRange,
      f.observedValueOrFormula,
      f.expectedCalculationOrRule,
      f.difference !== undefined ? String(f.difference) : '',
      f.explanation,
      f.recommendedAction,
      f.reviewerStatus,
      f.assignedOwner || '',
      f.evidenceReference,
    ]);
    exportToCsv('Cost_Sheet_Audit_Register', headers, rows);
  };

  const getSeverityBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'High':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Medium':
        return 'bg-yellow-950 text-yellow-300 border-yellow-800';
      case 'Low':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'Informational':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Detailed Excel Cost-Sheet Intelligence & Formula Audit
            </h2>
            <p className="text-xs text-slate-400">
              Preserving worksheet names, cell addresses, formula syntax, arithmetic reconciliation, and GST verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onExportExcel}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full Audit (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search cell (e.g. D14), worksheet, formula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Audit Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Informational">Informational</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Reviewer Statuses</option>
              <option value="Unreviewed">Unreviewed</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Fix Required">Fix Required</option>
              <option value="Resolved">Resolved</option>
              <option value="False Positive">False Positive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cost Sheet Findings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            Cost Sheet Audit Register ({filteredFindings.length} findings)
          </h3>
          <span className="text-xs text-slate-400">
            Never overwrites original workbook • Identifies hidden sheets & exact cell ranges
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Worksheet & Cell</th>
                <th className="py-3 px-3">Audit Category</th>
                <th className="py-3 px-3">Observed vs Expected Rule</th>
                <th className="py-3 px-3">Variance</th>
                <th className="py-3 px-3">Explanation & Action</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredFindings.map((finding) => (
                <tr key={finding.id} className="hover:bg-slate-850/50 transition-colors">
                  {/* Severity */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(
                        finding.severity
                      )}`}
                    >
                      {finding.severity}
                    </span>
                  </td>

                  {/* Worksheet & Cell */}
                  <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                    <span className="text-slate-200 font-semibold">{finding.worksheet}</span>
                    <span className="text-indigo-400 block font-bold">!{finding.cellOrRange}</span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                      {finding.checkCategory}
                    </span>
                  </td>

                  {/* Observed vs Expected */}
                  <td className="py-3 px-3 max-w-xs font-mono text-[11px]">
                    <div className="text-rose-300 font-semibold truncate" title={finding.observedValueOrFormula}>
                      Obs: {finding.observedValueOrFormula}
                    </div>
                    <div
                      className="text-emerald-400 text-[10px] truncate"
                      title={finding.expectedCalculationOrRule}
                    >
                      Exp: {finding.expectedCalculationOrRule}
                    </div>
                  </td>

                  {/* Difference */}
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                    {finding.difference !== undefined ? (
                      <span className="text-amber-400 font-semibold">
                        {typeof finding.difference === 'number'
                          ? finding.difference.toLocaleString()
                          : finding.difference}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>

                  {/* Explanation & Action */}
                  <td className="py-3 px-3 max-w-sm">
                    <p className="text-slate-300 line-clamp-2 leading-relaxed">{finding.explanation}</p>
                    <p className="text-[10px] text-indigo-300 line-clamp-1 mt-0.5">
                      Rec: {finding.recommendedAction}
                    </p>
                  </td>

                  {/* Owner */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                    {finding.assignedOwner || 'Unassigned'}
                  </td>

                  {/* Reviewer Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <select
                      value={finding.reviewerStatus}
                      onChange={(e) =>
                        onUpdateFinding({
                          ...finding,
                          reviewerStatus: e.target.value as ReviewerAuditStatus,
                        })
                      }
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 font-medium focus:outline-none"
                    >
                      <option value="Unreviewed">Unreviewed</option>
                      <option value="Acknowledged">Acknowledged</option>
                      <option value="Fix Required">Fix Required</option>
                      <option value="Resolved">Resolved</option>
                      <option value="False Positive">False Positive</option>
                    </select>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setActiveFindingModal(finding)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Inspect detailed formula rule and cell evidence"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cell Audit Inspection Modal */}
      {activeFindingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {activeFindingModal.worksheet}!{activeFindingModal.cellOrRange}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(
                    activeFindingModal.severity
                  )}`}
                >
                  {activeFindingModal.severity} Severity
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                  {activeFindingModal.checkCategory}
                </span>
              </div>
              <button
                onClick={() => setActiveFindingModal(null)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/50">
                  <span className="text-rose-400 font-semibold block text-[11px] mb-1">
                    Observed Formula or Value
                  </span>
                  <div className="font-mono text-slate-200 text-sm">
                    {activeFindingModal.observedValueOrFormula}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/50">
                  <span className="text-emerald-400 font-semibold block text-[11px] mb-1">
                    Expected Rule or Calculation
                  </span>
                  <div className="font-mono text-slate-200 text-sm">
                    {activeFindingModal.expectedCalculationOrRule}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Detailed Audit Explanation</span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed">
                  {activeFindingModal.explanation}
                </div>
              </div>

              <div>
                <span className="text-indigo-400 font-semibold block mb-1">Recommended Commercial Action</span>
                <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-indigo-200 leading-relaxed">
                  {activeFindingModal.recommendedAction}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Evidence Reference</span>
                  <span className="font-mono text-slate-300">{activeFindingModal.evidenceReference}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Assigned Owner</span>
                  <input
                    type="text"
                    value={activeFindingModal.assignedOwner || ''}
                    onChange={(e) => {
                      const updated = { ...activeFindingModal, assignedOwner: e.target.value };
                      setActiveFindingModal(updated);
                      onUpdateFinding(updated);
                    }}
                    placeholder="Assign commercial lead..."
                    className="w-full bg-transparent text-slate-200 font-medium focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
