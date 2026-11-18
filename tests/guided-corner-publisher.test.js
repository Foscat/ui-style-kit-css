import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  admitGuidedCornerRelease,
  verifyGuidedCornerArtifactBytes,
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
      user: { login: 'Foscat' },
      base: { repo: { full_name: 'Foscat/ui-style-kit-css' } },
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
    { pr: { ...valid.pr, merged_at: null } },
    { pr: { ...valid.pr, user: { login: 'STE-Adam' } } },
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
