import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  PieChart as PieIcon,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import {
  ClarificationQuestion,
  CostSheetFinding,
  CrossDocConflict,
  ExtractedRequirement,
  SubmissionChecklistItem,
  TenderDocument,
  TenderWorkspace,
} from '../types';

interface DashboardViewProps {
  workspace: TenderWorkspace;
  documents: TenderDocument[];
  requirements: ExtractedRequirement[];
  costFindings: CostSheetFinding[];
  conflicts: CrossDocConflict[];
  clarifications: ClarificationQuestion[];
  checklist: SubmissionChecklistItem[];
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workspace,
  documents,
  requirements,
  costFindings,
  conflicts,
  clarifications,
  checklist,
  onNavigateTab,
}) => {
  // Calculated metrics
  const criticalRequirements = requirements.filter((r) => r.riskLevel === 'Critical');
  const highRiskRequirements = requirements.filter((r) => r.riskLevel === 'High');
  const criticalFindings = costFindings.filter((c) => c.severity === 'Critical');
  const unresolvedClarifications = clarifications.filter(
    (q) => q.status === 'Draft' || q.status === 'Ready for Submission'
  );
  const mandatoryClarifications = clarifications.filter((q) => q.isMandatoryBeforeSubmission);

  const completedChecklist = checklist.filter((c) => c.status === 'Complete');
  const checklistPercentage = checklist.length > 0 ? Math.round((completedChecklist.length / checklist.length) * 100) : 0;

  // Deadline countdown calculation
  const deadlineDate = new Date(workspace.bidDeadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Category breakdown for requirements
  const categoryCounts = requirements.reduce((acc, req) => {
    acc[req.requirementCategory] = (acc[req.requirementCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Cost sheet error breakdown
  const costCategoryCounts = costFindings.reduce((acc, finding) => {
    acc[finding.checkCategory] = (acc[finding.checkCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Tender Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {workspace.industry}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {workspace.geography}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Status: {workspace.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{workspace.name}</h1>
            <p className="text-sm text-slate-400 max-w-3xl">{workspace.notes}</p>
          </div>

          <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between border-t lg:border-t-0 border-slate-800 pt-4 lg:pt-0 gap-4 shrink-0">
            <div className="text-left lg:text-right">
              <span className="text-xs text-slate-400 block">Tender Submission Deadline</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {deadlineDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    diffDays <= 7
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {diffDays > 0 ? `${diffDays} days remaining` : 'Deadline Passed'}
                </span>
              </div>
            </div>

            <div className="text-left lg:text-right">
              <span className="text-xs text-slate-400 block">Internal Bid Lead</span>
              <span className="text-sm font-semibold text-slate-200">{workspace.internalOwner}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div
          onClick={() => onNavigateTab('documents')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all hover:bg-slate-850 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tender Documents</span>
            <FileText className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{documents.length}</span>
            <span className="text-xs text-emerald-400 font-medium">100% Extracted</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">PDF, DOCX, XLSX connected</p>
        </div>

        {/* Requirements Total & Risk */}
        <div
          onClick={() => onNavigateTab('requirements')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all hover:bg-slate-850 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Extracted Requirements</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{requirements.length}</span>
            <span className="text-xs text-rose-400 font-medium font-mono">
              {criticalRequirements.length} Critical
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 17 operational categories</p>
        </div>

        {/* Cost Sheet Discrepancies */}
        <div
          onClick={() => onNavigateTab('cost-audit')}
          className="bg-slate-900 border border-slate-800 hover:border-rose-900/50 rounded-xl p-4 transition-all hover:bg-slate-850 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cost Sheet Findings</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-300 font-mono">{costFindings.length}</span>
            <span className="text-xs text-rose-400 font-medium font-mono">
              {criticalFindings.length} Fatal Errors
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Formula errors, range omissions, tax math</p>
        </div>

        {/* Cross-Doc Inconsistencies */}
        <div
          onClick={() => onNavigateTab('conflicts')}
          className="bg-slate-900 border border-slate-800 hover:border-rose-900/50 rounded-xl p-4 transition-all hover:bg-slate-850 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cross-Doc Conflicts</span>
            <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">{conflicts.length}</span>
            <span className="text-xs text-amber-400 font-medium">Headcount, Term, Dates</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">SoW vs Cost Sheet & MSA mismatches</p>
        </div>
      </div>

      {/* Critical Action Banner If Fatal Conflicts Exist */}
      {criticalFindings.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-900/50 text-rose-400 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-200">
                {criticalFindings.length} Critical Commercial Audit Discrepancy Found in Cost Sheet
              </h4>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Missing Control Room supervisor unit rate, #REF! formula error in Depot Patrol, and 5 FTE shortfall vs SoW
                Clause 3.1.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('cost-audit')}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <span>Review Findings Table</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Analysis Section: Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Requirements Breakdown & Cost Audit Insights (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requirements by Category */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-indigo-400" />
                  Requirements by Functional Category
                </h3>
                <p className="text-xs text-slate-400">Classified across 17 standard tender registers</p>
              </div>
              <button
                onClick={() => onNavigateTab('requirements')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View Register</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {sortedCategories.slice(0, 6).map(([category, count]) => {
                const percentage = Math.round((count / requirements.length) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{category}</span>
                      <span className="text-slate-400 font-mono">
                        {count} reqs ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost Sheet Audit Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  Excel Cost-Sheet Audit Highlights
                </h3>
                <p className="text-xs text-slate-400">Sheet-by-sheet inspection & arithmetic verification</p>
              </div>
              <button
                onClick={() => onNavigateTab('cost-audit')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Detailed Audit</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Formula Errors</span>
                <span className="text-lg font-bold text-rose-400 font-mono">
                  {costCategoryCounts['Formula Error'] || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">#REF! in F19</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Missing Rates</span>
                <span className="text-lg font-bold text-rose-400 font-mono">
                  {costCategoryCounts['Missing Mandatory Rate'] || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">Supervisor D14</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Tax Discrepancies</span>
                <span className="text-lg font-bold text-amber-400 font-mono">
                  {costCategoryCounts['Tax Discrepancy'] || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">VAT understated £100k</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 block">Range Omissions</span>
                <span className="text-lg font-bold text-amber-400 font-mono">
                  {costCategoryCounts['Broken Range / Row Omission'] || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">SUM stops at row 20</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Submission Readiness & High Priority Clarifications (1 col) */}
        <div className="space-y-6">
          {/* Submission Readiness Checklist Gauge */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Submission Readiness
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-400">{checklistPercentage}%</span>
            </div>

            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${checklistPercentage}%` }}
              ></div>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              {completedChecklist.length} of {checklist.length} mandatory submission milestones completed.
            </p>

            <div className="space-y-2 border-t border-slate-800 pt-3">
              {checklist.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-start justify-between text-xs gap-2">
                  <div className="truncate">
                    <span className="text-slate-200 block truncate font-medium">{item.title}</span>
                    <span className="text-[10px] text-slate-500">{item.owner}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      item.status === 'Complete'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : item.status === 'In Progress'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : item.status === 'Needs Clarification'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('checklist')}
              className="w-full mt-4 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Manage Full Checklist</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clarification Questions Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Pre-Bid Clarifications
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {mandatoryClarifications.length} Mandatory
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {unresolvedClarifications.length} questions awaiting client portal dispatch.
            </p>

            <div className="space-y-2.5">
              {clarifications.slice(0, 3).map((cq) => (
                <div key={cq.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-indigo-400 font-semibold">{cq.id}</span>
                    <span className="text-[10px] font-semibold text-rose-400">Mandatory</span>
                  </div>
                  <p className="text-slate-300 line-clamp-2">{cq.questionText}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('clarifications')}
              className="w-full mt-4 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View & Dispatch Questions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
