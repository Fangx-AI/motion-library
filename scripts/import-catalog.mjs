import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

export const SNAPSHOT_COMMIT = "2ff3da3f72385c7944f53faac253f2a6f5bbf936";
export const SNAPSHOT_SHA256 =
  "85132553d44a29d00950ae70ff0551e7cb049bd352e267ca98454887911ca275";
const SOURCE_ROOT = `https://raw.githubusercontent.com/guanmo-ai/awesome-ai-motion/${SNAPSHOT_COMMIT}/`;
const SOURCE_URL = `${SOURCE_ROOT}data/cases.json`;
const repoRoot = fileURLToPath(new URL("../", import.meta.url));

function keepFields(object = {}, fields) {
  return Object.fromEntries(
    fields
      .filter((key) => object[key] !== undefined && object[key] !== null)
      .map((key) => [key, object[key]]),
  );
}

/** A projection of the public, fixed upstream snapshot. No inferred prompts. */
export function exportWorks(catalog) {
  if (!Array.isArray(catalog.cases) || catalog.cases.length !== 441)
    throw Error("The fixed snapshot must contain 441 cases.");
  const seen = new Set();
  return catalog.cases.map((item) => {
    if (!item.id || seen.has(item.id))
      throw Error("Missing or duplicate case ID.");
    seen.add(item.id);
    const prompt = item.prompt || {};
    if (
      prompt.display === "source_link" &&
      (prompt.text || prompt.translationZh)
    )
      throw Error(
        `Source-link-only case ${item.id} cannot contain prompt text.`,
      );
    return {
      id: item.id,
      title: item.title,
      summary: item.summary,
      category: item.category,
      author: item.author,
      source: item.source.url,
      date: item.source.publishedAt,
      model: item.model?.name || "",
      modelEvidence: keepFields(item.model, [
        "basis",
        "evidenceQuote",
        "evidenceUrl",
      ]),
      cover: `${SOURCE_ROOT}${item.cover.path}`,
      duration: item.media?.durationSeconds,
      video: item.webPlayback?.url || "",
      bookmarks: item.metrics?.bookmarks || 0,
      metricsCheckedAt: item.metrics?.checkedAt,
      stage: item.stage,
      verification: keepFields(item.verification, [
        "sourceReadAt",
        "authorClaimConfirmed",
        "videoAttachmentConfirmed",
        "fullReview",
        "independentlyReproduced",
        "promptMatchedSource",
      ]),
      ...(item.demoUrl ? { demoUrl: item.demoUrl } : {}),
      ...(item.guide
        ? {
            guide: {
              takeawayZh: item.guide.takeawayZh || "",
              stepsZh: item.guide.stepsZh || [],
              tools: item.guide.tools || [],
              evidenceUrls: item.guide.evidenceUrls || [],
              attribution: "Awesome AI Motion 整理说明",
            },
          }
        : {}),
      prompt: {
        ...keepFields(prompt, ["status", "sourceUrl", "checkedAt", "language"]),
        text: prompt.text || "",
        translationZh: prompt.translationZh || "",
        noteZh: prompt.noteZh || "",
        display: prompt.display || "",
      },
      resources: (item.resources || []).map((resource) =>
        keepFields(resource, [
          "kind",
          "url",
          "label",
          "license",
          "licenseUrl",
          "note",
          "evidenceUrl",
          "checkedAt",
        ]),
      ),
    };
  });
}

export async function importCatalog(inputPath) {
  const text = inputPath
    ? await fs.readFile(path.resolve(inputPath), "utf8")
    : await fetch(SOURCE_URL, { signal: AbortSignal.timeout(30_000) }).then(
        (response) => {
          if (!response.ok)
            throw Error(`Upstream snapshot returned HTTP ${response.status}.`);
          return response.text();
        },
      );
  const normalized = text.replace(/\r\n/g, "\n");
  const hash = createHash("sha256").update(normalized).digest("hex");
  if (hash !== SNAPSHOT_SHA256)
    throw Error(
      "Snapshot checksum mismatch. Refusing to replace the public catalog.",
    );
  const works = exportWorks(JSON.parse(normalized));
  await fs.mkdir(path.join(repoRoot, "dist"), { recursive: true });
  await fs.writeFile(
    path.join(repoRoot, "dist/works.json"),
    JSON.stringify(works),
  );
  return {
    works: works.length,
    originalPrompts: works.filter(
      (w) => w.prompt.status === "original" && w.prompt.text.trim(),
    ).length,
    codeWorks: works.filter((w) => w.resources.some((r) => r.kind === "code"))
      .length,
    guides: works.filter((w) => w.guide).length,
    demoUrls: works.filter((w) => w.demoUrl).length,
    licenseUrls: works.flatMap((w) => w.resources).filter((r) => r.licenseUrl)
      .length,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  importCatalog(process.argv[2])
    .then((counts) => console.log(counts))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
