import { describe, it, expect } from "vitest";
import { renderParagraph } from "../../src/js/components/paragraph.js";

describe("renderParagraph", () => {
    it("renders a paragraph block", () => {
        const paragraph = {
            type: "paragraph",
            data: { text: "Hello world" }
        };

        const html = renderParagraph(paragraph);
        expect(html).toContain("<p");
        expect(html).toContain("Hello world");
    });
});
