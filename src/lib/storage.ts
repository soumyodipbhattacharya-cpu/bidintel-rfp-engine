import { RFPWorkspacePackage, TenderWorkspace } from '../types';
import {
  SYNTHETIC_WORKSPACE,
  SYNTHETIC_DOCUMENTS,
  SYNTHETIC_REQUIREMENTS,
  SYNTHETIC_COST_FINDINGS,
  SYNTHETIC_CROSS_CONFLICTS,
  SYNTHETIC_CLARIFICATIONS,
  SYNTHETIC_CHECKLIST,
} from './syntheticBenchmark';

const STORAGE_KEY = 'bidintel_rfp_packages_v2';

// Seed package 1: MTA Security & Facilities (Benchmark)
export const INITIAL_MTA_PACKAGE: RFPWorkspacePackage = {
  workspace: SYNTHETIC_WORKSPACE,
  folders: ['1. Commercial & Pricing', '2. Scope of Work & Specs', '3. Contracts & MSA', '4. Compliance & Annexures'],
  documents: SYNTHETIC_DOCUMENTS.map((doc) => {
    let folder = '4. Compliance & Annexures';
    if (doc.fileName.includes('Commercial') || doc.fileName.includes('Pricing')) folder = '1. Commercial & Pricing';
    else if (doc.fileName.includes('Statement_of_Work') || doc.fileName.includes('Scope')) folder = '2. Scope of Work & Specs';
    else if (doc.fileName.includes('Agreement') || doc.fileName.includes('Contract')) folder = '3. Contracts & MSA';
    return { ...doc, folder };
  }),
  requirements: SYNTHETIC_REQUIREMENTS,
  costFindings: SYNTHETIC_COST_FINDINGS,
  conflicts: SYNTHETIC_CROSS_CONFLICTS,
  clarifications: SYNTHETIC_CLARIFICATIONS,
  checklist: SYNTHETIC_CHECKLIST,
  lastSavedAt: new Date().toISOString(),
  version: '2.0.0',
};

// Seed package 2: International Airport Soft Services & Patrol Tender
export const SECOND_AIRPORT_PACKAGE: RFPWorkspacePackage = {
  workspace: {
    id: 'ws-airport-fm-2026',
    name: 'Heathrow Logistics & Airside Guarding Tender',
    client: 'Heathrow Airport Infrastructure Services',
    geography: 'London Heathrow (LHR), UK',
    bidDeadline: '2026-12-10T15:00:00Z',
    internalOwner: 'Marcus Vance (Commercial Bid Manager)',
    estimatedValue: 3200000,
    currency: 'GBP (£)',
    industry: 'Aviation Security & Airside Operations',
    status: 'Active Review',
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-19T14:30:00Z',
    documentCount: 4,
    notes: 'Airside security with strict Department for Transport (DfT) counter-terrorism pass requirements and high-frequency perimeter patrols.',
  },
  folders: ['Commercial Models', 'Airside Regulations', 'Service Agreements'],
  documents: [
    {
      id: 'doc-lhr-1',
      workspaceId: 'ws-airport-fm-2026',
      fileName: 'LHR_Airside_ITT_Security_2026.pdf',
      fileType: 'pdf',
      fileSize: 1850000,
      status: 'processed',
      detectedCategory: 'RFP / Invitation',
      userCategory: 'RFP / Invitation',
      pageCount: 38,
      uploadTimestamp: '2026-10-15T09:00:00Z',
      extractedSnippet: 'Invitation to tender for airside perimeter guarding and vehicle gate compliance at Heathrow Airport Terminals 2 & 5.',
      folder: 'Airside Regulations',
    },
    {
      id: 'doc-lhr-2',
      workspaceId: 'ws-airport-fm-2026',
      fileName: 'LHR_Cost_Model_Schedule_B.xlsx',
      fileType: 'xlsx',
      fileSize: 420000,
      status: 'processed',
      detectedCategory: 'Commercial / Cost Sheet',
      userCategory: 'Commercial / Cost Sheet',
      sheetCount: 3,
      uploadTimestamp: '2026-10-15T09:10:00Z',
      extractedSnippet: 'Pricing schedule with airside clearance wage rates, vehicle lease amortizations, and shift premiums.',
      folder: 'Commercial Models',
    },
  ],
  requirements: [
    {
      id: 'REQ-LHR-01',
      workspaceId: 'ws-airport-fm-2026',
      sourceFileName: 'LHR_Airside_ITT_Security_2026.pdf',
      documentType: 'Scope of Work',
      pageNumber: 'Page 12',
      tableRowCellRef: 'Clause 4.1',
      requirementCategory: 'Compliance and Certifications',
      originalText: 'All operational personnel must hold valid DfT Airside Security Passes and CTC/SC national security vetting prior to deployment.',
      aiInterpretation: 'Mandatory Counter-Terrorist Check vetting for 100% of staff. Vetting lead time is ~8 weeks and must be factored into mobilization timeline.',
      riskLevel: 'Critical',
      classification: 'Mandatory',
      clarificationRequired: true,
      suggestedClarificationQuestion: 'Will Heathrow Airport sponsor the required DfT security clearances during the mobilization period, or must the Contractor hold existing cleared personnel?',
      responsibleOwner: 'Vetting Officer',
      status: 'Accepted',
      reviewerComments: 'Mobilisation plan includes vetting buffer.',
      evidenceCitation: 'LHR_Airside_ITT_Security_2026.pdf (Page 12, Clause 4.1)',
    },
  ],
  costFindings: [],
  conflicts: [],
  clarifications: [
    {
      id: 'CQ-LHR-01',
      workspaceId: 'ws-airport-fm-2026',
      questionText: 'Will Heathrow Airport sponsor DfT airside security pass applications during the 60-day mobilization window?',
      businessReason: 'Essential to prevent penalty deductions for unmanned airside gates on commencement date.',
      sourceDocument: 'LHR_Airside_ITT_Security_2026.pdf',
      exactReference: 'Clause 4.1, Page 12',
      relevantRequirementOrConflict: 'REQ-LHR-01',
      category: 'Operations',
      priority: 'High',
      isMandatoryBeforeSubmission: true,
      suggestedRecipient: 'Heathrow Airport Security Directorate',
      status: 'Ready for Submission',
    },
  ],
  checklist: [
    {
      id: 'chk-lhr-1',
      workspaceId: 'ws-airport-fm-2026',
      title: 'DfT Compliance & Airside Operating License',
      category: 'Required certificates',
      description: 'Submission of company airside security accreditation certificate.',
      status: 'Complete',
      owner: 'Marcus Vance',
      dueDate: '2026-11-20',
      notes: 'Certificate valid until 2028.',
      evidenceReference: 'LHR_Airside_License_2026.pdf',
    },
  ],
  lastSavedAt: new Date().toISOString(),
  version: '2.0.0',
};

/**
 * Loads all RFP packages from localStorage or initializes with repo benchmark packages
 */
export function loadAllRFPs(): RFPWorkspacePackage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: RFPWorkspacePackage[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load RFP packages from storage, using seed data:', err);
  }

  // Seed storage
  const defaults = [INITIAL_MTA_PACKAGE, SECOND_AIRPORT_PACKAGE];
  saveAllRFPs(defaults);
  return defaults;
}

/**
 * Saves all RFP packages to localStorage
 */
export function saveAllRFPs(packages: RFPWorkspacePackage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
  } catch (err) {
    console.error('Failed to save RFP packages to localStorage:', err);
  }
}

/**
 * Saves or updates a single RFP package
 */
export function saveRFPPackage(pkg: RFPWorkspacePackage): RFPWorkspacePackage[] {
  const current = loadAllRFPs();
  const index = current.findIndex((p) => p.workspace.id === pkg.workspace.id);
  const updatedPkg = { ...pkg, lastSavedAt: new Date().toISOString() };

  let updatedList: RFPWorkspacePackage[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = updatedPkg;
  } else {
    updatedList = [updatedPkg, ...current];
  }

  saveAllRFPs(updatedList);
  return updatedList;
}

/**
 * Deletes an RFP package
 */
export function deleteRFPPackage(workspaceId: string): RFPWorkspacePackage[] {
  const current = loadAllRFPs();
  const filtered = current.filter((p) => p.workspace.id !== workspaceId);
  saveAllRFPs(filtered);
  return filtered;
}

/**
 * Exports an RFP package as a downloadable JSON file ready to store in a git repository (data/tenders/)
 */
export function exportRFPAsGitFile(pkg: RFPWorkspacePackage): void {
  const safeName = pkg.workspace.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 32);
  const fileName = `rfp_${safeName}_${Date.now()}.json`;
  const jsonStr = JSON.stringify(pkg, null, 2);

  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Validates and imports an RFP package from JSON string
 */
export function importRFPFromJson(jsonStr: string): RFPWorkspacePackage {
  const parsed = JSON.parse(jsonStr);
  if (!parsed.workspace || !parsed.workspace.id || !parsed.workspace.name) {
    throw new Error('Invalid RFP package: missing workspace metadata.');
  }

  return {
    workspace: {
      ...parsed.workspace,
      id: parsed.workspace.id || `ws-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    },
    folders: parsed.folders || ['General Documents', 'Commercial', 'Technical'],
    documents: parsed.documents || [],
    requirements: parsed.requirements || [],
    costFindings: parsed.costFindings || [],
    conflicts: parsed.conflicts || [],
    clarifications: parsed.clarifications || [],
    checklist: parsed.checklist || [],
    lastSavedAt: new Date().toISOString(),
    version: parsed.version || '2.0.0',
  };
}

/**
 * Sync with backend server git directory (/data/tenders/)
 */
export async function syncRFPWithBackend(pkg: RFPWorkspacePackage): Promise<boolean> {
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

export async function deleteRFPFromBackend(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/rfps/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function fetchRFPsFromBackend(): Promise<RFPWorkspacePackage[] | null> {
  try {
    const res = await fetch('/api/rfps');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.rfps) && data.rfps.length > 0) {
      return data.rfps;
    }
  } catch {
    // client static or offline fallback
  }
  return null;
}

