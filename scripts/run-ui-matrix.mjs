import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const defaultBlockCount = 36;
const defaultProjects = ['chromium', 'firefox', 'webkit'];

/**
 * Assert that a value is a positive integer.
 *
 * @param {number} value Candidate integer.
 * @param {string} label Human-readable option name.
 * @returns {number} Validated value.
 */
function positiveInteger(value, label) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return value;
}

/**
 * Divide an ordered test matrix into stable contiguous blocks.
 *
 * @param {number} totalCases Total number of global cases.
 * @param {number} blockCount Number of blocks to create.
 * @returns {Array<{number: number, start: number, end: number}>} Inclusive block ranges.
 */
export function createMatrixBlocks(totalCases, blockCount = defaultBlockCount) {
  positiveInteger(totalCases, 'totalCases');
  positiveInteger(blockCount, 'blockCount');

  if (blockCount > totalCases) {
    throw new Error('blockCount cannot exceed totalCases.');
  }

  return Array.from({ length: blockCount }, (_, index) => ({
    number: index + 1,
    start: Math.floor((index * totalCases) / blockCount) + 1,
    end: Math.floor(((index + 1) * totalCases) / blockCount)
  }));
}

/**
 * Resolve a global matrix case to its browser project and project-local index.
 *
 * @param {number} globalCase One-based global case number.
 * @param {number} logicalCaseCount Cases executed by each browser project.
 * @param {string[]} projects Ordered Playwright project names.
 * @returns {{globalCase: number, project: string, projectIndex: number, localCase: number}} Resolved case.
 */
export function locateGlobalMatrixCase(globalCase, logicalCaseCount, projects = defaultProjects) {
  positiveInteger(globalCase, 'globalCase');
  positiveInteger(logicalCaseCount, 'logicalCaseCount');

  const totalCases = logicalCaseCount * projects.length;
  if (globalCase > totalCases) {
    throw new Error(`globalCase must be between 1 and ${totalCases}.`);
  }

  const projectIndex = Math.floor((globalCase - 1) / logicalCaseCount);

  return {
    globalCase,
    project: projects[projectIndex],
    projectIndex,
    localCase: ((globalCase - 1) % logicalCaseCount) + 1
  };
}

/**
 * Split a global range into the minimum browser-specific Playwright slices.
 *
 * @param {number} globalStart Inclusive global start case.
 * @param {number} globalEnd Inclusive global end case.
 * @param {number} logicalCaseCount Cases executed by each browser project.
 * @param {string[]} projects Ordered Playwright project names.
 * @returns {Array<{project: string, globalStart: number, globalEnd: number, localStart: number, localEnd: number}>} Browser slices.
 */
export function projectSlicesForRange(globalStart, globalEnd, logicalCaseCount, projects = defaultProjects) {
  positiveInteger(globalStart, 'globalStart');
  positiveInteger(globalEnd, 'globalEnd');
  positiveInteger(logicalCaseCount, 'logicalCaseCount');

  const totalCases = logicalCaseCount * projects.length;
  if (globalStart > globalEnd || globalEnd > totalCases) {
    throw new Error(`Matrix range must be ordered and remain between 1 and ${totalCases}.`);
  }

  return projects.flatMap((project, projectIndex) => {
    const projectGlobalStart = projectIndex * logicalCaseCount + 1;
    const projectGlobalEnd = projectGlobalStart + logicalCaseCount - 1;
    const sliceStart = Math.max(globalStart, projectGlobalStart);
    const sliceEnd = Math.min(globalEnd, projectGlobalEnd);

    if (sliceStart > sliceEnd) return [];

    return [{
      project,
      globalStart: sliceStart,
      globalEnd: sliceEnd,
      localStart: sliceStart - projectGlobalStart + 1,
      localEnd: sliceEnd - projectGlobalStart + 1
    }];
  });
}

/**
 * Read a numeric command-line option in either `--name value` or `--name=value` form.
 *
 * @param {string[]} args Command-line arguments.
 * @param {string} name Option name without leading dashes.
 * @returns {number|undefined} Parsed integer when supplied.
 */
function numericOption(args, name) {
  const equalsPrefix = `--${name}=`;
  const equalsArgument = args.find((argument) => argument.startsWith(equalsPrefix));
  if (equalsArgument) return Number.parseInt(equalsArgument.slice(equalsPrefix.length), 10);

  const optionIndex = args.indexOf(`--${name}`);
  if (optionIndex === -1) return undefined;

  return Number.parseInt(args[optionIndex + 1], 10);
}

/**
 * Execute one browser-specific matrix slice without enumerating unrelated cases.
 *
 * @param {{project: string, globalStart: number, globalEnd: number, localStart: number, localEnd: number}} slice Matrix slice.
 * @param {number} totalCases Total number of global cases.
 * @returns {number} Playwright process exit code.
 */
function runPlaywrightSlice(slice, totalCases) {
  const cliPath = path.join(rootDir, 'node_modules', '@playwright', 'test', 'cli.js');
  const childEnvironment = { ...process.env };

  delete childEnvironment.UI_MATRIX_PRESET_SHARD;
  delete childEnvironment.UI_MATRIX_PRESET_SHARDS;
  childEnvironment.UI_MATRIX_CASE_START = String(slice.localStart);
  childEnvironment.UI_MATRIX_CASE_END = String(slice.localEnd);
  childEnvironment.UI_MATRIX_GLOBAL_OFFSET = String(slice.globalStart - slice.localStart);
  childEnvironment.UI_MATRIX_GLOBAL_TOTAL = String(totalCases);

  const result = spawnSync(
    process.execPath,
    [cliPath, 'test', '--config', 'playwright.matrix.config.js', `--project=${slice.project}`],
    {
      cwd: rootDir,
      env: childEnvironment,
      stdio: 'inherit'
    }
  );

  if (result.error) throw result.error;
  return result.status ?? 1;
}

/**
 * Execute an inclusive global case range and stop at the first failing browser slice.
 *
 * @param {number} globalStart Inclusive global start case.
 * @param {number} globalEnd Inclusive global end case.
 * @param {number} logicalCaseCount Cases executed by each browser project.
 * @param {number} totalCases Total number of global cases.
 * @returns {number} Zero when every selected case passes, otherwise the first failing exit code.
 */
function runRange(globalStart, globalEnd, logicalCaseCount, totalCases) {
  for (const slice of projectSlicesForRange(globalStart, globalEnd, logicalCaseCount)) {
    console.log(
      `Running matrix cases ${slice.globalStart}-${slice.globalEnd} of ${totalCases} ` +
      `(${slice.project}, local ${slice.localStart}-${slice.localEnd}).`
    );
    const exitCode = runPlaywrightSlice(slice, totalCases);
    if (exitCode !== 0) return exitCode;
  }

  return 0;
}

/**
 * Run the requested block, range, exact case, or resumable block sequence.
 *
 * @param {string[]} args Command-line arguments after the script name.
 * @returns {number} Process exit code.
 */
function main(args) {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
  const logicalCaseCount = manifest.presets.length * manifest.themes.length * manifest.modes.length;
  const totalCases = logicalCaseCount * defaultProjects.length;
  const action = args[0] || 'blocks';
  const blockCount = numericOption(args, 'blocks') ?? defaultBlockCount;
  const blocks = createMatrixBlocks(totalCases, blockCount);

  if (action === 'case') {
    const globalCase = positiveInteger(numericOption(args, 'case'), '--case');
    const resolved = locateGlobalMatrixCase(globalCase, logicalCaseCount);
    console.log(`Running only matrix case ${globalCase} of ${totalCases}: ${resolved.project} local case ${resolved.localCase}.`);
    return runRange(globalCase, globalCase, logicalCaseCount, totalCases);
  }

  if (action === 'range') {
    const globalStart = positiveInteger(numericOption(args, 'from'), '--from');
    const globalEnd = positiveInteger(numericOption(args, 'to'), '--to');
    return runRange(globalStart, globalEnd, logicalCaseCount, totalCases);
  }

  if (action === 'block') {
    const blockNumber = positiveInteger(numericOption(args, 'block'), '--block');
    const block = blocks[blockNumber - 1];
    if (!block) throw new Error(`--block must be between 1 and ${blockCount}.`);
    console.log(`Running matrix block ${block.number}/${blockCount}; cases ${block.start}-${block.end}.`);
    return runRange(block.start, block.end, logicalCaseCount, totalCases);
  }

  if (action !== 'blocks') {
    throw new Error(`Unknown matrix action: ${action}.`);
  }

  const firstBlock = positiveInteger(numericOption(args, 'from-block') ?? 1, '--from-block');
  const lastBlock = positiveInteger(numericOption(args, 'to-block') ?? blockCount, '--to-block');
  if (firstBlock > lastBlock || lastBlock > blockCount) {
    throw new Error(`Block range must be ordered and remain between 1 and ${blockCount}.`);
  }

  console.log(`Running matrix blocks ${firstBlock}-${lastBlock} of ${blockCount}; earlier blocks will not be repeated.`);
  for (const block of blocks.slice(firstBlock - 1, lastBlock)) {
    console.log(`\nMatrix block ${block.number}/${blockCount}: global cases ${block.start}-${block.end}.`);
    const exitCode = runRange(block.start, block.end, logicalCaseCount, totalCases);
    if (exitCode !== 0) {
      const resumeInstruction = block.number < blockCount
        ? ` After those cases pass, continue with \`npm run test:matrix -- --from-block ${block.number + 1}\`.`
        : ' This was the final block.';
      console.error(
        `Matrix block ${block.number} failed. Rerun each failing [matrix N/${totalCases}] case with ` +
        '`npm run test:matrix:case -- --case N`.' + resumeInstruction
      );
      return exitCode;
    }
  }

  return 0;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
