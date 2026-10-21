import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test, { after } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = mkdtempSync(join(tmpdir(), "mailflare-domain-icon-"));
after(() => rmSync(outDir, { recursive: true, force: true }));
const outfile = join(outDir, "icon-utils.mjs");
await build({
	entryPoints: [join(root, "src/lib/domains/icon-utils.ts")],
	outfile,
	bundle: true,
	platform: "node",
	format: "esm",
	logLevel: "silent",
	alias: { "@": join(root, "src") },
});
const { parseDomainIconInput, getDomainBadge } = await import(pathToFileURL(outfile).href);

test("icon input keeps only sent fields, trims, and clears on empty", () => {
	assert.deepEqual(parseDomainIconInput({}), {});
	assert.deepEqual(parseDomainIconInput({ iconLabel: " dS ", iconColor: "#1A73E8" }), { iconLabel: "dS", iconColor: "#1a73e8" });
	assert.deepEqual(parseDomainIconInput({ iconLabel: "", iconColor: "" }), { iconLabel: null, iconColor: null });
	assert.deepEqual(parseDomainIconInput({ iconLabel: "🚀AB" }), { iconLabel: "🚀AB" });
});

test("icon input rejects long labels, bad colours and non-strings", () => {
	assert.ok("error" in parseDomainIconInput({ iconLabel: "ABCD" }));
	assert.ok("error" in parseDomainIconInput({ iconColor: "red" }));
	assert.ok("error" in parseDomainIconInput({ iconColor: "#fff" }));
	assert.ok("error" in parseDomainIconInput({ iconColor: "#12345g" }));
	assert.ok("error" in parseDomainIconInput({ iconLabel: 5 }));
});

test("badge falls back to the hostname and picks readable text on custom colours", () => {
	assert.equal(getDomainBadge("devmo.com").text, "D");
	assert.deepEqual(getDomainBadge("devmo.com").style, getDomainBadge("DEVMO.com").style);
	assert.equal(getDomainBadge("devmo.com", "DS").text, "DS");
	assert.equal(getDomainBadge("x.com", null, "#000000").style.color, "#ffffff");
	assert.equal(getDomainBadge("x.com", null, "#ffff99").style.color, "#202124");
});
