#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const slugify = require('slugify');
const { chromium } = require('playwright-chromium');

const ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'source');
const POSTS_DIR = path.join(SOURCE_DIR, '_posts');
const TEMPLATE_PATH = path.join(ROOT, 'plugins', 'og-template.html');
const OUTPUT_DIR = path.join(SOURCE_DIR, 'og');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');
const VIEWPORT = { width: 1200, height: 630 };

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { force: false, post: null };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--force') {
      options.force = true;
    } else if (arg === '--post') {
      options.post = args[i + 1];
      i += 1;
    }
  }

  return options;
}

async function loadManifest() {
  try {
    const contents = await fs.promises.readFile(MANIFEST_PATH, 'utf8');
    return JSON.parse(contents);
  } catch (error) {
    return {};
  }
}

async function saveManifest(manifest) {
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.promises.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function deriveSlug(filepath, frontmatter) {
  if (frontmatter.permalink) {
    const permalink = frontmatter.permalink.replace(/\/$/, '');
    const pieces = permalink.split('/').filter(Boolean);
    return pieces[pieces.length - 1];
  }

  const filename = path.basename(filepath, path.extname(filepath));
  const parts = filename.split('-').slice(3); // drop YYYY-MM-DD
  const raw = parts.join('-') || filename;
  return slugify(raw, { lower: true, strict: true });
}

async function gatherPosts(targetPath) {
  if (targetPath) {
    const resolved = path.isAbsolute(targetPath)
      ? targetPath
      : path.join(ROOT, targetPath);
    const stat = await fs.promises.stat(resolved);
    if (!stat.isFile()) {
      throw new Error(`Provided path is not a file: ${targetPath}`);
    }
    return [resolved];
  }

  const entries = await fs.promises.readdir(POSTS_DIR);
  return entries
    .filter((entry) => entry.endsWith('.markdown') || entry.endsWith('.md'))
    .map((entry) => path.join(POSTS_DIR, entry));
}

function fillTemplate(template, data) {
  return template
    .replace('{{ title }}', escapeHtml(data.title))
    .replace('{{ author }}', escapeHtml(data.author || ''))
    .replace('{{ date }}', escapeHtml(data.date || ''));
}

async function shouldRender(slug, postMTime, templateMTime, manifest, force) {
  if (force) return true;
  const record = manifest[slug];
  if (!record) return true;
  return record.sourceMTime < postMTime || record.templateMTime < templateMTime;
}

async function renderImage(browser, html, outputPath) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outputPath });
  await page.close();
}

async function main() {
  const options = parseArgs();
  const manifest = await loadManifest();
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

  const [template, templateStat, scriptStat] = await Promise.all([
    fs.promises.readFile(TEMPLATE_PATH, 'utf8'),
    fs.promises.stat(TEMPLATE_PATH),
    fs.promises.stat(__filename),
  ]);
  const templateMTime = Math.max(templateStat.mtimeMs, scriptStat.mtimeMs);

  const postFiles = await gatherPosts(options.post);
  const browser = await chromium.launch({ headless: true });
  let renderedCount = 0;

  for (const filepath of postFiles) {
    const content = await fs.promises.readFile(filepath, 'utf8');
    const { data } = matter(content);
    const slug = deriveSlug(filepath, data);
    const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);

    const postStat = await fs.promises.stat(filepath);
    const sourceMTime = Math.max(postStat.mtimeMs, templateMTime);

    const needsRender = await shouldRender(
      slug,
      sourceMTime,
      templateMTime,
      manifest,
      options.force,
    );

    if (!needsRender) {
      continue;
    }

    const html = fillTemplate(template, {
      title: data.title || slug,
      author: data.author || 'nilenso',
      date: formatDate(data.created_at || data.date),
    });

    await renderImage(browser, html, outputPath);
    manifest[slug] = {
      sourceMTime,
      templateMTime,
      generatedAt: Date.now(),
      output: path.relative(ROOT, outputPath),
      title: data.title || '',
    };
    renderedCount += 1;
    process.stdout.write(`Generated OG image for ${slug}\n`);
  }

  await browser.close();
  await saveManifest(manifest);

  if (renderedCount === 0) {
    process.stdout.write('OG images are up to date.\n');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
