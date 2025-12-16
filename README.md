# Webcrawler Playground

A powerful, customizable, and containerized web spider designed for testing and data extraction.

## 🚀 Features

- **Recursive Crawling**: Spider engine capable of BFS/DFS traversal with configurable depth.
- **Advanced Configuration**:
    - **Max Depth**: Limit how many links deep the crawler goes.
    - **Max Pages**: Hard limit on total pages to scrape.
    - **Custom Selectors**: Define CSS selectors for specific link following and content extraction.
    - **Domain Control**: Option to restrict crawling to the original domain.
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

## 📦 Export
Once crawling is complete, export your dataset including all metadata and content for external analysis.
