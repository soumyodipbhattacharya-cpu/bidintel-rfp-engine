import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize Google GenAI SDK:', err);
  }
}

// Health endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    hasGeminiApiKey: !!apiKey,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// AI Requirement Extraction Endpoint
app.post('/api/ai/analyze-document', async (req: Request, res: Response) => {
  try {
    const { fileName, documentType, textSnippet, workspaceContext } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: true,
        isAiPowered: false,
        message: 'Gemini API Key not present in environment; falling back to heuristic engine.',
        requirements: [],
      });
    }

    const prompt = `You are a world-class tender and bid-management analyst specializing in corporate services and facilities management.
Analyze the following text extracted from document "${fileName}" (Category: "${documentType}").
Context: Tender "${workspaceContext?.name || 'Tender'}", Client "${workspaceContext?.client || 'Client'}".

Extract all actionable compliance requirements, operational deliverables, staffing mandates, financial terms, or risk clauses.
RULES:
1. NEVER invent page numbers, clause numbers, or quotation text. If unknown, use "Not available".
2. Categorize each requirement into one of:
   - Scope and Services
   - Operations and Service Delivery
   - Manpower and Deployment
   - Service Levels and KPIs
   - Compliance and Certifications
   - Health, Safety and Training
   - Commercial and Billing
   - Pricing and Costing
   - Legal and Contractual
   - Insurance and Liability
   - Penalties and Service Credits
   - Data Protection and Confidentiality
   - Mobilisation and Transition
   - Technology and Equipment
   - Timelines and Submission
   - Reporting and Governance
   - Other Requirements
3. Identify risk level: Critical, High, Medium, or Low.
4. If ambiguous or conflicting, indicate clarificationRequired = true and draft a professional clarification question.

Document text:
${String(textSnippet).slice(0, 8000)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pageOrSection: { type: Type.STRING },
              tableRowCellRef: { type: Type.STRING },
              requirementCategory: { type: Type.STRING },
              originalText: { type: Type.STRING },
              aiInterpretation: { type: Type.STRING },
              riskLevel: { type: Type.STRING },
              classification: { type: Type.STRING },
              clarificationRequired: { type: Type.BOOLEAN },
              suggestedClarificationQuestion: { type: Type.STRING },
              responsibleOwner: { type: Type.STRING },
              evidenceCitation: { type: Type.STRING },
            },
            required: [
              'requirementCategory',
              'originalText',
              'aiInterpretation',
              'riskLevel',
              'classification',
              'clarificationRequired',
            ],
          },
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '[]');
    return res.json({
      success: true,
      isAiPowered: true,
      requirements: parsedJson,
    });
  } catch (error: any) {
    console.error('AI Document analysis error:', error);
    return res.status(200).json({
      success: false,
      isAiPowered: false,
      error: error.message || 'Error processing AI document extraction',
      requirements: [],
    });
  }
});

// AI Cross-Document Conflict Detection Endpoint
app.post('/api/ai/cross-document-check', async (req: Request, res: Response) => {
  try {
    const { documents, existingRequirements } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: true,
        isAiPowered: false,
        message: 'Gemini API Key not present; returning heuristic cross-document findings.',
        conflicts: [],
      });
    }

    const prompt = `You are a senior contractual and financial bid consultant.
Perform a cross-document inconsistency and conflict audit across the following tender documents and requirements.
Examine:
- Contract start/submission dates vs RFP deadlines
- Manpower staffing counts in Scope of Work vs Commercial Cost Sheet rows
- Missing equipment in pricing that is mandated in the SoW
- Payment term discrepancies (e.g. 30 days vs 60 days)
- Insurance liability mismatch
- Missing annexures mentioned in text

Do NOT invent citations. Compare the sources with exact quotes.

Tender Data:
${JSON.stringify({ documents: documents?.slice(0, 5), requirements: existingRequirements?.slice(0, 15) }, null, 2).slice(0, 9000)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              issueTitle: { type: Type.STRING },
              issueDescription: { type: Type.STRING },
              sourceA_fileName: { type: Type.STRING },
              sourceA_ref: { type: Type.STRING },
              sourceA_text: { type: Type.STRING },
              sourceB_fileName: { type: Type.STRING },
              sourceB_ref: { type: Type.STRING },
              sourceB_text: { type: Type.STRING },
              conflictReason: { type: Type.STRING },
              severity: { type: Type.STRING },
              confidence: { type: Type.STRING },
              precedenceApplied: { type: Type.STRING },
              suggestedClarificationQuestion: { type: Type.STRING },
            },
            required: [
              'issueTitle',
              'issueDescription',
              'conflictReason',
              'severity',
              'suggestedClarificationQuestion',
            ],
          },
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '[]');
    return res.json({
      success: true,
      isAiPowered: true,
      conflicts: parsedJson,
    });
  } catch (error: any) {
    console.error('Cross-document check error:', error);
    return res.status(200).json({
      success: false,
      isAiPowered: false,
      error: error.message,
      conflicts: [],
    });
  }
});

// AI Clarification Generator Endpoint
app.post('/api/ai/generate-clarifications', async (req: Request, res: Response) => {
  try {
    const { itemsToClarify } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: true,
        isAiPowered: false,
        questions: [],
      });
    }

    const prompt = `You are a master bid director drafting formal tender clarification questions to the Authority.
Draft rigorous, professional, polite clarification questions for the following tender ambiguities or conflicts:
${JSON.stringify(itemsToClarify).slice(0, 8000)}

Group into: Scope, Operations, Compliance, Commercial, Legal, Timeline, Manpower, Technology and Equipment.
Specify whether each question is MANDATORY before submission to protect commercial margins or legal compliance.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              questionText: { type: Type.STRING },
              businessReason: { type: Type.STRING },
              sourceDocument: { type: Type.STRING },
              exactReference: { type: Type.STRING },
              priority: { type: Type.STRING },
              isMandatoryBeforeSubmission: { type: Type.BOOLEAN },
              suggestedRecipient: { type: Type.STRING },
            },
            required: ['category', 'questionText', 'businessReason', 'priority', 'isMandatoryBeforeSubmission'],
          },
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '[]');
    return res.json({
      success: true,
      isAiPowered: true,
      questions: parsedJson,
    });
  } catch (error: any) {
    console.error('Clarification generation error:', error);
    return res.status(200).json({
      success: false,
      isAiPowered: false,
      error: error.message,
      questions: [],
    });
  }
});

// Serve frontend with Vite in dev, static in production
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BidIntel Server running on port ${PORT} [production=${isProduction}]`);
    console.log(`Gemini API configured: ${!!apiKey}`);
  });
}

startServer();
