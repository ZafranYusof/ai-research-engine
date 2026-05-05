from typing import Any, Dict
from app.agents.base import BaseAgent
import json


class CriticAgent(BaseAgent):
    """Agent that reviews generated content for quality, accuracy, and coherence."""

    def __init__(self):
        super().__init__(name="Critic", model="gpt-4-turbo-preview")

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Review generated academic content.
        
        Input: {content, citations, section_type, papers}
        Output: {score, issues, suggestions, citation_check, revised_content}
        """
        content = input_data["content"]
        citations = input_data.get("citations", [])
        section_type = input_data.get("section_type", "literature_review")

        # Multi-dimensional review
        quality_review = await self._review_quality(content, section_type)
        citation_check = await self._verify_citations(content, citations)
        coherence_check = await self._check_coherence(content)

        # Calculate overall score
        score = self._calculate_score(quality_review, citation_check, coherence_check)

        # Generate revision suggestions
        suggestions = await self._suggest_revisions(
            content, quality_review, citation_check, coherence_check
        )

        return {
            "score": score,
            "quality_review": quality_review,
            "citation_check": citation_check,
            "coherence_check": coherence_check,
            "suggestions": suggestions,
            "pass": score >= 7.0,
        }

    async def _review_quality(self, content: str, section_type: str) -> Dict:
        """Review academic writing quality."""
        prompt = f"""Review this {section_type} for academic writing quality:

{content[:3000]}

Rate (1-10) and comment on:
1. Clarity of expression
2. Logical flow
3. Depth of analysis
4. Academic tone
5. Synthesis vs mere summarization

Return as JSON: {{"clarity": N, "flow": N, "depth": N, "tone": N, "synthesis": N, "comments": "..."}}"""

        result = await self._call_llm(
            system_prompt="You are a strict academic reviewer and journal editor.",
            user_prompt=prompt,
        )
        return json.loads(result)

    async def _verify_citations(self, content: str, citations: list) -> Dict:
        """Check citation usage and accuracy."""
        prompt = f"""Check the citations in this academic text:

Text: {content[:3000]}

Available citations: {json.dumps([c.get('title', '') for c in citations[:20]])}

Check for:
1. Claims without citations
2. Incorrect citation usage
3. Over-reliance on single sources
4. Missing key references

Return as JSON: {{"uncited_claims": [...], "issues": [...], "coverage_score": N, "diversity_score": N}}"""

        result = await self._call_llm(
            system_prompt="You verify academic citation accuracy and completeness.",
            user_prompt=prompt,
        )
        return json.loads(result)

    async def _check_coherence(self, content: str) -> Dict:
        """Check logical coherence and argument structure."""
        prompt = f"""Analyze the logical coherence of this academic text:

{content[:3000]}

Check:
1. Does each paragraph follow logically from the previous?
2. Are transitions smooth?
3. Is there a clear argument thread?
4. Any logical fallacies or unsupported leaps?

Return as JSON: {{"coherence_score": N, "weak_transitions": [...], "logical_issues": [...], "argument_strength": N}}"""

        result = await self._call_llm(
            system_prompt="You analyze logical structure in academic writing.",
            user_prompt=prompt,
        )
        return json.loads(result)

    def _calculate_score(self, quality: Dict, citations: Dict, coherence: Dict) -> float:
        """Calculate overall quality score (0-10)."""
        quality_avg = sum([
            quality.get("clarity", 5),
            quality.get("flow", 5),
            quality.get("depth", 5),
            quality.get("tone", 5),
            quality.get("synthesis", 5),
        ]) / 5

        citation_score = citations.get("coverage_score", 5)
        coherence_score = coherence.get("coherence_score", 5)

        # Weighted average
        return round(
            quality_avg * 0.4 + citation_score * 0.3 + coherence_score * 0.3, 1
        )

    async def _suggest_revisions(self, content, quality, citations, coherence) -> List:
        """Generate specific revision suggestions."""
        issues = []
        if quality.get("synthesis", 10) < 7:
            issues.append("Needs more synthesis between sources")
        if citations.get("coverage_score", 10) < 7:
            issues.append("Some claims lack citations")
        if coherence.get("coherence_score", 10) < 7:
            issues.append("Improve paragraph transitions")
        return issues
