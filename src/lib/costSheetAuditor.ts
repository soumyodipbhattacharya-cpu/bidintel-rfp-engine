import * as XLSX from 'xlsx';
import { CostSheetFinding, SheetInfo } from '../types';

export interface WorkbookAuditResult {
  fileName: string;
  sheets: SheetInfo[];
  findings: CostSheetFinding[];
  summary: {
    totalSheets: number;
    hiddenSheetsCount: number;
    totalFormulas: number;
    formulaErrorsCount: number;
    missingMandatoryFields: number;
    arithmeticMismatches: number;
    gstTaxDiscrepancies: number;
    reconciliationMismatches: number;
    grandTotalCalculated?: number;
    grandTotalStated?: number;
  };
}

export function auditExcelWorkbook(
  workbook: XLSX.WorkBook,
  fileName: string,
  workspaceId: string
): WorkbookAuditResult {
  const findings: CostSheetFinding[] = [];
  const sheetInfos: SheetInfo[] = [];

  let totalFormulas = 0;
  let formulaErrorsCount = 0;
  let missingMandatoryFields = 0;
  let arithmeticMismatches = 0;
  let gstTaxDiscrepancies = 0;
  let reconciliationMismatches = 0;

  // 1. Workbook inspection: list every sheet and check hidden status
  workbook.SheetNames.forEach((sheetName, index) => {
    const isHidden = (workbook.Workbook?.Sheets?.[index] as any)?.Hidden === 1 ||
                     (workbook.Workbook?.Sheets?.[index] as any)?.Hidden === 2;
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet || !worksheet['!ref']) {
      sheetInfos.push({
        name: sheetName,
        isHidden,
        rowCount: 0,
        colCount: 0,
        hasFormulas: false,
        hasErrors: false,
        sampleHeaders: [],
      });
      return;
    }

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    let sheetFormulas = 0;
    let sheetErrors = 0;
    const headers: string[] = [];

    // Extract headers from first 3 rows
    for (let c = range.s.c; c <= Math.min(range.e.c, 25); c++) {
      for (let r = range.s.r; r <= Math.min(range.e.r, range.s.r + 2); r++) {
        const cell = worksheet[XLSX.utils.encode_cell({ r, c })];
        if (cell && cell.v && typeof cell.v === 'string') {
          headers.push(String(cell.v).trim());
          break;
        }
      }
    }

    // Inspect columns structure for pattern analysis
    const columnFormulas: Record<number, { row: number; formula: string; val: any }[]> = {};
    const columnValues: Record<number, { row: number; val: any; formula?: string }[]> = {};

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (!cell) continue;

        if (cell.f) {
          sheetFormulas++;
          totalFormulas++;
          if (!columnFormulas[C]) columnFormulas[C] = [];
          columnFormulas[C].push({ row: R, formula: cell.f, val: cell.v });
        }

        if (!columnValues[C]) columnValues[C] = [];
        columnValues[C].push({ row: R, val: cell.v, formula: cell.f });

        // Detect formula errors
        const strVal = String(cell.w || cell.v || '');
        if (
          strVal.includes('#REF!') ||
          strVal.includes('#DIV/0!') ||
          strVal.includes('#VALUE!') ||
          strVal.includes('#NAME?') ||
          strVal.includes('#N/A') ||
          (cell.f && (cell.f.includes('#REF!') || cell.f.includes('#DIV/0!')))
        ) {
          sheetErrors++;
          formulaErrorsCount++;
          findings.push({
            id: `audit-${fileName}-${sheetName}-${cellAddress}-err`,
            workspaceId,
            fileName,
            worksheet: sheetName,
            cellOrRange: cellAddress,
            checkCategory: 'Formula Error',
            severity: 'Critical',
            observedValueOrFormula: cell.f ? `=${cell.f} (${strVal})` : strVal,
            expectedCalculationOrRule: 'Valid formula without broken references or calculation errors',
            explanation: `Formula error ${strVal} detected in cell ${cellAddress}. This indicates a broken reference, deleted cell/row, or invalid calculation.`,
            recommendedAction: `Inspect precedent cells and reconstruct reference in ${sheetName}!${cellAddress}.`,
            evidenceReference: `${sheetName}!${cellAddress}`,
            reviewerStatus: 'Unreviewed',
          });
        }
      }
    }

    // Audit 2: Detect hardcoded values or blanks inside predominantly calculated columns
    Object.entries(columnFormulas).forEach(([colIndexStr, formulas]) => {
      const colIndex = Number(colIndexStr);
      if (formulas.length >= 3) {
        const rowsWithFormulas = new Set(formulas.map((f) => f.row));
        const minRow = Math.min(...formulas.map((f) => f.row));
        const maxRow = Math.max(...formulas.map((f) => f.row));

        for (let r = minRow; r <= maxRow; r++) {
          const cellAddr = XLSX.utils.encode_cell({ r, c: colIndex });
          const cell = worksheet[cellAddr];

          // Check if row has data in adjacent column (e.g., description or item exists)
          const adjacentCell = worksheet[XLSX.utils.encode_cell({ r, c: colIndex > 0 ? colIndex - 1 : colIndex + 1 })];
          const hasRowContext = adjacentCell && adjacentCell.v !== undefined && adjacentCell.v !== '';

          if (!rowsWithFormulas.has(r) && hasRowContext) {
            if (!cell || cell.v === undefined || cell.v === '') {
              findings.push({
                id: `audit-${fileName}-${sheetName}-${cellAddr}-blank-formula`,
                workspaceId,
                fileName,
                worksheet: sheetName,
                cellOrRange: cellAddr,
                checkCategory: 'Broken Range / Row Omission',
                severity: 'High',
                observedValueOrFormula: '[BLANK]',
                expectedCalculationOrRule: `Consistent formula pattern in Column ${XLSX.utils.encode_col(colIndex)}`,
                explanation: `Cell is blank in a row that contains item data, while preceding and succeeding rows have formulas. This omission causes undercounting.`,
                recommendedAction: `Propagate formula from row ${r - 1} or row ${r + 1} to maintain continuous calculation.`,
                evidenceReference: `${sheetName}!${cellAddr}`,
                reviewerStatus: 'Unreviewed',
              });
            } else if (!cell.f && typeof cell.v === 'number') {
              findings.push({
                id: `audit-${fileName}-${sheetName}-${cellAddr}-hardcoded`,
                workspaceId,
                fileName,
                worksheet: sheetName,
                cellOrRange: cellAddr,
                checkCategory: 'Hardcoded Over Formula',
                severity: 'Medium',
                observedValueOrFormula: String(cell.v),
                expectedCalculationOrRule: `Formula calculation matching column pattern`,
                explanation: `Cell contains a hardcoded constant (${cell.v}) instead of a dynamic calculation formula like neighboring rows. Risk of stale values when inputs change.`,
                recommendedAction: `Verify whether this is an intentional manual override or replace with standard formula.`,
                evidenceReference: `${sheetName}!${cellAddr}`,
                reviewerStatus: 'Unreviewed',
              });
            }
          }
        }
      }
    });

    // Audit 3: Scan for SUM formula range omissions (e.g. SUM(F5:F15) while table runs F5:F20)
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddr];
        if (cell && cell.f && typeof cell.f === 'string' && cell.f.toUpperCase().includes('SUM(')) {
          const match = cell.f.toUpperCase().match(/SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/);
          if (match) {
            const [, startCol, startRowStr, endCol, endRowStr] = match;
            if (startCol === endCol) {
              const sumEndRow = parseInt(endRowStr, 10);
              const formulaRow = R + 1; // 1-indexed
              // If the sum ends well before the subtotal row and intermediate rows have numbers
              if (formulaRow - sumEndRow > 1) {
                let omittedCount = 0;
                for (let checkRow = sumEndRow + 1; checkRow < formulaRow; checkRow++) {
                  const checkAddr = `${startCol}${checkRow}`;
                  const omittedCell = worksheet[checkAddr];
                  if (omittedCell && typeof omittedCell.v === 'number' && omittedCell.v !== 0) {
                    omittedCount++;
                  }
                }
                if (omittedCount > 0) {
                  findings.push({
                    id: `audit-${fileName}-${sheetName}-${cellAddr}-sum-omission`,
                    workspaceId,
                    fileName,
                    worksheet: sheetName,
                    cellOrRange: cellAddr,
                    checkCategory: 'Broken Range / Row Omission',
                    severity: 'Critical',
                    observedValueOrFormula: `=${cell.f}`,
                    expectedCalculationOrRule: `SUM(${startCol}${startRowStr}:${startCol}${formulaRow - 1})`,
                    explanation: `Formula sums up to row ${sumEndRow}, omitting ${omittedCount} active numerical row(s) immediately above the subtotal.`,
                    recommendedAction: `Expand SUM range to include all active line items up to row ${formulaRow - 1}.`,
                    evidenceReference: `${sheetName}!${cellAddr}`,
                    reviewerStatus: 'Unreviewed',
                  });
                }
              }
            }
          }
        }
      }
    }

    // Audit 4: Arithmetic validation (Quantity * Rate = Amount, Monthly * 12 = Annual, etc.)
    // We look for rows with: [Description/Role, Quantity, Unit Rate, Amount/Total]
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const rowCells: { col: number; val: any; f?: string }[] = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell) rowCells.push({ col: C, val: cell.v, f: cell.f });
      }

      // Check for quantity, rate, amount patterns
      const numCells = rowCells.filter((c) => typeof c.val === 'number');
      if (numCells.length >= 2) {
        for (let i = 0; i < numCells.length - 2; i++) {
          const qty = numCells[i].val;
          const rate = numCells[i + 1].val;
          const statedAmount = numCells[i + 2].val;

          if (qty > 0 && rate > 0 && typeof statedAmount === 'number') {
            const expectedAmount = Math.round(qty * rate * 100) / 100;
            const diff = Math.abs(statedAmount - expectedAmount);
            if (diff > 1.0) {
              const qtyAddr = XLSX.utils.encode_cell({ r: R, c: numCells[i].col });
              const rateAddr = XLSX.utils.encode_cell({ r: R, c: numCells[i + 1].col });
              const amtAddr = XLSX.utils.encode_cell({ r: R, c: numCells[i + 2].col });

              arithmeticMismatches++;
              findings.push({
                id: `audit-${fileName}-${sheetName}-${amtAddr}-arithmetic`,
                workspaceId,
                fileName,
                worksheet: sheetName,
                cellOrRange: amtAddr,
                checkCategory: 'Arithmetic Mismatch',
                severity: 'High',
                observedValueOrFormula: String(statedAmount),
                expectedCalculationOrRule: `${qtyAddr} (${qty}) × ${rateAddr} (${rate}) = ${expectedAmount.toLocaleString()}`,
                difference: Math.round((statedAmount - expectedAmount) * 100) / 100,
                explanation: `Multiplication mismatch: Stated amount ${statedAmount} differs from Quantity (${qty}) × Rate (${rate}) = ${expectedAmount}. Discrepancy is ${Math.round((statedAmount - expectedAmount) * 100) / 100}.`,
                recommendedAction: `Update cell formula to multiply ${qtyAddr} by ${rateAddr}.`,
                evidenceReference: `${sheetName}!${amtAddr}`,
                reviewerStatus: 'Unreviewed',
              });
              break;
            }
          }
        }
      }

      // Audit 5: Missing mandatory unit rate where item and quantity exist
      const textCell = rowCells.find((c) => typeof c.val === 'string' && c.val.trim().length > 3);
      if (textCell) {
        const textLower = String(textCell.val).toLowerCase();
        const isHeaderOrTotal =
          textLower.includes('total') ||
          textLower.includes('subtotal') ||
          textLower.includes('summary') ||
          textLower.includes('tax') ||
          textLower.includes('gst');

        if (!isHeaderOrTotal && numCells.length > 0) {
          // Check if rate column appears to be 0 or empty
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = worksheet[cellAddr];
            const colHeader = headers[C] ? headers[C].toLowerCase() : '';
            if (colHeader.includes('rate') || colHeader.includes('unit price') || colHeader.includes('wage')) {
              if (!cell || cell.v === undefined || cell.v === null || cell.v === 0 || cell.v === '') {
                missingMandatoryFields++;
                findings.push({
                  id: `audit-${fileName}-${sheetName}-${cellAddr}-missing-rate`,
                  workspaceId,
                  fileName,
                  worksheet: sheetName,
                  cellOrRange: cellAddr,
                  checkCategory: 'Missing Mandatory Rate',
                  severity: 'Critical',
                  observedValueOrFormula: cell ? String(cell.v) : '[EMPTY]',
                  expectedCalculationOrRule: 'Non-zero mandatory unit rate required by tender pricing schedule',
                  explanation: `Mandatory unit rate is unpopulated for item "${textCell.val}". Submitting a blank or zero unit rate risks commercial disqualification.`,
                  recommendedAction: `Provide quoted commercial rate in ${sheetName}!${cellAddr}.`,
                  evidenceReference: `${sheetName}!${cellAddr}`,
                  reviewerStatus: 'Unreviewed',
                });
              }
            }
          }
        }
      }
    }

    // Audit 6: GST & Tax Calculation Validation
    // Scan for GST / CGST / SGST / IGST rows
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && typeof cell.v === 'string') {
          const label = cell.v.toLowerCase();
          if (
            label.includes('gst') ||
            label.includes('cgst') ||
            label.includes('sgst') ||
            label.includes('igst') ||
            label.includes('sales tax') ||
            label.includes('vat')
          ) {
            // Find rate and tax amount in neighboring cells
            let foundRate: number | null = null;
            let foundTaxAmount: number | null = null;
            let taxAmtCellAddr = '';

            // Check rate from text label (e.g., "GST @ 18%")
            const rateMatch = label.match(/(\d+(\.\d+)?)%/);
            if (rateMatch) {
              foundRate = parseFloat(rateMatch[1]);
            }

            for (let cCheck = C + 1; cCheck <= Math.min(C + 6, range.e.c); cCheck++) {
              const testCell = worksheet[XLSX.utils.encode_cell({ r: R, c: cCheck })];
              if (testCell && typeof testCell.v === 'number') {
                if (testCell.v <= 0.35 && foundRate === null) {
                  // Percentage stored as decimal, e.g. 0.18
                  foundRate = testCell.v * 100;
                } else if (testCell.v > 1) {
                  foundTaxAmount = testCell.v;
                  taxAmtCellAddr = XLSX.utils.encode_cell({ r: R, c: cCheck });
                }
              }
            }

            // Find subtotal above this row
            let candidateBase: number | null = null;
            for (let rCheck = R - 1; rCheck >= Math.max(range.s.r, R - 5); rCheck--) {
              for (let cCheck = range.s.c; cCheck <= range.e.c; cCheck++) {
                const subCell = worksheet[XLSX.utils.encode_cell({ r: rCheck, c: cCheck })];
                if (subCell && typeof subCell.v === 'number' && subCell.v > 100) {
                  candidateBase = subCell.v;
                  break;
                }
              }
              if (candidateBase !== null) break;
            }

            if (foundRate !== null && candidateBase !== null && foundTaxAmount !== null) {
              const expectedTax = Math.round((candidateBase * foundRate) / 100 * 100) / 100;
              const taxDiff = Math.abs(foundTaxAmount - expectedTax);

              if (taxDiff > 5.0) {
                gstTaxDiscrepancies++;
                findings.push({
                  id: `audit-${fileName}-${sheetName}-${taxAmtCellAddr}-gst-tax`,
                  workspaceId,
                  fileName,
                  worksheet: sheetName,
                  cellOrRange: taxAmtCellAddr || XLSX.utils.encode_cell({ r: R, c: C }),
                  checkCategory: 'Tax Discrepancy',
                  severity: 'Critical',
                  observedValueOrFormula: String(foundTaxAmount),
                  expectedCalculationOrRule: `${foundRate}% of Base (${candidateBase.toLocaleString()}) = ${expectedTax.toLocaleString()}`,
                  difference: Math.round((foundTaxAmount - expectedTax) * 100) / 100,
                  explanation: `Stated tax amount (${foundTaxAmount.toLocaleString()}) does not match the stated rate of ${foundRate}% on the subtotal base (${candidateBase.toLocaleString()}). Expected tax is ${expectedTax.toLocaleString()}.`,
                  recommendedAction: `Recompute tax using the exact statutory formula and check whether tax is applied on inclusive or exclusive base.`,
                  evidenceReference: `${sheetName}!${taxAmtCellAddr}`,
                  reviewerStatus: 'Unreviewed',
                });
              }
            }
          }
        }
      }
    }

    sheetInfos.push({
      name: sheetName,
      isHidden,
      rowCount: range.e.r - range.s.r + 1,
      colCount: range.e.c - range.s.c + 1,
      hasFormulas: sheetFormulas > 0,
      hasErrors: sheetErrors > 0,
      sampleHeaders: headers.slice(0, 8),
    });
  });

  // Audit 7: Cross-Sheet Reconciliation
  // If there is a 'Summary' sheet and detailed sheets (e.g. 'Manpower', 'Consumables'), verify totals match
  const summarySheet = workbook.Sheets['Summary'] || workbook.Sheets['Commercial_Summary'] || workbook.Sheets['Grand_Total'];
  if (summarySheet && summarySheet['!ref']) {
    const summaryRange = XLSX.utils.decode_range(summarySheet['!ref']);
    for (const otherSheetName of workbook.SheetNames) {
      if (otherSheetName === 'Summary' || otherSheetName === 'Commercial_Summary') continue;
      const otherWs = workbook.Sheets[otherSheetName];
      if (!otherWs || !otherWs['!ref']) continue;

      // Find total in otherSheet
      let otherTotal: number | null = null;
      let otherCellAddr = '';
      const otherRange = XLSX.utils.decode_range(otherWs['!ref']);
      for (let r = otherRange.e.r; r >= Math.max(otherRange.s.r, otherRange.e.r - 5); r--) {
        for (let c = otherRange.e.c; c >= otherRange.s.c; c--) {
          const cObj = otherWs[XLSX.utils.encode_cell({ r, c })];
          if (cObj && typeof cObj.v === 'number' && cObj.v > 100) {
            otherTotal = cObj.v;
            otherCellAddr = XLSX.utils.encode_cell({ r, c });
            break;
          }
        }
        if (otherTotal !== null) break;
      }

      // Check if Summary mentions otherSheetName
      for (let sr = summaryRange.s.r; sr <= summaryRange.e.r; sr++) {
        for (let sc = summaryRange.s.c; sc <= summaryRange.e.c; sc++) {
          const sCell = summarySheet[XLSX.utils.encode_cell({ r: sr, c: sc })];
          if (
            sCell &&
            typeof sCell.v === 'string' &&
            sCell.v.toLowerCase().includes(otherSheetName.toLowerCase().replace(/_/g, ' '))
          ) {
            // Check value in the adjacent numeric column
            for (let valCol = sc + 1; valCol <= summaryRange.e.c; valCol++) {
              const valCell = summarySheet[XLSX.utils.encode_cell({ r: sr, c: valCol })];
              if (valCell && typeof valCell.v === 'number') {
                const diff = Math.abs(valCell.v - (otherTotal || 0));
                if (diff > 5 && otherTotal !== null) {
                  reconciliationMismatches++;
                  const sumCellAddr = XLSX.utils.encode_cell({ r: sr, c: valCol });
                  findings.push({
                    id: `audit-${fileName}-reconcile-${otherSheetName}`,
                    workspaceId,
                    fileName,
                    worksheet: 'Summary',
                    cellOrRange: sumCellAddr,
                    checkCategory: 'Cross-Sheet Reconciliation',
                    severity: 'High',
                    observedValueOrFormula: String(valCell.v),
                    expectedCalculationOrRule: `${otherSheetName}!${otherCellAddr} (${otherTotal.toLocaleString()})`,
                    difference: Math.round((valCell.v - otherTotal) * 100) / 100,
                    explanation: `Summary line item for "${otherSheetName}" (${valCell.v.toLocaleString()}) does not reconcile with the total in worksheet ${otherSheetName}!${otherCellAddr} (${otherTotal.toLocaleString()}).`,
                    recommendedAction: `Link Summary sheet cell directly to ${otherSheetName}!${otherCellAddr} formula.`,
                    evidenceReference: `Summary!${sumCellAddr} vs ${otherSheetName}!${otherCellAddr}`,
                    reviewerStatus: 'Unreviewed',
                  });
                }
                break;
              }
            }
          }
        }
      }
    }
  }

  const hiddenSheetsCount = sheetInfos.filter((s) => s.isHidden).length;

  return {
    fileName,
    sheets: sheetInfos,
    findings,
    summary: {
      totalSheets: sheetInfos.length,
      hiddenSheetsCount,
      totalFormulas,
      formulaErrorsCount,
      missingMandatoryFields,
      arithmeticMismatches,
      gstTaxDiscrepancies,
      reconciliationMismatches,
    },
  };
}
