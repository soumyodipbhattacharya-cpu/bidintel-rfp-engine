# BidIntel - AI-Powered Tender & RFP Intelligence Engine

BidIntel is an enterprise-grade AI intelligence engine designed for bid teams, proposal managers, commercial analysts, and legal counsel. It audits complex multi-document tender packages, cross-references clauses across disparate contracts and scopes, audits spreadsheet cost models down to cell-level formulas, and generates pre-bid clarification questions.

---

## 1. System Architecture Overview

The system employs a dual-runtime architecture:
1. **Full-Stack Production App (Active)**:
   - **Backend**: Node.js & Express (`server.ts`) listening on port 3000.
   - **AI Engine**: Google GenAI SDK (`@google/genai`) invoking model `gemini-3.8-flash` with JSON response schemas.
   - **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide icons, SheetJS (`xlsx`).
   - **Excel Engine**: Cell-level formula parsing, range omission inspection, VAT/tax arithmetic validation, and cross-sheet reconciliation.
2. **Pluggable Python Engine (`/backend_python/`)**:
   - `requirements.txt`: FastAPI, PyMuPDF (fitz), python-docx, openpyxl, pandas, pytest.
   - `document_processor.py`: Pure modular processor for formula error detection, tax calculations, and staffing reconciliations.
   - `test_suite.py`: Verified unit test suite with 9 passing tests.

---

## 2. Key Capabilities

### A. Multi-Document Package Management
- Upload multiple tender files in one batch or single combined packages (PDF, DOCX, XLSX, XLSM, CSV).
- Automatic document classification into 9 standard categories:
  - RFP / Invitation
  - Scope of Work
  - Service Agreement
  - SLA / KPI Schedule
  - Commercial / Cost Sheet
  - Manpower Schedule
  - Compliance Form
  - Annexure / Appendix
  - Other / Unclassified
- Editable classification tags and duplicate upload prevention.

### B. Master Requirements Register
- Categorizes tender requirements across 17 functional disciplines:
  - *Scope & Services, Operations, Manpower & Deployment, SLAs & KPIs, Compliance, Health & Safety, Commercial & Billing, Pricing & Costing, Legal & Contractual, Insurance & Liability, Penalties, Data Protection, Mobilisation, Technology & Equipment, Timelines, Reporting, Other Requirements.*
- Captures exact source citations (`Document`, `Page`, `Clause`, `Cell Reference`) without inventing references.

### C. Detailed Excel Cost-Sheet Intelligence
- **Workbook Inspection**: Discovers all worksheets, including hidden worksheets (e.g. `Hidden_Internal_Margins`).
- **Formula Error Detection**: Flags `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`.
- **Range Omission Detection**: Flags formulas like `=SUM(F5:F20)` when active item rows continue up to `F26`.
- **Arithmetic Reconciliation**: Validates `Quantity × Rate = Stated Amount` and `Monthly × 12 = Annual`.
- **Tax & GST Verification**: Validates whether stated tax equals `Base × Stated Rate %` (flags deviations over 1.0 unit).
- **Cross-Sheet Reconciliation**: Reconciles Summary sheet line items against detailed departmental worksheets.

### D. Cross-Document Intelligence
- Identifies critical discrepancies across documents:
  - **Staffing Deficit**: Detects when Scope of Work mandates 45 FTE officers while Commercial Sheet budgets only 40 FTEs.
  - **Payment Terms**: Flags conflicts between 30 days net (RFP) and 60 days net (Draft MSA).
  - **Deadlines**: Flags conflicting submission dates (e.g. Nov 15 vs Nov 10).
  - **Scope Omission**: Flags mandated equipment (e.g. Body-Worn Cameras) absent from pricing schedules.
  - **Missing Annexures**: Identifies referenced annexures (Annexure E & F) missing from data rooms.

### E. AI-Generated Clarification Questions
- Generates formal queries grouped into 8 domains with business rationale, citations, priority, and mandatory pre-bid flags.
- Exportable to Excel and CSV.

### F. Multi-Sheet Excel Export
- Generates a comprehensive `.xlsx` workbook containing:
  - `Executive_Summary`
  - `Requirements_Register`
  - `Cost_Sheet_Audit`
  - `Cross_Doc_Conflicts`
  - `Clarification_Questions`
  - `Submission_Checklist`

---

## 3. Verified Python Test Report

The unit test suite was executed in the runtime environment:
\`\`\`bash
python3 -m unittest backend_python/test_suite.py
\`\`\`

**Actual Output:**
\`\`\`text
Ran 9 tests in 0.002s
OK
\`\`\`

**Tests Executed:**
1. `test_formula_ref_error_detected`: Passes (Identifies `#REF!` in cell F19).
2. `test_formula_div_zero_error_detected`: Passes (Identifies `#DIV/0!`).
3. `test_clean_formula_passes`: Passes (Clean `=SUM(C4:C20)` passes without false positive).
4. `test_sum_range_omission_detected`: Passes (Detects `=SUM(F5:F20)` omitting 6 active rows).
5. `test_tax_arithmetic_discrepancy`: Passes (Flags 20% VAT on £2.4M stated as £380k instead of £480k).
6. `test_tax_arithmetic_valid`: Passes (Clean 20% on £100k passes).
7. `test_quantity_rate_mismatch`: Passes (Flags 15 × £2,200 stated as £30,000 instead of £33,000).
8. `test_staffing_deficit_detected`: Passes (Flags 45 FTE SoW requirement vs 40 FTE pricing).
9. `test_payment_terms_conflict_detected`: Passes (Flags 30-day RFP terms vs 60-day Contract terms).

---

## 4. Local Development & Launch Instructions

### Prerequisites
- Node.js 20+ and npm
- Python 3.10+ (for running Python unit tests or FastAPI backend)

### Step 1: Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 2: Start Development Server
\`\`\`bash
npm run dev
\`\`\`
The application starts at `http://localhost:3000`.

### Step 3: Configure Gemini API Key
In Google AI Studio:
- The `GEMINI_API_KEY` is automatically injected via user secrets.
- In custom environments, copy `.env.example` to `.env` and set `GEMINI_API_KEY="your-api-key"`.

---

## 5. Deployment Instructions

### Cloud Run / Docker Deployment
1. Build the frontend and server:
   \`\`\`bash
   npm run build
   npm start
   \`\`\`
2. For Python standalone backend:
   \`\`\`bash
   cd backend_python
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000
   \`\`\`

---

## 6. GitHub Publishing Instructions
\`\`\`bash
git init
git add .
git commit -m "feat: initial commit of BidIntel AI Tender & RFP Intelligence Engine"
git branch -M main
git remote add origin https://github.com/YOUR_USER/bidintel-rfp-engine.git
git push -u origin main
\`\`\`
