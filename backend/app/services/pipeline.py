"""
Research Pipeline Orchestrator
Coordinates all agents in sequence with proper error handling and progress tracking.
"""
from typing import Dict, Any, Callable, Optional
from app.agents import RetrieverAgent, AnalyzerAgent, SynthesizerAgent, WriterAgent, CriticAgent
from app.services.knowledge_graph import get_kg_service
import asyncio
import time


class ResearchPipeline:
    """Orchestrates the multi-agent research pipeline."""

    def __init__(self, on_progress: Optional[Callable] = None):
        self.retriever = RetrieverAgent()
        self.analyzer = AnalyzerAgent()
        self.synthesizer = SynthesizerAgent()
        self.writer = WriterAgent()
        self.critic = CriticAgent()
        self.kg = get_kg_service()
        self.on_progress = on_progress or (lambda *args: None)

    async def run(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run the full research pipeline.
        
        Config: {topic, max_papers, year_range, focus_areas}
        Returns: Full research results
        """
        results = {
            "config": config,
            "started_at": time.time(),
            "steps": {},
        }

        try:
            # Step 1: Retrieve papers
            self.on_progress("retrieving", 0.1, "Searching for papers...")
            retrieval = await self.retriever.execute({
                "topic": config["topic"],
                "max_papers": config.get("max_papers", 50),
                "year_range": config.get("year_range", (2019, 2026)),
            })
            results["steps"]["retrieval"] = {
                "papers_found": retrieval["total_found"],
                "after_dedup": retrieval["after_dedup"],
                "queries_used": retrieval["search_queries_used"],
            }
            results["papers"] = retrieval["papers"]
            self.on_progress("retrieving", 0.25, f"Found {retrieval['after_dedup']} unique papers")

            # Step 2: Analyze papers
            # Build knowledge graph from papers
            self.on_progress("building_graph", 0.28, "Building knowledge graph...")
            self.kg.add_papers_batch(retrieval["papers"])

            # Step 2: Analyze papers
            self.on_progress("analyzing", 0.3, "Analyzing papers...")
            analysis = await self.analyzer.execute({
                "papers": retrieval["papers"][:30],  # Limit for API costs
                "focus_areas": config.get("focus_areas", []),
            })
            results["steps"]["analysis"] = {
                "papers_analyzed": len(analysis["analyses"]),
                "themes_found": len(analysis["common_themes"]),
                "gaps_found": len(analysis["gaps"]),
            }
            results["themes"] = analysis["common_themes"]
            results["gaps"] = analysis["gaps"]
            results["contradictions"] = analysis["contradictions"]
            self.on_progress("analyzing", 0.55, f"Found {len(analysis['common_themes'])} themes")

            # Step 3: Synthesize
            self.on_progress("synthesizing", 0.6, "Synthesizing findings...")
            synthesis = await self.synthesizer.execute({
                "analyses": analysis["analyses"],
                "themes": analysis["common_themes"],
                "gaps": analysis["gaps"],
                "topic": config["topic"],
            })
            results["steps"]["synthesis"] = {
                "threads": len(synthesis["narrative_threads"]),
                "hypotheses": len(synthesis["hypothesis_suggestions"]),
            }
            # Add themes to knowledge graph
            self.kg.add_themes_batch(analysis["common_themes"], retrieval["papers"])

            results["narrative_threads"] = synthesis["narrative_threads"]
            results["hypotheses"] = synthesis["hypothesis_suggestions"]
            results["framework"] = synthesis["conceptual_framework"]
            self.on_progress("synthesizing", 0.8, "Synthesis complete")

            # Step 4: Generate initial writing (optional, can be triggered separately)
            self.on_progress("writing", 0.85, "Generating literature review draft...")
            writing = await self.writer.execute({
                "section_type": "literature_review",
                "narrative_threads": synthesis["narrative_threads"],
                "papers": retrieval["papers"][:20],
                "max_words": 1500,
            })
            results["draft"] = writing
            self.on_progress("writing", 0.9, "Draft generated")

            # Step 5: Critic review
            self.on_progress("reviewing", 0.92, "Reviewing quality...")
            review = await self.critic.execute({
                "content": writing["content"],
                "citations": writing["citations"],
                "section_type": "literature_review",
            })
            results["review"] = review
            self.on_progress("reviewing", 0.95, f"Score: {review['score']}/10")

            # Done
            results["completed_at"] = time.time()
            results["duration_seconds"] = results["completed_at"] - results["started_at"]
            results["status"] = "completed"
            self.on_progress("done", 1.0, "Research complete!")

        except Exception as e:
            results["status"] = "failed"
            results["error"] = str(e)
            self.on_progress("error", -1, f"Failed: {str(e)}")

        return results
