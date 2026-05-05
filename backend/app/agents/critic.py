from typing import Any, Dict, List
from app.agents.base import BaseAgent
import json


class CriticAgent(BaseAgent):
    """Agent that reviews generated content for quality, accuracy, and coherence."""

    def __init__(self):
        super().__init__(name="Critic")

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Review generated academic content.
        
        Input: {content, citations, section_type}
        Output: {score, issues, suggestions, pass}
        """
        content = input_data["content"]
        citations = input_data.get("citations", [])
        section_type = input_data.get("section_type", "literature_review")

        # Single comprehensive review call (save API calls)
        review = await self._comprehensive_review(content, section_type, citations)

        return review

    async def _comprehensive_review(self, content: str, section_type: str, citations: list) -> Dict:
        """Do a comprehensive review in one LLM call."""
        prompt = f"""Review this {section_type} for academic quality. 

Text (first 2000 chars):
{content[:2000]}

Number of citations used: {len(citations)}

Rate each dimension (1-10):
1. clarity - Is it clear and well-written?
2. flow - Does it flow logically?
3. depth - Is the analysis deep enough?
4. synthesis - Does it synthesize rather than just summarize?
5. citations - Are claims properly supported?
6. coherence - Is the argument coherent?

Also provide:
- overall_score (average, 1-10)
- pass (true if score >= 7)
- suggestions (list of improvement suggestions)
- strengths (list of what's good)

Return as JSON:
{{"clarity": N, "flow": N, "depth": N, "synthesis": N, "citations": N, "coherence": N, "overall_score": N, "pass": true/false, "suggestions": ["..."], "strengths": ["..."]}}

Return ONLY valid JSON."""

        result = await self._call_llm(
            system_prompt="You are a strict academic reviewer and journal editor. Return only valid JSON.",
            user_prompt=prompt,
        )
        
        try:
            result = result.strip()
            if result.startswith("```"):
                result = result.split("\n", 1)[1].rsplit("```", 1)[0]
            review = json.loads(result)
            
            # Ensure required fields
            review.setdefault("overall_score", 5)
            review.setdefault("pass", review.get("overall_score", 5) >= 7)
            review.setdefault("suggestions", [])
            review.setdefault("strengths", [])
            
            return {
                "score": review["overall_score"],
                "pass": review["pass"],
                "dimensions": {
                    "clarity": review.get("clarity", 5),
                    "flow": review.get("flow", 5),
                    "depth": review.get("depth", 5),
                    "synthesis": review.get("synthesis", 5),
                    "citations": review.get("citations", 5),
                    "coherence": review.get("coherence", 5),
                },
                "suggestions": review["suggestions"],
                "strengths": review["strengths"],
            }
        except json.JSONDecodeError:
            return {
                "score": 5,
                "pass": False,
                "dimensions": {},
                "suggestions": ["Review failed - please regenerate"],
                "strengths": [],
            }
