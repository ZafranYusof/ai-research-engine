from typing import Any, Dict, List
from app.agents.base import BaseAgent
import json


class AnalyzerAgent(BaseAgent):
    """Agent that extracts key findings, methodology, and gaps from papers."""

    def __init__(self):
        super().__init__(name="Analyzer", model="gpt-4-turbo-preview")

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a set of papers to extract structured insights.
        
        Input: {papers: [...], focus_areas: [...]}
        Output: {analyses: [...], common_themes: [...], gaps: [...], contradictions: [...]}
        """
        papers = input_data["papers"]
        focus_areas = input_data.get("focus_areas", [])

        analyses = []
        for paper in papers:
            analysis = await self._analyze_paper(paper, focus_areas)
            analyses.append(analysis)

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

    async def _analyze_paper(self, paper: Dict, focus_areas: List[str]) -> Dict:
        """Extract structured analysis from a single paper."""
        prompt = f"""Analyze this academic paper and extract:
1. Key findings (bullet points)
2. Methodology used
3. Limitations acknowledged
4. Future work suggested
5. How it relates to: {', '.join(focus_areas) if focus_areas else 'the general field'}

Paper:
Title: {paper.get('title')}
Abstract: {paper.get('abstract')}
Year: {paper.get('year')}

Return as JSON with keys: key_findings, methodology, limitations, future_work, relevance_notes"""

        result = await self._call_llm(
            system_prompt="You are a senior researcher skilled at critical paper analysis.",
            user_prompt=prompt,
        )
        analysis = json.loads(result)
        analysis["paper_id"] = paper.get("id")
        analysis["paper_title"] = paper.get("title")
        return analysis

    async def _find_themes(self, analyses: List[Dict]) -> List[Dict]:
        """Identify common themes across all analyzed papers."""
        summaries = [
            f"- {a['paper_title']}: {', '.join(a.get('key_findings', [])[:3])}"
            for a in analyses
        ]
        prompt = f"""Given these paper findings, identify 5-10 common themes/clusters:

{chr(10).join(summaries)}

Return as JSON array of objects: [{{"theme": "...", "description": "...", "paper_ids": [...]}}]"""

        result = await self._call_llm(
            system_prompt="You are a research synthesizer identifying patterns across studies.",
            user_prompt=prompt,
        )
        return json.loads(result)

    async def _identify_gaps(self, analyses: List[Dict]) -> List[str]:
        """Identify research gaps from the analyzed papers."""
        limitations = []
        future_work = []
        for a in analyses:
            limitations.extend(a.get("limitations", []))
            future_work.extend(a.get("future_work", []))

        prompt = f"""Based on these limitations and future work suggestions from multiple papers,
identify the top research gaps that haven't been addressed:

Limitations: {json.dumps(limitations[:30])}
Future work: {json.dumps(future_work[:30])}

Return as JSON array of strings describing each gap."""

        result = await self._call_llm(
            system_prompt="You identify unexplored research opportunities.",
            user_prompt=prompt,
        )
        return json.loads(result)

    async def _find_contradictions(self, analyses: List[Dict]) -> List[Dict]:
        """Find contradicting findings across papers."""
        findings = [
            {"paper": a["paper_title"], "findings": a.get("key_findings", [])}
            for a in analyses
        ]
        prompt = f"""Find any contradictions or disagreements between these papers' findings:

{json.dumps(findings[:20])}

Return as JSON array: [{{"finding_a": "...", "paper_a": "...", "finding_b": "...", "paper_b": "...", "nature": "..."}}]
Return empty array if no contradictions found."""

        result = await self._call_llm(
            system_prompt="You are a critical reviewer finding inconsistencies in literature.",
            user_prompt=prompt,
        )
        return json.loads(result)
