import { describe, it, expect } from "vitest";
import { escapeHtml } from "../../src/js/utils/render-utils.js";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    const input = `<script>alert("x")</script>`;
    const output = escapeHtml(input);

    expect(output).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
  });
});