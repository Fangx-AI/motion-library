import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { countWorks, sha256, SOURCE_REPOSITORY, validateWorks } from "./import-catalog.mjs";

const artifactRoot = path.resolve(process.argv[2] ?? "dist");
const read = (file) => fs.readFileSync(path.join(artifactRoot, file), "utf8");
const html = read("index.html");
const catalogText = read("works.json");
const works = validateWorks(JSON.parse(catalogText));
const metadata = JSON.parse(read("catalog-meta.json"));

assert.match(html, /<html\b[^>]*\bclass="dark"/);
assert.ok(fs.statSync(path.join(artifactRoot, "app.js")).size > 100_000, "Website bundle is incomplete");
assert.ok(fs.statSync(path.join(artifactRoot, "style.css")).size > 1_000, "Stylesheet is incomplete");
assert.equal(metadata.schemaVersion, 1, "Unsupported catalog metadata schema");
assert.equal(metadata.source?.repository, SOURCE_REPOSITORY, "Unrecognized catalog source");
assert.match(metadata.source?.commit ?? "", /^[a-f0-9]{40}$/);
assert.match(metadata.source?.sha256 ?? "", /^[a-f0-9]{64}$/);
assert.equal(metadata.catalog?.sha256, sha256(catalogText), "Catalog does not match the reviewed metadata");
assert.deepEqual(metadata.catalog?.counts, countWorks(works), "Catalog statistics are inconsistent");
for (const work of works) {
  assert.ok(work.cover.startsWith(`https://raw.githubusercontent.com/guanmo-ai/awesome-ai-motion/${metadata.source.commit}/assets/covers/`), `Unpinned cover source: ${work.id}`);
  if (work.guide?.sourceUrl)
    assert.equal(work.guide.sourceUrl, `${SOURCE_REPOSITORY}/blob/${metadata.source.commit}/cases/${work.id}.md`, `Unpinned guide source: ${work.id}`);
}

function checkNoSourceMaps(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    assert.ok(!entry.name.endsWith(".map"), "Do not publish source maps");
    if (entry.isDirectory()) checkNoSourceMaps(path.join(directory, entry.name));
  }
}
checkNoSourceMaps(artifactRoot);
console.log(`Verified: dark website, complete assets, ${works.length} reviewed works, matching metadata, no source maps.`);
