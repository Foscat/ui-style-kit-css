import fs from 'node:fs';

/**
 * Write one generated artifact while tolerating brief Windows scanner or preview locks.
 *
 * @param {string} filePath Absolute generated-file path.
 * @param {string|Buffer} contents Generated artifact contents.
 * @param {number} [maxAttempts=8] Maximum write attempts before surfacing the error.
 * @returns {Promise<void>} Resolves after the artifact is written.
 */
export async function writeGeneratedFile(filePath, contents, maxAttempts = 8) {
  const transientCodes = new Set(['EACCES', 'EBUSY', 'EPERM', 'UNKNOWN']);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await fs.promises.writeFile(filePath, contents);
      return;
    } catch (error) {
      const isRetryable = error instanceof Error && transientCodes.has(error.code);
      if (!isRetryable || attempt === maxAttempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 25));
    }
  }
}
