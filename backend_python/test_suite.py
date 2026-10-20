"""
Unit Test Suite for BidIntel Tender & RFP Intelligence Engine
Tests extraction rules, formula syntax checks, tax reconciliations, and cross-document validation.
"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from document_processor import CostSheetAuditor, CrossDocumentComparator


class TestCostSheetAuditor(unittest.TestCase):

    def test_formula_ref_error_detected(self):
        finding = CostSheetAuditor.audit_formula_syntax(
            formula="=#REF!*D10",
            cell_ref="F19",
            sheet_name="Manpower_Costing",
            file_name="Commercial_Pricing_Template_MTA_2026.xlsx"
        )
        self.assertIsNotNone(finding)
        self.assertEqual(finding.category, "Formula Error")
        self.assertEqual(finding.severity, "Critical")
        self.assertIn("#REF!", finding.explanation)

    def test_formula_div_zero_error_detected(self):
        finding = CostSheetAuditor.audit_formula_syntax(
            formula="=C15/#DIV/0!",
            cell_ref="G22",
            sheet_name="Summary",
            file_name="Commercial_Pricing.xlsx"
        )
        self.assertIsNotNone(finding)
        self.assertEqual(finding.severity, "Critical")

    def test_clean_formula_passes(self):
        finding = CostSheetAuditor.audit_formula_syntax(
            formula="=SUM(C4:C20)",
            cell_ref="C21",
            sheet_name="Manpower_Costing",
            file_name="Pricing.xlsx"
        )
        self.assertIsNone(finding)

    def test_sum_range_omission_detected(self):
        # Formula sums rows 5 to 20, but active rows run up to row 26
        finding = CostSheetAuditor.audit_sum_range_omission(
            formula="=SUM(F5:F20)",
            cell_row=28,
            cell_col="F",
            sheet_name="Manpower_Costing",
            file_name="Commercial_Pricing.xlsx",
            active_row_count=26
        )
        self.assertIsNotNone(finding)
        self.assertEqual(finding.category, "Broken Range / Row Omission")
        self.assertEqual(finding.difference, 6.0)  # 6 omitted rows (21 to 26)

    def test_tax_arithmetic_discrepancy(self):
        # Base: 2,400,000, 20% tax should be 480,000, but stated is 380,000 (100k mismatch!)
        finding = CostSheetAuditor.audit_tax_arithmetic(
            base_amount=2400000.0,
            stated_rate_pct=20.0,
            stated_tax_amount=380000.0,
            sheet_name="Summary",
            cell_ref="D18",
            file_name="Commercial_Pricing_Template_MTA_2026.xlsx"
        )
        self.assertIsNotNone(finding)
        self.assertEqual(finding.category, "Tax Discrepancy")
        self.assertAlmostEqual(finding.difference, -100000.0)

    def test_tax_arithmetic_valid(self):
        finding = CostSheetAuditor.audit_tax_arithmetic(
            base_amount=100000.0,
            stated_rate_pct=20.0,
            stated_tax_amount=20000.0,
            sheet_name="Summary",
            cell_ref="D18",
            file_name="Commercial_Pricing.xlsx"
        )
        self.assertIsNone(finding)

    def test_quantity_rate_mismatch(self):
        # 15 * 2200 = 33000, but stated is 30000 (3,000 error)
        finding = CostSheetAuditor.audit_quantity_rate_product(
            qty=15,
            rate=2200,
            stated_total=30000,
            sheet_name="Manpower_Costing",
            cell_ref="E11",
            file_name="Pricing.xlsx"
        )
        self.assertIsNotNone(finding)
        self.assertEqual(finding.category, "Arithmetic Mismatch")
        self.assertEqual(finding.difference, -3000.0)


class TestCrossDocumentComparator(unittest.TestCase):

    def test_staffing_deficit_detected(self):
        # SoW requires 45 FTEs, pricing provisions 40 FTEs
        conflict = CrossDocumentComparator.compare_staffing_counts(
            sow_headcount=45,
            pricing_headcount=40,
            sow_doc="Statement_of_Work_MTA_Security_v2.docx",
            pricing_doc="Commercial_Pricing_Template_MTA_2026.xlsx"
        )
        self.assertIsNotNone(conflict)
        self.assertEqual(conflict["severity"], "Critical")
        self.assertEqual(conflict["headcount_deficit"], 5)
        self.assertIn("Staffing deficit", conflict["issue"])

    def test_payment_terms_conflict_detected(self):
        conflict = CrossDocumentComparator.compare_payment_terms(
            rfp_term_days=30,
            contract_term_days=60,
            rfp_doc="RFP_MTA_SecOps_2026_Main_Invitation.pdf",
            contract_doc="Master_Service_Agreement_Draft_Contract.docx"
        )
        self.assertIsNotNone(conflict)
        self.assertEqual(conflict["severity"], "High")
        self.assertIn("30 days", conflict["issue"])
        self.assertIn("60 days", conflict["issue"])


if __name__ == "__main__":
    unittest.main()
