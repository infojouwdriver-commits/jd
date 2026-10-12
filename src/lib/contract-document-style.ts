// Authored document styles only. Stored contract HTML cannot supply executable code or styles.
export const CONTRACT_DOCUMENT_CSS = `
.contract-document{box-sizing:border-box;margin:0;padding:28px;background:#fff;color:#172535;font-family:Arial,"Noto Sans","DejaVu Sans",sans-serif;font-size:13px;line-height:1.65;text-align:start;color-scheme:light;overflow-wrap:anywhere}
.contract-document *{box-sizing:border-box}
.contract-document .page{width:100%;max-width:790px;margin:0 auto}
.contract-document .header{display:flex;justify-content:space-between;align-items:center;gap:20px;padding-bottom:22px;margin-bottom:24px;border-bottom:3px solid #b48a37}
.contract-document .logo-wrap{display:flex;align-items:center;gap:12px}
.contract-document .logo-badge{display:flex;align-items:center;justify-content:center;width:46px;height:46px;flex-shrink:0;border:1px solid #b48a37;border-radius:10px;background:#172535;color:#fff;font-weight:800;font-size:19px}
.contract-document .logo-text-main{font-size:19px;font-weight:800;letter-spacing:.045em;line-height:1.25}
.contract-document .logo-text-sub,.contract-document .tagline{font-size:10px;color:#556477}
.contract-document .tagline{text-align:end;max-width:250px}
.contract-document .contract-info{padding:18px 20px;margin-bottom:20px;border:1px solid #d9e1e8;border-radius:8px;background:#f6f8fa}
.contract-document .contract-info h3{margin:0 0 12px;font-size:14px;color:#172535}
.contract-document .info-row{display:grid;grid-template-columns:minmax(130px,35%) minmax(0,1fr);gap:12px;padding:5px 0;border-bottom:1px solid #e5eaf0}
.contract-document .info-row:last-child{border:0}
.contract-document .info-label{color:#556477;font-size:11px}
.contract-document .info-value{font-weight:600;unicode-bidi:plaintext}
.contract-document .top-banner{padding:16px 18px;margin:20px 0;border-inline-start:3px solid #b48a37;background:#faf8f2}
.contract-document .inline-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#70561e}
.contract-document .badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.contract-document .pill{display:inline-block;padding:3px 9px;border:1px solid #d8dfe6;border-radius:4px;background:#fff;font-size:10px;color:#405268}
.contract-document .pill.warn{border-color:#d5bd82;color:#70561e}
.contract-document .grid{display:block;margin-top:24px}
.contract-document .card{margin:0 0 24px;padding:0 0 22px;border:0;border-bottom:1px solid #d9e1e8;background:#fff;box-shadow:none;border-radius:0}
.contract-document h2{margin:0 0 5px;font-size:18px;font-weight:750;color:#172535;line-height:1.4;break-after:avoid}
.contract-document .kicker{margin-bottom:18px;font-size:11px;color:#64748b}
.contract-document section{margin-top:17px}
.contract-document h3{margin:0 0 7px;font-size:13px;font-weight:700;line-height:1.5;break-after:avoid}
.contract-document p{margin:0 0 10px;orphans:3;widows:3}
.contract-document ul,.contract-document ol{margin:8px 0 12px;padding-inline-start:21px}
.contract-document li{margin-bottom:5px}
.contract-document strong{font-weight:700;color:inherit}
.contract-document .small{font-size:11px;color:#556477}
.contract-document .footer-note{margin-top:15px;padding:12px 14px;border:1px solid #ded7c5;background:#faf8f2;font-size:11px;break-inside:avoid}
.contract-document a{color:#274e75;text-decoration:underline}
.contract-document .signature-summary{padding:18px;border:1px solid #d9e1e8;break-inside:avoid}
.contract-document .signature-summary h2{font-size:15px}
@media(max-width:560px){.contract-document{padding:16px;font-size:12px}.contract-document .header{display:block}.contract-document .tagline{text-align:start;margin-top:12px;max-width:none}.contract-document .logo-text-main{font-size:16px}.contract-document .contract-info{padding:14px}.contract-document .info-row{grid-template-columns:minmax(0,1fr);gap:2px;padding:8px 0}}
@media print{
 @page{size:A4;margin:16mm 15mm}
 .contract-document{padding:0;background:#fff;font-size:10.5pt;line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}
 .contract-document .page{max-width:none;margin:0}
 .contract-document .header{break-inside:avoid;margin-bottom:6mm;padding-bottom:5mm}
 .contract-document .contract-info,.contract-document .top-banner{break-inside:avoid}
 .contract-document .card{margin-bottom:6mm;padding-bottom:5mm}
 .contract-document section{break-inside:avoid}
 .contract-document h2{font-size:14pt}
 .contract-document .kicker{break-after:avoid}
 .contract-document h3{font-size:11pt}
 .contract-print-controls,body:has(.contract-print-page) [data-cookie-banner],body:has(.contract-print-page) [data-sonner-toaster]{display:none!important}
 .contract-print-page{max-width:none!important;margin:0!important;padding:0!important;background:#fff!important}
}
`;
