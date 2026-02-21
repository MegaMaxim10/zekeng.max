import { describe, it, expect } from "vitest";
import { renderParagraph } from "../../scripts/core/components/paragraph.js";

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

    it("renders markdown-style links in paragraph text", () => {
        const paragraph = {
            type: "paragraph",
            data: {
                text: "Read [news](1-news/news.html) or [website](https://example.org)."
            }
        };

        const html = renderParagraph(paragraph);
        expect(html).toContain('href="{{basePath}}/1-news/news.html"');
        expect(html).toContain('href="https://example.org"');
        expect(html).toContain('target="_blank"');
    });

    it("renders inline formatting tokens", () => {
        const paragraph = {
            type: "paragraph",
            data: {
                text: "[b]Bold[/b], [i]italic[/i], [u]underline[/u], [color=#0d6adf]blue[/color], [font=mono]mono[/font]."
            }
        };

        const html = renderParagraph(paragraph);
        expect(html).toContain("<strong>Bold</strong>");
        expect(html).toContain("<em>italic</em>");
        expect(html).toContain("<u>underline</u>");
        expect(html).toContain('style="color: #0d6adf;"');
        expect(html).toContain("font-family");
    });
});

