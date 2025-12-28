import { ExtractedTable } from "./extracted-table.js";

export type CellPosition = {
    row: number;
    col: number;
};

/**
 * Represents a single cell within an extracted table.
 * Provides methods to navigate the table grid relative to this cell.
 */
export class TableCell {
    /**
     * The text content of the cell.
     */
    content?: string;

    _table: ExtractedTable | null;
    _positions: CellPosition[] = [];

    constructor(data: {
        content?: string;
        _table: ExtractedTable | null;
        _positions: CellPosition[];
    }) {
        this.content = data.content;
        this._table = data._table;
        this._positions = data._positions;
    }

    /**
     * Retrieves the coordinates of the cell at the specified index.
     * Useful if the cell spans multiple positions.
     *
     * @param index - The index of the position to retrieve (default is 0).
     * @returns The row and column index of the cell position.
     */
    coordinates(index = 0) {
        return this._positions[index];
    }

    /**
     * Retrieves the number of rows this cell spans.
     *
     * @returns The number of rows spanned by this cell.
     */
    rowspan() {
        const rows = this._positions.map((pos) => pos.row);
        return Math.max(...rows) - Math.min(...rows) + 1;
    }

    /**
     * Retrieves the number of columns this cell spans.
     *
     * @returns The number of columns spanned by this cell.
     */
    colspan() {
        const cols = this._positions.map((pos) => pos.col);
        return Math.max(...cols) - Math.min(...cols) + 1;
    }

    /**
     * Retrieves all cells in the same row as this cell's position at the given index.
     * The index determines which position to use if the cell spans multiple rows.
     *
     * @param index - The index of the position to use for determining the row (default is 0).
     * @returns An array of TableCell objects in the row.
     */
    row(index = 0): TableCell[] {
        if (!this._positions[index]) {
            return [];
        }
        const { row } = this._positions[index];
        return this._table!.grid[row] ?? [];
    }

    /**
     * Retrieves all cells in the same column as this cell's position at the given index.
     * The index determines which position to use if the cell spans multiple columns.
     *
     * @param index - The index of the position to use for determining the column (default is 0).
     * @returns An array of TableCell objects in the column.
     */
    column(index = 0): TableCell[] {
        if (!this._positions[index]) {
            return [];
        }
        const { col } = this._positions[index];
        return this._table!.grid.map((r) => r[col]).filter(
            (cell) => cell !== undefined
        );
    }

    /**
     * Retrieves the cell(s) immediately above this cell.
     *
     * @returns An array of TableCell objects located above this cell.
     */
    top(): TableCell[] {
        return this.neighbor(-1, 0);
    }

    /**
     * Retrieves the cell(s) immediately below this cell.
     *
     * @returns An array of TableCell objects located below this cell.
     */
    bottom(): TableCell[] {
        return this.neighbor(1, 0);
    }

    /**
     * Retrieves the cell(s) immediately to the left of this cell.
     *
     * @returns An array of TableCell objects located to the left of this cell.
     */
    left(): TableCell[] {
        return this.neighbor(0, -1);
    }

    /**
     * Retrieves the cell(s) immediately to the right of this cell.
     *
     * @returns An array of TableCell objects located to the right of this cell.
     */
    right(): TableCell[] {
        return this.neighbor(0, 1);
    }

    private neighbor(offsetRow: number, offsetCol: number): TableCell[] {
        const positions = this._positions
            .map(({ row, col }) => ({
                row: row + offsetRow,
                col: col + offsetCol,
            }))
            .filter(
                ({ row, col }) =>
                    row >= 0 &&
                    row < this._table!.grid.length &&
                    col >= 0 &&
                    this._table!.grid[row] &&
                    col < this._table!.grid[row].length
            )
            // Filter out the cell itself
            .filter(({ row, col }) => {
                return !this._positions.some(
                    (pos) => pos.row === row && pos.col === col
                );
            });
        return positions
            .map(({ row, col }) => this._table!.grid?.[row]?.[col])
            .filter((cell) => cell !== undefined);
    }
}

export function checkCell(cell: TableCell) {
    if (!cell._table) {
        throw new Error("Cell is not associated with any table.");
    }
    if (cell._positions.length === 0) {
        throw new Error("Cell has no position information.");
    }
}
