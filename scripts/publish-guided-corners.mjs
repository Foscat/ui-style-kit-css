/**
 * @module scripts/publish-guided-corners
 * @description Publish only the independently reviewed 2.9.0 artifact through the existing package-owner route.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repository = 'Foscat/ui-style-kit-css';
const version = '2.9.0';
const artifact = 'ui-style-kit-css-2.9.0.tgz';

/**
 * Admit only this patch's verified source and the latest exact-source STE-Adam review.
 * @param {object} evidence Authoritative GitHub and checked-out package evidence.
 * @returns {string} Exact admitted source commit.
 */
export function admitGuidedCornerRelease(evidence) {
  const { sourceSha, actualSha, versions, pr, reviews, verifiedCommit, comparison } = evidence;
  assert.match(sourceSha, /^[a-f0-9]{40}$/);
  assert.equal(actualSha, sourceSha);
  assert.equal(versions.length, 4);
  assert(versions.every((value) => value === version));
  assert.equal(pr.base.repo.full_name, repository);
  assert.equal(pr.base.ref, 'main');
  assert.equal(pr.head.repo.full_name, repository);
  assert.equal(pr.head.sha, sourceSha);
  assert(pr.merged_at);
  assert.match(pr.merge_commit_sha || '', /^[a-f0-9]{40}$/);
  assert.equal(verifiedCommit, true);
  assert(['ahead', 'identical'].includes(comparison));
  assert(reviews.length < 100, 'Review pagination must be resolved before admission');
  const latest = reviews
    .filter((review) => review.user.login === 'STE-Adam')
    .sort((a, b) => b.id - a.id)[0];
  assert(latest && latest.user.login !== pr.user.login);
  assert.equal(latest.state, 'APPROVED');
  assert.equal(latest.commit_id, sourceSha);
  return sourceSha;
}

/**
 * Validate that a continuation artifact came from this trusted workflow and admitted source.
 * @param {object} evidence GitHub workflow-run and artifact API results.
 * @returns {number} Immutable artifact ID to restore.
 */
export function validateGuidedCornerProducer({
  run,
  artifacts,
  producerRun,
  sourceSha,
  approvalPr,
  currentRunId,
  runAttempt,
}) {
  assert.match(producerRun || '', /^[1-9]\d*$/);
  assert.equal(String(run.id), producerRun);
  assert.equal(run.path, '.github/workflows/publish-guided-corners.yml@refs/heads/main');
  assert.equal(run.event, 'workflow_dispatch');
  assert.equal(run.head_branch, 'main');
  assert.equal(run.head_repository.full_name, repository);
  if (run.status === 'in_progress') {
    assert.equal(String(run.id), currentRunId);
    assert(Number(runAttempt) > 1);
  } else {
    assert.equal(run.status, 'completed');
    assert.equal(typeof run.conclusion, 'string');
  }
  assert.match(sourceSha || '', /^[a-f0-9]{40}$/);
  assert.match(approvalPr || '', /^[1-9]\d*$/);
  const matching = artifacts.filter((item) => item.name === `guided-corners-${sourceSha}`);
  assert.equal(matching.length, 1);
  const [artifactInfo] = matching;
  assert.equal(artifactInfo.expired, false);
  assert.match(artifactInfo.digest || '', /^sha256:[a-f0-9]{64}$/);
  assert(Number.isSafeInteger(artifactInfo.id) && artifactInfo.id > 0);
  return artifactInfo.id;
}

/**
 * Execute a fixed program with argument-array boundaries and no credential output on failure.
 * @param {string} program Fixed executable.
 * @param {string[]} args Literal arguments.
 * @returns {string} Successful standard output.
 */
function run(program, args) {
  const result = spawnSync(program, args, {
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.error || result.status !== 0)
    throw new Error(
      `${program} operation failed (${result.status ?? 'launch'}); no credential data emitted`,
    );
  return result.stdout.trim();
}

/**
 * Read one bounded JSON result from the authenticated repository API.
 * @param {string} endpoint Fixed repository endpoint with validated scope.
 * @returns {object} Parsed API result.
 */
function api(endpoint) {
  return JSON.parse(run('gh', ['api', endpoint]));
}

/**
 * Verify that the retained tarball is byte-for-byte identical to its checksum receipt.
 * @param {object} expected Immutable artifact identity.
 * @param {Buffer} bytes Retained tarball contents.
 * @returns {boolean} Whether all recorded checksums and size match.
 */
export function verifyGuidedCornerArtifactBytes(expected, bytes) {
  assert.equal(bytes.length, expected.bytes);
  assert.equal(
    `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
    expected.integrity,
  );
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expected.sha256);
  return true;
}

/**
 * Bind a retained checksum receipt to the admitted source, approval and producing run.
 * @param {object} value Persisted receipt contents.
 * @param {object} expected Current workflow identity.
 * @returns {object} Verified receipt.
 */
export function verifyGuidedCornerReceipt(value, { sourceSha, approvalPr, producerRun }) {
  assert.equal(value.name, 'ui-style-kit-css');
  assert.equal(value.version, version);
  assert.equal(value.filename, artifact);
  assert.equal(value.sourceSha, sourceSha);
  assert.equal(value.approvalPr, approvalPr);
  assert.equal(value.producerRun, producerRun);
  return value;
}

/**
 * Read the immutable checksum receipt produced before publication.
 * @returns {object} Exact artifact identity.
 */
function receipt() {
  const value = JSON.parse(fs.readFileSync('guided-corners-artifact.json', 'utf8'));
  return verifyGuidedCornerReceipt(value, {
    sourceSha: process.env.SOURCE_SHA,
    approvalPr: process.env.APPROVAL_PR,
    producerRun: process.env.PRODUCER_RUN,
  });
}

/**
 * Verify the retained artifact against its prepublication receipt.
 * @returns {object} Verified artifact identity.
 */
function verifyArtifact() {
  const expected = receipt();
  verifyGuidedCornerArtifactBytes(expected, fs.readFileSync(artifact));
  return expected;
}

/**
 * Run a fixed program and return null when it exits unsuccessfully.
 * @param {string} program Fixed executable.
 * @param {string[]} args Literal arguments.
 * @returns {string|null} Successful standard output or null on command failure.
 */
function runIfSuccessful(program, args) {
  const result = spawnSync(program, args, {
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.error)
    throw new Error(
      `${program} operation failed (launch); no credential data emitted`,
    );
  return result.status === 0 ? result.stdout.trim() : null;
}

/**
 * Publish-support commands perform admission, artifact hashing and public byte readback only.
 * The workflow owns the explicit npm publication; no tests or lifecycle hooks are dispatched here.
 * @param {string} mode Fixed workflow phase.
 * @returns {Promise<void>} Completion after the selected phase verifies its boundary.
 */
async function main(mode) {
  const sha = process.env.SOURCE_SHA;
  assert.match(sha || '', /^[a-f0-9]{40}$/);
  assert.equal(process.env.GITHUB_REPOSITORY, repository);
  if (mode === 'admit') {
    assert.match(process.env.APPROVAL_PR || '', /^[1-9]\d*$/);
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    assert.equal(pkg.name, 'ui-style-kit-css');
    const pr = api(`repos/${repository}/pulls/${process.env.APPROVAL_PR}`);
    admitGuidedCornerRelease({
      sourceSha: sha,
      actualSha: run('git', ['rev-parse', 'HEAD']),
      versions: [pkg.version, lock.version, lock.packages[''].version, manifest.version],
      pr,
      reviews: api(`repos/${repository}/pulls/${process.env.APPROVAL_PR}/reviews?per_page=100`),
      verifiedCommit: api(`repos/${repository}/commits/${sha}`).commit.verification.verified,
      comparison: api(`repos/${repository}/compare/${pr.merge_commit_sha}...main`).status,
    });
    console.log(`Admitted independently reviewed ${repository}@${sha} for ${version}`);
  } else if (mode === 'validate-producer') {
    const producerRun = process.env.PRODUCER_RUN;
    assert.match(producerRun || '', /^[1-9]\d*$/);
    const workflowRun = api(`repos/${repository}/actions/runs/${producerRun}`);
    const result = api(`repos/${repository}/actions/runs/${producerRun}/artifacts?per_page=100`);
    const artifactId = validateGuidedCornerProducer({
      run: workflowRun,
      artifacts: result.artifacts,
      producerRun,
      sourceSha: sha,
      approvalPr: process.env.APPROVAL_PR,
      currentRunId: process.env.GITHUB_RUN_ID,
      runAttempt: process.env.GITHUB_RUN_ATTEMPT,
    });
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `artifact_id=${artifactId}\n`);
  } else if (mode === 'attest') {
    const rows = JSON.parse(fs.readFileSync('guided-corners-pack.json', 'utf8'));
    assert.equal(rows.length, 1);
    const packed = rows[0];
    assert.equal(packed.filename, artifact);
    assert.equal(packed.name, 'ui-style-kit-css');
    assert.equal(packed.version, version);
    assert(
      packed.files.every(
        (file) =>
          /^(dist|styles|docs)\//.test(file.path) ||
          [
            'package.json',
            'README.md',
            'LICENSE',
            'CHANGELOG.md',
            'manifest.json',
            'STYLE-MAP.md',
            'CONTRIBUTING.md',
            'SECURITY.md',
          ].includes(file.path),
      ),
      'Unexpected package payload',
    );
    const bytes = fs.readFileSync(artifact);
    const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
    assert.equal(integrity, packed.integrity);
    fs.writeFileSync(
      'guided-corners-artifact.json',
      JSON.stringify(
        {
          name: packed.name,
          version,
          filename: artifact,
          sourceSha: sha,
          approvalPr: process.env.APPROVAL_PR,
          producerRun: process.env.GITHUB_RUN_ID,
          integrity,
          sha256: createHash('sha256').update(bytes).digest('hex'),
          bytes: bytes.length,
          entries: packed.files.length,
        },
        null,
        2,
      ) + '\n',
    );
    verifyArtifact();
  } else if (mode === 'verify-artifact') {
    verifyArtifact();
    console.log(`Verified retained ${artifact} against its prepublication receipt`);
  } else if (mode === 'readback') {
    const expected = verifyArtifact();
    const metadataResponse = await fetch(`https://registry.npmjs.org/ui-style-kit-css/${version}`);
    assert.equal(metadataResponse.status, 200);
    const metadata = await metadataResponse.json();
    assert.equal(metadata.name, expected.name);
    assert.equal(metadata.version, version);
    assert.equal(metadata.dist.integrity, expected.integrity);
    if (metadata.gitHead) assert.equal(metadata.gitHead, sha);
    const url = new URL(metadata.dist.tarball);
    assert.equal(url.origin, 'https://registry.npmjs.org');
    assert.equal(url.pathname, `/ui-style-kit-css/-/${artifact}`);
    const response = await fetch(url);
    assert.equal(response.status, 200);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length, expected.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected.sha256);
    console.log(`Public npm bytes match the admitted ${sha} artifact`);
  } else if (mode === 'release') {
    verifyArtifact();
    const tag = `v${version}`;
    const tagRef = `refs/tags/${tag}`;
    const matchingRefs = api(`repos/${repository}/git/matching-refs/tags/${tag}`).filter(
      (ref) => ref.ref === tagRef,
    );
    assert(matchingRefs.length <= 1);
    if (matchingRefs.length) {
      assert.equal(matchingRefs[0].object.type, 'commit');
      assert.equal(matchingRefs[0].object.sha, sha);
    } else {
      run('gh', [
        'api',
        `repos/${repository}/git/refs`,
        '-X',
        'POST',
        '-f',
        `ref=${tagRef}`,
        '-f',
        `sha=${sha}`,
      ]);
    }

    const title = 'v2.9.0 guided corner customization';
    const existingRelease = runIfSuccessful('gh', [
      'release',
      'view',
      tag,
      '--repo',
      repository,
      '--json',
      'tagName,name',
    ]);
    if (existingRelease) {
      const release = JSON.parse(existingRelease);
      assert.equal(release.tagName, tag);
      assert.equal(release.name, title);
      run('gh', [
        'release',
        'upload',
        tag,
        artifact,
        'guided-corners-artifact.json',
        '--repo',
        repository,
        '--clobber',
      ]);
    } else {
      run('gh', [
        'release',
        'create',
        tag,
        '--repo',
        repository,
        '--verify-tag',
        '--title',
        title,
        '--notes-file',
        'docs/RELEASE-2.9.0.md',
        artifact,
        'guided-corners-artifact.json',
      ]);
    }
    console.log(`Created ${repository} ${tag} with the verified public artifact`);
  } else throw new Error('Unknown focused publication phase');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  await main(process.argv[2]);
