import { describe, it, expect } from "vitest";
import { renderCardGrid } from "../../src/js/components/card-grid";

describe("renderCardGrid", () => {
    it("renders a card grid block", () => {
        const cardGrid = {
            type: "card-grid",
            data: {
            cards: [
                { title: "Card A", description: "Desc A" },
                { title: "Card B", description: "Desc B" }
            ]
            }
        }

        const html = renderCardGrid(cardGrid);
        expect(html).toContain("card-grid");
        expect(html).toContain("Card A");
        expect(html).toContain("Card B");
    });
});
