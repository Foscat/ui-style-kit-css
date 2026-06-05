import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const styles = [
  ['minimal-saas', 'saas'], ['bento', 'bento'], ['maximalist', 'max'], ['bauhaus', 'bau'],
  ['tactile', 'tactile'], ['neumorphism', 'neo'], ['retrofuturism', 'retro'], ['brutalism', 'brutal'],
  ['cyberpunk', 'cyber'], ['y2k', 'y2k'], ['retro-glass', 'rg']
];
const themes = ['midnight-gold','ocean-steel','forest-moss','sunset-ember','royal-plum','graphite-cyan','desert-sage','rose-quartz','cyber-lime','arctic-indigo'];
const modes = ['light','dark','contrast'];

function rgbToLum([r,g,b]) {
  const vals = [r,g,b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
}
function contrast(a,b) {
  const l1 = rgbToLum(a); const l2 = rgbToLum(b);
  const hi = Math.max(l1,l2); const lo = Math.min(l1,l2);
  return (hi + 0.05) / (lo + 0.05);
}
function parseRgb(value) {
  return value.trim().split(/\s+/).slice(0,3).map(Number);
}
function blockFor(css, ui, theme, mode) {
  const re = new RegExp(`\\[data-ui="${ui}"\\]\\[data-theme="${theme}"\\]\\[data-mode="${mode}"\\]\\s*\\{([\\s\\S]*?)\\}`, 'm');
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
for (const [ui,prefix] of styles) {
  const file = path.join(root, 'styles', `${ui}.css`);
  const css = fs.readFileSync(file, 'utf8');
  for (const theme of themes) {
    for (const mode of modes) {
      const vars = varsFromBlock(blockFor(css, ui, theme, mode));
      const checks = [
        [`${prefix}-text-rgb`, `${prefix}-bg-rgb`, 4.5, 'text on background'],
        [`${prefix}-text-rgb`, `${prefix}-surface-rgb`, 4.5, 'text on surface'],
        [`${prefix}-primary-text-rgb`, `${prefix}-primary-rgb`, 4.5, 'primary text on primary'],
        [`${prefix}-secondary-text-rgb`, `${prefix}-secondary-rgb`, 4.5, 'secondary text on secondary']
      ];
      for (const [fgKey,bgKey,min,label] of checks) {
        if (!vars[fgKey] || !vars[bgKey]) continue;
        const ratio = contrast(parseRgb(vars[fgKey]), parseRgb(vars[bgKey]));
        if (ratio < min) failures.push(`${ui}/${theme}/${mode}: ${label} ${ratio.toFixed(2)} < ${min}`);
      }
    }
  }
}

if (failures.length) {
  console.error('Contrast check failed:');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log('Contrast check passed.');
