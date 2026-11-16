/** Lints authored studio code without changing unrelated library conventions. */
const globals = Object.fromEntries(
  [
    'window',
    'document',
    'location',
    'parent',
    'navigator',
    'history',
    'crypto',
    'matchMedia',
    'ResizeObserver',
    'EventTarget',
    'AbortController',
    'Option',
    'URL',
    'URLSearchParams',
    'Blob',
    'setTimeout',
    'clearTimeout',
    'addEventListener',
    'getComputedStyle',
    'console',
    'process',
  ].map((name) => [name, 'readonly']),
);
export default [
  {
    files: [
      'demo/studio/**/*.js',
      'scripts/build-studio.mjs',
      'scripts/serve-studio.mjs',
      'scripts/generate-studio-docs.mjs',
    ],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      eqeqeq: ['error', 'always'],
      'no-unreachable': 'error',
      'no-dupe-args': 'error',
      'no-duplicate-case': 'error',
      'no-constant-condition': 'error',
      'no-async-promise-executor': 'error',
    },
  },
];
