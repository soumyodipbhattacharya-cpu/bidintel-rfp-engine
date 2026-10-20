import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  Filter,
  ListTodo,
  Plus,
  User,
} from 'lucide-react';
import { exportToCsv } from '../lib/exportEngine';
import { ChecklistCategory, ChecklistStatus, SubmissionChecklistItem } from '../types';

interface ChecklistViewProps {
  checklist: SubmissionChecklistItem[];
  onUpdateItem: (item: SubmissionChecklistItem) => void;
  onAddItem: (item: SubmissionChecklistItem) => void;
}

const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  'Technical submission',
  'Commercial submission',
  'Legal documentation',
  'Compliance documentation',
  'Mandatory declarations',
  'Required certificates',
  'Pricing templates',
  'Supporting annexures',
  'Signatures and authorisations',
  'Bid validity and submission deadlines',
];

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  checklist,
  onUpdateItem,
  onAddItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ChecklistCategory>('Technical submission');
  const [newDesc, setNewDesc] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newEvidence, setNewEvidence] = useState('');

  const filtered = checklist.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    return true;
  });

  const completedCount = checklist.filter((c) => c.status === 'Complete').length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const handleExportCsv = () => {
    const headers = [
      'Item ID',
      'Category',
      'Title',
      'Description',
      'Status',
      'Assigned Owner',
      'Due Date',
      'Evidence Reference',
      'Notes',
    ];
    const rows = filtered.map((c) => [
      c.id,
      c.category,
      c.title,
      c.description,
      c.status,
      c.owner,
      c.dueDate,
      c.evidenceReference,
      c.notes,
    ]);
    exportToCsv('Submission_Readiness_Checklist', headers, rows);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: SubmissionChecklistItem = {
      id: `chk-custom-${Date.now().toString().slice(-4)}`,
      workspaceId: 'current',
      title: newTitle,
      category: newCategory,
      description: newDesc,
      status: 'Not Started',
      owner: newOwner || 'Bid Team',
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      notes: '',
      evidenceReference: newEvidence || 'To be attached',
    };

    onAddItem(newItem);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewOwner('');
    setNewDueDate('');
    setNewEvidence('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Progress Meter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              Submission Readiness Checklist ({completedCount} of {checklist.length} Complete)
            </h2>
            <p className="text-xs text-slate-400">
              Pre-submission validation across technical, commercial, legal, and compliance schedules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Checklist Item</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span>Overall Submission Completion</span>
            <span className="font-mono font-bold text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All 10 Submission Categories</option>
              {CHECKLIST_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Complete">Complete</option>
              <option value="In Progress">In Progress</option>
              <option value="Needs Clarification">Needs Clarification</option>
              <option value="Not Started">Not Started</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Checklist Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Item & Category</th>
                <th className="py-3 px-3">Description & Scope</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Evidence / Doc Reference</th>
                <th className="py-3 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                  {/* Status Dropdown */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        onUpdateItem({ ...item, status: e.target.value as ChecklistStatus })
                      }
                      className={`border rounded px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer ${
                        item.status === 'Complete'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : item.status === 'In Progress'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : item.status === 'Needs Clarification'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-slate-950 text-slate-400 border-slate-700'
                      }`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Complete">Complete</option>
                      <option value="Needs Clarification">Needs Clarification</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </td>

                  {/* Title & Category */}
                  <td className="py-3 px-3 max-w-xs">
                    <span className="font-semibold text-slate-100 block">{item.title}</span>
                    <span className="text-[10px] text-indigo-400 font-medium">{item.category}</span>
                  </td>

                  {/* Description */}
                  <td className="py-3 px-3 max-w-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </td>

                  {/* Owner */}
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{item.owner}</span>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{item.dueDate}</span>
                    </div>
                  </td>

                  {/* Evidence Reference */}
                  <td className="py-3 px-3 max-w-xs font-mono text-[11px] text-emerald-400">
                    {item.evidenceReference}
                  </td>

                  {/* Notes Editable */}
                  <td className="py-3 px-3 max-w-xs">
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => onUpdateItem({ ...item, notes: e.target.value })}
                      placeholder="Add progress note..."
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Checklist Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateItem}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add Submission Checklist Requirement
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
                <label className="text-slate-400 font-semibold block mb-1">Checklist Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  placeholder="e.g. Environmental Management Plan ISO 14001"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  {CHECKLIST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                  placeholder="Submission instructions..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Owner</label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    placeholder="e.g. Lead Bid Writer"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Evidence / Attachment File</label>
                <input
                  type="text"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                  placeholder="e.g. ISO14001_Audit_Report.pdf"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
