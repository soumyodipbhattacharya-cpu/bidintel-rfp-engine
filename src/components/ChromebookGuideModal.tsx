import React, { useState } from 'react';
import {
  AppWindow,
  CheckCircle2,
  Chrome,
  Command,
  Copy,
  Download,
  FolderOpen,
  HardDrive,
  Laptop,
  Maximize2,
  Monitor,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ChromebookGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChromebookGuideModal: React.FC<ChromebookGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'app' | 'files' | 'shortcuts' | 'linux'>('app');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Using BidIntel on your Chromebook (ChromeOS)
              </h3>
              <p className="text-xs text-slate-400">
                Optimized for ChromeOS shelf integration, Google Drive drag-and-drop, and Linux Crostini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-slate-800"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 space-x-1 pb-1">
          <button
            onClick={() => setActiveTab('app')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'app'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AppWindow className="w-3.5 h-3.5" />
            <span>1. Install as Desktop App (PWA)</span>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'files'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>2. Google Drive & Files</span>
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'shortcuts'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Command className="w-3.5 h-3.5" />
            <span>3. Split Screen & Shortcuts</span>
          </button>
          <button
            onClick={() => setActiveTab('linux')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'linux'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>4. Linux (Crostini) Terminal</span>
          </button>
        </div>

        {/* Tab 1: PWA Installation */}
        {activeTab === 'app' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Direct Installation on ChromeOS</h4>
                  <p className="text-slate-400 text-xs">
                    Pin BidIntel to your Chromebook Shelf (taskbar) with its own distraction-free window.
                  </p>
                </div>
                {isInstallable && (
                  <button
                    onClick={install}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install to Chromebook</span>
                  </button>
                )}
                {isInstalled && (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Installed as PWA
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-200 block text-xs">Method A: Chrome Address Bar</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Look at the right side of Chrome's address bar (Omnibox). Click the small <strong>Install icon</strong> (computer monitor with down arrow) and confirm "Install".
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-200 block text-xs">Method B: Chrome Menu (⋮)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Click the <strong>three dots (⋮)</strong> in Chrome &gt; select <strong>Save and share</strong> &gt; click <strong>Install BidIntel</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-200 block text-xs">Pin to Shelf / Taskbar</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Once installed, right-click the BidIntel icon on your Chromebook shelf and select <strong>Pin</strong> for instant one-click launch anytime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Files & Google Drive */}
        {activeTab === 'files' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-emerald-400" />
                Accessing Files on ChromeOS
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Chromebooks store files in the <strong>Files app</strong> (shortcut: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">Alt + Shift + M</kbd>). You can directly drag files from Google Drive, your Downloads folder, or a connected USB thumb drive straight into the Document Library!
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded bg-indigo-950/70 text-indigo-400 shrink-0">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-200 block mb-0.5">Google Drive Drag & Drop</strong>
                  <p className="text-slate-400 text-[11px]">
                    Open the ChromeOS Files app, navigate to Google Drive, select your RFP PDFs or Excel templates, and drag them into BidIntel's <strong>Document Library</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded bg-emerald-950/70 text-emerald-400 shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-200 block mb-0.5">Opening Exported Audits in Google Sheets</strong>
                  <p className="text-slate-400 text-[11px]">
                    When you click <strong>Export Full Audit (.xlsx)</strong>, the file saves to your Downloads folder. Double-clicking it on a Chromebook opens it seamlessly in <strong>Google Sheets</strong> or Microsoft 365 with all tabs, formulas, and formatting preserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Split Screen & Shortcuts */}
        {activeTab === 'shortcuts' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-blue-400" />
                ChromeOS Dual-Window Productivity
              </h4>
              <p className="text-slate-400 text-xs">
                Compare original tender documents alongside BidIntel using ChromeOS window snapping shortcuts:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Snap Window to Left Half</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px] border border-slate-700">
                    Alt + [
                  </kbd>
                </div>
                <p className="text-slate-400 text-[11px]">Snaps BidIntel to the left side of your screen.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Snap Window to Right Half</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] border border-slate-700">
                    Alt + ]
                  </kbd>
                </div>
                <p className="text-slate-400 text-[11px]">Snaps your RFP PDF reader or Google Sheet to the right.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Open Files Manager</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-[11px] border border-slate-700">
                    Alt + Shift + M
                  </kbd>
                </div>
                <p className="text-slate-400 text-[11px]">Quickly browse local files and Google Drive.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Take Screenshot / Capture Clause</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-mono text-[11px] border border-slate-700">
                    Ctrl + Shift + Overview (F5)
                  </kbd>
                </div>
                <p className="text-slate-400 text-[11px]">Captures contract clauses for submission evidence.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Linux Crostini */}
        {activeTab === 'linux' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Running Python & Local Development on ChromeOS (Linux Crostini)
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                All modern Chromebooks have a built-in Debian Linux virtual machine called <strong>Crostini</strong>. If you want to run the Python backend, execute test suites, or customize the engine code locally on your Chromebook:
              </p>
            </div>

            <ol className="space-y-3 list-decimal pl-4">
              <li className="space-y-1">
                <strong className="text-slate-200">Enable Linux on your Chromebook:</strong>
                <p className="text-slate-400 text-[11px]">
                  Go to <strong>Settings</strong> &gt; <strong>Advanced</strong> &gt; <strong>Developers</strong> &gt; Click <strong>Turn on</strong> next to <em>Linux development environment</em>.
                </p>
              </li>

              <li className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-200">Open Terminal & Clone / Setup:</strong>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'sudo apt update && sudo apt install -y python3 python3-pip git nodejs npm',
                        'apt'
                      )
                    }
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCmd === 'apt' ? 'Copied!' : 'Copy Command'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800">
                  sudo apt update &amp;&amp; sudo apt install -y python3 python3-pip git nodejs npm
                </div>
              </li>

              <li className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-200">Run the Python Unit Tests on Chromebook:</strong>
                  <button
                    onClick={() =>
                      copyToClipboard('python3 -m unittest backend_python/test_suite.py', 'test')
                    }
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCmd === 'test' ? 'Copied!' : 'Copy Command'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800">
                  python3 -m unittest backend_python/test_suite.py
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-500">
            BidIntel is 100% compatible with ChromeOS, Chrome browser, and Chromebook touchscreens.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
          >
            Got it, continue
          </button>
        </div>
      </div>
    </div>
  );
};
