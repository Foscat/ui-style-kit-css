/**
 * @module scripts/write-generated-file
 * @description Preserve identical generated artifacts and retry transient Windows output locks.
 */
import fs from 'node:fs';

/** Writes changed bytes only, preserving timestamps and watcher state for identical output.
 * @param {string} filePath Absolute generated-file path.
 * @param {string|Buffer} contents Generated artifact contents.
 * @param {number} [maxAttempts=8] Maximum attempts for transient filesystem locks.
 * @returns {Promise<void>} Resolves after matching bytes exist at the target.
 */
export async function writeGeneratedFile(filePath, contents, maxAttempts = 8) {
  const transientCodes = new Set(['EACCES', 'EBUSY', 'EPERM', 'UNKNOWN']);
  const bytes = Buffer.isBuffer(contents) ? contents : Buffer.from(contents);
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      let previous;
      try {
        previous = await fs.promises.readFile(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      if (previous?.equals(bytes)) return;
      await fs.promises.writeFile(filePath, contents);
      return;
    } catch (error) {
      const isRetryable = error instanceof Error && transientCodes.has(error.code);
      if (!isRetryable || attempt === maxAttempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 25));
    }
  }
}

/** Copies generated binary or text assets using the same unchanged-output and retry contract.
 * @param {string} sourcePath Trusted source asset.
 * @param {string} targetPath Generated destination.
 * @returns {Promise<void>} Resolves when the destination contains the source bytes.
 */
export async function copyGeneratedFile(sourcePath, targetPath) {
  await writeGeneratedFile(targetPath, await fs.promises.readFile(sourcePath));
}
