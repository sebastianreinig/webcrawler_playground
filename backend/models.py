from pydantic import BaseModel
from typing import Optional

class CrawlerConfig(BaseModel):
    url: str
    max_depth: int = 2
    max_pages: int = 10
    match_pattern: str = "a"  # CSS selector for links
    content_css: str = "body" # CSS selector for content extraction
    same_domain: bool = True
    timeout: int = 30000 # Timeout in milliseconds
    url_regex: Optional[str] = None # Regex to match URLs to follow
    exclude_regex: Optional[str] = None # Regex to exclude URLs
