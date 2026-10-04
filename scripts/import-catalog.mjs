import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

export const SNAPSHOT_COMMIT = "2ff3da3f72385c7944f53faac253f2a6f5bbf936";
export const SNAPSHOT_SHA256 =
  "85132553d44a29d00950ae70ff0551e7cb049bd352e267ca98454887911ca275";
export const SOURCE_REPOSITORY = "https://github.com/guanmo-ai/awesome-ai-motion";
const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const defaultOutput = path.join(repoRoot, "dist/works.json");

export const sha256 = (text) => createHash("sha256").update(text).digest("hex");

function verifiedRevision(options = {}) {
  if ((options.commit === undefined) !== (options.sha256 === undefined))
    throw Error("Provide both the verified commit and source SHA-256.");
  const commit = options.commit ?? SNAPSHOT_COMMIT;
  const sourceHash = options.sha256 ?? SNAPSHOT_SHA256;
  if (typeof commit !== "string" || !/^[a-f0-9]{40}$/i.test(commit))
    throw Error("The verified commit must be a full 40-character Git SHA.");
  if (typeof sourceHash !== "string" || !/^[a-f0-9]{64}$/i.test(sourceHash))
    throw Error("The source checksum must be a 64-character SHA-256.");
  return { commit: commit.toLowerCase(), sha256: sourceHash.toLowerCase() };
}

function requiredText(value, field, id) {
  if (typeof value !== "string" || !value.trim())
    throw Error(`Missing or invalid ${field} for case ${id ?? "unknown"}.`);
}

function publicUrl(value, field, id) {
  requiredText(value, field, id);
  let url;
  try { url = new URL(value); } catch { throw Error(`Invalid ${field} for case ${id}.`); }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password)
    throw Error(`Invalid public ${field} for case ${id}.`);
}

function checkPrompt(prompt, id) {
  if (!prompt || typeof prompt !== "object" || Array.isArray(prompt))
    throw Error(`Missing or invalid prompt record for case ${id}.`);
  for (const field of ["text", "translationZh", "noteZh", "display"])
    if (prompt[field] !== undefined && prompt[field] !== null && typeof prompt[field] !== "string")
      throw Error(`Invalid prompt.${field} for case ${id}.`);
  if (prompt.display === "source_link" && (prompt.text || prompt.translationZh))
    throw Error(`Source-link-only case ${id} cannot contain prompt text.`);
  requiredText(prompt.status, "prompt.status", id);
  if (prompt.sourceUrl) publicUrl(prompt.sourceUrl, "prompt.sourceUrl", id);
}

function uniqueId(id, seen) {
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(id) || seen.has(id))
    throw Error("Missing, invalid or duplicate case ID.");
  seen.add(id);
}

function keepFields(object = {}, fields) {
  return Object.fromEntries(fields
    .filter((key) => object[key] !== undefined && object[key] !== null)
    .map((key) => [key, object[key]]));
}

/** Project public upstream fields without inventing prompts or verification. */
export function exportWorks(catalog, { commit = SNAPSHOT_COMMIT } = {}) {
  if (!/^[a-f0-9]{40}$/i.test(commit)) throw Error("Invalid source commit.");
  if (!Array.isArray(catalog?.cases) || !catalog.cases.length)
    throw Error("Catalog must contain cases (the default snapshot has 441 cases).");
  const sourceRoot = `https://raw.githubusercontent.com/guanmo-ai/awesome-ai-motion/${commit.toLowerCase()}/`;
  const seen = new Set();
  const works = catalog.cases.map((item) => {
    uniqueId(item?.id, seen);
    const id = item.id;
    for (const field of ["title", "summary", "category"])
      requiredText(item[field], field, id);
    for (const field of ["name", "handle"])
      requiredText(item.author?.[field], `author.${field}`, id);
    publicUrl(item.author?.url, "author.url", id);
    publicUrl(item.source?.url, "source.url", id);
    requiredText(item.source?.publishedAt, "source.publishedAt", id);
    requiredText(item.cover?.path, "cover.path", id);
    if (!/^assets\/covers\/[a-zA-Z0-9_.-]+$/.test(item.cover.path))
      throw Error(`Invalid public cover path for case ${id}.`);
    const prompt = item.prompt;
    checkPrompt(prompt, id);
    if (item.resources !== undefined && !Array.isArray(item.resources))
      throw Error(`Invalid resources for case ${id}.`);
    return {
      id,
      title: item.title,
      summary: item.summary,
      category: item.category,
      author: keepFields(item.author, ["name", "handle", "url"]),
      source: item.source.url,
      date: item.source.publishedAt,
      model: item.model?.name || "",
      modelEvidence: keepFields(item.model, ["basis", "evidenceQuote", "evidenceUrl"]),
      cover: `${sourceRoot}${item.cover.path}`,
      duration: item.media?.durationSeconds,
      video: item.webPlayback?.url || "",
      bookmarks: item.metrics?.bookmarks || 0,
      metricsCheckedAt: item.metrics?.checkedAt,
      stage: item.stage,
      verification: keepFields(item.verification, [
        "sourceReadAt", "authorClaimConfirmed", "videoAttachmentConfirmed",
        "fullReview", "independentlyReproduced", "promptMatchedSource",
      ]),
      ...(item.demoUrl ? { demoUrl: item.demoUrl } : {}),
      ...(item.guide ? { guide: {
        takeawayZh: item.guide.takeawayZh || "",
        stepsZh: item.guide.stepsZh || [],
        tools: item.guide.tools || [],
        evidenceUrls: item.guide.evidenceUrls || [],
        attribution: "Awesome AI Motion 整理说明",
        sourceUrl: `${SOURCE_REPOSITORY}/blob/${commit.toLowerCase()}/cases/${id}.md`,
      } } : {}),
      prompt: {
        ...keepFields(prompt, ["status", "sourceUrl", "checkedAt", "language"]),
        text: prompt.text || "",
        translationZh: prompt.translationZh || "",
        noteZh: prompt.noteZh || "",
        display: prompt.display || "",
      },
      resources: (item.resources || []).map((resource) => keepFields(resource, [
        "kind", "url", "label", "license", "licenseUrl", "note", "evidenceUrl", "checkedAt",
      ])),
    };
  });
  validateWorks(works);
  return works;
}

/** Shared publication checks; no fixed snapshot counts. */
export function validateWorks(works) {
  if (!Array.isArray(works) || !works.length) throw Error("Catalog is empty or invalid.");
  const seen = new Set();
  for (const work of works) {
    uniqueId(work?.id, seen);
    for (const field of ["title", "summary", "category", "date"])
      requiredText(work[field], field, work.id);
    for (const field of ["name", "handle"])
      requiredText(work.author?.[field], `author.${field}`, work.id);
    publicUrl(work.author?.url, "author.url", work.id);
    publicUrl(work.source, "source", work.id);
    publicUrl(work.cover, "cover", work.id);
    if (work.video) publicUrl(work.video, "video", work.id);
    if (work.demoUrl) publicUrl(work.demoUrl, "demoUrl", work.id);
    checkPrompt(work.prompt, work.id);
    if (!Array.isArray(work.resources)) throw Error(`Invalid resources for case ${work.id}.`);
    for (const resource of work.resources) {
      requiredText(resource?.kind, "resource.kind", work.id);
      requiredText(resource?.label, "resource.label", work.id);
      publicUrl(resource?.url, "resource.url", work.id);
      if (resource.licenseUrl) publicUrl(resource.licenseUrl, "resource.licenseUrl", work.id);
    }
    if (work.guide) {
      requiredText(work.guide.attribution, "guide.attribution", work.id);
      for (const field of ["stepsZh", "tools", "evidenceUrls"])
        if (!Array.isArray(work.guide[field]) || work.guide[field].some((value) => typeof value !== "string"))
          throw Error(`Invalid guide.${field} for case ${work.id}.`);
      if (work.guide.sourceUrl) publicUrl(work.guide.sourceUrl, "guide.sourceUrl", work.id);
    }
  }
  return works;
}

export function countWorks(works) {
  validateWorks(works);
  return {
    works: works.length,
    originalPrompts: works.filter((w) => w.prompt.status === "original" && w.prompt.text?.trim()).length,
    briefs: works.filter((w) => w.prompt.status === "brief" && w.prompt.text?.trim()).length,
    translations: works.filter((w) => w.prompt.translationZh?.trim()).length,
    codeWorks: works.filter((w) => w.resources.some((r) => r.kind === "code")).length,
    guides: works.filter((w) => w.guide).length,
    demoUrls: works.filter((w) => w.demoUrl).length,
    licenseUrls: works.flatMap((w) => w.resources).filter((r) => r.licenseUrl).length,
  };
}

/** Metadata describes supplied file bytes; it does not fabricate an import date. */
export function catalogMetadata(works, { commit, sha256: sourceHash, catalogText } = {}) {
  const revision = verifiedRevision({ commit, sha256: sourceHash });
  const text = catalogText ?? JSON.stringify(works);
  if (JSON.stringify(JSON.parse(text)) !== JSON.stringify(works))
    throw Error("Catalog metadata does not describe the supplied works.");
  return {
    schemaVersion: 1,
    source: { repository: SOURCE_REPOSITORY, ...revision },
    catalog: { sha256: sha256(text), counts: countWorks(works) },
  };
}

export async function importCatalog(inputPath, options = {}) {
  const revision = verifiedRevision(options);
  if (options.commit !== undefined && !options.outputPath)
    throw Error("Explicit revisions require --output for a reviewable candidate.");
  const sourceUrl = `https://raw.githubusercontent.com/guanmo-ai/awesome-ai-motion/${revision.commit}/data/cases.json`;
  const text = inputPath
    ? await fs.readFile(path.resolve(inputPath), "utf8")
    : await fetch(sourceUrl, { signal: AbortSignal.timeout(30_000) }).then((response) => {
        if (!response.ok) throw Error(`Upstream snapshot returned HTTP ${response.status}.`);
        return response.text();
      });
  const normalized = text.replace(/\r\n/g, "\n");
  if (sha256(normalized) !== revision.sha256)
    throw Error("Snapshot checksum mismatch. Refusing to replace the public catalog.");
  const works = exportWorks(JSON.parse(normalized), { commit: revision.commit });
  const outputPath = path.resolve(options.outputPath ?? defaultOutput);
  const metadataPath = path.resolve(options.metadataPath ?? path.join(path.dirname(outputPath), "catalog-meta.json"));
  if (outputPath === metadataPath) throw Error("Catalog and metadata paths must differ.");
  if (inputPath && [outputPath, metadataPath].includes(path.resolve(inputPath)))
    throw Error("Output paths must not overwrite the upstream source snapshot.");
  const catalogText = JSON.stringify(works);
  const metadata = catalogMetadata(works, { ...revision, catalogText });
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  await fs.writeFile(outputPath, catalogText);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2) + "\n");
  return metadata.catalog.counts;
}

function cliArguments(args) {
  const options = {};
  let inputPath;
  const flags = { "--commit": "commit", "--sha256": "sha256", "--output": "outputPath", "--metadata": "metadataPath" };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg.startsWith("--")) {
      const key = flags[arg];
      if (!key || !args[index + 1] || args[index + 1].startsWith("--") || options[key] !== undefined)
        throw Error(`Unknown, repeated or incomplete option: ${arg}`);
      options[key] = args[++index];
    } else if (inputPath === undefined) inputPath = arg;
    else throw Error(`Unexpected argument: ${arg}`);
  }
  return { inputPath, options };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { inputPath, options } = cliArguments(process.argv.slice(2));
    importCatalog(inputPath, options).then((counts) => console.log(counts)).catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
