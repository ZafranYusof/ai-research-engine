"""
Google Scholar Service
Scrapes Google Scholar search results using SerpAPI or direct scraping fallback.
Since Google Scholar has no official API, we use scholarly-style scraping with httpx.
"""

import httpx
import re
import asyncio
import urllib.parse
from typing import Dict, List, Optional, Tuple
from app.core.config import settings


class GoogleScholarService:
    """Service for searching Google Scholar papers."""

    SERPAPI_URL = "https://serpapi.com/search"
    SCHOLAR_URL = "https://scholar.google.com/scholar"

    # User agent to avoid blocks
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    def __init__(self):
        self.serpapi_key = getattr(settings, "SERPAPI_KEY", "") or ""
        self.use_serpapi = bool(self.serpapi_key)

    async def search(
        self,
        query: str,
        max_results: int = 20,
        year_from: Optional[int] = None,
        year_to: Optional[int] = None,
    ) -> List[Dict]:
        """Search Google Scholar for papers."""
        if self.use_serpapi:
            return await self._search_serpapi(query, max_results, year_from, year_to)
        else:
            return await self._search_scrape(query, max_results, year_from, year_to)

    async def _search_serpapi(
        self,
        query: str,
        max_results: int,
        year_from: Optional[int],
        year_to: Optional[int],
    ) -> List[Dict]:
        """Search using SerpAPI (reliable, paid)."""
        papers = []
        num_pages = min((max_results + 9) // 10, 5)  # Max 5 pages

        async with httpx.AsyncClient(timeout=30.0) as client:
            for page in range(num_pages):
                params = {
                    "engine": "google_scholar",
                    "q": query,
                    "api_key": self.serpapi_key,
                    "start": page * 10,
                    "num": 10,
                    "hl": "en",
                }

                if year_from:
                    params["as_ylo"] = year_from
                if year_to:
                    params["as_yhi"] = year_to

                try:
                    response = await client.get(self.SERPAPI_URL, params=params)
                    if response.status_code != 200:
                        break

                    data = response.json()
                    results = data.get("organic_results", [])

                    if not results:
                        break

                    for result in results:
                        paper = self._normalize_serpapi_result(result)
                        if paper:
                            papers.append(paper)

                    if len(papers) >= max_results:
                        break

                    # Rate limit
                    await asyncio.sleep(0.5)

                except Exception as e:
                    print(f"[GoogleScholar] SerpAPI error: {e}")
                    break

        return papers[:max_results]

    async def _search_scrape(
        self,
        query: str,
        max_results: int,
        year_from: Optional[int],
        year_to: Optional[int],
    ) -> List[Dict]:
        """Search by scraping Google Scholar directly (free, less reliable)."""
        papers = []
        num_pages = min((max_results + 9) // 10, 3)  # Max 3 pages to avoid blocks

        async with httpx.AsyncClient(timeout=30.0, headers=self.HEADERS, follow_redirects=True) as client:
            for page in range(num_pages):
                params = {
                    "q": query,
                    "start": page * 10,
                    "hl": "en",
                }

                if year_from:
                    params["as_ylo"] = str(year_from)
                if year_to:
                    params["as_yhi"] = str(year_to)

                try:
                    response = await client.get(self.SCHOLAR_URL, params=params)

                    if response.status_code == 429:
                        print("[GoogleScholar] Rate limited, stopping")
                        break

                    if response.status_code != 200:
                        break

                    html = response.text
                    page_papers = self._parse_scholar_html(html)

                    if not page_papers:
                        break

                    papers.extend(page_papers)

                    if len(papers) >= max_results:
                        break

                    # Longer delay for scraping to avoid blocks
                    await asyncio.sleep(2 + page)

                except Exception as e:
                    print(f"[GoogleScholar] Scrape error: {e}")
                    break

        return papers[:max_results]

    def _parse_scholar_html(self, html: str) -> List[Dict]:
        """Parse Google Scholar HTML results."""
        papers = []

        # Find result blocks (gs_r gs_or gs_scl divs)
        # Each result is in a div with class "gs_r gs_or gs_scl"
        result_blocks = re.findall(
            r'<div class="gs_r gs_or gs_scl"[^>]*>(.*?)</div>\s*</div>\s*</div>',
            html,
            re.DOTALL,
        )

        # Fallback: try simpler pattern
        if not result_blocks:
            result_blocks = re.findall(
                r'<div[^>]*class="gs_ri"[^>]*>(.*?)</div>\s*<div class="gs_fl',
                html,
                re.DOTALL,
            )

        for block in result_blocks:
            paper = self._parse_result_block(block)
            if paper:
                papers.append(paper)

        return papers

    def _parse_result_block(self, block: str) -> Optional[Dict]:
        """Parse a single result block from Google Scholar HTML."""
        # Title
        title_match = re.search(r'<h3[^>]*class="gs_rt"[^>]*>.*?<a[^>]*>(.*?)</a>', block, re.DOTALL)
        if not title_match:
            title_match = re.search(r'<h3[^>]*class="gs_rt"[^>]*>(.*?)</h3>', block, re.DOTALL)

        if not title_match:
            return None

        title = re.sub(r"<[^>]+>", "", title_match.group(1)).strip()
        if not title:
            return None

        # URL
        url = ""
        url_match = re.search(r'<h3[^>]*class="gs_rt"[^>]*>.*?<a href="([^"]+)"', block, re.DOTALL)
        if url_match:
            url = url_match.group(1)

        # Authors, venue, year line
        authors = []
        year = None
        venue = ""

        meta_match = re.search(r'<div class="gs_a">(.*?)</div>', block, re.DOTALL)
        if meta_match:
            meta_text = re.sub(r"<[^>]+>", "", meta_match.group(1)).strip()
            # Format: "Author1, Author2 - Venue, Year - Publisher"
            parts = meta_text.split(" - ")
            if parts:
                # Authors
                author_text = parts[0].strip()
                authors = [a.strip() for a in author_text.split(",") if a.strip() and not a.strip().isdigit()]
                authors = [a for a in authors if len(a) > 1 and not a.startswith("…")]

            if len(parts) >= 2:
                venue_year = parts[1].strip()
                # Extract year
                year_match = re.search(r"\b(19|20)\d{2}\b", venue_year)
                if year_match:
                    year = int(year_match.group(0))
                # Venue is everything before the year
                venue = re.sub(r",?\s*(19|20)\d{2}\b.*", "", venue_year).strip()

        # Snippet/abstract
        snippet = ""
        snippet_match = re.search(r'<div class="gs_rs">(.*?)</div>', block, re.DOTALL)
        if snippet_match:
            snippet = re.sub(r"<[^>]+>", "", snippet_match.group(1)).strip()

        # Citation count
        citation_count = 0
        cite_match = re.search(r"Cited by (\d+)", block)
        if cite_match:
            citation_count = int(cite_match.group(1))

        return {
            "id": f"gs_{hash(title) % 10**8}",
            "title": title,
            "abstract": snippet,
            "authors": authors[:10],
            "year": year,
            "venue": venue,
            "citation_count": citation_count,
            "reference_count": 0,
            "doi": None,
            "url": url,
            "fields_of_study": [],
            "tldr": snippet[:200] if snippet else "",
            "source": "google_scholar",
        }

    def _normalize_serpapi_result(self, result: Dict) -> Optional[Dict]:
        """Normalize a SerpAPI Google Scholar result."""
        title = result.get("title", "")
        if not title:
            return None

        # Parse publication info
        pub_info = result.get("publication_info", {})
        summary = pub_info.get("summary", "")

        # Extract authors from summary
        authors = []
        if pub_info.get("authors"):
            authors = [a.get("name", "") for a in pub_info["authors"]]
        elif summary:
            # "A Smith, B Jones - Journal, 2020"
            parts = summary.split(" - ")
            if parts:
                authors = [a.strip() for a in parts[0].split(",") if a.strip() and not a.strip().isdigit()]

        # Year
        year = None
        year_match = re.search(r"\b(19|20)\d{2}\b", summary)
        if year_match:
            year = int(year_match.group(0))

        # Venue
        venue = ""
        parts = summary.split(" - ")
        if len(parts) >= 2:
            venue = re.sub(r",?\s*(19|20)\d{2}\b.*", "", parts[1]).strip()

        # Citation count
        citation_count = 0
        cited_by = result.get("inline_links", {}).get("cited_by", {})
        if cited_by:
            citation_count = cited_by.get("total", 0)

        return {
            "id": f"gs_{result.get('position', 0)}_{hash(title) % 10**8}",
            "title": title,
            "abstract": result.get("snippet", ""),
            "authors": authors[:10],
            "year": year,
            "venue": venue,
            "citation_count": citation_count,
            "reference_count": 0,
            "doi": None,
            "url": result.get("link", ""),
            "fields_of_study": [],
            "tldr": result.get("snippet", "")[:200],
            "source": "google_scholar",
        }
