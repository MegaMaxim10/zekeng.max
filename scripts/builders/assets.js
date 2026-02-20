import fs from "node:fs";
import path from "node:path";

export function copyDir(src, dest, log = false) {
  if (!fs.existsSync(src)) return;

  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, log);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }

    if (log) console.log(`Copied ${srcPath} → ${destPath}`);
  }
}
