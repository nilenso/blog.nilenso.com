#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const fg = require('fast-glob');
const { Command } = require('commander');
const { pathToFileURL } = require('url');

const MIN_NODE_MAJOR = 18;
const nodeMajorVersion = Number.parseInt(process.versions.node.split('.')[0], 10);

if (Number.isNaN(nodeMajorVersion) || nodeMajorVersion < MIN_NODE_MAJOR) {
  console.error(
    `OG image generation requires Node.js ${MIN_NODE_MAJOR}+ (found ${process.versions.node}). ` +
      'Set NODE_VERSION or .nvmrc to 18 to match Playwright\'s requirement.',
  );
  process.exit(1);
}

// Delayed require to avoid Playwright's Node version check on unsupported runtimes.
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'source', '_posts');
const OUTPUT_DIR = path.join(ROOT, 'source', 'og');
const DATA_DIR = path.join(ROOT, 'source', '_data');
const MANIFEST_PATH = path.join(DATA_DIR, 'og-images.json');
const TEMPLATE_PATH = path.join(ROOT, 'plugins', 'og-template.html');
const CHARTER_FONT_PATH = path.join(ROOT, 'source', 'assets', 'fonts', 'charter_regular.woff2');
const charterFontUrl = pathToFileURL(CHARTER_FONT_PATH).href;
const VIEWPORT = { width: 1200, height: 630 };

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ensureDir(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function readTemplate() {
  return fs.readFileSync(TEMPLATE_PATH, 'utf8');
}

function formatDate(rawDate) {
  if (!rawDate) return '';
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate.toString();
  return parsed.toISOString().slice(0, 10);
}

function derivePermalink(filePath, data) {
  if (data.permalink) return data.permalink;
  const basename = path.basename(filePath);
  const match = basename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|markdown)$/i);
  if (!match) return `/${basename}`;
  const [, year, month, day, slug] = match;
  return `/blog/${year}/${month}/${day}/${slug}/`;
}

function filenameFromPermalink(permalink) {
  const cleaned = permalink.replace(/^\/+/g, '').replace(/\/+/g, '/');
  const safe = cleaned.replace(/[^a-zA-Z0-9/]/g, '-');
  const compact = safe.replace(/\/+|--+/g, '-').replace(/^-|-$/g, '');
  return compact || 'index';
}

function shouldGenerate(postPath, outputPath, templateMtime, force) {
  if (force || !fs.existsSync(outputPath)) return true;
  const outputMtime = fs.statSync(outputPath).mtimeMs;
  const postMtime = fs.statSync(postPath).mtimeMs;
  return outputMtime < postMtime || outputMtime < templateMtime;
}

function buildHtml(template, data) {
  const replacements = {
    '{{title}}': escapeHtml(data.title || ''),
    '{{author}}': escapeHtml(data.author || ''),
    '{{date}}': escapeHtml(data.date || ''),
    '{{charterFontUrl}}': data.charterFontUrl || '',
  };
  return Object.entries(replacements).reduce(
    (content, [placeholder, value]) => content.replace(new RegExp(placeholder, 'g'), value),
    template,
  );
}

async function renderImage(page, html, outputPath) {
  await page.setViewportSize(VIEWPORT);
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outputPath });
}

async function generateImages(options) {
  const templateMtime = fs.statSync(TEMPLATE_PATH).mtimeMs;
  const template = readTemplate();
  ensureDir(OUTPUT_DIR);
  ensureDir(DATA_DIR);

  const globPattern = options.post
    ? path.resolve(ROOT, options.post)
    : path.join(POSTS_DIR, '**', '*.{md,markdown}');
  const postPaths = await fg(globPattern, { onlyFiles: true });

  if (postPaths.length === 0) {
    console.error('No posts found for og:image generation.');
    process.exitCode = 1;
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const manifest = {};

  try {
    for (const postPath of postPaths) {
      const fileContent = fs.readFileSync(postPath, 'utf8');
      const { data } = matter(fileContent);
      const permalink = derivePermalink(postPath, data);
      const filename = `${filenameFromPermalink(permalink)}.png`;
      const outputPath = path.join(OUTPUT_DIR, filename);

      if (!shouldGenerate(postPath, outputPath, templateMtime, options.force)) {
        manifest[permalink] = `/og/${filename}`;
        continue;
      }

      const html = buildHtml(template, {
        title: data.title || filename,
        author: data.author || '',
        date: formatDate(data.created_at || data.date),
        charterFontUrl,
      });

      await renderImage(page, html, outputPath);
      manifest[permalink] = `/og/${filename}`;
      if (!options.quiet) {
        console.log(`Generated ${outputPath}`);
      }
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  if (!options.quiet) {
    console.log(`OG image manifest updated at ${MANIFEST_PATH}`);
  }
}

const program = new Command();
program
  .option('--post <path>', 'Generate an og:image for a single post')
  .option('--force', 'Regenerate images even when cached', false)
  .option('--quiet', 'Reduce console output', false)
  .action(async (opts) => {
    try {
      await generateImages(opts);
    } catch (error) {
      console.error('Failed to generate OG images:', error);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);

