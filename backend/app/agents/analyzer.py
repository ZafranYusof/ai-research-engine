from typing import Any, Dict, List
from app.agents.base import BaseAgent
import json


class AnalyzerAgent(BaseAgent):
    """Agent that extracts key findings, methodology, and gaps from papers."""

    def __init__(self):
        super().__init__(name="Analyzer")

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a set of papers to extract structured insights.
        
        Input: {papers: [...], focus_areas: [...]}
        Output: {analyses: [...], common_themes: [...], gaps: [...], contradictions: [...]}
        """
        papers = input_data["papers"]
        focus_areas = input_data.get("focus_areas", [])

        # Analyze papers in batches (respect Groq rate limits)
        analyses = []
        batch_size = 5  # Analyze 5 papers at once to save API calls
        
        for i in range(0, len(papers), batch_size):
            batch = papers[i:i + batch_size]
            batch_analysis = await self._analyze_batch(batch, focus_areas)
            analyses.extend(batch_analysis)

        # Cross-paper analysis
        themes = await self._find_themes(analyses)
        gaps = await self._identify_gaps(analyses)
        contradictions = await self._find_contradictions(analyses)

        return {
            "analyses": analyses,
            "common_themes": themes,
            "gaps": gaps,
            "contradictions": contradictions,
        }

    async def _analyze_batch(self, papers: List[Dict], focus_areas: List[str]) -> List[Dict]:
        """Analyze a batch of papers in one LLM call."""
        papers_text = ""
        for i, paper in enumerate(papers):
            papers_text += f"""
Paper {i+1}:
- Title: {paper.get('title', 'Unknown')}
- Abstract: {paper.get('abstract', 'N/A')[:500]}
- Year: {paper.get('year', 'N/A')}
- Citations: {paper.get('citation_count', 0)}
"""

        prompt = f"""Analyze these academic papers and extract structured insights for each:

{papers_text}

Focus areas: {', '.join(focus_areas) if focus_areas else 'general field'}

For EACH paper, provide:
1. key_findings (list of strings)
2. methodology (string)
3. limitations (list of strings)
4. future_work (list of strings)

Return as JSON array. Example:
[{{"paper_title": "...", "key_findings": ["..."], "methodology": "...", "limitations": ["..."], "future_work": ["..."]}}]

Return ONLY valid JSON array, no other text."""

        result = await self._call_llm(
            system_prompt="You are a senior researcher skilled at critical paper analysis. Return only valid JSON.",
            user_prompt=prompt,
            max_tokens=4096,
        )
        
        try:
            result = result.strip()
            if result.startswith("```"):
                result = result.split("\n", 1)[1].rsplit("```", 1)[0]
            parsed = json.loads(result)
            
            # Add paper IDs
            for i, analysis in enumerate(parsed):
                if i < len(papers):
                    analysis["paper_id"] = papers[i].get("id", "")
                    analysis["paper_title"] = papers[i].get("title", "")
            return parsed
        except (json.JSONDecodeError, IndexError):
            # Fallback: return basic analysis
            return [{"paper_id": p.get("id"), "paper_title": p.get("title"), 
                     "key_findings": [], "methodology": "Unknown", 
                     "limitations": [], "future_work": []} for p in papers]

    async def _find_themes(self, analyses: List[Dict]) -> List[Dict]:
        """Identify common themes across all analyzed papers."""
        if not analyses:
            return []
            
        summaries = [
            f"- {a.get('paper_title', 'Unknown')}: {', '.join(a.get('key_findings', [])[:2])}"
            for a in analyses[:20]  # Limit to avoid token overflow
        ]
        
        prompt = f"""Given these paper findings, identify 5-8 common themes/clusters:

{chr(10).join(summaries)}

Return as JSON array:
[{{"theme": "Theme Name", "description": "Brief description", "paper_count": N}}]

Return ONLY valid JSON array."""

        result = await self._call_llm(
            system_prompt="You are a research synthesizer identifying patterns across studies. Return only valid JSON.",
            user_prompt=prompt,
        )
        
        try:
            result = result.strip()
            if result.startswith("```"):
                result = result.split("\n", 1)[1].rsplit("```", 1)[0]
            return json.loads(result)
        except json.JSONDecodeError:
            return []

    async def _identify_gaps(self, analyses: List[Dict]) -> List[str]:
        """Identify research gaps from the analyzed papers."""
        if not analyses:
            return []
            
        limitations = []
        future_work = []
        for a in analyses[:15]:
            limitations.extend(a.get("limitations", [])[:2])
            future_work.extend(a.get("future_work", [])[:2])

        prompt = f"""Based on these limitations and future work suggestions from multiple papers,
identify the top 5-7 research gaps that haven't been addressed:

Limitations: {json.dumps(limitations[:20])}
Future work: {json.dumps(future_work[:20])}

Return as JSON array of strings:
["Gap 1 description", "Gap 2 description", ...]

Return ONLY valid JSON array."""

        result = await self._call_llm(
            system_prompt="You identify unexplored research opportunities. Return only valid JSON.",
            user_prompt=prompt,
        )
        
        try:
            result = result.strip()
            if result.startswith("```"):
                result = result.split("\n", 1)[1].rsplit("```", 1)[0]
            return json.loads(result)
        except json.JSONDecodeError:
            return []

    async def _find_contradictions(self, analyses: List[Dict]) -> List[Dict]:
        """Find contradicting findings across papers."""
        if len(analyses) < 2:
            return []
            
        findings = [
            {"paper": a.get("paper_title", ""), "findings": a.get("key_findings", [])[:3]}
            for a in analyses[:15]
        ]
        
        prompt = f"""Find any contradictions or disagreements between these papers' findings:

{json.dumps(findings)}

Return as JSON array:
[{{"finding_a": "...", "paper_a": "...", "finding_b": "...", "paper_b": "...", "nature": "description of contradiction"}}]

If no contradictions found, return empty array: []
Return ONLY valid JSON array."""

        result = await self._call_llm(
            system_prompt="You are a critical reviewer finding inconsistencies in literature. Return only valid JSON.",
            user_prompt=prompt,
        )
        
        try:
            result = result.strip()
            if result.startswith("```"):
                result = result.split("\n", 1)[1].rsplit("```", 1)[0]
            return json.loads(result)
        except json.JSONDecodeError:
            return []
