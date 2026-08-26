import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

/** Prefer a single imagine/<prefix>.b64 when present; else concatenate numbered .NN.b64 parts. */
async function loadB64(prefix) {
  const dir = join(root, "imagine");
  const names = await readdir(dir);
  const full = `${prefix}.b64`;
  if (names.includes(full)) {
    return await readFile(join(dir, full), "utf8");
  }
  const re = new RegExp(
    `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\.\\d{2}\.b64$`
  );
  const parts = names.filter((n) => re.test(n)).sort();
  if (!parts.length) {
    throw new Error(`missing Grok Imagine parts for ${prefix}`);
  }
  let b64 = "";
  for (const part of parts) {
    b64 += await readFile(join(dir, part), "utf8");
  }
  return b64;
}

const assets = [
  { dest: "public/apple-touch-icon.png", prefix: "apple-touch-icon.png" },
  { dest: "public/favicon.png", prefix: "favicon.png" },
  { dest: "public/posts/goals.jpg", prefix: "goals" },
  { dest: "public/hero.jpg", prefix: "hero" },
  { dest: "public/icon-512.png", prefix: "icon-512" },
  { dest: "public/posts/mission.jpg", prefix: "mission" },
  { dest: "public/og.jpg", prefix: "og" },
  { dest: "public/posts/progress.jpg", prefix: "progress" },
];

for (const asset of assets) {
  const dest = join(root, "..", asset.dest);
  await mkdir(dirname(dest), { recursive: true });
  const b64 = await loadB64(asset.prefix);
  await writeFile(dest, Buffer.from(b64.replace(/\s+/g, ""), "base64"));
}
