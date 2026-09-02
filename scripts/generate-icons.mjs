// Rasterises the app icon SVGs in public/ to the PNG sizes the web manifest
// points at. sharp is NOT a dependency of this project - the script shells out
// to `npx sharp-cli`, which fetches it on demand, so nothing heavy or platform
// specific lands in package.json for a task that runs once per icon change.
//
//   node scripts/generate-icons.mjs               (regenerate as shipped)
//   node scripts/generate-icons.mjs icon-other    (rasterise a different source)
//
// Anything written here is committed - the build does not run it.

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const source = process.argv[2] ?? 'icon-wheel';

// [source svg, output png, pixel size]
const targets = [
  [`${source}.svg`, 'icon-192.png', 192],
  [`${source}.svg`, 'icon-512.png', 512],
  ['icon-maskable.svg', 'icon-maskable-512.png', 512],
];

for (const [svg, png, size] of targets) {
  // shell: true is required on Windows - Node refuses to spawn npx.cmd
  // directly (EINVAL) - so every path argument is quoted for the shell.
  const q = (v) => `"${v}"`;
  execFileSync(
    'npx',
    ['--yes', 'sharp-cli@6', '--input', q(path.join(publicDir, svg)),
     '--output', q(path.join(publicDir, png)), 'resize', String(size), String(size)],
    { stdio: 'inherit', shell: true },
  );
  console.log(`${png}  <-  ${svg}  @ ${size}x${size}`);
}
