import { describe, it, expect } from "vitest";
import type { PdfTableResponse, TableResponse } from "./client/index.js";
import { parseImageTableResponse, parsePdfTableResponse } from "./parse.js";

describe("Parse response", () => {
    const baseTable = {
        title: "Test Table",
        box: { x1: 0, y1: 0, x2: 100, y2: 100 },
        grid: [
            [0, 0],
            [1, 2],
        ],
        cells: [{ content: "Header" }, { content: "A" }, { content: "B" }],
    };

    it("should create a correctly linked ExtractedTable from response", () => {
        const mockResponse: TableResponse[] = [baseTable];

        const tables = parseImageTableResponse(mockResponse);

        expect(tables).toHaveLength(1);

        const table = tables[0]!;
        expect(table.title).toBe("Test Table");
        expect(table.box).toEqual({ x1: 0, y1: 0, x2: 100, y2: 100 });
        expect(table.cells).toHaveLength(3);
        expect(table.grid.flat()).toHaveLength(4);

        // Check the wiring between grid and cells
        table.grid[0]![0]!.content = "test";
        expect(table.cells[0]!.content).toBe("test");
        expect(table.grid[0]![1]!.content).toBe("test");
    });

    it("should create a correctly linked PdfExtractedTable from response", () => {
        const mockResponse: PdfTableResponse[] = [
            {
                ...baseTable,
                page: 2,
            },
        ];

        const tables = parsePdfTableResponse(mockResponse);

        expect(tables).toHaveLength(1);

        const table = tables[0]!;
        expect(table.title).toBe("Test Table");
        expect(table.box).toEqual({ x1: 0, y1: 0, x2: 100, y2: 100 });
        expect(table.cells).toHaveLength(3);
        expect(table.grid.flat()).toHaveLength(4);
        expect(table.page).toBe(2);

        // Check the wiring between grid and cells
        table.grid[0]![0]!.content = "test";
        expect(table.cells[0]!.content).toBe("test");
        expect(table.grid[0]![1]!.content).toBe("test");
    });
});
