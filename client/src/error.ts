import type { HttpValidationError } from "./client/index.js";

export function checkResponse<
    T extends { data: any; error: HttpValidationError | undefined }
>(
    response: T
): asserts response is Extract<T, { data: any; error: undefined }> {
    if (
        (response as any).data === undefined &&
        (response as any).error !== undefined
    ) {
        throw response.error;
    }
}
