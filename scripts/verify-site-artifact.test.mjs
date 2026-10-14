import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, test } from "node:test";
import { countWorks, sha256, SOURCE_REPOSITORY } from "./import-catalog.mjs";
import { verifySiteArtifact } from "./verify-site-artifact.mjs";

const primary = { repository: SOURCE_REPOSITORY, commit: "a".repeat(40), sha256: "1".repeat(64) };
const historical = { repository: SOURCE_REPOSITORY, commit: "b".repeat(40), sha256: "2".repeat(64) };
const earlier = { repository: SOURCE_REPOSITORY, commit: "c".repeat(40), sha256: "3".repeat(64) };

// Fixtures stay in the calling workspace, never the system temp or licensed source.
const workspaceRoot = fs.realpathSync(path.resolve(process.cwd()));
const fixtureRoot = fs.mkdtempSync(path.join(workspaceRoot, ".verify-site-artifact-test-"));
function inside(root, target) {
  assert.ok(path.isAbsolute(root) && path.isAbsolute(target));
  const relative = path.relative(fs.realpathSync(root), fs.realpathSync(target));
  assert.ok(relative && !path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`), "Fixture must stay inside the verified workspace");
}
inside(workspaceRoot, fixtureRoot);
after(() => {
  inside(workspaceRoot, fixtureRoot);
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
});

function work(id, source) {
  return {
    id, title: `Motion ${id}`, summary: "Public motion reference", category: "短动效",
    author: { name: "Motion Author", handle: "motionauthor", url: "https://x.com/motionauthor" },
    source: `https://x.com/motionauthor/status/${id}`, date: "2026-10-14T00:00:00Z",
    cover: `https://raw.githubusercontent.com/guanmo-ai/awesome-ai-motion/${source.commit}/assets/covers/${id}.jpg`,
    prompt: { status: "unknown", text: "", translationZh: "", display: "" }, resources: [],
    guide: { attribution: "Awesome AI Motion 整理说明", stepsZh: [], tools: [], evidenceUrls: [], sourceUrl: `${SOURCE_REPOSITORY}/blob/${source.commit}/cases/${id}.md` },
  };
}
function fixture(schemaVersion = 1) {
  const works = [work("100", primary), work("200", schemaVersion === 2 ? historical : primary)];
  return {
    works,
    metadata: { schemaVersion, source: structuredClone(primary), ...(schemaVersion === 2 ? { retainedSources: [{ ...historical, workIds: ["200"] }] } : {}), catalog: { counts: countWorks(works) } },
    html: '<html class="dark"><body></body></html>', bundleSize: 100_001, styleSize: 1_001, maps: [], rehash: true,
  };
}
function verify(data) {
  const directory = fs.mkdtempSync(path.join(fixtureRoot, "artifact-"));
  inside(fixtureRoot, directory);
  const text = JSON.stringify(data.works);
  const metadata = structuredClone(data.metadata);
  if (data.rehash) metadata.catalog.sha256 = sha256(text);
  fs.writeFileSync(path.join(directory, "works.json"), text);
  fs.writeFileSync(path.join(directory, "catalog-meta.json"), JSON.stringify(metadata));
  fs.writeFileSync(path.join(directory, "index.html"), data.html);
  fs.writeFileSync(path.join(directory, "app.js"), "x".repeat(data.bundleSize));
  fs.writeFileSync(path.join(directory, "style.css"), "x".repeat(data.styleSize));
  for (const name of data.maps) {
    const file = path.join(directory, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "{}");
  }
  return verifySiteArtifact(directory);
}
function rejects(name, change, pattern, version = 2) {
  test(name, () => {
    const data = fixture(version);
    change(data);
    assert.throws(() => verify(data), pattern);
  });
}

test("schema 1 verifies a single complete source", () => assert.equal(verify(fixture()).works, 2));
test("schema 2 verifies primary and retained covers and guides", () => assert.equal(verify(fixture(2)).guides, 2));
test("schema 2 assigns distinct historical groups independently", () => {
  const data = fixture(2);
  data.works.push(work("300", earlier));
  data.metadata.retainedSources.push({ ...earlier, workIds: ["300"] });
  data.metadata.catalog.counts = countWorks(data.works);
  assert.equal(verify(data).works, 3);
});

rejects("schema 1 cannot silently accept retainedSources", d => { d.metadata.retainedSources = []; }, /Schema 1 cannot/, 1);
for (const version of [0, 3, "2", null])
  rejects(`reject unsupported schema ${JSON.stringify(version)}`, d => { d.metadata.schemaVersion = version; }, /Unsupported catalog metadata schema/);
for (const value of [undefined, null, [], {}])
  rejects(`schema 2 needs a historical list: ${JSON.stringify(value)}`, d => { d.metadata.retainedSources = value; }, /nonempty retained sources/);
rejects("reject malformed retained snapshot", d => { d.metadata.retainedSources = [null]; }, /Invalid retained source snapshot/);
for (const value of [undefined, [], "200", [200]])
  rejects(`reject empty or malformed historical workIds ${JSON.stringify(value)}`, d => { d.metadata.retainedSources[0].workIds = value; }, /nonempty workIds|Invalid retained work ID/);
rejects("reject unknown historical work ID", d => { d.metadata.retainedSources[0].workIds = ["999"]; }, /Unknown retained work ID/);
rejects("reject duplicate ID within one historical group", d => { d.metadata.retainedSources[0].workIds = ["200", "200"]; }, /Duplicate retained work ID/);
rejects("reject overlapping IDs across historical groups", d => { d.metadata.retainedSources.push({ ...earlier, workIds: ["200"] }); }, /Duplicate retained work ID/);
rejects("reject duplicate historical commit even for distinct IDs", d => { d.metadata.retainedSources.push({ ...historical, workIds: ["100"] }); }, /Duplicate or primary retained commit/);
rejects("reject primary commit relabeled as historical", d => { d.metadata.retainedSources[0].commit = primary.commit; }, /Duplicate or primary retained commit/);
rejects("reject historical snapshot from another repository", d => { d.metadata.retainedSources[0].repository = "https://github.com/another/catalog"; }, /Unrecognized retained source repository/);
rejects("reject primary snapshot from another repository", d => { d.metadata.source.repository = "https://github.com/another/catalog"; }, /Unrecognized primary source repository/);
for (const field of ["commit", "sha256"]) {
  for (const value of [null, 42, "short", "z".repeat(field === "commit" ? 40 : 64)]) {
    rejects(`reject invalid primary ${field} ${String(value)}`, d => { d.metadata.source[field] = value; }, /Invalid primary source/);
    rejects(`reject invalid historical ${field} ${String(value)}`, d => { d.metadata.retainedSources[0][field] = value; }, /Invalid retained source/);
  }
}

rejects("single source cannot use a historical cover", d => { d.works[1].cover = work("200", historical).cover; }, /Incorrect cover snapshot/, 1);
rejects("retained work cannot use a primary cover", d => { d.works[1].cover = work("200", primary).cover; }, /Incorrect cover snapshot/);
rejects("primary work cannot use a historical cover", d => { d.works[0].cover = work("100", historical).cover; }, /Incorrect cover snapshot/);
rejects("cover must name its own ID, not just match the source prefix", d => { d.works[1].cover = work("100", historical).cover; }, /Incorrect cover snapshot/);
rejects("cover query aliases are not exact source artifacts", d => { d.works[1].cover += "?alternate=1"; }, /Incorrect cover snapshot/);
rejects("unsupported cover suffix cannot bypass the JPEG contract", d => { d.works[1].cover = d.works[1].cover.replace(/\.jpg$/, ".png"); }, /Incorrect cover snapshot/);
rejects("retained guide cannot use the primary snapshot", d => { d.works[1].guide.sourceUrl = work("200", primary).guide.sourceUrl; }, /Incorrect guide snapshot/);
rejects("primary guide cannot use a historical snapshot", d => { d.works[0].guide.sourceUrl = work("100", historical).guide.sourceUrl; }, /Incorrect guide snapshot/);
rejects("guide must name its own ID", d => { d.works[1].guide.sourceUrl = work("100", historical).guide.sourceUrl; }, /Incorrect guide snapshot/);
rejects("guide cannot omit its source URL", d => { delete d.works[1].guide.sourceUrl; }, /Incorrect guide snapshot/);
rejects("retained ID without matching old pin is not harmless metadata", d => { d.metadata.retainedSources[0].workIds = ["100"]; }, /Incorrect cover snapshot/);

rejects("catalog bytes must match the reviewed hash", d => { d.rehash = false; d.metadata.catalog.sha256 = "f".repeat(64); }, /Catalog does not match/);
rejects("catalog statistics must match actual works", d => { d.metadata.catalog.counts.works = 99; }, /Catalog statistics are inconsistent/);
rejects("duplicate catalog IDs remain invalid", d => { d.works[1].id = "100"; }, /duplicate case ID/);
rejects("source-only prompts cannot acquire invented bodies", d => { d.works[0].prompt.display = "source_link"; d.works[0].prompt.text = "invented"; }, /cannot contain prompt text/);
rejects("dark interface gate still applies", d => { d.html = "<html><body></body></html>"; }, /did not match/);
rejects("incomplete application bundle remains blocked", d => { d.bundleSize = 100_000; }, /Website bundle is incomplete/);
rejects("incomplete stylesheet remains blocked", d => { d.styleSize = 1_000; }, /Stylesheet is incomplete/);
rejects("nested source maps remain blocked", d => { d.maps = ["nested/app.js.map"]; }, /Do not publish source maps/);
rejects("case variants of source map filenames remain blocked", d => { d.maps = ["nested/style.CSS.MAP"]; }, /Do not publish source maps/);
