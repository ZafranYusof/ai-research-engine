from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import openai
import asyncio
from app.core.config import settings
from app.db.mongodb import mongodb

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    project_id: Optional[str] = None
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str]


async def _get_project_context(project_id: str) -> str:
    """Load project data from MongoDB and build context string."""
    project = await mongodb.projects.find_one({"id": project_id})
    if not project:
        return ""

    context_parts = []

    if project.get("topic"):
        context_parts.append(f"Research Topic: {project['topic']}")

    if project.get("themes"):
        themes = project["themes"]
        if isinstance(themes, list):
            context_parts.append(f"Key Themes: {', '.join(themes[:10])}")

    if project.get("gaps"):
        gaps = project["gaps"]
        if isinstance(gaps, list):
            context_parts.append(f"Research Gaps Identified: {', '.join(gaps[:5])}")

    if project.get("hypotheses"):
        hypotheses = project["hypotheses"]
        if isinstance(hypotheses, list):
            context_parts.append(f"Hypotheses: {', '.join(hypotheses[:5])}")

    if project.get("papers"):
        papers = project["papers"]
        if isinstance(papers, list):
            paper_titles = [p.get("title", "") for p in papers[:10] if p.get("title")]
            if paper_titles:
                context_parts.append(f"Papers Analyzed ({len(papers)} total): {'; '.join(paper_titles)}")

    if project.get("draft"):
        draft = project["draft"]
        if isinstance(draft, str) and len(draft) > 0:
            context_parts.append(f"Draft excerpt: {draft[:500]}")

    return "\n".join(context_parts)


@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    """Send a message to the AI research assistant."""
    try:
        # Build system prompt
        system_prompt = (
            "You are a research assistant helping with academic literature review and research synthesis. "
            "You help users understand their research findings, suggest methodologies, explain concepts, "
            "and provide guidance on academic writing. "
            "Answer concisely, cite papers when relevant, and suggest next steps. "
            "Keep responses focused and actionable."
        )

        # Add project context if available
        if request.project_id:
            project_context = await _get_project_context(request.project_id)
            if project_context:
                system_prompt += (
                    f"\n\nThe user is working on the following research project:\n{project_context}\n\n"
                    "Use this context to provide relevant, specific answers. "
                    "Reference their papers and findings when applicable."
                )

        # Build messages list
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history (last 20 messages max)
        for msg in request.history[-20:]:
            messages.append({"role": msg.role, "content": msg.content})

        # Add current message
        messages.append({"role": "user", "content": request.message})

        # Call Groq LLM
        client = openai.AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url=settings.GROQ_BASE_URL,
        )

        max_retries = 3
        response = None
        for attempt in range(max_retries):
            try:
                response = await client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=messages,
                    temperature=0.4,
                    max_tokens=2048,
                )
                break
            except openai.RateLimitError:
                wait_time = (attempt + 1) * 5
                if attempt == max_retries - 1:
                    raise HTTPException(status_code=429, detail="AI service is busy. Please try again in a moment.")
                await asyncio.sleep(wait_time)

        if not response:
            raise HTTPException(status_code=500, detail="Failed to get AI response")

        reply = response.choices[0].message.content

        # Generate follow-up suggestions
        suggestion_messages = [
            {"role": "system", "content": (
                "Based on the conversation, suggest exactly 3 short follow-up questions the user might want to ask. "
                "Return ONLY the 3 questions, one per line, no numbering, no bullets, no extra text."
            )},
            *messages[1:],  # Skip original system prompt
            {"role": "assistant", "content": reply},
        ]

        try:
            suggestion_response = await client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=suggestion_messages,
                temperature=0.6,
                max_tokens=256,
            )
            suggestions_text = suggestion_response.choices[0].message.content.strip()
            suggestions = [s.strip() for s in suggestions_text.split("\n") if s.strip()][:3]
        except Exception:
            suggestions = [
                "What are the key findings?",
                "How can I improve my methodology?",
                "What gaps remain in the literature?",
            ]

        return ChatResponse(reply=reply, suggestions=suggestions)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
