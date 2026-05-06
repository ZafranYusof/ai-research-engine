import json
import asyncio
from typing import Dict, List, Optional
from app.db.mongodb import mongodb
from app.services.semantic_scholar import SemanticScholarService
from app.services.arxiv_service import ArxivService
from app.core.config import settings
import openai


class RecommendationService:
    """Service for generating smart paper recommendations based on research gaps."""

    def __init__(self):
        self.s2 = SemanticScholarService()
        self.arxiv = ArxivService()
        self.client = openai.AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url=settings.GROQ_BASE_URL,
        )
        self.model = settings.GROQ_MODEL

    async def _call_llm(self, system_prompt: str, user_prompt: str, temperature: float = 0.3) -> str:
        """Call Groq LLM with retry logic."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=temperature,
                    max_tokens=4096,
                )
                return response.choices[0].message.content
            except openai.RateLimitError:
                wait_time = (attempt + 1) * 5
                await asyncio.sleep(wait_time)
                if attempt == max_retries - 1:
                    raise
            except Exception:
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(2)

    async def get_recommendations(self, project_id: str) -> List[Dict]:
        """Get personalized paper recommendations for a project based on gaps and themes."""
        # Load project from MongoDB
        project = await mongodb.projects.find_one({"id": project_id}, {"_id": 0})
        if not project:
            return []

        topic = project.get("topic", "")
        results = project.get("results", {})
        themes = results.get("themes", [])
        gaps = results.get("gaps", [])
        existing_papers = results.get("papers", [])

        # Get existing paper titles for deduplication
        existing_titles = set()
        for p in existing_papers:
            if isinstance(p, dict):
                existing_titles.add(p.get("title", "").lower().strip())
            elif isinstance(p, str):
                existing_titles.add(p.lower().strip())

        # Generate targeted search queries using LLM
        queries = await self._generate_search_queries(topic, themes, gaps)

        # Search both sources with generated queries
        all_candidates = []
        for query in queries[:5]:
            # Rate limit between searches
            s2_results, arxiv_results = await asyncio.gather(
                self.s2.search(query, limit=10),
                self.arxiv.search(query, max_results=10),
                return_exceptions=True,
            )

            if isinstance(s2_results, list):
                all_candidates.extend(s2_results)
            if isinstance(arxiv_results, list):
                all_candidates.extend(arxiv_results)

            await asyncio.sleep(1)  # Rate limit between batches

        # Filter out papers already in the project
        filtered = []
        seen_titles = set()
        for paper in all_candidates:
            title_lower = paper.get("title", "").lower().strip()
            if title_lower and title_lower not in existing_titles and title_lower not in seen_titles:
                seen_titles.add(title_lower)
                filtered.append(paper)

        if not filtered:
            return []

        # Score relevance using LLM (batch to avoid too many calls)
        scored_papers = await self._score_papers(filtered[:30], topic, gaps, themes)

        # Sort by relevance score and return top 15
        scored_papers.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
        return scored_papers[:15]

    async def _generate_search_queries(self, topic: str, themes: List, gaps: List) -> List[str]:
        """Use LLM to generate targeted search queries based on gaps and themes."""
        themes_text = "\n".join([f"- {t}" if isinstance(t, str) else f"- {t.get('name', t)}" for t in themes[:10]])
        gaps_text = "\n".join([f"- {g}" if isinstance(g, str) else f"- {g.get('description', g)}" for g in gaps[:10]])

        system_prompt = "You are a research assistant. Generate search queries to find papers that fill research gaps."
        user_prompt = f"""Given this research project:
Topic: {topic}

Key Themes:
{themes_text}

Identified Gaps:
{gaps_text}

Generate exactly 5 targeted academic search queries that would find papers addressing these gaps.
Each query should be specific and likely to return relevant results on Semantic Scholar or arXiv.

Return ONLY a JSON array of 5 strings, no other text.
Example: ["query 1", "query 2", "query 3", "query 4", "query 5"]"""

        try:
            result = await self._call_llm(system_prompt, user_prompt)
            # Parse JSON from response
            result = result.strip()
            if result.startswith("```"):
                result = result.split("\n", 1)[1].rsplit("```", 1)[0]
            queries = json.loads(result)
            if isinstance(queries, list) and len(queries) > 0:
                return [q for q in queries if isinstance(q, str)][:5]
        except Exception:
            pass

        # Fallback: generate basic queries from topic and gaps
        fallback = [topic]
        for g in gaps[:4]:
            if isinstance(g, str):
                fallback.append(f"{topic} {g}")
            elif isinstance(g, dict):
                fallback.append(f"{topic} {g.get('description', '')}")
        return fallback[:5]

    async def _score_papers(self, papers: List[Dict], topic: str, gaps: List, themes: List) -> List[Dict]:
        """Use LLM to score paper relevance in batches."""
        gaps_text = "\n".join([f"- {g}" if isinstance(g, str) else f"- {g.get('description', g)}" for g in gaps[:10]])
        themes_text = "\n".join([f"- {t}" if isinstance(t, str) else f"- {t.get('name', t)}" for t in themes[:10]])

        # Process in batches of 10
        scored = []
        for i in range(0, len(papers), 10):
            batch = papers[i:i + 10]
            papers_text = ""
            for idx, p in enumerate(batch):
                abstract = (p.get("abstract") or p.get("tldr") or "No abstract")[:200]
                papers_text += f"\n{idx + 1}. Title: {p.get('title', 'Unknown')}\n   Abstract: {abstract}\n"

            system_prompt = "You are a research relevance scorer. Score papers on how well they fill research gaps."
            user_prompt = f"""Research Topic: {topic}

Research Gaps:
{gaps_text}

Key Themes:
{themes_text}

Papers to score:
{papers_text}

For each paper, provide a relevance score (0-10) and a brief reason why it's recommended.
Return ONLY a JSON array with objects having "index" (1-based), "score" (0-10), and "reason" (short string).
Example: [{{"index": 1, "score": 8, "reason": "Directly addresses gap in X methodology"}}]"""

            try:
                result = await self._call_llm(system_prompt, user_prompt)
                result = result.strip()
                if result.startswith("```"):
                    result = result.split("\n", 1)[1].rsplit("```", 1)[0]
                scores = json.loads(result)

                if isinstance(scores, list):
                    for score_item in scores:
                        idx = score_item.get("index", 0) - 1
                        if 0 <= idx < len(batch):
                            paper = batch[idx].copy()
                            paper["relevance_score"] = min(10, max(0, score_item.get("score", 5)))
                            paper["recommendation_reason"] = score_item.get("reason", "Relevant to your research")
                            scored.append(paper)
            except Exception:
                # If scoring fails, add papers with default score
                for p in batch:
                    paper = p.copy()
                    paper["relevance_score"] = 5
                    paper["recommendation_reason"] = "Potentially relevant to your research topic"
                    scored.append(paper)

            await asyncio.sleep(2)  # Rate limit between LLM calls

        return scored

    async def get_trending_in_field(self, topic: str) -> List[Dict]:
        """Get trending/high-impact recent papers in a field."""
        from datetime import datetime

        current_year = datetime.now().year
        all_papers = []

        # Try Semantic Scholar first
        try:
            s2_papers = await self.s2.search(
                query=topic,
                limit=30,
                year_range=(current_year - 2, current_year),
            )
            all_papers.extend(s2_papers)
        except Exception:
            pass

        # Always also search arXiv as backup/supplement
        try:
            arxiv_papers = await self.arxiv.search(
                query=topic,
                max_results=20,
            )
            all_papers.extend(arxiv_papers)
        except Exception:
            pass

        # Deduplicate by title
        seen = set()
        unique = []
        for p in all_papers:
            key = p.get("title", "").lower().strip()[:80]
            if key and key not in seen:
                seen.add(key)
                unique.append(p)

        # Sort by citation count
        unique.sort(key=lambda x: x.get("citation_count", 0), reverse=True)

        # Return top 10
        return unique[:10]
