import asyncio
from playwright.async_api import async_playwright, Route
from urllib.parse import urlparse, urljoin
from models import CrawlerConfig

CONCURRENT_LIMIT = 10 

async def block_resources(route: Route):
    if route.request.resource_type in ["image", "stylesheet", "font", "media", "script", "xhr", "fetch"]:
        await route.abort()
    else:
        await route.continue_()

def is_same_domain(base_url, target_url):
    base_domain = urlparse(base_url).netloc
    target_domain = urlparse(target_url).netloc
    return base_domain == target_domain

import re

async def scrape_page(context, url, config: CrawlerConfig, semaphore):
    async with semaphore:
        result = {"url": url, "links": [], "title": "", "content": ""}
        page = None
        try:
            page = await context.new_page()
            await page.route("**/*", block_resources)
            
            try:
                await page.goto(url, timeout=config.timeout, wait_until="domcontentloaded")
            except Exception as e:
                # If navigation fails, we return error but don't crash
                result["error"] = str(e)
                result["title"] = "Navigation Error"
                return result

            # Extract Title
            result["title"] = await page.title()

            # Extract Content
            # We try to get text from specific selector, otherwise fallback
            # We specifically look for paragraphs to make it readable, but scoped to the selector
            locator = page.locator(config.content_css).first
            if await locator.count() > 0:
                # Try to get paragraphs within this locator
                paragraphs = await locator.locator("p").all_inner_texts()
                if not paragraphs:
                    # If no p tags, just get text
                    result["content"] = await locator.inner_text()
                else: 
                     result["content"] = "\n\n".join([p.strip() for p in paragraphs if len(p.strip()) > 20])
            else:
                 # Fallback to body
                 try:
                    result["content"] = await page.inner_text("body")
                 except:
                    result["content"] = ""

            # Extract Links
            link_params = config.match_pattern
            if not link_params: 
                link_params = "a"
                
            elements = await page.locator(link_params).all()
            extracted_links = []
            
            # Compile regexes if provided
            url_regex = re.compile(config.url_regex) if config.url_regex else None
            exclude_regex = re.compile(config.exclude_regex) if config.exclude_regex else None

            for el in elements:
                # sometimes match_pattern might flag non-links, so check href
                href = await el.get_attribute("href")
                if href:
                    # Normalize
                    full_url = urljoin(url, href)
                    
                    # Filter same domain if required
                    if config.same_domain and not is_same_domain(config.url, full_url):
                        continue
                        
                    # Filter by URL Regex
                    if url_regex and not url_regex.search(full_url):
                        continue
                        
                    # Filter by Exclude Regex
                    if exclude_regex and exclude_regex.search(full_url):
                        continue

                    extracted_links.append(full_url)
            
            result["links"] = list(set(extracted_links))

        except Exception as e:
            print(f"Failed to scrape {url}: {e}")
            result["error"] = str(e)
            result["title"] = "Error"
        finally:
            if page:
                await page.close()
        
        return result

async def crawl(config: CrawlerConfig, progress_callback=None):
    results = []
    visited_urls = set()
    queue = asyncio.Queue()
    
    # Start with the seed
    queue.put_nowait((config.url, 0)) # (url, depth)
    visited_urls.add(config.url)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(java_script_enabled=False) # Disable JS for speed
        semaphore = asyncio.Semaphore(CONCURRENT_LIMIT)
        
        pages_scraped_count = 0
        
        while not queue.empty() and pages_scraped_count < config.max_pages:
            # We can process a batch of URLs from the queue concurrently
            # But simpler approach for "true" recursion simulation is to just pop and process
            # To go fast, we should probably spawn workers. 
            # However, for simplicity and "Playground" control, we can do a loop that fills tasks
            
            # Let's simple-batch: pop up to X items or whatever is available
            batch = []
            while not queue.empty() and len(batch) < CONCURRENT_LIMIT and (pages_scraped_count + len(batch)) < config.max_pages:
                url, depth = await queue.get()
                batch.append((url, depth))
            
            if not batch:
                break
                
            tasks = []
            for url, depth in batch:
                tasks.append(scrape_page(context, url, config, semaphore))
            
            if progress_callback:
                await progress_callback({
                    "type": "status", 
                    "message": f"Crawling batch of {len(tasks)} (Depth {batch[0][1]})..."
                })

            batch_results = await asyncio.gather(*tasks)
            
            for i, res in enumerate(batch_results):
                current_url, current_depth = batch[i]
                pages_scraped_count += 1
                
                results.append(res)
                
                if progress_callback:
                     await progress_callback({
                        "type": "progress", 
                        "current": pages_scraped_count, 
                        "total": config.max_pages, # This is a limit, not total found
                        "last_scraped": res.get("title", "Unknown")
                    })
                
                # Add new links to queue if depth allows
                if current_depth < config.max_depth:
                    links = res.get("links", [])
                    for link in links:
                        # strip fragments for visited check usually good idea
                        clean_link = link.split("#")[0]
                        if clean_link not in visited_urls:
                            visited_urls.add(clean_link)
                            queue.put_nowait((clean_link, current_depth + 1))
            
        await browser.close()
        
    return results
