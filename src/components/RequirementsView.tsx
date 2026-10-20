import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  Filter,
  HelpCircle,
  Search,
  ShieldAlert,
  Tag,
} from 'lucide-react';
import { exportToCsv } from '../lib/exportEngine';
import {
  ExtractedRequirement,
  RequirementCategory,
  RequirementClassification,
  RequirementStatus,
  RiskLevel,
} from '../types';

interface RequirementsViewProps {
  requirements: ExtractedRequirement[];
  onUpdateRequirement: (updated: ExtractedRequirement) => void;
  onConvertToClarification?: (req: ExtractedRequirement) => void;
}

const ALL_CATEGORIES: RequirementCategory[] = [
  'Scope and Services',
  'Operations and Service Delivery',
  'Manpower and Deployment',
  'Service Levels and KPIs',
  'Compliance and Certifications',
  'Health, Safety and Training',
  'Commercial and Billing',
  'Pricing and Costing',
  'Legal and Contractual',
  'Insurance and Liability',
  'Penalties and Service Credits',
  'Data Protection and Confidentiality',
  'Mobilisation and Transition',
  'Technology and Equipment',
  'Timelines and Submission',
  'Reporting and Governance',
  'Other Requirements',
];

export const RequirementsView: React.FC<RequirementsViewProps> = ({
  requirements,
  onUpdateRequirement,
  onConvertToClarification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeModalReq, setActiveModalReq] = useState<ExtractedRequirement | null>(null);

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      if (selectedCategory !== 'ALL' && req.requirementCategory !== selectedCategory) return false;
      if (selectedRisk !== 'ALL' && req.riskLevel !== selectedRisk) return false;
      if (selectedStatus !== 'ALL' && req.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText =
          req.id.toLowerCase().includes(q) ||
          req.originalText.toLowerCase().includes(q) ||
          req.aiInterpretation.toLowerCase().includes(q) ||
          req.sourceFileName.toLowerCase().includes(q) ||
          req.requirementCategory.toLowerCase().includes(q) ||
          req.responsibleOwner.toLowerCase().includes(q);
        if (!matchText) return false;
      }
      return true;
    });
  }, [requirements, selectedCategory, selectedRisk, selectedStatus, searchQuery]);

  const handleExportCsv = () => {
    const headers = [
      'Req ID',
      'Category',
      'Risk Level',
      'Classification',
      'Source File',
      'Page / Cell Ref',
      'Original Text',
      'AI Interpretation',
      'Clarification Required',
      'Suggested Clarification Question',
      'Responsible Owner',
      'Status',
      'Reviewer Comments',
      'Evidence Citation',
    ];
    const rows = filteredRequirements.map((r) => [
      r.id,
      r.requirementCategory,
      r.riskLevel,
      r.classification,
      r.sourceFileName,
      `${r.pageNumber} (${r.tableRowCellRef})`,
      r.originalText,
      r.aiInterpretation,
      r.clarificationRequired ? 'YES' : 'NO',
      r.suggestedClarificationQuestion || '',
      r.responsibleOwner,
      r.status,
      r.reviewerComments,
      r.evidenceCitation,
    ]);
    exportToCsv('Master_Requirements_Register', headers, rows);
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'Critical':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'High':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Medium':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'Low':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              Master Requirements Register ({filteredRequirements.length} of {requirements.length})
            </h2>
            <p className="text-xs text-slate-400">
              Source-referenced audit register preserving document, page, table, and cell coordinates.
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
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search clauses, citations, owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All 17 Requirement Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="Critical">Critical Risk</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Review Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Risk Flagged">Risk Flagged</option>
              <option value="Addressed">Addressed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Req ID</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Risk</th>
                <th className="py-3 px-3">Original Mandate & AI Interpretation</th>
                <th className="py-3 px-3">Source Citation</th>
                <th className="py-3 px-3">Clarification</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredRequirements.map((req) => (
                <tr key={req.id} className="hover:bg-slate-850/50 transition-colors">
                  {/* ID */}
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400 whitespace-nowrap">
                    {req.id}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/80">
                      {req.requirementCategory}
                    </span>
                  </td>

                  {/* Risk Badge */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(
                        req.riskLevel
                      )}`}
                    >
                      {req.riskLevel}
                    </span>
                  </td>

                  {/* Mandate & Interpretation */}
                  <td className="py-3 px-3 max-w-md">
                    <p className="text-slate-200 line-clamp-2 font-medium">{req.originalText}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 italic">
                      AI Note: {req.aiInterpretation}
                    </p>
                  </td>

                  {/* Source Citation */}
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    <div className="font-semibold text-slate-300">{req.pageNumber}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={req.sourceFileName}>
                      {req.sourceFileName}
                    </div>
                  </td>

                  {/* Clarification Flag */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {req.clarificationRequired ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800 text-[10px] font-semibold">
                        <HelpCircle className="w-3 h-3" />
                        Query Needed
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[11px]">-</span>
                    )}
                  </td>

                  {/* Owner */}
                  <td className="py-3 px-3 text-slate-300 font-medium whitespace-nowrap">
                    {req.responsibleOwner}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-3">
                    <select
                      value={req.status}
                      onChange={(e) =>
                        onUpdateRequirement({ ...req, status: e.target.value as RequirementStatus })
                      }
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 font-medium focus:outline-none"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Risk Flagged">Risk Flagged</option>
                      <option value="Addressed">Addressed</option>
                    </select>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setActiveModalReq(req)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Inspect full citation and text"
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

      {/* Requirement Detail Inspection Modal */}
      {activeModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-indigo-400">{activeModalReq.id}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(
                    activeModalReq.riskLevel
                  )}`}
                >
                  {activeModalReq.riskLevel} Risk
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                  {activeModalReq.classification}
                </span>
              </div>
              <button
                onClick={() => setActiveModalReq(null)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Functional Category</span>
                <span className="text-slate-200 font-medium">{activeModalReq.requirementCategory}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Original Extracted Text</span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-serif leading-relaxed">
                  "{activeModalReq.originalText}"
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">AI Commercial & Legal Interpretation</span>
                <p className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-indigo-200 leading-relaxed">
                  {activeModalReq.aiInterpretation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Exact Citation</span>
                  <span className="font-mono text-slate-300">{activeModalReq.evidenceCitation}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Responsible Owner</span>
                  <span className="text-slate-300">{activeModalReq.responsibleOwner}</span>
                </div>
              </div>

              {activeModalReq.suggestedClarificationQuestion && (
                <div>
                  <span className="text-amber-400 font-semibold block mb-1">
                    Suggested Clarification Question
                  </span>
                  <p className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/80 text-amber-200 text-xs">
                    {activeModalReq.suggestedClarificationQuestion}
                  </p>
                </div>
              )}

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Reviewer Comments</span>
                <textarea
                  rows={2}
                  value={activeModalReq.reviewerComments}
                  onChange={(e) => {
                    const updated = { ...activeModalReq, reviewerComments: e.target.value };
                    setActiveModalReq(updated);
                    onUpdateRequirement(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Add internal notes or risk mitigation actions..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
