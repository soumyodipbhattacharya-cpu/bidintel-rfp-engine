import {
  ClarificationQuestion,
  CostSheetFinding,
  CrossDocConflict,
  ExtractedRequirement,
  RFPWorkspacePackage,
  SubmissionChecklistItem,
  TenderDocument,
  TenderWorkspace,
} from '../types';
import {
  SYNTHETIC_WORKSPACE,
  SYNTHETIC_DOCUMENTS,
  SYNTHETIC_REQUIREMENTS,
  SYNTHETIC_COST_FINDINGS,
  SYNTHETIC_CROSS_CONFLICTS,
  SYNTHETIC_CLARIFICATIONS,
  SYNTHETIC_CHECKLIST,
} from './syntheticBenchmark';

const LOCAL_STORAGE_KEY = 'bidintel_rfps_v2';
const ACTIVE_RFP_KEY = 'bidintel_active_rfp_id_v2';

export const DEFAULT_RFP_FOLDERS = [
  '1. RFP & Tender Specifications',
  '2. Scope of Work & Specs',
  '3. Commercial & Cost Sheets',
  '4. Contracts & MSA Schedules',
  '5. Compliance & Mandatory Annexures',
  '6. Addenda & Clarifications',
];

// Build initial default benchmark RFP package
export function getDefaultBenchmarkPackage(): RFPWorkspacePackage {
  return {
    workspace: { ...SYNTHETIC_WORKSPACE },
    folders: [...DEFAULT_RFP_FOLDERS],
    documents: SYNTHETIC_DOCUMENTS.map((doc, idx) => {
      let folder = DEFAULT_RFP_FOLDERS[0];
      if (doc.fileName.includes('Statement_of_Work')) folder = DEFAULT_RFP_FOLDERS[1];
      else if (doc.fileName.includes('Pricing') || doc.fileName.includes('Cost')) folder = DEFAULT_RFP_FOLDERS[2];
      else if (doc.fileName.includes('Agreement') || doc.fileName.includes('SLA')) folder = DEFAULT_RFP_FOLDERS[3];
      else if (doc.fileName.includes('Compliance')) folder = DEFAULT_RFP_FOLDERS[4];
      return { ...doc, folder };
    }),
    requirements: [...SYNTHETIC_REQUIREMENTS],
    costFindings: [...SYNTHETIC_COST_FINDINGS],
    conflicts: [...SYNTHETIC_CROSS_CONFLICTS],
    clarifications: [...SYNTHETIC_CLARIFICATIONS],
    checklist: [...SYNTHETIC_CHECKLIST],
    lastSavedAt: new Date().toISOString(),
    version: '2.0.0',
  };
}

// Load all RFPs from LocalStorage
export function loadRfpsFromStorage(): Record<string, RFPWorkspacePackage> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse RFPs from localStorage:', err);
  }
  const defaultPkg = getDefaultBenchmarkPackage();
  return { [defaultPkg.workspace.id]: defaultPkg };
}

// Save all RFPs to LocalStorage
export function saveRfpsToStorage(rfps: Record<string, RFPWorkspacePackage>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rfps));
  } catch (err) {
    console.warn('Failed to write RFPs to localStorage:', err);
  }
}

// Get last active RFP id
export function getActiveRfpIdFromStorage(): string | null {
  try {
    return localStorage.getItem(ACTIVE_RFP_KEY);
  } catch {
    return null;
  }
}

// Set active RFP id
export function setActiveRfpIdToStorage(id: string): void {
  try {
    localStorage.setItem(ACTIVE_RFP_KEY, id);
  } catch {
    // ignore
  }
}

// Try to fetch RFPs from backend server (reads data/tenders/ in git repo)
export async function fetchRfpsFromBackend(): Promise<Record<string, RFPWorkspacePackage> | null> {
  try {
    const res = await fetch('/api/rfps');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.rfps) && data.rfps.length > 0) {
      const result: Record<string, RFPWorkspacePackage> = {};
      for (const item of data.rfps) {
        const id = item.workspace?.id || item.id;
        if (id) {
          result[id] = item;
        }
      }
      return result;
    }
  } catch {
    // server not present (e.g. GitHub Pages static deployment)
  }
  return null;
}

// Save RFP package to backend server (writes directly to data/tenders/<id>.json in repo)
export async function saveRfpToBackend(pkg: RFPWorkspacePackage): Promise<boolean> {
  try {
    const res = await fetch('/api/rfps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg),
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

// Delete RFP on backend
export async function deleteRfpFromBackend(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/rfps/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

// Export single RFP as JSON file for committing to Git
export function downloadRfpAsJson(pkg: RFPWorkspacePackage): void {
  const safeName = pkg.workspace.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40);
  const fileName = `${safeName || pkg.workspace.id}_data.json`;
  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export all RFPs bundled for Git repo
export function downloadAllRfpsAsJson(rfps: Record<string, RFPWorkspacePackage>): void {
  const fileName = `bidintel_git_rfp_bundle_${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(rfps, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
