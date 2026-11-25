# MRE Clearance Calculators

A lightweight, browser-based toolkit for utility design and make-ready engineering. Four calculators share one consistent light interface, with subtle accents inspired by the utility brands.

**[Open the calculator suite →](https://azx-215.github.io/mre-clearance-calculators/)**

## Calculator directory

| Calculator | Purpose | Online access |
| --- | --- | --- |
| Delta Clearance | Conductor clearance and ruling span | [Open](https://azx-215.github.io/mre-clearance-calculators/light.html) |
| UGI Sag & Pole Depth | Resag and pole setting depth | [Open](https://azx-215.github.io/mre-clearance-calculators/ugi-resag.html) |
| Mon Power Proposed Midspan | Proposed communication midspan heights | [Open](https://azx-215.github.io/mre-clearance-calculators/mon-power-midspan.html) |
| Feet & Inches | Measurement conversion and arithmetic | [Open](https://azx-215.github.io/mre-clearance-calculators/feet-inches.html) |

## Calculator features

### Delta Clearance

- Compare one to three independent calculators.
- Calculate a ruling span from a list of measured spans.
- Select conductor and ruling-span tables; enter actual span length.
- Review raw clearance, the applicable 5 ft minimum, and the suggested whole-inch clearance rounded upward.
- Review warnings and the reference sag table. Values outside the listed range are extrapolated and flagged for verification.
- Retains recent input and settings locally.

### UGI Sag & Pole Depth

- Select triplex or bare-wire conductors and interpolate sag from the UGI chart.
- Review estimated over-limit sag through 290 ft; estimates are visually distinguished from listed values.
- Calculate maximum resag attachment height from one or both pole heights.
- Select pole length and ground type to determine required setting depth and height above ground.
- Expand either reference chart when needed.

### Mon Power Proposed Midspan

- Use 1–100 independent calculators with optional span/SCID labels, local saving, clear and copy controls.
- Export all completed calculations (including hidden calculators) to Markdown with inputs, intermediate values and results. Incomplete or invalid entries are reported and omitted.
- **No existing comms:** using the 7/23/2026 template, round the average proposed attachment height to the nearest inch, subtract 0.5% of span length below 300 ft or 1% at or above 300 ft, then round to the nearest inch. Fractional span lengths round up before selecting the rate. Neutral sag and elevation are not included.
- **Existing comm below:** add 4 inches to the entered midspan height. This method does not apply a separate ice-load deduction.
- See the [formula review](docs/mon-power-midspan.md).

### Feet & Inches

- Use one to eight independent calculators.
- Convert decimal feet and inches, add or subtract measurements, and multiply or divide by a numeric factor.
- Review the formatted feet/inches result, decimal feet and total inches together.
- Lock a result for reference while editing inputs, or clear a calculator.
- Calculator count, manually entered values, operations and locked results are saved locally.
- Previous linked inputs are converted to fixed manual values when possible; unavailable links require re-entry. Calculators no longer reference each other.

## Online and offline use

Visit the [GitHub Pages site](https://azx-215.github.io/mre-clearance-calculators/) or download the repository as a ZIP, extract it, and open `index.html` in your browser. Keep the HTML, CSS and JavaScript files together. No internet connection, installation, account or external scripts are required after download.

A local Google Drive, OneDrive or Dropbox folder also works. Open the HTML files from File Explorer instead of from the cloud provider's web preview.

## Design and data

The light interface uses a green accent for Delta, a cyan-blue accent for UGI, a deep blue accent for Mon Power, and a slate accent for Feet & Inches. Old Delta theme URLs redirect to the current light calculator.

All calculations run in the browser; entered data is not transmitted to a calculator server. Some tools save inputs in local browser storage. Calculator results are engineering aids and should be checked against the applicable utility criteria, especially flagged estimates and extrapolated values.

## Development

Run calculation regression tests with:

```sh
node --test tests/*.test.js
```

The shared visual system is defined in `suite.css`; calculator-specific layout and calculation code remain separate.
