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

test("required Imagine bytes are committed in public/", () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff]);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const files = [
    ["public/og.jpg", jpeg],
    ["public/hero.jpg", jpeg],
    ["public/favicon.png", png],
    ["public/apple-touch-icon.png", png],
    ["public/mark.png", png],
    ["public/posts/mission.jpg", jpeg],
    ["public/posts/goals.jpg", jpeg],
    ["public/posts/progress.jpg", jpeg],
    ["public/posts/watch-the-playbook.jpg", jpeg],
  ];
  for (const [rel, magic] of files) {
    const buf = readFileSync(join(ROOT, rel));
    assert.ok(buf.length > 100, `${rel} is too small`);
    assert.deepEqual(buf.subarray(0, magic.length), magic, rel);
  }
  const ignore = read(join(ROOT, ".gitignore"));
  assert.doesNotMatch(ignore, /public\/og\.jpg/);
  assert.doesNotMatch(ignore, /public\/hero\.jpg/);
  assert.doesNotMatch(ignore, /public\/favicon\.png/);
  assert.doesNotMatch(ignore, /public\/apple-touch-icon\.png/);
  assert.doesNotMatch(ignore, /public\/mark\.png/);
  assert.doesNotMatch(ignore, /public\/posts\/\*\.jpg/);
  assert.doesNotMatch(read(join(ROOT, "package.json")), /decode-imagine/);
});

test("Grok Imagine media slots are wired to public/ JPG paths", () => {
  const site = read(join(ROOT, "src", "lib", "site.ts"));
  assert.match(site, /og: "\/og\.jpg"/);
  assert.match(site, /hero: "\/hero\.jpg"/);
  assert.match(site, /favicon: "\/favicon\.png"/);
  assert.match(site, /mark: "\/mark\.png"/);
  assert.match(site, /mission: "\/posts\/mission\.jpg"/);
  assert.match(site, /goals: "\/posts\/goals\.jpg"/);
  assert.match(site, /progress: "\/posts\/progress\.jpg"/);
  assert.match(site, /watchThePlaybook: "\/posts\/watch-the-playbook\.jpg"/);
  assert.match(read(join(ROOT, "src", "lib", "site.ts")), /APP_URL = "https:\/\/selectsideline\.com"/);
});

test("paper editorial replaces the turf wallpaper theme", () => {
  const css = read(join(ROOT, "src", "styles", "global.css"));
  const layout = read(join(ROOT, "src", "layouts", "BaseLayout.astro"));
  const homeSrc = read(join(ROOT, "src", "pages", "index.astro"));
  const missionMd = read(join(ROOT, "src", "content", "posts", "mission.md"));
  const goalsMd = read(join(ROOT, "src", "content", "posts", "goals.md"));
  const progressMd = read(join(ROOT, "src", "content", "posts", "progress.md"));
  const watchMd = read(join(ROOT, "src", "content", "posts", "watch-the-playbook.md"));

  assert.match(css, /--serif: "Newsreader"/);
  assert.match(css, /--sans: "Source Sans 3"/);
  assert.doesNotMatch(css, /ui-sans-serif/);
  assert.doesNotMatch(css, /system-ui/);
  assert.doesNotMatch(css, /repeating-linear-gradient/);
  assert.doesNotMatch(css, /#facc15/);
  assert.match(css, /--muted: #2a312e/);
  assert.match(css, /--amber: #4a3208/);
  assert.match(css, /--link: #0c5e38/);
  assert.match(css, /--link-visited: #0c5e38/);
  assert.match(css, /border-radius: 999px/);
  assert.match(layout, /fonts\.googleapis\.com/);
  assert.match(layout, /Newsreader/);
  assert.match(layout, /Source\+Sans\+3/);
  assert.match(homeSrc, /class="hero"/);
  assert.match(homeSrc, /class="hero-board"/);
  assert.match(homeSrc, /class="support"/);
  assert.match(
    homeSrc,
    /A curated playbook for select and premier youth coaches\. Roster and play calling stay together/,
  );
  assert.doesNotMatch(homeSrc, /post-card/);
  assert.doesNotMatch(homeSrc, /<h2>Posts<\/h2>/);
  assert.match(missionMd, /title: A playbook ready to teach/);
  assert.match(goalsMd, /title: Built for game day, not setup week/);
  assert.match(progressMd, /title: The playbook is live/);
  assert.match(watchMd, /title: Watch the playbook/);
  assert.match(missionMd, /headerImage: \/posts\/mission\.jpg/);
  assert.match(goalsMd, /headerImage: \/posts\/goals\.jpg/);
  assert.match(progressMd, /headerImage: \/posts\/progress\.jpg/);
  assert.match(watchMd, /headerImage: \/posts\/watch-the-playbook\.jpg/);
  assert.match(watchMd, /youtube\.com\/embed\/9dPluqXpg7w/);
  assert.doesNotMatch(watchMd, /tuFsxyKpcp0/);
  assert.doesNotMatch(watchMd, /Open the playbook/);
  assert.doesNotMatch(watchMd, /ProductCta/);
  assert.doesNotMatch(watchMd, /selectsideline\.com/);
  assert.match(css, /\.prose iframe/);
  assert.match(css, /aspect-ratio: 16 \/ 9/);
});

test("every page has an obvious product link to https://selectsideline.com", () => {
  const home = distPage("index");
  const mission = distPage("mission");
  const goals = distPage("goals");
  const progress = distPage("progress");
  const watch = distPage("watch-the-playbook");
  const notFound = distPage("404");

  for (const html of [home, mission, goals, progress, watch, notFound]) {
    assert.match(html, /href="https:\/\/selectsideline\.com"/);
    assert.match(html, /Open the playbook/);
    assert.doesNotMatch(html, /playmaker\.ludacr1tz\.com/i);
  }

  assert.match(home, /class="hero"/);
  assert.match(home, /class="hero-board"/);
  assert.match(home, /class="support"/);
  assert.doesNotMatch(home, /post-card/);
  assert.match(home, /class="cta" href="https:\/\/selectsideline\.com"/);
  assert.equal([...home.matchAll(/class="cta"/g)].length, 2);
  assert.match(home, /src="\/mark\.png"/);
  assert.doesNotMatch(home, /<span class="brand-mark"/);
  assert.match(home, />Use the app</);
  assert.doesNotMatch(home, /footer[\s\S]*class="cta"/);
  assert.match(mission, /class="product-close"/);
  assert.doesNotMatch(mission, /product-close[\s\S]*class="cta"/);
  assert.match(goals, /class="product-close"/);
  assert.match(progress, /class="product-close"/);
  assert.match(watch, /class="product-close"/);
  assert.doesNotMatch(watch, /product-close[\s\S]*class="cta"/);
  assert.match(watch, /youtube\.com\/embed\/9dPluqXpg7w/);
  assert.doesNotMatch(watch, /tuFsxyKpcp0/);
  assert.match(home, /Watch the playbook/);
  assert.match(home, /\/posts\/watch-the-playbook\.jpg/);
});

test("build emits indexable static assets", () => {
  assert.equal(existsSync(DIST), true, "run npm run build before this test");
  const home = distPage("index");
  const mission = distPage("mission");
  const goals = distPage("goals");
  const progress = distPage("progress");
  const watch = distPage("watch-the-playbook");
  const robots = read(join(DIST, "robots.txt"));
  const sitemap = read(join(DIST, "sitemap.xml"));

  for (const html of [home, mission, goals, progress, watch]) {
    assert.match(html, /index,follow|content="index,follow"/);
    assert.match(html, /blog\.selectsideline\.com/);
    assert.doesNotMatch(html, PLAYMAKER);
    assert.equal(html.includes(EM_DASH), false);
    assert.match(html, /application\/ld\+json/);
  }

  assert.match(home, /"@type":"Blog"/);
  assert.match(mission, /"@type":"BlogPosting"/);
  assert.match(home, /\/hero\.jpg/);
  assert.match(mission, /\/posts\/mission\.jpg/);
  assert.match(goals, /\/posts\/goals\.jpg/);
  assert.match(progress, /\/posts\/progress\.jpg/);
  assert.match(watch, /\/posts\/watch-the-playbook\.jpg/);
  assert.match(watch, /"@type":"BlogPosting"/);
  assert.equal(existsSync(join(DIST, "og.jpg")), true);
  assert.equal(existsSync(join(DIST, "hero.jpg")), true);
  assert.equal(existsSync(join(DIST, "favicon.png")), true);
  assert.equal(existsSync(join(DIST, "apple-touch-icon.png")), true);
  assert.equal(existsSync(join(DIST, "mark.png")), true);
  assert.equal(existsSync(join(DIST, "posts", "mission.jpg")), true);
  assert.equal(existsSync(join(DIST, "posts", "goals.jpg")), true);
  assert.equal(existsSync(join(DIST, "posts", "progress.jpg")), true);
  assert.equal(existsSync(join(DIST, "posts", "watch-the-playbook.jpg")), true);
  assert.match(home, /<link rel="canonical" href="https:\/\/blog\.selectsideline\.com\/"/);

  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/blog\.selectsideline\.com\/sitemap\.xml/);
  assert.match(sitemap, /https:\/\/blog\.selectsideline\.com\/mission/);
  assert.match(sitemap, /https:\/\/blog\.selectsideline\.com\/goals/);
  assert.match(sitemap, /https:\/\/blog\.selectsideline\.com\/progress/);
  assert.match(sitemap, /https:\/\/blog\.selectsideline\.com\/watch-the-playbook/);
});
