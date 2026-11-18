import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  admitGuidedCornerRelease,
  validateGuidedCornerProducer,
  verifyGuidedCornerArtifactBytes,
  verifyGuidedCornerReceipt,
} from '../scripts/publish-guided-corners.mjs';

/** Keep the artifact-only route fixed to signed, merged and independently current-reviewed 2.9.0 source. */
test('guided release admission binds exact source and preserves independent review controls', () => {
  const sha = 'a'.repeat(40);
  const valid = {
    sourceSha: sha,
    actualSha: sha,
    versions: Array(4).fill('2.9.0'),
    verifiedCommit: true,
    comparison: 'ahead',
    pr: {
      merged_at: '2026-11-17T23:00:00Z',
      merge_commit_sha: 'c'.repeat(40),
      user: { login: 'Foscat' },
      base: { ref: 'main', repo: { full_name: 'Foscat/ui-style-kit-css' } },
      head: { sha, repo: { full_name: 'Foscat/ui-style-kit-css' } },
    },
    reviews: [{ id: 1, state: 'APPROVED', commit_id: sha, user: { login: 'STE-Adam' } }],
  };
  assert.equal(admitGuidedCornerRelease(valid), sha);
  for (const changed of [
    { actualSha: 'b'.repeat(40) },
    { versions: Array(4).fill('2.7.2') },
    { versions: ['2.9.0', '2.8.0', '2.9.0', '2.9.0'] },
    { verifiedCommit: false },
    { comparison: 'diverged' },
    { comparison: 'behind' },
    { pr: { ...valid.pr, merged_at: null } },
    { pr: { ...valid.pr, user: { login: 'STE-Adam' } } },
    { pr: { ...valid.pr, base: { ...valid.pr.base, ref: 'release' } } },
    { pr: { ...valid.pr, merge_commit_sha: null } },
    { reviews: [] },
    { reviews: [{ ...valid.reviews[0], commit_id: 'b'.repeat(40) }] },
    { reviews: [...valid.reviews, { ...valid.reviews[0], id: 2, state: 'CHANGES_REQUESTED' }] },
    { pr: { ...valid.pr, base: { repo: { full_name: 'someone/other' } } } },
  ])
    assert.throws(() => admitGuidedCornerRelease({ ...valid, ...changed }));
});

test('guided release continuation verifies the retained tarball against its receipt', () => {
  const bytes = Buffer.from('original published artifact');
  const expected = {
    bytes: bytes.length,
    integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
  assert.equal(verifyGuidedCornerArtifactBytes(expected, bytes), true);
  assert.throws(() => verifyGuidedCornerArtifactBytes(expected, Buffer.from('changed artifact')));
  assert.throws(() =>
    verifyGuidedCornerArtifactBytes({ ...expected, integrity: 'sha512-invalid' }, bytes),
  );
});

test('guided receipt binds the admitted source, approval PR, and producer run', () => {
  const receipt = {
    name: 'ui-style-kit-css',
    version: '2.9.0',
    filename: 'ui-style-kit-css-2.9.0.tgz',
    sourceSha: 'a'.repeat(40),
    approvalPr: '67',
    producerRun: '12345',
  };
  const expected = {
    sourceSha: receipt.sourceSha,
    approvalPr: receipt.approvalPr,
    producerRun: receipt.producerRun,
  };
  assert.equal(verifyGuidedCornerReceipt(receipt, expected), receipt);
  for (const changed of [
    { sourceSha: 'b'.repeat(40) },
    { approvalPr: '68' },
    { producerRun: '54321' },
  ])
    assert.throws(() => verifyGuidedCornerReceipt(receipt, { ...expected, ...changed }));
});

test('guided release continuation accepts only the exact trusted workflow artifact', () => {
  const sourceSha = 'a'.repeat(40);
  const producerRun = '12345';
  const artifact = {
    id: 67890,
    name: `guided-corners-${sourceSha}`,
    expired: false,
    digest: `sha256:${'b'.repeat(64)}`,
  };
  const evidence = {
    producerRun,
    sourceSha,
    approvalPr: '67',
    currentRunId: '54321',
    runAttempt: '1',
    run: {
      id: Number(producerRun),
      path: '.github/workflows/publish-guided-corners.yml@refs/heads/main',
      event: 'workflow_dispatch',
      head_branch: 'main',
      head_repository: { full_name: 'Foscat/ui-style-kit-css' },
      status: 'completed',
      conclusion: 'failure',
    },
    artifacts: [artifact],
  };
  assert.equal(validateGuidedCornerProducer(evidence), artifact.id);
  for (const changed of [
    { run: { ...evidence.run, path: '.github/workflows/other.yml@refs/heads/main' } },
    { run: { ...evidence.run, event: 'push' } },
    { run: { ...evidence.run, head_branch: 'release' } },
    { run: { ...evidence.run, head_repository: { full_name: 'someone/else' } } },
    { run: { ...evidence.run, conclusion: null } },
    {
      run: { ...evidence.run, status: 'in_progress', conclusion: null },
      currentRunId: '12345',
      runAttempt: '1',
    },
    { artifacts: [{ ...artifact, expired: true }] },
    { artifacts: [{ ...artifact, digest: null }] },
    { artifacts: [{ ...artifact, name: 'guided-corners-other' }] },
    { artifacts: [artifact, artifact] },
  ])
    assert.throws(() => validateGuidedCornerProducer({ ...evidence, ...changed }));
  assert.equal(
    validateGuidedCornerProducer({
      ...evidence,
      run: { ...evidence.run, status: 'in_progress', conclusion: null },
      currentRunId: producerRun,
      runAttempt: '2',
    }),
    artifact.id,
  );
});
