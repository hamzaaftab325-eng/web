/**
 * Shared email template wrapper — premium Aura Living design.
 * Used by all transactional + cron emails for consistent branding.
 *
 * Design:
 *  - Cream canvas #FAF7F0 (matches website)
 *  - Ink #1A1714 text
 *  - Gold #D4AF37 accents
 *  - Georgia serif headings (email-safe fallback)
 *  - Sans-serif body
 *  - Max 600px width
 *  - Branded header with logo wordmark
 *  - Footer with contact info
 */

const BASE_STYLES = `
  body { margin: 0; padding: 0; background: #FAF7F0; font-family: Georgia, serif; color: #1a1714; }
  .container { max-width: 600px; margin: 0 auto; padding: 24px; }
  .header { text-align: center; padding: 32px 0 24px; border-bottom: 1px solid #E8E0D5; }
  .brand { font-size: 28px; font-weight: 400; letter-spacing: -0.02em; color: #1a1714; }
  .brand-accent { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #D4AF37; display: block; margin-top: 4px; }
  .content { padding: 32px 0; }
  h1 { font-size: 22px; font-weight: 400; margin: 0 0 16px; color: #1a1714; }
  h2 { font-size: 16px; font-weight: 600; margin: 24px 0 12px; color: #1a1714; }
  h3 { font-size: 14px; font-weight: 600; margin: 24px 0 8px; color: #1a1714; }
  p { font-size: 14px; line-height: 1.7; margin: 0 0 16px; color: #4A4036; }
  .stat-card { background: #F5EFE1; padding: 20px; text-align: center; border-radius: 4px; }
  .stat-value { font-size: 32px; font-weight: 600; color: #1a1714; }
  .stat-value-gold { font-size: 32px; font-weight: 600; color: #D4AF37; }
  .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6B5D4F; margin-top: 4px; }
  .alert-critical { color: #B0413E; font-weight: 600; }
  .alert-warning { color: #C28A2B; font-weight: 600; }
  .button { display: inline-block; padding: 14px 32px; background: #1a1714; color: #FAF7F0; text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 2px; margin: 16px 0; }
  .table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; color: #4A4036; }
  .table th { text-align: left; padding: 8px 0; border-bottom: 2px solid #E8E0D5; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #718096; font-weight: 600; }
  .table td { padding: 8px 0; border-bottom: 1px solid #F0EBE0; }
  .footer { padding: 24px 0; border-top: 1px solid #E8E0D5; text-align: center; }
  .footer p { font-size: 12px; color: #718096; margin: 4px 0; }
  .footer a { color: #D4AF37; text-decoration: none; }
  .divider { height: 1px; background: #E8E0D5; margin: 24px 0; border: none; }
  .empty-state { background: #FFF8E1; border: 1px solid #FFE082; padding: 20px; border-radius: 4px; text-align: center; color: #6B5D4F; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
  .badge-gold { background: #F5EFE1; color: #B8901F; }
  .badge-red { background: #FFEBEE; color: #B0413E; }
`;

export function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Aura Living</title>
<style>${BASE_STYLES}</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="brand">Aura<span class="brand-accent">Living</span></div>
  </div>
  <div class="content">
    ${content}
  </div>
  <div class="footer">
    <p>Aura Living Atelier · Lahore, Pakistan</p>
    <p><a href="https://aura-living-1.vercel.app">aura-living-1.vercel.app</a> · concierge@auraliving.com</p>
    <p style="font-size: 11px; color: #A0AEC0; margin-top: 12px;">This is an automated message from your Aura Living dashboard.</p>
  </div>
</div>
</body>
</html>`;
}

/**
 * Build a stat card row (3 stats side by side).
 */
export function statCardRow(stats: Array<{ value: string; label: string; gold?: boolean }>): string {
  const cards = stats
    .map(
      (s) => `<td style="background:#F5EFE1;padding:20px;text-align:center;${s.gold ? "" : ""}">
        <div class="${s.gold ? "stat-value-gold" : "stat-value"}">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </td>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:separate;border-spacing:4px;margin:16px 0;"><tr>${cards}</tr></table>`;
}

/**
 * Build a standard data table with headers.
 */
export function dataTable(headers: string[], rows: string[][]): string {
  const thead = `<thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>`;
  return `<table class="table">${thead}${tbody}</table>`;
}
