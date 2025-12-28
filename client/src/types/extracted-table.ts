import { TableCell } from "./table-cell.js";

type Box = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

export type TableGrid = TableCell[][];

export class ExtractedTable {
    title?: string;
    box: Box;
    grid: TableGrid;
    cells: TableCell[];

    constructor(data: {
        title?: string;
        box: Box;
        grid: TableGrid;
        cells: TableCell[];
    }) {
        this.title = data.title;
        this.box = data.box;
        this.grid = data.grid;
        this.cells = data.cells;
    }

    getCell(row: number, col: number): TableCell | null {
        if (row < 0 || row >= this.grid.length) {
            return null;
        }
        if (col < 0 || !this.grid[row] || col >= this.grid[row].length) {
            return null;
        }
        return this.grid[row][col] ?? null;
    }

    findCellsByContent(search: string | RegExp): TableCell[] {
        const results: TableCell[] = [];
        for (const cell of this.cells) {
            if (cell.content) {
                if (typeof search === "string") {
                    if (cell.content.includes(search)) {
                        results.push(cell);
                    }
                }
                if (search instanceof RegExp) {
                    if (search.test(cell.content)) {
                        results.push(cell);
                    }
                }
            }
        }
        return results;
    }
}

export class PdfExtractedTable extends ExtractedTable {
    page: number;

    constructor(
        data: ConstructorParameters<typeof ExtractedTable>[0] & {
            page: number;
        }
    ) {
        super(data);
        this.page = data.page;
    }
}
