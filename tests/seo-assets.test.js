import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { PNG } from 'pngjs';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const publicPageUrl = 'https://foscat.github.io/ui-style-kit-css/';

/**
 * Reads an HTML artifact from the repository root.
 * @param {string} relativeFile Repository-relative HTML path.
 * @returns {string} HTML source.
 */
function readHtml(relativeFile) {
  return fs.readFileSync(path.join(root, relativeFile), 'utf8');
}

/**
 * Extracts one attribute from the first matching HTML element.
 * @param {string} html HTML source.
 * @param {string} tagName Element name.
 * @param {Record<string, string>} identity Attributes that identify the element.
 * @param {string} requestedAttribute Attribute to return.
 * @returns {string} Attribute value.
 */
function elementAttribute(html, tagName, identity, requestedAttribute) {
  const elements = html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
  const parseAttributes = (element) => Object.fromEntries(
    [...element.matchAll(/([:\w-]+)=(['"])(.*?)\2/g)].map((match) => [match[1], match[3]])
  );
  const element = elements
    .map((source) => ({ source, attributes: parseAttributes(source) }))
    .find(({ attributes }) => Object.entries(identity).every(([name, value]) => attributes[name] === value));

  assert.ok(element, `Expected <${tagName}> matching ${JSON.stringify(identity)}`);
  assert.ok(
    Object.hasOwn(element.attributes, requestedAttribute),
    `Expected ${requestedAttribute} on ${element.source}`
  );
  return element.attributes[requestedAttribute];
}

/**
 * Verifies public copy against the manifest-backed inventory.
 * @param {string} copy Search-facing description copy.
 * @param {string} label Diagnostic label for a failed assertion.
 * @returns {void}
 */
function assertCurrentInventory(copy, label) {
  assert.match(copy, new RegExp(`\\b${manifest.presets.length}\\b`), `${label} should include the UI-system count`);
  assert.match(copy, new RegExp(`\\b${manifest.themes.length}\\b`), `${label} should include the color-theme count`);
}

/**
 * Resolves a public project URL to its repository artifact.
 * @param {string} publicUrl Absolute URL under the GitHub Pages project path.
 * @returns {string} Absolute filesystem path.
 */
function publicUrlToFile(publicUrl) {
  const url = new URL(publicUrl);
  const projectPrefix = '/ui-style-kit-css/';
  assert.equal(url.origin, 'https://foscat.github.io');
  assert.equal(url.pathname.startsWith(projectPrefix), true);
  return path.join(root, url.pathname.slice(projectPrefix.length));
}

test('search and social metadata expose the current manifest inventory', () => {
  for (const relativeFile of ['index.html', path.join('demo', 'index.html')]) {
    const html = readHtml(relativeFile);
    const descriptions = [
      ['description', elementAttribute(html, 'meta', { name: 'description' }, 'content')],
      ['Open Graph description', elementAttribute(html, 'meta', { property: 'og:description' }, 'content')],
      ['Twitter description', elementAttribute(html, 'meta', { name: 'twitter:description' }, 'content')]
    ];

    for (const [label, copy] of descriptions) {
      assertCurrentInventory(copy, `${relativeFile} ${label}`);
    }

    const structuredDataMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(structuredDataMatch, `${relativeFile} should expose JSON-LD`);
    const structuredData = JSON.parse(structuredDataMatch[1]);
    for (const entry of structuredData['@graph']) {
      assertCurrentInventory(entry.description, `${relativeFile} ${entry['@type']} description`);
    }
  }
});

test('social metadata references a current, dimensionally accurate preview asset', () => {
  const rootHtml = readHtml('index.html');
  const demoHtml = readHtml(path.join('demo', 'index.html'));
  const imageUrl = elementAttribute(rootHtml, 'meta', { property: 'og:image' }, 'content');
  const twitterImageUrl = elementAttribute(rootHtml, 'meta', { name: 'twitter:image' }, 'content');
  const imageAlt = elementAttribute(rootHtml, 'meta', { property: 'og:image:alt' }, 'content');
  const imageFile = publicUrlToFile(imageUrl);
  const image = PNG.sync.read(fs.readFileSync(imageFile));

  assert.equal(imageUrl, twitterImageUrl, 'Open Graph and Twitter should share one preview asset');
  assert.match(imageUrl, /social-card-25-themes\.png$/);
  assertCurrentInventory(imageAlt, 'social preview alt text');
  assert.equal(elementAttribute(rootHtml, 'meta', { property: 'og:image:width' }, 'content'), String(image.width));
  assert.equal(elementAttribute(rootHtml, 'meta', { property: 'og:image:height' }, 'content'), String(image.height));
  assert.equal(elementAttribute(demoHtml, 'meta', { property: 'og:image' }, 'content'), imageUrl);

  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, new RegExp(imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assertCurrentInventory(sitemap, 'sitemap image metadata');
});

test('home-page favicons resolve to stable square assets at least 48 pixels wide', () => {
  for (const relativeFile of ['index.html', path.join('demo', 'index.html')]) {
    const html = readHtml(relativeFile);
    const iconHref = elementAttribute(
      html,
      'link',
      { rel: 'icon', type: 'image/png', sizes: '256x256' },
      'href'
    );
    const iconPath = path.resolve(root, path.dirname(relativeFile), iconHref);
    const icon = PNG.sync.read(fs.readFileSync(iconPath));

    assert.equal(icon.width, icon.height, `${relativeFile} favicon should be square`);
    assert.ok(icon.width >= 48, `${relativeFile} favicon should be at least 48 pixels wide`);
  }

  assert.equal(fs.existsSync(path.join(root, 'favicon.ico')), true, 'project root should expose /favicon.ico');
  assert.equal(
    elementAttribute(readHtml('index.html'), 'link', { rel: 'canonical' }, 'href'),
    publicPageUrl
  );
});

test('browser metadata references the current social card and existing tile assets', () => {
  for (const relativeFile of ['site.webmanifest', path.join('demo', 'assets', 'site.webmanifest')]) {
    const webManifest = JSON.parse(fs.readFileSync(path.join(root, relativeFile), 'utf8'));
    const screenshot = webManifest.screenshots[0];
    const screenshotPath = path.resolve(root, path.dirname(relativeFile), screenshot.src);
    const image = PNG.sync.read(fs.readFileSync(screenshotPath));

    assert.match(screenshot.src, /social-card-25-themes\.png$/);
    assert.equal(screenshot.sizes, `${image.width}x${image.height}`);
    assertCurrentInventory(webManifest.description, `${relativeFile} description`);
    assertCurrentInventory(screenshot.label, `${relativeFile} screenshot label`);
  }

  const browserConfig = fs.readFileSync(path.join(root, 'browserconfig.xml'), 'utf8');
  const tileSource = browserConfig.match(/<square150x150logo src="([^"]+)"\s*\/>/)?.[1];
  assert.ok(tileSource, 'browserconfig.xml should declare a square tile');
  assert.equal(fs.existsSync(path.join(root, tileSource)), true, `${tileSource} should exist at the project root`);
});
