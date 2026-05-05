from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.agents import WriterAgent, CriticAgent

router = APIRouter()


class WriteRequest(BaseModel):
    section_type: str  # introduction, literature_review, methodology, discussion, conclusion
    project_id: Optional[str] = None
    narrative_threads: List[dict] = []
    papers: List[dict] = []
    style: str = "APA"
    max_words: int = 2000


class ReviseRequest(BaseModel):
    content: str
    feedback: str
    section_type: str
    max_iterations: int = 3


class ExportRequest(BaseModel):
    sections: List[dict]  # [{section_type, content, citations}]
    title: str
    authors: List[str] = []
    format: str = "markdown"  # markdown, latex, bibtex


@router.post("/generate")
async def generate_section(request: WriteRequest):
    """Generate an academic writing section with auto-review."""
    writer = WriterAgent()
    critic = CriticAgent()

    # Generate initial draft
    result = await writer.execute({
        "section_type": request.section_type,
        "narrative_threads": request.narrative_threads,
        "papers": request.papers,
        "style": request.style,
        "max_words": request.max_words,
    })

    # Auto-review
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


@router.post("/generate-iterative")
async def generate_iterative(request: WriteRequest):
    """Generate with iterative critic feedback loop (auto-revise until pass)."""
    writer = WriterAgent()
    critic = CriticAgent()
    max_iterations = 3

    # Generate initial draft
    current = await writer.execute({
        "section_type": request.section_type,
        "narrative_threads": request.narrative_threads,
        "papers": request.papers,
        "style": request.style,
        "max_words": request.max_words,
    })

    iterations = [{
        "version": 1,
        "word_count": current["word_count"],
        "content_preview": current["content"][:200],
    }]

    # Iterative improvement loop
    for i in range(max_iterations):
        review = await critic.execute({
            "content": current["content"],
            "citations": current["citations"],
            "section_type": request.section_type,
        })

        iterations[-1]["score"] = review["score"]
        iterations[-1]["suggestions"] = review.get("suggestions", [])

        # If passes quality threshold, stop
        if review["pass"]:
            break

        # Revise based on feedback
        if review.get("suggestions"):
            feedback = ". ".join(review["suggestions"])
            revised = await writer._call_llm(
                system_prompt="You are an academic editor. Revise the text to address the feedback while maintaining citations and academic tone. Return ONLY the revised text.",
                user_prompt=f"""Revise this {request.section_type} based on feedback:

Text:
{current['content']}

Feedback to address:
{feedback}

Revised version:""",
            )
            current["content"] = revised
            current["word_count"] = len(revised.split())

            iterations.append({
                "version": i + 2,
                "word_count": current["word_count"],
                "content_preview": current["content"][:200],
            })

    # Final review
    final_review = await critic.execute({
        "content": current["content"],
        "citations": current["citations"],
        "section_type": request.section_type,
    })

    return {
        "content": current["content"],
        "citations": current["citations"],
        "word_count": current["word_count"],
        "final_review": final_review,
        "iterations": iterations,
        "total_iterations": len(iterations),
    }


@router.post("/revise")
async def revise_section(request: ReviseRequest):
    """Revise a section based on user feedback."""
    writer = WriterAgent()
    critic = CriticAgent()

    revised = await writer._call_llm(
        system_prompt="You are an academic editor. Revise the text based on feedback while maintaining citations and academic tone. Return ONLY the revised text.",
        user_prompt=f"""Revise this {request.section_type} based on the feedback:

Current text:
{request.content}

Feedback:
{request.feedback}

Provide the revised version:""",
    )

    # Re-review
    review = await critic.execute({
        "content": revised,
        "citations": [],
        "section_type": request.section_type,
    })

    return {
        "revised_content": revised,
        "word_count": len(revised.split()),
        "review": review,
    }


@router.post("/export")
async def export_document(request: ExportRequest):
    """Export sections as formatted document."""
    if request.format == "latex":
        output = _export_latex(request)
    elif request.format == "bibtex":
        output = _export_bibtex(request)
    else:
        output = _export_markdown(request)

    return {
        "format": request.format,
        "content": output,
        "sections_count": len(request.sections),
    }


def _export_markdown(request: ExportRequest) -> str:
    """Export as Markdown."""
    lines = [f"# {request.title}\n"]

    if request.authors:
        lines.append(f"**Authors:** {', '.join(request.authors)}\n")
    lines.append("---\n")

    for section in request.sections:
        section_title = section.get("section_type", "").replace("_", " ").title()
        lines.append(f"## {section_title}\n")
        lines.append(section.get("content", "") + "\n")

    # References
    all_citations = []
    for section in request.sections:
        all_citations.extend(section.get("citations", []))

    if all_citations:
        lines.append("## References\n")
        seen = set()
        for cite in all_citations:
            key = cite.get("title", "")
            if key not in seen:
                seen.add(key)
                authors = ", ".join(cite.get("authors", [])[:3])
                if len(cite.get("authors", [])) > 3:
                    authors += " et al."
                year = cite.get("year", "n.d.")
                title = cite.get("title", "Untitled")
                lines.append(f"- {authors} ({year}). *{title}*.\n")

    return "\n".join(lines)


def _export_latex(request: ExportRequest) -> str:
    """Export as LaTeX."""
    lines = [
        r"\documentclass[12pt]{article}",
        r"\usepackage[utf8]{inputenc}",
        r"\usepackage{natbib}",
        r"\usepackage{hyperref}",
        r"\usepackage[margin=1in]{geometry}",
        "",
        f"\\title{{{request.title}}}",
        f"\\author{{{' \\and '.join(request.authors)}}}" if request.authors else "",
        r"\date{\today}",
        "",
        r"\begin{document}",
        r"\maketitle",
        "",
    ]

    for section in request.sections:
        section_title = section.get("section_type", "").replace("_", " ").title()
        lines.append(f"\\section{{{section_title}}}")
        lines.append(section.get("content", ""))
        lines.append("")

    lines.extend([
        r"\bibliographystyle{apalike}",
        r"\bibliography{references}",
        r"\end{document}",
    ])

    return "\n".join(lines)


def _export_bibtex(request: ExportRequest) -> str:
    """Export citations as BibTeX."""
    entries = []
    seen = set()

    for section in request.sections:
        for cite in section.get("citations", []):
            title = cite.get("title", "")
            if title in seen:
                continue
            seen.add(title)

            authors = cite.get("authors", [])
            year = cite.get("year", "")
            first_author = authors[0].split()[-1] if authors else "Unknown"
            key = f"{first_author}{year}"

            entry = f"""@article{{{key},
  title = {{{title}}},
  author = {{{' and '.join(authors)}}},
  year = {{{year}}},
  doi = {{{cite.get('doi', '')}}}
}}"""
            entries.append(entry)

    return "\n\n".join(entries)
