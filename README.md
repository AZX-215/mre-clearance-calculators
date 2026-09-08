# Utility Clearance & Sag Calculators

Offline/online utility design calculators hosted as static HTML pages. The repository currently includes the Delta Clearance Calculator in three themes and a UGI Sag / Resag Calculator.

## Open the calculators online

Main GitHub Pages site:

```text
https://AZX-215.github.io/delta-clearance-calculator/
```

### Delta Clearance Calculator

Available themes:

- Blue: `blue.html`
- Grey: `grey.html`
- Light: `light.html`

Direct links:

```text
https://AZX-215.github.io/delta-clearance-calculator/blue.html
https://AZX-215.github.io/delta-clearance-calculator/grey.html
https://AZX-215.github.io/delta-clearance-calculator/light.html
```

### UGI Sag / Resag Calculator

Direct link:

```text
https://AZX-215.github.io/delta-clearance-calculator/ugi-resag.html
```

The UGI calculator lets you select a conductor and actual span, enter the secondary attachment height at each pole, and calculate the maximum resag attachment height using the corresponding chart measurement. It only calculates when the exact span exists in the supplied chart and does not interpolate unlisted spans.

## Use the calculators offline

Download or clone the repository, then open `index.html` in a browser.

You can also open any calculator directly:

- `blue.html`
- `grey.html`
- `light.html`
- `ugi-resag.html`

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
- Exact actual-span lookup
- Pole 1 and Pole 2 secondary attachment height inputs
- Automatic identification of the lower controlling attachment
- Chart measurement display
- Maximum resag attachment height calculation
- Full UGI sag chart reference table
- Clear warning when no exact chart value is available
- No interpolation or estimated sag values for unlisted spans

## Notes

- The Delta suggested distance is rounded up to the next whole inch after any 5 ft 0 in minimum is applied.
- Treat Delta warnings or extrapolated values as check items and verify before final design use.
- The UGI calculator reproduces the supplied chart values and intentionally does not invent values for unlisted spans.
- All calculations run entirely in the browser. No entered data is sent anywhere.
