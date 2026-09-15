# MRE Clearance Calculators

Offline/online browser-based utility design calculators. The repository includes the Delta Clearance Calculator in three themes, a UGI Sag & Pole Depth Calculator, and a Feet & Inches Calculator.

## Open the calculators online

GitHub Pages site:

```text
https://AZX-215.github.io/mre-clearance-calculators/
```

### Delta Clearance Calculator

Available themes:

- Blue: `blue.html`
- Grey: `grey.html`
- Light: `light.html`

### UGI Sag & Pole Depth Calculator

- `ugi-resag.html`

Calculate resag height from the UGI sag chart and pole height above ground from the UGI pole-depth chart.

### Feet & Inches Calculator

- `feet-inches.html`

Use up to 8 calculators for:

- Decimal feet/inches conversion
- Addition and subtraction
- Multiplication and division by a factor
- Linking one calculator result into another calculator
- Locking a result so it can be reused while inputs continue changing

## Use the calculators offline

Download or clone the repository, then open `index.html` in a browser.

You can also open any calculator directly:

- `blue.html`
- `grey.html`
- `light.html`
- `ugi-resag.html`
- `feet-inches.html`

No internet connection is required after the repository files are stored on your computer. The calculators use only local HTML, CSS, and JavaScript and do not depend on external scripts or services.

## Google Drive / OneDrive use

You can keep the repository folder in Google Drive for Desktop, OneDrive, Dropbox, or another synced folder. Open the HTML files from File Explorer so they run locally in your browser.

Opening an HTML file directly from the Google Drive website may show a preview or download prompt instead of running it as a normal webpage. Use GitHub Pages for browser-based online access.

## Delta calculator features

- 1, 2, or 3 calculators visible at once
- Ruling span helper
- Conductor / table selection
- Actual span input
- Ruling span table selection
- Calculated raw clearance
- 5 ft 0 in minimum when applicable
- Suggested comm-primary distance rounded up to the next whole inch
- Warnings when a value is outside the selected table range
- Local browser saving for recent inputs and settings

## UGI calculator features

- Triplex and bare-wire conductor selections
- Actual-span interpolation between surrounding chart values
- Estimated sag for red over-limit spans through 290 ft
- Sag rounded to the nearest whole inch
- Maximum resag attachment height calculation
- Supports one or both pole attachment heights
- UGI sag chart reference
- Pole length and ground-type selection
- Required setting depth
- Pole height above ground
- UGI pole-depth chart reference

## Feet & Inches calculator features

- 1 through 8 calculators visible at once
- Responsive calculator cards that reflow with the available screen width
- Decimal feet and inches input
- Feet/inches conversion
- Add and subtract measurements
- Multiply or divide by a decimal factor
- Use another calculator's result as Measurement A or Measurement B
- Use a linked result's decimal-feet value as the factor for multiply/divide
- Lock a result to freeze it for reuse by other calculators
- Circular-reference prevention for linked calculators
- Clear one calculator or clear all calculators
- Local browser saving for calculator count, values, operations, links, and locked results

## Notes

- The Delta suggested distance is rounded up to the next whole inch after any 5 ft 0 in minimum is applied.
- Treat Delta warnings or extrapolated values as check items and verify before final design use.
- Red UGI sag values are calculated estimates beyond the acceptable span length, not listed UGI chart values.
- All calculations run entirely in the browser. No entered data is sent anywhere.
