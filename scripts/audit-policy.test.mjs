import assert from "node:assert/strict";
import test from "node:test";
import {
  allowed,
  validateAuditReport,
  verifyDeepmergeLayout,
} from "./audit-policy.mjs";

const fixture = () => ({
  vulnerabilities: {
    deepmerge: {
      name: "deepmerge",
      via: [{ name: "deepmerge", url: allowed.deepmerge }],
    },
    minimatch: {
      name: "minimatch",
      via: [{ name: "minimatch", url: allowed.minimatch }],
    },
    eslint: { name: "eslint", via: ["minimatch", "eslint-utils"] },
    "eslint-utils": { name: "eslint-utils", via: ["eslint"] },
  },
  metadata: { vulnerabilities: { total: 4 } },
});
test("audit allows only verified leaves and checks cyclic parent chains", () => {
  assert.doesNotThrow(() => validateAuditReport(fixture(), 1));
  assert.doesNotThrow(() =>
    validateAuditReport(
      { vulnerabilities: {}, metadata: { vulnerabilities: { total: 0 } } },
      0,
    ),
  );
  const extra = fixture();
  extra.vulnerabilities.deepmerge.via.push({
    name: "deepmerge",
    url: "https://example.invalid/unknown",
  });
  assert.throws(() => validateAuditReport(extra, 1));
  const unknownParent = fixture();
  unknownParent.vulnerabilities.eslint.via.push("unknown");
  assert.throws(() => validateAuditReport(unknownParent, 1));
  const missingUrl = fixture();
  missingUrl.vulnerabilities.other = {
    name: "other",
    via: [{ name: "other" }],
  };
  missingUrl.metadata.vulnerabilities.total++;
  assert.throws(() => validateAuditReport(missingUrl, 1));
  const wrongUrl = fixture();
  wrongUrl.vulnerabilities.minimatch.via[0].url =
    "https://example.invalid/unknown";
  assert.throws(() => validateAuditReport(wrongUrl, 1));
  const cyclic = fixture();
  cyclic.vulnerabilities.eslint.via = ["eslint-utils"];
  assert.throws(() => validateAuditReport(cyclic, 1));
  assert.throws(() => validateAuditReport(fixture(), 0));
  assert.throws(() => validateAuditReport(fixture(), 2));
});

test("all locked deepmerge installations must be reviewed", () => {
  const known = {
    packages: { "node_modules/deepmerge": { version: "4.3.1" } },
  };
  assert.doesNotThrow(() => verifyDeepmergeLayout(known));
  assert.throws(() => verifyDeepmergeLayout({ packages: {} }));
  assert.throws(() =>
    verifyDeepmergeLayout({
      packages: {
        ...known.packages,
        "node_modules/alias": { name: "deepmerge", version: "4.3.1" },
      },
    }),
  );
  assert.throws(() =>
    verifyDeepmergeLayout({
      packages: { "node_modules/deepmerge": { version: "5.0.0" } },
    }),
  );
  assert.throws(() =>
    verifyDeepmergeLayout({
      packages: {
        ...known.packages,
        "node_modules/other/node_modules/deepmerge": { version: "4.3.1" },
      },
    }),
  );
});
