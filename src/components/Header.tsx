import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Layers,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FolderKanban,
  FileText,
  HelpCircle,
  ShieldAlert,
  ListTodo,
  Code2,
  Laptop,
  AppWindow,
} from 'lucide-react';
import { TenderWorkspace } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ChromebookGuideModal } from './ChromebookGuideModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeWorkspace: TenderWorkspace;
  onResetBenchmark: () => void;
  onExportExcel: () => void;
  hasGeminiKey: boolean;
  totalAlerts: number;
  onOpenRfpMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeWorkspace,
  onResetBenchmark,
  onExportExcel,
  hasGeminiKey,
  totalAlerts,
  onOpenRfpMenu,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: Layers },
    { id: 'workspaces', label: 'Workspaces', icon: FolderKanban },
    { id: 'documents', label: 'Document Library', icon: FileText },
    { id: 'requirements', label: 'Requirements Register', icon: CheckCircle2 },
    { id: 'cost-audit', label: 'Cost Sheet Audit', icon: FileSpreadsheet },
    { id: 'conflicts', label: 'Cross-Doc Conflicts', icon: ShieldAlert, badge: totalAlerts },
    { id: 'clarifications', label: 'Clarification Qs', icon: HelpCircle },
    { id: 'checklist', label: 'Submission Checklist', icon: ListTodo },
    { id: 'architecture', label: 'Architecture & Python', icon: Code2 },
  ];

  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showChromebookModal, setShowChromebookModal] = useState(false);

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur">
        {/* Top Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">BidIntel</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                  AI Tender Engine
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gemini 3.8 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">Enterprise Tender Package & Multi-Document Intelligence</p>
            </div>
          </div>

          {/* Workspace Quick Details & Action Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* RFP Menu Button */}
            {onOpenRfpMenu && (
              <button
                onClick={onOpenRfpMenu}
                title="Open RFP Projects Menu, create new bids, or manage folders/files"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FolderKanban className="w-3.5 h-3.5 text-indigo-200" />
                <span>RFP Projects & Menu</span>
              </button>
            )}

            <button
              onClick={onOpenRfpMenu}
              title="Click to switch or manage RFPs"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors cursor-pointer"
            >
              <span className="text-slate-500">Active:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[180px]" title={activeWorkspace.name}>
                {activeWorkspace.client}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-amber-400 flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3" />
                {new Date(activeWorkspace.bidDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </button>

            {/* Chromebook Guide Trigger */}
            <button
              onClick={() => setShowChromebookModal(true)}
              title="Chromebook & ChromeOS usage instructions"
              className="px-2.5 py-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 text-xs font-semibold border border-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span>Chromebook Guide</span>
            </button>

            {/* In-App PWA Install on Chromebook / Desktop */}
            {isInstallable && (
              <button
                onClick={install}
                title="Install BidIntel as desktop app on Chromebook"
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer animate-pulse"
              >
                <AppWindow className="w-3.5 h-3.5 text-emerald-400" />
                <span>Install App</span>
              </button>
            )}

            <button
              onClick={onResetBenchmark}
              title="Reload Synthetic Corporate Security Benchmark Package"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Load Benchmark RFP</span>
            </button>

            <button
              onClick={onExportExcel}
              title="Download multi-sheet workbook with all registers"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm hover:shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full Audit (.xlsx)</span>
            </button>
          </div>
        </div>

      {/* Main Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors relative cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-indigo-400 font-semibold border border-indigo-900/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      </header>
      <ChromebookGuideModal
        isOpen={showChromebookModal}
        onClose={() => setShowChromebookModal(false)}
      />
    </>
  );
};
