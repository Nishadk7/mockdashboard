#!/usr/bin/env node
/**
 * Generates preview images for entries in enhanced_fashion_data.csv.
 * 1. Attempts to read Open Graph / Twitter preview images.
 * 2. Falls back to a hosted screenshot service (Microlink) when metadata is missing.
 * 3. Writes results to enhanced_fashion_data_with_previews.csv, adding a Preview_Image_URL column.
 *
 * Optional env:
 *   MICROLINK_API_KEY=your_key_here
 */

const fs = require('fs');
const path = require('path');

const CSV_FILENAME = 'enhanced_fashion_data.csv';
const OUTPUT_FILENAME = 'enhanced_fashion_data_with_previews.csv';
const PREVIEW_HEADER = 'Preview_Image_URL';
const PUBLIC_PREVIEW_DIR = path.join(process.cwd(), 'public', 'previews');
const METADATA_CONCURRENCY = 6;
const REQUEST_TIMEOUT = 15000;

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

async function fetchPreviewFromMetadata(url) {
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

function slugify(value, fallback = 'preview') {
  return (
    (value || fallback)
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || fallback
  );
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

async function downloadToFile(url, filename) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status})`);
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(filename, Buffer.from(arrayBuffer));
}

async function fetchScreenshotViaMicrolink(url, reference) {
  try {
    const params = new URLSearchParams({
      url,
      screenshot: 'true',
      meta: 'false',
      'screenshot.waitUntil': 'networkidle0',
      'screenshot.device': 'iphone11',
      embed: 'screenshot.url',
    });
    if (process.env.MICROLINK_API_KEY) {
      params.set('key', process.env.MICROLINK_API_KEY);
    }

    const apiUrl = `https://api.microlink.io?${params.toString()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      console.warn(`⚠️  Microlink API error (${response.status}) for ${url}`);
      return null;
    }
    const json = await response.json();
    const screenshotUrl = json?.data?.screenshot?.url;
    if (!screenshotUrl) {
      console.warn(`⚠️  No screenshot URL returned for ${url}`);
      return null;
    }

    const filename = `${slugify(reference)}-${Date.now()}.jpg`;
    const outputPath = path.join(PUBLIC_PREVIEW_DIR, filename);
    await downloadToFile(screenshotUrl, outputPath);
    return `/previews/${filename}`;
  } catch (error) {
    console.warn(`⚠️  Microlink request failed for ${url}: ${error.message}`);
    return null;
  }
}

async function main() {
  const csvPath = path.join(process.cwd(), CSV_FILENAME);
  const outputPath = path.join(process.cwd(), OUTPUT_FILENAME);
  requireFile(csvPath);
  fs.mkdirSync(PUBLIC_PREVIEW_DIR, { recursive: true });

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

  console.log(`🔎 Fetching metadata previews for ${rows.length} rows …`);
  const metadataResults = await withConcurrency(rows, METADATA_CONCURRENCY, async ({ row }, idx) => {
    if (row[PREVIEW_HEADER]) {
      console.log(`✅ Row ${idx + 1}: preview already present.`);
      return row;
    }
    const metaPreview = await fetchPreviewFromMetadata(row.URL);
    if (metaPreview) {
      console.log(`🖼️  Row ${idx + 1}: metadata preview found.`);
      row[PREVIEW_HEADER] = metaPreview;
    } else {
      row[PREVIEW_HEADER] = '';
      console.log(`❌ Row ${idx + 1}: metadata preview missing.`);
    }
    return row;
  });

  const needsScreenshots = metadataResults
    .map((entry, idx) => ({ entry, idx }))
    .filter(({ entry }) => !entry[PREVIEW_HEADER] && entry.URL);

  if (needsScreenshots.length) {
    console.log(`📸 Requesting hosted screenshots for ${needsScreenshots.length} rows …`);
    await withConcurrency(needsScreenshots, 3, async ({ entry, idx }) => {
      const screenshotUrl = await fetchScreenshotViaMicrolink(
        entry.URL,
        `${entry.Category || 'content'}-${idx}`
      );
      if (screenshotUrl) {
        entry[PREVIEW_HEADER] = screenshotUrl;
        console.log(`📷 Row ${idx + 1}: screenshot stored.`);
      } else {
        console.log(`⚠️  Row ${idx + 1}: screenshot failed, leaving blank.`);
      }
      return entry;
    });
  } else {
    console.log('🎉 All rows already have previews.');
  }

  console.log(`💾 Writing updated CSV to ${outputPath}`);
  const outputContent = [
    toCSVLine(extendedHeaders),
    ...metadataResults.map((row) =>
      toCSVLine(extendedHeaders.map((header) => row[header] || ''))
    ),
  ].join('\n');
  fs.writeFileSync(outputPath, outputContent, 'utf-8');

  const successCount = metadataResults.filter((row) => row[PREVIEW_HEADER]).length;
  console.log(`✅ Completed. ${successCount}/${rows.length} rows now have previews.`);
}

main()
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
