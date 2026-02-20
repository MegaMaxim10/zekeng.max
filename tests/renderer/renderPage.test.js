import { describe, it, expect } from "vitest";
import { renderPage } from "../../scripts/core/renderer.js";
import * as fs from "node:fs";

describe("renderPage integration", () => {
  it("renders a full page snapshot", async () => {
    const page = JSON.parse(
      fs.readFileSync("tests/fixtures/page.simple.json", "utf-8")
    );

    const html = renderPage(page);
    await expect(html).toMatchFileSnapshot("snapshots/page.simple.html");
  });
});
