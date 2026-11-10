import test from "node:test";
import assert from "node:assert/strict";
import { admitFocusedPatch } from "../scripts/publish-select-patch.mjs";

/** Refuse publication when source, package identity or the exact independent review diverges. */
test("focused patch admission binds repository, source, version and independent current review", () => {
  const sha = "a".repeat(40);
  const valid = {
    sourceSha: sha,
    actualSha: sha,
    versions: ["2.7.2", "2.7.2", "2.7.2", "2.7.2"],
    pr: {
      merged_at: "2026-11-10T20:00:00Z",
      user: { login: "Foscat" },
      base: { repo: { full_name: "Foscat/ui-style-kit-css" } },
      head: { sha, repo: { full_name: "Foscat/ui-style-kit-css" } },
    },
    reviews: [
      { id: 1, user: { login: "STE-Adam" }, state: "APPROVED", commit_id: sha },
    ],
    verifiedCommit: true,
    comparison: "ahead",
  };
  assert.equal(admitFocusedPatch(valid), sha);
  const bad = [
    { sourceSha: "main" },
    { actualSha: "b".repeat(40) },
    { versions: ["2.7.2", "2.7.3", "2.7.2", "2.7.2"] },
    { verifiedCommit: false },
    { comparison: "diverged" },
    { pr: { ...valid.pr, merged_at: null } },
    { pr: { ...valid.pr, head: { ...valid.pr.head, sha: "b".repeat(40) } } },
    { pr: { ...valid.pr, base: { repo: { full_name: "someone/other" } } } },
    { reviews: [{ ...valid.reviews[0], user: { login: "Foscat" } }] },
    { reviews: [{ ...valid.reviews[0], commit_id: "b".repeat(40) }] },
    {
      reviews: [
        ...valid.reviews,
        { ...valid.reviews[0], id: 2, state: "CHANGES_REQUESTED" },
      ],
    },
    { reviews: [] },
  ];
  for (const change of bad)
    assert.throws(() => admitFocusedPatch({ ...valid, ...change }));
});
