import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  FolderOpen,
  FolderPlus,
  GitBranch,
  HardDrive,
  Layers,
  Plus,
  Search,
  Tag,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import { RFPWorkspacePackage, TenderWorkspace } from '../types';
import { exportRFPAsGitFile, importRFPFromJson } from '../lib/storage';

interface RFPMenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  rfpPackages: RFPWorkspacePackage[];
  activeRfpId: string;
  onSelectRFP: (pkg: RFPWorkspacePackage) => void;
  onCreateNewRFP: (newPkg: RFPWorkspacePackage) => void;
  onUpdateRFP: (updatedPkg: RFPWorkspacePackage) => void;
  onDeleteRFP: (workspaceId: string) => void;
}

export const RFPMenuPanel: React.FC<RFPMenuPanelProps> = ({
  isOpen,
  onClose,
  rfpPackages,
  activeRfpId,
  onSelectRFP,
  onCreateNewRFP,
  onUpdateRFP,
  onDeleteRFP,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<RFPWorkspacePackage | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // New RFP Form State
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [geography, setGeography] = useState('London & Southeast, UK');
  const [deadline, setDeadline] = useState('');
  const [owner, setOwner] = useState('');
  const [value, setValue] = useState(2500000);
  const [currency, setCurrency] = useState('GBP (£)');
  const [industry, setIndustry] = useState('Corporate Security & Critical Infrastructure');
  const [notes, setNotes] = useState('');
  const [customFolders, setCustomFolders] = useState<string[]>([
    'Commercial & Cost Sheets',
    'Technical Scope & SoW',
    'Draft Contract & MSA',
    'Compliance & Certifications',
  ]);
  const [newFolderName, setNewFolderName] = useState('');

  if (!isOpen) return null;

  const filteredPackages = rfpPackages.filter((pkg) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      pkg.workspace.name.toLowerCase().includes(q) ||
      pkg.workspace.client.toLowerCase().includes(q) ||
      pkg.workspace.industry.toLowerCase().includes(q) ||
      pkg.workspace.geography.toLowerCase().includes(q)
    );
  });

  const handleAddFolder = () => {
    if (newFolderName.trim() && !customFolders.includes(newFolderName.trim())) {
      setCustomFolders([...customFolders, newFolderName.trim()]);
      setNewFolderName('');
    }
  };

  const handleRemoveFolder = (folderName: string) => {
    setCustomFolders(customFolders.filter((f) => f !== folderName));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !client.trim()) return;

    const newId = `ws-rfp-${Date.now()}`;
    const newWorkspace: TenderWorkspace = {
      id: newId,
      name,
      client,
      geography,
      bidDeadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      internalOwner: owner || 'Bid Director',
      estimatedValue: Number(value) || 1000000,
      currency,
      industry,
      status: 'Active Review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentCount: 0,
      notes,
    };

    const newPkg: RFPWorkspacePackage = {
      workspace: newWorkspace,
      folders: customFolders.length > 0 ? customFolders : ['General Documents'],
      documents: [],
      requirements: [],
      costFindings: [],
      conflicts: [],
      clarifications: [],
      checklist: [
        {
          id: `chk-1-${Date.now()}`,
          workspaceId: newId,
          title: 'Technical Submission Pack',
          category: 'Technical submission',
          description: 'Technical methodology and operational staffing plan.',
          status: 'Not Started',
          owner: owner || 'Bid Lead',
          dueDate: deadline ? deadline.split('T')[0] : '2026-12-01',
          notes: '',
          evidenceReference: 'Technical_Proposal.docx',
        },
        {
          id: `chk-2-${Date.now()}`,
          workspaceId: newId,
          title: 'Commercial Cost Template & Pricing',
          category: 'Commercial submission',
          description: 'Completed pricing model adhering to client rate schedule.',
          status: 'Not Started',
          owner: 'Commercial Finance Lead',
          dueDate: deadline ? deadline.split('T')[0] : '2026-12-01',
          notes: '',
          evidenceReference: 'Pricing_Model.xlsx',
        },
      ],
      lastSavedAt: new Date().toISOString(),
      version: '2.0.0',
    };

    onCreateNewRFP(newPkg);
    setShowCreateModal(false);
    // Reset Form
    setName('');
    setClient('');
    setNotes('');
  };

  const handleImportJsonFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedPkg = importRFPFromJson(text);
        onCreateNewRFP(importedPkg);
        setImportError(null);
      } catch (err: any) {
        setImportError(`Failed to import RFP package: ${err.message}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      {/* Slide-out Drawer */}
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">RFP Workspaces & Bids Menu</h3>
              <p className="text-xs text-slate-400">
                Create new tenders, manage folders & files, save analysis, and store in Git repository.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Search */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New RFP</span>
            </button>

            {/* Import Git JSON */}
            <label className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import Git JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search saved RFPs by tender name, client, sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {importError && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{importError}</span>
            </div>
          )}
        </div>

        {/* Scrollable RFPs List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {filteredPackages.map((pkg) => {
            const isActive = pkg.workspace.id === activeRfpId;
            const deadlineDate = new Date(pkg.workspace.bidDeadline);

            return (
              <div
                key={pkg.workspace.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isActive
                    ? 'bg-slate-950 border-indigo-500/80 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                        {pkg.workspace.industry}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          ACTIVE SESSION
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{pkg.workspace.name}</h4>
                    <p className="text-xs text-slate-400">{pkg.workspace.client}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-500 block">Est. Value</span>
                    <span className="text-xs font-bold font-mono text-slate-200">
                      {pkg.workspace.currency} {pkg.workspace.estimatedValue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs py-2 bg-slate-900/60 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Files</span>
                    <span className="font-mono font-bold text-slate-200">{pkg.documents.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Folders</span>
                    <span className="font-mono font-bold text-indigo-400">{pkg.folders?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Requirements</span>
                    <span className="font-mono font-bold text-emerald-400">{pkg.requirements.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Audit Issues</span>
                    <span className="font-mono font-bold text-amber-400">{pkg.costFindings.length + pkg.conflicts.length}</span>
                  </div>
                </div>

                {/* Footer Controls: Open, Edit, Export Git JSON, Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Due: {deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isActive ? (
                      <button
                        onClick={() => {
                          onSelectRFP(pkg);
                          onClose();
                        }}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer shadow-sm"
                      >
                        Open RFP
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium">
                        Current
                      </span>
                    )}

                    <button
                      onClick={() => setEditingPkg(pkg)}
                      title="Edit RFP metadata"
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => exportRFPAsGitFile(pkg)}
                      title="Download JSON to store in Git repo (data/tenders/)"
                      className="p-1.5 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/30 transition-colors cursor-pointer"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete tender workspace "${pkg.workspace.name}"?`)) {
                          onDeleteRFP(pkg.workspace.id);
                        }
                      }}
                      title="Delete RFP"
                      className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer Bottom Bar: Git Repository Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>Git Stored Data in <code className="text-slate-300 font-mono">/data/tenders/</code></span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Auto-saved in browser</span>
        </div>
      </div>

      {/* Modal: Create New RFP */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Create New RFP Tender Workspace
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">RFP Tender Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. London Rail Network CCTV & Manned Guarding Contract"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Client / Issuing Authority *</label>
                  <input
                    type="text"
                    required
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="e.g. Network Rail Ltd"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Geography / Location</label>
                  <input
                    type="text"
                    value={geography}
                    onChange={(e) => setGeography(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Submission Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Estimated Value</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="AUD ($)">AUD ($)</option>
                  </select>
                </div>
              </div>

              {/* Folder Setup */}
              <div className="space-y-1.5 pt-1">
                <label className="text-slate-400 font-semibold block">Tender Workspace Folders</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {customFolders.map((f) => (
                    <span
                      key={f}
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700"
                    >
                      <FolderOpen className="w-3 h-3 text-indigo-400" />
                      <span>{f}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFolder(f)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Add folder (e.g. Technical Scope, Addenda)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-200 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFolder}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add Folder
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Tender Notes & Win Themes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key win strategy, operational nuances..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                Create Workspace
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Edit Existing RFP Metadata */}
      {editingPkg && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                Edit Tender: {editingPkg.workspace.name}
              </h3>
              <button
                onClick={() => setEditingPkg(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Tender Name</label>
                <input
                  type="text"
                  value={editingPkg.workspace.name}
                  onChange={(e) =>
                    setEditingPkg({
                      ...editingPkg,
                      workspace: { ...editingPkg.workspace, name: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Status</label>
                  <select
                    value={editingPkg.workspace.status}
                    onChange={(e) =>
                      setEditingPkg({
                        ...editingPkg,
                        workspace: { ...editingPkg.workspace, status: e.target.value as any },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Active Review">Active Review</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Clarifications Phase">Clarifications Phase</option>
                    <option value="Won">Won</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Internal Owner</label>
                  <input
                    type="text"
                    value={editingPkg.workspace.internalOwner}
                    onChange={(e) =>
                      setEditingPkg({
                        ...editingPkg,
                        workspace: { ...editingPkg.workspace, internalOwner: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editingPkg.workspace.notes || ''}
                  onChange={(e) =>
                    setEditingPkg({
                      ...editingPkg,
                      workspace: { ...editingPkg.workspace, notes: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingPkg(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateRFP(editingPkg);
                  setEditingPkg(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
