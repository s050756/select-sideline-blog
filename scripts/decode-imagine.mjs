import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const files = [
  ["imagine/og.jpg.b64", "public/og.jpg"],
  ["imagine/hero.jpg.b64", "public/hero.jpg"],
  ["imagine/mission.jpg.b64", "public/posts/mission.jpg"],
  ["imagine/goals.jpg.b64", "public/posts/goals.jpg"],
  ["imagine/progress.jpg.b64", "public/posts/progress.jpg"],
  ["imagine/favicon.png.b64", "public/favicon.png"],
  ["imagine/apple-touch-icon.png.b64", "public/apple-touch-icon.png"],
  ["imagine/icon-512.png.b64", "public/icon-512.png"],
];

for (const [from, to] of files) {
  const dest = join(root, "..", to);
  await mkdir(dirname(dest), { recursive: true });
  const b64 = (await readFile(join(root, from), "utf8")).replace(/\s+/g, "");
  await writeFile(dest, Buffer.from(b64, "base64"));
}
