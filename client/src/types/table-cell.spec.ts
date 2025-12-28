import { describe, expect, it } from "vitest";
import { buildTable } from "../test/table-fixture.js";

describe("TableCell", () => {
    const table = buildTable();

    const cell = table.cells[0]!; // The wide cell at (0,0) spanning two columns

    it("should report correct position and spans", () => {
        expect(cell.colspan()).toBe(2);
        expect(cell.rowspan()).toBe(1);
        expect(cell.coordinates()).toEqual({ row: 0, col: 0 });
        expect(cell.coordinates(1)).toEqual({ row: 0, col: 1 });
    });

    it("should retrieve correct rows and columns", () => {
        const cellsInRow = cell.row();
        expect(cellsInRow).toHaveLength(2);
        expect(cellsInRow).toContain(cell);

        const cellsInColumn = cell.column(1);
        expect(cellsInColumn).toHaveLength(2);
        expect(cellsInColumn).toContain(cell);
        expect(cellsInColumn).toContain(table.grid[1]![1]);
    });

    it("should retrieve correct neighboring cells", () => {
        expect(cell.left()).toHaveLength(0);
        expect(cell.right()).toHaveLength(0);
        expect(cell.top()).toHaveLength(0);

        const bottomCells = cell.bottom();
        expect(bottomCells).toHaveLength(2);
        expect(bottomCells).toContain(table.grid[1]![0]);
        expect(bottomCells).toContain(table.grid[1]![1]);

        expect(bottomCells[0]!.top()).toContain(cell);
    });
});
