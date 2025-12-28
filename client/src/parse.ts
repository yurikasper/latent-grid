import { checkCell, TableCell } from "./types/table-cell.js";
import type { PdfTableResponse, TableResponse } from "./client/index.js";
import { ExtractedTable, PdfExtractedTable } from "./types/extracted-table.js";

function parseTableResponse(table: TableResponse) {
    const cells = cellsToDomain(table.cells);

    const extractedTable: ExtractedTable = new ExtractedTable({
        title: table.title || undefined,
        box: table.box,
        grid: [],
        cells,
    });

    attachGrid(extractedTable, table.grid);
    extractedTable.cells.forEach(checkCell);

    return extractedTable;
}

export function parseImageTableResponse(
    data: TableResponse[]
): ExtractedTable[] {
    return data.map(parseTableResponse);
}

export function parsePdfTableResponse(
    data: PdfTableResponse[]
): PdfExtractedTable[] {
    return data.map((table) => {
        const parsedTable = parseTableResponse(table);
        return new PdfExtractedTable({
            ...parsedTable,
            page: table.page,
        });
    });
}

function cellsToDomain(cells: TableResponse["cells"]): TableCell[] {
    return cells.map(
        (cell) =>
            new TableCell({
                content: cell.content || undefined,
                _positions: [],
                _table: null,
            })
    );
}

function attachGrid(
    table: ExtractedTable | PdfExtractedTable,
    indexGrid: number[][]
) {
    table.grid = [];
    indexGrid.forEach((row, rowIndex) => {
        row.forEach((_, colIndex) => {
            const cellIndex = indexGrid?.[rowIndex]?.[colIndex];
            if (
                !cellIndex ||
                cellIndex < 0 ||
                cellIndex >= table.cells.length
            ) {
                throw new Error(
                    `Invalid cell index ${cellIndex} at grid position (${rowIndex}, ${colIndex})`
                );
            }

            if (table.grid[rowIndex] === undefined) {
                table.grid[rowIndex] = [];
            }

            if (!table.cells[cellIndex]) {
                throw new Error(`Cell at index ${cellIndex} doesn't exist.`);
            }
            table.grid[rowIndex][colIndex] = table.cells[cellIndex];
            table.cells[cellIndex]._positions.push({
                row: rowIndex,
                col: colIndex,
            });
        });
    });
    table.cells.forEach((cell) => {
        cell._table = table;
    });
}
