import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Plus,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { CrossDocConflict, RiskLevel } from '../types';

interface CrossConflictsViewProps {
  conflicts: CrossDocConflict[];
  onUpdateConflict: (updated: CrossDocConflict) => void;
  onDispatchToClarifications: (conflict: CrossDocConflict) => void;
}

export const CrossConflictsView: React.FC<CrossConflictsViewProps> = ({
  conflicts,
  onUpdateConflict,
  onDispatchToClarifications,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const filteredConflicts = conflicts.filter((c) => {
    if (selectedSeverity !== 'ALL' && c.severity !== selectedSeverity) return false;
    return true;
  });

  const getSeverityBadge = (sev: RiskLevel) => {
    switch (sev) {
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
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Cross-Document Conflict & Inconsistency Intelligence ({conflicts.length})
            </h2>
            <p className="text-xs text-slate-400">
              Correlating clauses across Scope of Work, Master Service Agreement, SLA Schedules, and Commercial Spreadsheets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
              <option value="Medium">Medium Only</option>
            </select>
          </div>
        </div>

        {/* Guidance Alert */}
        <div className="p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-900/60 text-xs text-indigo-300 flex items-start gap-2.5">
          <Scale className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
          <p className="leading-relaxed">
            <strong className="text-white">Order of Precedence Principle:</strong> Provisions are not marked contradictory merely because they differ. Legal hierarchy, precedence clauses, and context are factored into each finding. Human confirmation is required before raising formal queries.
          </p>
        </div>
      </div>

      {/* Conflict Cards */}
      <div className="space-y-4">
        {filteredConflicts.map((conflict) => (
          <div
            key={conflict.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg hover:border-slate-700 transition-all"
          >
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-rose-400">{conflict.id}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(
                    conflict.severity
                  )}`}
                >
                  {conflict.severity}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  Confidence: {conflict.confidence}
                </span>
                <h3 className="text-sm font-bold text-white tracking-tight">{conflict.issueTitle}</h3>
              </div>

              {/* Status Picker */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Review:</span>
                <select
                  value={conflict.humanReviewStatus}
                  onChange={(e) =>
                    onUpdateConflict({
                      ...conflict,
                      humanReviewStatus: e.target.value as any,
                    })
                  }
                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="Pending Review">Pending Review</option>
                  <option value="Confirmed Conflict">Confirmed Conflict</option>
                  <option value="Clarification Raised">Clarification Raised</option>
                  <option value="Resolved / Waived">Resolved / Waived</option>
                </select>
              </div>
            </div>

            {/* Side by Side Sources Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source A */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    SOURCE A: {conflict.sourceA.docType}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{conflict.sourceA.exactReference}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate" title={conflict.sourceA.fileName}>
                  {conflict.sourceA.fileName}
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 font-serif leading-relaxed">
                  "{conflict.sourceA.extractedTextOrValue}"
                </div>
              </div>

              {/* Source B */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    SOURCE B: {conflict.sourceB.docType}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{conflict.sourceB.exactReference}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate" title={conflict.sourceB.fileName}>
                  {conflict.sourceB.fileName}
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 font-serif leading-relaxed">
                  "{conflict.sourceB.extractedTextOrValue}"
                </div>
              </div>
            </div>

            {/* Conflict Impact & Precedence */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-200 leading-relaxed">
                <strong className="text-rose-300 font-semibold">Commercial / Operational Impact: </strong>
                {conflict.conflictReason}
              </div>

              {conflict.precedenceApplied && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-[11px]">
                  <strong className="text-slate-300">Hierarchy & Precedence: </strong>
                  {conflict.precedenceApplied}
                </div>
              )}
            </div>

            {/* Suggested Clarification & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-300 flex-1">
                <span className="text-amber-400 font-semibold block text-[11px]">Suggested Clarification Query:</span>
                <span className="italic text-slate-300">"{conflict.suggestedClarificationQuestion}"</span>
              </div>

              <button
                onClick={() => onDispatchToClarifications(conflict)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Add to Clarification Register</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
