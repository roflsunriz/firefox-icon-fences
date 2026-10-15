import { readFileSync, writeFileSync } from "node:fs";
import {
  applyVerifiedPatch,
  forgeSourcePath,
  verifyPatchIdentity,
  verifyPatchedForge,
} from "./node-forge-security.mjs";

verifyPatchIdentity();
const source = readFileSync(forgeSourcePath, "utf8");
const patched = applyVerifiedPatch(source);
if (source !== patched) writeFileSync(forgeSourcePath, patched, "utf8");
verifyPatchedForge();
console.log(
  "node-forge 1.4.0: verified DigestAlgorithm structure patch applied",
);
