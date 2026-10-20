"""
BidIntel - Python Document & Commercial Processing Engine
Modular engine for tender package ingestion, formula inspection, and cross-document reconciliation.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import re
import math


@dataclass
class Finding:
    finding_id: str
    file_name: str
    worksheet: str
    cell_ref: str
    category: str
    severity: str
    observed: str
    expected: str
    difference: Optional[float]
    explanation: str
    recommended_action: str


class CostSheetAuditor:
    """Audits spreadsheet rows, formula syntax, tax arithmetic, and cross-sheet totals."""

    @staticmethod
    def audit_formula_syntax(formula: str, cell_ref: str, sheet_name: str, file_name: str) -> Optional[Finding]:
        """Checks for formula errors such as #REF!, #DIV/0!, #VALUE!, #NAME?, and #N/A."""
        error_tokens = ["#REF!", "#DIV/0!", "#VALUE!", "#NAME?", "#N/A"]
        for err in error_tokens:
            if err in formula.upper():
                return Finding(
                    finding_id=f"ERR-{sheet_name}-{cell_ref}",
                    file_name=file_name,
                    worksheet=sheet_name,
                    cell_ref=cell_ref,
                    category="Formula Error",
                    severity="Critical",
                    observed=formula,
                    expected="Valid precedent references without formula tokens",
                    difference=None,
                    explanation=f"Detected critical error {err} in cell {cell_ref}.",
                    recommended_action=f"Reconstruct precedents in {sheet_name}!{cell_ref}."
                )
        return None

    @staticmethod
    def audit_sum_range_omission(
        formula: str,
        cell_row: int,
        cell_col: str,
        sheet_name: str,
        file_name: str,
        active_row_count: int
    ) -> Optional[Finding]:
        """Checks if a SUM(colX:colY) formula omits rows immediately above the subtotal."""
        match = re.search(r"SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)", formula.upper())
        if match:
            start_col, start_row, end_col, end_row = match.groups()
            if start_col == end_col:
                end_r = int(end_row)
                if active_row_count > end_r:
                    omitted_rows = active_row_count - end_r
                    return Finding(
                        finding_id=f"RANGE-{sheet_name}-{cell_col}{cell_row}",
                        file_name=file_name,
                        worksheet=sheet_name,
                        cell_ref=f"{cell_col}{cell_row}",
                        category="Broken Range / Row Omission",
                        severity="Critical",
                        observed=formula,
                        expected=f"SUM({start_col}{start_row}:{start_col}{active_row_count})",
                        difference=float(omitted_rows),
                        explanation=f"SUM formula stops at row {end_r}, omitting {omitted_rows} active row(s).",
                        recommended_action=f"Expand SUM range to row {active_row_count}."
                    )
        return None

    @staticmethod
    def audit_tax_arithmetic(
        base_amount: float,
        stated_rate_pct: float,
        stated_tax_amount: float,
        sheet_name: str,
        cell_ref: str,
        file_name: str
    ) -> Optional[Finding]:
        """Validates that stated tax amount matches base * rate% within 1.0 tolerance."""
        expected_tax = round((base_amount * stated_rate_pct) / 100.0, 2)
        diff = round(stated_tax_amount - expected_tax, 2)
        if abs(diff) > 1.0:
            return Finding(
                finding_id=f"TAX-{sheet_name}-{cell_ref}",
                file_name=file_name,
                worksheet=sheet_name,
                cell_ref=cell_ref,
                category="Tax Discrepancy",
                severity="Critical",
                observed=f"{stated_tax_amount:,.2f}",
                expected=f"{stated_rate_pct}% of {base_amount:,.2f} = {expected_tax:,.2f}",
                difference=diff,
                explanation=f"Tax variance of {diff:,.2f} between stated tax and calculated {stated_rate_pct}%.",
                recommended_action=f"Update formula in {sheet_name}!{cell_ref} to reflect statutory rate."
            )
        return None

    @staticmethod
    def audit_quantity_rate_product(
        qty: float,
        rate: float,
        stated_total: float,
        sheet_name: str,
        cell_ref: str,
        file_name: str
    ) -> Optional[Finding]:
        """Validates that Amount = Quantity * Unit Rate."""
        expected = round(qty * rate, 2)
        diff = round(stated_total - expected, 2)
        if abs(diff) > 0.05:
            return Finding(
                finding_id=f"PROD-{sheet_name}-{cell_ref}",
                file_name=file_name,
                worksheet=sheet_name,
                cell_ref=cell_ref,
                category="Arithmetic Mismatch",
                severity="High",
                observed=f"{stated_total:,.2f}",
                expected=f"{qty} * {rate:,.2f} = {expected:,.2f}",
                difference=diff,
                explanation=f"Stated product {stated_total:,.2f} differs from Quantity * Rate ({expected:,.2f}).",
                recommended_action=f"Set cell formula to product of quantity and rate."
            )
        return None


class CrossDocumentComparator:
    """Detects discrepancies between Scope of Work and Commercial sheets."""

    @staticmethod
    def compare_staffing_counts(
        sow_headcount: float,
        pricing_headcount: float,
        sow_doc: str,
        pricing_doc: str
    ) -> Optional[Dict[str, Any]]:
        """Identifies head count deficits between requirements and pricing."""
        if sow_headcount != pricing_headcount:
            deficit = sow_headcount - pricing_headcount
            return {
                "conflict_id": "CONFLICT-HEADCOUNT",
                "severity": "Critical",
                "issue": f"Staffing deficit: SoW requires {sow_headcount} FTE, but Cost Sheet provisions {pricing_headcount} FTE.",
                "source_a": {"doc": sow_doc, "val": f"{sow_headcount} FTE"},
                "source_b": {"doc": pricing_doc, "val": f"{pricing_headcount} FTE"},
                "headcount_deficit": deficit,
                "commercial_risk": f"Under-budgeting by {deficit} staff leaves bid non-compliant or creates margin erosion."
            }
        return None

    @staticmethod
    def compare_payment_terms(
        rfp_term_days: int,
        contract_term_days: int,
        rfp_doc: str,
        contract_doc: str
    ) -> Optional[Dict[str, Any]]:
        """Identifies payment term mismatches between RFP and Contract."""
        if rfp_term_days != contract_term_days:
            return {
                "conflict_id": "CONFLICT-PAYMENT-TERMS",
                "severity": "High",
                "issue": f"Payment terms mismatch: RFP specifies {rfp_term_days} days, whereas contract states {contract_term_days} days.",
                "source_a": {"doc": rfp_doc, "val": f"{rfp_term_days} calendar days"},
                "source_b": {"doc": contract_doc, "val": f"{contract_term_days} calendar days"},
                "working_capital_impact": "Discrepancy affects debtor days (DSO) and cash flow borrowing assumptions."
            }
        return None
