from typing import Any, Dict, List
from app.agents.base import BaseAgent
from app.services.semantic_scholar import SemanticScholarService
from app.services.arxiv_service import ArxivService
import json


class RetrieverAgent(BaseAgent):
    """Agent responsible for finding relevant papers from multiple sources."""

    def __init__(self):
        super().__init__(name="Retriever")
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

        # Step 1: Generate search queries from topic using Groq
        queries = await self._generate_search_queries(topic)

        # Step 2: Search multiple sources
        all_papers = []
        for query in queries[:5]:  # Limit to 5 queries to avoid rate limits
            try:
                scholar_results = await self.scholar.search(
                    query=query,
                    limit=max_papers // len(queries),
                    year_range=year_range,
                )
                all_papers.extend(scholar_results)
            except Exception:
                pass

            try:
                arxiv_results = await self.arxiv.search(
                    query=query,
                    max_results=max_papers // len(queries),
                )
                all_papers.extend(arxiv_results)
            except Exception:
                pass

        # Step 3: Deduplicate
        papers = self._deduplicate(all_papers)

        # Step 4: Rank by relevance using Groq
        ranked = await self._rank_papers(papers, topic)

        return {
            "papers": ranked[:max_papers],
            "search_queries_used": queries,
            "total_found": len(all_papers),
            "after_dedup": len(papers),
        }

    async def _generate_search_queries(self, topic: str) -> List[str]:
        """Use Groq LLM to generate diverse search queries for the topic."""
        prompt = f"""Given this research topic, generate 5 diverse search queries 
        that would find relevant academic papers. Include synonyms, related concepts, 
        and different angles.
        
        Topic: {topic}
        
        Return ONLY a JSON array of strings, no other text. Example:
        ["query 1", "query 2", "query 3", "query 4", "query 5"]"""

        result = await self._call_llm(
            system_prompt="You are a research librarian expert at finding academic papers. Return only valid JSON.",
            user_prompt=prompt,
        )
        
        try:
            # Try to parse JSON from response
            result = result.strip()
            if result.startswith("```"):
                result = result.split("\n", 1)[1].rsplit("```", 1)[0]
            return json.loads(result)
        except json.JSONDecodeError:
            # Fallback: use topic as single query
            return [topic]

    async def _rank_papers(self, papers: List[Dict], topic: str) -> List[Dict]:
        """Rank papers by relevance to the research topic."""
        if not papers:
            return []
            
        # Use citation count + year as ranking heuristic
        # (Groq ranking would be too expensive for large lists)
        import datetime
        current_year = datetime.datetime.now().year
        
        for paper in papers:
            citations = paper.get("citation_count", 0)
            year = paper.get("year", 2020) or 2020
            recency_bonus = max(0, (year - 2015)) * 2
            paper["_relevance_score"] = citations + recency_bonus
        
        ranked = sorted(papers, key=lambda p: p.get("_relevance_score", 0), reverse=True)
        
        # Clean up temp field
        for paper in ranked:
            paper.pop("_relevance_score", None)
            
        return ranked

    def _deduplicate(self, papers: List[Dict]) -> List[Dict]:
        """Remove duplicate papers based on DOI/title similarity."""
        seen = set()
        unique = []
        for paper in papers:
            key = paper.get("doi") or paper.get("title", "").lower().strip()[:100]
            if key and key not in seen:
                seen.add(key)
                unique.append(paper)
        return unique
