import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import { copyDir } from "../../scripts/builders/assets.js";

const TMP = "tmp-test-assets";

describe("copyDir", () => {
    afterEach(() => {
        fs.rmSync(TMP, { recursive: true, force: true });
    });

    it("copies files recursively", () => {
        fs.mkdirSync(`${TMP}/src`, { recursive: true });
        fs.writeFileSync(`${TMP}/src/a.txt`, "x");

        copyDir(`${TMP}/src`, `${TMP}/dest`);

        expect(fs.existsSync(`${TMP}/dest/a.txt`)).toBe(true);
    });
});


