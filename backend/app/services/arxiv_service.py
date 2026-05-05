import arxiv
from typing import Dict, List, Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor


class ArxivService:
    """Service for searching and retrieving papers from arXiv."""

    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=2)

    async def search(
        self,
        query: str,
        max_results: int = 20,
        sort_by: str = "relevance",
    ) -> List[Dict]:
        """Search arXiv for papers."""
        loop = asyncio.get_event_loop()
        try:
            results = await asyncio.wait_for(
                loop.run_in_executor(
                    self.executor, self._search_sync, query, max_results, sort_by
                ),
                timeout=30.0,  # 30 second timeout
            )
            return results
        except (asyncio.TimeoutError, Exception) as e:
            print(f"arXiv search timeout/error: {e}")
            return []

    def _search_sync(self, query: str, max_results: int, sort_by: str) -> List[Dict]:
        """Synchronous arXiv search."""
        try:
            sort_criterion = {
                "relevance": arxiv.SortCriterion.Relevance,
                "date": arxiv.SortCriterion.SubmittedDate,
            }.get(sort_by, arxiv.SortCriterion.Relevance)

            client = arxiv.Client(
                page_size=max_results,
                delay_seconds=1.0,
                num_retries=2,
            )

            search = arxiv.Search(
                query=query,
                max_results=max_results,
                sort_by=sort_criterion,
            )

            papers = []
            for result in client.results(search):
                papers.append(self._normalize_result(result))
                if len(papers) >= max_results:
                    break

            return papers
        except Exception as e:
            print(f"arXiv sync error: {e}")
            return []

    async def get_paper(self, arxiv_id: str) -> Optional[Dict]:
        """Get a specific paper by arXiv ID."""
        loop = asyncio.get_event_loop()
        try:
            result = await asyncio.wait_for(
                loop.run_in_executor(self.executor, self._get_paper_sync, arxiv_id),
                timeout=15.0,
            )
            return result
        except (asyncio.TimeoutError, Exception):
            return None

    def _get_paper_sync(self, arxiv_id: str) -> Optional[Dict]:
        """Synchronous paper fetch."""
        try:
            client = arxiv.Client()
            search = arxiv.Search(id_list=[arxiv_id])
            results = list(client.results(search))
            if results:
                return self._normalize_result(results[0])
        except Exception:
            pass
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
            "citation_count": 0,
            "reference_count": 0,
            "doi": result.doi,
            "url": result.entry_id,
            "pdf_url": result.pdf_url,
            "fields_of_study": [c.split(".")[-1] for c in result.categories],
            "tldr": result.summary[:200] + "..." if len(result.summary) > 200 else result.summary,
            "source": "arxiv",
        }
