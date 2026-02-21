import { describe, it, expect } from "vitest";
import { renderCodeBlock } from "../../scripts/core/components/code-block.js";

describe("renderCodeBlock", () => {
  it("renders code with optional line numbers", () => {
    const html = renderCodeBlock({
      type: "code-block",
      data: {
        language: "js",
        lineNumbers: true,
        code: "const x = 1;\nconsole.log(x);"
      }
    });

    expect(html).toContain("block-code-block");
    expect(html).toContain("language-js");
    expect(html).toContain("data-line=\"1\"");
    expect(html).toContain("console.log");
  });
});

