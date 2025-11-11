#!/usr/bin/env node
/**
 * Fetches Open Graph / Twitter card images for each URL, downloads the image,
 * and writes a new CSV referencing locally stored previews.
 *
 * Output assets are saved under public/og-previews and the CSV
 * enhanced_fashion_data_with_og_previews.csv points to /og-previews/<file>.
 *
 * Usage:
 *   node scripts/fetch-og-previews.js
 */

const fs = require('fs');
const path = require('path');

const CSV_FILENAME = 'enhanced_fashion_data.csv';
const OUTPUT_FILENAME = 'enhanced_fashion_data_with_og_previews.csv';
const PREVIEW_HEADER = 'Preview_Image_URL';
const REQUEST_TIMEOUT = 15000;
const CONCURRENCY = 6;
const PUBLIC_OG_DIR = path.join(process.cwd(), 'public', 'og-previews');

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required file not found: ${filePath}`);
    process.exit(1);
  }
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line, idx) => {
    const values = line.split(',');
    const row = {};
    headers.forEach((header, i) => {
      row[header] = (values[i] || '').trim();
    });
    return { row, index: idx + 1 };
  });
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

function extractMetaContent(html, attributes) {
  for (const attr of attributes) {
    const regex = new RegExp(
      `<meta[^>]+(?:property|name)=["']${attr}["'][^>]*>`,
      'i'
    );
    const match = html.match(regex);
    if (!match) continue;
    const contentMatch = match[0].match(/content=["']([^"']+)["']/i);
    if (contentMatch) return contentMatch[1];
  }
  return null;
}

function slugify(value, fallback = 'preview') {
  return (
    (value || fallback)
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || fallback
  );
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      console.warn(`⚠️  ${url} responded with status ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.warn(`⚠️  Failed to fetch ${url}: ${error.message}`);
    return null;
  }
}

async function resolvePreview(url) {
  if (!url) return null;
  const html = await fetchWithTimeout(url);
  if (!html) return null;
  return (
    extractMetaContent(html, [
      'og:image',
      'og:image:url',
      'twitter:image',
      'twitter:image:src',
    ]) || null
  );
}

async function downloadPreviewImage(imageUrl, reference) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    const response = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      console.warn(`⚠️  Failed to download preview ${imageUrl}: ${response.status}`);
      return null;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || '';
    const extension = contentType.includes('png')
      ? 'png'
      : contentType.includes('webp')
      ? 'webp'
      : 'jpg';
    const filename = `${slugify(reference)}-${Date.now()}.${extension}`;
    const outputPath = path.join(PUBLIC_OG_DIR, filename);
    fs.writeFileSync(outputPath, buffer);
    return `/og-previews/${filename}`;
  } catch (error) {
    console.warn(`⚠️  Download failed for ${imageUrl}: ${error.message}`);
    return null;
  }
}

async function withConcurrency(items, limit, iterator) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await iterator(items[current], current);
    }
  }
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

async function main() {
  const csvPath = path.join(process.cwd(), CSV_FILENAME);
  const outputPath = path.join(process.cwd(), OUTPUT_FILENAME);
  requireFile(csvPath);
  fs.mkdirSync(PUBLIC_OG_DIR, { recursive: true });

  console.log('📄 Reading CSV …');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const { headers, rows } = parseCSV(csvContent);
  if (!headers.length) {
    console.error('❌ CSV file has no header row.');
    process.exit(1);
  }

  const extendedHeaders = headers.includes(PREVIEW_HEADER)
    ? headers
    : [...headers, PREVIEW_HEADER];

  console.log(`🔎 Resolving previews for ${rows.length} rows via OG metadata …`);
  const processedRows = await withConcurrency(rows, CONCURRENCY, async ({ row }, idx) => {
    if (row[PREVIEW_HEADER]) {
      console.log(`✅ Row ${idx + 1}: preview already present.`);
      return row;
    }
    const previewUrl = await resolvePreview(row.URL);
    if (previewUrl) {
      const storedPath = await downloadPreviewImage(
        previewUrl,
        `${row.Category || 'content'}-${idx + 1}`
      );
      if (storedPath) {
        row[PREVIEW_HEADER] = storedPath;
        console.log(`🖼️  Row ${idx + 1}: preview saved to ${storedPath}.`);
      } else {
        row[PREVIEW_HEADER] = previewUrl;
        console.log(`ℹ️  Row ${idx + 1}: preview URL kept (download failed).`);
      }
    } else {
      row[PREVIEW_HEADER] = '';
      console.log(`❌ Row ${idx + 1}: no preview found.`);
    }
    return row;
  });

  console.log(`💾 Writing updated CSV to ${outputPath}`);
  const outputContent = [
    toCSVLine(extendedHeaders),
    ...processedRows.map((row) =>
      toCSVLine(extendedHeaders.map((header) => row[header] || ''))
    ),
  ].join('\n');
  fs.writeFileSync(outputPath, outputContent, 'utf-8');

  const successCount = processedRows.filter((row) => row[PREVIEW_HEADER]).length;
  console.log(`✅ Completed. ${successCount}/${rows.length} rows now have previews.`);
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
