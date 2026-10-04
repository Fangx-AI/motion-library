import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("dist/index.html", "utf8");
const works = JSON.parse(fs.readFileSync("dist/works.json", "utf8"));

assert.match(html, /<html\b[^>]*\bclass="dark"/);
assert.ok(fs.statSync("dist/app.js").size > 100_000, "Website bundle is incomplete");
assert.ok(fs.statSync("dist/style.css").size > 1_000, "Stylesheet is incomplete");
assert.equal(works.length, 441, "Published catalog must contain all 441 works");
assert.ok(!fs.readdirSync("dist").some((file) => file.endsWith(".map")), "Do not publish source maps");

console.log("Verified: dark website, complete assets, 441 works, no source maps.");
