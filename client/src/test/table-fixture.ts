import type { TableResponse } from "../client/index.js";
import { parseImageTableResponse } from "../parse.js";
import { ExtractedTable } from "../types/extracted-table.js";

export function buildTable(
    overrides: Partial<TableResponse> = {}
): ExtractedTable {
    const baseTable = {
        title: "Test Table",
        box: { x1: 0, y1: 0, x2: 100, y2: 100 },
        grid: [
            [0, 0],
            [1, 2],
        ],
        cells: [{ content: "Header" }, { content: "A" }, { content: "B" }],
        ...overrides,
    };
    const table = parseImageTableResponse([baseTable])[0];
    return table!;
}
