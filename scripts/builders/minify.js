import { minify as minifyHtml } from "html-minifier-terser";
import CleanCSS from "clean-css";
import { minify as minifyJs } from "terser";
import * as fs from "node:fs";
import path from "node:path";

export async function minifyDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await minifyDirectory(fullPath);
      continue;
    }

    if (entry.name.endsWith(".html")) {
      const html = fs.readFileSync(fullPath, "utf-8");
      const minified = await minifyHtml(html, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        minifyJS: true
      });
      fs.writeFileSync(fullPath, minified);
    }

    if (entry.name.endsWith(".css")) {
      const css = fs.readFileSync(fullPath, "utf-8");
      const output = new CleanCSS().minify(css);
      fs.writeFileSync(fullPath, output.styles);
    }

    if (entry.name.endsWith(".js")) {
      const js = fs.readFileSync(fullPath, "utf-8");
      const result = await minifyJs(js, {
        compress: true,
        mangle: true
      });
      fs.writeFileSync(fullPath, result.code);
    }
  }
}
