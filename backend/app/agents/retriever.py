from typing import Any, Dict, List
from app.agents.base import BaseAgent
from app.services.semantic_scholar import SemanticScholarService
from app.services.arxiv_service import ArxivService
import json


class RetrieverAgent(BaseAgent):
    """Agent responsible for finding relevant papers from multiple sources."""

    def __init__(self):
        super().__init__(name="Retriever", model="gpt-4-turbo-preview")
        self.scholar = SemanticScholarService()
        self.arxiv = ArxivService()

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Find relevant papers based on research topic.
        
        Input: {topic, keywords, max_papers, year_range, fields}
        Output: {papers: [...], search_queries_used: [...]}
        """
        topic = input_data["topic"]
        max_papers = input_data.get("max_papers", 50)
        year_range = input_data.get("year_range", (2019, 2026))

        # Step 1: Generate search queries from topic
        queries = await self._generate_search_queries(topic)

        # Step 2: Search multiple sources
        all_papers = []
        for query in queries:
            scholar_results = await self.scholar.search(
                query=query,
                limit=max_papers // len(queries),
                year_range=year_range,
            )
            arxiv_results = await self.arxiv.search(
                query=query,
                max_results=max_papers // len(queries),
            )
            all_papers.extend(scholar_results)
            all_papers.extend(arxiv_results)

        # Step 3: Deduplicate
        papers = self._deduplicate(all_papers)

        # Step 4: Rank by relevance
        ranked = await self._rank_papers(papers, topic)

        return {
            "papers": ranked[:max_papers],
            "search_queries_used": queries,
            "total_found": len(all_papers),
            "after_dedup": len(papers),
        }

    async def _generate_search_queries(self, topic: str) -> List[str]:
        """Use LLM to generate diverse search queries for the topic."""
        prompt = f"""Given this research topic, generate 5 diverse search queries 
        that would find relevant academic papers. Include synonyms, related concepts, 
        and different angles.
        
        Topic: {topic}
        
        Return as JSON array of strings."""

        result = await self._call_llm(
            system_prompt="You are a research librarian expert at finding academic papers.",
            user_prompt=prompt,
        )
        return json.loads(result)

    async def _rank_papers(self, papers: List[Dict], topic: str) -> List[Dict]:
        """Rank papers by relevance to the research topic."""
        # TODO: Use embeddings for semantic similarity ranking
        # For now, sort by citation count as proxy
        return sorted(papers, key=lambda p: p.get("citation_count", 0), reverse=True)

    def _deduplicate(self, papers: List[Dict]) -> List[Dict]:
        """Remove duplicate papers based on DOI/title similarity."""
        seen = set()
        unique = []
        for paper in papers:
            key = paper.get("doi") or paper.get("title", "").lower().strip()
            if key not in seen:
                seen.add(key)
                unique.append(paper)
        return unique
