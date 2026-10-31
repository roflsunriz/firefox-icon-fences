import assert from "node:assert/strict";

export const allowed = {
  deepmerge: "https://github.com/advisories/GHSA-gcqx-w48m-w2h4",
  minimatch: "https://github.com/advisories/GHSA-g3hv-75wg-m249",
};

export function validateAuditReport(report, status) {
  assert.ok(status === 0 || status === 1, "npm audit failed to run");
  const vulnerabilities = report?.vulnerabilities;
  assert.ok(
    vulnerabilities &&
      typeof vulnerabilities === "object" &&
      !Array.isArray(vulnerabilities),
  );
  const names = Object.keys(vulnerabilities);
  assert.equal(
    report.metadata?.vulnerabilities?.total,
    names.length,
    "audit totals do not match",
  );
  assert.equal(
    status === 0,
    names.length === 0,
    "audit result and status disagree",
  );
  for (const [name, entry] of Object.entries(vulnerabilities)) {
    assert.equal(entry?.name, name);
    assert.ok(
      Array.isArray(entry.via) && entry.via.length > 0,
      `invalid advisory: ${name}`,
    );
    for (const cause of entry.via) {
      if (typeof cause === "string") {
        assert.ok(
          Object.hasOwn(vulnerabilities, cause),
          `unknown dependency advisory: ${cause}`,
        );
      } else {
        assert.equal(cause?.name, name, `unexpected direct advisory: ${name}`);
        assert.equal(cause?.url, allowed[name], `unhandled advisory: ${name}`);
        assert.equal(entry.via.length, 1, `multiple advisories: ${name}`);
      }
    }
  }
  for (const name of names) {
    const pending = [name];
    const seen = new Set();
    let reachesVerifiedAdvisory = false;
    while (pending.length) {
      const next = pending.pop();
      if (seen.has(next)) continue;
      seen.add(next);
      for (const cause of vulnerabilities[next].via) {
        if (typeof cause === "string") pending.push(cause);
        else reachesVerifiedAdvisory = true;
      }
    }
    assert.ok(
      reachesVerifiedAdvisory,
      `advisory has no verified root: ${name}`,
    );
  }
}
