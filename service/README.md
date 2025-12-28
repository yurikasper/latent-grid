# Latent Grid Service

This is a FastAPI service that extracts tables from Images and PDFs using [img2table](https://github.com/xavctn/img2table) and [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR).

## Usage

This project is meant as a plug-and-play container that can be interfaced with using the accompanying TypeScript library.

1. **Build the image:**

    ```bash
    docker build -t latent-grid .
    ```

2. **Run the container:**

    ```bash
    docker run -p 8000:8000 latent-grid
    ```

The server will start at `http://localhost:8000`.

You can check out the API documentation at `http://localhost:8000/docs`.
