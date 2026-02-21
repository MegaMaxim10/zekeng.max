import { describe, it, expect } from "vitest";
import { renderTable } from "../../scripts/core/components/table.js";

describe("renderTable", () => {
  it("renders table headers and rows", () => {
    const html = renderTable({
      type: "table",
      data: {
        caption: "Quick facts",
        headers: ["Name", "Role"],
        rows: [
          ["Alice", "Lead"],
          ["Bob", "Support"]
        ]
      }
    });

    expect(html).toContain("block-table");
    expect(html).toContain("<th scope=\"col\">Name</th>");
    expect(html).toContain("<td>Alice</td>");
    expect(html).toContain("Quick facts");
  });
});

