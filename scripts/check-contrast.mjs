import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const themes = ['midnight-gold', 'ocean-steel', 'forest-moss', 'sunset-ember', 'royal-plum', 'graphite-cyan', 'desert-sage', 'rose-quartz', 'cyber-lime', 'arctic-indigo'];
const modes = ['light', 'dark', 'contrast'];

function rgbToLum([r, g, b]) {
  const vals = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
}

function contrast(a, b) {
  const l1 = rgbToLum(a);
  const l2 = rgbToLum(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

function parseRgb(value) {
  return value.trim().split(/\s+/).slice(0, 3).map(Number);
}

function blockFor(css, theme, mode) {
  const re = new RegExp(`:where\\(\\[data-ui\\]\\[data-theme="${theme}"\\]\\[data-mode="${mode}"\\]\\)\\s*\\{([\\s\\S]*?)\\}`, 'm');
  const match = css.match(re);
  return match ? match[1] : '';
}

function varsFromBlock(block) {
  const vars = {};
  const re = /--([\w-]+):\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block))) vars[m[1]] = m[2];
  return vars;
}

const failures = [];
const css = fs.readFileSync(path.join(root, 'styles', 'theme-colors.css'), 'utf8');
for (const theme of themes) {
  for (const mode of modes) {
    const vars = varsFromBlock(blockFor(css, theme, mode));
    const checks = [
      ['usk-text-rgb', 'usk-bg-rgb', 4.5, 'text on background'],
      ['usk-text-rgb', 'usk-surface-rgb', 4.5, 'text on surface'],
      ['usk-text-rgb', 'usk-surface-strong-rgb', 4.5, 'text on strong surface'],
      ['usk-text-rgb', 'usk-surface-soft-rgb', 4.5, 'text on soft surface'],
      ['usk-text-muted-rgb', 'usk-bg-rgb', 4.5, 'muted text on background'],
      ['usk-text-muted-rgb', 'usk-surface-rgb', 4.5, 'muted text on surface'],
      ['usk-link-rgb', 'usk-bg-rgb', 4.5, 'link on background'],
      ['usk-link-rgb', 'usk-surface-rgb', 4.5, 'link on surface'],
      ['usk-primary-text-rgb', 'usk-primary-rgb', 4.5, 'primary text on primary'],
      ['usk-secondary-text-rgb', 'usk-secondary-rgb', 4.5, 'secondary text on secondary'],
      ['usk-accent-text-rgb', 'usk-accent-rgb', 4.5, 'accent text on accent'],
      ['usk-success-text-rgb', 'usk-success-rgb', 4.5, 'success text on success'],
      ['usk-warning-text-rgb', 'usk-warning-rgb', 4.5, 'warning text on warning'],
      ['usk-danger-text-rgb', 'usk-danger-rgb', 4.5, 'danger text on danger']
    ];

    for (const [fgKey, bgKey, min, label] of checks) {
      if (!vars[fgKey]) failures.push(`${theme}/${mode}: missing ${fgKey}`);
      if (!vars[bgKey]) failures.push(`${theme}/${mode}: missing ${bgKey}`);
      if (!vars[fgKey] || !vars[bgKey]) continue;
      const ratio = contrast(parseRgb(vars[fgKey]), parseRgb(vars[bgKey]));
      if (ratio < min) failures.push(`${theme}/${mode}: ${label} ${ratio.toFixed(2)} < ${min}`);
    }
  }
}

if (failures.length) {
  console.error('Contrast check failed:');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log('Contrast check passed.');
