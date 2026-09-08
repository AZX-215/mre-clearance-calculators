# MRE Clearance Calculators

Offline/online browser-based utility design calculators. The repository includes the Delta Clearance Calculator in three themes, a UGI Sag / Resag Calculator, and a Feet & Inches Calculator.

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

### UGI Sag / Resag Calculator

- `ugi-resag.html`

Select a conductor and actual span, enter the secondary attachment height at each pole, and calculate the maximum resag attachment height. Sag is interpolated between surrounding chart values and rounded to the nearest whole inch.

### Feet & Inches Calculator

- `feet-inches.html`

Use 1, 2, or 3 independent calculators for:

- Feet/inches conversion
- Addition and subtraction
- Multiplication and division by a factor
- Fractional-inch input
- Configurable rounding from 1/2 in through 1/64 in

## Use the calculators offline

Download or clone the repository, then open `index.html` in a browser.

You can also open any calculator directly:

- `blue.html`
- `grey.html`
- `light.html`
- `ugi-resag.html`
- `feet-inches.html`

No internet connection is required after the files are stored on your computer. The calculators are self-contained HTML, CSS, and JavaScript files and do not depend on external scripts or services.

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
- Sag rounded to the nearest whole inch
- Pole 1 and Pole 2 secondary attachment height inputs
- Automatic identification of the lower controlling attachment
- Maximum resag attachment height calculation
- Full UGI sag chart reference table
- No extrapolation beyond the listed span range

## Feet & Inches calculator features

- 1, 2, or 3 calculators visible at once
- Independent inputs and results for each calculator
- Feet/inches conversion
- Add and subtract measurements
- Multiply or divide by a factor
- Decimal, fractional, and mixed-fraction inch input
- Rounding to 1/2, 1/4, 1/8, 1/16, 1/32, or 1/64 inch
- Local saving of the selected calculator count

## Notes

- The Delta suggested distance is rounded up to the next whole inch after any 5 ft 0 in minimum is applied.
- Treat Delta warnings or extrapolated values as check items and verify before final design use.
- All calculations run entirely in the browser. No entered data is sent anywhere.
