#!/usr/bin/env node
/**
 * Fills missing Preview_Image_URL values in a CSV with placeholder assets.
 *
 * Usage:
 *   node scripts/fill-preview-placeholders.js [inputCsv] [outputCsv]
 *
 * Defaults:
 *   input  = enhanced_fashion_data_with_previews.csv
 *   output = enhanced_fashion_data_with_previews_with_placeholders.csv
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_INPUT = 'enhanced_fashion_data_with_previews.csv';
const DEFAULT_OUTPUT = 'enhanced_fashion_data_with_previews_with_placeholders.csv';
const PREVIEW_HEADER = 'Preview_Image_URL';

const PLACEHOLDERS = [
  { regex: /instagram\.com/i, path: '/placeholders/instagram.svg' },
  { regex: /tiktok\.com/i, path: '/placeholders/tiktok.svg' },
  { regex: /substack\.com|medium\.com|newsletter|blog/i, path: '/placeholders/article.svg' },
];
const DEFAULT_PLACEHOLDER = '/placeholders/link.svg';

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const values = line.split(',');
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || '').trim();
    });
    rows.push({ row, index: i });
  }
  return { headers, rows };
}

function toCSVLine(values) {
  return values
    .map((value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    })
    .join(',');
}

function choosePlaceholder(url) {
  if (!url) return DEFAULT_PLACEHOLDER;
  const match = PLACEHOLDERS.find((entry) => entry.regex.test(url));
  return match ? match.path : DEFAULT_PLACEHOLDER;
}

function main() {
  const [, , inputArg, outputArg] = process.argv;
  const inputPath = path.join(process.cwd(), inputArg || DEFAULT_INPUT);
  const outputPath = path.join(process.cwd(), outputArg || DEFAULT_OUTPUT);

  requireFile(inputPath);

  const csvContent = fs.readFileSync(inputPath, 'utf-8');
  const { headers, rows } = parseCSV(csvContent);
  if (!headers.length) {
    console.error('❌ CSV is empty or missing headers.');
    process.exit(1);
  }
  if (!headers.includes(PREVIEW_HEADER)) {
    headers.push(PREVIEW_HEADER);
  }

  const updatedRows = [];
  const placeholderRows = [];

  for (const { row, index } of rows) {
    if (!row[PREVIEW_HEADER]) {
      const placeholder = choosePlaceholder(row.URL);
      row[PREVIEW_HEADER] = placeholder;
      placeholderRows.push({
        csvRow: index + 1,
        url: row.URL,
        placeholder,
      });
    }
    updatedRows.push(row);
  }

  const output = [
    toCSVLine(headers),
    ...updatedRows.map((row) => toCSVLine(headers.map((header) => row[header] || ''))),
  ].join('\n');

  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`💾 Wrote CSV with placeholders to ${outputPath}`);
  console.log(`🧩 Rows filled with placeholders: ${placeholderRows.length}`);
  if (placeholderRows.length) {
    console.log('--- Placeholder rows ---');
    placeholderRows.forEach(({ csvRow, url, placeholder }) => {
      console.log(`#${csvRow} -> ${placeholder} (${url})`);
    });
  }
}

main();
