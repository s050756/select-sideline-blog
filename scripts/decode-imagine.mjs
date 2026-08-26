import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const assets = [
  { dest: "public/apple-touch-icon.png", parts: ["imagine/apple-touch-icon.00.b64", "imagine/apple-touch-icon.01.b64"] },
  { dest: "public/favicon.png", parts: ["imagine/favicon.00.b64"] },
  { dest: "public/posts/goals.jpg", parts: ["imagine/goals.00.b64", "imagine/goals.01.b64", "imagine/goals.02.b64", "imagine/goals.03.b64", "imagine/goals.04.b64", "imagine/goals.05.b64", "imagine/goals.06.b64", "imagine/goals.07.b64", "imagine/goals.08.b64", "imagine/goals.09.b64", "imagine/goals.10.b64", "imagine/goals.11.b64", "imagine/goals.12.b64", "imagine/goals.13.b64", "imagine/goals.14.b64", "imagine/goals.15.b64"] },
  { dest: "public/hero.jpg", parts: ["imagine/hero.00.b64", "imagine/hero.01.b64", "imagine/hero.02.b64", "imagine/hero.03.b64", "imagine/hero.04.b64", "imagine/hero.05.b64", "imagine/hero.06.b64", "imagine/hero.07.b64", "imagine/hero.08.b64", "imagine/hero.09.b64", "imagine/hero.10.b64", "imagine/hero.11.b64", "imagine/hero.12.b64", "imagine/hero.13.b64", "imagine/hero.14.b64", "imagine/hero.15.b64", "imagine/hero.16.b64", "imagine/hero.17.b64", "imagine/hero.18.b64", "imagine/hero.19.b64", "imagine/hero.20.b64", "imagine/hero.21.b64", "imagine/hero.22.b64", "imagine/hero.23.b64", "imagine/hero.24.b64", "imagine/hero.25.b64", "imagine/hero.26.b64", "imagine/hero.27.b64", "imagine/hero.28.b64", "imagine/hero.29.b64", "imagine/hero.30.b64", "imagine/hero.31.b64", "imagine/hero.32.b64"] },
  { dest: "public/icon-512.png", parts: ["imagine/icon-512.00.b64", "imagine/icon-512.01.b64", "imagine/icon-512.02.b64", "imagine/icon-512.03.b64", "imagine/icon-512.04.b64", "imagine/icon-512.05.b64", "imagine/icon-512.06.b64", "imagine/icon-512.07.b64", "imagine/icon-512.08.b64"] },
  { dest: "public/posts/mission.jpg", parts: ["imagine/mission.00.b64", "imagine/mission.01.b64", "imagine/mission.02.b64", "imagine/mission.03.b64", "imagine/mission.04.b64", "imagine/mission.05.b64", "imagine/mission.06.b64", "imagine/mission.07.b64", "imagine/mission.08.b64", "imagine/mission.09.b64", "imagine/mission.10.b64", "imagine/mission.11.b64", "imagine/mission.12.b64", "imagine/mission.13.b64", "imagine/mission.14.b64", "imagine/mission.15.b64", "imagine/mission.16.b64", "imagine/mission.17.b64"] },
  { dest: "public/og.jpg", parts: ["imagine/og.00.b64", "imagine/og.01.b64", "imagine/og.02.b64", "imagine/og.03.b64", "imagine/og.04.b64", "imagine/og.05.b64", "imagine/og.06.b64", "imagine/og.07.b64", "imagine/og.08.b64", "imagine/og.09.b64", "imagine/og.10.b64"] },
  { dest: "public/posts/progress.jpg", parts: ["imagine/progress.00.b64", "imagine/progress.01.b64", "imagine/progress.02.b64", "imagine/progress.03.b64", "imagine/progress.04.b64", "imagine/progress.05.b64", "imagine/progress.06.b64", "imagine/progress.07.b64", "imagine/progress.08.b64", "imagine/progress.09.b64", "imagine/progress.10.b64", "imagine/progress.11.b64", "imagine/progress.12.b64", "imagine/progress.13.b64", "imagine/progress.14.b64", "imagine/progress.15.b64"] },
];

for (const asset of assets) {
  const dest = join(root, "..", asset.dest);
  await mkdir(dirname(dest), { recursive: true });
  let b64 = "";
  for (const part of asset.parts) {
    b64 += (await readFile(join(root, part), "utf8"));
  }
  await writeFile(dest, Buffer.from(b64.replace(/\s+/g, ""), "base64"));
}
