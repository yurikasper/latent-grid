import { describe, expect, it } from "vitest";
import { buildTable } from "../test/table-fixture.js";

describe("ExtractedTable", () => {
    const table = buildTable();

    it("should return correct cell by coordinates", () => {
        const cell = table.getCell(0, 0);
        expect(cell).toBe(table.grid[0]![0]);

        const outOfBoundsCell = table.getCell(10, 10);
        expect(outOfBoundsCell).toBeNull();
    });

    it("should find cells by content", () => {
        const foundCells = table.findCellsByContent(/header/i);
        expect(foundCells).toHaveLength(1);
        expect(foundCells[0]).toBe(table.cells[0]);
    });
});
