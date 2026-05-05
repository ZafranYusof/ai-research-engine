import httpx
from typing import Dict, List, Optional, Tuple
from app.core.config import settings
import asyncio


class SemanticScholarService:
    """Service for interacting with Semantic Scholar API."""

    BASE_URL = "https://api.semanticscholar.org/graph/v1"
    RATE_LIMIT_DELAY = 3.0  # seconds between requests (100 req/5min)

    def __init__(self):
        self.headers = {}
        if settings.SEMANTIC_SCHOLAR_API_KEY:
            self.headers["x-api-key"] = settings.SEMANTIC_SCHOLAR_API_KEY

    async def search(
        self,
        query: str,
        limit: int = 20,
        year_range: Optional[Tuple[int, int]] = None,
        fields_of_study: Optional[List[str]] = None,
    ) -> List[Dict]:
        """Search for papers on Semantic Scholar."""
        params = {
            "query": query,
            "limit": min(limit, 100),
            "fields": "title,abstract,authors,year,venue,citationCount,referenceCount,doi,url,fieldsOfStudy,tldr",
        }

        if year_range:
            params["year"] = f"{year_range[0]}-{year_range[1]}"

        if fields_of_study:
            params["fieldsOfStudy"] = ",".join(fields_of_study)

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/paper/search",
                params=params,
                headers=self.headers,
                timeout=30.0,
            )

            if response.status_code == 429:
                await asyncio.sleep(self.RATE_LIMIT_DELAY * 2)
                response = await client.get(
                    f"{self.BASE_URL}/paper/search",
                    params=params,
                    headers=self.headers,
                    timeout=30.0,
                )

            if response.status_code != 200:
                return []

            data = response.json()
            papers = data.get("data", [])

            return [self._normalize_paper(p) for p in papers]

    async def get_paper(self, paper_id: str) -> Optional[Dict]:
        """Get detailed paper info by ID (DOI, arxiv ID, or S2 ID)."""
        fields = "title,abstract,authors,year,venue,citationCount,referenceCount,doi,url,references,citations,fieldsOfStudy,tldr"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/paper/{paper_id}",
                params={"fields": fields},
                headers=self.headers,
                timeout=30.0,
            )

            if response.status_code != 200:
                return None

            return self._normalize_paper(response.json())

    async def get_citations(self, paper_id: str, limit: int = 50) -> List[Dict]:
        """Get papers that cite this paper."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/paper/{paper_id}/citations",
                params={"fields": "title,authors,year,citationCount", "limit": limit},
                headers=self.headers,
                timeout=30.0,
            )

            if response.status_code != 200:
                return []

            data = response.json()
            return [self._normalize_paper(c["citingPaper"]) for c in data.get("data", [])]

    def _normalize_paper(self, raw: Dict) -> Dict:
        """Normalize paper data to internal format."""
        authors = raw.get("authors", [])
        return {
            "id": raw.get("paperId", ""),
            "title": raw.get("title", ""),
            "abstract": raw.get("abstract", ""),
            "authors": [a.get("name", "") for a in authors] if isinstance(authors, list) else [],
            "year": raw.get("year"),
            "venue": raw.get("venue", ""),
            "citation_count": raw.get("citationCount", 0),
            "reference_count": raw.get("referenceCount", 0),
            "doi": raw.get("doi"),
            "url": raw.get("url", ""),
            "fields_of_study": raw.get("fieldsOfStudy", []),
            "tldr": raw.get("tldr", {}).get("text", "") if raw.get("tldr") else "",
            "source": "semantic_scholar",
        }
