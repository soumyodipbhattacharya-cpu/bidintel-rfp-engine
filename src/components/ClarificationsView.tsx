import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Edit3,
  HelpCircle,
  Plus,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import { exportToCsv } from '../lib/exportEngine';
import { ClarificationCategory, ClarificationQuestion } from '../types';

interface ClarificationsViewProps {
  clarifications: ClarificationQuestion[];
  onUpdateClarification: (updated: ClarificationQuestion) => void;
  onAddClarification: (newQ: ClarificationQuestion) => void;
  onDeleteClarification: (id: string) => void;
  onExportExcel: () => void;
}

const CATEGORIES: ClarificationCategory[] = [
  'Scope',
  'Operations',
  'Compliance',
  'Commercial',
  'Legal',
  'Timeline',
  'Manpower',
  'Technology and Equipment',
];

export const ClarificationsView: React.FC<ClarificationsViewProps> = ({
  clarifications,
  onUpdateClarification,
  onAddClarification,
  onDeleteClarification,
  onExportExcel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ClarificationQuestion | null>(null);

  // New question form state
  const [newQText, setNewQText] = useState('');
  const [newQReason, setNewQReason] = useState('');
  const [newQSource, setNewQSource] = useState('');
  const [newQRef, setNewQRef] = useState('');
  const [newQCategory, setNewQCategory] = useState<ClarificationCategory>('Scope');
  const [newQPriority, setNewQPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newQMandatory, setNewQMandatory] = useState(true);
  const [newQRecipient, setNewQRecipient] = useState('Authority Procurement Lead');

  const filtered = clarifications.filter((q) => {
    if (selectedCategory !== 'ALL' && q.category !== selectedCategory) return false;
    if (selectedPriority !== 'ALL' && q.priority !== selectedPriority) return false;
    return true;
  });

  const handleExportCsv = () => {
    const headers = [
      'Question ID',
      'Category',
      'Priority',
      'Mandatory Before Submission',
      'Question Text',
      'Business Reason',
      'Source Document',
      'Exact Reference',
      'Relevant Issue / Requirement',
      'Suggested Recipient',
      'Status',
      'Reviewer Comments',
    ];
    const rows = filtered.map((q) => [
      q.id,
      q.category,
      q.priority,
      q.isMandatoryBeforeSubmission ? 'YES' : 'NO',
      q.questionText,
      q.businessReason,
      q.sourceDocument,
      q.exactReference,
      q.relevantRequirementOrConflict,
      q.suggestedRecipient,
      q.status,
      q.reviewerComments || '',
    ]);
    exportToCsv('Tender_Clarification_Questions', headers, rows);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) return;

    const newQuestion: ClarificationQuestion = {
      id: `CQ-USER-${Date.now().toString().slice(-4)}`,
      workspaceId: 'current',
      questionText: newQText,
      businessReason: newQReason || 'Clarification required to ensure accurate pricing and risk mitigation.',
      sourceDocument: newQSource || 'Tender Package',
      exactReference: newQRef || 'General Requirement',
      relevantRequirementOrConflict: 'User Defined Query',
      category: newQCategory,
      priority: newQPriority,
      isMandatoryBeforeSubmission: newQMandatory,
      suggestedRecipient: newQRecipient,
      status: 'Ready for Submission',
    };

    onAddClarification(newQuestion);
    setShowAddModal(false);
    setNewQText('');
    setNewQReason('');
    setNewQSource('');
    setNewQRef('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              Pre-Bid Clarification Questions Register ({filtered.length})
            </h2>
            <p className="text-xs text-slate-400">
              Evidence-grounded clarification queries for submission to Authority procurement portal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft New Question</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onExportExcel}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Category & Priority Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Clarification Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clarification Questions Cards */}
      <div className="space-y-4">
        {filtered.map((q) => (
          <div
            key={q.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5 shadow-lg hover:border-slate-700 transition-all"
          >
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-indigo-400">{q.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {q.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    q.priority === 'High'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {q.priority} Priority
                </span>
                {q.isMandatoryBeforeSubmission && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800/80">
                    Mandatory Before Submission
                  </span>
                )}
              </div>

              {/* Status Picker & Actions */}
              <div className="flex items-center gap-2">
                <select
                  value={q.status}
                  onChange={(e) =>
                    onUpdateClarification({
                      ...q,
                      status: e.target.value as any,
                    })
                  }
                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="Draft">Draft</option>
                  <option value="Ready for Submission">Ready for Submission</option>
                  <option value="Submitted to Client">Submitted to Client</option>
                  <option value="Answer Received">Answer Received</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  onClick={() => setEditingQuestion(q)}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                  title="Edit question text"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onDeleteClarification(q.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 text-sm font-medium text-slate-100 leading-relaxed font-serif">
              "{q.questionText}"
            </div>

            {/* Business Reason */}
            <div className="text-xs text-slate-300">
              <strong className="text-amber-400 font-semibold">Business & Commercial Reason: </strong>
              <span>{q.businessReason}</span>
            </div>

            {/* Citations & Recipient Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center gap-4">
                <span>
                  Source: <strong className="text-slate-200">{q.sourceDocument}</strong> [{q.exactReference}]
                </span>
                {q.relevantRequirementOrConflict && (
                  <span>
                    Linked Finding: <strong className="text-indigo-400">{q.relevantRequirementOrConflict}</strong>
                  </span>
                )}
              </div>
              <div>
                Target Recipient: <span className="text-slate-300 font-medium">{q.suggestedRecipient}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Draft New Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateQuestion}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Draft Clarification Question
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Question Text</label>
                <textarea
                  required
                  rows={3}
                  value={newQText}
                  onChange={(e) => setNewQText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-serif"
                  placeholder="Enter precise question with clause reference..."
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Business & Commercial Reason</label>
                <input
                  type="text"
                  required
                  value={newQReason}
                  onChange={(e) => setNewQReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Why this must be resolved before submission..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Category</label>
                  <select
                    value={newQCategory}
                    onChange={(e) => setNewQCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Priority</label>
                  <select
                    value={newQPriority}
                    onChange={(e) => setNewQPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Source Document</label>
                  <input
                    type="text"
                    value={newQSource}
                    onChange={(e) => setNewQSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    placeholder="e.g. Scope_of_Work.docx"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Exact Page / Clause Ref</label>
                  <input
                    type="text"
                    value={newQRef}
                    onChange={(e) => setNewQRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    placeholder="e.g. Clause 3.2, Page 14"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={newQMandatory}
                  onChange={(e) => setNewQMandatory(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="mandatoryCheck" className="text-slate-300 font-medium">
                  Mandatory to resolve prior to tender submission
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Add Question
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Edit Clarification Question ({editingQuestion.id})</h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Question Text</label>
                <textarea
                  rows={3}
                  value={editingQuestion.questionText}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, questionText: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none font-serif"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Business Reason</label>
                <input
                  type="text"
                  value={editingQuestion.businessReason}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, businessReason: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Reviewer Notes</label>
                <textarea
                  rows={2}
                  value={editingQuestion.reviewerComments || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, reviewerComments: e.target.value })
                  }
                  placeholder="Internal team notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateClarification(editingQuestion);
                  setEditingQuestion(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
