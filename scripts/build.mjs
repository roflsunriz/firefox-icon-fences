import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  extensionDirectory,
  generatedExtensionsDirectory,
  readProject,
  rootDirectory,
} from "./project.mjs";

const { packageJson, fences } = await readProject();
const manifestTemplate = await readFile(
  path.join(rootDirectory, "src", "manifest.template.json"),
  "utf8",
);
const localeTemplateDirectory = path.join(rootDirectory, "src", "locales");
const localeFilenames = (await readdir(localeTemplateDirectory)).filter(
  (name) => name.endsWith(".json"),
);

await rm(generatedExtensionsDirectory, { recursive: true, force: true });

for (const fence of fences) {
  const destination = extensionDirectory(fence.number);
  const localeDestination = path.join(destination, "_locales");
  await Promise.all([
    mkdir(localeDestination, { recursive: true }),
    cp(
      path.join(rootDirectory, "src", "icons"),
      path.join(destination, "icons"),
      {
        recursive: true,
      },
    ),
  ]);

  const manifest = render(manifestTemplate, {
    ID: fence.id,
    VERSION: packageJson.version,
  });
  JSON.parse(manifest);
  await writeFile(path.join(destination, "manifest.json"), manifest, "utf8");

  for (const localeFilename of localeFilenames) {
    const template = await readFile(
      path.join(localeTemplateDirectory, localeFilename),
      "utf8",
    );
    const messages = render(template, { NUMBER: String(fence.number) });
    JSON.parse(messages);
    const locale = path.basename(localeFilename, ".json");
    const localeDirectory = path.join(localeDestination, locale);
    await mkdir(localeDirectory, { recursive: true });
    await writeFile(
      path.join(localeDirectory, "messages.json"),
      messages,
      "utf8",
    );
  }
}

console.log(
  `${fences.length}個の拡張機能ソースを ${path.relative(rootDirectory, generatedExtensionsDirectory)} に生成しました。`,
);

function render(template, replacements) {
  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  );
}
