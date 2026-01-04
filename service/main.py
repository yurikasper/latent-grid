from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import httpx
import os
import tempfile
from img2table.ocr import PaddleOCR
from img2table.document import Image, PDF
from bs4 import BeautifulSoup
from contextlib import asynccontextmanager

# Avoid loading the OCR model when generating OpenAPI schema
ocr: Optional[PaddleOCR] = None


def get_ocr() -> PaddleOCR:
    global ocr
    if ocr is None:
        ocr = PaddleOCR(lang="en")
    return ocr


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load OCR model
    get_ocr()
    yield


app = FastAPI(title="Latent Grid Service", version="0.1.3", lifespan=lifespan)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


class BaseRequest(BaseModel):
    url: str
    implicit_rows: bool = False
    implicit_columns: bool = False
    borderless_tables: bool = False
    min_confidence: int = Field(default=50, ge=0, le=99)
    detect_rotation: bool = False


class PDFRequest(BaseRequest):
    pages: Optional[List[int]] = None
    pdf_text_extraction: bool = True


class CellContent(BaseModel):
    content: Optional[str] = None


class BoundingBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int


class TableResponse(BaseModel):
    box: BoundingBox
    title: Optional[str]
    grid: List[List[int]]
    cells: List[CellContent]


class PdfTableResponse(TableResponse):
    page: int


async def download_file(url: str) -> str:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=400, detail=f"Error downloading file: {e}")

        suffix = os.path.splitext(url)[1]
        if not suffix:
            suffix = ".tmp"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(response.content)
            return tmp.name


def convert_table_to_response(table) -> TableResponse:
    bbox = BoundingBox(
        x1=table.bbox.x1, y1=table.bbox.y1, x2=table.bbox.x2, y2=table.bbox.y2
    )

    # Parse HTML to build grid and cells
    soup = BeautifulSoup(table.html, "html.parser")

    grid = []
    cells = []

    rows = soup.find_all("tr")
    if not rows:
        return TableResponse(
            box=bbox,
            title=table.title,
            grid=[],
            cells=[],
        )

    # We need to dynamically expand the grid as we process rows because of rowspans
    grid = []

    for r_idx, row in enumerate(rows):
        # Ensure current row exists in grid
        while len(grid) <= r_idx:
            grid.append([])

        c_idx = 0
        cols = row.find_all(["td", "th"])

        for col in cols:
            # Skip columns that are already filled by previous rowspans
            while c_idx < len(grid[r_idx]) and grid[r_idx][c_idx] is not None:
                c_idx += 1

            # Get span values
            rowspan = int(col.get("rowspan", 1))  # type: ignore (this attribute will always be a string if present)
            colspan = int(col.get("colspan", 1))  # type: ignore

            # Get content
            content = col.get_text(strip=True)
            if not content:
                content = None
            cell_index = len(cells)
            cells.append(CellContent(content=content))

            # Fill the grid
            for r in range(rowspan):
                target_row = r_idx + r
                # Ensure target row exists
                while len(grid) <= target_row:
                    grid.append([])

                for c in range(colspan):
                    target_col = c_idx + c
                    # Ensure target column exists (pad with None if needed)
                    while len(grid[target_row]) <= target_col:
                        grid[target_row].append(None)

                    grid[target_row][target_col] = cell_index

            c_idx += colspan

    return TableResponse(box=bbox, title=table.title, grid=grid, cells=cells)


def convert_pdf_table_to_response(table, page_idx: int) -> PdfTableResponse:
    base_response = convert_table_to_response(table)
    return PdfTableResponse(page=page_idx, **base_response.model_dump())


@app.post(
    "/image", response_model=List[TableResponse], response_model_exclude_none=True
)
async def process_image(request: BaseRequest):
    print("Processing image request:", request)

    file_path = await download_file(request.url)
    try:
        doc = Image(src=file_path, detect_rotation=request.detect_rotation)

        extracted_tables = doc.extract_tables(
            ocr=get_ocr(),
            implicit_rows=request.implicit_rows,
            implicit_columns=request.implicit_columns,
            borderless_tables=request.borderless_tables,
            min_confidence=request.min_confidence,
        )

        response = []
        for table in extracted_tables:
            response.append(convert_table_to_response(table))

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@app.post(
    "/pdf", response_model=List[PdfTableResponse], response_model_exclude_none=True
)
async def process_pdf(request: PDFRequest):
    print("Processing PDF request:", request)

    file_path = await download_file(request.url)
    try:
        doc = PDF(
            src=file_path,
            pages=request.pages,  # type: ignore (library default is none, so it should be fine)
            detect_rotation=request.detect_rotation,
            pdf_text_extraction=request.pdf_text_extraction,
        )

        # extract_tables returns Dict[int, List[ExtractedTable]] for PDF
        extracted_tables_dict = doc.extract_tables(
            ocr=get_ocr(),
            implicit_rows=request.implicit_rows,
            implicit_columns=request.implicit_columns,
            borderless_tables=request.borderless_tables,
            min_confidence=request.min_confidence,
        )

        response = []
        for page_idx, tables in extracted_tables_dict.items():
            for table in tables:
                response.append(convert_pdf_table_to_response(table, page_idx=page_idx))

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
