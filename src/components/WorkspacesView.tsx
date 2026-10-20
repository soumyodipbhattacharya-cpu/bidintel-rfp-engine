import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FolderKanban,
  Globe2,
  Plus,
  Shield,
  TrendingUp,
  User,
} from 'lucide-react';
import { TenderWorkspace } from '../types';

interface WorkspacesViewProps {
  workspaces: TenderWorkspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (workspace: TenderWorkspace) => void;
}

export const WorkspacesView: React.FC<WorkspacesViewProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [geography, setGeography] = useState('');
  const [bidDeadline, setBidDeadline] = useState('');
  const [internalOwner, setInternalOwner] = useState('');
  const [estimatedValue, setEstimatedValue] = useState(1500000);
  const [currency, setCurrency] = useState('GBP (£)');
  const [industry, setIndustry] = useState('Corporate Security & Critical Infrastructure');
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !client.trim()) return;

    const newWs: TenderWorkspace = {
      id: `ws-${Date.now()}`,
      name,
      client,
      geography: geography || 'United Kingdom',
      bidDeadline: bidDeadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      internalOwner: internalOwner || 'Bid Lead',
      estimatedValue: Number(estimatedValue) || 1000000,
      currency,
      industry,
      status: 'Active Review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentCount: 0,
      notes,
    };

    onCreateWorkspace(newWs);
    setShowModal(false);
    setName('');
    setClient('');
    setGeography('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-400" />
              Tender Workspaces & Bidding Pipelines ({workspaces.length})
            </h2>
            <p className="text-xs text-slate-400">
              Manage discrete tender engagements, contract values, regional jurisdictions, and bid leads.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tender Workspace</span>
          </button>
        </div>
      </div>

      {/* Workspace Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspaces.map((ws) => {
          const isActive = ws.id === activeWorkspaceId;
          const deadlineDate = new Date(ws.bidDeadline);

          return (
            <div
              key={ws.id}
              className={`rounded-xl p-5 border transition-all space-y-4 ${
                isActive
                  ? 'bg-slate-900 border-indigo-500/80 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                      {ws.industry}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ACTIVE WORKSPACE
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white">{ws.name}</h3>
                  <p className="text-xs text-slate-400">{ws.client}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Est. Value</span>
                  <span className="text-sm font-bold text-slate-100 font-mono">
                    {ws.currency} {ws.estimatedValue.toLocaleString()}
                  </span>
                </div>
              </div>

              {ws.notes && (
                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 line-clamp-2">
                  {ws.notes}
                </p>
              )}

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{ws.geography}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{ws.internalOwner}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">
                  Documents attached: <strong className="text-slate-200">{ws.documentCount}</strong>
                </span>

                {!isActive && (
                  <button
                    onClick={() => onSelectWorkspace(ws.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Switch to Workspace
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Create New Tender Workspace
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Tender / RFP Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Heathrow Airport Perimeter Security & Patrol Services"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Client / Authority</label>
                  <input
                    type="text"
                    required
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    placeholder="e.g. Heathrow Airport Ltd"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Geography / Region</label>
                  <input
                    type="text"
                    value={geography}
                    onChange={(e) => setGeography(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    placeholder="e.g. London, UK"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Submission Deadline</label>
                  <input
                    type="date"
                    value={bidDeadline}
                    onChange={(e) => setBidDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Estimated Value</label>
                  <input
                    type="number"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Industry / Sector</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Corporate Security & Critical Infrastructure">Corporate Security & Infrastructure</option>
                    <option value="Facility Management & Cleaning Services">Facility Management & Cleaning</option>
                    <option value="IT Services & Managed Infrastructure">IT Services & Infrastructure</option>
                    <option value="Logistics & Supply Chain Operations">Logistics & Supply Chain</option>
                    <option value="Catering & Soft Services">Catering & Soft Services</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Internal Bid Lead</label>
                  <input
                    type="text"
                    value={internalOwner}
                    onChange={(e) => setInternalOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    placeholder="e.g. Sarah Jenkins (Bid Director)"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Brief Description / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                  placeholder="Key strategic objectives, incumbent competitor notes..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Create Workspace
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
