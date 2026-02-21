import { describe, it, expect } from "vitest";
import { renderEmbed } from "../../scripts/core/components/embed.js";

describe("renderEmbed", () => {
  it("renders iframe embed", () => {
    const html = renderEmbed({
      type: "embed",
      data: {
        src: "https://example.org/embed/video",
        title: "Example embed"
      }
    });

    expect(html).toContain("block-embed");
    expect(html).toContain("<iframe");
    expect(html).toContain("https://example.org/embed/video");
  });

  it("renders local video embed", () => {
    const html = renderEmbed({
      type: "embed",
      data: {
        kind: "video",
        src: "src/assets/videos/demo.mp4"
      }
    });

    expect(html).toContain("<video");
    expect(html).toContain('{{basePath}}/assets/videos/demo.mp4');
  });
});

