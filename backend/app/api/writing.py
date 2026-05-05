from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.agents import WriterAgent, CriticAgent

router = APIRouter()


class WriteRequest(BaseModel):
    section_type: str  # introduction, literature_review, methodology, discussion
    project_id: str
    narrative_threads: List[dict] = []
    papers: List[dict] = []
    style: str = "APA"
    max_words: int = 2000


class ReviseRequest(BaseModel):
    content: str
    feedback: str
    section_type: str


@router.post("/generate")
async def generate_section(request: WriteRequest):
    """Generate an academic writing section."""
    writer = WriterAgent()
    result = await writer.execute({
        "section_type": request.section_type,
        "narrative_threads": request.narrative_threads,
        "papers": request.papers,
        "style": request.style,
        "max_words": request.max_words,
    })

    # Auto-review with critic
    critic = CriticAgent()
    review = await critic.execute({
        "content": result["content"],
        "citations": result["citations"],
        "section_type": request.section_type,
    })

    return {
        "content": result["content"],
        "citations": result["citations"],
        "word_count": result["word_count"],
        "review": review,
    }


@router.post("/revise")
async def revise_section(request: ReviseRequest):
    """Revise a section based on feedback."""
    writer = WriterAgent()

    result = await writer._call_llm(
        system_prompt="You are an academic editor. Revise the text based on feedback while maintaining citations.",
        user_prompt=f"""Revise this {request.section_type} based on the feedback:

Current text:
{request.content}

Feedback:
{request.feedback}

Provide the revised version:""",
    )

    return {"revised_content": result}
