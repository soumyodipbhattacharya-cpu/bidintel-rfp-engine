export type DocumentCategory =
  | 'RFP / Invitation'
  | 'Scope of Work'
  | 'Service Agreement'
  | 'SLA / KPI Schedule'
  | 'Commercial / Cost Sheet'
  | 'Manpower Schedule'
  | 'Compliance Form'
  | 'Annexure / Appendix'
  | 'Other / Unclassified';

export type RequirementCategory =
  | 'Scope and Services'
  | 'Operations and Service Delivery'
  | 'Manpower and Deployment'
  | 'Service Levels and KPIs'
  | 'Compliance and Certifications'
  | 'Health, Safety and Training'
  | 'Commercial and Billing'
  | 'Pricing and Costing'
  | 'Legal and Contractual'
  | 'Insurance and Liability'
  | 'Penalties and Service Credits'
  | 'Data Protection and Confidentiality'
  | 'Mobilisation and Transition'
  | 'Technology and Equipment'
  | 'Timelines and Submission'
  | 'Reporting and Governance'
  | 'Other Requirements';

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type RequirementClassification = 'Mandatory' | 'Optional' | 'Unclear';
export type RequirementStatus = 'Draft' | 'Under Review' | 'Accepted' | 'Risk Flagged' | 'Addressed';

export interface ExtractedRequirement {
  id: string;
  workspaceId: string;
  sourceFileName: string;
  documentType: DocumentCategory;
  pageNumber: string; // e.g. "Page 14" or "Worksheet: Manpower"
  tableRowCellRef: string; // e.g. "Table 4.2, Row 3" or "Cell D18" or "Unknown"
  requirementCategory: RequirementCategory;
  originalText: string;
  aiInterpretation: string;
  riskLevel: RiskLevel;
  classification: RequirementClassification;
  clarificationRequired: boolean;
  suggestedClarificationQuestion: string;
  responsibleOwner: string;
  status: RequirementStatus;
  reviewerComments: string;
  evidenceCitation: string;
}

export type CostAuditCheckCategory =
  | 'Formula Error'
  | 'Missing Mandatory Rate'
  | 'Missing Quantity'
  | 'Missing Manpower Count'
  | 'Tax Discrepancy'
  | 'Broken Range / Row Omission'
  | 'Hardcoded Over Formula'
  | 'Arithmetic Mismatch'
  | 'Cross-Sheet Reconciliation'
  | 'Needs Review';

export type AuditSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
export type ReviewerAuditStatus = 'Unreviewed' | 'Acknowledged' | 'Fix Required' | 'Resolved' | 'False Positive';

export interface CostSheetFinding {
  id: string;
  workspaceId: string;
  fileName: string;
  worksheet: string;
  cellOrRange: string;
  checkCategory: CostAuditCheckCategory;
  severity: AuditSeverity;
  observedValueOrFormula: string;
  expectedCalculationOrRule: string;
  difference?: number | string;
  explanation: string;
  recommendedAction: string;
  evidenceReference: string;
  reviewerStatus: ReviewerAuditStatus;
  assignedOwner?: string;
}

export interface CrossDocConflict {
  id: string;
  workspaceId: string;
  issueTitle: string;
  issueDescription: string;
  sourceA: {
    fileName: string;
    docType: DocumentCategory;
    exactReference: string;
    extractedTextOrValue: string;
  };
  sourceB: {
    fileName: string;
    docType: DocumentCategory;
    exactReference: string;
    extractedTextOrValue: string;
  };
  conflictReason: string;
  severity: RiskLevel;
  confidence: 'High' | 'Medium' | 'Low';
  precedenceApplied?: string;
  suggestedClarificationQuestion: string;
  humanReviewStatus: 'Pending Review' | 'Confirmed Conflict' | 'Clarification Raised' | 'Resolved / Waived';
  reviewerNotes?: string;
}

export type ClarificationCategory =
  | 'Scope'
  | 'Operations'
  | 'Compliance'
  | 'Commercial'
  | 'Legal'
  | 'Timeline'
  | 'Manpower'
  | 'Technology and Equipment';

export interface ClarificationQuestion {
  id: string;
  workspaceId: string;
  questionText: string;
  businessReason: string;
  sourceDocument: string;
  exactReference: string;
  relevantRequirementOrConflict: string;
  category: ClarificationCategory;
  priority: 'High' | 'Medium' | 'Low';
  isMandatoryBeforeSubmission: boolean;
  suggestedRecipient: string;
  status: 'Draft' | 'Ready for Submission' | 'Submitted to Client' | 'Answer Received' | 'Rejected';
  reviewerComments?: string;
}

export type ChecklistCategory =
  | 'Technical submission'
  | 'Commercial submission'
  | 'Legal documentation'
  | 'Compliance documentation'
  | 'Mandatory declarations'
  | 'Required certificates'
  | 'Pricing templates'
  | 'Supporting annexures'
  | 'Signatures and authorisations'
  | 'Bid validity and submission deadlines';

export type ChecklistStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Complete'
  | 'Not Applicable'
  | 'Needs Clarification';

export interface SubmissionChecklistItem {
  id: string;
  workspaceId: string;
  title: string;
  category: ChecklistCategory;
  description: string;
  status: ChecklistStatus;
  owner: string;
  dueDate: string;
  notes: string;
  evidenceReference: string;
}

export interface SheetInfo {
  name: string;
  isHidden: boolean;
  rowCount: number;
  colCount: number;
  hasFormulas: boolean;
  hasErrors: boolean;
  sampleHeaders: string[];
}

export interface TenderDocument {
  id: string;
  workspaceId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'xlsm' | 'csv' | 'doc';
  fileSize: number;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  detectedCategory: DocumentCategory;
  userCategory: DocumentCategory;
  pageCount?: number;
  sheetCount?: number;
  uploadTimestamp: string;
  extractedSnippet?: string;
  rawText?: string;
  sheets?: SheetInfo[];
  warnings?: string[];
  isSynthetic?: boolean;
}

export interface TenderWorkspace {
  id: string;
  name: string;
  client: string;
  geography: string;
  bidDeadline: string;
  internalOwner: string;
  estimatedValue: number;
  currency: string;
  industry: string;
  status: 'Active Review' | 'Submitted' | 'Clarifications Phase' | 'Won' | 'Archived';
  createdAt: string;
  updatedAt: string;
  documentCount: number;
  notes?: string;
}
