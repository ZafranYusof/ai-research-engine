from typing import Any, Dict, List
from app.agents.base import BaseAgent
import json


class SynthesizerAgent(BaseAgent):
    """Agent that connects findings across papers and builds narrative."""

    def __init__(self):
        super().__init__(name="Synthesizer")

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
        themes_text = json.dumps(themes[:8]) if themes else "[]"
        
        prompt = f"""Given this research topic and identified themes, create 3-5 narrative threads
that tell the story of how the field has evolved.

Topic: {topic}
Themes: {themes_text}

For each thread, show the progression of ideas and open questions.

Return as JSON array:
[{{"title": "Thread Title", "narrative": "2-3 sentence narrative", "key_papers": [], "open_questions": ["question 1"]}}]

Return ONLY valid JSON array."""

        result = await self._call_llm(
            system_prompt="You are a master storyteller of scientific progress. Return only valid JSON.",
            user_prompt=prompt,
            max_tokens=3000,
        )
        
        try:
            result = result.strip()
            if result.startswith("```"):
                result = result.split("\n", 1)[1].rsplit("```", 1)[0]
            return json.loads(result)
        except json.JSONDecodeError:
            return []

    async def _generate_hypotheses(
        self, gaps: List[str], analyses: List[Dict], topic: str
    ) -> List[Dict]:
        """Generate research hypotheses based on identified gaps."""
        key_findings = []
        for a in analyses[:10]:
            key_findings.extend(a.get("key_findings", [])[:2])
        
        prompt = f"""Based on these research gaps and existing findings, generate 3-5 novel 
research hypotheses that could advance the field.

Topic: {topic}
Gaps: {json.dumps(gaps[:7])}
Key findings: {json.dumps(key_findings[:15])}

For each hypothesis, rate novelty and feasibility (1-5).

Return as JSON array:
[{{"hypothesis": "...", "reasoning": "...", "methodology": "suggested approach", "novelty": 4, "feasibility": 3}}]

Return ONLY valid JSON array."""

        result = await self._call_llm(
            system_prompt="You are an innovative researcher generating testable hypotheses. Return only valid JSON.",
            user_prompt=prompt,
        )
        
        try:
            result = result.strip()
            if result.startswith("```"):
                result = result.split("\n", 1)[1].rsplit("```", 1)[0]
            return json.loads(result)
        except json.JSONDecodeError:
            return []

    async def _build_framework(
        self, themes: List[Dict], threads: List[Dict], topic: str
    ) -> Dict:
        """Build a conceptual framework organizing the research landscape."""
        prompt = f"""Create a conceptual framework that organizes the research landscape for:

Topic: {topic}
Themes: {json.dumps([t.get('theme', '') for t in themes[:8]])}
Threads: {json.dumps([t.get('title', '') for t in threads[:5]])}

Return as JSON object:
{{"name": "Framework Name", "layers": ["layer1", "layer2"], "core_concepts": ["concept1", "concept2"], "relationships": ["A relates to B"]}}

Return ONLY valid JSON object."""

        result = await self._call_llm(
            system_prompt="You build conceptual frameworks that organize complex research fields. Return only valid JSON.",
            user_prompt=prompt,
        )
        
        try:
            result = result.strip()
            if result.startswith("```"):
                result = result.split("\n", 1)[1].rsplit("```", 1)[0]
            return json.loads(result)
        except json.JSONDecodeError:
            return {"name": topic, "layers": [], "core_concepts": [], "relationships": []}
