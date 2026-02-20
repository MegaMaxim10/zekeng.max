import * as fs from 'node:fs';
import { renderStyles } from "../utils/render-utils.js";

export function renderHtmlContent(block) {
    let htmlPath = String(block.data.url || "");
    if (!fs.existsSync(htmlPath)) {
        if (htmlPath.startsWith("content/")) {
            const mappedPath = `src/${htmlPath}`;
            if (fs.existsSync(mappedPath)) {
                htmlPath = mappedPath;
            }
        }
    }
    const html = fs.readFileSync(htmlPath, "utf-8").replace(/\r\n/g, "\n");
    const classes = ["html-content", "block-html-content", renderStyles(block)].filter(Boolean).join(" ");

    return `<div class="${classes}">${html}</div>`;
}
