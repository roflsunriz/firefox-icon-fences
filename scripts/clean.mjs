import { rm } from "node:fs/promises";
import { distDirectory } from "./project.mjs";

await rm(distDirectory, { recursive: true, force: true });
console.log("dist を削除しました。");
