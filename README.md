# Latent Grid

an opinionated, plug-and-play table extraction container and TypeScript client

This project is meant to be a simple way to integrate table extraction into TypeScript projects without messing with Python or overloading your main server with inference. It uses [img2table](https://github.com/xavctn/img2table) with [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) under the hood, giving surprising accuracy in image and PDF table extraction.

## Getting started

You can run the extraction service with

```bash
docker run -p 8000:8000 ghcr.io/yurikasper/latent-grid:0.1
# Replace first "8000" with the port you wish to run the service on
```

Then, just install the client library using your package manager of choice:

```bash
npm install @yurikasper/latent-grid@~0.1.1

pnpm add @yurikasper/latent-grid@~0.1.1

yarn add @yurikasper/latent-grid@~0.1.1
```

To run an extraction on a given document, provide a public or pre-signed url, along with the other parameters, to one of the given methods:

```js
const extractor = new TableExtractor("https://extractor-service.example.com");

const tables = extractor.processImage({
    url: "https://bucket.example.com/input.jpg",
    implicit_columns: true,
    implicit_rows: true,
});

const pdfTables = extractor.processPdf({
    url: "https://bucket.example.com/input.pdf",
    pages: [1, 2],
});
```

**Latent Grid** takes advantage of JS's object reference system to build a grid representation of the underlying structure of extracted tables, allowing merged cells to be referenced multiple times in the grid space while still being a single instance. You can get cells from the extracted table using the provided methods:

```js
const totalHeader = table.findCellsByContent(/total/i)[0]!;
const totalColumn = totalHeader.column(); // Get entire column (TableCell[])

const firstCell = table.getCell(0, 0)!;
const secondCell = firstCell.bottom(); // Get cell below this one
```
