/**
 * @module studio/specimen-inventory
 * @description One source/output registry for all authored specimen consumers and the build.
 */
/** Explicit source entries; several surface presets share one lazy artifact. */
export const specimenEntries = [
  {
    ids: ['maximalist'],
    source: 'authored/maximalist.js',
    file: 'specimens/maximalist.js',
    template: true,
  },
  {
    ids: ['tactile'],
    source: 'authored/tactile.js',
    file: 'specimens/tactile.js',
    template: true,
  },
  {
    ids: ['cyberpunk'],
    source: 'authored/cyberpunk.js',
    file: 'specimens/cyberpunk.js',
    template: true,
  },
  {
    ids: ['retro-glass'],
    source: 'authored/retro-glass.js',
    file: 'specimens/retro-glass.js',
    template: true,
  },
  {
    ids: ['technical-blueprint'],
    source: 'authored/technical-blueprint.js',
    file: 'specimens/technical-blueprint.js',
    template: true,
  },
  {
    ids: ['industrial-utility'],
    source: 'authored/industrial-utility.js',
    file: 'specimens/industrial-utility.js',
    template: true,
  },
  {
    ids: ['paper-editorial'],
    source: 'authored/paper-editorial.js',
    file: 'specimens/paper-editorial.js',
    template: true,
  },
  {
    ids: ['art-deco'],
    source: 'authored/art-deco.js',
    file: 'demo-art-deco.js',
    template: true,
  },
  {
    ids: ['editorial-luxe'],
    source: 'authored/editorial-luxe.js',
    file: 'demo-editorial-lux.js',
    template: true,
  },
  {
    ids: ['neo-noir'],
    source: 'authored/neo-noir.js',
    file: 'demo-neo-noir.js',
    template: true,
  },
  {
    ids: ['clay'],
    source: 'authored/clay.js',
    file: 'demo-clay.js',
    template: true,
  },
  {
    ids: ['organic-modern'],
    source: 'authored/organic-modern.js',
    file: 'demo-organic.js',
    template: true,
  },
  {
    ids: ['bento'],
    source: 'authored/bento.js',
    file: 'demo-bento.js',
    template: true,
  },
  {
    ids: ['bauhaus'],
    source: 'authored/bauhaus.js',
    file: 'demo-bauhaus.js',
    template: true,
  },
  {
    ids: ['minimal-saas', 'neumorphism', 'retrofuturism', 'brutalism', 'y2k', 'data-terminal'],
    source: 'authored/generic.js',
    file: 'specimens/generic.js',
    template: false,
  },
];
