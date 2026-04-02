#!/usr/bin/env node
/**
 * Generate PDF from architecture markdown files.
 * Renders Mermaid diagrams, avoids page breaks inside diagrams/tables,
 * eliminates empty pages, and adds the Groupama logo.
 *
 * Usage: node scripts/generate_arch_pdf.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Marked } from 'marked';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Read the Groupama logo as base64
const logoPath = path.join(ROOT, 'frontend', 'public', 'groupama-logo.png');
const logoBase64 = fs.readFileSync(logoPath).toString('base64');
const logoDataUri = `data:image/png;base64,${logoBase64}`;

// Files to convert
const files = [
  {
    input: path.join(ROOT, 'docs', 'ARCHITECTURE-AGENTIC.md'),
    output: path.join(ROOT, 'docs', 'ARCHITECTURE-AGENTIC.pdf'),
    subtitle: 'Architecture Agentique — POC',
  },
  {
    input: path.join(ROOT, 'docs', 'ARCHITECTURE-AGENTIC-V2-TARGET.md'),
    output: path.join(ROOT, 'docs', 'ARCHITECTURE-AGENTIC-V2-TARGET.pdf'),
    subtitle: 'Architecture Agentique — Cible V2',
  },
];

/**
 * Convert markdown to HTML, wrapping ```mermaid blocks in <div class="mermaid">.
 */
function markdownToHtml(md) {
  const marked = new Marked();

  // Custom renderer: detect mermaid code blocks
  const renderer = new marked.Renderer();
  const originalCode = renderer.code;

  renderer.code = function ({ text, lang }) {
    if (lang === 'mermaid') {
      return `<div class="mermaid">${text}</div>`;
    }
    // Default code block rendering
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre><code class="language-${lang || ''}">${escaped}</code></pre>`;
  };

  marked.setOptions({ renderer });
  return marked.parse(md);
}

/**
 * Build full HTML page with styles, Mermaid JS, and logo.
 */
function buildHtmlPage(bodyHtml, subtitle) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>GroupaIQ — ${subtitle}</title>
<style>
  @page {
    size: A4;
    margin: 20mm 18mm 20mm 18mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: #1e293b;
    margin: 0;
    padding: 0;
  }

  /* Cover header */
  .cover-header {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 10px;
    padding-bottom: 14px;
    border-bottom: 3px solid #006838;
  }
  .cover-header img {
    height: 48px;
    width: auto;
  }
  .cover-header .title-block h1 {
    margin: 0;
    font-size: 22pt;
    color: #006838;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
  .cover-header .title-block .subtitle {
    margin: 2px 0 0 0;
    font-size: 11pt;
    color: #64748b;
    font-weight: 400;
  }

  /* Headings */
  h1 { font-size: 18pt; color: #006838; margin-top: 28px; page-break-after: avoid; }
  h2 { font-size: 14pt; color: #004d2a; margin-top: 22px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; page-break-after: avoid; }
  h3 { font-size: 12pt; color: #1e293b; margin-top: 16px; page-break-after: avoid; }
  h4 { font-size: 11pt; font-weight: 600; margin-top: 12px; page-break-after: avoid; }

  /* Hide the first h1 from markdown (we have cover header) */
  body > h1:first-of-type { display: none; }

  /* Blockquote (audience note) */
  blockquote {
    background: #f0fdf4;
    border-left: 4px solid #006838;
    margin: 12px 0;
    padding: 10px 16px;
    font-size: 10pt;
    color: #334155;
    page-break-inside: avoid;
  }
  blockquote p { margin: 4px 0; }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  thead th {
    background: #006838;
    color: white;
    padding: 6px 8px;
    text-align: left;
    font-weight: 600;
    font-size: 9pt;
  }
  tbody td {
    padding: 5px 8px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
  }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody tr:hover { background: #f0fdf4; }

  /* Code blocks */
  pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 12px;
    border-radius: 6px;
    font-size: 8.5pt;
    line-height: 1.45;
    overflow-x: auto;
    page-break-inside: avoid;
    margin: 10px 0;
  }
  code {
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 8.5pt;
  }
  p code, li code, td code {
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    color: #334155;
  }

  /* Mermaid diagrams */
  .mermaid {
    page-break-inside: avoid;
    text-align: center;
    margin: 10px auto;
    max-width: 100%;
  }
  .mermaid svg {
    max-width: 100% !important;
    max-height: 380px !important;
    height: auto !important;
  }

  /* Horizontal rules */
  hr {
    border: none;
    border-top: 1px solid #cbd5e1;
    margin: 20px 0;
  }

  /* Lists */
  ul, ol { padding-left: 22px; }
  li { margin-bottom: 3px; }

  /* Strong / bold */
  strong { color: #0f172a; }

  /* Links */
  a { color: #006838; text-decoration: none; }

  /* Page break helpers */
  .page-break { page-break-before: always; }

  /* Footer with page numbers — handled by Puppeteer footerTemplate */

  /* Prevent orphan headings */
  h2, h3 { page-break-after: avoid; }
  h2 + *, h3 + * { page-break-before: avoid; }
</style>
</head>
<body>

<div class="cover-header">
  <img src="${logoDataUri}" alt="Groupama" />
  <div class="title-block">
    <h1>GroupaIQ</h1>
    <div class="subtitle">${subtitle} — Avril 2026</div>
  </div>
</div>

${bodyHtml}

<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    themeVariables: {
      primaryColor: '#e0e7ff',
      primaryBorderColor: '#6366f1',
      primaryTextColor: '#312e81',
      secondaryColor: '#d1fae5',
      secondaryBorderColor: '#059669',
      tertiaryColor: '#fef3c7',
      tertiaryBorderColor: '#d97706',
      lineColor: '#64748b',
      textColor: '#1e293b',
      mainBkg: '#e0e7ff',
      nodeBorder: '#6366f1',
      fontSize: '10px',
    },
    flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis', nodeSpacing: 30, rankSpacing: 30 },
    sequence: { useMaxWidth: true, showSequenceNumbers: false, boxMargin: 4, noteMargin: 4, messageMargin: 25 },
  });
</script>
</body>
</html>`;
}

async function generatePdf(file) {
  console.log(`Processing: ${path.basename(file.input)}`);

  // Read and convert markdown
  const md = fs.readFileSync(file.input, 'utf-8');
  const bodyHtml = markdownToHtml(md);
  const fullHtml = buildHtmlPage(bodyHtml, file.subtitle);

  // Write temporary HTML for debugging (optional, removed after)
  const tmpHtml = file.output.replace('.pdf', '.tmp.html');
  fs.writeFileSync(tmpHtml, fullHtml, 'utf-8');

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set content and wait for Mermaid to render
  await page.setContent(fullHtml, { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for all mermaid diagrams to be rendered (they get data-processed attribute)
  await page.waitForFunction(() => {
    const diagrams = document.querySelectorAll('.mermaid');
    if (diagrams.length === 0) return true;
    return Array.from(diagrams).every(
      (d) => d.querySelector('svg') !== null || d.getAttribute('data-processed') === 'true'
    );
  }, { timeout: 30000 });

  // Extra wait for SVG rendering to stabilize
  await new Promise((r) => setTimeout(r, 2000));

  // Generate PDF
  await page.pdf({
    path: file.output,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '22mm', left: '18mm', right: '18mm' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `
      <div style="width:100%; font-size:8pt; color:#94a3b8; display:flex; justify-content:space-between; padding: 0 18mm;">
        <span>GroupaIQ — ${file.subtitle}</span>
        <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>
    `,
  });

  await browser.close();

  // Cleanup temp HTML
  fs.unlinkSync(tmpHtml);

  const stats = fs.statSync(file.output);
  console.log(`  ✓ ${path.basename(file.output)} (${(stats.size / 1024).toFixed(0)} KB)`);
}

// Main
async function main() {
  console.log('Generating architecture PDFs with Groupama logo + Mermaid diagrams...\n');

  for (const file of files) {
    await generatePdf(file);
  }

  console.log('\nDone! PDFs saved to docs/');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
