import * as fs from "node:fs";
import * as http from "node:http";
import path from "node:path";
import { URL } from "node:url";

import { outputPathFor } from "./site-graph.js";
import { resolveContentConfigReferences } from "./content-resolver.js";
import { readPortfolioConfig } from "./portfolio-config.js";

const DEFAULT_PORT = 4173;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_ROOT = "public";
const CONTENT_DIR = "src/content";

const options = parseServeCliOptions(process.argv.slice(2));
const rootDir = path.resolve(options.root);
const previewPagePath = resolvePreviewPagePath(options.page);

if (!fs.existsSync(rootDir)) {
  throw new Error(`Output directory not found: ${rootDir}. Run "npm run build" first.`);
}

const server = http.createServer((request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    let pathname = decodeURIComponent(url.pathname || "/");

    if (pathname === "/" && previewPagePath) {
      response.writeHead(302, { Location: previewPagePath });
      response.end();
      return;
    }

    const filePath = resolveRequestedFile(rootDir, pathname);
    if (!filePath) {
      respondNotFound(response, pathname);
      return;
    }

    const contentType = mimeTypeFor(filePath);
    response.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`Server error: ${error.message}`);
  }
});

server.listen(options.port, options.host, () => {
  const baseUrl = `http://${options.host}:${options.port}`;
  console.log(`Serving ${rootDir}`);
  console.log(`Preview URL: ${baseUrl}/`);
  if (previewPagePath) {
    console.log(`Single-page preview: ${baseUrl}${previewPagePath}`);
  }
});

function parseServeCliOptions(args) {
  const parsed = {
    root: DEFAULT_ROOT,
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    page: ""
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = String(args[index] || "");
    if (arg === "--page") {
      const value = String(args[index + 1] || "").trim();
      if (!value || value.startsWith("--")) {
        throw new Error('Missing value for "--page".');
      }
      parsed.page = value;
      index += 1;
      continue;
    }
    if (arg === "--port") {
      const value = Number.parseInt(String(args[index + 1] || ""), 10);
      if (!Number.isInteger(value) || value < 1 || value > 65535) {
        throw new Error('Invalid "--port" value.');
      }
      parsed.port = value;
      index += 1;
      continue;
    }
    if (arg === "--host") {
      const value = String(args[index + 1] || "").trim();
      if (!value || value.startsWith("--")) {
        throw new Error('Missing value for "--host".');
      }
      parsed.host = value;
      index += 1;
      continue;
    }
    if (arg === "--root") {
      const value = String(args[index + 1] || "").trim();
      if (!value || value.startsWith("--")) {
        throw new Error('Missing value for "--root".');
      }
      parsed.root = value;
      index += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log([
        "Usage:",
        "  node scripts/builders/serve.js",
        "  node scripts/builders/serve.js --page <content-json-path|public-html-path>",
        "  node scripts/builders/serve.js --port 4173 --host 127.0.0.1"
      ].join("\n"));
      process.exit(0);
    }
    throw new Error(`Unknown serve option: ${arg}`);
  }

  return parsed;
}

function resolvePreviewPagePath(pageArg) {
  const value = String(pageArg || "").trim();
  if (!value) return "";

  if (value.endsWith(".json")) {
    return resolvePreviewPathFromContentJson(value);
  }

  if (value.endsWith(".html")) {
    return `/${value.replace(/\\/g, "/").replace(/^\/+/, "")}`;
  }

  return value.startsWith("/") ? value : `/${value}`;
}

function resolvePreviewPathFromContentJson(contentPathArg) {
  const absolute = path.resolve(contentPathArg);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Content page not found: ${contentPathArg}`);
  }

  const portfolioConfig = readPortfolioConfig();
  const raw = JSON.parse(fs.readFileSync(absolute, "utf-8"));
  const pageJson = resolveContentConfigReferences(raw, portfolioConfig);
  const page = {
    file: absolute,
    json: pageJson,
    dir: path.dirname(absolute),
    name: path.basename(absolute)
  };

  const outputRelativePath = outputPathFor(page, path.resolve(CONTENT_DIR));
  return `/${String(outputRelativePath).replace(/\\/g, "/").replace(/^\/+/, "")}`;
}

function resolveRequestedFile(root, pathname) {
  const relative = pathname.replace(/^\/+/, "");
  const candidates = [];

  if (!relative) {
    candidates.push("index.html");
  } else {
    candidates.push(relative);
    if (relative.endsWith("/")) {
      candidates.push(path.posix.join(relative, "index.html"));
    } else if (!path.extname(relative)) {
      candidates.push(`${relative}.html`);
      candidates.push(path.posix.join(relative, "index.html"));
    }
  }

  for (const candidate of candidates) {
    const filePath = path.resolve(root, candidate);
    if (!filePath.startsWith(root)) continue;
    if (!fs.existsSync(filePath)) continue;
    if (!fs.statSync(filePath).isFile()) continue;
    return filePath;
  }

  return null;
}

function respondNotFound(response, pathname) {
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(`Not found: ${pathname}`);
}

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".pdf": "application/pdf",
    ".txt": "text/plain; charset=utf-8"
  };
  return types[ext] || "application/octet-stream";
}
