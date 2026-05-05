import arxiv
from typing import Dict, List, Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor


class ArxivService:
    """Service for searching and retrieving papers from arXiv."""

    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=3)

    async def search(
        self,
        query: str,
        max_results: int = 20,
        sort_by: str = "relevance",
    ) -> List[Dict]:
        """Search arXiv for papers."""
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            self.executor, self._search_sync, query, max_results, sort_by
        )
        return results

    def _search_sync(self, query: str, max_results: int, sort_by: str) -> List[Dict]:
        """Synchronous arXiv search (arxiv library is sync)."""
        sort_criterion = {
            "relevance": arxiv.SortCriterion.Relevance,
            "date": arxiv.SortCriterion.SubmittedDate,
        }.get(sort_by, arxiv.SortCriterion.Relevance)

        search = arxiv.Search(
            query=query,
            max_results=max_results,
            sort_by=sort_criterion,
        )

        papers = []
        for result in search.results():
            papers.append(self._normalize_result(result))

        return papers

    async def get_paper(self, arxiv_id: str) -> Optional[Dict]:
        """Get a specific paper by arXiv ID."""
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            self.executor, self._get_paper_sync, arxiv_id
        )
        return result

    def _get_paper_sync(self, arxiv_id: str) -> Optional[Dict]:
        """Synchronous paper fetch."""
        search = arxiv.Search(id_list=[arxiv_id])
        results = list(search.results())
        if results:
            return self._normalize_result(results[0])
        return None

    def _normalize_result(self, result) -> Dict:
        """Normalize arXiv result to internal format."""
        return {
            "id": result.entry_id.split("/")[-1],
            "title": result.title,
            "abstract": result.summary,
            "authors": [a.name for a in result.authors],
            "year": result.published.year if result.published else None,
            "venue": "arXiv",
            "citation_count": 0,  # arXiv doesn't provide this
            "reference_count": 0,
            "doi": result.doi,
            "url": result.entry_id,
            "pdf_url": result.pdf_url,
            "fields_of_study": [c.split(".")[-1] for c in result.categories],
            "tldr": result.summary[:200] + "..." if len(result.summary) > 200 else result.summary,
            "source": "arxiv",
        }
