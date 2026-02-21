import { describe, it, expect, vi } from "vitest";
import { preprocessBlock, blockProcessors } from "../../scripts/core/block-processors.js";

describe("block preprocessors", () => {
  it("recursively preprocesses nested blocks inside layout-row", async () => {
    const processor = vi.fn(async (block) => {
      block.data.processed = true;
    });
    blockProcessors.fake = processor;

    const rowBlock = {
      type: "layout-row",
      data: {
        components: [
          { type: "fake", data: {} },
          { type: "paragraph", data: { text: "plain" } }
        ]
      }
    };

    await preprocessBlock(rowBlock);

    expect(processor).toHaveBeenCalledTimes(1);
    expect(rowBlock.data.components[0].data.processed).toBe(true);

    delete blockProcessors.fake;
  });
});
