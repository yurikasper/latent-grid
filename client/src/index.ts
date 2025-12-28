import {
    type BaseRequest,
    type PdfRequest,
    processImageImagePost,
    processPdfPdfPost,
} from "./client/index.js";
import { checkResponse } from "./error.js";
import { parseImageTableResponse, parsePdfTableResponse } from "./parse.js";
import { ExtractedTable, PdfExtractedTable } from "./types/extracted-table.js";

export class TableExtractor {
    url: string | null = null;

    /**
     * Creates an instance of the extractor client.
     *
     * @param url - The URL of the extraction server.
     */
    constructor(url: string) {
        this.url = url;
    }

    /**
     * Processes an image to extract tables.
     *
     * @param params - The extraction parameters, as defined by img2table
     * @returns The extracted tables.
     */
    async processImage(params: BaseRequest): Promise<ExtractedTable[]> {
        const response = await processImageImagePost({
            baseUrl: this.url!,
            body: params,
        });

        checkResponse(response);

        return parseImageTableResponse(response.data);
    }

    /**
     * Processes a PDF to extract tables.
     *
     * @param params - The extraction parameters, as defined by img2table
     * @returns The extracted tables.
     */
    async processPdf(params: PdfRequest): Promise<PdfExtractedTable[]> {
        const response = await processPdfPdfPost({
            baseUrl: this.url!,
            body: params,
        });

        checkResponse(response);

        return parsePdfTableResponse(response.data);
    }
}
