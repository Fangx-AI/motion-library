import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { countWorks, sha256, SOURCE_REPOSITORY, validateWorks } from "./import-catalog.mjs";

function validateSnapshot(source, label) {
  assert.ok(source && typeof source === "object" && !Array.isArray(source), `Invalid ${label} snapshot`);
  assert.equal(source.repository, SOURCE_REPOSITORY, `Unrecognized ${label} repository`);
  assert.ok(typeof source.commit === "string" && /^[a-f0-9]{40}$/.test(source.commit), `Invalid ${label} commit`);
  assert.ok(typeof source.sha256 === "string" && /^[a-f0-9]{64}$/.test(source.sha256), `Invalid ${label} SHA-256`);
}

function checkNoSourceMaps(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    assert.ok(!/\.map$/i.test(entry.name), "Do not publish source maps");
    if (entry.isDirectory()) checkNoSourceMaps(path.join(directory, entry.name));
  }
}

export function verifySiteArtifact(directory = "dist") {
  const artifactRoot = path.resolve(directory);
  const read = (file) => fs.readFileSync(path.join(artifactRoot, file), "utf8");
  const html = read("index.html");
  const catalogText = read("works.json");
  const works = validateWorks(JSON.parse(catalogText));
  const metadata = JSON.parse(read("catalog-meta.json"));

  assert.match(html, /<html\b[^>]*\bclass="dark"/);
  assert.ok(fs.statSync(path.join(artifactRoot, "app.js")).size > 100_000, "Website bundle is incomplete");
  assert.ok(fs.statSync(path.join(artifactRoot, "style.css")).size > 1_000, "Stylesheet is incomplete");
  assert.ok(metadata.schemaVersion === 1 || metadata.schemaVersion === 2, "Unsupported catalog metadata schema");
  validateSnapshot(metadata.source, "primary source");
  assert.equal(metadata.catalog?.sha256, sha256(catalogText), "Catalog does not match the reviewed metadata");
  const counts = countWorks(works);
  assert.deepEqual(metadata.catalog?.counts, counts, "Catalog statistics are inconsistent");

  const sourceByWorkId = new Map();
  if (metadata.schemaVersion === 1) {
    assert.ok(!Object.hasOwn(metadata, "retainedSources"), "Schema 1 cannot declare retained sources");
  } else {
    assert.ok(Array.isArray(metadata.retainedSources) && metadata.retainedSources.length > 0, "Schema 2 needs nonempty retained sources");
    const workIds = new Set(works.map((work) => work.id));
    const commits = new Set([metadata.source.commit]);
    for (const source of metadata.retainedSources) {
      validateSnapshot(source, "retained source");
      assert.equal(source.repository, metadata.source.repository, "Retained repository differs from primary source");
      assert.ok(!commits.has(source.commit), "Duplicate or primary retained commit");
      commits.add(source.commit);
      assert.ok(Array.isArray(source.workIds) && source.workIds.length > 0, "Retained snapshot needs nonempty workIds");
      for (const id of source.workIds) {
        assert.ok(typeof id === "string" && id.length > 0, "Invalid retained work ID");
        assert.ok(workIds.has(id), `Unknown retained work ID: ${id}`);
        assert.ok(!sourceByWorkId.has(id), `Duplicate retained work ID: ${id}`);
        sourceByWorkId.set(id, source);
      }
    }
  }

  for (const work of works) {
    const source = sourceByWorkId.get(work.id) ?? metadata.source;
    // Reviewed catalogs use per-ID JPEG covers; no filename, query or prefix aliases.
    assert.equal(work.cover, `https://raw.githubusercontent.com/guanmo-ai/awesome-ai-motion/${source.commit}/assets/covers/${work.id}.jpg`, `Incorrect cover snapshot: ${work.id}`);
    if (work.guide)
      assert.equal(work.guide.sourceUrl, `${SOURCE_REPOSITORY}/blob/${source.commit}/cases/${work.id}.md`, `Incorrect guide snapshot: ${work.id}`);
  }
  checkNoSourceMaps(artifactRoot);
  return counts;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const counts = verifySiteArtifact(process.argv[2]);
  console.log(`Verified: dark website, complete assets, ${counts.works} reviewed works, matching metadata, no source maps.`);
}
