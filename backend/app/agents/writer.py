from typing import Any, Dict, List
from app.agents.base import BaseAgent
import json


class WriterAgent(BaseAgent):
    """Agent that generates academic writing with proper citations."""

    def __init__(self):
        super().__init__(name="Writer", model="gpt-4-turbo-preview")

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a literature review section with citations.
        
        Input: {section_type, narrative_threads, papers, style, max_words}
        Output: {content, citations, word_count}
        """
        section_type = input_data["section_type"]
        threads = input_data["narrative_threads"]
        papers = input_data["papers"]
        style = input_data.get("style", "APA")
        max_words = input_data.get("max_words", 2000)

        # Build citation map
        citation_map = self._build_citation_map(papers)

        # Generate section
        content = await self._write_section(
            section_type, threads, citation_map, style, max_words
        )

        # Extract used citations
        used_citations = self._extract_citations(content, citation_map)

        return {
            "content": content,
            "citations": used_citations,
            "word_count": len(content.split()),
            "section_type": section_type,
        }

    async def _write_section(
        self,
        section_type: str,
        threads: List[Dict],
        citation_map: Dict,
        style: str,
        max_words: int,
    ) -> str:
        """Write an academic section with inline citations."""
        available_refs = "\n".join(
            [f"[{k}] {v['title']} ({v['year']})" for k, v in citation_map.items()]
        )

        prompt = f"""Write a {section_type} section for an academic paper.
        
Use these narrative threads as your guide:
{json.dumps(threads, indent=2)}

Available references (use inline citations like [AuthorYear]):
{available_refs}

Requirements:
- Style: {style}
- Max words: {max_words}
- Use academic tone
- Every claim must have a citation
- Synthesize, don't just summarize each paper
- Show connections between studies
- Identify agreements and disagreements
- End with transition to next section

Write the section now:"""

        result = await self._call_llm(
            system_prompt="""You are an expert academic writer. You write clear, 
            well-structured literature reviews that synthesize findings rather than 
            listing papers sequentially. Every factual claim is cited.""",
            user_prompt=prompt,
            max_tokens=max_words * 2,
            temperature=0.4,
        )
        return result

    def _build_citation_map(self, papers: List[Dict]) -> Dict:
        """Create a citation key map from papers."""
        citation_map = {}
        for paper in papers:
            authors = paper.get("authors", [])
            year = paper.get("year", "n.d.")
            first_author = authors[0].split()[-1] if authors else "Unknown"
            key = f"{first_author}{year}"

            # Handle duplicates
            if key in citation_map:
                key = f"{key}a"

            citation_map[key] = {
                "title": paper.get("title"),
                "authors": authors,
                "year": year,
                "doi": paper.get("doi"),
                "id": paper.get("id"),
            }
        return citation_map

    def _extract_citations(self, content: str, citation_map: Dict) -> List[Dict]:
        """Extract which citations were actually used in the text."""
        used = []
        for key, ref in citation_map.items():
            if key in content:
                used.append(ref)
        return used
