import openai
import asyncio
import json
import re
from typing import List, Dict, Any
from app.core.config import settings


class PlagiarismService:
    """Service for checking content originality using Groq LLM."""

    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url=settings.GROQ_BASE_URL,
        )
        self.model = settings.GROQ_MODEL

    async def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        """Call LLM with retry logic."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.1,
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

    def _split_sentences(self, content: str) -> List[str]:
        """Split content into sentences."""
        sentences = re.split(r'(?<=[.!?])\s+', content.strip())
        return [s.strip() for s in sentences if len(s.strip()) > 10]

    async def check_similarity(self, content: str, source_papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Check content similarity against source papers."""
        sentences = self._split_sentences(content)
        if not sentences:
            return {
                "originality_score": 100.0,
                "flagged_sentences": [],
                "total_sentences": 0,
                "clean_sentences": 0,
                "suggestions": ["No content to analyze."]
            }

        # Build source context
        sources_text = ""
        for i, paper in enumerate(source_papers[:15], 1):
            title = paper.get("title", "Unknown")
            abstract = paper.get("abstract", paper.get("summary", ""))[:500]
            sources_text += f"\n[{i}] Title: {title}\nAbstract: {abstract}\n"

        # Batch sentences (process in chunks to avoid token limits)
        batch_size = 10
        all_flagged = []

        for i in range(0, len(sentences), batch_size):
            batch = sentences[i:i + batch_size]
            numbered = "\n".join(f"{j+1}. {s}" for j, s in enumerate(batch))

            system_prompt = """You are a plagiarism detection expert. Analyze each sentence and determine if it is too similar to any of the provided source papers (paraphrasing without citation, near-verbatim copying, or overly derivative phrasing).

For each flagged sentence, provide:
- sentence_number: the number of the sentence
- similar_to: which paper title it resembles
- similarity_reason: brief explanation
- severity: "high" (near-verbatim), "medium" (close paraphrase), or "low" (derivative phrasing)

Respond ONLY with valid JSON:
{"flagged": [{"sentence_number": 1, "similar_to": "Paper Title", "similarity_reason": "reason", "severity": "high|medium|low"}]}

If no sentences are flagged, respond: {"flagged": []}"""

            user_prompt = f"""Source Papers:
{sources_text}

Sentences to check:
{numbered}"""

            try:
                result = await self._call_llm(system_prompt, user_prompt)
                # Parse JSON from response
                json_match = re.search(r'\{[\s\S]*\}', result)
                if json_match:
                    parsed = json.loads(json_match.group())
                    for flag in parsed.get("flagged", []):
                        idx = flag.get("sentence_number", 1) - 1
                        if 0 <= idx < len(batch):
                            all_flagged.append({
                                "sentence": batch[idx],
                                "similar_to": flag.get("similar_to", "Unknown"),
                                "similarity_reason": flag.get("similarity_reason", ""),
                                "severity": flag.get("severity", "low"),
                            })
            except (json.JSONDecodeError, Exception):
                continue

            # Small delay between batches to avoid rate limits
            if i + batch_size < len(sentences):
                await asyncio.sleep(1)

        total = len(sentences)
        flagged_count = len(all_flagged)
        clean = total - flagged_count
        originality = round((clean / total) * 100, 1) if total > 0 else 100.0

        # Generate suggestions
        suggestions = await self._generate_suggestions(all_flagged, originality)

        return {
            "originality_score": originality,
            "flagged_sentences": all_flagged,
            "total_sentences": total,
            "clean_sentences": clean,
            "suggestions": suggestions,
        }

    async def check_section(self, content: str, section_type: str = "general") -> Dict[str, Any]:
        """Quick check for plagiarism patterns without source papers."""
        sentences = self._split_sentences(content)
        if not sentences:
            return {
                "originality_score": 100.0,
                "flagged_sentences": [],
                "total_sentences": 0,
                "clean_sentences": 0,
                "suggestions": ["No content to analyze."]
            }

        numbered = "\n".join(f"{j+1}. {s}" for j, s in enumerate(sentences[:30]))

        system_prompt = f"""You are a plagiarism and originality expert analyzing a "{section_type}" section of an academic paper.

Identify sentences that:
1. Sound like direct paraphrasing from common sources without proper citation
2. Use overly generic academic phrases that suggest copy-paste
3. Have inconsistent writing style suggesting they were taken from elsewhere
4. Contain claims or statistics without attribution

For each flagged sentence, provide:
- sentence_number: the number
- similar_to: what it likely resembles (e.g., "common textbook definition", "Wikipedia-style phrasing")
- similarity_reason: brief explanation
- severity: "high" (likely copied), "medium" (needs citation), or "low" (could be improved)

Respond ONLY with valid JSON:
{{"flagged": [{{"sentence_number": 1, "similar_to": "source", "similarity_reason": "reason", "severity": "high|medium|low"}}]}}

If all sentences appear original, respond: {{"flagged": []}}
Be strict but fair. Academic writing naturally shares some phrasing - only flag genuinely problematic sentences."""

        user_prompt = f"Sentences to analyze:\n{numbered}"

        all_flagged = []
        try:
            result = await self._call_llm(system_prompt, user_prompt)
            json_match = re.search(r'\{[\s\S]*\}', result)
            if json_match:
                parsed = json.loads(json_match.group())
                for flag in parsed.get("flagged", []):
                    idx = flag.get("sentence_number", 1) - 1
                    if 0 <= idx < len(sentences):
                        all_flagged.append({
                            "sentence": sentences[idx],
                            "similar_to": flag.get("similar_to", "Unknown source"),
                            "similarity_reason": flag.get("similarity_reason", ""),
                            "severity": flag.get("severity", "low"),
                        })
        except (json.JSONDecodeError, Exception):
            pass

        total = len(sentences[:30])
        flagged_count = len(all_flagged)
        clean = total - flagged_count
        originality = round((clean / total) * 100, 1) if total > 0 else 100.0

        suggestions = await self._generate_suggestions(all_flagged, originality)

        return {
            "originality_score": originality,
            "flagged_sentences": all_flagged,
            "total_sentences": total,
            "clean_sentences": clean,
            "suggestions": suggestions,
        }

    async def _generate_suggestions(self, flagged: List[Dict], originality: float) -> List[str]:
        """Generate improvement suggestions based on flagged content."""
        if not flagged:
            return ["Your content appears original. Good job!"]

        suggestions = []
        high_count = sum(1 for f in flagged if f["severity"] == "high")
        medium_count = sum(1 for f in flagged if f["severity"] == "medium")

        if high_count > 0:
            suggestions.append(f"⚠️ {high_count} sentence(s) need immediate rewriting - they appear too similar to source material.")
        if medium_count > 0:
            suggestions.append(f"📝 {medium_count} sentence(s) should be rephrased or properly cited.")
        if originality < 60:
            suggestions.append("🔴 Overall originality is low. Consider rewriting major portions in your own words.")
        elif originality < 85:
            suggestions.append("🟡 Originality could be improved. Focus on expressing ideas in your own voice.")
        
        suggestions.append("💡 Tip: Use your own examples and connect ideas to your specific research context.")
        return suggestions


# Singleton instance
plagiarism_service = PlagiarismService()
