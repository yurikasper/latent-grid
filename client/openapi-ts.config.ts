import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
    input: "../service/openapi.json",
    output: {
        path: "src/client",
        importFileExtension: ".js",
        tsConfigPath: "./tsconfig.json",
        lint: "eslint",
    },
});
