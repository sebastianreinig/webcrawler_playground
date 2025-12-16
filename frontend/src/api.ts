const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace('http', 'ws');

export interface Article {
    url: string;
    title: string;
    content: string;
    links?: string[];
    error?: string;
}

export interface CrawlerConfig {
    url: string;
    max_depth: number;
    max_pages: number;
    match_pattern: string;
    content_css: string;
    same_domain: boolean;
    timeout: number;
    url_regex?: string;
    exclude_regex?: string;
}

export type ProgressCallback = (data: any) => void;

export const crawlStream = (config: CrawlerConfig, onProgress: ProgressCallback): Promise<{ data: Article[] }> => {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`${WS_URL}/ws/crawl`);

        ws.onopen = () => {
            ws.send(JSON.stringify(config));
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'complete') {
                    resolve({ data: msg.data });
                } else if (msg.type === 'error') {
                    onProgress(msg);
                    reject(new Error(msg.message));
                } else {
                    onProgress(msg);
                }
            } catch (err) {
                console.error("WS Parse Error", err);
            }
        };

        ws.onerror = () => {
            reject(new Error("WebSocket Connection Failed"));
        };

        ws.onclose = () => {
            // Handle close
        };
    });
};
