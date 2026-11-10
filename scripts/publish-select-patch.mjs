import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repository = "Foscat/ui-style-kit-css";
const version = "2.7.2";
const artifact = "ui-style-kit-css-2.7.2.tgz";

/**
 * Admit only this patch's verified source and the latest exact-source STE-Adam review.
 * @param {object} evidence Authoritative GitHub and checked-out package evidence.
 * @returns {string} Exact admitted source commit.
 */
export function admitFocusedPatch(evidence) {
  const {
    sourceSha,
    actualSha,
    versions,
    pr,
    reviews,
    verifiedCommit,
    comparison,
  } = evidence;
  assert.match(sourceSha, /^[a-f0-9]{40}$/);
  assert.equal(actualSha, sourceSha);
  assert.equal(versions.length, 4);
  assert(versions.every((value) => value === version));
  assert.equal(pr.base.repo.full_name, repository);
  assert.equal(pr.head.repo.full_name, repository);
  assert.equal(pr.head.sha, sourceSha);
  assert(pr.merged_at);
  assert.equal(verifiedCommit, true);
  assert(["ahead", "identical"].includes(comparison));
  assert(
    reviews.length < 100,
    "Review pagination must be resolved before admission",
  );
  const latest = reviews
    .filter((review) => review.user.login === "STE-Adam")
    .sort((a, b) => b.id - a.id)[0];
  assert(latest && latest.user.login !== pr.user.login);
  assert.equal(latest.state, "APPROVED");
  assert.equal(latest.commit_id, sourceSha);
  return sourceSha;
}

/**
 * Execute a fixed program with argument-array boundaries and no credential output on failure.
 * @param {string} program Fixed executable.
 * @param {string[]} args Literal arguments.
 * @returns {string} Successful standard output.
 */
function run(program, args) {
  const result = spawnSync(program, args, {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.error || result.status !== 0)
    throw new Error(
      `${program} operation failed (${result.status ?? "launch"}); no credential data emitted`,
    );
  return result.stdout.trim();
}

/**
 * Read one bounded JSON result from the authenticated repository API.
 * @param {string} endpoint Fixed repository endpoint with validated scope.
 * @returns {object} Parsed API result.
 */
function api(endpoint) {
  return JSON.parse(run("gh", ["api", endpoint]));
}

/**
 * Read the immutable checksum receipt produced before publication.
 * @returns {object} Exact artifact identity.
 */
function receipt() {
  const value = JSON.parse(
    fs.readFileSync("select-patch-artifact.json", "utf8"),
  );
  assert.equal(value.name, "ui-style-kit-css");
  assert.equal(value.version, version);
  assert.equal(value.filename, artifact);
  assert.equal(value.sourceSha, process.env.SOURCE_SHA);
  return value;
}

/**
 * Publish-support commands perform admission, artifact hashing and public byte readback only.
 * The workflow owns the explicit npm publication; no tests or lifecycle hooks are dispatched here.
 * @param {string} mode Fixed workflow phase.
 * @returns {Promise<void>} Completion after the selected phase verifies its boundary.
 */
async function main(mode) {
  const sha = process.env.SOURCE_SHA;
  assert.match(sha || "", /^[a-f0-9]{40}$/);
  assert.equal(process.env.GITHUB_REPOSITORY, repository);
  if (mode === "admit") {
    assert.match(process.env.APPROVAL_PR || "", /^[1-9]\d*$/);
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
    const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
    assert.equal(pkg.name, "ui-style-kit-css");
    const pr = api(`repos/${repository}/pulls/${process.env.APPROVAL_PR}`);
    admitFocusedPatch({
      sourceSha: sha,
      actualSha: run("git", ["rev-parse", "HEAD"]),
      versions: [
        pkg.version,
        lock.version,
        lock.packages[""].version,
        manifest.version,
      ],
      pr,
      reviews: api(
        `repos/${repository}/pulls/${process.env.APPROVAL_PR}/reviews?per_page=100`,
      ),
      verifiedCommit: api(`repos/${repository}/commits/${sha}`).commit
        .verification.verified,
      comparison: api(`repos/${repository}/compare/${sha}...main`).status,
    });
    console.log(
      `Admitted independently reviewed ${repository}@${sha} for ${version}`,
    );
  } else if (mode === "attest") {
    const rows = JSON.parse(fs.readFileSync("select-patch-pack.json", "utf8"));
    assert.equal(rows.length, 1);
    const packed = rows[0];
    assert.equal(packed.filename, artifact);
    assert.equal(packed.name, "ui-style-kit-css");
    assert.equal(packed.version, version);
    assert(
      packed.files.every(
        (file) =>
          /^(dist|styles|docs)\//.test(file.path) ||
          [
            "package.json",
            "README.md",
            "LICENSE",
            "CHANGELOG.md",
            "manifest.json",
            "STYLE-MAP.md",
            "CONTRIBUTING.md",
            "SECURITY.md",
          ].includes(file.path),
      ),
      "Unexpected package payload",
    );
    const bytes = fs.readFileSync(artifact);
    const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
    assert.equal(integrity, packed.integrity);
    fs.writeFileSync(
      "select-patch-artifact.json",
      JSON.stringify(
        {
          name: packed.name,
          version,
          filename: artifact,
          sourceSha: sha,
          integrity,
          sha256: createHash("sha256").update(bytes).digest("hex"),
          bytes: bytes.length,
          entries: packed.files.length,
        },
        null,
        2,
      ) + "\n",
    );
  } else if (mode === "readback") {
    const expected = receipt();
    const metadataResponse = await fetch(
      `https://registry.npmjs.org/ui-style-kit-css/${version}`,
    );
    assert.equal(metadataResponse.status, 200);
    const metadata = await metadataResponse.json();
    assert.equal(metadata.name, expected.name);
    assert.equal(metadata.version, version);
    assert.equal(metadata.dist.integrity, expected.integrity);
    if (metadata.gitHead) assert.equal(metadata.gitHead, sha);
    const url = new URL(metadata.dist.tarball);
    assert.equal(url.origin, "https://registry.npmjs.org");
    assert.equal(url.pathname, `/ui-style-kit-css/-/${artifact}`);
    const response = await fetch(url);
    assert.equal(response.status, 200);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length, expected.bytes);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      expected.sha256,
    );
    console.log(`Public npm bytes match the admitted ${sha} artifact`);
  } else if (mode === "release") {
    receipt();
    const tag = `v${version}`;
    run("gh", [
      "api",
      `repos/${repository}/git/refs`,
      "-X",
      "POST",
      "-f",
      `ref=refs/tags/${tag}`,
      "-f",
      `sha=${sha}`,
    ]);
    run("gh", [
      "release",
      "create",
      tag,
      "--repo",
      repository,
      "--verify-tag",
      "--title",
      "v2.7.2 native select affordance patch",
      "--notes-file",
      "docs/RELEASE-2.7.2.md",
      artifact,
      "select-patch-artifact.json",
    ]);
    console.log(
      `Created ${repository} ${tag} with the verified public artifact`,
    );
  } else throw new Error("Unknown focused publication phase");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  await main(process.argv[2]);
