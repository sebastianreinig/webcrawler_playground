# Webcrawler Playground

A powerful, customizable, and containerized web spider designed for testing and data extraction.

<img width="1010" height="869" alt="image" src="https://github.com/user-attachments/assets/c5be68d2-f06b-4395-b3a1-5fbec250d857" />


## 📚 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [How to Run](#-how-to-run)
  - [With Docker (Recommended)](#with-docker-recommended)
  - [Local Setup (No Docker)](#local-setup-no-docker)
- [Usage](#-usage)
- [License](#-license--legal)

## 🚀 Features

- **Recursive Crawling**: Spider engine capable of BFS/DFS traversal with configurable depth.
- **Advanced Configuration**:
    - **Max Depth**: Limit how many links deep the crawler goes.
    - **Max Pages**: Hard limit on total pages to scrape.
    - **Custom Selectors**: Define CSS selectors for specific link following and content extraction.
    - **Domain Control**: Option to restrict crawling to the original domain.
    - **Regex Filters**: Include/Exclude URLs based on regex patterns.
- **Real-Time Visualization**: Live progress updates, depth tracking, and status logs via WebSockets.
- **High Performance**: Built on **Playwright** (Async) and **FastAPI** for concurrent processing.
- **Modern UI**: Polished React interface for easy configuration and data inspection.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19
- **Language**: TypeScript (Strongly typed)
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Custom properties, grid layouts)

### Backend
- **Framework**: FastAPI (Python 3.12)
- **Engine**: Playwright (Async Chromium automation)
- **Concurrency**: `asyncio` & `websockets`
- **Validation**: Pydantic v2

### Infrastructure
- **Containerization**: Docker & Docker Compose

## 🏃‍♂️ How to Run

### With Docker (Recommended)
This is the easiest way to get started.

1.  **Clone** the repository.
2.  Open a terminal in the project root.
3.  Run the following command:

    ```bash
    docker-compose up --build
    ```

4.  Open your browser at **[http://localhost:5173](http://localhost:5173)**.

### Local Setup (No Docker)
If you prefer running it locally or don't have Docker installed.

#### Backend
1. Navigate to the `backend` directory.
2. Create and activate a Virtual Environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   playwright install
   ```
4. Start the server:
   ```bash
   uvicorn main:app --reload
   ```
   *Server will run on http://localhost:8000*

#### Frontend
1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open your browser at **[http://localhost:5173](http://localhost:5173)**.

### CI/CD (GitHub Actions)
This project includes a **GitHub Actions** workflow that automatically builds and creates Docker images for both the frontend and backend whenever you push to `master` or `main`.

- **Registry**: GitHub Container Registry (`ghcr.io`)
- **Images**:
    - `ghcr.io/sebastianreinig/webcrawler_playground/backend:latest`
    - `ghcr.io/sebastianreinig/webcrawler_playground/frontend:latest`

## ⚖️ License & Legal

### MIT License
This project is open source and available under the **MIT License**.

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the conditions of the license.

### Third-Party Licenses
This project uses several open-source libraries. Please review their licenses if you plan to distribute heavily modified versions:
- **FastAPI**: MIT
- **Playwright**: Apache 2.0
- **React**: MIT
- **Vite**: MIT

### ⚠️ Disclaimer
**Use Responsibly**. This tool is intended for testing, educational purposes, and scraping sites you own or have permission to access.
- Respect `robots.txt` files.
- Do not overwhelm servers with excessive requests (use the `Timeout` and `Max Pages` features).
- The authors are not responsible for any misuse of this tool.
- The code is vibecoded.

## 📦 Export
Once crawling is complete, export your dataset including all metadata and content for external analysis.
