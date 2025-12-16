import { useState } from 'react';
import { crawlStream, type Article } from './api';
import './App.css';

function App() {
  const [url, setUrl] = useState("https://example.com");

  // Advanced Settings
  const [advancedMode, setAdvancedMode] = useState(false);
  const [maxDepth, setMaxDepth] = useState(2);
  const [maxPages, setMaxPages] = useState(10);
  const [matchPattern, setMatchPattern] = useState("a");
  const [contentCss, setContentCss] = useState("body"); // Default to body/text extraction
  const [timeout, setTimeoutVal] = useState(30000);
  const [urlRegex, setUrlRegex] = useState("");
  const [excludeRegex, setExcludeRegex] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [sameDomain, setSameDomain] = useState(true);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<{ current: number, total: number } | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleCrawl = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setArticles([]);
    setLogs([]);
    setStatus("Connecting...");
    setProgress(null);
    addLog(`Starting crawl for ${url}`);

    const config = {
      url,
      max_depth: advancedMode ? maxDepth : 1, // Simple mode implies depth 1 (or 2 if we consider base + links)
      max_pages: advancedMode ? maxPages : 5,
      match_pattern: advancedMode ? matchPattern : "a",
      content_css: advancedMode ? contentCss : "body",
      same_domain: advancedMode ? sameDomain : true,
      timeout: advancedMode ? timeout : 30000,
      url_regex: advancedMode && urlRegex ? urlRegex : undefined,
      exclude_regex: advancedMode && excludeRegex ? excludeRegex : undefined,
    };

    // If simple mode, maybe depth 1 means just the page? Or depth 2?
    // Let's say simple mode = just crawl the page (Depth 0/1) or following "standard" logic?
    // The previous logic scraped a list. Now we are generic.
    // If strict simple mode, maybe logic is: Visit URL, get content. Done.
    // But user liked the list scraping.
    // Let's stick to "Simple" = defaults (Depth 2, 10 pages) as set in state init or explicit defaults.

    // Actually, let's just use the state values but hide inputs. 
    // Defaults: Depth 2, Pages 10.

    try {
      const result = await crawlStream(config, (msg) => {
        if (msg.type === 'status') {
          setStatus(msg.message);
          addLog(`Status: ${msg.message}`);
        } else if (msg.type === 'found') {
          setStatus(msg.message);
          setProgress({ current: 0, total: msg.count });
          addLog(`Found ${msg.count} initial links.`);
        } else if (msg.type === 'progress') {
          setProgress({ current: msg.current, total: msg.total });
          setStatus(`Scraping: ${msg.last_scraped}`);
        } else if (msg.type === 'error') {
          addLog(`Error received: ${msg.message}`);
        }
      });

      console.log("Crawl result:", result);
      setArticles(result.data || []);
      setStatus("Completed!");
      addLog(`Crawl completed. Found ${result.data?.length || 0} articles.`);
      setProgress(null);

    } catch (err: any) {
      const errorMsg = err.message || String(err);
      setError(errorMsg);
      setStatus("Failed");
      addLog(`Critical Error: ${errorMsg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (articles.length === 0) return;

    let content = `version: 1\n`;
    content += `title: Crawl Export - ${new Date().toISOString().split('T')[0]}\n`;
    content += `url: ${url}\n`;
    content += `config: Depth=${maxDepth}, Pages=${maxPages}, Timeout=${timeout}\n\n`;

    articles.forEach(article => {
      content += `Title: ${article.title || 'No Title'}\n`;
      content += `URL: ${article.url}\n`;
      content += `------------------------\n`;
      content += `${article.content}\n`;
      content += `========================\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `crawl_export_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      <header>
        <div className="header-top">
          <h1>Webcrawler Playground</h1>
          <span className="badge">v1.0</span>
        </div>
        <p className="subtitle">Advanced Recursive Web Spider</p>
      </header>

      <main>
        {/* Configuration Panel */}
        <section className="config-panel">
          <div className="config-header">
            <h2>Configuration</h2>
            <div className="toggle-wrapper">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={advancedMode}
                  onChange={(e) => setAdvancedMode(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span className="toggle-label">Advanced Mode</span>
            </div>
          </div>

          <div className="config-controls">
            <div className="input-group full-width">
              <label htmlFor="url-input">Target URL</label>
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="url-input"
                placeholder="https://example.com"
              />
            </div>

            {advancedMode && (
              <div className="advanced-settings-grid">
                <div className="input-group">
                  <label>Max Depth (Recursion)</label>
                  <input
                    type="number"
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                    min="1"
                    max="5"
                  />
                  <div className="help-text">How many links deep to follow.</div>
                </div>
                <div className="input-group">
                  <label>Max Pages</label>
                  <input
                    type="number"
                    value={maxPages}
                    onChange={(e) => setMaxPages(parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                  <div className="help-text">Hard limit on total pages scraped.</div>
                </div>
                <div className="input-group">
                  <label>Link Selector (CSS)</label>
                  <input
                    type="text"
                    value={matchPattern}
                    onChange={(e) => setMatchPattern(e.target.value)}
                    placeholder="a"
                  />
                  <div className="help-text">Selector for links to follow.</div>
                </div>
                <div className="input-group">
                  <label>Content Selector (CSS)</label>
                  <input
                    type="text"
                    value={contentCss}
                    onChange={(e) => setContentCss(e.target.value)}
                    placeholder="body"
                  />
                  <div className="help-text">Selector for text content.</div>
                </div>
                <div className="input-group">
                  <label>Timeout (ms)</label>
                  <input
                    type="number"
                    value={timeout}
                    onChange={(e) => setTimeoutVal(parseInt(e.target.value))}
                    min="1000"
                    step="1000"
                  />
                  <div className="help-text">Page load timeout.</div>
                </div>
                <div className="input-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={sameDomain}
                      onChange={(e) => setSameDomain(e.target.checked)}
                    />
                    Stay on Domain
                  </label>
                </div>
                <div className="input-group">
                  <label>Include URL Pattern (Regex)</label>
                  <input
                    type="text"
                    value={urlRegex}
                    onChange={(e) => setUrlRegex(e.target.value)}
                    placeholder="e.g. /blog/.*"
                  />
                  <div className="help-text">Only follow URLs matching this regex.</div>
                </div>
                <div className="input-group">
                  <label>Exclude URL Pattern (Regex)</label>
                  <input
                    type="text"
                    value={excludeRegex}
                    onChange={(e) => setExcludeRegex(e.target.value)}
                    placeholder="e.g. .*(login|signup).*"
                  />
                  <div className="help-text">Skip URLs matching this regex.</div>
                </div>
              </div>
            )}

            <button
              onClick={handleCrawl}
              disabled={loading || !url}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Stop Crawling
                </>
              ) : (
                <>Start Crawl</>
              )}
            </button>

            {articles.length > 0 && !loading && (
              <button
                onClick={handleExport}
                className="btn-secondary"
              >
                Export Results
              </button>
            )}
          </div>

          {/* Progress Status */}
          {(loading || status) && (
            <div className="status-container">
              <div className="status-header">
                <span>{status}</span>
                {progress && <span>{Math.round((progress.current / progress.total) * 100)}% ({progress.current}/{progress.total})</span>}
              </div>
              {progress && (
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(progress.current / progress.total) * 100}%`
                    }}
                  ></div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="error-box">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Logs Area */}
          {(logs.length > 0 || error) && (
            <div className="logs-container">
              <div className="logs-header">Logs & Events</div>
              <div className="logs-content">
                {logs.map((log, i) => (
                  <div key={i} className="log-entry">{log}</div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Results Area */}
        <div className="main-grid">
          {/* List Column */}
          <aside className="article-list-container">
            <div className="list-header">
              <span>Pages Found</span>
              <span className="count-badge">{articles.length}</span>
            </div>

            <div className="list-content">
              {articles.length === 0 && !loading && (
                <div className="empty-state">
                  <span className="empty-icon">🕸️</span>
                  <p>Ready to crawl.</p>
                </div>
              )}
              {articles.map((article, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedArticle(article)}
                  className={`article-item ${selectedArticle === article ? 'selected' : ''}`}
                >
                  <h4>{article.title || 'Untitled'}</h4>
                  <span className="url-preview">{article.url}</span>
                  {article.links && <span className="meta-info">{article.links.length} links found</span>}
                </div>
              ))}
            </div>
          </aside>

          {/* Detail Column */}
          <article className="detail-container">
            {selectedArticle ? (
              <>
                <div className="detail-header">
                  <h2>{selectedArticle.title}</h2>
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noreferrer"
                    className="source-link"
                  >
                    Open Page ↗
                  </a>
                </div>
                <div className="detail-content">
                  {selectedArticle.error && (
                    <div className="error-box">
                      Error: {selectedArticle.error}
                    </div>
                  )}
                  {selectedArticle.content ? (
                    selectedArticle.content.split('\n').map((para, i) => (
                      para.trim() ? <p key={i}>{para}</p> : <br key={i} />
                    ))
                  ) : (
                    <p className="italic text-slate-400">No content extracted.</p>
                  )}

                  {selectedArticle.links && selectedArticle.links.length > 0 && (
                    <div className="links-section">
                      <h3>Links found on this page:</h3>
                      <ul>
                        {selectedArticle.links.slice(0, 10).map((l, i) => (
                          <li key={i}>{l}</li>
                        ))}
                        {selectedArticle.links.length > 10 && <li>...and {selectedArticle.links.length - 10} more</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📄</span>
                <p>Select a page to view details</p>
              </div>
            )}
          </article>
        </div>
      </main>

      <footer className="app-footer">
        <a
          href="https://github.com/sebastianreinig/webcrawler_playground"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          View on GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
