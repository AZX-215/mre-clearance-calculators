# Mon Power proposed midspan calculator

## Scope

Add `mon-power-midspan.html` as a separate calculator linked from the landing page, using the existing light colors, local HTML/CSS/JavaScript, 1–100 independent cards (two initially), and local browser saving. No examples or explanatory panels. Preserve the other calculators.

Export all completed calculations to a downloaded Markdown file, including completed hidden cards. Include current inputs, intermediate values, method, and final result. Omit blank/incomplete/invalid results, report skipped populated calculators in the page status, and escape user-entered labels as text. Preserve the original storage key so earlier inputs migrate to 100 slots. Build cards as their count is increased rather than rendering 100 on initial load.

## Formula review

Source: supplied Proposed Midspan Calculator template dated 7/23/2026, visible TEMPLATE sheet, D3 and F3 (shared down their columns). The supplied completed workbook has six populated job rows, 4–9, used as regression cases. Do not commit the source workbooks or job identifiers.

- Convert both proposed pole attachment heights to inches.
- Round their average to a whole inch, matching spreadsheet ROUND.
- Subtract span length × 12 × 0.005 below 300 feet; use 0.01 at and above 300 feet.
- Round the resulting height to a whole inch, again matching ROUND. Do not combine these two rounding steps.
- The visible G1 note supplies a separate existing-comm method: existing comm midspan height + 4 inches. This is not an ice-load result; do not apply the percentage deduction to it.
- The hidden sheet contains obsolete broken references and is not a dependency of the visible formulas.

Implementation choices: round fractional span lengths up to whole feet before selecting the rate, display the used length, accept decimal inches without prematurely truncating calculation inputs, display all height outputs in whole inches. Empty inputs show no result. Reject invalid values and calculated heights below ground. Keep the necessary limitation next to the percentage method: neutral sag and elevation are not included. The existing-comm method carries no separate ice-load claim.

## Implementation and verification

1. Test the visible spreadsheet results, intermediate rounding, 299/300/301-foot boundary, decimal span normalization, incomplete/invalid values, and existing comm +4-inch method. Run failing tests before implementing the math module.
2. Build accessible independent calculator cards, a calculator-count selector, method-specific inputs, clear controls, and saving/restoration that retains hidden cards. Add a separate landing-page entry.
3. Run the whole Node test suite, check JavaScript syntax, exercise the page in a browser where available, and review the diff for unrelated changes. Push a feature branch and create a reviewable pull request.
