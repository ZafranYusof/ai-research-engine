from typing import Any, Dict, List
from app.agents.base import BaseAgent
import json


class SynthesizerAgent(BaseAgent):
    """Agent that connects findings across papers and builds narrative."""

    def __init__(self):
        super().__init__(name="Synthesizer", model="gpt-4-turbo-preview")

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesize analyses into coherent narrative threads.
        
        Input: {analyses, themes, gaps, topic}
        Output: {narrative_threads: [...], hypothesis_suggestions: [...], framework: {...}}
        """
        analyses = input_data["analyses"]
        themes = input_data["themes"]
        gaps = input_data["gaps"]
        topic = input_data["topic"]

        # Build narrative threads
        threads = await self._build_narrative_threads(analyses, themes, topic)

        # Generate hypotheses from gaps
        hypotheses = await self._generate_hypotheses(gaps, analyses, topic)

        # Create conceptual framework
        framework = await self._build_framework(themes, threads, topic)

        return {
            "narrative_threads": threads,
            "hypothesis_suggestions": hypotheses,
            "conceptual_framework": framework,
        }

    async def _build_narrative_threads(
        self, analyses: List[Dict], themes: List[Dict], topic: str
    ) -> List[Dict]:
        """Build coherent narrative threads from themes and analyses."""
        prompt = f"""Given this research topic and identified themes, create narrative threads
that tell the story of how the field has evolved.

Topic: {topic}
Themes: {json.dumps(themes)}

For each thread, show:
- The progression of ideas
- Key turning points
- Current state of understanding
- Open questions

Return as JSON array: [{{"title": "...", "narrative": "...", "key_papers": [...], "open_questions": [...]}}]"""

        result = await self._call_llm(
            system_prompt="You are a master storyteller of scientific progress.",
            user_prompt=prompt,
            max_tokens=6000,
        )
        return json.loads(result)

    async def _generate_hypotheses(
        self, gaps: List[str], analyses: List[Dict], topic: str
    ) -> List[Dict]:
        """Generate research hypotheses based on identified gaps."""
        prompt = f"""Based on these research gaps and existing findings, generate novel 
research hypotheses that could advance the field.

Topic: {topic}
Gaps: {json.dumps(gaps)}
Key findings from literature: {json.dumps([a.get('key_findings', [])[:2] for a in analyses[:10]])}

For each hypothesis:
- State it clearly
- Explain the reasoning
- Suggest methodology to test it
- Rate novelty (1-5) and feasibility (1-5)

Return as JSON array: [{{"hypothesis": "...", "reasoning": "...", "methodology": "...", "novelty": N, "feasibility": N}}]"""

        result = await self._call_llm(
            system_prompt="You are an innovative researcher generating testable hypotheses.",
            user_prompt=prompt,
        )
        return json.loads(result)

    async def _build_framework(
        self, themes: List[Dict], threads: List[Dict], topic: str
    ) -> Dict:
        """Build a conceptual framework organizing the research landscape."""
        prompt = f"""Create a conceptual framework that organizes the research landscape for:

Topic: {topic}
Themes: {json.dumps([t['theme'] for t in themes])}
Narrative threads: {json.dumps([t['title'] for t in threads])}

The framework should show:
- Core concepts and their relationships
- Layers/dimensions of the problem
- How different approaches relate

Return as JSON: {{"name": "...", "layers": [...], "relationships": [...], "core_concepts": [...]}}"""

        result = await self._call_llm(
            system_prompt="You build conceptual frameworks that organize complex research fields.",
            user_prompt=prompt,
        )
        return json.loads(result)
