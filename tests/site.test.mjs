import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { test } from "node:test";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const EM_DASH = "\u2014";
const PLAYMAKER = /playmaker/i;
const TEXT_EXT = new Set([".astro", ".css", ".md", ".mjs", ".ts", ".txt", ".xml", ".jsonc", ".html"]);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === ".astro") {
      continue;
    }
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path, files);
    } else {
      files.push(path);
    }
  }
  return files;
}

function read(path) {
  return readFileSync(path, "utf8");
}

function distPage(name) {
  const file = join(DIST, `${name}.html`);
  const nested = join(DIST, name, "index.html");
  if (existsSync(file)) {
    return read(file);
  }
  if (existsSync(nested)) {
    return read(nested);
  }
  throw new Error(`missing built page ${name}`);
}

function stripJsonc(source) {
  return source.replace(/\/\/.*$/gm, "").replace(/,(\s*[}\]])/g, "$1");
}

test("wrangler.jsonc is an assets-only free Worker named select-sideline-blog", () => {
  const config = JSON.parse(stripJsonc(read(join(ROOT, "wrangler.jsonc"))));
  assert.equal(config.name, "select-sideline-blog");
  assert.equal(config.workers_dev, false);
  assert.equal(config.preview_urls, false);
  assert.equal(config.assets?.directory, "./dist");
  assert.equal(config.main, undefined);
  assert.deepEqual(config.routes, [
    { pattern: "blog.selectsideline.com", custom_domain: true },
  ]);
  assert.equal(config.d1_databases, undefined);
  assert.equal(config.kv_namespaces, undefined);
  assert.equal(config.r2_buckets, undefined);
  assert.equal(config.ai, undefined);
  assert.equal(config.queues, undefined);
  assert.equal(config.observability, undefined);
});

test("source copy has no em dashes", () => {
  const files = walk(ROOT).filter((path) => TEXT_EXT.has(extname(path)));
  const hits = [];
  for (const path of files) {
    const text = read(path);
    if (text.includes(EM_DASH)) {
      hits.push(path.replace(ROOT + "/", ""));
    }
  }
  assert.deepEqual(hits, []);
});

test("site source has no PlayMaker brand strings", () => {
  const files = walk(join(ROOT, "src")).filter((path) => TEXT_EXT.has(extname(path)));
  files.push(join(ROOT, "public", "MEDIA.md"));
  const hits = [];
  for (const path of files) {
    const text = read(path);
    if (PLAYMAKER.test(text)) {
      hits.push(path.replace(ROOT + "/", ""));
    }
  }
  assert.deepEqual(hits, []);
});

test("Grok Imagine media slots are wired to public/ PNG paths", () => {
  const site = read(join(ROOT, "src", "lib", "site.ts"));
  assert.match(site, /og: "\/og\.png"/);
  assert.match(site, /hero: "\/hero\.png"/);
  assert.match(site, /favicon: "\/favicon\.png"/);
  assert.match(site, /mission: "\/posts\/mission\.png"/);
  assert.match(site, /goals: "\/posts\/goals\.png"/);
  assert.match(site, /progress: "\/posts\/progress\.png"/);
  assert.match(read(join(ROOT, "src", "lib", "site.ts")), /APP_URL = "https:\/\/selectsideline\.com"/);
});

test("every page has an obvious product link to https://selectsideline.com", () => {
  const home = distPage("index");
  const mission = distPage("mission");
  const goals = distPage("goals");
  const progress = distPage("progress");
  const notFound = distPage("404");

  for (const html of [home, mission, goals, progress, notFound]) {
    assert.match(html, /href="https:\/\/selectsideline\.com"/);
    assert.match(html, /Open the playbook/);
    assert.doesNotMatch(html, /playmaker\.ludacr1tz\.com/i);
  }

  assert.match(home, /class="hero"/);
  assert.match(home, /class="cta" href="https:\/\/selectsideline\.com"/);
  assert.match(mission, /class="product-close"/);
  assert.match(goals, /class="product-close"/);
  assert.match(progress, /class="product-close"/);
});

test("build emits indexable static assets", () => {
  assert.equal(existsSync(DIST), true, "run npm run build before this test");
  const home = distPage("index");
  const mission = distPage("mission");
  const goals = distPage("goals");
  const progress = distPage("progress");
  const robots = read(join(DIST, "robots.txt"));
  const sitemap = read(join(DIST, "sitemap.xml"));

  for (const html of [home, mission, goals, progress]) {
    assert.match(html, /index,follow|content="index,follow"/);
    assert.match(html, /blog\.selectsideline\.com/);
    assert.doesNotMatch(html, PLAYMAKER);
    assert.equal(html.includes(EM_DASH), false);
    assert.match(html, /application\/ld\+json/);
  }

  assert.match(home, /"@type":"Blog"/);
  assert.match(mission, /"@type":"BlogPosting"/);
  assert.match(home, /\/hero\.png/);
  assert.match(mission, /\/posts\/mission\.png/);
  assert.match(goals, /\/posts\/goals\.png/);
  assert.match(progress, /\/posts\/progress\.png/);
  assert.match(home, /<link rel="canonical" href="https:\/\/blog\.selectsideline\.com\/"/);

  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/blog\.selectsideline\.com\/sitemap\.xml/);
  assert.match(sitemap, /https:\/\/blog\.selectsideline\.com\/mission/);
  assert.match(sitemap, /https:\/\/blog\.selectsideline\.com\/goals/);
  assert.match(sitemap, /https:\/\/blog\.selectsideline\.com\/progress/);
});
